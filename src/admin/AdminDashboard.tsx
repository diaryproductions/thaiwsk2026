import React, { useState } from 'react';
import {
  Save,
  LogOut,
  RefreshCw,
  Plus,
  Trash2,
  Database,
  Globe,
  Image,
  Award,
  Calendar,
  Bell,
  BookOpen,
  FileText,
  Sliders,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Link,
  Shield,
  Eye,
} from 'lucide-react';
import { SiteContent, HeroSlide, AwardCriterion, ScheduleItem, AnnouncementItem } from '../config/defaultContent';
import { APP_CONFIG } from '../config/constants';
import { saveSiteContent, getApiBaseUrl, setApiBaseUrl, checkBackendHealth, setAdminToken } from '../services/api';

interface AdminDashboardProps {
  content: SiteContent;
  onUpdateContentLocally: (newContent: SiteContent) => void;
  onLogout: () => void;
  isBackendConnected: boolean;
  refreshContent: () => void;
}

type AdminSection =
  | 'meta'
  | 'slides'
  | 'about'
  | 'awards'
  | 'schedule'
  | 'announcements'
  | 'exams'
  | 'instructions'
  | 'footer'
  | 'database';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  content,
  onUpdateContentLocally,
  onLogout,
  isBackendConnected,
  refreshContent,
}) => {
  const [activeTab, setActiveTab] = useState<AdminSection>('meta');
  const [formData, setFormData] = useState<SiteContent>(JSON.parse(JSON.stringify(content)));
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Backend URL configuration state
  const [backendUrlInput, setBackendUrlInput] = useState(getApiBaseUrl());
  const [isTestingBackend, setIsTestingBackend] = useState(false);
  const [backendTestResult, setBackendTestResult] = useState<{
    connected: boolean;
    message: string;
    data?: any;
  } | null>(null);

  const handleTestBackend = async () => {
    setIsTestingBackend(true);
    setBackendTestResult(null);
    try {
      setApiBaseUrl(backendUrlInput);
      const res = await checkBackendHealth();
      setBackendTestResult(res);
      if (res.connected) {
        refreshContent();
      }
    } catch (e: any) {
      setBackendTestResult({
        connected: false,
        message: e?.message || 'การทดสอบล้มเหลว',
      });
    } finally {
      setIsTestingBackend(false);
    }
  };

  const handleSaveToSheet = async () => {
    setIsSaving(true);
    setSaveStatus(null);

    const updatedData: SiteContent = {
      ...formData,
      version: (formData.version || 1) + 1,
      updatedAt: new Date().toISOString(),
    };

    try {
      // 1. Update locally right away for instantaneous admin response
      onUpdateContentLocally(updatedData);

      // 2. If backend is configured, persist to Google Sheets columns H:O
      const baseUrl = getApiBaseUrl();
      if (!baseUrl) {
        setSaveStatus({
          type: 'success',
          message:
            'บันทึกการแก้ไขลงหน่วยความจำชั่วคราว (Preview Mode) เรียบร้อยแล้ว (กรุณาระบุ Backend URL ในแท็บ "ฐานข้อมูล & API" เพื่อซิงค์ลง Google Sheets สำหรับทุกอุปกรณ์)',
        });
        setIsSaving(false);
        return;
      }

      const res = await saveSiteContent(updatedData);
      if (res.success) {
        setSaveStatus({
          type: 'success',
          message: res.message || 'บันทึกข้อมูลลง Google Sheets สำเร็จ และอัปเดตทุกอุปกรณ์แล้ว',
        });
        refreshContent();
      } else {
        setSaveStatus({
          type: 'error',
          message: res.message || 'ไม่สามารถบันทึกลง Google Sheets ได้',
        });
      }
    } catch (err: any) {
      setSaveStatus({
        type: 'error',
        message: `ข้อผิดพลาด: ${err?.message}`,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSlide = () => {
    const newSlide: HeroSlide = {
      id: `slide-${Date.now()}`,
      imageUrl: '/src/assets/images/hero_thai_wsk_banner_1794141245856.jpg',
      title: 'กิจกรรมส่งเสริมภาษาไทย',
      subtitle: 'คำอธิบายภาพสไลด์ใหม่',
      badge: 'กิจกรรมวิชาการ',
      sortOrder: (formData.heroSlides?.length || 0) + 1,
    };
    setFormData({
      ...formData,
      heroSlides: [...(formData.heroSlides || []), newSlide],
    });
  };

  const handleDeleteSlide = (id: string) => {
    setFormData({
      ...formData,
      heroSlides: (formData.heroSlides || []).filter((s) => s.id !== id),
    });
  };

  const handleAddAward = () => {
    const newAward: AwardCriterion = {
      id: `crit-${Date.now()}`,
      title: 'รางวัลเกียรติยศใหม่',
      rangeText: 'คะแนน ๑๐ – ๑๒ คะแนน',
      percentageText: 'ร้อยละ ๕๐ – ๖๐',
      description: 'คำอธิบายเกณฑ์รางวัลใหม่',
      colorGrade: 'honor',
      sortOrder: (formData.awardCriteria?.length || 0) + 1,
      isActive: true,
    };
    setFormData({
      ...formData,
      awardCriteria: [...(formData.awardCriteria || []), newAward],
    });
  };

  const handleDeleteAward = (id: string) => {
    setFormData({
      ...formData,
      awardCriteria: (formData.awardCriteria || []).filter((a) => a.id !== id),
    });
  };

  const handleAddSchedule = () => {
    const newItem: ScheduleItem = {
      id: `sched-${Date.now()}`,
      topic: 'กำหนดการใหม่',
      date: '๑ มกราคม ๒๕๖๙',
      time: '๐๙.๐๐ น.',
      location: 'ออนไลน์',
      description: 'รายละเอียดกิจกรรม',
      sortOrder: (formData.schedule?.length || 0) + 1,
      status: 'upcoming',
    };
    setFormData({
      ...formData,
      schedule: [...(formData.schedule || []), newItem],
    });
  };

  const handleDeleteSchedule = (id: string) => {
    setFormData({
      ...formData,
      schedule: (formData.schedule || []).filter((s) => s.id !== id),
    });
  };

  const handleAddAnnouncement = () => {
    const newAnn: AnnouncementItem = {
      id: `ann-${Date.now()}`,
      title: 'หัวข้อประกาศใหม่',
      date: '๑ มกราคม ๒๕๖๙',
      author: 'คณะกรรมการ',
      content: 'เนื้อหารายละเอียดของประกาศ...',
      isPinned: false,
      isActive: true,
      sortOrder: (formData.announcements?.length || 0) + 1,
    };
    setFormData({
      ...formData,
      announcements: [...(formData.announcements || []), newAnn],
    });
  };

  const handleDeleteAnnouncement = (id: string) => {
    setFormData({
      ...formData,
      announcements: (formData.announcements || []).filter((a) => a.id !== id),
    });
  };

  return (
    <div className="py-8 px-4 max-w-7xl mx-auto space-y-6">
      {/* Top Action Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-xl sm:text-2xl font-['Prompt'] font-bold text-[#4B267D]">
              แผงควบคุมระบบจัดการแอดมิน (Admin CMS)
            </h1>
          </div>
          <p className="text-xs font-['Sarabun'] text-slate-500 mt-1">
            แก้ไขข้อมูล ปรับเปลี่ยนเนื้อหา และเผยแพร่ลงทุกอุปกรณ์ผ่าน Google Sheets ID:{' '}
            <code className="text-[#7043A6] font-mono">{APP_CONFIG.SPREADSHEET_ID}</code>
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto font-['Prompt'] text-xs sm:text-sm">
          <button
            onClick={handleSaveToSheet}
            disabled={isSaving}
            className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-[#D6AF55] to-[#C99C38] text-[#30283A] hover:brightness-105 shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSaving ? (
              <RefreshCw className="w-4 h-4 animate-spin text-[#4B267D]" />
            ) : (
              <Save className="w-4 h-4 text-[#4B267D]" />
            )}
            <span>บันทึกข้อมูล (Publish)</span>
          </button>

          <button
            onClick={onLogout}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center gap-1.5"
          >
            <LogOut className="w-4 h-4" />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </div>

      {/* Save Notification Banner */}
      {saveStatus && (
        <div
          className={`p-4 rounded-2xl border text-xs sm:text-sm font-['Sarabun'] flex items-start gap-3 ${
            saveStatus.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-red-50 border-red-300 text-red-900'
          }`}
        >
          {saveStatus.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          )}
          <div className="flex-1">
            <span className="font-semibold font-['Prompt']">
              {saveStatus.type === 'success' ? 'สำเร็จ: ' : 'ข้อผิดพลาด: '}
            </span>
            <span>{saveStatus.message}</span>
          </div>
        </div>
      )}

      {/* Main Admin Grid (Sidebar + Content) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-2 space-y-1 font-['Prompt'] text-xs sm:text-sm shadow-xs">
          {[
            { id: 'meta' as AdminSection, label: 'ข้อมูลทั่วไป & Countdown', icon: Globe },
            { id: 'slides' as AdminSection, label: 'ภาพสไลด์และสื่อ', icon: Image },
            { id: 'about' as AdminSection, label: 'เกี่ยวกับโครงการวิชาการ', icon: FileText },
            { id: 'awards' as AdminSection, label: 'เกณฑ์รางวัลและเกียรติบัตร', icon: Award },
            { id: 'schedule' as AdminSection, label: 'กำหนดการสำคัญ', icon: Calendar },
            { id: 'announcements' as AdminSection, label: 'ข่าวสารและประกาศ', icon: Bell },
            { id: 'exams' as AdminSection, label: 'ระบบทำแบบทดสอบ', icon: BookOpen },
            { id: 'instructions' as AdminSection, label: 'คำชี้แจงระบบ', icon: HelpCircle },
            { id: 'footer' as AdminSection, label: 'ข้อมูล Footer & ติดต่อ', icon: Sliders },
            { id: 'database' as AdminSection, label: 'ฐานข้อมูล & Google Apps Script', icon: Database },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2.5 ${
                  isActive
                    ? 'bg-[#4B267D] text-white shadow-xs'
                    : 'text-slate-700 hover:bg-[#FAF8FD] hover:text-[#4B267D]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#D6AF55]' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-9 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          {/* TAB 1: META */}
          {activeTab === 'meta' && (
            <div className="space-y-6">
              <h3 className="font-['Prompt'] font-bold text-lg text-[#4B267D] border-b pb-3">
                ตั้งค่าข้อมูลทั่วไปและเวลานับถอยหลัง
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-['Prompt'] font-semibold text-slate-700 mb-1">
                    ชื่อเว็บไซต์ / รหัสโครงการ
                  </label>
                  <input
                    type="text"
                    value={formData.siteMeta.title}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        siteMeta: { ...formData.siteMeta, title: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-['Prompt']"
                  />
                </div>

                <div>
                  <label className="block text-xs font-['Prompt'] font-semibold text-slate-700 mb-1">
                    ปีการศึกษา
                  </label>
                  <input
                    type="text"
                    value={formData.siteMeta.academicYear}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        siteMeta: { ...formData.siteMeta, academicYear: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-['Prompt']"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-['Prompt'] font-semibold text-slate-700 mb-1">
                    ชื่อกิจกรรม / คำโปรยหลัก
                  </label>
                  <input
                    type="text"
                    value={formData.siteMeta.subtitle}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        siteMeta: { ...formData.siteMeta, subtitle: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-['Prompt']"
                  />
                </div>

                <div>
                  <label className="block text-xs font-['Prompt'] font-semibold text-slate-700 mb-1">
                    ข้อความกำกับตัวนับถอยหลัง
                  </label>
                  <input
                    type="text"
                    value={formData.siteMeta.countdownLabel}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        siteMeta: { ...formData.siteMeta, countdownLabel: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-['Prompt']"
                  />
                </div>

                <div>
                  <label className="block text-xs font-['Prompt'] font-semibold text-slate-700 mb-1">
                    วันและเวลาเป้าหมาย (ISO Format)
                  </label>
                  <input
                    type="text"
                    value={formData.siteMeta.countdownTarget}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        siteMeta: { ...formData.siteMeta, countdownTarget: e.target.value },
                      })
                    }
                    placeholder="2026-12-15T09:00:00+07:00"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SLIDES */}
          {activeTab === 'slides' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <h3 className="font-['Prompt'] font-bold text-lg text-[#4B267D]">
                    จัดการภาพสไลด์หน้าแรก (Hero Image Slider)
                  </h3>
                  <p className="text-xs font-['Sarabun'] text-slate-500">
                    * หากมีรูปเดียวจะแสดงเป็นภาพนิ่ง หากมีหลายรูปจะเปลี่ยนทุก ๑๐ วินาทีอัตโนมัติ
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddSlide}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-['Prompt'] font-semibold bg-[#FAF8FD] border border-[#7043A6]/30 text-[#4B267D] hover:bg-[#4B267D] hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>เพิ่มภาพสไลด์</span>
                </button>
              </div>

              <div className="space-y-4">
                {(formData.heroSlides || []).map((slide, idx) => (
                  <div key={slide.id} className="p-4 rounded-2xl border border-slate-200 bg-[#FAF8FD] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-['Prompt'] font-bold text-[#7043A6]">
                        ภาพสไลด์ลำดับที่ {idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteSlide(slide.id)}
                        className="text-red-500 hover:text-red-700 p-1 rounded-lg"
                        title="ลบสไลด์"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-['Prompt']">
                      <div className="sm:col-span-2">
                        <label className="block text-slate-700 font-semibold mb-1">
                          URL ของรูปภาพ (ImgBB / Cloudinary / หรือพาธภายใน)
                        </label>
                        <input
                          type="text"
                          value={slide.imageUrl}
                          onChange={(e) => {
                            const updated = [...formData.heroSlides];
                            updated[idx].imageUrl = e.target.value;
                            setFormData({ ...formData, heroSlides: updated });
                          }}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">
                          หัวข้อหลักบนสไลด์
                        </label>
                        <input
                          type="text"
                          value={slide.title}
                          onChange={(e) => {
                            const updated = [...formData.heroSlides];
                            updated[idx].title = e.target.value;
                            setFormData({ ...formData, heroSlides: updated });
                          }}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">
                          ป้ายกำกับ (Badge)
                        </label>
                        <input
                          type="text"
                          value={slide.badge || ''}
                          onChange={(e) => {
                            const updated = [...formData.heroSlides];
                            updated[idx].badge = e.target.value;
                            setFormData({ ...formData, heroSlides: updated });
                          }}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-slate-700 font-semibold mb-1">
                          คำอธิบายย่อย
                        </label>
                        <input
                          type="text"
                          value={slide.subtitle}
                          onChange={(e) => {
                            const updated = [...formData.heroSlides];
                            updated[idx].subtitle = e.target.value;
                            setFormData({ ...formData, heroSlides: updated });
                          }}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: ABOUT */}
          {activeTab === 'about' && (
            <div className="space-y-6">
              <h3 className="font-['Prompt'] font-bold text-lg text-[#4B267D] border-b pb-3">
                เนื้อหาเกี่ยวกับโครงการวิชาการ (About Project)
              </h3>

              <div className="space-y-4 text-xs font-['Prompt']">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">หัวข้อส่วน</label>
                  <input
                    type="text"
                    value={formData.about.title}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        about: { ...formData.about, title: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">คำโปรยเน้น</label>
                  <input
                    type="text"
                    value={formData.about.leadText}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        about: { ...formData.about, leadText: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    ย่อหน้าเนื้อหา (บรรทัดละ ๑ ย่อหน้า)
                  </label>
                  <textarea
                    rows={4}
                    value={formData.about.bodyParagraphs.join('\n\n')}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        about: {
                          ...formData.about,
                          bodyParagraphs: e.target.value.split('\n\n').filter((p) => p.trim()),
                        },
                      })
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-['Sarabun'] text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      URL รูปภาพหลัก
                    </label>
                    <input
                      type="text"
                      value={formData.about.imageUrl}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          about: { ...formData.about, imageUrl: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      URL รูปภาพประกอบรอง
                    </label>
                    <input
                      type="text"
                      value={formData.about.secondaryImageUrl}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          about: { ...formData.about, secondaryImageUrl: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: AWARDS */}
          {activeTab === 'awards' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <h3 className="font-['Prompt'] font-bold text-lg text-[#4B267D]">
                    เกณฑ์การได้รับเกียรติบัตรและรางวัล
                  </h3>
                  <p className="text-xs font-['Sarabun'] text-slate-500">
                    * เมื่อจำนวนการ์ดลดลง ระบบหน้าบ้านจะจัดตำแหน่งให้อยู่กึ่งกลางโดยอัตโนมัติ
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddAward}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-['Prompt'] font-semibold bg-[#FAF8FD] border border-[#7043A6]/30 text-[#4B267D] hover:bg-[#4B267D] hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>เพิ่มเกณฑ์รางวัล</span>
                </button>
              </div>

              <div className="space-y-4">
                {(formData.awardCriteria || []).map((crit, idx) => (
                  <div key={crit.id} className="p-4 rounded-2xl border border-slate-200 bg-[#FAF8FD] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-['Prompt'] font-bold text-[#7043A6]">
                          เกณฑ์รางวัล {crit.title}
                        </span>
                        <label className="inline-flex items-center gap-1.5 text-xs text-slate-600 font-['Sarabun'] cursor-pointer ml-3">
                          <input
                            type="checkbox"
                            checked={crit.isActive}
                            onChange={(e) => {
                              const updated = [...formData.awardCriteria];
                              updated[idx].isActive = e.target.checked;
                              setFormData({ ...formData, awardCriteria: updated });
                            }}
                            className="rounded text-[#4B267D]"
                          />
                          <span>แสดงบนหน้าเว็บ</span>
                        </label>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteAward(crit.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="ลบเกณฑ์"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-['Prompt']">
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">
                          ชื่อรางวัล
                        </label>
                        <input
                          type="text"
                          value={crit.title}
                          onChange={(e) => {
                            const updated = [...formData.awardCriteria];
                            updated[idx].title = e.target.value;
                            setFormData({ ...formData, awardCriteria: updated });
                          }}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">
                          ช่วงคะแนน
                        </label>
                        <input
                          type="text"
                          value={crit.rangeText}
                          onChange={(e) => {
                            const updated = [...formData.awardCriteria];
                            updated[idx].rangeText = e.target.value;
                            setFormData({ ...formData, awardCriteria: updated });
                          }}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">
                          ร้อยละ
                        </label>
                        <input
                          type="text"
                          value={crit.percentageText}
                          onChange={(e) => {
                            const updated = [...formData.awardCriteria];
                            updated[idx].percentageText = e.target.value;
                            setFormData({ ...formData, awardCriteria: updated });
                          }}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-slate-700 font-semibold mb-1">
                          คำอธิบายเกณฑ์
                        </label>
                        <input
                          type="text"
                          value={crit.description}
                          onChange={(e) => {
                            const updated = [...formData.awardCriteria];
                            updated[idx].description = e.target.value;
                            setFormData({ ...formData, awardCriteria: updated });
                          }}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 font-['Sarabun']"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: SCHEDULE */}
          {activeTab === 'schedule' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <h3 className="font-['Prompt'] font-bold text-lg text-[#4B267D]">
                    กำหนดการสำคัญ (Project Schedule)
                  </h3>
                  <p className="text-xs font-['Sarabun'] text-slate-500">
                    แก้ไขวัน เวลา สถานที่ และลำดับกิจกรรม
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddSchedule}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-['Prompt'] font-semibold bg-[#FAF8FD] border border-[#7043A6]/30 text-[#4B267D] hover:bg-[#4B267D] hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>เพิ่มกำหนดการ</span>
                </button>
              </div>

              <div className="space-y-4">
                {(formData.schedule || []).map((item, idx) => (
                  <div key={item.id} className="p-4 rounded-2xl border border-slate-200 bg-[#FAF8FD] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-['Prompt'] font-bold text-[#7043A6]">
                        ลำดับที่ {idx + 1}: {item.topic}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteSchedule(item.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="ลบ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-['Prompt']">
                      <div className="sm:col-span-2">
                        <label className="block text-slate-700 font-semibold mb-1">หัวข้อกิจกรรม</label>
                        <input
                          type="text"
                          value={item.topic}
                          onChange={(e) => {
                            const updated = [...formData.schedule];
                            updated[idx].topic = e.target.value;
                            setFormData({ ...formData, schedule: updated });
                          }}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">สถานะ</label>
                        <select
                          value={item.status}
                          onChange={(e) => {
                            const updated = [...formData.schedule];
                            updated[idx].status = e.target.value as any;
                            setFormData({ ...formData, schedule: updated });
                          }}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                        >
                          <option value="upcoming">กำลังจะมาถึง</option>
                          <option value="ongoing">กำลังดำเนินกิจกรรม</option>
                          <option value="completed">เสร็จสิ้นแล้ว</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">วันที่</label>
                        <input
                          type="text"
                          value={item.date}
                          onChange={(e) => {
                            const updated = [...formData.schedule];
                            updated[idx].date = e.target.value;
                            setFormData({ ...formData, schedule: updated });
                          }}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">เวลา</label>
                        <input
                          type="text"
                          value={item.time}
                          onChange={(e) => {
                            const updated = [...formData.schedule];
                            updated[idx].time = e.target.value;
                            setFormData({ ...formData, schedule: updated });
                          }}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">สถานที่</label>
                        <input
                          type="text"
                          value={item.location}
                          onChange={(e) => {
                            const updated = [...formData.schedule];
                            updated[idx].location = e.target.value;
                            setFormData({ ...formData, schedule: updated });
                          }}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-slate-700 font-semibold mb-1">คำอธิบาย</label>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => {
                            const updated = [...formData.schedule];
                            updated[idx].description = e.target.value;
                            setFormData({ ...formData, schedule: updated });
                          }}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 font-['Sarabun']"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: ANNOUNCEMENTS */}
          {activeTab === 'announcements' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <h3 className="font-['Prompt'] font-bold text-lg text-[#4B267D]">
                    ข่าวสารและประกาศจากคณะกรรมการ
                  </h3>
                  <p className="text-xs font-['Sarabun'] text-slate-500">
                    เพิ่ม แก้ไข ลบ ซ่อน และปักหมุดประกาศ
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddAnnouncement}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-['Prompt'] font-semibold bg-[#FAF8FD] border border-[#7043A6]/30 text-[#4B267D] hover:bg-[#4B267D] hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>เพิ่มประกาศ</span>
                </button>
              </div>

              <div className="space-y-4">
                {(formData.announcements || []).map((ann, idx) => (
                  <div key={ann.id} className="p-4 rounded-2xl border border-slate-200 bg-[#FAF8FD] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-['Prompt'] font-bold text-[#7043A6]">
                          ประกาศ #{idx + 1}
                        </span>
                        <label className="inline-flex items-center gap-1 text-xs text-slate-700 font-['Sarabun']">
                          <input
                            type="checkbox"
                            checked={ann.isPinned}
                            onChange={(e) => {
                              const updated = [...formData.announcements];
                              updated[idx].isPinned = e.target.checked;
                              setFormData({ ...formData, announcements: updated });
                            }}
                            className="rounded text-[#4B267D]"
                          />
                          <span>ปักหมุด</span>
                        </label>
                        <label className="inline-flex items-center gap-1 text-xs text-slate-700 font-['Sarabun']">
                          <input
                            type="checkbox"
                            checked={ann.isActive}
                            onChange={(e) => {
                              const updated = [...formData.announcements];
                              updated[idx].isActive = e.target.checked;
                              setFormData({ ...formData, announcements: updated });
                            }}
                            className="rounded text-[#4B267D]"
                          />
                          <span>แสดง</span>
                        </label>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteAnnouncement(ann.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="ลบ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-['Prompt']">
                      <div className="sm:col-span-2">
                        <label className="block text-slate-700 font-semibold mb-1">หัวข้อประกาศ</label>
                        <input
                          type="text"
                          value={ann.title}
                          onChange={(e) => {
                            const updated = [...formData.announcements];
                            updated[idx].title = e.target.value;
                            setFormData({ ...formData, announcements: updated });
                          }}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">วันที่ประกาศ</label>
                        <input
                          type="text"
                          value={ann.date}
                          onChange={(e) => {
                            const updated = [...formData.announcements];
                            updated[idx].date = e.target.value;
                            setFormData({ ...formData, announcements: updated });
                          }}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">ผู้ประกาศ / ฝ่าย</label>
                        <input
                          type="text"
                          value={ann.author}
                          onChange={(e) => {
                            const updated = [...formData.announcements];
                            updated[idx].author = e.target.value;
                            setFormData({ ...formData, announcements: updated });
                          }}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-slate-700 font-semibold mb-1">เนื้อหาประกาศ</label>
                        <textarea
                          rows={3}
                          value={ann.content}
                          onChange={(e) => {
                            const updated = [...formData.announcements];
                            updated[idx].content = e.target.value;
                            setFormData({ ...formData, announcements: updated });
                          }}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 font-['Sarabun']"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: EXAMS */}
          {activeTab === 'exams' && (
            <div className="space-y-6">
              <h3 className="font-['Prompt'] font-bold text-lg text-[#4B267D] border-b pb-3">
                ตั้งค่าระบบทำแบบทดสอบออนไลน์ (ม.ต้น &amp; ม.ปลาย)
              </h3>

              <div className="space-y-6">
                {(formData.exams || []).map((exam, idx) => (
                  <div key={exam.id} className="p-5 rounded-2xl border border-slate-200 bg-[#FAF8FD] space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-['Prompt'] font-bold text-[#4B267D]">
                        {exam.levelTitle} ({exam.grades})
                      </span>
                      <label className="inline-flex items-center gap-1.5 text-xs text-slate-700 font-['Prompt']">
                        <input
                          type="checkbox"
                          checked={exam.isOpen}
                          onChange={(e) => {
                            const updated = [...formData.exams];
                            updated[idx].isOpen = e.target.checked;
                            setFormData({ ...formData, exams: updated });
                          }}
                          className="rounded text-[#4B267D]"
                        />
                        <span>เปิดให้นักเรียนเข้าทำข้อสอบ</span>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-['Prompt']">
                      <div className="sm:col-span-2">
                        <label className="block text-slate-700 font-semibold mb-1">
                          ลิงก์ Google Forms ของแบบทดสอบ
                        </label>
                        <input
                          type="url"
                          value={exam.formUrl}
                          onChange={(e) => {
                            const updated = [...formData.exams];
                            updated[idx].formUrl = e.target.value;
                            setFormData({ ...formData, exams: updated });
                          }}
                          placeholder="https://docs.google.com/forms/d/..."
                          className="w-full px-3 py-2.5 rounded-lg border border-slate-300 font-mono text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">เวลาทำแบบทดสอบ (นาที)</label>
                        <input
                          type="number"
                          value={exam.timeLimitMinutes}
                          onChange={(e) => {
                            const updated = [...formData.exams];
                            updated[idx].timeLimitMinutes = parseInt(e.target.value, 10) || 45;
                            setFormData({ ...formData, exams: updated });
                          }}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">จำนวนข้อสอบ</label>
                        <input
                          type="number"
                          value={exam.questionCount}
                          onChange={(e) => {
                            const updated = [...formData.exams];
                            updated[idx].questionCount = parseInt(e.target.value, 10) || 20;
                            setFormData({ ...formData, exams: updated });
                          }}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-slate-700 font-semibold mb-1">
                          คำชี้แจงในการทำข้อสอบ (บรรทัดละ ๑ ข้อ)
                        </label>
                        <textarea
                          rows={4}
                          value={exam.instructions.join('\n')}
                          onChange={(e) => {
                            const updated = [...formData.exams];
                            updated[idx].instructions = e.target.value.split('\n').filter((l) => l.trim());
                            setFormData({ ...formData, exams: updated });
                          }}
                          className="w-full px-3 py-2.5 rounded-lg border border-slate-300 font-['Sarabun'] text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: INSTRUCTIONS */}
          {activeTab === 'instructions' && (
            <div className="space-y-6">
              <h3 className="font-['Prompt'] font-bold text-lg text-[#4B267D] border-b pb-3">
                คำชี้แจงระบบตรวจสอบคะแนน &amp; เกียรติบัตร
              </h3>

              <div className="space-y-4 text-xs font-['Prompt']">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    คำชี้แจงหน้าตรวจสอบคะแนน (บรรทัดละ ๑ ข้อ)
                  </label>
                  <textarea
                    rows={4}
                    value={formData.instructions.scoreCheck.join('\n')}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        instructions: {
                          ...formData.instructions,
                          scoreCheck: e.target.value.split('\n').filter((l) => l.trim()),
                        },
                      })
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-['Sarabun'] text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    คำชี้แจงหน้าระบบเกียรติบัตร (บรรทัดละ ๑ ข้อ)
                  </label>
                  <textarea
                    rows={4}
                    value={formData.instructions.certificate.join('\n')}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        instructions: {
                          ...formData.instructions,
                          certificate: e.target.value.split('\n').filter((l) => l.trim()),
                        },
                      })
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-['Sarabun'] text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: FOOTER */}
          {activeTab === 'footer' && (
            <div className="space-y-6">
              <h3 className="font-['Prompt'] font-bold text-lg text-[#4B267D] border-b pb-3">
                ข้อมูลส่วนท้ายเว็บไซต์ (Footer) &amp; ผู้พัฒนาระบบ
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-['Prompt']">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">ชื่อกลุ่มสาระฯ</label>
                  <input
                    type="text"
                    value={formData.footer.department}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        footer: { ...formData.footer, department: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">ชื่อโรงเรียน</label>
                  <input
                    type="text"
                    value={formData.footer.school}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        footer: { ...formData.footer, school: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-300"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">ที่อยู่โรงเรียน</label>
                  <input
                    type="text"
                    value={formData.footer.address}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        footer: { ...formData.footer, address: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-300 font-['Sarabun']"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">โทรศัพท์</label>
                  <input
                    type="text"
                    value={formData.footer.telephone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        footer: { ...formData.footer, telephone: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">โทรสาร</label>
                  <input
                    type="text"
                    value={formData.footer.fax}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        footer: { ...formData.footer, fax: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">อีเมลติดต่อ</label>
                  <input
                    type="email"
                    value={formData.footer.email}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        footer: { ...formData.footer, email: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">เว็บไซต์ทางการ</label>
                  <input
                    type="url"
                    value={formData.footer.websiteUrl}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        footer: { ...formData.footer, websiteUrl: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs"
                  />
                </div>

                <div className="sm:col-span-2 pt-2 border-t">
                  <label className="block text-slate-700 font-semibold mb-1">ชื่อผู้พัฒนาระบบ</label>
                  <input
                    type="text"
                    value={formData.footer.developerName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        footer: { ...formData.footer, developerName: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-300"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">ตำแหน่ง / สถาบัน</label>
                  <input
                    type="text"
                    value={formData.footer.developerRole}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        footer: { ...formData.footer, developerRole: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-300 font-['Sarabun']"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">ช่องทางติดต่อผู้พัฒนา</label>
                  <input
                    type="text"
                    value={formData.footer.developerContact}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        footer: { ...formData.footer, developerContact: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 10: DATABASE & API */}
          {activeTab === 'database' && (
            <div className="space-y-6">
              <h3 className="font-['Prompt'] font-bold text-lg text-[#4B267D] border-b pb-3">
                การตั้งค่าฐานข้อมูล Google Sheets &amp; Cloudflare Worker API
              </h3>

              {/* Database Verification Card */}
              <div className="bg-[#FAF8FD] rounded-2xl p-5 border border-[#D6AF55]/40 space-y-3 font-['Sarabun'] text-xs text-slate-700">
                <div className="flex items-center gap-2 font-['Prompt'] font-bold text-sm text-[#4B267D]">
                  <Database className="w-4 h-4 text-[#D6AF55]" />
                  <span>ข้อมูลแผ่นงานและสเปกการเชื่อมต่อที่ถูกต้อง</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 font-mono text-xs">
                  <div className="bg-white p-2.5 rounded-lg border">
                    <div className="text-[10px] text-slate-400 font-sans">Spreadsheet ID:</div>
                    <div className="font-bold text-[#4B267D] truncate">{APP_CONFIG.SPREADSHEET_ID}</div>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border">
                    <div className="text-[10px] text-slate-400 font-sans">แผ่นงานคะแนน:</div>
                    <div className="font-bold text-[#4B267D]">{APP_CONFIG.SCORE_RANGE}</div>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border">
                    <div className="text-[10px] text-slate-400 font-sans">แผ่นงานเกียรติบัตร:</div>
                    <div className="font-bold text-[#4B267D]">{APP_CONFIG.CERTIFICATE_RANGE}</div>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border">
                    <div className="text-[10px] text-slate-400 font-sans">พื้นที่ CMS สำรอง:</div>
                    <div className="font-bold text-[#4B267D]">{APP_CONFIG.CMS_RANGE} (คอลัมน์ H:O)</div>
                  </div>
                </div>

                <p className="text-slate-600 pt-1">
                  🔒 <strong>การคุ้มครองข้อมูลเดิม:</strong> ระบบจะไม่สร้างแผ่นงานใหม่ ไม่เปลี่ยนชื่อหัวตารางเดิม และไม่เขียนทับข้อมูลในคอลัมน์ A:F เด็ดขาด
                </p>
              </div>

              {/* Google Apps Script Web App URL input */}
              <div className="space-y-3">
                <label className="block text-xs font-['Prompt'] font-semibold text-slate-800">
                  Google Apps Script Web App URL (Exec URL)
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    value={backendUrlInput}
                    onChange={(e) => setBackendUrlInput(e.target.value)}
                    placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                    className="flex-1 px-3 py-2.5 rounded-xl border border-slate-300 font-mono text-xs text-slate-800 outline-none focus:border-[#7043A6]"
                  />
                  <button
                    type="button"
                    onClick={handleTestBackend}
                    disabled={isTestingBackend}
                    className="px-5 py-2.5 rounded-xl font-['Prompt'] font-semibold text-xs text-white bg-[#4B267D] hover:bg-[#30283A] transition-colors flex items-center justify-center gap-2"
                  >
                    {isTestingBackend ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Link className="w-3.5 h-3.5 text-[#D6AF55]" />
                    )}
                    <span>ทดสอบการเชื่อมต่อ</span>
                  </button>
                </div>
                <div className="text-[11px] font-['Sarabun'] text-slate-500 space-y-1">
                  <p>• นำโค้ดจากไฟล์ <code>Code.gs</code> ไปวางใน Google Apps Script ของสเปรดชีต</p>
                  <p>• กด <strong>Deploy (การทำให้ใช้งานได้)</strong> &gt; <strong>New deployment (การทำให้ใช้งานได้ใหม่)</strong> &gt; ประเภท: <strong>Web App (เว็บแอป)</strong></p>
                  <p>• กำหนด Execute as: <strong>Me (ฉัน)</strong> และ Who has access: <strong>Anyone (ทุกคน)</strong> แล้วคัดลอก URL ที่ลงท้ายด้วย <code>/exec</code> มาวางที่นี่</p>
                </div>
              </div>

              {/* Backend Test Result */}
              {backendTestResult && (
                <div
                  className={`p-4 rounded-xl border text-xs font-['Sarabun'] ${
                    backendTestResult.connected
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : 'bg-red-50 border-red-300 text-red-900'
                  }`}
                >
                  <div className="font-['Prompt'] font-bold flex items-center gap-1.5 mb-1">
                    {backendTestResult.connected ? (
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600" />
                    )}
                    <span>
                      {backendTestResult.connected
                        ? 'เชื่อมต่อ Google Apps Script และ Google Sheets สำเร็จ'
                        : 'ไม่สามารถเชื่อมต่อ Google Apps Script ได้'}
                    </span>
                  </div>
                  <p>{backendTestResult.message}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
