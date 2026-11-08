/**
 * API Service for THAI WSK 2026
 * Handles communication with Cloudflare Worker Backend & Google Sheets Data Processing
 */

import { APP_CONFIG, THAI_NAME_PREFIXES } from '../config/constants';
import { SiteContent } from '../config/defaultContent';

export interface ScoreSearchResult {
  number: string;        // Col A: เลขที่
  fullName: string;      // Col B: ชื่อ-นามสกุล
  grade: string;         // Col C: ระดับชั้น
  room: string;          // Col D: ห้อง
  score: string | number; // Col E: คะแนนที่ได้
  evaluation: string;    // Col F: ผลการประเมิน (ผ่าน / ไม่ผ่าน)
  maxScore?: number;
  percentage?: number | null;
}

export interface CertificateSearchResult {
  number: string;        // Col A: เลขที่
  fullName: string;      // Col B: ชื่อ-นามสกุล
  grade: string;         // Col C: ระดับชั้น
  room: string;          // Col D: ห้อง
  medal: string;         // Col E: ระดับเหรียญ
  certificateUrl: string; // Col F: URL ของเกียรติบัตร
  previewUrl?: string;   // Preview iframe URL if PDF / Drive
  downloadUrl?: string;  // Direct download link
  isDrive: boolean;
}

export interface SearchResponse<T> {
  success: boolean;
  data?: T[];
  multipleMatches?: boolean;
  requiresRefinement?: boolean;
  totalMatches?: number;
  message?: string;
  isBackendConnected: boolean;
}

// Storage key for custom backend URL configured via Admin UI
const BACKEND_URL_STORAGE_KEY = 'thai_wsk_backend_url';
const ADMIN_TOKEN_KEY = 'thai_wsk_admin_token';

export function getApiBaseUrl(): string {
  // 1. Check runtime environment variable
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    return envUrl.trim().replace(/\/+$/, '');
  }
  // 2. Check localStorage override (configured via Admin Settings)
  const savedUrl = localStorage.getItem(BACKEND_URL_STORAGE_KEY);
  if (savedUrl && savedUrl.trim() !== '') {
    return savedUrl.trim().replace(/\/+$/, '');
  }
  return '';
}

export function setApiBaseUrl(url: string): void {
  if (!url || url.trim() === '') {
    localStorage.removeItem(BACKEND_URL_STORAGE_KEY);
  } else {
    localStorage.setItem(BACKEND_URL_STORAGE_KEY, url.trim().replace(/\/+$/, ''));
  }
}

export function getAdminToken(): string | null {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setAdminToken(token: string | null): void {
  if (!token) {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
  } else {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
  }
}

/**
 * Normalizes Thai name strings for search matching:
 * - Trims whitespace
 * - Collapses consecutive spaces
 * - Strips common Thai title prefixes (นาย, นางสาว, เด็กชาย, etc.)
 */
export function normalizeThaiName(input: string): { normalized: string; strippedPrefix: string } {
  if (!input) return { normalized: '', strippedPrefix: '' };
  
  let cleaned = input.trim().replace(/\s+/g, ' ');
  let strippedPrefix = '';

  for (const prefix of THAI_NAME_PREFIXES) {
    if (cleaned.startsWith(prefix)) {
      strippedPrefix = prefix;
      cleaned = cleaned.substring(prefix.length).trim();
      break;
    }
  }

  return {
    normalized: cleaned.replace(/\s+/g, ' ').toLowerCase(),
    strippedPrefix,
  };
}

/**
 * Extracts and prepares Google Drive or PDF links
 */
export function resolveCertificateUrl(rawUrl: string): {
  original: string;
  previewUrl: string;
  downloadUrl: string;
  isDrive: boolean;
  isValid: boolean;
} {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { original: '', previewUrl: '', downloadUrl: '', isDrive: false, isValid: false };
  }

  let cleanUrl = rawUrl.trim();

  // If the cell contains an Excel / Google Sheets formula like =HYPERLINK("https://...", "ดาวน์โหลด")
  const formulaMatch = cleanUrl.match(/HYPERLINK\(\s*["'](https?:\/\/[^"']+)["']/i);
  if (formulaMatch && formulaMatch[1]) {
    cleanUrl = formulaMatch[1];
  } else {
    // If text contains a URL inside
    const urlMatch = cleanUrl.match(/https?:\/\/[^\s"'<>]+/);
    if (urlMatch) {
      cleanUrl = urlMatch[0];
    }
  }

  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    return { original: rawUrl, previewUrl: '', downloadUrl: '', isDrive: false, isValid: false };
  }

  // Check if Google Drive link
  const driveFileMatch = cleanUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  const driveIdMatch = cleanUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  const driveId = (driveFileMatch && driveFileMatch[1]) || (driveIdMatch && driveIdMatch[1]);

  if (driveId) {
    return {
      original: cleanUrl,
      previewUrl: `https://drive.google.com/file/d/${driveId}/preview`,
      downloadUrl: `https://drive.google.com/uc?id=${driveId}&export=download`,
      isDrive: true,
      isValid: true,
    };
  }

  return {
    original: cleanUrl,
    previewUrl: cleanUrl,
    downloadUrl: cleanUrl,
    isDrive: false,
    isValid: true,
  };
}

/**
 * Check backend health status
 */
export async function checkBackendHealth(): Promise<{
  connected: boolean;
  message: string;
  data?: any;
}> {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    return {
      connected: false,
      message: 'ยังไม่ได้ระบุ Backend URL (Cloudflare Worker)',
    };
  }

  try {
    const res = await fetch(`${baseUrl}/api/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) {
      return {
        connected: false,
        message: `เชื่อมต่อเซิร์ฟเวอร์ตอบกลับรหัสข้อผิดพลาด: HTTP ${res.status}`,
      };
    }
    const data = await res.json();
    return {
      connected: true,
      message: 'เชื่อมต่อ Cloudflare Worker API และ Google Sheets สำเร็จ',
      data,
    };
  } catch (err: any) {
    return {
      connected: false,
      message: `ไม่สามารถเชื่อมต่อ Backend API: ${err?.message || 'Network error'}`,
    };
  }
}

/**
 * Search score in sheet 'ตรวจสอบคะแนน'
 */
export async function searchScore(params: {
  query: string;
  grade?: string;
  room?: string;
}): Promise<SearchResponse<ScoreSearchResult>> {
  const baseUrl = getApiBaseUrl();
  
  if (!baseUrl) {
    return {
      success: false,
      isBackendConnected: false,
      message: 'ยังไม่ได้เชื่อมต่อฐานข้อมูล Google Sheets ผ่าน Cloudflare Worker API Gateway (กรุณาตั้งค่าในแอดมินหรือดูเอกสาร docs/BACKEND.md)',
    };
  }

  try {
    const res = await fetch(`${baseUrl}/api/search-score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const data = await res.json();
    return {
      ...data,
      isBackendConnected: true,
    };
  } catch (err: any) {
    return {
      success: false,
      isBackendConnected: false,
      message: `เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์: ${err?.message || 'Network Error'}`,
    };
  }
}

/**
 * Search certificate in sheet 'ดาวน์โหลดเกียรติบัตร'
 */
export async function searchCertificate(params: {
  query: string;
  grade?: string;
  room?: string;
}): Promise<SearchResponse<CertificateSearchResult>> {
  const baseUrl = getApiBaseUrl();

  if (!baseUrl) {
    return {
      success: false,
      isBackendConnected: false,
      message: 'ยังไม่ได้เชื่อมต่อฐานข้อมูล Google Sheets ผ่าน Cloudflare Worker API Gateway',
    };
  }

  try {
    const res = await fetch(`${baseUrl}/api/search-certificate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const data = await res.json();
    return {
      ...data,
      isBackendConnected: true,
    };
  } catch (err: any) {
    return {
      success: false,
      isBackendConnected: false,
      message: `เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์: ${err?.message || 'Network Error'}`,
    };
  }
}

/**
 * Fetch dynamic CMS content from Cloudflare Worker / Google Sheets H:O
 */
export async function fetchSiteContent(): Promise<{
  success: boolean;
  content?: SiteContent;
  isFromBackend: boolean;
  message?: string;
}> {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    return {
      success: true,
      isFromBackend: false,
      message: 'ใช้ข้อมูลค่าเริ่มต้น (ยังไม่ได้ระบุ Backend URL)',
    };
  }

  try {
    const res = await fetch(`${baseUrl}/api/site-content`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.content) {
        return {
          success: true,
          content: data.content,
          isFromBackend: true,
        };
      }
    }
    return {
      success: false,
      isFromBackend: false,
      message: `HTTP ${res.status}: ไม่สามารถดึงข้อมูล CMS จาก Backend`,
    };
  } catch (err: any) {
    return {
      success: false,
      isFromBackend: false,
      message: err?.message || 'Network error',
    };
  }
}

/**
 * Save CMS content to Google Sheets via Cloudflare Worker
 */
export async function saveSiteContent(content: SiteContent): Promise<{
  success: boolean;
  message: string;
}> {
  const baseUrl = getApiBaseUrl();
  const token = getAdminToken();

  if (!baseUrl) {
    return {
      success: false,
      message: 'ยังไม่ได้กำหนด Backend API URL ไม่สามารถบันทึกลง Google Sheets ได้',
    };
  }

  if (!token) {
    return {
      success: false,
      message: 'เซสชันแอดมินหมดอายุ กรุณาเข้าสู่ระบบใหม่',
    };
  }

  try {
    const res = await fetch(`${baseUrl}/api/admin/content`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return {
        success: false,
        message: data.message || `บันทึกไม่สำเร็จ (HTTP ${res.status})`,
      };
    }

    return {
      success: true,
      message: data.message || 'บันทึกข้อมูลลง Google Sheets สำเร็จ และอัปเดตทุกอุปกรณ์แล้ว',
    };
  } catch (err: any) {
    return {
      success: false,
      message: `การบันทึกล้มเหลว: ${err?.message || 'Network error'}`,
    };
  }
}

/**
 * Admin login
 */
export async function adminLogin(credentials: {
  username: string;
  passwordHashOrSecret: string;
}): Promise<{
  success: boolean;
  token?: string;
  message: string;
}> {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    // Standalone / preview mode: Allow preview admin access
    if (credentials.username === APP_CONFIG.DEFAULT_ADMIN_USER) {
      const mockToken = `preview-token-${Date.now()}`;
      setAdminToken(mockToken);
      return {
        success: true,
        token: mockToken,
        message: 'เข้าสู่ระบบในโหมดตัวอย่าง (Preview Mode)',
      };
    }
    return {
      success: false,
      message: 'ชื่อผู้ใช้ไม่ถูกต้องสำหรับโหมดตัวอย่าง',
    };
  }

  try {
    const res = await fetch(`${baseUrl}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    const data = await res.json();
    if (res.ok && data.success && data.token) {
      setAdminToken(data.token);
      return {
        success: true,
        token: data.token,
        message: 'เข้าสู่ระบบสำเร็จ',
      };
    }
    return {
      success: false,
      message: data.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
    };
  } catch (err: any) {
    return {
      success: false,
      message: `ไม่สามารถเชื่อมต่อระบบยืนยันตัวตน: ${err?.message}`,
    };
  }
}
