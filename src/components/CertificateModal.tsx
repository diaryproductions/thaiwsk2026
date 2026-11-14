import React from 'react';
import { X, ExternalLink, Download, AlertCircle, Award, Trophy, Medal, FileBadge } from 'lucide-react';
import { CertificateSearchResult } from '../services/api';
import { getMedalTheme } from '../utils/medalTheme';
import { toArabicNumerals } from '../utils/thaiDigits';

interface CertificateModalProps {
  cert: CertificateSearchResult | null;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({ cert, onClose }) => {
  if (!cert) return null;

  const previewUrl = cert.previewUrl;
  const downloadUrl = cert.downloadUrl || cert.certificateUrl;
  const medalTheme = getMedalTheme(cert.medal);
  const medalText = toArabicNumerals((cert.medal || '').trim()) || '-';

  const renderMedalIcon = (className: string) => {
    if (medalTheme.category === 'gold') return <Trophy className={className} />;
    if (medalTheme.category === 'silver' || medalTheme.category === 'bronze') {
      return <Medal className={className} />;
    }
    return <FileBadge className={className} />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-wsk-fade-in">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-[#D6AF55]/50">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#4B267D] to-[#7043A6] p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 border border-[#F4E4B5]/40 flex items-center justify-center text-[#F4E4B5]">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-['Prompt'] text-[#F4E4B5]">
                เกียรติบัตรอิเล็กทรอนิกส์
              </div>
              <h3 className="font-['Prompt'] font-bold text-lg">
                {toArabicNumerals(cert.fullName)}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
            aria-label="ปิดหน้าต่าง"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Award Highlight Strip */}
        <div className={`px-5 py-3 border-b ${medalTheme.bannerBorder} ${medalTheme.bannerBg} flex flex-wrap items-center justify-between gap-3`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl border ${medalTheme.iconBg} flex items-center justify-center shrink-0`}>
              {renderMedalIcon(`w-4.5 h-4.5 ${medalTheme.iconColor}`)}
            </div>
            <div>
              <span className="text-[11px] font-['Prompt'] text-slate-500 block leading-none">
                ระดับรางวัลที่ได้รับ
              </span>
              <span className={`font-['Prompt'] font-bold text-sm sm:text-base ${medalTheme.titleColor}`}>
                {medalText}
              </span>
            </div>
          </div>

          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-['Prompt'] font-bold text-xs border ${medalTheme.badgeBg}`}>
            {renderMedalIcon('w-3.5 h-3.5')}
            <span>{medalText}</span>
          </span>
        </div>

        {/* Modal Body / Iframe Preview */}
        <div className="flex-1 bg-slate-100 p-2 sm:p-4 overflow-hidden flex items-center justify-center min-h-[340px] sm:min-h-[460px]">
          {previewUrl ? (
            <iframe
              src={previewUrl}
              title={`เกียรติบัตร ${cert.fullName}`}
              className="w-full h-full min-h-[340px] sm:min-h-[460px] rounded-xl border border-slate-300 bg-white"
              allow="autoplay"
            />
          ) : (
            <div className="text-center p-8 bg-white rounded-2xl max-w-md border border-slate-200">
              <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
              <h4 className="font-['Prompt'] font-bold text-base text-slate-800">
                ไม่สามารถแสดงตัวอย่างไฟล์ในหน้านี้ได้โดยตรง
              </h4>
              <p className="font-['Sarabun'] text-xs text-slate-600 mt-2">
                เนื่องจากการตั้งค่าสิทธิ์ไฟล์หรือรูปแบบลิงก์ของ Google Drive ท่านสามารถคลิกปุ่ม &quot;ดาวน์โหลดเกียรติบัตร&quot; ด้านล่างเพื่อเปิดไฟล์โดยตรง
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs font-['Sarabun'] text-slate-500">
            ระดับชั้น: {toArabicNumerals(cert.grade) || '-'} · ห้อง: {toArabicNumerals(cert.room) || '-'} · รางวัล: {medalText}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto font-['Prompt'] text-xs sm:text-sm">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              ปิด
            </button>

            {downloadUrl ? (
              <a
                href={downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-[#4B267D] to-[#7043A6] hover:from-[#30283A] hover:to-[#4B267D] shadow-md flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4 text-[#F4E4B5]" />
                <span>ดาวน์โหลดเกียรติบัตร</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
