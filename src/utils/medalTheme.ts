export type MedalCategory = 'gold' | 'silver' | 'bronze' | 'honor';

export interface MedalTheme {
  category: MedalCategory;
  bannerBg: string;
  bannerBorder: string;
  badgeBg: string;
  badgeText: string;
  iconBg: string;
  iconColor: string;
  titleColor: string;
  accentLine: string;
}

/**
 * Maps raw medal string from Google Sheet Column E ('ระดับเหรียญ')
 * to distinct visual tokens without modifying or recalculating the value itself.
 */
export function getMedalTheme(rawMedal?: string): MedalTheme {
  const text = (rawMedal || '').trim();

  // Check 'ทองแดง' BEFORE 'ทอง'
  if (text.includes('ทองแดง')) {
    return {
      category: 'bronze',
      bannerBg: 'bg-gradient-to-r from-[#FFF7ED] via-white to-[#FFEDD5]/80',
      bannerBorder: 'border-[#C2410C]/45',
      badgeBg: 'bg-gradient-to-r from-[#9A3412] to-[#C2410C] text-white border-[#7C2D12]/40',
      badgeText: 'text-[#9A3412]',
      iconBg: 'bg-[#FFEDD5] border-[#C2410C]/40',
      iconColor: 'text-[#9A3412]',
      titleColor: 'text-[#7C2D12]',
      accentLine: 'from-[#B45309] via-[#EA580C] to-[#9A3412]',
    };
  }

  if (text.includes('ทอง')) {
    return {
      category: 'gold',
      bannerBg: 'bg-gradient-to-r from-[#FFFDF5] via-[#FFF8DE] to-[#F4E4B5]/75',
      bannerBorder: 'border-[#D6AF55]',
      badgeBg: 'bg-gradient-to-r from-[#D6AF55] via-[#E5C46D] to-[#B88924] text-[#2A1845] border-[#B88924]/50',
      badgeText: 'text-[#855E16]',
      iconBg: 'bg-[#F4E4B5]/70 border-[#D6AF55]',
      iconColor: 'text-[#9E6E14]',
      titleColor: 'text-[#6B480C]',
      accentLine: 'from-[#B88924] via-[#F4E4B5] to-[#D6AF55]',
    };
  }

  if (text.includes('เงิน')) {
    return {
      category: 'silver',
      bannerBg: 'bg-gradient-to-r from-[#F8FAFC] via-white to-[#E2E8F0]/75',
      bannerBorder: 'border-slate-400',
      badgeBg: 'bg-gradient-to-r from-slate-600 to-slate-700 text-white border-slate-500/40',
      badgeText: 'text-slate-700',
      iconBg: 'bg-slate-100 border-slate-300',
      iconColor: 'text-slate-600',
      titleColor: 'text-slate-800',
      accentLine: 'from-slate-400 via-slate-200 to-slate-500',
    };
  }

  // ชมเชย / เข้าร่วม / อื่นๆ
  return {
    category: 'honor',
    bannerBg: 'bg-gradient-to-r from-[#FAF8FD] via-white to-[#EDE5FA]/75',
    bannerBorder: 'border-[#7043A6]/45',
    badgeBg: 'bg-gradient-to-r from-[#4B267D] to-[#7043A6] text-white border-[#4B267D]/40',
    badgeText: 'text-[#4B267D]',
    iconBg: 'bg-[#EDE5FA] border-[#7043A6]/35',
    iconColor: 'text-[#4B267D]',
    titleColor: 'text-[#4B267D]',
    accentLine: 'from-[#4B267D] via-[#D6AF55] to-[#7043A6]',
  };
}
