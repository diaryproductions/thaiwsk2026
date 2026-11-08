import React from 'react';
import { Phone, Mail, Globe, MapPin, ExternalLink, Code2 } from 'lucide-react';
import { SiteContent } from '../config/defaultContent';

interface FooterProps {
  footer: SiteContent['footer'];
}

export const Footer: React.FC<FooterProps> = ({ footer }) => {
  return (
    <footer className="bg-[#30283A] text-slate-300 font-['Sarabun'] border-t border-[#D6AF55]/30">
      {/* Top Academic Ribbon */}
      <div className="bg-[#4B267D] text-[#FAF8FD] py-4 px-4 border-b border-[#7043A6]/40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-xs font-['Prompt']">
          <div className="flex items-center gap-2">
            <span className="text-[#D6AF55] font-semibold">THAI WSK 2026</span>
            <span>·</span>
            <span>สืบศิลป์ถิ่นอักษร สืบสุนทรภาษาไทย</span>
          </div>
          <div className="text-slate-300 text-xs">
            {footer.school} จังหวัดสมุทรสาคร
          </div>
        </div>
      </div>

      {/* Main Footer Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          {/* Col 1: School Identity & Address */}
          <div className="md:col-span-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#4B267D] border border-[#D6AF55] p-0.5 flex items-center justify-center shrink-0">
                <img
                  src="/src/assets/images/school_wsk_emblem_1794141246706.jpg"
                  alt="ตราโรงเรียน"
                  className="w-full h-full object-cover rounded-full"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <div>
                <h3 className="text-base font-['Prompt'] font-bold text-white">
                  {footer.department}
                </h3>
                <p className="text-xs font-['Prompt'] text-[#D6AF55]">
                  {footer.school}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-md flex items-start gap-2">
              <MapPin className="w-4 h-4 text-[#D6AF55] shrink-0 mt-0.5" />
              <span>{footer.address}</span>
            </p>

            <div className="pt-2 flex flex-wrap gap-y-2 gap-x-4 text-xs text-slate-300">
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#D6AF55]" />
                <span>โทรศัพท์: {footer.telephone}</span>
              </span>
              <span>โทรสาร: {footer.fax}</span>
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#D6AF55]" />
                <a href={`mailto:${footer.email}`} className="hover:text-white transition-colors underline">
                  {footer.email}
                </a>
              </span>
              <span className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#D6AF55]" />
                <a
                  href={footer.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors inline-flex items-center gap-1 underline"
                >
                  <span>เว็บไซต์โรงเรียน</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </span>
            </div>
          </div>

          {/* Col 2: Developer & System Credit */}
          <div className="md:col-span-6 space-y-3 bg-white/5 rounded-2xl p-5 border border-white/10">
            <div className="flex items-center gap-2 text-xs font-['Prompt'] font-semibold text-[#D6AF55]">
              <Code2 className="w-4 h-4" />
              <span>ข้อมูลผู้จัดทำและพัฒนาระบบ</span>
            </div>

            <div className="text-xs text-slate-300 space-y-1.5 leading-relaxed">
              <p className="text-sm font-semibold text-white font-['Prompt']">
                จัดทำระบบโดย: {footer.developerName}
              </p>
              <p className="text-slate-400">
                {footer.developerRole}
              </p>
              <p className="text-[#D6AF55] pt-1">
                {footer.developerContact}
              </p>
            </div>

            <div className="pt-3 border-t border-white/10 text-[11px] text-slate-400">
              ระบบเชื่อมต่อฐานข้อมูล Google Sheets ผ่าน Google Apps Script พร้อมรองรับการเผยแพร่ผ่าน GitHub Pages
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="mt-10 pt-6 border-t border-white/10 text-center text-xs text-slate-400 font-['Sarabun'] flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            © ๒๕๖๙ {footer.school} — สงวนลิขสิทธิ์ตามกฎหมาย
          </div>
          <div className="text-slate-400 text-[11px]">
            ขับเคลื่อนเพื่อการศึกษาและวิชาการภาษาไทย
          </div>
        </div>
      </div>
    </footer>
  );
};
