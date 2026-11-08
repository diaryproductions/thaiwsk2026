import React, { useState } from 'react';
import { Search, CheckCircle, XCircle, AlertTriangle, HelpCircle, User, Award, School } from 'lucide-react';
import { searchScore, ScoreSearchResult } from '../services/api';
import { SiteContent } from '../config/defaultContent';
import { APP_CONFIG } from '../config/constants';

interface ScorePageProps {
  content: SiteContent;
  isBackendConnected: boolean;
}

export const ScorePage: React.FC<ScorePageProps> = ({
  content,
  isBackendConnected,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [roomFilter, setRoomFilter] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchAttempted, setSearchAttempted] = useState(false);
  const [results, setResults] = useState<ScoreSearchResult[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [requiresRefinement, setRequiresRefinement] = useState(false);
  const [totalMatches, setTotalMatches] = useState(0);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    if (query.length < 2) {
      setErrorMessage('กรุณาระบุชื่อค้นหาอย่างน้อย ๒ ตัวอักษร');
      return;
    }

    setIsSearching(true);
    setSearchAttempted(true);
    setErrorMessage(null);
    setRequiresRefinement(false);
    setResults([]);

    try {
      const response = await searchScore({
        query,
        grade: gradeFilter || undefined,
        room: roomFilter || undefined,
      });

      if (!response.isBackendConnected) {
        setErrorMessage(
          response.message ||
            'ยังไม่ได้เชื่อมต่อฐานข้อมูล Google Sheets ผ่าน Cloudflare Worker API'
        );
        return;
      }

      if (response.requiresRefinement) {
        setRequiresRefinement(true);
        setTotalMatches(response.totalMatches || 0);
        setErrorMessage(
          `พบข้อมูลผู้มีชื่อคล้ายกัน ${response.totalMatches} คน เพื่อความปลอดภัยและความถูกต้อง กรุณาระบุระดับชั้นและห้องเรียนเพิ่มเติม`
        );
        return;
      }

      if (response.success && response.data && response.data.length > 0) {
        setResults(response.data);
      } else {
        setErrorMessage(response.message || 'ไม่พบข้อมูลที่ตรงกับการค้นหา');
      }
    } catch (err: any) {
      setErrorMessage(`เกิดข้อผิดพลาดในการค้นหา: ${err?.message || 'Network error'}`);
    } finally {
      setIsSearching(false);
    }
  };

  const handleReset = () => {
    setSearchQuery('');
    setGradeFilter('');
    setRoomFilter('');
    setSearchAttempted(false);
    setResults([]);
    setErrorMessage(null);
    setRequiresRefinement(false);
  };

  return (
    <div className="py-12 px-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 text-xs font-['Prompt'] font-semibold text-[#7043A6] bg-white px-3 py-1 rounded-full border border-[#7043A6]/20 mb-3 shadow-xs">
          <CheckCircle className="w-3.5 h-3.5 text-[#D6AF55]" />
          <span>ระบบตรวจสอบผลการประเมิน</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-['Prompt'] font-bold text-[#4B267D] tracking-tight">
          ระบบตรวจสอบคะแนนสอบ
        </h1>
        <p className="text-base font-['Sarabun'] text-slate-600 mt-2">
          ค้นหาคะแนนสอบและผลการประเมินจากแผ่นงาน &quot;{APP_CONFIG.SCORE_SHEET}&quot;
        </p>
      </div>

      {/* Backend Status Advisory if not connected */}
      {!isBackendConnected && (
        <div className="max-w-3xl mx-auto mb-8 bg-amber-50/80 border border-amber-300 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 text-xs sm:text-sm text-amber-900 font-['Sarabun']">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-['Prompt'] font-semibold text-amber-950">
              สถานะ: ยังไม่ได้เชื่อมต่อ Cloudflare Worker API Gateway
            </div>
            <p>
              ระบบการค้นหาจริงต้องเชื่อมต่อกับ Google Sheets ID: <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono text-xs">{APP_CONFIG.SPREADSHEET_ID}</code> ผ่าน Cloudflare Worker Backend ตามข้อกำหนดความปลอดภัย (ห้ามฝัง Service Account Key ไว้ใน Frontend)
            </p>
            <p className="text-amber-800 text-[11px] pt-1">
              แอดมินสามารถกำหนด Backend URL ได้ที่เมนู <strong>&quot;สำหรับแอดมิน&quot;</strong> หรือดูคู่มือการตั้งค่าใน <code>docs/BACKEND.md</code>
            </p>
          </div>
        </div>
      )}

      {/* Search Input Box */}
      <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-10">
        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label className="block text-xs font-['Prompt'] font-semibold text-[#30283A] mb-1.5">
              ค้นหาด้วยชื่อ-นามสกุล ของนักเรียนผู้เข้าสอบ
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="เช่น กานดา, สมชาย ใจดี, ด.ช.วิเศษ (รองรับทั้งมีและไม่มีคำนำหน้า)"
                className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-300 focus:border-[#7043A6] focus:ring-2 focus:ring-[#7043A6]/20 font-['Prompt'] text-sm sm:text-base text-[#30283A] placeholder:text-slate-400 outline-none transition-all"
              />
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
            <p className="text-[11px] font-['Sarabun'] text-slate-500 mt-1">
              * รองรับคำนำหน้า: นาย, นาง, นางสาว, เด็กชาย, เด็กหญิง, ด.ช., ด.ญ. (ไม่ต้องใส่รหัสผ่านหรือเลขประจำตัว)
            </p>
          </div>

          {/* Optional Refinement Filters (Grade & Room) */}
          {(requiresRefinement || searchQuery.length > 0) && (
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-['Prompt'] font-medium text-slate-600 mb-1">
                  ระดับชั้น (ระบุเมื่อต้องการกรองเฉพาะ)
                </label>
                <select
                  value={gradeFilter}
                  onChange={(e) => setGradeFilter(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-xs sm:text-sm font-['Prompt'] text-slate-700 bg-white focus:border-[#7043A6] outline-none"
                >
                  <option value="">ทุกระดับชั้น</option>
                  <option value="ม.1">มัธยมศึกษาปีที่ ๑ (ม.๑)</option>
                  <option value="ม.2">มัธยมศึกษาปีที่ ๒ (ม.๒)</option>
                  <option value="ม.3">มัธยมศึกษาปีที่ ๓ (ม.๓)</option>
                  <option value="ม.4">มัธยมศึกษาปีที่ ๔ (ม.๔)</option>
                  <option value="ม.5">มัธยมศึกษาปีที่ ๕ (ม.๕)</option>
                  <option value="ม.6">มัธยมศึกษาปีที่ ๖ (ม.๖)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-['Prompt'] font-medium text-slate-600 mb-1">
                  ห้องเรียน (เช่น 1, 2, 8)
                </label>
                <input
                  type="text"
                  value={roomFilter}
                  onChange={(e) => setRoomFilter(e.target.value)}
                  placeholder="เช่น 1 หรือ 8"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm font-['Prompt'] text-slate-700 bg-white focus:border-[#7043A6] outline-none"
                />
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 font-['Prompt'] text-xs sm:text-sm">
            {searchAttempted && (
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              >
                ล้างข้อมูล
              </button>
            )}
            <button
              type="submit"
              disabled={isSearching || !searchQuery.trim()}
              className="px-6 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-[#4B267D] to-[#7043A6] hover:from-[#30283A] hover:to-[#4B267D] shadow-sm hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSearching ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>กำลังค้นหา...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>ค้นหาคะแนนสอบ</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Results Section */}
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Error / Not Found Message */}
        {errorMessage && (
          <div className="bg-white rounded-2xl border border-red-200 p-6 text-center shadow-xs">
            <XCircle className="w-10 h-10 text-red-500 mx-auto mb-2" />
            <h3 className="font-['Prompt'] font-bold text-base text-red-700">
              {errorMessage}
            </h3>
            {requiresRefinement && (
              <p className="text-xs font-['Sarabun'] text-slate-600 mt-2 max-w-md mx-auto">
                มีนักเรียนที่มีชื่อใกล้เคียงกันหลายคน กรุณาเลือกระดับชั้นหรือพิมพ์ห้องเรียน แล้วกดค้นหาใหม่อีกครั้ง
              </p>
            )}
          </div>
        )}

        {/* Found Score Result Cards */}
        {results.map((item, index) => {
          const isPassed =
            String(item.evaluation).trim().toLowerCase() === 'ผ่าน' ||
            String(item.evaluation).trim().toLowerCase() === 'pass';

          // Safe percentage computation: Only calculate if score is numeric
          const numericScore = typeof item.score === 'number' ? item.score : parseFloat(String(item.score));
          const hasValidNumericScore = !isNaN(numericScore) && isFinite(numericScore);
          const maxScore = item.maxScore || APP_CONFIG.MAX_SCORE_DEFAULT;
          const percentage = hasValidNumericScore ? Math.round((numericScore / maxScore) * 100) : null;

          return (
            <div
              key={index}
              className="bg-white rounded-3xl border border-[#D6AF55]/40 shadow-md overflow-hidden transition-all hover:shadow-lg"
            >
              {/* Card Header */}
              <div className="bg-gradient-to-r from-[#4B267D] to-[#7043A6] p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-[#D6AF55] shrink-0">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs font-['Prompt'] text-[#D6AF55]">
                      บัตรผลคะแนนรายบุคคล
                    </div>
                    <h3 className="text-xl sm:text-2xl font-['Prompt'] font-bold">
                      {item.fullName}
                    </h3>
                  </div>
                </div>

                {/* Direct Evaluation Result Badge */}
                <div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full font-['Prompt'] font-bold text-sm shadow-xs ${
                      isPassed
                        ? 'bg-emerald-500 text-white'
                        : 'bg-red-500 text-white'
                    }`}
                  >
                    {isPassed ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    <span>ผลการประเมิน: {item.evaluation}</span>
                  </span>
                </div>
              </div>

              {/* Card Detail Grid */}
              <div className="p-6 sm:p-8 space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-6 border-b border-slate-100 text-center font-['Prompt']">
                  <div className="bg-[#FAF8FD] p-3.5 rounded-xl border border-slate-100">
                    <div className="text-xs text-slate-500">เลขที่ (ลำดับ)</div>
                    <div className="text-lg font-bold text-[#30283A] mt-1 tabular-nums">
                      {item.number || '-'}
                    </div>
                  </div>

                  <div className="bg-[#FAF8FD] p-3.5 rounded-xl border border-slate-100">
                    <div className="text-xs text-slate-500">ระดับชั้น</div>
                    <div className="text-lg font-bold text-[#4B267D] mt-1">
                      {item.grade || '-'}
                    </div>
                  </div>

                  <div className="bg-[#FAF8FD] p-3.5 rounded-xl border border-slate-100">
                    <div className="text-xs text-slate-500">ห้องเรียน</div>
                    <div className="text-lg font-bold text-[#4B267D] mt-1 tabular-nums">
                      {item.room ? `ห้อง ${item.room}` : '-'}
                    </div>
                  </div>

                  <div className="bg-gradient-to-b from-[#FAF8FD] to-purple-50/50 p-3.5 rounded-xl border border-[#7043A6]/20">
                    <div className="text-xs text-[#7043A6] font-semibold">คะแนนที่ได้</div>
                    <div className="text-2xl font-bold text-[#4B267D] mt-0.5 tabular-nums">
                      {item.score}
                    </div>
                    {percentage !== null && (
                      <div className="text-[11px] text-slate-500 font-normal">
                        คิดเป็นร้อยละ {percentage}%
                      </div>
                    )}
                  </div>
                </div>

                {/* Academic Context & Guidance */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-['Sarabun'] text-slate-500">
                  <div className="flex items-center gap-2">
                    <School className="w-4 h-4 text-[#D6AF55]" />
                    <span>โรงเรียนกระทุ่มแบน &quot;วิเศษสมุทคุณ&quot;</span>
                  </div>
                  <div>
                    * ข้อมูลอ่านจากชีต &quot;{APP_CONFIG.SCORE_SHEET}&quot; คอลัมน์ E และ F โดยตรง
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Instructions Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3 font-['Sarabun']">
          <h4 className="text-sm font-['Prompt'] font-bold text-[#30283A] flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-[#D6AF55]" />
            <span>คำแนะนำและข้อกำหนดการตรวจสอบคะแนน</span>
          </h4>
          <ul className="space-y-1.5 text-xs text-slate-600">
            {content.instructions.scoreCheck.map((inst, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-[#D6AF55] font-bold">•</span>
                <span>{inst}</span>
              </li>
            ))}
            <li className="flex items-start gap-2">
              <span className="text-[#D6AF55] font-bold">•</span>
              <span>
                หากพบปัญหาคะแนนไม่ถูกต้องหรือสะกดชื่อผิดพลาด กรุณาติดต่อคุณครูผู้ดูแลระบบที่ห้องพักครูกลุ่มสาระการเรียนรู้ภาษาไทย
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
