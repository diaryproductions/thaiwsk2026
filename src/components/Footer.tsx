import React, { useState } from 'react';
import { Phone, Mail, Globe, MapPin, ExternalLink, Code2 } from 'lucide-react';
import { SiteContent } from '../config/defaultContent';
import { APP_CONFIG } from '../config/constants';
import { toArabicNumerals } from '../utils/thaiDigits';
import bundledLogoFallback from '../assets/images/logo-thaiwsk.png';

interface FooterProps {
  footer: SiteContent['footer'];
}

export const Footer: React.FC<FooterProps> = ({ footer }) => {
  const [logoSrc, setLogoSrc] = useState<string>(APP_CONFIG.LOGO_URL);

  return (
    <footer className="bg-[#30283A] text-slate-300 font-['Sarabun'] border-t-2 border-[#D6AF55]/50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-7">
        {/* 2 Columns on Desktop (School Info + Developer Info), Compact Stack on Mobile */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-8 items-start">
          {/* Column 1: School Identity & Contact */}
          <div className="md:col-span-7 space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white border border-[#D6AF55]/80 p-0.5 flex items-center justify-center shrink-0 overflow-hidden">
                <img
                  src={logoSrc}
                  alt={`โลโก้ ${APP_CONFIG.APP_NAME}`}
                  referrerPolicy="no-referrer"
                  onError={() => {
                    if (logoSrc !== bundledLogoFallback) {
                      setLogoSrc(bundledLogoFallback);
                    }
                  }}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h3 className="text-sm font-['Prompt'] font-semibold text-white leading-tight">
                  {toArabicNumerals(footer.department)}
                </h3>
                <p className="text-xs font-['Prompt'] text-[#D6AF55] leading-tight mt-0.5">
                  {toArabicNumerals(footer.school)}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300/90 leading-snug flex items-start gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#D6AF55] shrink-0 mt-0.5" />
              <span>{toArabicNumerals(footer.address)}</span>
            </p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300 pt-0.5">
              <span className="inline-flex items-center gap-1">
                <Phone className="w-3 h-3 text-[#D6AF55]" />
                <span>โทร. {toArabicNumerals(footer.telephone)}</span>
              </span>
              <span className="text-slate-400">โทรสาร {toArabicNumerals(footer.fax)}</span>
              <span className="inline-flex items-center gap-1">
                <Mail className="w-3 h-3 text-[#D6AF55]" />
                <a href={`mailto:${footer.email}`} className="hover:text-white transition-colors">
                  {footer.email}
                </a>
              </span>
              <a
                href={footer.websiteUrl}
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#D6AF55] transition-colors inline-flex items-center gap-1 text-slate-200"
              >
                <Globe className="w-3 h-3 text-[#D6AF55]" />
                <span>เว็บไซต์โรงเรียน</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>

          {/* Column 2: Developer & System Credit */}
          <div className="md:col-span-5 md:border-l md:border-white/10 md:pl-8 space-y-1.5 text-xs">
            <div className="flex items-center gap-1.5 font-['Prompt'] font-semibold text-[#D6AF55]">
              <Code2 className="w-3.5 h-3.5" />
              <span>ผู้พัฒนาระบบและจัดทำเว็บไซต์</span>
            </div>
            <p className="text-sm font-['Prompt'] font-semibold text-white leading-snug">
              {toArabicNumerals(footer.developerName)}
            </p>
            <p className="text-xs text-slate-300/90 leading-snug">
              {toArabicNumerals(footer.developerRole)}
            </p>
            <p className="text-xs text-[#D6AF55]/95 font-['Prompt']">
              {toArabicNumerals(footer.developerContact)}
            </p>
          </div>
        </div>

        {/* Bottom Copyright Row */}
        <div className="mt-5 pt-3.5 border-t border-white/10 text-[11px] text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-1.5 text-center sm:text-left">
          <div>
            © 2569 สืบศิลป์ถิ่นอักษร สืบสุนทรภาษาไทย · {toArabicNumerals(footer.school)} — สงวนลิขสิทธิ์
          </div>
          <div>
            โครงการส่งเสริมและพัฒนาความรู้ความสามารถด้านภาษาไทย
          </div>
        </div>
      </div>
    </footer>
  );
};
