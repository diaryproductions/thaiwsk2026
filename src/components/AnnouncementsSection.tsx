import React from 'react';
import { Bell, Pin, User, Calendar } from 'lucide-react';
import { AnnouncementItem, ManagedSiteImage } from '../config/defaultContent';
import { SmartImage } from './SmartImage';
import { DynamicSectionImages } from './DynamicSectionImages';

interface AnnouncementsSectionProps {
  announcements: AnnouncementItem[];
  managedImages?: ManagedSiteImage[];
}

export const AnnouncementsSection: React.FC<AnnouncementsSectionProps> = ({
  announcements,
  managedImages,
}) => {
  const activeItems = (announcements || [])
    .filter((a) => a.isActive)
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return a.sortOrder - b.sortOrder;
    });

  if (activeItems.length === 0) return null;

  return (
    <section className="py-14 px-4 bg-white border-t border-[#D6AF55]/30">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-4 border-b border-[#D6AF55]/25">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-['Prompt'] font-semibold text-[#4B267D] bg-[#F4E4B5]/45 px-3 py-1 rounded-full border border-[#D6AF55]/50 mb-2">
              <Bell className="w-3.5 h-3.5 text-[#8E661D]" />
              <span>ข่าวสารและประกาศ</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-['Prompt'] font-bold text-[#4B267D]">
              ประกาศจากคณะกรรมการดำเนินงาน
            </h2>
          </div>
          <p className="text-xs sm:text-sm font-['Sarabun'] text-slate-500">
            อัปเดตข้อมูลล่าสุดเกี่ยวกับการสอบและการรับเกียรติบัตร
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeItems.map((item) => (
            <div
              key={item.id}
              className={`rounded-2xl p-6 border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${
                item.isPinned
                  ? 'bg-gradient-to-br from-[#FAF8FD] to-white border-[#D6AF55]/70 shadow-sm'
                  : 'bg-white border-slate-200 hover:border-[#D6AF55]/60 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex flex-wrap items-center gap-2 text-xs font-['Prompt'] text-slate-500">
                  <span className="flex items-center gap-1 text-[#7043A6]">
                    <Calendar className="w-3.5 h-3.5 text-[#D6AF55]" />
                    <span>{item.date}</span>
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1 text-slate-600">
                    <User className="w-3.5 h-3.5" />
                    <span>{item.author}</span>
                  </span>
                </div>
                {item.isPinned && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-['Prompt'] font-semibold text-[#7A530F] bg-[#F4E4B5]/60 px-2.5 py-0.5 rounded-md border border-[#D6AF55]/60">
                    <Pin className="w-3 h-3" />
                    <span>ปักหมุด</span>
                  </span>
                )}
              </div>

              {item.imageUrl && (
                <div className="mb-3 rounded-xl overflow-hidden max-h-48 border border-slate-200">
                  <SmartImage
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-48 object-cover"
                    containerClassName="w-full h-48"
                  />
                </div>
              )}

              <h3 className="font-['Prompt'] font-bold text-base sm:text-lg text-[#30283A] mb-2 leading-snug">
                {item.title}
              </h3>

              <p className="font-['Sarabun'] text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {item.content}
              </p>
            </div>
          ))}
        </div>

        {/* Extra Admin-placed images in 'announcement' section */}
        <DynamicSectionImages
          items={managedImages}
          section="announcement"
          className="mt-8"
        />
      </div>
    </section>
  );
};
