import { useState, useEffect, useCallback, useRef } from 'react';
import { SiteContent, DEFAULT_SITE_CONTENT } from '../config/defaultContent';
import { fetchSiteContent, getApiBaseUrl, initSharedConfig } from '../services/api';
import { APP_CONFIG } from '../config/constants';

export function useSiteContent() {
  // Always initialize from default master content (NEVER use localStorage as primary database)
  const [content, setContent] = useState<SiteContent>(DEFAULT_SITE_CONTENT);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const isMountedRef = useRef(true);

  // Clean up any legacy localStorage content to prevent stale local overrides
  useEffect(() => {
    try {
      localStorage.removeItem('thai_wsk_site_content');
    } catch (e) {
      // ignore
    }
  }, []);

  const loadContent = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      // 1. Ensure shared configuration is loaded from public/app-config.json
      await initSharedConfig();
      const baseUrl = getApiBaseUrl();
      if (!baseUrl) {
        setIsBackendConnected(false);
        setSyncError('ยังไม่ได้ระบุ Google Apps Script Web App URL');
        return;
      }

      // Always fetch latest from Central Database (Google Sheets via Apps Script)
      const result = await fetchSiteContent();
      if (!isMountedRef.current) return;

      if (result.success && result.content) {
        const fetched = result.content;
        const merged: SiteContent = {
          ...DEFAULT_SITE_CONTENT,
          ...fetched,
          siteMeta: {
            ...DEFAULT_SITE_CONTENT.siteMeta,
            ...(fetched.siteMeta || {}),
          },
          siteImages: {
            ...DEFAULT_SITE_CONTENT.siteImages,
            ...(fetched.siteImages || {}),
          },
          about: {
            ...DEFAULT_SITE_CONTENT.about,
            ...(fetched.about || {}),
          },
          instructions: {
            ...DEFAULT_SITE_CONTENT.instructions,
            ...(fetched.instructions || {}),
          },
          footer: {
            ...DEFAULT_SITE_CONTENT.footer,
            ...(fetched.footer || {}),
          },
          studyMaterials: Array.isArray(fetched.studyMaterials) ? fetched.studyMaterials : [],
          heroSlides: Array.isArray(fetched.heroSlides) ? fetched.heroSlides : DEFAULT_SITE_CONTENT.heroSlides,
          awardCriteria: Array.isArray(fetched.awardCriteria) ? fetched.awardCriteria : DEFAULT_SITE_CONTENT.awardCriteria,
          schedule: Array.isArray(fetched.schedule) ? fetched.schedule : DEFAULT_SITE_CONTENT.schedule,
          announcements: Array.isArray(fetched.announcements) ? fetched.announcements : DEFAULT_SITE_CONTENT.announcements,
          exams: Array.isArray(fetched.exams) ? fetched.exams : DEFAULT_SITE_CONTENT.exams,
        };
        setContent(merged);
        setIsBackendConnected(result.isFromBackend);
        setLastSyncTime(new Date());
        setSyncError(null);
      } else {
        setIsBackendConnected(false);
        setSyncError(result.message || 'ไม่สามารถโหลดข้อมูลจากฐานข้อมูลกลาง');
      }
    } catch (err: any) {
      if (!isMountedRef.current) return;
      setIsBackendConnected(false);
      setSyncError(err?.message || 'ข้อผิดพลาดเครือข่าย');
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, []);

  // Initial load on startup
  useEffect(() => {
    isMountedRef.current = true;
    loadContent(false);

    // Periodic polling (every 15–20s) to keep all devices synchronized without redeployment
    const interval = setInterval(() => {
      loadContent(true);
    }, APP_CONFIG.POLLING_INTERVAL_MS);

    // Reload when user switches back to window/tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadContent(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isMountedRef.current = false;
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loadContent]);

  // Update content in React state only after central database confirmation
  const setSyncedContent = useCallback((newContent: SiteContent) => {
    setContent(newContent);
    setLastSyncTime(new Date());
    setIsBackendConnected(true);
  }, []);

  return {
    content,
    isLoading,
    isRefreshing,
    isBackendConnected,
    lastSyncTime,
    syncError,
    refreshContent: () => loadContent(false),
    setSyncedContent,
    updateContentLocally: setSyncedContent,
  };
}
