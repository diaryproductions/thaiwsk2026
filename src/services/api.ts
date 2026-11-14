/**
 * API Service for สืบศิลป์ถิ่นอักษร สืบสุนทรภาษาไทย
 * Handles communication with Google Apps Script Web App Connector & Google Sheets Data Processing
 * Spreadsheet ID: 1EsneYlqKXHZakue-7fhHWzfNYOgmgitfUrMy-kzqiTI
 * 
 * Supports Multi-Tier Shared Configuration so every phone, computer, and incognito browser
 * connects to the central Google Apps Script gateway without requiring local manual setup.
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
  errorType?: string;
}

export interface HealthCheckResult {
  connected: boolean;
  provenance: 'shared_file' | 'env_var' | 'code_default' | 'local_override' | 'unconfigured';
  url: string;
  isDevUrl: boolean;
  errorType?:
    | 'NO_URL'
    | 'DEV_URL'
    | 'AUTH_REQUIRED'
    | 'CORS_OR_NETWORK'
    | 'HTTP_ERROR'
    | 'SHEET_NOT_FOUND'
    | 'INVALID_JSON'
    | 'UNKNOWN';
  message: string;
  technicalDetail?: string;
  checks: {
    urlFormat: boolean;
    webAppReachable: boolean;
    anonymousAccess: boolean; // Not blocked by Google Login
    spreadsheetOpen: boolean;
    scoreSheetExists: boolean;
    certificateSheetExists: boolean;
  };
  data?: any;
}

export interface SharedAppConfig {
  gasWebAppUrl?: string;
  spreadsheetId?: string;
  scoreSheet?: string;
  certificateSheet?: string;
  maxScoreDefault?: number;
  pollingIntervalMs?: number;
  appName?: string;
  lastUpdated?: string;
}

// Storage keys for custom overrides (used only for admin live testing)
const GAS_URL_STORAGE_KEY = 'thai_wsk_gas_url';
const ADMIN_TOKEN_KEY = 'thai_wsk_admin_token';

// In-memory cache of shared configuration loaded from /public/app-config.json
let cachedSharedConfig: SharedAppConfig | null = null;
let sharedConfigPromise: Promise<SharedAppConfig | null> | null = null;

/**
 * Initializes and loads the shared configuration file (public/app-config.json)
 * Every phone, tablet, and browser fetches this at boot time.
 */
export async function initSharedConfig(): Promise<SharedAppConfig | null> {
  if (cachedSharedConfig) {
    return cachedSharedConfig;
  }
  if (sharedConfigPromise) {
    return sharedConfigPromise;
  }

  sharedConfigPromise = (async () => {
    try {
      const baseUrl = import.meta.env.BASE_URL || '/';
      const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
      const configUrl = `${cleanBase}${APP_CONFIG.CONFIG_FILE_PATH}?_t=${Date.now()}`;

      const res = await fetch(configUrl, {
        method: 'GET',
        cache: 'no-cache',
        headers: { Accept: 'application/json' },
      });

      if (res.ok) {
        const data = (await res.json()) as SharedAppConfig;
        if (data && typeof data === 'object') {
          cachedSharedConfig = data;
          console.info('[สืบศิลป์ถิ่นอักษร] Loaded shared config successfully from:', configUrl);
          return data;
        }
      }
    } catch (e: any) {
      console.warn('[สืบศิลป์ถิ่นอักษร] Could not load app-config.json (using defaults/env):', e?.message);
    }
    return null;
  })();

  return sharedConfigPromise;
}

// Trigger shared config loading immediately on module evaluation
if (typeof window !== 'undefined') {
  initSharedConfig().catch(() => {});
}

/**
 * Normalizes and checks if a Google Apps Script URL uses the forbidden /dev endpoint
 */
export function inspectGasUrl(rawUrl: string): {
  normalized: string;
  isDev: boolean;
  isValidFormat: boolean;
  convertedExecUrl: string;
} {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { normalized: '', isDev: false, isValidFormat: false, convertedExecUrl: '' };
  }

  const clean = rawUrl.trim();
  const isDev = clean.includes('/macros/s/') && clean.endsWith('/dev');
  const isValidFormat = clean.startsWith('https://script.google.com/macros/s/') && (clean.endsWith('/exec') || clean.endsWith('/dev'));
  const convertedExecUrl = isDev ? clean.replace(/\/dev$/, '/exec') : clean;

  return {
    normalized: clean,
    isDev,
    isValidFormat,
    convertedExecUrl,
  };
}

/**
 * Determines where the current Web App URL originates from
 */
export function getConfigProvenance(): 'shared_file' | 'env_var' | 'code_default' | 'local_override' | 'unconfigured' {
  // 1. Shared Configuration file (highest priority for all devices)
  if (cachedSharedConfig?.gasWebAppUrl && cachedSharedConfig.gasWebAppUrl.trim() !== '') {
    return 'shared_file';
  }

  // 2. Build-time environment variable
  const envGasUrl = import.meta.env.VITE_GAS_URL || import.meta.env.VITE_APPS_SCRIPT_URL || import.meta.env.VITE_API_BASE_URL;
  if (envGasUrl && typeof envGasUrl === 'string' && envGasUrl.trim() !== '') {
    return 'env_var';
  }

  // 3. Built-in constants default in code
  if (APP_CONFIG.DEFAULT_GAS_URL && APP_CONFIG.DEFAULT_GAS_URL.trim() !== '') {
    return 'code_default';
  }

  // 4. LocalStorage admin override (for temporary testing on admin machine only)
  const savedUrl = localStorage.getItem(GAS_URL_STORAGE_KEY) || localStorage.getItem('thai_wsk_backend_url');
  if (savedUrl && savedUrl.trim() !== '') {
    return 'local_override';
  }

  return 'unconfigured';
}

/**
 * Resolves the active Google Apps Script Web App URL with proper tier fallbacks
 */
export function getApiBaseUrl(): string {
  // 1. Check shared configuration file loaded from public/app-config.json
  if (cachedSharedConfig?.gasWebAppUrl && cachedSharedConfig.gasWebAppUrl.trim() !== '') {
    return cachedSharedConfig.gasWebAppUrl.trim();
  }

  // 2. Check runtime/build-time environment variables
  const envGasUrl = import.meta.env.VITE_GAS_URL || import.meta.env.VITE_APPS_SCRIPT_URL || import.meta.env.VITE_API_BASE_URL;
  if (envGasUrl && typeof envGasUrl === 'string' && envGasUrl.trim() !== '') {
    return envGasUrl.trim();
  }

  // 3. Check built-in constants default
  if (APP_CONFIG.DEFAULT_GAS_URL && APP_CONFIG.DEFAULT_GAS_URL.trim() !== '') {
    return APP_CONFIG.DEFAULT_GAS_URL.trim();
  }

  // 4. Check localStorage override (configured via Admin Settings on this device)
  const savedUrl = localStorage.getItem(GAS_URL_STORAGE_KEY) || localStorage.getItem('thai_wsk_backend_url');
  if (savedUrl && savedUrl.trim() !== '') {
    return savedUrl.trim();
  }

  return '';
}

/**
 * Sets a local admin override (also stores in memory for immediate testing)
 */
export function setApiBaseUrl(url: string): void {
  const cleanUrl = url ? url.trim() : '';
  if (!cleanUrl) {
    localStorage.removeItem(GAS_URL_STORAGE_KEY);
    localStorage.removeItem('thai_wsk_backend_url');
  } else {
    localStorage.setItem(GAS_URL_STORAGE_KEY, cleanUrl);
    localStorage.setItem('thai_wsk_backend_url', cleanUrl);
  }
}

/**
 * Sets the active in-memory shared configuration (useful when admin tests or uploads new config)
 */
export function setSharedConfigInMemory(config: SharedAppConfig): void {
  cachedSharedConfig = {
    ...cachedSharedConfig,
    ...config,
  };
}

/**
 * Generates the standard JSON content for public/app-config.json
 */
export function generateAppConfigJson(gasUrl: string): string {
  const config: SharedAppConfig = {
    gasWebAppUrl: gasUrl.trim(),
    spreadsheetId: APP_CONFIG.SPREADSHEET_ID,
    scoreSheet: APP_CONFIG.SCORE_SHEET,
    certificateSheet: APP_CONFIG.CERTIFICATE_SHEET,
    maxScoreDefault: APP_CONFIG.MAX_SCORE_DEFAULT,
    pollingIntervalMs: APP_CONFIG.POLLING_INTERVAL_MS,
    appName: APP_CONFIG.APP_NAME,
    lastUpdated: new Date().toISOString(),
  };
  return JSON.stringify(config, null, 2);
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
 * Normalizes Thai name strings for search matching
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

  const formulaMatch = cleanUrl.match(/HYPERLINK\(\s*["'](https?:\/\/[^"']+)["']/i);
  if (formulaMatch && formulaMatch[1]) {
    cleanUrl = formulaMatch[1];
  } else {
    const urlMatch = cleanUrl.match(/https?:\/\/[^\s"'<>]+/);
    if (urlMatch) {
      cleanUrl = urlMatch[0];
    }
  }

  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    return { original: rawUrl, previewUrl: '', downloadUrl: '', isDrive: false, isValid: false };
  }

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
 * Comprehensive 6-point Health Check for Google Apps Script Web App & Google Sheets
 */
export async function checkBackendHealth(targetUrlOverride?: string): Promise<HealthCheckResult> {
  const urlToTest = (targetUrlOverride || getApiBaseUrl()).trim();
  const provenance = targetUrlOverride ? 'local_override' : getConfigProvenance();

  const defaultChecks = {
    urlFormat: false,
    webAppReachable: false,
    anonymousAccess: false,
    spreadsheetOpen: false,
    scoreSheetExists: false,
    certificateSheetExists: false,
  };

  if (!urlToTest) {
    return {
      connected: false,
      provenance,
      url: '',
      isDevUrl: false,
      errorType: 'NO_URL',
      message: 'ยังไม่ได้ระบุ Google Apps Script Web App URL',
      technicalDetail: 'URL is empty. Configure public/app-config.json or specify in Admin Dashboard.',
      checks: defaultChecks,
    };
  }

  const inspection = inspectGasUrl(urlToTest);

  if (inspection.isDev) {
    return {
      connected: false,
      provenance,
      url: urlToTest,
      isDevUrl: true,
      errorType: 'DEV_URL',
      message: 'ตรวจพบว่าคุณใช้ URL ทดสอบ (/dev) ซึ่งจะบังคับให้เข้าสู่ระบบ Google และทำให้โทรศัพท์หรือผู้อื่นเข้าใช้งานไม่ได้ กรุณาเปลี่ยนเป็น URL จากการ Deploy จริงที่ลงท้ายด้วย /exec',
      technicalDetail: `URL ends with /dev instead of /exec. Recommended replacement: ${inspection.convertedExecUrl}`,
      checks: {
        ...defaultChecks,
        urlFormat: false,
      },
    };
  }

  const checks = { ...defaultChecks, urlFormat: inspection.isValidFormat };

  try {
    const separator = urlToTest.includes('?') ? '&' : '?';
    const targetUrl = `${urlToTest}${separator}action=health&_t=${Date.now()}`;

    // Add a 10-second timeout controller
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const res = await fetch(targetUrl, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    checks.webAppReachable = true;

    if (!res.ok) {
      return {
        connected: false,
        provenance,
        url: urlToTest,
        isDevUrl: false,
        errorType: 'HTTP_ERROR',
        message: `Google Apps Script ตอบกลับรหัสข้อผิดพลาด HTTP ${res.status}`,
        technicalDetail: `HTTP status ${res.status} ${res.statusText}`,
        checks,
      };
    }

    // Inspect content type & text to see if Google redirected to a Login Page
    const responseText = await res.text();

    if (
      responseText.includes('<html') ||
      responseText.includes('accounts.google.com') ||
      responseText.includes('Sign in - Google Accounts')
    ) {
      return {
        connected: false,
        provenance,
        url: urlToTest,
        isDevUrl: false,
        errorType: 'AUTH_REQUIRED',
        message: 'Google Apps Script ติดสิทธิ์การเข้าถึง (ร้องขอให้ล็อกอิน Google) เนื่องจากสิทธิ์การเผยแพร่ไม่ได้ตั้งเป็น "Anyone (ทุกคน)" กรุณาตั้งค่า Deploy ให้ Who has access เป็น "Anyone"',
        technicalDetail: 'Response is an HTML login form from accounts.google.com instead of JSON.',
        checks: {
          ...checks,
          anonymousAccess: false,
        },
      };
    }

    checks.anonymousAccess = true;

    let data: any;
    try {
      data = JSON.parse(responseText);
    } catch (parseErr) {
      return {
        connected: false,
        provenance,
        url: urlToTest,
        isDevUrl: false,
        errorType: 'INVALID_JSON',
        message: 'Google Apps Script ไม่ได้ส่งข้อมูลในรูปแบบ JSON ที่ถูกต้อง',
        technicalDetail: `JSON Parse error: ${parseErr}. Body sample: ${responseText.slice(0, 100)}`,
        checks,
      };
    }

    if (data && data.status === 'ok') {
      const sheets = data.sheets || {};
      checks.spreadsheetOpen = true;
      checks.scoreSheetExists = Boolean(sheets.scoreSheetExists);
      checks.certificateSheetExists = Boolean(sheets.certificateSheetExists);

      if (!checks.scoreSheetExists || !checks.certificateSheetExists) {
        return {
          connected: false,
          provenance,
          url: urlToTest,
          isDevUrl: false,
          errorType: 'SHEET_NOT_FOUND',
          message: `ไม่พบแผ่นงานที่จำเป็นใน Google Spreadsheet: ตรวจสอบคะแนน (${checks.scoreSheetExists ? 'พบ' : 'ไม่พบ'}), ดาวน์โหลดเกียรติบัตร (${checks.certificateSheetExists ? 'พบ' : 'ไม่พบ'})`,
          technicalDetail: `Expected sheets: '${APP_CONFIG.SCORE_SHEET}' and '${APP_CONFIG.CERTIFICATE_SHEET}'`,
          checks,
          data,
        };
      }

      return {
        connected: true,
        provenance,
        url: urlToTest,
        isDevUrl: false,
        message: 'เชื่อมต่อ Google Apps Script และ Google Sheets สำเร็จเรียบร้อย ครบทั้ง 6 ขั้นตอน',
        checks,
        data,
      };
    }

    return {
      connected: false,
      provenance,
      url: urlToTest,
      isDevUrl: false,
      errorType: 'UNKNOWN',
      message: data?.message || 'ไม่สามารถยืนยันสถานะการเชื่อมต่อสเปรดชีตได้',
      technicalDetail: JSON.stringify(data),
      checks,
      data,
    };
  } catch (err: any) {
    const isAbort = err?.name === 'AbortError';
    return {
      connected: false,
      provenance,
      url: urlToTest,
      isDevUrl: false,
      errorType: 'CORS_OR_NETWORK',
      message: isAbort
        ? 'การเชื่อมต่อ Google Apps Script หมดเวลา (Timeout เกิน 12 วินาที)'
        : 'ไม่สามารถเชื่อมต่อ Google Apps Script Web App ได้ (อาจเกิดจากปัญหาเครือข่าย หรือสิทธิ์ Who has access ยังไม่ได้ตั้งเป็น "Anyone")',
      technicalDetail: `${err?.name}: ${err?.message}`,
      checks,
    };
  }
}

/**
 * Search score in sheet 'ตรวจสอบคะแนน' via Google Apps Script
 */
export async function searchScore(params: {
  query: string;
  grade?: string;
  room?: string;
}): Promise<SearchResponse<ScoreSearchResult>> {
  // Ensure shared config is loaded first
  await initSharedConfig();
  const baseUrl = getApiBaseUrl();
  
  if (!baseUrl) {
    return {
      success: false,
      isBackendConnected: false,
      errorType: 'NO_CONFIG',
      message: 'ระบบยังไม่สามารถเชื่อมต่อฐานข้อมูลได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง หรือติดต่อผู้ดูแลระบบ',
    };
  }

  try {
    const url = new URL(baseUrl);
    url.searchParams.set('action', 'searchScore');
    url.searchParams.set('query', params.query);
    if (params.grade) url.searchParams.set('grade', params.grade);
    if (params.room) url.searchParams.set('room', params.room);
    url.searchParams.set('_t', Date.now().toString());

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const res = await fetch(url.toString(), {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const text = await res.text();
    if (text.includes('<html') || text.includes('accounts.google.com')) {
      console.error('[สืบศิลป์ถิ่นอักษร] GAS returned Google Login HTML. Permissions must be "Anyone".');
      return {
        success: false,
        isBackendConnected: false,
        errorType: 'AUTH_REQUIRED',
        message: 'ระบบยังไม่สามารถเข้าถึงฐานข้อมูลได้ (ติดสิทธิ์การเข้าถึง กรุณาติดต่อผู้ดูแลระบบให้ตั้งค่าสิทธิ์ Web App เป็น Anyone)',
      };
    }

    const data = JSON.parse(text);
    return {
      ...data,
      isBackendConnected: true,
    };
  } catch (err: any) {
    console.error('[สืบศิลป์ถิ่นอักษร] Search score error:', err);
    return {
      success: false,
      isBackendConnected: false,
      errorType: err?.name === 'AbortError' ? 'TIMEOUT' : 'NETWORK_ERROR',
      message: 'ระบบยังไม่สามารถเชื่อมต่อฐานข้อมูลได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง หรือติดต่อผู้ดูแลระบบ',
    };
  }
}

/**
 * Search certificate in sheet 'ดาวน์โหลดเกียรติบัตร' via Google Apps Script
 */
export async function searchCertificate(params: {
  query: string;
  grade?: string;
  room?: string;
}): Promise<SearchResponse<CertificateSearchResult>> {
  // Ensure shared config is loaded first
  await initSharedConfig();
  const baseUrl = getApiBaseUrl();

  if (!baseUrl) {
    return {
      success: false,
      isBackendConnected: false,
      errorType: 'NO_CONFIG',
      message: 'ระบบยังไม่สามารถเชื่อมต่อฐานข้อมูลได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง หรือติดต่อผู้ดูแลระบบ',
    };
  }

  try {
    const url = new URL(baseUrl);
    url.searchParams.set('action', 'searchCertificate');
    url.searchParams.set('query', params.query);
    if (params.grade) url.searchParams.set('grade', params.grade);
    if (params.room) url.searchParams.set('room', params.room);
    url.searchParams.set('_t', Date.now().toString());

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const res = await fetch(url.toString(), {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const text = await res.text();
    if (text.includes('<html') || text.includes('accounts.google.com')) {
      console.error('[สืบศิลป์ถิ่นอักษร] GAS returned Google Login HTML. Permissions must be "Anyone".');
      return {
        success: false,
        isBackendConnected: false,
        errorType: 'AUTH_REQUIRED',
        message: 'ระบบยังไม่สามารถเข้าถึงฐานข้อมูลเกียรติบัตรได้ (กรุณาติดต่อผู้ดูแลระบบให้ตั้งค่าสิทธิ์ Web App เป็น Anyone)',
      };
    }

    const data = JSON.parse(text);
    return {
      ...data,
      isBackendConnected: true,
    };
  } catch (err: any) {
    console.error('[สืบศิลป์ถิ่นอักษร] Search cert error:', err);
    return {
      success: false,
      isBackendConnected: false,
      errorType: err?.name === 'AbortError' ? 'TIMEOUT' : 'NETWORK_ERROR',
      message: 'ระบบยังไม่สามารถเชื่อมต่อฐานข้อมูลได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง หรือติดต่อผู้ดูแลระบบ',
    };
  }
}

/**
 * Fetch dynamic CMS content from Google Apps Script / Google Sheets H:O
 */
export async function fetchSiteContent(): Promise<{
  success: boolean;
  content?: SiteContent;
  isFromBackend: boolean;
  message?: string;
}> {
  await initSharedConfig();
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    return {
      success: true,
      isFromBackend: false,
      message: 'ใช้ข้อมูลค่าเริ่มต้น (ยังไม่ได้ระบุ Google Apps Script URL)',
    };
  }

  try {
    const separator = baseUrl.includes('?') ? '&' : '?';
    const targetUrl = `${baseUrl}${separator}action=getContent&_t=${Date.now()}`;
    const res = await fetch(targetUrl, {
      method: 'GET',
      redirect: 'follow',
    });

    if (res.ok) {
      const text = await res.text();
      if (!text.includes('<html') && !text.includes('accounts.google.com')) {
        const data = JSON.parse(text);
        if (data && data.content) {
          return {
            success: true,
            content: data.content,
            isFromBackend: true,
          };
        }
      }
    }
    return {
      success: false,
      isFromBackend: false,
      message: `ไม่พบข้อมูล CMS จาก Google Apps Script (HTTP ${res.status})`,
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
 * Save CMS content to Google Sheets via Google Apps Script (Columns H:O)
 */
export async function saveSiteContent(content: SiteContent): Promise<{
  success: boolean;
  message: string;
  verified?: boolean;
  verifiedContent?: SiteContent;
}> {
  const baseUrl = getApiBaseUrl();
  const token = getAdminToken();

  if (!baseUrl) {
    return {
      success: false,
      message: 'ยังไม่ได้ระบุ Google Apps Script Web App URL กรุณาตั้งค่าในแท็บ "ฐานข้อมูล & Google Apps Script"',
    };
  }

  if (!token) {
    return {
      success: false,
      message: 'เซสชันแอดมินหมดอายุ กรุณาเข้าสู่ระบบใหม่',
    };
  }

  try {
    // Send as text/plain to avoid CORS preflight OPTIONS which GAS doesn't handle
    const payload = JSON.stringify({
      action: 'saveContent',
      token,
      content,
    });

    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: payload,
      redirect: 'follow',
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return {
        success: false,
        message: data.message || `บันทึกไม่สำเร็จ (HTTP ${res.status})`,
      };
    }

    // ทดสอบอ่านข้อมูลกลับจากฐานข้อมูลจริง (Verification Read-back from Google Sheets)
    await new Promise((resolve) => setTimeout(resolve, 500));
    const verifyRes = await fetchSiteContent();
    if (!verifyRes.success || !verifyRes.content) {
      return {
        success: false,
        message: 'บันทึกข้อมูลแล้ว แต่ไม่สามารถยืนยันการอ่านข้อมูลกลับจาก Google Sheets ได้ กรุณาลองใหม่อีกครั้ง',
      };
    }

    return {
      success: true,
      verified: true,
      verifiedContent: verifyRes.content,
      message: 'บันทึกข้อมูลถาวรลง Google Sheets สำเร็จเรียบร้อยแล้ว ทุกอุปกรณ์จะได้รับข้อมูลอัปเดตตรงกัน',
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
    const payload = JSON.stringify({
      action: 'adminLogin',
      username: credentials.username,
      passwordHashOrSecret: credentials.passwordHashOrSecret,
    });

    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: payload,
      redirect: 'follow',
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

export interface AdminCertificateItem extends CertificateSearchResult {
  rowIndex?: number;
  driveId?: string;
}

/**
 * Fetch all certificates from sheet 'ดาวน์โหลดเกียรติบัตร'!A:F (Admin Only)
 */
export async function listAllCertificatesAdmin(): Promise<{
  success: boolean;
  data?: AdminCertificateItem[];
  total?: number;
  errorType?: 'NO_CONFIG' | 'AUTH_EXPIRED' | 'UPDATE_GAS_REQUIRED' | 'NETWORK_ERROR' | 'UNKNOWN';
  message?: string;
}> {
  await initSharedConfig();
  const baseUrl = getApiBaseUrl();
  const token = getAdminToken();

  if (!baseUrl) {
    return {
      success: false,
      errorType: 'NO_CONFIG',
      message: 'ยังไม่ได้ระบุ Google Apps Script Web App URL กรุณาตั้งค่าในแท็บ "ฐานข้อมูล & Google Apps Script"',
    };
  }

  if (!token) {
    return {
      success: false,
      errorType: 'AUTH_EXPIRED',
      message: 'เซสชันแอดมินหมดอายุ กรุณาเข้าสู่ระบบใหม่',
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 18000);

    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        action: 'listCertificates',
        token,
      }),
      redirect: 'follow',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const text = await res.text();
    if (text.includes('<html') || text.includes('accounts.google.com')) {
      return {
        success: false,
        errorType: 'AUTH_EXPIRED',
        message: 'Google Apps Script ติดสิทธิ์การเข้าถึง กรุณาตรวจสอบว่า Deploy สิทธิ์เป็น Anyone',
      };
    }

    const data = JSON.parse(text);
    if (!data.success && typeof data.message === 'string' && data.message.includes('ไม่พบ Action ที่ร้องขอ')) {
      return {
        success: false,
        errorType: 'UPDATE_GAS_REQUIRED',
        message:
          'Google Apps Script Web App ที่ Deploy อยู่ยังเป็นเวอร์ชันเก่า กรุณาอัปเดตโค้ด Code.gs และ Deploy New Version ใน Google Apps Script เพื่อเปิดใช้งานระบบจัดการและพิมพ์เกียรติบัตร',
      };
    }

    if (data.authExpired) {
      return {
        success: false,
        errorType: 'AUTH_EXPIRED',
        message: data.message || 'เซสชันแอดมินหมดอายุ กรุณาเข้าสู่ระบบใหม่',
      };
    }

    return {
      success: Boolean(data.success),
      data: Array.isArray(data.data) ? data.data : [],
      total: data.total || 0,
      message: data.message,
    };
  } catch (err: any) {
    return {
      success: false,
      errorType: 'NETWORK_ERROR',
      message: `ไม่สามารถดึงรายการเกียรติบัตรได้: ${err?.message || 'Network error'}`,
    };
  }
}

/**
 * Fetch certificate PDF bytes (base64) via GAS proxy for admin PDF merging
 */
export async function fetchCertificatePdfBase64Admin(url: string): Promise<{
  success: boolean;
  base64?: string;
  fileName?: string;
  byteSize?: number;
  errorType?: string;
  message?: string;
}> {
  await initSharedConfig();
  const baseUrl = getApiBaseUrl();
  const token = getAdminToken();

  if (!baseUrl) {
    return {
      success: false,
      errorType: 'NO_CONFIG',
      message: 'ยังไม่ได้ระบุ Google Apps Script Web App URL',
    };
  }
  if (!token) {
    return {
      success: false,
      errorType: 'AUTH_REQUIRED',
      message: 'เซสชันแอดมินหมดอายุ กรุณาเข้าสู่ระบบใหม่',
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        action: 'fetchCertificatePdf',
        token,
        url,
      }),
      redirect: 'follow',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const text = await res.text();
    if (text.includes('<html') || text.includes('accounts.google.com')) {
      return {
        success: false,
        errorType: 'AUTH_REQUIRED',
        message: 'ติดสิทธิ์เข้าสู่ระบบ Google Apps Script',
      };
    }

    const data = JSON.parse(text);
    if (!data.success && typeof data.message === 'string' && data.message.includes('ไม่พบ Action ที่ร้องขอ')) {
      return {
        success: false,
        errorType: 'UPDATE_GAS_REQUIRED',
        message: 'กรุณาอัปเดตและ Deploy โค้ด Code.gs เวอร์ชันใหม่ใน Google Apps Script ก่อนใช้งานรวมไฟล์ PDF',
      };
    }

    return data;
  } catch (err: any) {
    return {
      success: false,
      errorType: err?.name === 'AbortError' ? 'TIMEOUT' : 'NETWORK_ERROR',
      message: err?.name === 'AbortError' ? 'หมดเวลาการดึงไฟล์ PDF (Timeout)' : (err?.message || 'เกิดข้อผิดพลาดเครือข่าย'),
    };
  }
}

