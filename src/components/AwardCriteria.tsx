import React from 'react';
import { Award, ShieldCheck } from 'lucide-react';
import { AwardCriterion } from '../config/defaultContent';
import { ThaiOrnament } from './ThaiOrnament';
import { toArabicNumerals } from '../utils/thaiDigits';

interface AwardCriteriaProps {
  criteria: AwardCriterion[];
}

export const AwardCriteria: React.FC<AwardCriteriaProps> = ({ criteria }) => {
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
          border: 'border-[#D6AF55]/70 hover:border-[#D6AF55]',
          bgGradient: 'from-[#FAF8FD] via-white to-[#F4E4B5]/25',
          badgeBg: 'bg-[#F4E4B5]/60 text-[#7A530F] border-[#D6AF55]/60',
          iconColor: 'text-[#B88924]',
          topBar: 'from-[#D6AF55] to-[#B88924]',
        };
      case 'silver':
        return {
          border: 'border-slate-300 hover:border-slate-400',
          bgGradient: 'from-[#FAF8FD] via-white to-slate-50',
          badgeBg: 'bg-slate-100 text-slate-700 border-slate-300',
          iconColor: 'text-slate-500',
          topBar: 'from-slate-300 to-slate-500',
        };
      case 'bronze':
        return {
          border: 'border-amber-700/35 hover:border-amber-700/60',
          bgGradient: 'from-[#FAF8FD] via-white to-orange-50/45',
          badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
          iconColor: 'text-amber-700',
          topBar: 'from-amber-600 to-amber-800',
        };
      case 'honor':
      default:
        return {
          border: 'border-[#7043A6]/35 hover:border-[#7043A6]/65',
          bgGradient: 'from-[#FAF8FD] via-white to-purple-50/40',
          badgeBg: 'bg-[#7043A6]/12 text-[#4B267D] border-[#7043A6]/35',
          iconColor: 'text-[#7043A6]',
          topBar: 'from-[#4B267D] to-[#7043A6]',
        };
    }
  };

  return (
    <section className="py-14 px-4 bg-white border-y border-[#D6AF55]/30">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-['Prompt'] font-semibold text-[#4B267D] bg-[#F4E4B5]/45 px-3 py-1 rounded-full border border-[#D6AF55]/50 mb-2">
            <Award className="w-3.5 h-3.5 text-[#8E661D]" />
            <span>เกณฑ์การประเมินมาตรฐาน</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-['Prompt'] font-bold text-[#4B267D]">
            เกณฑ์การได้รับเกียรติบัตรและรางวัล
          </h2>
          <ThaiOrnament className="my-2.5" />
          <p className="text-sm font-['Sarabun'] text-slate-600 mt-1">
            กำหนดระดับผลการประเมินและเกียรติบัตรเชิดชูเกียรติสำหรับผู้เข้าร่วมโครงการ
          </p>
        </div>

        {/* Dynamic Cards */}
        <div className="flex flex-wrap justify-center gap-6">
          {activeCriteria.map((item) => {
            const style = getCardStyle(item.colorGrade);
            return (
              <div
                key={item.id}
                className={`relative overflow-hidden w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] min-w-[260px] max-w-[320px] rounded-2xl p-6 bg-gradient-to-b ${style.bgGradient} border ${style.border} shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between`}
              >
                <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${style.topBar}`} />
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-white shadow-xs border border-[#D6AF55]/30 flex items-center justify-center">
                      <Award className={`w-5 h-5 ${style.iconColor}`} />
                    </div>
                    <span className={`text-xs font-['Prompt'] font-semibold px-2.5 py-0.5 rounded-full border ${style.badgeBg}`}>
                      {toArabicNumerals(item.percentageText)}
                    </span>
                  </div>

                  <h3 className="font-['Prompt'] font-bold text-lg text-[#30283A]">
                    {toArabicNumerals(item.title)}
                  </h3>

                  <div className="mt-2 text-sm font-['Prompt'] font-semibold text-[#4B267D]">
                    {toArabicNumerals(item.rangeText)}
                  </div>

                  <p className="mt-2.5 text-xs font-['Sarabun'] text-slate-600 leading-relaxed">
                    {toArabicNumerals(item.description)}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-slate-200/70 flex items-center gap-2 text-xs font-['Sarabun'] text-slate-500">
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
