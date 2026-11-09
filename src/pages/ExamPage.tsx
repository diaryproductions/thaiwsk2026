import React, { useState } from 'react';
import { BookOpen, ExternalLink, AlertCircle, Clock, FileText, CheckCircle2 } from 'lucide-react';
import { SiteContent } from '../config/defaultContent';
import { SmartImage } from '../components/SmartImage';

interface ExamPageProps {
  content: SiteContent;
}

export const ExamPage: React.FC<ExamPageProps> = ({ content }) => {
  const [selectedLevelId, setSelectedLevelId] = useState<'junior' | 'senior'>('junior');

  const exams = content.exams || [];
  const currentExam = exams.find((e) => e.id === selectedLevelId) || exams[0];

  return (
    <div className="py-12 px-4 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 text-xs font-['Prompt'] font-semibold text-[#7043A6] bg-white px-3 py-1 rounded-full border border-[#7043A6]/20 mb-3 shadow-xs">
          <BookOpen className="w-3.5 h-3.5 text-[#D6AF55]" />
          <span>ระบบทำแบบทดสอบออนไลน์</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-['Prompt'] font-bold text-[#4B267D] tracking-tight">
          แบบทดสอบวัดความรู้ความสามารถด้านภาษาไทย
        </h1>
        <p className="text-base font-['Sarabun'] text-slate-600 mt-2.5">
          กิจกรรม &quot;สืบศิลป์ถิ่นอักษร สืบสุนทรภาษาไทย&quot; ประจำปีการศึกษา ๒๕๖๙
        </p>
      </div>

      {/* Level Selection Switch */}
      <div className="flex justify-center mb-10">
        <div className="inline-flex p-1.5 bg-white rounded-2xl border border-slate-200 shadow-xs max-w-md w-full">
          {exams.map((lvl) => {
            const isSelected = lvl.id === selectedLevelId;
            return (
              <button
                key={lvl.id}
                onClick={() => setSelectedLevelId(lvl.id)}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-['Prompt'] font-semibold transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#4B267D] to-[#7043A6] text-white shadow-sm'
                    : 'text-slate-600 hover:text-[#4B267D] hover:bg-slate-50'
                }`}
              >
                <div>{lvl.levelTitle}</div>
                <div className={`text-[11px] font-normal mt-0.5 ${isSelected ? 'text-[#D6AF55]' : 'text-slate-600'}`}>
                  {lvl.grades}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Exam Card */}
      {currentExam && (
        <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Card Top Banner with optional image background */}
          <div className="relative bg-gradient-to-r from-[#4B267D] via-[#7043A6] to-[#4B267D] p-6 sm:p-8 text-white overflow-hidden">
            {content.siteImages?.examBannerUrl && (
              <div className="absolute inset-0 opacity-15 pointer-events-none mix-blend-overlay">
                <SmartImage
                  src={content.siteImages.examBannerUrl}
                  alt="Exam Banner"
                  fallbackType="about"
                  className="w-full h-full object-cover"
                  containerClassName="w-full h-full"
                />
              </div>
            )}
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-['Prompt'] font-semibold text-[#D6AF55] tracking-wide uppercase">
                  {currentExam.grades}
                </span>
                <h2 className="text-2xl sm:text-3xl font-['Prompt'] font-bold mt-1">
                  {currentExam.levelTitle}
                </h2>
                <p className="text-sm font-['Sarabun'] text-white/80 mt-1 max-w-xl">
                  {currentExam.description}
                </p>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                <span className="px-3 py-1 rounded-full text-xs font-['Prompt'] font-semibold bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>{currentExam.isOpen ? 'เปิดระบบสอบ' : 'ปิดระบบสอบ'}</span>
                </span>
              </div>
            </div>

            {/* Metrics Ribbon */}
            <div className="mt-6 pt-6 border-t border-white/15 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-['Prompt']">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#D6AF55]" />
                <div>
                  <div className="text-white/60">เวลาทำแบบทดสอบ</div>
                  <div className="font-semibold">{currentExam.timeLimitMinutes} นาที</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#D6AF55]" />
                <div>
                  <div className="text-white/60">จำนวนข้อสอบ</div>
                  <div className="font-semibold">{currentExam.questionCount} ข้อ (๒๐ คะแนน)</div>
                </div>
              </div>
              <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
                <CheckCircle2 className="w-4 h-4 text-[#D6AF55]" />
                <div>
                  <div className="text-white/60">สิทธิ์การทำข้อสอบ</div>
                  <div className="font-semibold">ส่งคำตอบได้ ๑ ครั้ง</div>
                </div>
              </div>
            </div>
          </div>

          {/* Card Body & Instructions */}
          <div className="p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-base font-['Prompt'] font-bold text-[#30283A] mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#D6AF55]" />
                <span>คำชี้แจงในการทำแบบทดสอบ</span>
              </h3>
              <ul className="space-y-2.5 font-['Sarabun'] text-sm text-slate-700">
                {currentExam.instructions.map((inst, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#4B267D]/10 text-[#4B267D] font-['Prompt'] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{inst}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* General Precautions */}
            <div className="bg-[#FAF8FD] p-4 rounded-2xl border border-[#7043A6]/20 text-xs font-['Sarabun'] text-slate-600 space-y-1">
              <div className="font-semibold font-['Prompt'] text-[#4B267D] mb-1">
                ข้อแนะนำเพิ่มเติม:
              </div>
              <p>• เมื่อคลิกปุ่มด้านล่าง ระบบจะนำท่านไปยัง Google Forms ของแบบทดสอบ</p>
              <p>• หากใช้โทรศัพท์มือถือ แนะนำให้ล็อกอินบัญชี Google ในเบราว์เซอร์ให้เรียบร้อยก่อนเริ่มทำ</p>
              <p>• หากเกิดเหตุขัดข้องทางเทคนิค กรุณาแจ้งครูผู้ประสานงานประจำกลุ่มสาระฯ ภาษาไทย</p>
            </div>

            {/* Primary Action Button */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
              <div className="text-xs text-slate-600 font-['Sarabun']">
                * ระบบเชื่อมต่อกับ Google Forms อย่างเป็นทางการของโรงเรียน
              </div>

              {currentExam.isOpen ? (
                <a
                  href={currentExam.formUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-['Prompt'] font-bold text-sm text-white bg-gradient-to-r from-[#4B267D] to-[#7043A6] hover:from-[#30283A] hover:to-[#4B267D] shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 border border-[#D6AF55]/40"
                >
                  <span>เริ่มทำแบบทดสอบ {currentExam.levelTitle}</span>
                  <ExternalLink className="w-4 h-4 text-[#D6AF55]" />
                </a>
              ) : (
                <button
                  disabled
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-['Prompt'] font-bold text-sm text-slate-400 bg-slate-100 cursor-not-allowed"
                >
                  ระบบแบบทดสอบยังไม่เปิดให้บริการ
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
