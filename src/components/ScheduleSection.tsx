import React from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { ScheduleItem } from '../config/defaultContent';
import { ThaiOrnament } from './ThaiOrnament';
import { toArabicNumerals } from '../utils/thaiDigits';

interface ScheduleSectionProps {
  schedule: ScheduleItem[];
}

export const ScheduleSection: React.FC<ScheduleSectionProps> = ({ schedule }) => {
  const sorted = [...(schedule || [])].sort((a, b) => a.sortOrder - b.sortOrder);

  if (sorted.length === 0) return null;

  return (
    <section className="py-14 px-4 bg-[#FAF8FD]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-['Prompt'] font-semibold text-[#4B267D] bg-white px-3 py-1 rounded-full border border-[#D6AF55]/50 mb-2 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-[#D6AF55]" />
            <span>เส้นทางกิจกรรม</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-['Prompt'] font-bold text-[#4B267D]">
            กำหนดการสำคัญ
          </h2>
          <ThaiOrnament className="my-2.5" />
          <p className="text-sm font-['Sarabun'] text-slate-600 mt-1">
            ลำดับขั้นตอนการดำเนินกิจกรรมโครงการส่งเสริมและพัฒนาความรู้ความสามารถด้านภาษาไทย
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-4">
          {sorted.map((item, index) => {
            const isOngoing = item.status === 'ongoing';

            return (
              <div
                key={item.id || index}
                className={`bg-white rounded-2xl p-5 sm:p-6 border transition-all duration-200 hover:shadow-md ${
                  isOngoing
                    ? 'border-[#D6AF55] shadow-md ring-1 ring-[#D6AF55]/45'
                    : 'border-slate-200 hover:border-[#D6AF55]/70 shadow-xs'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-full bg-[#4B267D] text-[#F4E4B5] border border-[#D6AF55]/50 font-['Prompt'] font-bold text-xs flex items-center justify-center shrink-0">
                        {index + 1}
                      </span>
                      <h3 className="text-base sm:text-lg font-['Prompt'] font-bold text-[#30283A]">
                        {toArabicNumerals(item.topic)}
                      </h3>
                    </div>

                    <p className="text-xs sm:text-sm font-['Sarabun'] text-slate-600 pl-9">
                      {toArabicNumerals(item.description)}
                    </p>
                  </div>

                  <div className="sm:text-right shrink-0 pl-9 sm:pl-0 space-y-1">
                    <div className="inline-flex items-center gap-1.5 text-xs font-['Prompt'] font-semibold text-[#4B267D] bg-[#F4E4B5]/40 px-2.5 py-1 rounded-md border border-[#D6AF55]/50">
                      <Calendar className="w-3.5 h-3.5 text-[#8E661D]" />
                      <span>{toArabicNumerals(item.date)}</span>
                    </div>

                    <div className="flex items-center sm:justify-end gap-3 text-xs text-slate-500 font-['Sarabun'] mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#7043A6]" />
                        <span>{toArabicNumerals(item.time)}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#D6AF55]" />
                        <span>{toArabicNumerals(item.location)}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
