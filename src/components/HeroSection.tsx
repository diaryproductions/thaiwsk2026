import React from 'react';
import { BookOpen, Award, CheckCircle } from 'lucide-react';
import { SiteContent } from '../config/defaultContent';
import { SmartImage } from './SmartImage';
import { isViewerPageUrl } from '../utils/imageUrl';
import { ThaiOrnament } from './ThaiOrnament';

interface HeroSectionProps {
  content: SiteContent;
  onNavigate: (tab: 'exam' | 'score' | 'certificate' | 'admin') => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ content, onNavigate }) => {
  // Resolve Hero Logo from ManagedSiteImage first, then fallback to siteImages.heroLogoUrl and bundled asset
  const heroLogoItem = (content.siteImageItems || []).find(
    (img) => img.section === 'heroLogo'
  );
  const isHeroLogoVisible = heroLogoItem ? heroLogoItem.isVisible !== false : true;

  const rawCandidate =
    (heroLogoItem?.url && heroLogoItem.url.trim()) ||
    (content.siteImages?.heroLogoUrl && content.siteImages.heroLogoUrl.trim()) ||
    '';

  const resolvedHeroSrc =
    !rawCandidate || isViewerPageUrl(rawCandidate)
      ? 'images/ครูไทยวิเศษฯ-2026 (1).png'
      : rawCandidate;

  const logoWidth = heroLogoItem?.width?.trim() || '380px';
  const logoHeight = heroLogoItem?.height?.trim() || '190px';
  const logoFitClass = heroLogoItem?.objectFit === 'cover' ? 'object-cover' : 'object-contain';
  const logoJustifyClass =
    heroLogoItem?.alignment === 'left'
      ? 'justify-start'
      : heroLogoItem?.alignment === 'right'
      ? 'justify-end'
      : 'justify-center';
  const logoSpacing =
    heroLogoItem && Number.isFinite(heroLogoItem.spacing)
      ? Math.max(0, Math.min(heroLogoItem.spacing, 48))
      : 12;

  const firstSlide = content.heroSlides?.[0];
  const headline =
    content.siteMeta?.subtitle || firstSlide?.title || 'สืบศิลป์ถิ่นอักษร สืบสุนทรภาษาไทย';
  const academicYear = content.siteMeta?.academicYear || 'ปีการศึกษา ๒๕๖๙';

  // Ensure description never repeats the single-line project name verbatim
  const rawSubtitle = (firstSlide?.subtitle || '').trim();
  const isDuplicateProjectName =
    !rawSubtitle || rawSubtitle.startsWith('โครงการส่งเสริมและพัฒนาความรู้ความสามารถด้านภาษาไทย');
  const conciseDescription = isDuplicateProjectName
    ? 'กลุ่มสาระการเรียนรู้ภาษาไทย โรงเรียนกระทุ่มแบน "วิเศษสมุทคุณ" · ส่งเสริมทักษะการอ่าน วรรณคดี และหลักภาษาไทยสู่ความเป็นเลิศ'
    : rawSubtitle;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#3A1B66] via-[#4B267D] to-[#613799] text-white border-b-2 border-[#D6AF55]/50">
      {/* Subtle architectural academic illumination & Thai golden border hairline */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(244,228,181,0.16),transparent_58%),radial-gradient(ellipse_at_bottom,rgba(214,175,85,0.12),transparent_65%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#D6AF55]/70 to-transparent"
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16">
        <div className="flex flex-col items-center text-center">
          {/* 1. Prominent Centered Project Logo (No oversized bulky box, clean object-contain, zero public error notices) */}
          {isHeroLogoVisible && (
            <div
              style={{ marginBottom: `${logoSpacing}px` }}
              className={`w-full flex ${logoJustifyClass} animate-wsk-fade-in`}
            >
              <div
                style={{
                  width: logoWidth,
                  maxWidth: '100%',
                  height: logoHeight !== 'auto' ? logoHeight : undefined,
                }}
                className="relative max-w-full flex items-center justify-center"
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-8 inset-y-4 rounded-full bg-[#F4E4B5]/12 blur-2xl"
                />
                <SmartImage
                  src={resolvedHeroSrc}
                  alt={`โลโก้โครงการ ${headline}`}
                  fallbackType="heroLogo"
                  className={`relative w-full h-full max-w-full ${logoFitClass} drop-shadow-[0_8px_22px_rgba(20,8,40,0.45)]`}
                  containerClassName="w-full h-full flex items-center justify-center bg-transparent"
                />
              </div>
            </div>
          )}

          {/* 2. Single-Line Project Name + Academic Year Kicker */}
          <p className="animate-wsk-fade-up animate-wsk-delay-1 text-xs sm:text-sm md:text-[15px] font-['Prompt'] font-medium text-[#F4E4B5] tracking-wide md:whitespace-nowrap max-w-full">
            โครงการส่งเสริมและพัฒนาความรู้ความสามารถด้านภาษาไทย · {academicYear}
          </p>

          {/* 3. Main Activity Headline */}
          <h1 className="animate-wsk-fade-up animate-wsk-delay-1 mt-3 text-3xl sm:text-4xl lg:text-[2.95rem] font-['Prompt'] font-bold text-white tracking-tight leading-[1.18] text-balance drop-shadow-xs">
            {headline}
          </h1>

          {/* Subtle Thai Academic Divider */}
          <div className="animate-wsk-fade-up animate-wsk-delay-2 my-4">
            <ThaiOrnament variant="dark" />
          </div>

          {/* 4. Concise Activity Description */}
          <p className="animate-wsk-fade-up animate-wsk-delay-2 text-sm sm:text-base lg:text-[17px] text-white/90 font-['Sarabun'] leading-relaxed max-w-2xl mx-auto">
            {conciseDescription}
          </p>

          {/* 5. Three Centered Action Buttons */}
          <div className="animate-wsk-fade-up animate-wsk-delay-3 mt-7 flex flex-wrap items-center justify-center gap-3 sm:gap-4 font-['Prompt'] text-sm">
            <button
              type="button"
              onClick={() => onNavigate('exam')}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#D6AF55] via-[#E3C16E] to-[#C99C38] text-[#2A1845] font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 inline-flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-[#4B267D]" />
              <span>ทำแบบทดสอบออนไลน์</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('score')}
              className="px-5 py-3 rounded-xl bg-white/14 hover:bg-white/24 text-white font-semibold border border-[#F4E4B5]/40 hover:border-[#F4E4B5]/70 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 inline-flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4 text-[#F4E4B5]" />
              <span>ตรวจสอบคะแนน</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('certificate')}
              className="px-5 py-3 rounded-xl bg-[#7043A6]/45 hover:bg-[#7043A6]/70 text-[#FAF8FD] font-semibold border border-white/25 hover:border-[#D6AF55]/60 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 inline-flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Award className="w-4 h-4 text-[#F4E4B5]" />
              <span>ดาวน์โหลดเกียรติบัตร</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
