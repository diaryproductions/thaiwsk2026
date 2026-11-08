import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, BookOpen, Award, CheckCircle } from 'lucide-react';
import { HeroSlide } from '../config/defaultContent';
import { APP_CONFIG } from '../config/constants';

interface HeroSliderProps {
  slides: HeroSlide[];
  onNavigate: (tab: 'exam' | 'score' | 'certificate') => void;
}

export const HeroSlider: React.FC<HeroSliderProps> = ({ slides, onNavigate }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-advance slides every 10 seconds if more than 1 slide exists
  useEffect(() => {
    if (!slides || slides.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, APP_CONFIG.SLIDER_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [slides]);

  if (!slides || slides.length === 0) {
    return null;
  }

  const activeSlide = slides[currentIndex] || slides[0];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  return (
    <div className="relative overflow-hidden bg-[#30283A] text-white">
      {/* Background Image Carousel Container */}
      <div className="relative w-full h-[480px] sm:h-[540px] lg:h-[600px] overflow-hidden">
        {slides.map((slide, index) => {
          const isActive = index === currentIndex;
          return (
            <div
              key={slide.id || index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Background Photography with fallback gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#4B267D] via-[#7043A6] to-[#30283A]">
                <img
                  src={slide.imageUrl}
                  alt={slide.title}
                  className="w-full h-full object-cover object-center"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    // Fallback to stylized background on error
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />
              </div>

              {/* Scrim Overlay for WCAG AA readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#30283A] via-[#4B267D]/75 to-black/40 backdrop-blur-[0.5px]" />
            </div>
          );
        })}

        {/* Content Container (Dominant Anchor) */}
        <div className="relative z-20 max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
          <div className="max-w-3xl space-y-6">
            {/* Academic Kicker */}
            <div className="flex items-center gap-2 text-xs sm:text-sm font-['Prompt'] text-[#D6AF55] tracking-wide">
              <span>{activeSlide.badge || 'โครงการส่งเสริมและพัฒนาความรู้ความสามารถด้านภาษาไทย'}</span>
              <span aria-hidden="true">·</span>
              <span className="text-white/80">ปีการศึกษา ๒๕๖๙</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-['Prompt'] font-bold text-white tracking-tight leading-tight drop-shadow-sm text-balance">
              {activeSlide.title}
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-white/90 font-['Sarabun'] leading-relaxed max-w-2xl">
              {activeSlide.subtitle}
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-wrap items-center gap-3 font-['Prompt'] text-sm">
              <button
                onClick={() => onNavigate('exam')}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#D6AF55] to-[#C99C38] text-[#30283A] font-bold shadow-lg hover:shadow-xl hover:brightness-105 active:scale-98 transition-all flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4 text-[#4B267D]" />
                <span>ทำแบบทดสอบออนไลน์</span>
              </button>

              <button
                onClick={() => onNavigate('score')}
                className="px-5 py-3 rounded-xl bg-white/15 hover:bg-white/25 text-white font-medium backdrop-blur-md border border-white/25 active:scale-98 transition-all flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4 text-[#D6AF55]" />
                <span>ตรวจสอบคะแนน</span>
              </button>

              <button
                onClick={() => onNavigate('certificate')}
                className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-[#FAF8FD] font-medium backdrop-blur-sm border border-white/20 active:scale-98 transition-all flex items-center gap-2"
              >
                <Award className="w-4 h-4 text-[#D6AF55]" />
                <span>ดาวน์โหลดเกียรติบัตร</span>
              </button>
            </div>
          </div>
        </div>

        {/* Carousel Controls (Show only if multiple slides) */}
        {slides.length > 1 && (
          <>
            <div className="absolute z-20 bottom-6 right-6 sm:right-10 flex items-center gap-3">
              <button
                onClick={handlePrev}
                aria-label="สไลด์ก่อนหน้า"
                className="p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md border border-white/20 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-1.5 px-2">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    aria-label={`ไปที่สไลด์ ${idx + 1}`}
                    className={`h-2 rounded-full transition-all ${
                      idx === currentIndex
                        ? 'w-6 bg-[#D6AF55]'
                        : 'w-2 bg-white/40 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={handleNext}
                aria-label="สไลด์ถัดไป"
                className="p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md border border-white/20 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Countdown / Interval progress hint */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 z-20">
              <div
                key={currentIndex}
                className="h-full bg-gradient-to-r from-[#D6AF55] to-[#7043A6] animate-[progress_10s_linear]"
                style={{
                  animationDuration: `${APP_CONFIG.SLIDER_INTERVAL_MS}ms`,
                }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
