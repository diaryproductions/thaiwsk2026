import React, { useState } from 'react';
import { Menu, X, Shield, Sparkles } from 'lucide-react';
import { APP_CONFIG } from '../config/constants';
import bundledLogoFallback from '../assets/images/logo-thaiwsk.png';

export type NavTab = 'home' | 'exam' | 'score' | 'certificate' | 'admin';

interface NavbarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoSrc, setLogoSrc] = useState<string>(APP_CONFIG.LOGO_URL);

  const navLinks: { id: NavTab; label: string }[] = [
    { id: 'home', label: 'หน้าแรก' },
    { id: 'exam', label: 'ระบบทำแบบทดสอบ' },
    { id: 'score', label: 'ตรวจสอบคะแนน' },
    { id: 'certificate', label: 'เกียรติบัตรออนไลน์' },
  ];

  const handleNavClick = (tab: NavTab) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#D6AF55]/40 shadow-xs transition-shadow">
      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-4 sm:gap-6">
          {/* Zone 1: Brand Wordmark */}
          <button
            type="button"
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7043A6] rounded-lg p-1 cursor-pointer min-w-0"
          >
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white p-0.5 border border-[#D6AF55]/60 shadow-xs flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200 overflow-hidden">
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
            <div className="min-w-0">
              <div className="font-['Prompt'] font-bold text-base sm:text-lg text-[#4B267D] tracking-tight leading-tight truncate">
                สืบศิลป์ถิ่นอักษร สืบสุนทรภาษาไทย
              </div>
              <div className="font-['Sarabun'] text-[11px] text-[#7043A6] font-medium leading-tight mt-0.5 truncate">
                กลุ่มสาระการเรียนรู้ภาษาไทย โรงเรียนกระทุ่มแบน &quot;วิเศษสมุทคุณ&quot;
              </div>
            </div>
          </button>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const isActive = currentTab === link.id;
              return (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => handleNavClick(link.id)}
                  className={`relative px-3.5 py-2 rounded-lg text-sm font-['Prompt'] font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-[#4B267D] text-[#FAF8FD] shadow-xs ring-1 ring-[#D6AF55]/50'
                      : 'text-[#30283A] hover:text-[#4B267D] hover:bg-[#FAF8FD]'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Action & Admin Portal */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => handleNavClick('exam')}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-['Prompt'] font-semibold text-white bg-gradient-to-r from-[#7043A6] to-[#4B267D] hover:from-[#4B267D] hover:to-[#30283A] transition-all shadow-xs hover:shadow border border-[#D6AF55]/40 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D6AF55]" />
              <span>เข้าสู่แบบทดสอบ</span>
            </button>

            {/* Admin Portal Button */}
            <button
              type="button"
              onClick={() => handleNavClick('admin')}
              title="สำหรับผู้ดูแลระบบ (Admin)"
              className={`p-2 rounded-lg border transition-all cursor-pointer ${
                currentTab === 'admin'
                  ? 'bg-[#4B267D] text-white border-[#4B267D]'
                  : 'bg-white text-[#7043A6] border-slate-200 hover:border-[#D6AF55] hover:text-[#4B267D]'
              }`}
            >
              <Shield className="w-5 h-5" />
            </button>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-[#4B267D] hover:bg-[#FAF8FD] border border-slate-200 cursor-pointer"
              aria-label="เมนูหลัก"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-[#FAF8FD] px-4 pt-3 pb-5 space-y-2 font-['Prompt']">
          {navLinks.map((link) => (
            <button
              key={link.id}
              type="button"
              onClick={() => handleNavClick(link.id)}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                currentTab === link.id
                  ? 'bg-[#4B267D] text-white'
                  : 'text-[#30283A] hover:bg-white'
              }`}
            >
              {link.label}
            </button>
          ))}
          <div className="pt-2 border-t border-slate-200 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => handleNavClick('exam')}
              className="w-full text-center py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-[#7043A6] to-[#4B267D] cursor-pointer"
            >
              เข้าสู่ระบบทำแบบทดสอบออนไลน์
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('admin')}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs text-[#7043A6] bg-white border border-slate-200 cursor-pointer"
            >
              <Shield className="w-4 h-4" />
              <span>สำหรับผู้ดูแลระบบ (Admin)</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
