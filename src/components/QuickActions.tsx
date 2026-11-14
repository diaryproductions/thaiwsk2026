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
      subtitle: 'ระดับ ม.ต้น (ม.1–3) และ ม.ปลาย (ม.4–6)',
      description: 'เข้าสู่ข้อสอบออนไลน์ผ่านระบบ Google Forms เพื่อประเมินสมรรถนะความรู้ภาษาไทย',
      icon: BookOpen,
      iconColor: 'text-[#4B267D]',
      accentBar: 'from-[#4B267D] to-[#7043A6]',
      badge: 'เปิดสอบตามกำหนดการ',
    },
    {
      tab: 'score' as NavTab,
      title: 'ตรวจสอบคะแนนสอบ',
      subtitle: 'ค้นหาด้วยชื่อ-นามสกุล',
      description: 'ตรวจสอบคะแนนและผลการประเมิน (ผ่าน/ไม่ผ่าน) ส่งตรงจากฐานข้อมูลจริงของโรงเรียน',
      icon: CheckCircle,
      iconColor: 'text-[#997324]',
      accentBar: 'from-[#D6AF55] to-[#C99C38]',
      badge: 'อัปเดตผลตามชีต',
    },
    {
      tab: 'certificate' as NavTab,
      title: 'เกียรติบัตรอิเล็กทรอนิกส์',
      subtitle: 'ดาวน์โหลดไฟล์ PDF คุณภาพสูง',
      description: 'พิมพ์และดาวน์โหลดเกียรติบัตรระดับเหรียญทอง เงิน ทองแดง และรางวัลชมเชย',
      icon: Award,
      iconColor: 'text-[#7043A6]',
      accentBar: 'from-[#7043A6] via-[#D6AF55] to-[#4B267D]',
      badge: 'มีระบบเปิดดู PDF',
    },
  ];

  return (
    <section className="py-12 px-4 bg-[#FAF8FD]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.tab}
              onClick={() => {
                onSelectTab(act.tab);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-left group relative bg-white rounded-2xl p-6 sm:p-7 border border-[#D6AF55]/30 hover:border-[#D6AF55] shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer"
            >
              <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${act.accentBar}`} />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#FAF8FD] border border-[#D6AF55]/35 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                    <Icon className={`w-6 h-6 ${act.iconColor}`} />
                  </div>
                  <span className="text-xs font-['Prompt'] text-[#4B267D] bg-[#F4E4B5]/45 px-2.5 py-1 rounded-md border border-[#D6AF55]/50 font-medium">
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

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-['Prompt'] font-semibold text-[#4B267D] group-hover:text-[#8E661D] transition-colors">
                <span>เข้าสู่ระบบทันที</span>
                <ArrowRight className="w-4 h-4 text-[#D6AF55] group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
