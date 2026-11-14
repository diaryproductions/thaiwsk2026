import React from 'react';
import { BookOpen, Check, Sparkles } from 'lucide-react';
import { SiteContent } from '../config/defaultContent';
import { ThaiOrnament } from './ThaiOrnament';
import { toArabicNumerals } from '../utils/thaiDigits';

interface AboutSectionProps {
  about: SiteContent['about'];
}

export const AboutSection: React.FC<AboutSectionProps> = ({ about }) => {
  if (!about) return null;

  return (
    <section className="py-16 px-4 bg-[#FAF8FD]">
      <div className="max-w-4xl mx-auto">
        {/* Centered Header */}
        <div className="text-center max-w-3xl mx-auto space-y-2.5 mb-8">
          <div className="inline-flex items-center gap-1.5 text-xs font-['Prompt'] font-semibold text-[#4B267D] bg-[#F4E4B5]/45 px-3.5 py-1 rounded-full border border-[#D6AF55]/50">
            <Sparkles className="w-3.5 h-3.5 text-[#8E661D]" />
            <span>วิสัยทัศน์และการพัฒนาผู้เรียน</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-['Prompt'] font-bold text-[#4B267D] tracking-tight text-balance">
            {toArabicNumerals(about.title)}
          </h2>
          <ThaiOrnament className="py-1" />
          <p className="text-base sm:text-lg font-['Prompt'] font-medium text-[#7043A6] leading-relaxed text-balance">
            {toArabicNumerals(about.leadText)}
          </p>
        </div>

        {/* Centered Editorial Container (No Decorative Images) */}
        <div className="bg-white rounded-3xl border border-[#D6AF55]/35 shadow-sm p-6 sm:p-10 space-y-8">
          <div className="max-w-3xl mx-auto space-y-4 font-['Sarabun'] text-slate-700 leading-relaxed text-sm sm:text-base text-center sm:text-left">
            {(about.bodyParagraphs || []).map((p, idx) => (
              <p key={idx}>{toArabicNumerals(p)}</p>
            ))}
          </div>

          {/* Objectives */}
          {about.objectives && about.objectives.length > 0 && (
            <div className="pt-6 border-t border-[#D6AF55]/30">
              <h4 className="text-sm font-['Prompt'] font-bold text-[#4B267D] mb-4 flex items-center justify-center gap-2">
                <BookOpen className="w-4 h-4 text-[#D6AF55]" />
                <span>วัตถุประสงค์ของโครงการ</span>
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {about.objectives.map((obj, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 text-xs sm:text-sm font-['Sarabun'] text-slate-700 bg-[#FAF8FD] p-3.5 rounded-xl border border-[#D6AF55]/25"
                  >
                    <span className="w-5 h-5 rounded-full bg-[#F4E4B5]/60 text-[#8E661D] flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-[#4B267D]" />
                    </span>
                    <span className="leading-relaxed">{toArabicNumerals(obj)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
