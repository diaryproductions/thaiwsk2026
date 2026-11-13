import React from 'react';
import { BookOpen, Check, Feather, Sparkles, Users } from 'lucide-react';
import { SiteContent, ManagedSiteImage } from '../config/defaultContent';
import { SmartImage } from './SmartImage';
import { DynamicSectionImages } from './DynamicSectionImages';

interface AboutSectionProps {
  about: SiteContent['about'];
  managedImages?: ManagedSiteImage[];
}

export const AboutSection: React.FC<AboutSectionProps> = ({ about, managedImages }) => {
  if (!about) return null;

  const managedAboutMain = (managedImages || []).find((i) => i.id === 'img-about-main');
  const managedAboutTeacher = (managedImages || []).find((i) => i.id === 'img-about-teacher');

  const mainImgUrl =
    (managedAboutMain && managedAboutMain.isVisible !== false && managedAboutMain.url) ||
    about.imageUrl;
  const teacherImgUrl =
    (managedAboutTeacher && managedAboutTeacher.isVisible !== false && managedAboutTeacher.url) ||
    about.teacherImageUrl;
  const showMainImg = managedAboutMain ? managedAboutMain.isVisible !== false : true;
  const showTeacherImg = managedAboutTeacher ? managedAboutTeacher.isVisible !== false : Boolean(about.teacherImageUrl);

  return (
    <section className="py-16 px-4 bg-[#FAF8FD]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Image Collage */}
          <div className="lg:col-span-5 space-y-4">
            {showMainImg && (
              <div className="relative rounded-2xl overflow-hidden border-2 border-[#D6AF55]/50 shadow-md group bg-white">
                <SmartImage
                  src={mainImgUrl}
                  alt={about.title}
                  fallbackType="about"
                  className={`w-full h-72 sm:h-84 ${
                    managedAboutMain?.objectFit === 'contain' ? 'object-contain bg-[#FAF8FD]' : 'object-cover'
                  } object-center group-hover:scale-103 transition-transform duration-500`}
                  containerClassName="w-full h-72 sm:h-84"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2B154A]/80 via-black/15 to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-4 right-4 text-white pointer-events-none">
                  <span className="text-[11px] font-['Prompt'] font-semibold text-[#F4E4B5] uppercase tracking-wider">
                    กิจกรรมวิชาการ
                  </span>
                  <p className="text-sm font-['Prompt'] font-medium mt-0.5">
                    {managedAboutMain?.caption || 'บรรยากาศการวัดและประเมินผลความรู้ภาษาไทย'}
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl overflow-hidden border border-[#D6AF55]/35 shadow-xs h-36 bg-white group">
                <SmartImage
                  src={about.secondaryImageUrl}
                  alt="สุนทรภู่ มรดกวรรณกรรม"
                  fallbackType="contest"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  containerClassName="w-full h-full"
                />
              </div>

              {showTeacherImg && teacherImgUrl ? (
                <div className="rounded-xl overflow-hidden border border-[#D6AF55]/50 shadow-xs h-36 relative group bg-white">
                  <SmartImage
                    src={teacherImgUrl}
                    alt="คณะครูกลุ่มสาระการเรียนรู้ภาษาไทย"
                    fallbackType="teacher"
                    className={`w-full h-full ${
                      managedAboutTeacher?.objectFit === 'contain' ? 'object-contain bg-[#FAF8FD]' : 'object-cover'
                    } group-hover:scale-105 transition-transform duration-500`}
                    containerClassName="w-full h-full"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#2B154A]/80 to-transparent flex items-end p-2.5 pointer-events-none">
                    <span className="text-[11px] font-['Prompt'] font-semibold text-[#F4E4B5] truncate flex items-center gap-1">
                      <Users className="w-3 h-3 text-[#D6AF55]" />
                      <span>ครูผู้สอนภาษาไทย</span>
                    </span>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl bg-gradient-to-br from-[#4B267D] to-[#7043A6] border border-[#D6AF55]/40 text-white p-4 flex flex-col justify-between">
                  <Feather className="w-6 h-6 text-[#F4E4B5]" />
                  <div>
                    <div className="text-xs font-['Prompt'] text-[#F4E4B5]">สุนทรพจน์ &amp; วรรณศิลป์</div>
                    <div className="text-xs font-['Sarabun'] text-white/90 mt-1">เชิดชูเอกลักษณ์ภาษาชาติ</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Editorial Prose & Objectives */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-['Prompt'] font-semibold text-[#4B267D] bg-[#F4E4B5]/45 px-3 py-1 rounded-full border border-[#D6AF55]/50">
                <Sparkles className="w-3.5 h-3.5 text-[#8E661D]" />
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
              <div className="pt-4 border-t border-[#D6AF55]/30">
                <h4 className="text-sm font-['Prompt'] font-bold text-[#4B267D] mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#D6AF55]" />
                  <span>วัตถุประสงค์ของโครงการ</span>
                </h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {about.objectives.map((obj, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5 text-xs sm:text-sm font-['Sarabun'] text-slate-700 bg-white/80 p-3 rounded-xl border border-[#D6AF55]/25"
                    >
                      <span className="w-5 h-5 rounded-full bg-[#F4E4B5]/60 text-[#8E661D] flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-[#4B267D]" />
                      </span>
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Extra Admin-placed images in 'about' section */}
        <DynamicSectionImages
          items={managedImages}
          section="about"
          excludeIds={['img-about-main', 'img-about-teacher']}
          className="mt-8"
        />
      </div>
    </section>
  );
};
