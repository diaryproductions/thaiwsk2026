const THAI_DIGITS = ['๐', '๑', '๒', '๓', '๔', '๕', '๖', '๗', '๘', '๙'] as const;

/**
 * แปลงตัวเลขไทย (๐–๙) เป็นตัวเลขอารบิก (0–9) สำหรับการแสดงผลข้อความ
 * ใช้กับข้อความที่แสดงบนหน้าจอเท่านั้น ห้ามใช้กับ URL, ลิงก์ไฟล์, Token หรือ ID ระบบ
 */
export function toArabicNumerals(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  return String(value).replace(/[๐-๙]/g, (digit) => {
    const idx = THAI_DIGITS.indexOf(digit as (typeof THAI_DIGITS)[number]);
    return idx >= 0 ? String(idx) : digit;
  });
}
