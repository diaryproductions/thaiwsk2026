import React from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { ScheduleItem } from '../config/defaultContent';

interface ScheduleSectionProps {
  schedule: ScheduleItem[];
}

export const ScheduleSection: React.FC<ScheduleSectionProps> = ({ schedule }) => {
  const sorted = [...(schedule || [])].sort((a, b) => a.sortOrder - b.sortOrder);

  if (sorted.length === 0) return null;

  return (
    <section className="py-14 px-4 bg-[#FAF8FD] border-t border-slate-200/60">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-['Prompt'] font-semibold text-[#7043A6] bg-white px-3 py-1 rounded-full border border-[#7043A6]/20 mb-2">
            <Calendar className="w-3.5 h-3.5 text-[#D6AF55]" />
            <span>เส้นทางกิจกรรม</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-['Prompt'] font-bold text-[#4B267D]">
            กำหนดการสำคัญ
          </h2>
          <p className="text-sm font-['Sarabun'] text-slate-600 mt-2">
            ลำดับขั้นตอนการดำเนินกิจกรรมโครงการส่งเสริมและพัฒนาความรู้ความสามารถด้านภาษาไทย
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-4">
          {sorted.map((item, index) => {
            const isCompleted = item.status === 'completed';
            const isOngoing = item.status === 'ongoing';

            return (
              <div
                key={item.id || index}
                className={`bg-white rounded-2xl p-5 sm:p-6 border transition-all ${
                  isOngoing
                    ? 'border-[#D6AF55] shadow-md ring-1 ring-[#D6AF55]/40'
                    : 'border-slate-200 hover:border-[#7043A6]/40 shadow-xs'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#4B267D]/10 text-[#4B267D] font-['Prompt'] font-bold text-xs flex items-center justify-center shrink-0">
                        {index + 1}
                      </span>
                      <h3 className="text-base sm:text-lg font-['Prompt'] font-bold text-[#30283A]">
                        {item.topic}
                      </h3>
                    </div>

                    <p className="text-xs sm:text-sm font-['Sarabun'] text-slate-600 pl-8">
                      {item.description}
                    </p>
                  </div>

                  <div className="sm:text-right shrink-0 pl-8 sm:pl-0 space-y-1">
                    <div className="inline-flex items-center gap-1.5 text-xs font-['Prompt'] font-semibold text-[#4B267D] bg-[#FAF8FD] px-2.5 py-1 rounded-md border border-purple-100">
                      <Calendar className="w-3.5 h-3.5 text-[#D6AF55]" />
                      <span>{item.date}</span>
                    </div>

                    <div className="flex items-center sm:justify-end gap-3 text-xs text-slate-500 font-['Sarabun'] mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{item.time}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{item.location}</span>
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
