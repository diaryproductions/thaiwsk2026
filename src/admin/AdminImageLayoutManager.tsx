import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Maximize2,
  Image as ImageIcon,
} from 'lucide-react';
import {
  ManagedSiteImage,
  ImageSectionPlacement,
  DEFAULT_SITE_IMAGE_ITEMS,
} from '../config/defaultContent';
import { SmartImage } from '../components/SmartImage';
import { isViewerPageUrl } from '../utils/imageUrl';

interface AdminImageLayoutManagerProps {
  items: ManagedSiteImage[];
  onChange: (nextItems: ManagedSiteImage[]) => void;
}

const SECTION_OPTIONS: { value: ImageSectionPlacement; label: string }[] = [
  { value: 'heroLogo', label: 'Hero Logo (โลโก้หลักส่วนหัว)' },
  { value: 'headerLogo', label: 'Header Logo (โลโก้แถบเมนูบน)' },
  { value: 'about', label: 'เกี่ยวกับโครงการ (About)' },
  { value: 'activity', label: 'กิจกรรม / กำหนดการ (Activity)' },
  { value: 'announcement', label: 'ข่าวสารและประกาศ (Announcement)' },
  { value: 'other', label: 'ส่วนแสดงภาพเพิ่มเติม (Other)' },
];

export const AdminImageLayoutManager: React.FC<AdminImageLayoutManagerProps> = ({
  items,
  onChange,
}) => {
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const sortedItems = [...(items || [])].sort(
    (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)
  );

  const handleAdd = () => {
    const nextItem: ManagedSiteImage = {
      id: `img-custom-${Date.now()}`,
      title: 'รูปภาพประกอบใหม่',
      url: 'images/about_academic_thai_1794141247386.jpg',
      section: 'activity',
      alignment: 'center',
      width: '100%',
      height: '280px',
      objectFit: 'cover',
      spacing: 16,
      sortOrder: sortedItems.length + 1,
      isVisible: true,
      caption: '',
    };
    onChange([...sortedItems, nextItem]);
    setPreviewId(nextItem.id);
  };

  const handleResetDefaults = () => {
    const cloned = JSON.parse(JSON.stringify(DEFAULT_SITE_IMAGE_ITEMS)) as ManagedSiteImage[];
    onChange(cloned);
    setResetMessage('รีเซ็ตเลย์เอาต์รูปภาพกลับเป็นค่ามาตรฐานแล้ว (กรุณากดปุ่ม "บันทึกข้อมูล (Publish)" เพื่อยืนยัน)');
    setTimeout(() => setResetMessage(null), 5000);
  };

  const handleUpdate = (id: string, patch: Partial<ManagedSiteImage>) => {
    const next = sortedItems.map((item) =>
      item.id === id ? { ...item, ...patch } : item
    );
    onChange(next);
  };

  const handleDelete = (id: string) => {
    const next = sortedItems
      .filter((item) => item.id !== id)
      .map((item, idx) => ({ ...item, sortOrder: idx + 1 }));
    onChange(next);
    if (previewId === id) setPreviewId(null);
  };

  const handleMove = (id: string, dir: 'up' | 'down') => {
    const index = sortedItems.findIndex((i) => i.id === id);
    if (index === -1) return;
    const swapIdx = dir === 'up' ? index - 1 : index + 1;
    if (swapIdx < 0 || swapIdx >= sortedItems.length) return;
    const copy = [...sortedItems];
    const tmp = copy[index];
    copy[index] = copy[swapIdx];
    copy[swapIdx] = tmp;
    onChange(copy.map((it, idx) => ({ ...it, sortOrder: idx + 1 })));
  };

  return (
    <div className="bg-white rounded-2xl border border-[#D6AF55]/45 p-5 space-y-5 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h4 className="font-['Prompt'] font-bold text-base text-[#4B267D] flex items-center gap-2">
            <Maximize2 className="w-4 h-4 text-[#D6AF55]" />
            <span>จัดการรูปภาพและเลย์เอาต์ตามตำแหน่ง (Dynamic Image &amp; Layout Manager)</span>
          </h4>
          <p className="text-xs font-['Sarabun'] text-slate-500 mt-0.5">
            เพิ่ม/ลบ/แก้ไข URL รูปภาพ (Cloudinary, ImgBB, Google Drive) เลือกส่วนแสดงผล ปรับขนาด จัดวาง ซ้าย-กลาง-ขวา
            ตั้งค่า Object-Fit และเปิด/ปิดการแสดงผลได้อิสระ (รองรับจอมือถืออัตโนมัติ ไม่ล้นหน้าจอ)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0 font-['Prompt'] text-xs">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#7043A6]" />
            <span>รีเซ็ตเลย์เอาต์มาตรฐาน</span>
          </button>

          <button
            type="button"
            onClick={handleAdd}
            className="px-3.5 py-2 rounded-xl bg-[#4B267D] hover:bg-[#30283A] text-white font-semibold inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#F4E4B5]" />
            <span>เพิ่มรูปภาพใหม่</span>
          </button>
        </div>
      </div>

      {resetMessage && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-xs font-['Sarabun'] text-amber-900">
          {resetMessage}
        </div>
      )}

      {sortedItems.length === 0 ? (
        <div className="py-10 text-center rounded-2xl border border-dashed border-slate-300 bg-[#FAF8FD]/50">
          <ImageIcon className="w-8 h-8 text-[#7043A6]/50 mx-auto mb-2" />
          <p className="text-sm font-['Prompt'] font-semibold text-[#30283A]">
            ยังไม่มีรายการรูปภาพในเลย์เอาต์
          </p>
          <p className="text-xs font-['Sarabun'] text-slate-500 mt-1">
            คลิก &quot;เพิ่มรูปภาพใหม่&quot; หรือ &quot;รีเซ็ตเลย์เอาต์มาตรฐาน&quot; เพื่อเริ่มต้น
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedItems.map((item, idx) => {
            const isPreviewOpen = previewId === item.id;
            const isViewer = isViewerPageUrl(item.url);

            return (
              <div
                key={item.id}
                className={`p-4 sm:p-5 rounded-2xl border space-y-4 transition-colors ${
                  item.isVisible !== false
                    ? 'bg-[#FAF8FD]/70 border-slate-200'
                    : 'bg-slate-100/70 border-slate-200 opacity-80'
                }`}
              >
                {/* Row Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-200/80">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs font-['Prompt'] font-bold text-[#4B267D]">
                      ลำดับที่ {item.sortOrder || idx + 1}
                    </span>

                    <label className="inline-flex items-center gap-1.5 text-xs font-['Prompt'] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={item.isVisible !== false}
                        onChange={(e) =>
                          handleUpdate(item.id, { isVisible: e.target.checked })
                        }
                        className="rounded text-[#4B267D]"
                      />
                      {item.isVisible !== false ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                          <Eye className="w-3.5 h-3.5" />
                          <span>แสดงผลบนหน้าเว็บ</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-500">
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>ปิดการแสดงผล</span>
                        </span>
                      )}
                    </label>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setPreviewId(isPreviewOpen ? null : item.id)}
                      className="px-2.5 py-1 rounded-lg border border-[#7043A6]/35 bg-white text-[#4B267D] hover:bg-[#4B267D] hover:text-white text-[11px] font-['Prompt'] font-semibold inline-flex items-center gap-1 mr-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{isPreviewOpen ? 'ซ่อนตัวอย่าง' : 'ดูตัวอย่างก่อนบันทึก'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMove(item.id, 'up')}
                      title="เลื่อนขึ้น"
                      className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-[#4B267D] cursor-pointer"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMove(item.id, 'down')}
                      title="เลื่อนลง"
                      className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-[#4B267D] cursor-pointer"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      title="ลบรูปภาพ"
                      className="p-1.5 rounded-lg border border-red-200 bg-white text-red-500 hover:bg-red-50 hover:text-red-700 ml-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Form Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-['Prompt']">
                  <div className="sm:col-span-2">
                    <label className="block text-slate-700 font-semibold mb-1">
                      ชื่อ / คำอธิบายภาพ (Title)
                    </label>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => handleUpdate(item.id, { title: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-700 font-semibold mb-1">
                      ตำแหน่งแสดงผลบนหน้าเว็บ (Section)
                    </label>
                    <select
                      value={item.section}
                      onChange={(e) =>
                        handleUpdate(item.id, {
                          section: e.target.value as ImageSectionPlacement,
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                    >
                      {SECTION_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2 lg:col-span-4">
                    <label className="block text-slate-700 font-semibold mb-1">
                      URL รูปภาพ (Cloudinary, ImgBB, Google Drive หรือ images/...)
                    </label>
                    <input
                      type="text"
                      value={item.url}
                      onChange={(e) => handleUpdate(item.id, { url: e.target.value })}
                      placeholder="https://... หรือ images/ครูไทยวิเศษฯ-2026 (1).png"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono text-xs"
                    />
                    {isViewer && (
                      <p className="text-[11px] font-['Sarabun'] text-amber-800 mt-1">
                        * หมายเหตุ: ลิงก์นี้เป็นหน้าเว็บดูรูปภาพ ไม่ใช่ Direct Image URL ระบบจะใช้ภาพสำรองให้อัตโนมัติหากไม่เปลี่ยนเป็น Direct URL
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      การจัดวาง (Alignment)
                    </label>
                    <div className="grid grid-cols-3 gap-1 bg-white p-1 rounded-lg border border-slate-300">
                      {[
                        { val: 'left' as const, icon: AlignLeft, label: 'ซ้าย' },
                        { val: 'center' as const, icon: AlignCenter, label: 'กลาง' },
                        { val: 'right' as const, icon: AlignRight, label: 'ขวา' },
                      ].map((al) => {
                        const Icon = al.icon;
                        const active = item.alignment === al.val;
                        return (
                          <button
                            key={al.val}
                            type="button"
                            onClick={() => handleUpdate(item.id, { alignment: al.val })}
                            className={`py-1.5 rounded flex items-center justify-center gap-1 text-[11px] cursor-pointer ${
                              active
                                ? 'bg-[#4B267D] text-white font-bold'
                                : 'text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            <span>{al.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      ความกว้าง (Width)
                    </label>
                    <input
                      type="text"
                      value={item.width}
                      onChange={(e) => handleUpdate(item.id, { width: e.target.value })}
                      placeholder="เช่น 380px หรือ 100%"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      ความสูง (Height)
                    </label>
                    <input
                      type="text"
                      value={item.height}
                      onChange={(e) => handleUpdate(item.id, { height: e.target.value })}
                      placeholder="เช่น 190px หรือ auto"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        Object-Fit
                      </label>
                      <select
                        value={item.objectFit}
                        onChange={(e) =>
                          handleUpdate(item.id, {
                            objectFit: e.target.value as 'contain' | 'cover',
                          })
                        }
                        className="w-full px-2 py-2 rounded-lg border border-slate-300 bg-white"
                      >
                        <option value="contain">Contain</option>
                        <option value="cover">Cover</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        ระยะห่าง (px)
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={64}
                        value={item.spacing ?? 16}
                        onChange={(e) =>
                          handleUpdate(item.id, {
                            spacing: Math.max(0, Math.min(64, Number(e.target.value) || 0)),
                          })
                        }
                        className="w-full px-2 py-2 rounded-lg border border-slate-300 bg-white tabular-nums"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2 lg:col-span-4">
                    <label className="block text-slate-700 font-semibold mb-1">
                      คำบรรยายใต้ภาพ (Caption - ไม่บังคับ)
                    </label>
                    <input
                      type="text"
                      value={item.caption || ''}
                      onChange={(e) => handleUpdate(item.id, { caption: e.target.value })}
                      placeholder="คำบรรยายใต้รูปภาพ..."
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-['Sarabun']"
                    />
                  </div>
                </div>

                {/* Live Layout Preview */}
                {isPreviewOpen && (
                  <div className="rounded-xl border border-[#D6AF55]/55 bg-white p-4 space-y-2 overflow-hidden">
                    <div className="text-[11px] font-['Prompt'] font-semibold text-[#4B267D]">
                      ตัวอย่างการจัดวางจริง (Responsive Safe — ไม่ล้นหน้าจอ)
                    </div>
                    <div
                      className={`w-full flex p-3 rounded-xl ${
                        item.section === 'heroLogo'
                          ? 'bg-gradient-to-b from-[#3A1B66] to-[#613799]'
                          : 'bg-[#FAF8FD]'
                      } ${
                        item.alignment === 'left'
                          ? 'justify-start'
                          : item.alignment === 'right'
                          ? 'justify-end'
                          : 'justify-center'
                      }`}
                    >
                      <div
                        style={{
                          width: item.width || '100%',
                          maxWidth: '100%',
                          height: item.height && item.height !== 'auto' ? item.height : undefined,
                        }}
                        className="max-w-full overflow-hidden rounded-xl border border-white/20"
                      >
                        <SmartImage
                          src={item.url}
                          alt={item.title}
                          fallbackType={item.section === 'heroLogo' ? 'heroLogo' : 'general'}
                          className={`w-full h-full max-w-full ${
                            item.objectFit === 'contain' ? 'object-contain' : 'object-cover'
                          }`}
                          containerClassName="w-full h-full"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
