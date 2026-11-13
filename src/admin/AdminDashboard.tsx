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
  AlertTriangle,
  HelpCircle,
  Link,
  Shield,
  Eye,
  Copy,
  Download,
  Smartphone,
  Laptop,
  Check,
  ExternalLink,
  Camera,
  FolderOpen,
  Layers,
  GraduationCap,
  Youtube,
  ArrowUp,
  ArrowDown,
  EyeOff,
  PlayCircle,
} from 'lucide-react';
import {
  SiteContent,
  HeroSlide,
  AwardCriterion,
  ScheduleItem,
  AnnouncementItem,
  StudyMaterial,
  DEFAULT_SITE_CONTENT,
  SiteImages,
} from '../config/defaultContent';
import { APP_CONFIG } from '../config/constants';
import { SmartImage } from '../components/SmartImage';
import { isViewerPageUrl, extractYouTubeId } from '../utils/imageUrl';
import {
  saveSiteContent,
  getApiBaseUrl,
  setApiBaseUrl,
  checkBackendHealth,
  getAdminToken,
  setAdminToken,
  getConfigProvenance,
  inspectGasUrl,
  generateAppConfigJson,
  HealthCheckResult,
  setSharedConfigInMemory,
} from '../services/api';

interface AdminDashboardProps {
  content: SiteContent;
  onUpdateContentLocally: (newContent: SiteContent) => void;
  onLogout: () => void;
  isBackendConnected: boolean;
  refreshContent: () => void;
}

type AdminSection =
  | 'meta'
  | 'study'
  | 'media'
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
  const [studyLevelFilter, setStudyLevelFilter] = useState<'all' | 'junior' | 'senior'>('all');
  const [previewStudyId, setPreviewStudyId] = useState<string | null>(null);
  const [formData, setFormData] = useState<SiteContent>(() => {
    const copy: SiteContent = JSON.parse(JSON.stringify(content));
    copy.siteImages = {
      ...DEFAULT_SITE_CONTENT.siteImages,
      ...(copy.siteImages || {}),
    };
    copy.studyMaterials = Array.isArray(copy.studyMaterials) ? copy.studyMaterials : [];
    if (!copy.about.teacherImageUrl) {
      copy.about.teacherImageUrl = 'images/thai_teacher_team_2026.png';
    }
    return copy;
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Backend URL configuration state
  const [backendUrlInput, setBackendUrlInput] = useState(getApiBaseUrl());
  const [isTestingBackend, setIsTestingBackend] = useState(false);
  const [backendTestResult, setBackendTestResult] = useState<HealthCheckResult | null>(null);
  const [copiedConfig, setCopiedConfig] = useState(false);
  const [downloadedConfig, setDownloadedConfig] = useState(false);
  const [configProvenance, setConfigProvenance] = useState(getConfigProvenance());

  const urlInspection = inspectGasUrl(backendUrlInput);

  const handleTestBackend = async () => {
    setIsTestingBackend(true);
    setBackendTestResult(null);
    try {
      const cleanUrl = backendUrlInput.trim();
      setApiBaseUrl(cleanUrl);
      setSharedConfigInMemory({ gasWebAppUrl: cleanUrl });
      const res = await checkBackendHealth(cleanUrl);
      setBackendTestResult(res);
      setConfigProvenance(getConfigProvenance());
      if (res.connected) {
        refreshContent();
      }
    } catch (e: any) {
      setBackendTestResult({
        connected: false,
        provenance: 'local_override',
        url: backendUrlInput,
        isDevUrl: false,
        errorType: 'UNKNOWN',
        message: e?.message || 'การทดสอบล้มเหลว',
        checks: {
          urlFormat: false,
          webAppReachable: false,
          anonymousAccess: false,
          spreadsheetOpen: false,
          scoreSheetExists: false,
          certificateSheetExists: false,
        },
      });
    } finally {
      setIsTestingBackend(false);
    }
  };

  const handleConvertDevToExec = () => {
    if (urlInspection.convertedExecUrl) {
      setBackendUrlInput(urlInspection.convertedExecUrl);
      setApiBaseUrl(urlInspection.convertedExecUrl);
      setSharedConfigInMemory({ gasWebAppUrl: urlInspection.convertedExecUrl });
      setBackendTestResult(null);
    }
  };

  const handleCopyConfig = () => {
    const targetUrl = backendUrlInput.trim() || getApiBaseUrl();
    const jsonStr = generateAppConfigJson(targetUrl);
    navigator.clipboard.writeText(jsonStr);
    setCopiedConfig(true);
    setTimeout(() => setCopiedConfig(false), 3000);
  };

  const handleDownloadConfig = () => {
    const targetUrl = backendUrlInput.trim() || getApiBaseUrl();
    const jsonStr = generateAppConfigJson(targetUrl);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'app-config.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloadedConfig(true);
    setTimeout(() => setDownloadedConfig(false), 3000);
  };

  const handleSaveToSheet = async () => {
    setIsSaving(true);
    setSaveStatus(null);

    const baseUrl = getApiBaseUrl();
    if (!baseUrl) {
      setSaveStatus({
        type: 'error',
        message:
          'ไม่สามารถบันทึกข้อมูลได้: ยังไม่ได้ระบุ Google Apps Script Web App URL กรุณาไปที่แท็บ "ฐานข้อมูล & Google Apps Script" เพื่อระบุ Web App URL ก่อนบันทึกข้อมูลถาวร',
      });
      setIsSaving(false);
      return;
    }

    const token = getAdminToken();
    if (!token) {
      setSaveStatus({
        type: 'error',
        message: 'เซสชันแอดมินหมดอายุหรือไม่ถูกต้อง กรุณาเข้าสู่ระบบใหม่อีกครั้ง',
      });
      setIsSaving(false);
      return;
    }

    const updatedData: SiteContent = {
      ...formData,
      version: (formData.version || 1) + 1,
      updatedAt: new Date().toISOString(),
    };

    try {
      // Persist directly to Google Sheets columns H:O via Google Apps Script (Code.gs)
      const res = await saveSiteContent(updatedData);
      if (res.success && res.verified) {
        // Only update display once confirmed and read back from Google Sheets
        const verifiedData: SiteContent = {
          ...DEFAULT_SITE_CONTENT,
          ...(res.verifiedContent || updatedData),
          siteImages: {
            ...DEFAULT_SITE_CONTENT.siteImages,
            ...((res.verifiedContent || updatedData).siteImages || {}),
          },
          studyMaterials: Array.isArray((res.verifiedContent || updatedData).studyMaterials)
            ? (res.verifiedContent || updatedData).studyMaterials
            : [],
        };
        setFormData(verifiedData);
        onUpdateContentLocally(verifiedData);
        setSaveStatus({
          type: 'success',
          message:
            res.message ||
            'บันทึกข้อมูลถาวรลง Google Sheets สำเร็จเรียบร้อยแล้ว ทุกอุปกรณ์จะได้รับข้อมูลอัปเดตตรงกัน',
        });
        refreshContent();
      } else {
        setSaveStatus({
          type: 'error',
          message:
            res.message ||
            'ไม่สามารถบันทึกข้อมูลลง Google Sheets ได้ (การตรวจสอบข้อมูลล้มเหลว)',
        });
      }
    } catch (err: any) {
      setSaveStatus({
        type: 'error',
        message: `ข้อผิดพลาดในการบันทึกลง Google Sheets: ${err?.message || 'ไม่ทราบสาเหตุ'}`,
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

  const handleAddStudyMaterial = (defaultLevel: 'junior' | 'senior' = 'junior') => {
    const existing = formData.studyMaterials || [];
    const newMaterial: StudyMaterial = {
      id: `study-${Date.now()}`,
      level: defaultLevel,
      type: 'pdf',
      title: 'ชื่อสื่อการเรียนรู้ภาษาไทยใหม่',
      description: 'คำอธิบายเนื้อหาหรือแนวทางทบทวนความรู้...',
      url: '',
      sortOrder: existing.length + 1,
      isActive: true,
    };
    setFormData({
      ...formData,
      studyMaterials: [...existing, newMaterial],
    });
  };

  const handleDeleteStudyMaterial = (id: string) => {
    const remaining = (formData.studyMaterials || [])
      .filter((m) => m.id !== id)
      .map((m, i) => ({ ...m, sortOrder: i + 1 }));
    setFormData({
      ...formData,
      studyMaterials: remaining,
    });
    if (previewStudyId === id) setPreviewStudyId(null);
  };

  const handleMoveStudyMaterial = (id: string, direction: 'up' | 'down') => {
    const sorted = [...(formData.studyMaterials || [])].sort(
      (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)
    );
    const index = sorted.findIndex((m) => m.id === id);
    if (index === -1) return;
    const swapIdx = direction === 'up' ? index - 1 : index + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const temp = sorted[index];
    sorted[index] = sorted[swapIdx];
    sorted[swapIdx] = temp;
    const reindexed = sorted.map((item, idx) => ({ ...item, sortOrder: idx + 1 }));
    setFormData({
      ...formData,
      studyMaterials: reindexed,
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
            { id: 'study' as AdminSection, label: 'จัดการสื่อศึกษาและทบทวนความรู้', icon: GraduationCap },
            { id: 'media' as AdminSection, label: 'จัดการรูปภาพทุกจุด (Media)', icon: Camera },
            { id: 'slides' as AdminSection, label: 'ส่วนหัวเว็บไซต์ (Hero Banner)', icon: Image },
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

          {/* TAB: STUDY RESOURCES MANAGEMENT */}
          {activeTab === 'study' && (() => {
            const allMaterials = [...(formData.studyMaterials || [])].sort(
              (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)
            );
            const filteredMaterials = allMaterials.filter(
              (m) => studyLevelFilter === 'all' || m.level === studyLevelFilter
            );
            const juniorCount = allMaterials.filter((m) => m.level === 'junior').length;
            const seniorCount = allMaterials.filter((m) => m.level === 'senior').length;

            return (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-[#D6AF55]" />
                      <h3 className="font-['Prompt'] font-bold text-lg text-[#4B267D]">
                        จัดการสื่อศึกษาและทบทวนความรู้ด้านภาษาไทย
                      </h3>
                    </div>
                    <p className="text-xs font-['Sarabun'] text-slate-500 mt-1">
                      เพิ่ม แก้ไข จัดลำดับ และเปิด/ปิดการแสดงผลสื่อการเรียนรู้ (PDF และ YouTube) สำหรับระดับ ม.ต้น และ ม.ปลาย
                      แล้วกดปุ่ม &quot;บันทึกข้อมูล (Publish)&quot; ด้านบนเพื่อบันทึกถาวรลง Google Sheets
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleAddStudyMaterial(studyLevelFilter === 'senior' ? 'senior' : 'junior')
                    }
                    className="px-4 py-2 rounded-xl text-xs font-['Prompt'] font-semibold bg-[#4B267D] text-white hover:bg-[#30283A] transition-colors flex items-center gap-1.5 shrink-0 shadow-xs"
                  >
                    <Plus className="w-4 h-4 text-[#D6AF55]" />
                    <span>เพิ่มสื่อการเรียนรู้</span>
                  </button>
                </div>

                {/* Level Filter Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-[#FAF8FD] p-3 rounded-2xl border border-slate-200">
                  <div className="flex flex-wrap items-center gap-1.5 font-['Prompt'] text-xs">
                    {[
                      { id: 'all' as const, label: `ทั้งหมด (${allMaterials.length})` },
                      { id: 'junior' as const, label: `ม.ต้น ม.1–ม.3 (${juniorCount})` },
                      { id: 'senior' as const, label: `ม.ปลาย ม.4–ม.6 (${seniorCount})` },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setStudyLevelFilter(f.id)}
                        className={`px-3 py-1.5 rounded-xl font-medium transition-colors ${
                          studyLevelFilter === f.id
                            ? 'bg-[#4B267D] text-white shadow-2xs'
                            : 'bg-white text-slate-600 border border-slate-200 hover:text-[#4B267D]'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                  <span className="text-[11px] font-['Sarabun'] text-slate-500">
                    * ข้อมูลสื่อจะถูกเก็บในคอลัมน์ CMS ของแผ่นงานตรวจสอบคะแนน (ไม่แตะต้องคอลัมน์ A–F)
                  </span>
                </div>

                {/* Study Materials List */}
                {filteredMaterials.length === 0 ? (
                  <div className="py-12 px-4 text-center rounded-2xl border border-dashed border-slate-300 bg-[#FAF8FD]/50">
                    <GraduationCap className="w-10 h-10 text-[#7043A6]/50 mx-auto mb-2" />
                    <p className="font-['Prompt'] font-semibold text-sm text-[#30283A]">
                      ยังไม่มีรายการสื่อการเรียนรู้ในหมวดนี้
                    </p>
                    <p className="text-xs font-['Sarabun'] text-slate-500 mt-1">
                      กดปุ่ม &quot;เพิ่มสื่อการเรียนรู้&quot; ด้านบนเพื่อเพิ่มลิงก์เอกสาร PDF หรือวิดีโอ YouTube
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredMaterials.map((item) => {
                      const realIndex = (formData.studyMaterials || []).findIndex(
                        (m) => m.id === item.id
                      );
                      const isPreviewOpen = previewStudyId === item.id;
                      const ytId = item.type === 'youtube' ? extractYouTubeId(item.url) : null;
                      const updateItem = (patch: Partial<StudyMaterial>) => {
                        const updated = [...(formData.studyMaterials || [])];
                        if (realIndex !== -1) {
                          updated[realIndex] = { ...updated[realIndex], ...patch };
                          setFormData({ ...formData, studyMaterials: updated });
                        }
                      };

                      return (
                        <div
                          key={item.id}
                          className={`p-5 rounded-2xl border space-y-4 transition-colors ${
                            item.isActive
                              ? 'border-slate-200 bg-[#FAF8FD]'
                              : 'border-slate-200 bg-slate-100/70 opacity-80'
                          }`}
                        >
                          {/* Header Controls */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200/80">
                            <div className="flex flex-wrap items-center gap-3">
                              <span className="text-xs font-['Prompt'] font-bold text-[#4B267D]">
                                ลำดับที่ {item.sortOrder || realIndex + 1}
                              </span>
                              <span className="text-slate-300">·</span>
                              <span className="inline-flex items-center gap-1 text-xs font-['Prompt'] font-semibold text-[#7043A6]">
                                {item.type === 'pdf' ? (
                                  <FileText className="w-3.5 h-3.5 text-amber-700" />
                                ) : (
                                  <Youtube className="w-3.5 h-3.5 text-red-600" />
                                )}
                                <span>{item.type === 'pdf' ? 'เอกสาร PDF' : 'วิดีโอ YouTube'}</span>
                              </span>
                              <label className="inline-flex items-center gap-1.5 text-xs font-['Prompt'] text-slate-700 cursor-pointer ml-2">
                                <input
                                  type="checkbox"
                                  checked={item.isActive !== false}
                                  onChange={(e) => updateItem({ isActive: e.target.checked })}
                                  className="rounded text-[#4B267D]"
                                />
                                <span>
                                  {item.isActive !== false ? (
                                    <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                                      <Eye className="w-3.5 h-3.5" />
                                      แสดงบนหน้าเว็บ
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-slate-500">
                                      <EyeOff className="w-3.5 h-3.5" />
                                      ซ่อนไว้ชั่วคราว
                                    </span>
                                  )}
                                </span>
                              </label>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleMoveStudyMaterial(item.id, 'up')}
                                title="เลื่อนขึ้น"
                                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-[#4B267D] hover:border-[#7043A6]"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveStudyMaterial(item.id, 'down')}
                                title="เลื่อนลง"
                                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-[#4B267D] hover:border-[#7043A6]"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteStudyMaterial(item.id)}
                                title="ลบรายการ"
                                className="p-1.5 rounded-lg border border-red-200 bg-white text-red-500 hover:bg-red-50 hover:text-red-700 ml-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Fields Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-['Prompt']">
                            <div>
                              <label className="block text-slate-700 font-semibold mb-1">
                                ระดับชั้น
                              </label>
                              <select
                                value={item.level}
                                onChange={(e) =>
                                  updateItem({ level: e.target.value as 'junior' | 'senior' })
                                }
                                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                              >
                                <option value="junior">ระดับมัธยมศึกษาตอนต้น (ม.1–ม.3)</option>
                                <option value="senior">ระดับมัธยมศึกษาตอนปลาย (ม.4–ม.6)</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-slate-700 font-semibold mb-1">
                                ประเภทสื่อการเรียนรู้
                              </label>
                              <select
                                value={item.type}
                                onChange={(e) =>
                                  updateItem({ type: e.target.value as 'pdf' | 'youtube' })
                                }
                                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                              >
                                <option value="pdf">เอกสาร PDF (ใบความรู้ / เอกสารทบทวน)</option>
                                <option value="youtube">วิดีโอ YouTube (วิดีโอการสอน / ทบทวน)</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-slate-700 font-semibold mb-1">
                                ลำดับการแสดงผล
                              </label>
                              <input
                                type="number"
                                min={1}
                                value={item.sortOrder || 1}
                                onChange={(e) =>
                                  updateItem({ sortOrder: parseInt(e.target.value, 10) || 1 })
                                }
                                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white tabular-nums"
                              />
                            </div>

                            <div className="sm:col-span-3">
                              <label className="block text-slate-700 font-semibold mb-1">
                                ชื่อสื่อการเรียนรู้
                              </label>
                              <input
                                type="text"
                                value={item.title}
                                onChange={(e) => updateItem({ title: e.target.value })}
                                placeholder="เช่น สรุปหลักภาษาไทย ม.ต้น หรือ ติวเข้มวรรณคดีไทย ม.ปลาย"
                                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                              />
                            </div>

                            <div className="sm:col-span-3">
                              <label className="block text-slate-700 font-semibold mb-1">
                                คำอธิบายเนื้อหา
                              </label>
                              <textarea
                                rows={2}
                                value={item.description}
                                onChange={(e) => updateItem({ description: e.target.value })}
                                placeholder="อธิบายหัวข้อและเนื้อหาสำคัญในสื่อการเรียนรู้นี้..."
                                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-['Sarabun']"
                              />
                            </div>

                            <div className="sm:col-span-3">
                              <label className="block text-slate-700 font-semibold mb-1">
                                URL ของสื่อ ({item.type === 'pdf' ? 'ลิงก์ PDF / Google Drive PDF' : 'ลิงก์ YouTube'})
                              </label>
                              <div className="flex flex-col sm:flex-row gap-2">
                                <input
                                  type="url"
                                  value={item.url}
                                  onChange={(e) => updateItem({ url: e.target.value })}
                                  placeholder={
                                    item.type === 'pdf'
                                      ? 'https://drive.google.com/file/d/.../view หรือ https://.../document.pdf'
                                      : 'https://www.youtube.com/watch?v=... หรือ https://youtu.be/...'
                                  }
                                  className="flex-1 px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono text-xs"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    setPreviewStudyId(isPreviewOpen ? null : item.id)
                                  }
                                  disabled={!item.url.trim()}
                                  className="px-3.5 py-2 rounded-lg border border-[#7043A6]/30 bg-white text-[#4B267D] hover:bg-[#4B267D] hover:text-white transition-colors font-semibold inline-flex items-center justify-center gap-1.5 disabled:opacity-40 whitespace-nowrap"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>{isPreviewOpen ? 'ซ่อนตัวอย่าง' : 'ดูตัวอย่างลิงก์ก่อนบันทึก'}</span>
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Link Preview Box before Saving */}
                          {isPreviewOpen && item.url.trim() && (
                            <div className="rounded-xl border border-[#D6AF55]/50 bg-white p-4 space-y-3">
                              <div className="flex items-center justify-between gap-2 text-xs font-['Prompt']">
                                <span className="font-semibold text-[#4B267D] flex items-center gap-1.5">
                                  <PlayCircle className="w-4 h-4 text-[#D6AF55]" />
                                  <span>ตรวจสอบตัวอย่างลิงก์สื่อก่อนบันทึก</span>
                                </span>
                                <a
                                  href={item.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[#7043A6] hover:underline font-semibold"
                                >
                                  <span>เปิดลิงก์จริงในแท็บใหม่</span>
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              </div>

                              {item.type === 'youtube' ? (
                                ytId ? (
                                  <div className="aspect-video max-w-lg rounded-lg overflow-hidden border border-slate-200 bg-black">
                                    <iframe
                                      src={`https://www.youtube.com/embed/${ytId}`}
                                      title={item.title}
                                      className="w-full h-full"
                                      allowFullScreen
                                    />
                                  </div>
                                ) : (
                                  <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs font-['Sarabun'] text-amber-900">
                                    ไม่พบรหัสวิดีโอ YouTube ที่ถูกต้องใน URL นี้ กรุณาตรวจสอบลิงก์ เช่น{' '}
                                    <code>https://www.youtube.com/watch?v=...</code> หรือ{' '}
                                    <code>https://youtu.be/...</code>
                                  </div>
                                )
                              ) : (
                                <div className="text-xs font-['Sarabun'] text-slate-600 space-y-2">
                                  <div className="p-3 rounded-lg bg-[#FAF8FD] border border-slate-200 flex items-center justify-between gap-3">
                                    <div className="truncate font-mono text-[11px] text-slate-700">
                                      {item.url}
                                    </div>
                                    <a
                                      href={item.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="px-3 py-1.5 rounded-lg bg-[#4B267D] text-white font-['Prompt'] font-semibold shrink-0 inline-flex items-center gap-1"
                                    >
                                      <span>ทดสอบเปิดเอกสาร PDF</span>
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}

          {/* TAB: MEDIA & ALL IMAGES */}
          {activeTab === 'media' && (
            <div className="space-y-8">
              <div className="border-b pb-4">
                <div className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-[#D6AF55]" />
                  <h3 className="font-['Prompt'] font-bold text-lg text-[#4B267D]">
                    ศูนย์จัดการรูปภาพและสื่อทั้งหมดในเว็บไซต์ (Media Center)
                  </h3>
                </div>
                <p className="text-xs font-['Sarabun'] text-slate-500 mt-1">
                  ปรับเปลี่ยนและจัดการรูปภาพทุกตำแหน่งบนเว็บไซต์: โลโก้, แบนเนอร์, ภาพพื้นหลัง, ภาพสไลด์, ภาพคณะครู และภาพประกอบทุกหน้า
                  โดยข้อมูลจะถูกบันทึกถาวรลง Google Sheets และแสดงผลตรงกันทุกอุปกรณ์ทันที
                </p>
              </div>

              {/* SECTION A: PRESET & LOCAL ASSETS GALLERY */}
              <div className="bg-[#FAF8FD] rounded-2xl p-5 border border-[#D6AF55]/40 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="w-4 h-4 text-[#7043A6]" />
                    <h4 className="font-['Prompt'] font-bold text-sm text-[#4B267D]">
                      คลังไฟล์ภาพในระบบ (Preset System Assets)
                    </h4>
                  </div>
                  <span className="text-[11px] font-['Sarabun'] text-slate-500">
                    * รูปภาพที่รวมอยู่ในโฟลเดอร์ <code>public/images/</code> พร้อมเรียกใช้ทุกเครื่อง
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    {
                      name: 'โลโก้ตัวอักษร "สืบศิลป์ถิ่นอักษรฯ" (PNG โปร่งใส)',
                      url: 'images/ครูไทยวิเศษฯ-2026 (1).png',
                      desc: 'โลโก้หลักส่วนหัวเว็บไซต์ (Hero Static Logo)',
                      type: 'heroLogo' as const,
                      targetKey: 'heroLogoUrl' as keyof SiteImages,
                    },
                    {
                      name: 'ตรากลุ่มสาระฯ ภาษาไทย WSK',
                      url: 'images/school_wsk_emblem_1794141246706.jpg',
                      desc: 'โลโก้หัวเว็บ / โลโก้ท้ายเว็บ / Favicon',
                      type: 'logo' as const,
                      targetKey: 'headerLogoUrl' as keyof SiteImages,
                    },
                    {
                      name: 'แบนเนอร์หลัก "สืบศิลป์ถิ่นอักษร"',
                      url: 'images/hero_thai_wsk_banner_1794141245856.jpg',
                      desc: 'ภาพแบนเนอร์โครงการภาษาไทย',
                      type: 'hero' as const,
                      targetKey: 'heroBackgroundUrl' as keyof SiteImages,
                    },
                    {
                      name: 'ภาพคณะครูภาษาไทยวิเศษฯ ๒๕๖๙',
                      url: 'images/thai_teacher_team_2026.png',
                      desc: 'ภาพคุณครูในส่วนเกี่ยวกับโครงการ / ข่าวสาร',
                      type: 'teacher' as const,
                      targetKey: 'aboutTeacherTeamUrl' as keyof SiteImages,
                    },
                    {
                      name: 'ภาพการจัดสอบและวิชาการ',
                      url: 'images/about_academic_thai_1794141247386.jpg',
                      desc: 'ภาพหลัก About / แบนเนอร์หน้าทำแบบทดสอบ',
                      type: 'about' as const,
                      targetKey: 'aboutMainImageUrl' as keyof SiteImages,
                    },
                    {
                      name: 'ภาพประกวดวรรณคดีและสุนทรภู่',
                      url: 'images/thai_literature_contest_1794141246113.jpg',
                      desc: 'ภาพประกอบรอง About / แบนเนอร์เกียรติบัตร',
                      type: 'contest' as const,
                      targetKey: 'aboutSecondaryImageUrl' as keyof SiteImages,
                    },
                  ].map((asset, idx) => (
                    <div
                      key={idx}
                      className="bg-white rounded-xl p-3 border border-slate-200 shadow-2xs space-y-2.5 flex flex-col justify-between"
                    >
                      <div>
                        <div className="h-28 rounded-lg overflow-hidden border border-slate-100 relative group">
                          <SmartImage
                            src={asset.url}
                            alt={asset.name}
                            fallbackType={asset.type}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            containerClassName="w-full h-full"
                          />
                        </div>
                        <div className="mt-2">
                          <p className="font-['Prompt'] font-bold text-xs text-[#30283A] truncate">
                            {asset.name}
                          </p>
                          <p className="text-[11px] font-['Sarabun'] text-slate-500 mt-0.5">
                            {asset.desc}
                          </p>
                          <code className="text-[10px] text-slate-400 font-mono block mt-1 truncate">
                            {asset.url}
                          </code>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5 font-['Prompt'] text-[11px]">
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(asset.url);
                            alert(`คัดลอก URL: ${asset.url} เรียบร้อยแล้ว`);
                          }}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3" />
                          <span>คัดลอก</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              siteImages: {
                                ...formData.siteImages,
                                [asset.targetKey]: asset.url,
                              },
                              ...(asset.targetKey === 'aboutMainImageUrl'
                                ? { about: { ...formData.about, imageUrl: asset.url } }
                                : {}),
                              ...(asset.targetKey === 'aboutSecondaryImageUrl'
                                ? { about: { ...formData.about, secondaryImageUrl: asset.url } }
                                : {}),
                              ...(asset.targetKey === 'aboutTeacherTeamUrl'
                                ? { about: { ...formData.about, teacherImageUrl: asset.url } }
                                : {}),
                            });
                          }}
                          className="px-2 py-1 rounded bg-[#7043A6]/10 hover:bg-[#7043A6] hover:text-white text-[#4B267D] font-semibold transition-colors"
                        >
                          <span>ใช้งานจุดนี้</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION B: PLACEMENT IMAGE CONTROLS WITH LIVE PREVIEW */}
              <div className="space-y-6">
                <div>
                  <h4 className="font-['Prompt'] font-bold text-base text-[#4B267D] flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#D6AF55]" />
                    <span>กำหนดรูปภาพแยกตามตำแหน่งที่ใช้งานบนเว็บไซต์</span>
                  </h4>
                  <p className="text-xs font-['Sarabun'] text-slate-500">
                    กรอก URL รูปภาพ (สามารถใช้ภาพในระบบ หรือลิงก์จาก ImgBB, Cloudinary, Google Drive) พร้อมดูตัวอย่างจริงด้านขวา
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 0. Hero Static Project Logo */}
                  <div className="md:col-span-2 bg-[#FAF8FD] p-5 rounded-2xl border border-[#D6AF55]/50 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-['Prompt'] font-bold text-sm text-[#4B267D]">
                        ๐. โลโก้หลักส่วนหัวเว็บไซต์ (Hero Section Static Logo — ภาพนิ่ง object-contain)
                      </span>
                      <span className="text-[11px] font-['Prompt'] text-[#7043A6] font-semibold">
                        แสดงเด่นบน Hero Section หน้าแรก
                      </span>
                    </div>

                    {(!formData.siteImages?.heroLogoUrl?.trim() ||
                      isViewerPageUrl(formData.siteImages?.heroLogoUrl)) && (
                      <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-xs font-['Sarabun'] text-amber-950 space-y-1.5">
                        <div className="flex items-center gap-2 font-['Prompt'] font-bold text-amber-900">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>สถานะสำหรับผู้ดูแล: ต้องการ Direct Image URL ของโลโก้โครงการ</span>
                        </div>
                        <p>
                          ลิงก์ <code>https://pic.in.th/image/VSp8m6</code> เป็นหน้าเว็บดูรูปภาพที่ติดสิทธิ์เข้าสู่ระบบ (<code>pic.in.th/login</code>) จึงไม่สามารถดึงภาพโดยตรงได้ กรุณาวาง <strong>Direct Image URL จริง</strong> (เช่น <code>https://.../logo.png</code>) หรือเลือกใช้ไฟล์ภาพโลโก้ในระบบด้านล่าง
                        </p>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                      <div className="w-full sm:w-56 h-32 rounded-xl border border-[#D6AF55]/50 overflow-hidden shrink-0 bg-gradient-to-br from-[#2B154A] to-[#4B267D] p-3 flex items-center justify-center">
                        <SmartImage
                          src={formData.siteImages?.heroLogoUrl || 'images/ครูไทยวิเศษฯ-2026 (1).png'}
                          alt="ตัวอย่างโลโก้ Hero Section"
                          fallbackType="heroLogo"
                          className="w-full h-full object-contain"
                          containerClassName="w-full h-full flex items-center justify-center"
                        />
                      </div>
                      <div className="flex-1 w-full space-y-2">
                        <input
                          type="text"
                          value={formData.siteImages?.heroLogoUrl || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              siteImages: {
                                ...formData.siteImages,
                                heroLogoUrl: e.target.value,
                              },
                            })
                          }
                          placeholder="วาง Direct Image URL (.png/.jpg/.webp) หรือ images/ครูไทยวิเศษฯ-2026 (1).png"
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs bg-white"
                        />
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setFormData({
                                ...formData,
                                siteImages: {
                                  ...formData.siteImages,
                                  heroLogoUrl: 'images/ครูไทยวิเศษฯ-2026 (1).png',
                                },
                              })
                            }
                            className="px-3 py-1.5 rounded-lg bg-[#4B267D] text-white text-[11px] font-['Prompt'] font-semibold hover:bg-[#30283A] transition-colors"
                          >
                            ใช้ไฟล์โลโก้ตัวอักษรทองในระบบ (ครูไทยวิเศษฯ-2026)
                          </button>
                          <span className="text-[11px] text-slate-500 font-['Sarabun']">
                            แสดงผลแบบ object-fit: contain ไม่ครอบตัดรายละเอียดภาพ
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 1. Header Logo */}
                  <div className="bg-[#FAF8FD] p-4 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-['Prompt'] font-bold text-xs text-[#4B267D]">
                        ๑. โลโก้หัวเว็บ / แถบเมนูด้านบน (Header Logo)
                      </span>
                      <span className="text-[10px] bg-purple-100 text-[#4B267D] px-2 py-0.5 rounded-full font-['Prompt']">
                        Navbar
                      </span>
                    </div>

                    <div className="flex gap-3">
                      <div className="w-16 h-16 rounded-full border border-[#D6AF55] overflow-hidden shrink-0 bg-white">
                        <SmartImage
                          src={formData.siteImages?.headerLogoUrl}
                          alt="ตัวอย่างโลโก้"
                          fallbackType="logo"
                          className="w-full h-full object-cover"
                          containerClassName="w-full h-full"
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        <input
                          type="text"
                          value={formData.siteImages?.headerLogoUrl || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              siteImages: {
                                ...formData.siteImages,
                                headerLogoUrl: e.target.value,
                              },
                            })
                          }
                          placeholder="images/school_wsk_emblem_1794141246706.jpg"
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs"
                        />
                        <p className="text-[11px] text-slate-500 font-['Sarabun']">
                          แสดงในวงกลมขอบทองบนแถบเมนูด้านบนของทุกหน้า
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 2. Footer Logo */}
                  <div className="bg-[#FAF8FD] p-4 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-['Prompt'] font-bold text-xs text-[#4B267D]">
                        ๒. โลโก้ส่วนท้ายเว็บไซต์ (Footer Logo)
                      </span>
                      <span className="text-[10px] bg-purple-100 text-[#4B267D] px-2 py-0.5 rounded-full font-['Prompt']">
                        Footer
                      </span>
                    </div>

                    <div className="flex gap-3">
                      <div className="w-16 h-16 rounded-full border border-[#D6AF55] overflow-hidden shrink-0 bg-[#30283A]">
                        <SmartImage
                          src={formData.siteImages?.footerLogoUrl || formData.siteImages?.headerLogoUrl}
                          alt="ตัวอย่างโลโก้ Footer"
                          fallbackType="logo"
                          className="w-full h-full object-cover"
                          containerClassName="w-full h-full"
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        <input
                          type="text"
                          value={formData.siteImages?.footerLogoUrl || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              siteImages: {
                                ...formData.siteImages,
                                footerLogoUrl: e.target.value,
                              },
                            })
                          }
                          placeholder="images/school_wsk_emblem_1794141246706.jpg"
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs"
                        />
                        <p className="text-[11px] text-slate-500 font-['Sarabun']">
                          แสดงข้างชื่อโรงเรียนและข้อมูลติดต่อส่วนท้ายเว็บ
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 3. Hero Background */}
                  <div className="bg-[#FAF8FD] p-4 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-['Prompt'] font-bold text-xs text-[#4B267D]">
                        ๓. ภาพพื้นหลังส่วนหัว (Hero Banner Background)
                      </span>
                      <span className="text-[10px] bg-purple-100 text-[#4B267D] px-2 py-0.5 rounded-full font-['Prompt']">
                        Hero Section
                      </span>
                    </div>

                    <div className="h-28 rounded-xl overflow-hidden border border-slate-200 bg-slate-900">
                      <SmartImage
                        src={formData.siteImages?.heroBackgroundUrl}
                        alt="Hero Background"
                        fallbackType="hero"
                        className="w-full h-full object-cover"
                        containerClassName="w-full h-full"
                      />
                    </div>

                    <input
                      type="text"
                      value={formData.siteImages?.heroBackgroundUrl || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          siteImages: {
                            ...formData.siteImages,
                            heroBackgroundUrl: e.target.value,
                          },
                        })
                      }
                      placeholder="images/hero_thai_wsk_banner_1794141245856.jpg"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs"
                    />
                  </div>

                  {/* 4. Teacher Team Image */}
                  <div className="bg-[#FAF8FD] p-4 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-['Prompt'] font-bold text-xs text-[#4B267D]">
                        ๔. ภาพคณะครูกลุ่มสาระการเรียนรู้ภาษาไทย (Teacher Team)
                      </span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-['Prompt']">
                        About &amp; Team
                      </span>
                    </div>

                    <div className="h-28 rounded-xl overflow-hidden border border-slate-200 bg-slate-900">
                      <SmartImage
                        src={formData.siteImages?.aboutTeacherTeamUrl || formData.about?.teacherImageUrl}
                        alt="ภาพคณะครูภาษาไทย"
                        fallbackType="teacher"
                        className="w-full h-full object-cover"
                        containerClassName="w-full h-full"
                      />
                    </div>

                    <input
                      type="text"
                      value={formData.siteImages?.aboutTeacherTeamUrl || formData.about?.teacherImageUrl || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          siteImages: {
                            ...formData.siteImages,
                            aboutTeacherTeamUrl: e.target.value,
                          },
                          about: {
                            ...formData.about,
                            teacherImageUrl: e.target.value,
                          },
                        })
                      }
                      placeholder="images/thai_teacher_team_2026.png"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs"
                    />
                  </div>

                  {/* 5. About Main Image */}
                  <div className="bg-[#FAF8FD] p-4 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-['Prompt'] font-bold text-xs text-[#4B267D]">
                        ๕. ภาพหลักส่วน &quot;เกี่ยวกับโครงการ&quot; (About Main)
                      </span>
                      <span className="text-[10px] bg-purple-100 text-[#4B267D] px-2 py-0.5 rounded-full font-['Prompt']">
                        About
                      </span>
                    </div>

                    <div className="h-28 rounded-xl overflow-hidden border border-slate-200 bg-slate-900">
                      <SmartImage
                        src={formData.siteImages?.aboutMainImageUrl || formData.about?.imageUrl}
                        alt="About Main"
                        fallbackType="about"
                        className="w-full h-full object-cover"
                        containerClassName="w-full h-full"
                      />
                    </div>

                    <input
                      type="text"
                      value={formData.siteImages?.aboutMainImageUrl || formData.about?.imageUrl || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          siteImages: {
                            ...formData.siteImages,
                            aboutMainImageUrl: e.target.value,
                          },
                          about: {
                            ...formData.about,
                            imageUrl: e.target.value,
                          },
                        })
                      }
                      placeholder="images/about_academic_thai_1794141247386.jpg"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs"
                    />
                  </div>

                  {/* 6. About Secondary Image */}
                  <div className="bg-[#FAF8FD] p-4 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-['Prompt'] font-bold text-xs text-[#4B267D]">
                        ๖. ภาพประกอบรองส่วน &quot;เกี่ยวกับโครงการ&quot; (About Secondary)
                      </span>
                      <span className="text-[10px] bg-purple-100 text-[#4B267D] px-2 py-0.5 rounded-full font-['Prompt']">
                        About
                      </span>
                    </div>

                    <div className="h-28 rounded-xl overflow-hidden border border-slate-200 bg-slate-900">
                      <SmartImage
                        src={formData.siteImages?.aboutSecondaryImageUrl || formData.about?.secondaryImageUrl}
                        alt="About Secondary"
                        fallbackType="contest"
                        className="w-full h-full object-cover"
                        containerClassName="w-full h-full"
                      />
                    </div>

                    <input
                      type="text"
                      value={formData.siteImages?.aboutSecondaryImageUrl || formData.about?.secondaryImageUrl || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          siteImages: {
                            ...formData.siteImages,
                            aboutSecondaryImageUrl: e.target.value,
                          },
                          about: {
                            ...formData.about,
                            secondaryImageUrl: e.target.value,
                          },
                        })
                      }
                      placeholder="images/thai_literature_contest_1794141246113.jpg"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs"
                    />
                  </div>

                  {/* 7. Exam Banner */}
                  <div className="bg-[#FAF8FD] p-4 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-['Prompt'] font-bold text-xs text-[#4B267D]">
                        ๗. แบนเนอร์หน้าระบบทำแบบทดสอบ (Exam Page Banner)
                      </span>
                      <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-['Prompt']">
                        Exam
                      </span>
                    </div>

                    <div className="h-28 rounded-xl overflow-hidden border border-slate-200 bg-slate-900">
                      <SmartImage
                        src={formData.siteImages?.examBannerUrl}
                        alt="Exam Banner"
                        fallbackType="about"
                        className="w-full h-full object-cover"
                        containerClassName="w-full h-full"
                      />
                    </div>

                    <input
                      type="text"
                      value={formData.siteImages?.examBannerUrl || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          siteImages: {
                            ...formData.siteImages,
                            examBannerUrl: e.target.value,
                          },
                        })
                      }
                      placeholder="images/about_academic_thai_1794141247386.jpg"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs"
                    />
                  </div>

                  {/* 8. Certificate Banner */}
                  <div className="bg-[#FAF8FD] p-4 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-['Prompt'] font-bold text-xs text-[#4B267D]">
                        ๘. แบนเนอร์หน้าเกียรติบัตร (Certificate Banner)
                      </span>
                      <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-['Prompt']">
                        Certificate
                      </span>
                    </div>

                    <div className="h-28 rounded-xl overflow-hidden border border-slate-200 bg-slate-900">
                      <SmartImage
                        src={formData.siteImages?.certificateBannerUrl}
                        alt="Certificate Banner"
                        fallbackType="contest"
                        className="w-full h-full object-cover"
                        containerClassName="w-full h-full"
                      />
                    </div>

                    <input
                      type="text"
                      value={formData.siteImages?.certificateBannerUrl || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          siteImages: {
                            ...formData.siteImages,
                            certificateBannerUrl: e.target.value,
                          },
                        })
                      }
                      placeholder="images/thai_literature_contest_1794141246113.jpg"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: HERO TEXT & LEGACY SLIDES */}
          {activeTab === 'slides' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <h3 className="font-['Prompt'] font-bold text-lg text-[#4B267D]">
                    จัดการข้อความส่วนหัวเว็บไซต์ (Hero Section)
                  </h3>
                  <p className="text-xs font-['Sarabun'] text-slate-500">
                    * ส่วนหัวเว็บไซต์แสดงโลโก้โครงการแบบภาพนิ่ง (เปลี่ยนโลโก้ได้ที่แท็บ &quot;จัดการรูปภาพทุกจุด&quot;) และใช้ข้อความหลักจากรายการลำดับที่ 1 ด้านล่าง
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddSlide}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-['Prompt'] font-semibold bg-[#FAF8FD] border border-[#7043A6]/30 text-[#4B267D] hover:bg-[#4B267D] hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>เพิ่มรายการข้อความ</span>
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
                      <div className="sm:col-span-2 flex gap-3 items-center">
                        <div className="w-24 h-16 rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-slate-900">
                          <SmartImage
                            src={slide.imageUrl}
                            alt={slide.title}
                            fallbackType="hero"
                            className="w-full h-full object-cover"
                            containerClassName="w-full h-full"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-slate-700 font-semibold mb-1">
                            URL ของรูปภาพสไลด์ (ImgBB / Cloudinary / หรือพาธภายใน เช่น images/...)
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

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="space-y-2">
                    <label className="block text-slate-700 font-semibold">
                      URL รูปภาพหลัก (About Main)
                    </label>
                    <div className="h-24 rounded-lg overflow-hidden border border-slate-200 bg-slate-900">
                      <SmartImage
                        src={formData.about.imageUrl}
                        alt="ภาพหลัก About"
                        fallbackType="about"
                        className="w-full h-full object-cover"
                        containerClassName="w-full h-full"
                      />
                    </div>
                    <input
                      type="text"
                      value={formData.about.imageUrl}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          about: { ...formData.about, imageUrl: e.target.value },
                          siteImages: {
                            ...formData.siteImages,
                            aboutMainImageUrl: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-slate-700 font-semibold">
                      URL รูปภาพประกอบรอง (Literary)
                    </label>
                    <div className="h-24 rounded-lg overflow-hidden border border-slate-200 bg-slate-900">
                      <SmartImage
                        src={formData.about.secondaryImageUrl}
                        alt="ภาพประกอบ About"
                        fallbackType="contest"
                        className="w-full h-full object-cover"
                        containerClassName="w-full h-full"
                      />
                    </div>
                    <input
                      type="text"
                      value={formData.about.secondaryImageUrl}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          about: { ...formData.about, secondaryImageUrl: e.target.value },
                          siteImages: {
                            ...formData.siteImages,
                            aboutSecondaryImageUrl: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-slate-700 font-semibold">
                      URL ภาพคณะครูภาษาไทย (Team)
                    </label>
                    <div className="h-24 rounded-lg overflow-hidden border border-slate-200 bg-slate-900">
                      <SmartImage
                        src={formData.about.teacherImageUrl || formData.siteImages?.aboutTeacherTeamUrl}
                        alt="ภาพคณะครูภาษาไทย"
                        fallbackType="teacher"
                        className="w-full h-full object-cover"
                        containerClassName="w-full h-full"
                      />
                    </div>
                    <input
                      type="text"
                      value={formData.about.teacherImageUrl || formData.siteImages?.aboutTeacherTeamUrl || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          about: { ...formData.about, teacherImageUrl: e.target.value },
                          siteImages: {
                            ...formData.siteImages,
                            aboutTeacherTeamUrl: e.target.value,
                          },
                        })
                      }
                      placeholder="images/thai_teacher_team_2026.png"
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

                      <div className="sm:col-span-2">
                        <label className="block text-slate-700 font-semibold mb-1">
                          URL รูปภาพประกอบประกาศ (ระบุ images/... หรือ URL ภายนอก)
                        </label>
                        <div className="flex items-center gap-3">
                          {ann.imageUrl && (
                            <div className="w-16 h-12 rounded-lg overflow-hidden border border-slate-300 bg-slate-900 shrink-0">
                              <SmartImage
                                src={ann.imageUrl}
                                alt={ann.title}
                                fallbackType="contest"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <input
                            type="text"
                            value={ann.imageUrl || ''}
                            onChange={(e) => {
                              const updated = [...formData.announcements];
                              updated[idx].imageUrl = e.target.value;
                              setFormData({ ...formData, announcements: updated });
                            }}
                            placeholder="images/thai_literature_contest_1794141246113.jpg หรือ URL รูปภาพ"
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs"
                          />
                        </div>
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
                การตั้งค่าฐานข้อมูล Google Sheets &amp; Google Apps Script
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

              {/* Shared Configuration Provenance Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-['Prompt']">
                <div>
                  <span className="text-slate-500 block text-[11px]">แหล่งที่มาของการตั้งค่าปัจจุบัน:</span>
                  <div className="font-bold text-[#4B267D] text-sm mt-0.5 flex items-center gap-2">
                    {configProvenance === 'shared_file' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                        <Smartphone className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Shared Config (app-config.json) — ใช้งานได้ทุกอุปกรณ์</span>
                      </span>
                    )}
                    {configProvenance === 'local_override' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-semibold">
                        <Laptop className="w-3.5 h-3.5 text-amber-700" />
                        <span>Local Override — ทดสอบเฉพาะบนเบราว์เซอร์เครื่องนี้</span>
                      </span>
                    )}
                    {configProvenance === 'env_var' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-semibold">
                        <span>Environment Variable (VITE_GAS_URL)</span>
                      </span>
                    )}
                    {configProvenance === 'code_default' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-800 font-semibold">
                        <span>Built-in Code Default (constants.ts)</span>
                      </span>
                    )}
                    {configProvenance === 'unconfigured' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200 text-slate-700 font-semibold">
                        <span>ยังไม่ได้ระบุ Web App URL</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-slate-600 text-right text-[11px] font-['Sarabun'] hidden sm:block">
                  ทุกอุปกรณ์จะโหลดค่าจาก <code>public/app-config.json</code> เป็นค่าเริ่มต้น
                </div>
              </div>

              {/* Dev URL Warning Banner (if user typed /dev) */}
              {urlInspection.isDev && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-['Sarabun'] space-y-2">
                  <div className="flex items-center gap-2 font-['Prompt'] font-bold text-amber-800">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>คำเตือน: คุณกำลังใช้ URL สำหรับนักพัฒนา (/dev)</span>
                  </div>
                  <p>
                    URL ที่ลงท้ายด้วย <code>/dev</code> จะบังคับให้ผู้ใช้ต้องเข้าสู่ระบบ Google Account ของผู้สร้างสคริปต์
                    ซึ่งเป็นสาเหตุหลักที่ทำให้อุปกรณ์อื่นและโทรศัพท์มือถือไม่สามารถเข้าใช้งานได้
                  </p>
                  <button
                    type="button"
                    onClick={handleConvertDevToExec}
                    className="mt-1 px-4 py-2 rounded-xl bg-amber-600 text-white font-['Prompt'] font-semibold hover:bg-amber-700 transition-colors inline-flex items-center gap-1.5 shadow-xs"
                  >
                    <span>คลิกเพื่อแปลงเป็น /exec ทันที</span>
                  </button>
                </div>
              )}

              {/* Google Apps Script Web App URL input */}
              <div className="space-y-3">
                <label className="block text-xs font-['Prompt'] font-semibold text-slate-800">
                  Google Apps Script Web App URL (ต้องลงท้ายด้วย /exec)
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    value={backendUrlInput}
                    onChange={(e) => setBackendUrlInput(e.target.value)}
                    placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs text-slate-800 outline-none focus:border-[#7043A6] shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={handleTestBackend}
                    disabled={isTestingBackend || !backendUrlInput.trim()}
                    className="px-5 py-2.5 rounded-xl font-['Prompt'] font-semibold text-xs text-white bg-[#4B267D] hover:bg-[#30283A] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-xs"
                  >
                    {isTestingBackend ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Link className="w-3.5 h-3.5 text-[#D6AF55]" />
                    )}
                    <span>ทดสอบการเชื่อมต่อ (Health Check)</span>
                  </button>
                </div>

                <div className="text-[11px] font-['Sarabun'] text-slate-500 space-y-1">
                  <p>• ใน Google Apps Script: กด <strong>Deploy</strong> &gt; <strong>New deployment</strong> &gt; ประเภท: <strong>Web App</strong></p>
                  <p>• ตั้งค่า Execute as: <strong>Me</strong> และ Who has access: <strong>Anyone</strong> (สำคัญมาก: หากไม่เลือก Anyone อุปกรณ์อื่นจะไม่สามารถเข้าถึงได้)</p>
                  <p>• คัดลอก Web App URL ที่ลงท้ายด้วย <code>/exec</code> มาวางที่นี่</p>
                </div>
              </div>

              {/* Comprehensive 6-Point Health Check Results */}
              {backendTestResult && (
                <div
                  className={`p-5 rounded-2xl border text-xs font-['Sarabun'] space-y-4 ${
                    backendTestResult.connected
                      ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                      : 'bg-red-50/70 border-red-300 text-red-950'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 border-b border-black/10 pb-3">
                    <div className="flex items-center gap-2 font-['Prompt'] font-bold text-sm">
                      {backendTestResult.connected ? (
                        <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                      )}
                      <span>
                        {backendTestResult.connected
                          ? 'ผลการทดสอบ: เชื่อมต่อสมบูรณ์ ครบทั้ง ๖ ขั้นตอน พร้อมใช้งานทุกอุปกรณ์'
                          : `ผลการทดสอบ: ไม่สามารถเชื่อมต่อได้ (${backendTestResult.errorType || 'ERROR'})`}
                      </span>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-['Prompt'] font-semibold ${
                        backendTestResult.connected
                          ? 'bg-emerald-200 text-emerald-900'
                          : 'bg-red-200 text-red-900'
                      }`}
                    >
                      {backendTestResult.connected ? 'ONLINE' : 'FAILED'}
                    </span>
                  </div>

                  {/* 6-point checklist grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-['Prompt']">
                    {[
                      {
                        title: '๑. รูปแบบ URL ถูกต้อง (/exec)',
                        passed: backendTestResult.checks.urlFormat,
                      },
                      {
                        title: '๒. เซิร์ฟเวอร์ Web App เข้าถึงได้ (Network)',
                        passed: backendTestResult.checks.webAppReachable,
                      },
                      {
                        title: '๓. สิทธิ์สาธารณะ (Anyone — ไม่ติดหน้าล็อกอิน Google)',
                        passed: backendTestResult.checks.anonymousAccess,
                      },
                      {
                        title: '๔. เปิด Google Sheets ID ตรงกัน',
                        passed: backendTestResult.checks.spreadsheetOpen,
                      },
                      {
                        title: `๕. พบชีต "ตรวจสอบคะแนน" (${backendTestResult.data?.sheets?.scoreRows || 0} แถว)`,
                        passed: backendTestResult.checks.scoreSheetExists,
                      },
                      {
                        title: `๖. พบชีต "ดาวน์โหลดเกียรติบัตร" (${backendTestResult.data?.sheets?.certificateRows || 0} แถว)`,
                        passed: backendTestResult.checks.certificateSheetExists,
                      },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${
                          item.passed
                            ? 'bg-white/80 border-emerald-200 text-emerald-900'
                            : 'bg-white/80 border-red-200 text-red-900'
                        }`}
                      >
                        <span className="truncate">{item.title}</span>
                        {item.passed ? (
                          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>

                  <p className="font-['Sarabun'] text-xs">{backendTestResult.message}</p>
                  {backendTestResult.technicalDetail && (
                    <div className="p-2.5 rounded-lg bg-black/5 font-mono text-[10px] break-all">
                      {backendTestResult.technicalDetail}
                    </div>
                  )}
                </div>
              )}

              {/* Shared Deployment Tools (ทำให้ใช้งานได้ทุกอุปกรณ์) */}
              <div className="p-6 rounded-3xl bg-white border border-[#D6AF55]/40 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="font-['Prompt'] font-bold text-sm text-[#4B267D] flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-[#D6AF55]" />
                      <span>ขั้นตอนการเผยแพร่การตั้งค่าให้ใช้งานได้ทุกอุปกรณ์ (Shared Config)</span>
                    </h4>
                    <p className="text-xs font-['Sarabun'] text-slate-500 mt-0.5">
                      เพื่อไม่ให้อุปกรณ์อื่น (เช่น โทรศัพท์มือถือ) ต้องมาพิมพ์ตั้งค่า URL ซ้ำในแต่ละเครื่อง
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyConfig}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-['Prompt'] font-semibold border border-[#7043A6]/30 text-[#4B267D] hover:bg-[#FAF8FD] flex items-center gap-1.5 transition-colors"
                    >
                      {copiedConfig ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>คัดลอกแล้ว!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-[#7043A6]" />
                          <span>คัดลอก JSON</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadConfig}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-['Prompt'] font-semibold bg-[#4B267D] text-white hover:bg-[#30283A] flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      {downloadedConfig ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#D6AF55]" />
                          <span>ดาวน์โหลดแล้ว!</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5 text-[#D6AF55]" />
                          <span>ดาวน์โหลด app-config.json</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-xs font-['Sarabun'] text-slate-600">
                  <p className="font-semibold text-slate-800 font-['Prompt']">
                    วิธีอัปเดต URL ไปยัง GitHub Pages ใน ๓ ขั้นตอน:
                  </p>
                  <ol className="list-decimal pl-5 space-y-1.5">
                    <li>
                      กดปุ่ม <strong>&quot;ดาวน์โหลด app-config.json&quot;</strong> ด้านบน (หรือคัดลอกโค้ด JSON ด้านล่าง)
                    </li>
                    <li>
                      นำไฟล์ไปวางแทนที่ไฟล์เดิมที่โฟลเดอร์ <code>public/app-config.json</code> ใน Repository บน GitHub
                    </li>
                    <li>
                      กด <strong>Commit changes</strong> แล้ว GitHub Actions จะทำการ Deploy เว็บไซต์ให้โดยอัตโนมัติ — หลังจากนั้น ทุกเครื่อง (โทรศัพท์, คอมพิวเตอร์อื่นๆ, แท็บเล็ต) จะเชื่อมต่อฐานข้อมูลได้ทันทีโดยไม่ต้องตั้งค่าในแต่ละเครื่องอีกต่อไป
                    </li>
                  </ol>
                </div>

                {/* JSON Code Preview */}
                <div className="relative">
                  <pre className="p-3.5 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto max-h-48 leading-relaxed">
                    {generateAppConfigJson(backendUrlInput || getApiBaseUrl())}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
