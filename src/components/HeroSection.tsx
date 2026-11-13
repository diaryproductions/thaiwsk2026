import React from 'react';
import { BookOpen, Award, CheckCircle, AlertTriangle, Settings } from 'lucide-react';
import { SiteContent } from '../config/defaultContent';
import { SmartImage } from './SmartImage';
import { isViewerPageUrl } from '../utils/imageUrl';

interface HeroSectionProps {
  content: SiteContent;
  onNavigate: (tab: 'exam' | 'score' | 'certificate' | 'admin') => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ content, onNavigate }) => {
  const heroLogoRaw = (content.siteImages?.heroLogoUrl || '').trim();
  const isViewerUrl = isViewerPageUrl(heroLogoRaw);
  const needsDirectLogoUrl = !heroLogoRaw || isViewerUrl;

  const firstSlide = content.heroSlides?.[0];
  const headline = content.siteMeta?.subtitle || firstSlide?.title || 'สืบศิลป์ถิ่นอักษร สืบสุนทรภาษาไทย';
  const projectLead =
    firstSlide?.subtitle ||
    'โครงการส่งเสริมและพัฒนาความรู้ความสามารถด้านภาษาไทย กลุ่มสาระการเรียนรู้ภาษาไทย โรงเรียนกระทุ่มแบน "วิเศษสมุทคุณ"';
  const academicYear = content.siteMeta?.academicYear || 'ปีการศึกษา ๒๕๖๙';

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#2B154A] via-[#4B267D] to-[#30283A] text-white border-b border-[#D6AF55]/30">
      {/* Subtle architectural academic background illumination (no noise, no slideshow) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(214,175,85,0.14),transparent_55%),radial-gradient(ellipse_at_bottom_left,rgba(112,67,166,0.28),transparent_60%)]"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Right on Desktop / Top on Mobile: Prominent Static Project Logo */}
          <div className="lg:col-span-5 lg:order-2 flex flex-col items-center">
            <div className="w-full max-w-md rounded-3xl bg-white/[0.07] backdrop-blur-md border border-[#D6AF55]/40 p-6 sm:p-8 shadow-xl flex flex-col items-center justify-center">
              <div className="w-full h-48 sm:h-60 lg:h-64 flex items-center justify-center">
                {!needsDirectLogoUrl ? (
                  <SmartImage
                    src={heroLogoRaw}
                    alt={`โลโก้โครงการ ${headline}`}
                    fallbackType="heroLogo"
                    className="w-full h-full object-contain drop-shadow-[0_6px_18px_rgba(0,0,0,0.35)]"
                    containerClassName="w-full h-full flex items-center justify-center"
                  />
                ) : (
                  <SmartImage
                    src="images/ครูไทยวิเศษฯ-2026 (1).png"
                    alt={`โลโก้โครงการ ${headline}`}
                    fallbackType="heroLogo"
                    className="w-full h-full object-contain drop-shadow-[0_6px_18px_rgba(0,0,0,0.35)]"
                    containerClassName="w-full h-full flex items-center justify-center"
                  />
                )}
              </div>

              {/* Clean Official Caption */}
              <div className="mt-4 pt-3 border-t border-white/10 w-full text-center">
                <p className="text-xs font-['Prompt'] font-medium text-[#D6AF55] tracking-wide">
                  {content.siteMeta?.title || 'THAI WSK 2026'} · {academicYear}
                </p>
              </div>
            </div>

            {/* Admin-only Direct Image URL status when pic.in.th viewer link cannot be resolved */}
            {needsDirectLogoUrl && (
              <div className="mt-3 w-full max-w-md rounded-xl bg-amber-950/60 border border-[#D6AF55]/40 px-3.5 py-2.5 text-[11px] font-['Sarabun'] text-amber-100 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-[#D6AF55] shrink-0 mt-0.5" />
                <div className="flex-1 leading-relaxed">
                  <span className="font-['Prompt'] font-semibold text-[#D6AF55]">
                    สถานะสำหรับผู้ดูแลระบบ:{' '}
                  </span>
                  {isViewerUrl ? (
                    <span>
                      ลิงก์ที่ระบุเป็นหน้าดูรูปภาพที่ไม่ใช่ Direct Image URL (หรือติดสิทธิ์เข้าสู่ระบบ) กรุณาใส่ Direct Image URL ที่ลงท้ายด้วย .png / .jpg ในหน้าแอดมิน
                    </span>
                  ) : (
                    <span>
                      ลิงก์ต้นทาง pic.in.th/image/VSp8m6 ติดหน้าเข้าสู่ระบบ (pic.in.th/login) จึงแสดงโลโก้โครงการชุดสำรองไว้ชั่วคราว — ผู้ดูแลสามารถใส่ Direct Image URL จริงได้ในหน้า Admin
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => onNavigate('admin')}
                    className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-['Prompt'] font-semibold text-[#D6AF55] hover:text-white underline underline-offset-2"
                  >
                    <Settings className="w-3 h-3" />
                    <span>ตั้งค่า Direct Image URL ในหน้าแอดมิน</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Left on Desktop / Bottom on Mobile: Academic Identity, Title & 3 Primary Actions */}
          <div className="lg:col-span-7 lg:order-1 space-y-6 text-center lg:text-left">
            {/* Unboxed Academic Metadata Kicker */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-2.5 gap-y-1 text-xs sm:text-sm font-['Prompt'] text-[#D6AF55] tracking-wide">
              <span>โครงการส่งเสริมและพัฒนาความรู้ความสามารถด้านภาษาไทย</span>
              <span aria-hidden="true" className="text-white/40">
                ·
              </span>
              <span className="text-white/85">{academicYear}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-[2.85rem] font-['Prompt'] font-bold text-white tracking-tight leading-[1.2] text-balance">
              {headline}
            </h1>

            {/* Subtitle / Project Context */}
            <p className="text-base sm:text-lg text-white/85 font-['Sarabun'] leading-relaxed max-w-2xl mx-auto lg:mx-0">
              {projectLead}
            </p>

            {/* Three Main Action Buttons (Preserved from original specification) */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3 font-['Prompt'] text-sm">
              <button
                type="button"
                onClick={() => onNavigate('exam')}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#D6AF55] to-[#C99C38] text-[#30283A] font-bold shadow-md hover:shadow-lg hover:brightness-105 active:scale-[0.98] transition-all inline-flex items-center gap-2 whitespace-nowrap shrink-0"
              >
                <BookOpen className="w-4 h-4 text-[#4B267D]" />
                <span>ทำแบบทดสอบออนไลน์</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('score')}
                className="px-5 py-3 rounded-xl bg-white/12 hover:bg-white/22 text-white font-medium border border-white/25 active:scale-[0.98] transition-all inline-flex items-center gap-2 whitespace-nowrap shrink-0"
              >
                <CheckCircle className="w-4 h-4 text-[#D6AF55]" />
                <span>ตรวจสอบคะแนน</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('certificate')}
                className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-[#FAF8FD] font-medium border border-white/20 active:scale-[0.98] transition-all inline-flex items-center gap-2 whitespace-nowrap shrink-0"
              >
                <Award className="w-4 h-4 text-[#D6AF55]" />
                <span>ดาวน์โหลดเกียรติบัตร</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
