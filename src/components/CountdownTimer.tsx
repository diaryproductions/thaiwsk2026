import React, { useState, useEffect } from 'react';
import { Clock, Calendar } from 'lucide-react';

interface CountdownTimerProps {
  targetDateIso: string;
  label?: string;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

function calculateTimeRemaining(targetIso: string): TimeRemaining {
  const target = new Date(targetIso).getTime();
  const now = Date.now();
  const diff = target - now;

  if (diff <= 0 || isNaN(target)) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, isExpired: false };
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  targetDateIso,
  label = 'นับถอยหลังสู่วันดำเนินกิจกรรม',
}) => {
  const [time, setTime] = useState<TimeRemaining>(() =>
    calculateTimeRemaining(targetDateIso)
  );

  useEffect(() => {
    setTime(calculateTimeRemaining(targetDateIso));
    const timer = setInterval(() => {
      setTime(calculateTimeRemaining(targetDateIso));
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDateIso]);

  const units = [
    { label: 'วัน', value: time.days },
    { label: 'ชั่วโมง', value: time.hours },
    { label: 'นาที', value: time.minutes },
    { label: 'วินาที', value: time.seconds },
  ];

  return (
    <div className="bg-gradient-to-br from-white to-[#FAF8FD] border-y border-[#D6AF55]/30 shadow-xs py-6 px-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left: Academic Label & Calendar Context */}
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className="w-12 h-12 rounded-xl bg-[#4B267D]/10 border border-[#D6AF55]/40 flex items-center justify-center text-[#4B267D] shrink-0">
            <Clock className="w-6 h-6 text-[#7043A6]" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-[#7043A6] font-['Prompt'] font-semibold flex items-center gap-1.5 justify-center md:justify-start">
              <Calendar className="w-3.5 h-3.5 text-[#D6AF55]" />
              <span>กำหนดการสำคัญ</span>
            </div>
            <h3 className="text-base sm:text-lg font-['Prompt'] font-bold text-[#30283A]">
              {label}
            </h3>
          </div>
        </div>

        {/* Right: Modern Tabular Countdown Digits */}
        <div className="flex items-center gap-2 sm:gap-4 font-['Prompt']">
          {time.isExpired ? (
            <div className="px-5 py-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-sm font-semibold">
              ระบบเปิดให้ดำเนินการตามกำหนดการแล้ว
            </div>
          ) : (
            units.map((unit, idx) => (
              <React.Fragment key={unit.label}>
                <div className="flex flex-col items-center">
                  <div className="w-16 sm:w-20 h-16 sm:h-18 rounded-xl bg-gradient-to-b from-white to-[#FAF8FD] border border-[#7043A6]/20 shadow-xs flex items-center justify-center">
                    <span className="text-2xl sm:text-3xl font-bold text-[#4B267D] tabular-nums">
                      {String(unit.value).padStart(2, '0')}
                    </span>
                  </div>
                  <span className="text-[11px] sm:text-xs text-[#7043A6] mt-1.5 font-medium">
                    {unit.label}
                  </span>
                </div>
                {idx < units.length - 1 && (
                  <span className="text-xl sm:text-2xl text-[#D6AF55] font-bold self-start mt-4 sm:mt-5">
                    :
                  </span>
                )}
              </React.Fragment>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
