import React from 'react';
import { BookOpen, Award, CheckCircle } from 'lucide-react';
import { SiteContent } from '../config/defaultContent';
import { ThaiOrnament } from './ThaiOrnament';
import { toArabicNumerals } from '../utils/thaiDigits';
import heroProjectLogo from '../assets/images/ครูไทยวิเศษฯ-2026 (1).png';

interface HeroSectionProps {
  content: SiteContent;
  onNavigate: (tab: 'exam' | 'score' | 'certificate' | 'admin') => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ content, onNavigate }) => {
  const academicYear = toArabicNumerals(content.siteMeta?.academicYear || 'ปีการศึกษา 2569');

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

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-9 sm:py-12 lg:py-14">
        <div className="flex flex-col items-center text-center">
          {/* 1. Prominent Centered Project Logo (700px x 180px on desktop, responsive object-contain) */}
          <div className="w-full max-w-[700px] h-[105px] sm:h-[145px] md:h-[180px] mx-auto mb-4 flex items-center justify-center animate-wsk-fade-in relative">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-10 inset-y-4 rounded-full bg-[#F4E4B5]/12 blur-2xl"
            />
            <img
              src={heroProjectLogo}
              alt="โลโก้โครงการ สืบศิลป์ถิ่นอักษร สืบสุนทรภาษาไทย"
              className="relative w-full h-full object-contain drop-shadow-[0_8px_22px_rgba(20,8,40,0.45)]"
            />
          </div>

          {/* 2. Single-Line Project Name + Academic Year Kicker (subordinate size) */}
          <p className="animate-wsk-fade-up animate-wsk-delay-1 text-xs sm:text-[13px] font-['Prompt'] font-medium text-[#F4E4B5] tracking-wide md:whitespace-nowrap max-w-full">
            โครงการส่งเสริมและพัฒนาความรู้ความสามารถด้านภาษาไทย · {academicYear}
          </p>

          {/* 3. Main Activity Headline (balanced smaller scale so project logo stands out) */}
          <h1 className="animate-wsk-fade-up animate-wsk-delay-1 mt-2 text-2xl sm:text-3xl lg:text-[2.15rem] font-['Prompt'] font-bold text-white tracking-tight leading-[1.2] text-balance drop-shadow-xs">
            สืบศิลป์ถิ่นอักษร สืบสุนทรภาษาไทย
          </h1>

          {/* Subtle Thai Academic Divider */}
          <div className="animate-wsk-fade-up animate-wsk-delay-2 my-3.5">
            <ThaiOrnament variant="dark" />
          </div>

          {/* 4. Concise Activity Description */}
          <p className="animate-wsk-fade-up animate-wsk-delay-2 text-xs sm:text-sm lg:text-[15px] text-white/90 font-['Sarabun'] leading-relaxed max-w-2xl mx-auto">
            กลุ่มสาระการเรียนรู้ภาษาไทย โรงเรียนกระทุ่มแบน &quot;วิเศษสมุทคุณ&quot; · ส่งเสริมทักษะการอ่าน วรรณคดี และหลักภาษาไทยสู่ความเป็นเลิศ
          </p>

          {/* 5. Three Centered Action Buttons */}
          <div className="animate-wsk-fade-up animate-wsk-delay-3 mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-4 font-['Prompt'] text-sm">
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
