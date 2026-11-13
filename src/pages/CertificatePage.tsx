import React, { useState } from 'react';
import {
  Search,
  Award,
  Eye,
  Download,
  XCircle,
  HelpCircle,
  School,
  Sparkles,
  Trophy,
  Medal,
  FileBadge,
} from 'lucide-react';
import { searchCertificate, CertificateSearchResult } from '../services/api';
import { CertificateModal } from '../components/CertificateModal';
import { SiteContent } from '../config/defaultContent';
import { APP_CONFIG } from '../config/constants';
import { SmartImage } from '../components/SmartImage';
import { getMedalTheme } from '../utils/medalTheme';

interface CertificatePageProps {
  content: SiteContent;
  isBackendConnected: boolean;
}

export const CertificatePage: React.FC<CertificatePageProps> = ({
  content,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [roomFilter, setRoomFilter] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchAttempted, setSearchAttempted] = useState(false);
  const [results, setResults] = useState<CertificateSearchResult[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activePreviewCert, setActivePreviewCert] = useState<CertificateSearchResult | null>(null);
  const [requiresRefinement, setRequiresRefinement] = useState(false);

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
      const response = await searchCertificate({
        query,
        grade: gradeFilter || undefined,
        room: roomFilter || undefined,
      });

      if (!response.isBackendConnected) {
        setErrorMessage('ระบบยังไม่สามารถเชื่อมต่อฐานข้อมูลได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง หรือติดต่อผู้ดูแลระบบ');
        return;
      }

      if (response.requiresRefinement) {
        setRequiresRefinement(true);
        setErrorMessage(
          `พบข้อมูลผู้มีชื่อคล้ายกัน ${response.totalMatches} คน กรุณาระบุระดับชั้นและห้องเพื่อความปลอดภัย`
        );
        return;
      }

      if (response.success && response.data && response.data.length > 0) {
        setResults(response.data);
      } else {
        setErrorMessage(response.message || 'ไม่พบข้อมูลที่ตรงกับการค้นหา');
      }
    } catch (err: any) {
      setErrorMessage('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง');
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

  const renderMedalIcon = (category: string, className: string) => {
    if (category === 'gold') return <Trophy className={className} />;
    if (category === 'silver' || category === 'bronze') return <Medal className={className} />;
    return <FileBadge className={className} />;
  };

  return (
    <div className="py-12 px-4 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 text-xs font-['Prompt'] font-semibold text-[#7043A6] bg-white px-3 py-1 rounded-full border border-[#D6AF55]/50 mb-3 shadow-xs">
          <Award className="w-3.5 h-3.5 text-[#D6AF55]" />
          <span>ระบบดาวน์โหลดเกียรติบัตรอิเล็กทรอนิกส์</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-['Prompt'] font-bold text-[#4B267D] tracking-tight">
          เกียรติบัตรอิเล็กทรอนิกส์
        </h1>
        <p className="text-base font-['Sarabun'] text-slate-600 mt-2">
          ค้นหาและดาวน์โหลดเกียรติบัตรจากแผ่นงาน &quot;{APP_CONFIG.CERTIFICATE_SHEET}&quot;
        </p>
      </div>

      {/* Decorative Banner if configured */}
      {content.siteImages?.certificateBannerUrl && (
        <div className="max-w-3xl mx-auto mb-6 rounded-2xl overflow-hidden shadow-xs border border-[#D6AF55]/40 h-32 sm:h-44 relative bg-slate-900">
          <SmartImage
            src={content.siteImages.certificateBannerUrl}
            alt="เกียรติบัตรอิเล็กทรอนิกส์"
            fallbackType="contest"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#2B154A]/75 via-transparent to-transparent flex items-end p-4">
            <span className="text-white font-['Prompt'] text-xs font-semibold drop-shadow-sm flex items-center gap-1.5">
              <Award className="w-4 h-4 text-[#F4E4B5]" />
              โครงการส่งเสริมและพัฒนาความรู้ความสามารถด้านภาษาไทย ๒๕๖๙
            </span>
          </div>
        </div>
      )}

      {/* Search Input Box */}
      <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-[#D6AF55]/35 shadow-sm p-6 sm:p-8 mb-10">
        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label className="block text-xs font-['Prompt'] font-semibold text-[#30283A] mb-1.5">
              ค้นหาด้วยชื่อ-นามสกุล ของนักเรียนผู้ได้รับเกียรติบัตร
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="เช่น กานดา, นายตัวอย่าง เกียรติบัตร, วิเศษสมุทคุณ"
                className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-300 focus:border-[#7043A6] focus:ring-2 focus:ring-[#7043A6]/20 font-['Prompt'] text-sm sm:text-base text-[#30283A] placeholder:text-slate-400 outline-none transition-all"
              />
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
            <p className="text-[11px] font-['Sarabun'] text-slate-500 mt-1">
              * รองรับคำนำหน้า เช่น ด.ช., ด.ญ., นาย, นางสาว โดยระบบจะตัดคำนำหน้าและเปรียบเทียบให้อัตโนมัติ
            </p>
          </div>

          {/* Optional Refinement Filters */}
          {(requiresRefinement || searchQuery.length > 0) && (
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-['Prompt'] font-medium text-slate-600 mb-1">
                  ระดับชั้น
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
                  ห้องเรียน
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

          {/* Search Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 font-['Prompt'] text-xs sm:text-sm">
            {searchAttempted && (
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                ล้างข้อมูล
              </button>
            )}
            <button
              type="submit"
              disabled={isSearching || !searchQuery.trim()}
              className="px-6 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-[#4B267D] to-[#7043A6] hover:from-[#30283A] hover:to-[#4B267D] shadow-sm hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
            >
              {isSearching ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>กำลังค้นหาเกียรติบัตร...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>ค้นหาเกียรติบัตร</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Results Section */}
      <div className="max-w-3xl mx-auto space-y-6">
        {errorMessage && (
          <div className="bg-white rounded-2xl border border-red-200 p-6 text-center shadow-xs">
            <XCircle className="w-10 h-10 text-red-500 mx-auto mb-2" />
            <h3 className="font-['Prompt'] font-bold text-base text-red-700">
              {errorMessage}
            </h3>
            {requiresRefinement && (
              <p className="text-xs font-['Sarabun'] text-slate-600 mt-2 max-w-md mx-auto">
                มีนักเรียนที่มีชื่อซ้ำกันหลายคน กรุณาระบุระดับชั้นหรือห้องเรียนเพื่อแสดงผล
              </p>
            )}
          </div>
        )}

        {results.map((item, index) => {
          const medalTheme = getMedalTheme(item.medal);
          const hasValidLink = Boolean(item.certificateUrl && item.certificateUrl.trim());
          const medalDisplay = (item.medal || '').trim() || '-';

          return (
            <div
              key={index}
              className="bg-white rounded-3xl border border-[#D6AF55]/50 shadow-md overflow-hidden hover:shadow-lg transition-all animate-wsk-fade-up"
            >
              {/* Card Top Identity */}
              <div className="bg-gradient-to-r from-[#4B267D] via-[#5F3498] to-[#7043A6] p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/12 border border-[#F4E4B5]/40 flex items-center justify-center text-[#F4E4B5] shrink-0">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs font-['Prompt'] text-[#F4E4B5] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>เกียรติบัตรฉบับอิเล็กทรอนิกส์</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-['Prompt'] font-bold">
                      {item.fullName}
                    </h3>
                  </div>
                </div>

                <div className="text-left sm:text-right text-xs font-['Prompt'] text-white/85">
                  <div>
                    ชั้น <strong className="text-[#F4E4B5]">{item.grade || '-'}</strong>
                    {item.room ? ` · ห้อง ${item.room}` : ''}
                  </div>
                </div>
              </div>

              {/* Prominent Award Highlight Banner (Strictly read from Column E) */}
              <div className="px-6 sm:px-8 pt-6">
                <div
                  className={`relative overflow-hidden rounded-2xl border-2 ${medalTheme.bannerBorder} ${medalTheme.bannerBg} p-4 sm:p-5 shadow-xs`}
                >
                  <div
                    className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${medalTheme.accentLine}`}
                  />
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border ${medalTheme.iconBg} flex items-center justify-center shrink-0 shadow-2xs`}
                      >
                        {renderMedalIcon(
                          medalTheme.category,
                          `w-6 h-6 sm:w-7 sm:h-7 ${medalTheme.iconColor}`
                        )}
                      </div>
                      <div>
                        <p className="text-[11px] sm:text-xs font-['Prompt'] font-semibold text-slate-600 uppercase tracking-wide">
                          ระดับรางวัล / เหรียญที่ได้รับ
                        </p>
                        <p
                          className={`text-lg sm:text-2xl font-['Prompt'] font-bold ${medalTheme.titleColor} mt-0.5`}
                        >
                          {medalDisplay}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl font-['Prompt'] font-bold text-xs sm:text-sm border shadow-xs ${medalTheme.badgeBg} self-start sm:self-center`}
                    >
                      {renderMedalIcon(medalTheme.category, 'w-4 h-4')}
                      <span>{medalDisplay}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Student Metadata & Actions */}
              <div className="p-6 sm:p-8 space-y-6">
                <div className="grid grid-cols-3 gap-4 pb-6 border-b border-slate-100 text-center font-['Prompt']">
                  <div className="bg-[#FAF8FD] p-3.5 rounded-xl border border-slate-200/70">
                    <div className="text-xs text-slate-500">เลขที่ (ลำดับ)</div>
                    <div className="text-base sm:text-lg font-bold text-[#30283A] mt-1 tabular-nums">
                      {item.number || '-'}
                    </div>
                  </div>

                  <div className="bg-[#FAF8FD] p-3.5 rounded-xl border border-slate-200/70">
                    <div className="text-xs text-slate-500">ระดับชั้น</div>
                    <div className="text-base sm:text-lg font-bold text-[#4B267D] mt-1">
                      {item.grade || '-'}
                    </div>
                  </div>

                  <div className="bg-[#FAF8FD] p-3.5 rounded-xl border border-slate-200/70">
                    <div className="text-xs text-slate-500">ห้องเรียน</div>
                    <div className="text-base sm:text-lg font-bold text-[#4B267D] mt-1 tabular-nums">
                      {item.room ? `ห้อง ${item.room}` : '-'}
                    </div>
                  </div>
                </div>

                {/* Download / Preview Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-xs font-['Sarabun'] text-slate-500">
                    <School className="w-4 h-4 text-[#D6AF55]" />
                    <span>โรงเรียนกระทุ่มแบน &quot;วิเศษสมุทคุณ&quot;</span>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto font-['Prompt'] text-xs sm:text-sm">
                    {hasValidLink ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setActivePreviewCert(item)}
                          className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-[#7043A6]/35 text-[#4B267D] hover:bg-[#FAF8FD] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Eye className="w-4 h-4 text-[#7043A6]" />
                          <span>เปิดดูเกียรติบัตร</span>
                        </button>

                        <a
                          href={item.downloadUrl || item.certificateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-[#4B267D] to-[#7043A6] hover:from-[#30283A] hover:to-[#4B267D] shadow-sm flex items-center justify-center gap-2"
                        >
                          <Download className="w-4 h-4 text-[#F4E4B5]" />
                          <span>ดาวน์โหลดเกียรติบัตร</span>
                        </a>
                      </>
                    ) : (
                      <div className="text-xs text-red-600 bg-red-50 px-4 py-2 rounded-xl border border-red-200">
                        ยังไม่สามารถดาวน์โหลดเกียรติบัตรได้ กรุณาติดต่อผู้ดูแลระบบ
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Guidance Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3 font-['Sarabun']">
          <h4 className="text-sm font-['Prompt'] font-bold text-[#30283A] flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-[#D6AF55]" />
            <span>คำแนะนำในการดาวน์โหลดเกียรติบัตร</span>
          </h4>
          <ul className="space-y-1.5 text-xs text-slate-600">
            {content.instructions.certificate.map((inst, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-[#D6AF55] font-bold">•</span>
                <span>{inst}</span>
              </li>
            ))}
            <li className="flex items-start gap-2">
              <span className="text-[#D6AF55] font-bold">•</span>
              <span>
                ระดับเหรียญจะอ่านจากชีต &quot;{APP_CONFIG.CERTIFICATE_SHEET}&quot; คอลัมน์ E โดยตรง ไม่มีการคำนวณแปลงค่าใหม่
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Certificate Modal */}
      {activePreviewCert && (
        <CertificateModal
          cert={activePreviewCert}
          onClose={() => setActivePreviewCert(null)}
        />
      )}
    </div>
  );
};
