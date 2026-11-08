import React from 'react';
import { Award, ShieldCheck } from 'lucide-react';
import { AwardCriterion } from '../config/defaultContent';

interface AwardCriteriaProps {
  criteria: AwardCriterion[];
}

export const AwardCriteria: React.FC<AwardCriteriaProps> = ({ criteria }) => {
  // Filter active criteria and sort by sortOrder
  const activeCriteria = (criteria || [])
    .filter((c) => c.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  if (activeCriteria.length === 0) {
    return null;
  }

  const getCardStyle = (grade: AwardCriterion['colorGrade']) => {
    switch (grade) {
      case 'gold':
        return {
          border: 'border-[#D6AF55]/60 hover:border-[#D6AF55]',
          bgGradient: 'from-[#FAF8FD] to-amber-50/50',
          badgeBg: 'bg-[#D6AF55]/15 text-[#997324] border-[#D6AF55]/40',
          iconColor: 'text-[#D6AF55]',
          barColor: 'bg-[#D6AF55]',
        };
      case 'silver':
        return {
          border: 'border-slate-300 hover:border-slate-400',
          bgGradient: 'from-[#FAF8FD] to-slate-50',
          badgeBg: 'bg-slate-100 text-slate-700 border-slate-300',
          iconColor: 'text-slate-500',
          barColor: 'bg-slate-400',
        };
      case 'bronze':
        return {
          border: 'border-amber-700/30 hover:border-amber-700/50',
          bgGradient: 'from-[#FAF8FD] to-orange-50/40',
          badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
          iconColor: 'text-amber-700',
          barColor: 'bg-amber-700',
        };
      case 'honor':
      default:
        return {
          border: 'border-[#7043A6]/30 hover:border-[#7043A6]/50',
          bgGradient: 'from-[#FAF8FD] to-purple-50/30',
          badgeBg: 'bg-[#7043A6]/10 text-[#4B267D] border-[#7043A6]/30',
          iconColor: 'text-[#7043A6]',
          barColor: 'bg-[#7043A6]',
        };
    }
  };

  return (
    <section className="py-14 px-4 bg-white border-y border-slate-100">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-['Prompt'] font-semibold text-[#7043A6] bg-[#FAF8FD] px-3 py-1 rounded-full border border-[#7043A6]/20 mb-2">
            <Award className="w-3.5 h-3.5 text-[#D6AF55]" />
            <span>เกณฑ์การประเมินมาตรฐาน</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-['Prompt'] font-bold text-[#4B267D]">
            เกณฑ์การได้รับเกียรติบัตรและรางวัล
          </h2>
          <p className="text-sm font-['Sarabun'] text-slate-600 mt-2">
            กำหนดระดับผลการประเมินและเกียรติบัตรเชิดชูเกียรติสำหรับผู้เข้าร่วมโครงการ
          </p>
        </div>

        {/* Dynamic Cards: Flex wrap with justify-center so it auto-centers when card count decreases */}
        <div className="flex flex-wrap justify-center gap-6">
          {activeCriteria.map((item) => {
            const style = getCardStyle(item.colorGrade);
            return (
              <div
                key={item.id}
                className={`w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] min-w-[260px] max-w-[320px] rounded-2xl p-6 bg-gradient-to-b ${style.bgGradient} border ${style.border} shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-white shadow-xs border border-slate-100 flex items-center justify-center">
                      <Award className={`w-5 h-5 ${style.iconColor}`} />
                    </div>
                    <span className={`text-xs font-['Prompt'] font-semibold px-2.5 py-0.5 rounded-full border ${style.badgeBg}`}>
                      {item.percentageText}
                    </span>
                  </div>

                  <h3 className="font-['Prompt'] font-bold text-lg text-[#30283A]">
                    {item.title}
                  </h3>

                  <div className="mt-2 text-sm font-['Prompt'] font-semibold text-[#4B267D]">
                    {item.rangeText}
                  </div>

                  <p className="mt-2.5 text-xs font-['Sarabun'] text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-slate-200/60 flex items-center gap-2 text-xs font-['Sarabun'] text-slate-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#D6AF55]" />
                  <span>รับเกียรติบัตรฉบับอิเล็กทรอนิกส์</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
