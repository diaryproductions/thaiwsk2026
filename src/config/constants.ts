/**
 * THAI WSK 2026 — Configuration and Constants
 * กลุ่มสาระการเรียนรู้ภาษาไทย โรงเรียนกระทุ่มแบน "วิเศษสมุทคุณ"
 */

export const APP_CONFIG = {
  APP_NAME: 'THAI WSK 2026',
  PROJECT_NAME: 'โครงการส่งเสริมและพัฒนาความรู้ความสามารถด้านภาษาไทย',
  ACTIVITY_NAME: 'สืบศิลป์ถิ่นอักษร สืบสุนทรภาษาไทย',
  ORGANIZATION: 'กลุ่มสาระการเรียนรู้ภาษาไทย โรงเรียนกระทุ่มแบน "วิเศษสมุทคุณ"',
  DEFAULT_ADMIN_USER: 'admin_wsk',
  
  // Google Sheets Database Constants (Strictly verified)
  SPREADSHEET_ID: '1EsneYlqKXHZakue-7fhHWzfNYOgmgitfUrMy-kzqiTI',
  SCORE_SHEET: 'ตรวจสอบคะแนน',
  SCORE_RANGE: "'ตรวจสอบคะแนน'!A:F",
  CERTIFICATE_SHEET: 'ดาวน์โหลดเกียรติบัตร',
  CERTIFICATE_RANGE: "'ดาวน์โหลดเกียรติบัตร'!A:F",
  
  // CMS Reserved Range in Score Sheet (only if approved and confirmed safe)
  CMS_RANGE: "'ตรวจสอบคะแนน'!H:O",
  CMS_HEADERS: [
    'CMS_ID',
    'CMS_SECTION',
    'CMS_TYPE',
    'CMS_KEY',
    'CMS_VALUE_JSON',
    'SORT_ORDER',
    'IS_ACTIVE',
    'UPDATED_AT',
  ],
  
  // Design System Colors
  COLORS: {
    deepPurple: '#4B267D',
    royalPurple: '#7043A6',
    elegantGold: '#D6AF55',
    lightLavender: '#FAF8FD',
    white: '#FFFFFF',
    darkText: '#30283A',
  },
  
  // Polling Interval for live updates across devices
  POLLING_INTERVAL_MS: 20000,
  
  // Slider auto-advance interval (10 seconds)
  SLIDER_INTERVAL_MS: 10000,
  
  // Full score default for percentage calculations
  MAX_SCORE_DEFAULT: 20,
};

// Thai Name Prefixes for normalization
export const THAI_NAME_PREFIXES = [
  'เด็กชาย',
  'เด็กหญิง',
  'ด.ช.',
  'ด.ญ.',
  'นาย',
  'นางสาว',
  'นาง',
  'น.ส.',
];
