import React, { useState, useRef } from 'react';
import {
  BookOpen,
  FileText,
  Youtube,
  ExternalLink,
  GraduationCap,
  ChevronDown,
  ChevronUp,
  PlayCircle,
  FolderOpen,
} from 'lucide-react';
import { StudyMaterial } from '../config/defaultContent';
import { extractYouTubeId } from '../utils/imageUrl';
import { ThaiOrnament } from './ThaiOrnament';
import { toArabicNumerals } from '../utils/thaiDigits';

interface StudyResourcesSectionProps {
  materials: StudyMaterial[];
}

export const StudyResourcesSection: React.FC<StudyResourcesSectionProps> = ({ materials }) => {
  const [selectedLevel, setSelectedLevel] = useState<'junior' | 'senior' | null>(null);
  const [typeFilter, setTypeFilter] = useState<'all' | 'pdf' | 'youtube'>('all');
  const listPanelRef = useRef<HTMLDivElement>(null);

  const activeMaterials = (materials || [])
    .filter((item) => item.isActive !== false)
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  const juniorItems = activeMaterials.filter((m) => m.level === 'junior');
  const seniorItems = activeMaterials.filter((m) => m.level === 'senior');

  const handleOpenCategory = (level: 'junior' | 'senior') => {
    if (selectedLevel === level) {
      setSelectedLevel(null);
      return;
    }
    setSelectedLevel(level);
    setTypeFilter('all');
    setTimeout(() => {
      listPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 80);
  };

  const categories = [
    {
      id: 'junior' as const,
      title: 'ศึกษาและทบทวนความรู้ด้านภาษาไทย ระดับมัธยมศึกษาตอนต้น (ม.1–ม.3)',
      shortLevel: 'ระดับมัธยมศึกษาตอนต้น (ม.1–ม.3)',
      subtitle: 'หลักภาษาไทย การอ่านจับใจความ วรรณคดีวิจักษ์ และวรรณคดีลำนำ ชั้น ม.1 – ม.3',
      items: juniorItems,
    },
    {
      id: 'senior' as const,
      title: 'ศึกษาและทบทวนความรู้ด้านภาษาไทย ระดับมัธยมศึกษาตอนปลาย (ม.4–ม.6)',
      shortLevel: 'ระดับมัธยมศึกษาตอนปลาย (ม.4–ม.6)',
      subtitle: 'หลักภาษาขั้นสูง การวิเคราะห์วรรณคดีและวรรณกรรม ทัศนะเชิงวรรณศิลป์ ชั้น ม.4 – ม.6',
      items: seniorItems,
    },
  ];

  const activeCategory = categories.find((c) => c.id === selectedLevel) || null;
  const visibleItems = activeCategory
    ? activeCategory.items.filter((m) => typeFilter === 'all' || m.type === typeFilter)
    : [];

  return (
    <section
      id="study-resources"
      className="py-14 sm:py-16 px-4 bg-white border-y border-[#D6AF55]/25"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-10 space-y-2.5">
          <p className="text-xs font-['Prompt'] font-semibold tracking-wider text-[#7043A6]">
            คลังสื่อการเรียนรู้และเตรียมความพร้อม
          </p>
          <h2 className="text-2xl sm:text-3xl font-['Prompt'] font-bold text-[#4B267D] tracking-tight text-balance">
            ศึกษาและทบทวนความรู้ด้านภาษาไทย
          </h2>
          <ThaiOrnament className="py-1" />
          <p className="text-sm sm:text-base font-['Sarabun'] text-slate-600 leading-relaxed">
            แหล่งเรียนรู้และทบทวนความรู้ด้านภาษาไทย เพื่อเตรียมความพร้อมก่อนเข้าร่วมการทดสอบความรู้ความสามารถด้านภาษาไทย
          </p>
        </div>

        {/* Two Modern Academic Category Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((cat) => {
            const isSelected = selectedLevel === cat.id;
            const pdfCount = cat.items.filter((m) => m.type === 'pdf').length;
            const ytCount = cat.items.filter((m) => m.type === 'youtube').length;

            return (
              <div
                key={cat.id}
                className={`bg-[#FAF8FD]/55 rounded-2xl p-6 sm:p-7 border transition-all duration-300 flex flex-col justify-between hover:-translate-y-0.5 ${
                  isSelected
                    ? 'border-[#4B267D] bg-white shadow-md ring-1 ring-[#D6AF55]/45'
                    : 'border-[#D6AF55]/30 hover:border-[#D6AF55] shadow-xs hover:shadow-md hover:bg-white'
                }`}
              >
              <div>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#FAF8FD] border border-[#7043A6]/20 flex items-center justify-center shrink-0">
                    <GraduationCap className="w-6 h-6 text-[#4B267D]" />
                  </div>
                  <div className="text-right text-xs font-['Prompt'] text-slate-500 tabular-nums">
                    <span>เอกสาร PDF {pdfCount}</span>
                    <span aria-hidden="true" className="mx-1.5 text-slate-300">
                      ·
                    </span>
                    <span>วิดีโอ {ytCount}</span>
                  </div>
                </div>

                <h3 className="font-['Prompt'] font-bold text-lg text-[#30283A] leading-snug text-balance">
                  {cat.title}
                </h3>
                <p className="text-sm font-['Sarabun'] text-slate-600 mt-2 leading-relaxed">
                  {cat.subtitle}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleOpenCategory(cat.id)}
                  className={`w-full py-2.5 px-4 rounded-xl text-sm font-['Prompt'] font-semibold transition-all flex items-center justify-center gap-2 ${
                    isSelected
                      ? 'bg-[#4B267D] text-white shadow-xs'
                      : 'bg-[#FAF8FD] text-[#4B267D] border border-[#7043A6]/25 hover:bg-[#4B267D] hover:text-white'
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-[#D6AF55]" />
                  <span>เข้าศึกษาและทบทวนความรู้</span>
                  {isSelected ? (
                    <ChevronUp className="w-4 h-4 ml-auto" />
                  ) : (
                    <ChevronDown className="w-4 h-4 ml-auto" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Expanded Material List Panel */}
      {activeCategory && (
        <div
          ref={listPanelRef}
          className="mt-8 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8"
        >
          {/* Panel Header & Type Filter */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div>
              <p className="text-xs font-['Prompt'] font-semibold text-[#7043A6]">
                รายการสื่อการเรียนรู้ทั้งหมด ({activeCategory.items.length} รายการ)
              </p>
              <h3 className="text-lg sm:text-xl font-['Prompt'] font-bold text-[#30283A] mt-0.5">
                {activeCategory.title}
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1 p-1 bg-[#FAF8FD] border border-slate-200 rounded-xl font-['Prompt'] text-xs">
                {[
                  { id: 'all' as const, label: 'ทั้งหมด' },
                  { id: 'pdf' as const, label: 'เอกสาร PDF' },
                  { id: 'youtube' as const, label: 'วิดีโอ YouTube' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setTypeFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap shrink-0 ${
                      typeFilter === tab.id
                        ? 'bg-[#4B267D] text-white shadow-2xs'
                        : 'text-slate-600 hover:text-[#4B267D]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setSelectedLevel(null)}
                className="px-3 py-1.5 rounded-xl text-xs font-['Prompt'] text-slate-500 hover:text-[#4B267D] hover:bg-slate-50 border border-slate-200 transition-colors whitespace-nowrap shrink-0"
              >
                ปิดรายการ
              </button>
            </div>
          </div>

          {/* Material Grid or Empty State */}
          {visibleItems.length === 0 ? (
            <div className="py-12 px-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#FAF8FD] border border-slate-200 flex items-center justify-center mx-auto mb-3 text-[#7043A6]">
                <FolderOpen className="w-6 h-6" />
              </div>
              <p className="font-['Prompt'] font-semibold text-base text-[#30283A]">
                ยังไม่มีสื่อการเรียนรู้ในหมวดนี้
              </p>
              <p className="text-xs font-['Sarabun'] text-slate-500 mt-1">
                {typeFilter !== 'all'
                  ? 'ลองเลือกแสดงสื่อทั้งหมด หรือรอผู้ดูแลระบบเพิ่มสื่อการเรียนรู้เพิ่มเติม'
                  : 'ผู้ดูแลระบบสามารถเพิ่มเอกสาร PDF หรือวิดีโอ YouTube ได้ผ่านหน้า Admin Dashboard'}
              </p>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {visibleItems.map((item) => {
                const isPdf = item.type === 'pdf';
                const ytId = !isPdf ? extractYouTubeId(item.url) : null;
                const levelLabel =
                  item.level === 'junior'
                    ? 'ระดับมัธยมศึกษาตอนต้น (ม.1–ม.3)'
                    : 'ระดับมัธยมศึกษาตอนปลาย (ม.4–ม.6)';

                return (
                  <article
                    key={item.id}
                    className="rounded-2xl border border-slate-200 bg-[#FAF8FD]/60 hover:bg-white hover:border-[#D6AF55] transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-2xs hover:shadow-sm"
                  >
                    <div>
                      {/* Media Visual Header: YouTube Thumbnail or Academic Document Strip */}
                      {!isPdf && ytId ? (
                        <div className="relative aspect-video bg-slate-900 overflow-hidden border-b border-slate-200">
                          <img
                            src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`}
                            alt={item.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-red-600/95 text-white flex items-center justify-center shadow-md">
                              <PlayCircle className="w-6 h-6" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="px-5 pt-5 flex items-center gap-3">
                          <div
                            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
                              isPdf
                                ? 'bg-amber-50 border-amber-200 text-amber-800'
                                : 'bg-red-50 border-red-200 text-red-700'
                            }`}
                          >
                            {isPdf ? (
                              <FileText className="w-5 h-5" />
                            ) : (
                              <Youtube className="w-5 h-5" />
                            )}
                          </div>
                          <div className="text-xs font-['Prompt'] text-slate-500 leading-tight">
                            <span className="font-semibold text-[#4B267D]">
                              {isPdf ? 'เอกสาร PDF' : 'วิดีโอ YouTube'}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="p-5 space-y-2">
                        {/* Clean Unboxed Metadata */}
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-['Prompt'] text-[#7043A6]">
                          <span>{levelLabel}</span>
                          <span aria-hidden="true" className="text-slate-300">
                            ·
                          </span>
                          <span className="inline-flex items-center gap-1 text-slate-600">
                            {isPdf ? (
                              <FileText className="w-3.5 h-3.5 text-amber-700" />
                            ) : (
                              <Youtube className="w-3.5 h-3.5 text-red-600" />
                            )}
                            <span>{isPdf ? 'PDF' : 'YouTube'}</span>
                          </span>
                        </div>

                        <h4 className="font-['Prompt'] font-bold text-base text-[#30283A] leading-snug">
                          {toArabicNumerals(item.title)}
                        </h4>

                        {item.description && (
                          <p className="text-sm font-['Sarabun'] text-slate-600 leading-relaxed line-clamp-3">
                            {toArabicNumerals(item.description)}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="px-5 pb-5 pt-2">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`w-full py-2.5 px-4 rounded-xl text-xs font-['Prompt'] font-semibold transition-all inline-flex items-center justify-center gap-2 whitespace-nowrap ${
                          isPdf
                            ? 'bg-[#4B267D] hover:bg-[#30283A] text-white shadow-xs'
                            : 'bg-gradient-to-r from-[#D6AF55] to-[#C99C38] hover:brightness-105 text-[#30283A] shadow-xs'
                        }`}
                      >
                        {isPdf ? (
                          <FileText className="w-4 h-4 text-[#D6AF55]" />
                        ) : (
                          <Youtube className="w-4 h-4 text-[#4B267D]" />
                        )}
                        <span>{isPdf ? 'เปิดเอกสาร PDF' : 'รับชมวิดีโอ'}</span>
                        <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}
      </div>
    </section>
  );
};
