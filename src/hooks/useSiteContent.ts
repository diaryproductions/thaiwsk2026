import { useState, useEffect, useCallback, useRef } from 'react';
import { SiteContent, DEFAULT_SITE_CONTENT } from '../config/defaultContent';
import { fetchSiteContent, getApiBaseUrl } from '../services/api';
import { APP_CONFIG } from '../config/constants';

export function useSiteContent() {
  const [content, setContent] = useState<SiteContent>(() => {
    // Check localStorage for offline cached version if available
    try {
      const cached = localStorage.getItem('thai_wsk_site_content');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.version) {
          return parsed;
        }
      }
    } catch (e) {
      // ignore
    }
    return DEFAULT_SITE_CONTENT;
  });

  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const isMountedRef = useRef(true);

  const loadContent = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const baseUrl = getApiBaseUrl();
      if (!baseUrl) {
        setIsBackendConnected(false);
        setSyncError('ยังไม่ได้ระบุ Backend URL');
        return;
      }

      const result = await fetchSiteContent();
      if (!isMountedRef.current) return;

      if (result.success && result.content) {
        setContent(result.content);
        setIsBackendConnected(result.isFromBackend);
        setLastSyncTime(new Date());
        setSyncError(null);
        try {
          localStorage.setItem('thai_wsk_site_content', JSON.stringify(result.content));
        } catch (e) {
          // ignore storage quota error
        }
      } else {
        setIsBackendConnected(false);
        setSyncError(result.message || 'ไม่สามารถโหลดข้อมูลจากเซิร์ฟเวอร์');
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

  // Initial load
  useEffect(() => {
    isMountedRef.current = true;
    loadContent(false);

    // Periodic polling (Part 7: 15–30 seconds)
    const interval = setInterval(() => {
      loadContent(true);
    }, APP_CONFIG.POLLING_INTERVAL_MS);

    // Also reload when user switches back to tab (visibilitychange)
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

  const updateContentLocally = useCallback((newContent: SiteContent) => {
    setContent(newContent);
    try {
      localStorage.setItem('thai_wsk_site_content', JSON.stringify(newContent));
    } catch (e) {
      // ignore
    }
  }, []);

  return {
    content,
    isLoading,
    isRefreshing,
    isBackendConnected,
    lastSyncTime,
    syncError,
    refreshContent: () => loadContent(false),
    updateContentLocally,
  };
}
