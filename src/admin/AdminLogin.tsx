import React, { useState } from 'react';
import { Shield, Lock, User, AlertCircle, ArrowRight } from 'lucide-react';
import { adminLogin } from '../services/api';
import { APP_CONFIG } from '../config/constants';

interface AdminLoginProps {
  onLoginSuccess: (token: string) => void;
  isBackendConnected: boolean;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  onLoginSuccess,
  isBackendConnected,
}) => {
  const [username, setUsername] = useState(APP_CONFIG.DEFAULT_ADMIN_USER);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMessage('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await adminLogin({
        username: username.trim(),
        passwordHashOrSecret: password.trim(),
      });

      if (res.success && res.token) {
        onLoginSuccess(res.token);
      } else {
        setErrorMessage(res.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      }
    } catch (err: any) {
      setErrorMessage(`เกิดข้อผิดพลาดในการเข้าสู่ระบบ: ${err?.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-16 px-4 max-w-md mx-auto">
      <div className="bg-white rounded-3xl border border-[#D6AF55]/40 shadow-xl overflow-hidden">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-[#4B267D] to-[#7043A6] p-8 text-white text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-4 text-[#D6AF55] shadow-inner">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-['Prompt'] font-bold">
            ระบบจัดการสำหรับแอดมิน
          </h2>
          <p className="text-xs font-['Sarabun'] text-white/80 mt-1">
            THAI WSK 2026 — โรงเรียนกระทุ่มแบน &quot;วิเศษสมุทคุณ&quot;
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs font-['Sarabun'] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {!isBackendConnected && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-xl text-xs font-['Sarabun']">
              <strong>หมายเหตุ:</strong> ระบบยังไม่ได้เชื่อมต่อ Google Apps Script Web App สามารถเข้าสู่ระบบในโหมดตัวอย่าง (Preview Mode) เพื่อทดลองแก้ไขและจัดเตรียมข้อมูลได้
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-['Prompt'] font-semibold text-slate-700 mb-1.5">
                ชื่อบัญชีผู้ใช้ (Username)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin_wsk"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:border-[#7043A6] focus:ring-2 focus:ring-[#7043A6]/20 font-['Prompt'] text-sm text-[#30283A] outline-none"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-['Prompt'] font-semibold text-slate-700 mb-1.5">
                รหัสผ่าน (Password)
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:border-[#7043A6] focus:ring-2 focus:ring-[#7043A6]/20 font-['Prompt'] text-sm text-[#30283A] outline-none"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 py-3.5 rounded-xl font-['Prompt'] font-bold text-sm text-white bg-gradient-to-r from-[#4B267D] to-[#7043A6] hover:from-[#30283A] hover:to-[#4B267D] shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <span>กำลังตรวจสอบ...</span>
              ) : (
                <>
                  <span>เข้าสู่ระบบจัดการแอดมิน</span>
                  <ArrowRight className="w-4 h-4 text-[#D6AF55]" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center text-xs font-['Sarabun'] text-slate-500">
            ระบบความปลอดภัยฝั่งเซิร์ฟเวอร์ · ห้ามเปิดเผยข้อมูลส่วนบุคคลของผู้เข้าสอบ
          </div>
        </div>
      </div>
    </div>
  );
};
