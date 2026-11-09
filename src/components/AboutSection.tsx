import React from 'react';
import { BookOpen, Check, Feather, Sparkles, Users } from 'lucide-react';
import { SiteContent } from '../config/defaultContent';
import { SmartImage } from './SmartImage';

interface AboutSectionProps {
  about: SiteContent['about'];
}

export const AboutSection: React.FC<AboutSectionProps> = ({ about }) => {
  if (!about) return null;

  return (
    <section className="py-16 px-4 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Left Column: Image Collage */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative rounded-2xl overflow-hidden border border-[#D6AF55]/40 shadow-md group">
            <SmartImage
              src={about.imageUrl}
              alt={about.title}
              fallbackType="about"
              className="w-full h-72 sm:h-84 object-cover object-center group-hover:scale-102 transition-transform duration-500"
              containerClassName="w-full h-72 sm:h-84"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
            <div className="absolute bottom-4 left-4 right-4 text-white pointer-events-none">
              <span className="text-[11px] font-['Prompt'] font-semibold text-[#D6AF55] uppercase tracking-wider">
                กิจกรรมวิชาการ
              </span>
              <p className="text-sm font-['Prompt'] font-medium mt-0.5">
                บรรยากาศการวัดและประเมินผลความรู้ภาษาไทย
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl overflow-hidden border border-slate-200 shadow-xs h-36">
              <SmartImage
                src={about.secondaryImageUrl}
                alt="สุนทรภู่ มรดกวรรณกรรม"
                fallbackType="contest"
                className="w-full h-full object-cover"
                containerClassName="w-full h-full"
              />
            </div>
            
            {about.teacherImageUrl ? (
              <div className="rounded-xl overflow-hidden border border-[#D6AF55]/40 shadow-xs h-36 relative group">
                <SmartImage
                  src={about.teacherImageUrl}
                  alt="คณะครูกลุ่มสาระการเรียนรู้ภาษาไทย"
                  fallbackType="teacher"
                  className="w-full h-full object-cover"
                  containerClassName="w-full h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-2.5">
                  <span className="text-[11px] font-['Prompt'] font-semibold text-white truncate flex items-center gap-1">
                    <Users className="w-3 h-3 text-[#D6AF55]" />
                    <span>ครูผู้สอนภาษาไทย</span>
                  </span>
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-gradient-to-br from-[#4B267D] to-[#7043A6] text-white p-4 flex flex-col justify-between">
                <Feather className="w-6 h-6 text-[#D6AF55]" />
                <div>
                  <div className="text-xs font-['Prompt'] text-[#D6AF55]">สุนทรพจน์ &amp; วรรณศิลป์</div>
                  <div className="text-xs font-['Sarabun'] text-white/90 mt-1">เชิดชูเอกลักษณ์ภาษาชาติ</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Editorial Prose & Objectives */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-['Prompt'] font-semibold text-[#7043A6] bg-[#FAF8FD] px-3 py-1 rounded-full border border-[#7043A6]/20">
              <Sparkles className="w-3.5 h-3.5 text-[#D6AF55]" />
              <span>วิสัยทัศน์และการพัฒนาผู้เรียน</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-['Prompt'] font-bold text-[#4B267D] tracking-tight">
              {about.title}
            </h2>
            <p className="text-base font-['Prompt'] font-medium text-[#7043A6] leading-relaxed">
              {about.leadText}
            </p>
          </div>

          <div className="space-y-3 font-['Sarabun'] text-slate-700 leading-relaxed text-sm sm:text-base">
            {about.bodyParagraphs.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
          </div>

          {/* Objectives */}
          {about.objectives && about.objectives.length > 0 && (
            <div className="pt-2 border-t border-slate-100">
              <h4 className="text-sm font-['Prompt'] font-bold text-[#30283A] mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#D6AF55]" />
                <span>วัตถุประสงค์ของโครงการ</span>
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {about.objectives.map((obj, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm font-['Sarabun'] text-slate-600">
                    <span className="w-5 h-5 rounded-full bg-[#D6AF55]/15 text-[#997324] flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-[#D6AF55]" />
                    </span>
                    <span>{obj}</span>
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
