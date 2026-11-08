import React from 'react';
import { BookOpen, CheckCircle, Award, ArrowRight } from 'lucide-react';
import { NavTab } from './Navbar';

interface QuickActionsProps {
  onSelectTab: (tab: NavTab) => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onSelectTab }) => {
  const actions = [
    {
      tab: 'exam' as NavTab,
      title: 'ทำแบบทดสอบออนไลน์',
      subtitle: 'ระดับ ม.ต้น (ม.๑–๓) และ ม.ปลาย (ม.๔–๖)',
      description: 'เข้าสู่ข้อสอบออนไลน์ผ่านระบบ Google Forms เพื่อประเมินสมรรถนะความรู้ภาษาไทย',
      icon: BookOpen,
      iconColor: 'text-[#4B267D]',
      borderColor: 'border-[#7043A6]/30',
      badge: 'เปิดสอบตามกำหนดการ',
    },
    {
      tab: 'score' as NavTab,
      title: 'ตรวจสอบคะแนนสอบ',
      subtitle: 'ค้นหาด้วยชื่อ-นามสกุล',
      description: 'ตรวจสอบคะแนนและผลการประเมิน (ผ่าน/ไม่ผ่าน) ส่งตรงจากฐานข้อมูลจริงของโรงเรียน',
      icon: CheckCircle,
      iconColor: 'text-[#D6AF55]',
      borderColor: 'border-[#D6AF55]/40',
      badge: 'อัปเดตผลตามชีต',
    },
    {
      tab: 'certificate' as NavTab,
      title: 'เกียรติบัตรอิเล็กทรอนิกส์',
      subtitle: 'ดาวน์โหลดไฟล์ PDF คุณภาพสูง',
      description: 'พิมพ์และดาวน์โหลดเกียรติบัตรระดับเหรียญทอง เงิน ทองแดง และรางวัลชมเชย',
      icon: Award,
      iconColor: 'text-[#7043A6]',
      borderColor: 'border-[#7043A6]/30',
      badge: 'มีระบบเปิดดู PDF',
    },
  ];

  return (
    <section className="py-12 px-4 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.tab}
              onClick={() => {
                onSelectTab(act.tab);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-left group relative bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 hover:border-[#D6AF55] shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#FAF8FD] border border-slate-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Icon className={`w-6 h-6 ${act.iconColor}`} />
                  </div>
                  <span className="text-xs font-['Prompt'] text-[#7043A6] bg-[#FAF8FD] px-2.5 py-1 rounded-md border border-[#7043A6]/20">
                    {act.badge}
                  </span>
                </div>

                <h3 className="font-['Prompt'] font-bold text-lg text-[#30283A] group-hover:text-[#4B267D] transition-colors">
                  {act.title}
                </h3>
                <p className="text-xs font-['Prompt'] text-[#7043A6] font-medium mt-1">
                  {act.subtitle}
                </p>
                <p className="text-sm font-['Sarabun'] text-slate-600 mt-2.5 leading-relaxed">
                  {act.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-['Prompt'] font-semibold text-[#4B267D] group-hover:text-[#D6AF55] transition-colors">
                <span>เข้าสู่ระบบทันที</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
