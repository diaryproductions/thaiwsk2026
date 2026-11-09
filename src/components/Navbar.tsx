import React, { useState } from 'react';
import { Menu, X, Shield, ExternalLink, Sparkles } from 'lucide-react';
import { SmartImage } from './SmartImage';

export type NavTab = 'home' | 'exam' | 'score' | 'certificate' | 'admin';

interface NavbarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isBackendConnected: boolean;
  logoUrl?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  isBackendConnected,
  logoUrl,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#D6AF55]/30 shadow-xs">
      {/* Top Banner Ribbon */}
      <div className="bg-gradient-to-r from-[#4B267D] via-[#7043A6] to-[#4B267D] text-[#FAF8FD] text-xs py-1.5 px-4 text-center">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 font-['Sarabun']">
          <span className="truncate hidden sm:inline">
            กลุ่มสาระการเรียนรู้ภาษาไทย โรงเรียนกระทุ่มแบน &quot;วิเศษสมุทคุณ&quot;
          </span>
          <span className="truncate sm:hidden font-medium">
            THAI WSK ๒๕๖๙ สืบศิลป์ถิ่นอักษร
          </span>
          <div className="flex items-center gap-3 shrink-0 text-[11px]">
            {isBackendConnected && (
              <>
                <span className="inline-flex items-center gap-1.5 text-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>เชื่อมต่อชีตจริง</span>
                </span>
                <span className="text-white/40">|</span>
              </>
            )}
            <a
              href="https://www.wsk.ac.th/wp/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#D6AF55] transition-colors inline-flex items-center gap-1"
            >
              <span>WSK Official</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-6">
          {/* Zone 1: Brand Wordmark */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7043A6] rounded-lg p-1"
          >
            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#4B267D] to-[#7043A6] p-0.5 border border-[#D6AF55] shadow-xs flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform overflow-hidden">
              <SmartImage
                src={logoUrl || 'images/school_wsk_emblem_1794141246706.jpg'}
                alt="ตรากลุ่มสาระฯ ภาษาไทย WSK"
                fallbackType="logo"
                className="w-full h-full object-cover rounded-full"
                containerClassName="w-full h-full rounded-full"
              />
            </div>
            <div>
              <div className="font-['Prompt'] font-bold text-lg text-[#4B267D] tracking-tight leading-tight flex items-center gap-1.5">
                <span>THAI WSK 2026</span>
                <span className="text-[#D6AF55] text-xs font-normal border border-[#D6AF55]/50 rounded px-1 py-0.2">
                  ๒๕๖๙
                </span>
              </div>
              <div className="font-['Sarabun'] text-[11px] text-[#7043A6] font-medium leading-none mt-0.5">
                สืบศิลป์ถิ่นอักษร สืบสุนทรภาษาไทย
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
                  onClick={() => handleNavClick(link.id)}
                  className={`px-3.5 py-2 rounded-lg text-sm font-['Prompt'] font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-[#4B267D] text-[#FAF8FD] shadow-xs'
                      : 'text-[#30283A] hover:text-[#4B267D] hover:bg-[#FAF8FD]'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Action & Admin Hamburger */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => handleNavClick('exam')}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-['Prompt'] font-semibold text-white bg-gradient-to-r from-[#7043A6] to-[#4B267D] hover:from-[#4B267D] hover:to-[#30283A] transition-all shadow-xs hover:shadow border border-[#D6AF55]/40"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D6AF55]" />
              <span>เข้าสู่แบบทดสอบ</span>
            </button>

            {/* Admin Portal Button */}
            <button
              onClick={() => handleNavClick('admin')}
              title="สำหรับผู้ดูแลระบบ (Admin)"
              className={`p-2 rounded-lg border transition-all ${
                currentTab === 'admin'
                  ? 'bg-[#4B267D] text-white border-[#4B267D]'
                  : 'bg-white text-[#7043A6] border-slate-200 hover:border-[#D6AF55] hover:text-[#4B267D]'
              }`}
            >
              <Shield className="w-5 h-5" />
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-[#4B267D] hover:bg-[#FAF8FD] border border-slate-200"
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
              onClick={() => handleNavClick(link.id)}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
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
              onClick={() => handleNavClick('exam')}
              className="w-full text-center py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-[#7043A6] to-[#4B267D]"
            >
              เข้าสู่ระบบทำแบบทดสอบออนไลน์
            </button>
            <button
              onClick={() => handleNavClick('admin')}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs text-[#7043A6] bg-white border border-slate-200"
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
