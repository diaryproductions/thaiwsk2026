import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Award,
  Printer,
  Download,
  Eye,
  Search,
  RefreshCw,
  CheckSquare,
  Square,
  AlertTriangle,
  FileText,
  X,
  CheckCircle2,
  XCircle,
  Loader2,
  Filter,
  Layers,
} from 'lucide-react';
import {
  AdminCertificateItem,
  listAllCertificatesAdmin,
} from '../services/api';
import { getMedalTheme, MedalCategory } from '../utils/medalTheme';
import {
  mergeCertificatePdfs,
  MergeProgress,
  PdfMergeResult,
} from '../utils/pdfMerger';
import { CertificateModal } from '../components/CertificateModal';
import { APP_CONFIG } from '../config/constants';

export const AdminCertificateManager: React.FC = () => {
  const [items, setItems] = useState<AdminCertificateItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<{
    message: string;
    isGasUpdateRequired?: boolean;
  } | null>(null);

  // Filters
  const [nameQuery, setNameQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [roomFilter, setRoomFilter] = useState('');
  const [medalFilter, setMedalFilter] = useState<'all' | MedalCategory>('all');

  // Selected row keys (unique key per row: rowIndex or fallback index)
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

  // Single certificate preview modal
  const [singlePreviewCert, setSinglePreviewCert] =
    useState<AdminCertificateItem | null>(null);

  // Batch Print Preview & PDF Merge Modal state
  const [printPreviewItems, setPrintPreviewItems] = useState<
    AdminCertificateItem[] | null
  >(null);
  const [isMerging, setIsMerging] = useState(false);
  const [mergeProgress, setMergeProgress] = useState<MergeProgress | null>(null);
  const [mergeResult, setMergeResult] = useState<PdfMergeResult | null>(null);
  const [autoTriggerPrint, setAutoTriggerPrint] = useState(false);

  const printIframeRef = useRef<HTMLIFrameElement>(null);

  const getRowKey = (item: AdminCertificateItem, idx?: number) =>
    `${item.rowIndex ?? idx ?? ''}-${item.number}-${item.fullName}`;

  const fetchCertificates = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await listAllCertificatesAdmin();
      if (res.success && Array.isArray(res.data)) {
        setItems(res.data);
        setSelectedKeys(new Set());
      } else {
        setLoadError({
          message: res.message || 'ไม่สามารถดึงรายการเกียรติบัตรได้',
          isGasUpdateRequired: res.errorType === 'UPDATE_GAS_REQUIRED',
        });
      }
    } catch (err: any) {
      setLoadError({
        message: err?.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ Google Sheets',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  // Cleanup merged PDF Blob URL on change/unmount
  useEffect(() => {
    return () => {
      if (mergeResult?.blobUrl) {
        URL.revokeObjectURL(mergeResult.blobUrl);
      }
    };
  }, [mergeResult?.blobUrl]);

  // Unique grades and rooms present in sheet
  const availableGrades = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => {
      if (i.grade?.trim()) set.add(i.grade.trim());
    });
    return Array.from(set).sort();
  }, [items]);

  const availableRooms = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => {
      if (i.room?.trim()) set.add(i.room.trim());
    });
    return Array.from(set).sort((a, b) => Number(a) - Number(b) || a.localeCompare(b));
  }, [items]);

  const filteredItems = useMemo(() => {
    const q = nameQuery.trim().toLowerCase();
    return items.filter((item) => {
      if (q && !item.fullName.toLowerCase().includes(q) && !item.number.toLowerCase().includes(q)) {
        return false;
      }
      if (gradeFilter && item.grade.trim() !== gradeFilter) {
        return false;
      }
      if (roomFilter && item.room.trim() !== roomFilter) {
        return false;
      }
      if (medalFilter !== 'all') {
        const theme = getMedalTheme(item.medal);
        if (theme.category !== medalFilter) return false;
      }
      return true;
    });
  }, [items, nameQuery, gradeFilter, roomFilter, medalFilter]);

  const selectedItemsList = useMemo(() => {
    return items.filter((item, idx) => selectedKeys.has(getRowKey(item, idx)));
  }, [items, selectedKeys]);

  const allVisibleSelected =
    filteredItems.length > 0 &&
    filteredItems.every((item) => {
      const realIdx = items.indexOf(item);
      return selectedKeys.has(getRowKey(item, realIdx));
    });

  const toggleRow = (item: AdminCertificateItem, realIdx: number) => {
    const key = getRowKey(item, realIdx);
    const next = new Set(selectedKeys);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setSelectedKeys(next);
  };

  const toggleSelectAllVisible = () => {
    const next = new Set(selectedKeys);
    if (allVisibleSelected) {
      filteredItems.forEach((item) => {
        const realIdx = items.indexOf(item);
        next.delete(getRowKey(item, realIdx));
      });
    } else {
      filteredItems.forEach((item) => {
        const realIdx = items.indexOf(item);
        next.add(getRowKey(item, realIdx));
      });
    }
    setSelectedKeys(next);
  };

  const selectByMedalCategory = (category: MedalCategory) => {
    const next = new Set<string>();
    items.forEach((item, idx) => {
      if (getMedalTheme(item.medal).category === category) {
        next.add(getRowKey(item, idx));
      }
    });
    setSelectedKeys(next);
  };

  const medalCounts = useMemo(() => {
    const counts = { gold: 0, silver: 0, bronze: 0, honor: 0 };
    items.forEach((item) => {
      counts[getMedalTheme(item.medal).category] += 1;
    });
    return counts;
  }, [items]);

  const openPrintPreviewModal = (
    targetItems: AdminCertificateItem[],
    shouldAutoGenerateAndPrint = false
  ) => {
    if (targetItems.length === 0) return;
    if (mergeResult?.blobUrl) {
      URL.revokeObjectURL(mergeResult.blobUrl);
    }
    setMergeResult(null);
    setMergeProgress(null);
    setAutoTriggerPrint(shouldAutoGenerateAndPrint);
    setPrintPreviewItems(targetItems);

    if (shouldAutoGenerateAndPrint) {
      runMerge(targetItems, true);
    }
  };

  const runMerge = async (
    targetItems: AdminCertificateItem[],
    triggerPrintAfter = false
  ) => {
    setIsMerging(true);
    setMergeProgress({
      completed: 0,
      total: targetItems.length,
      currentName: targetItems[0]?.fullName || '',
      succeeded: 0,
      failed: 0,
    });
    if (mergeResult?.blobUrl) {
      URL.revokeObjectURL(mergeResult.blobUrl);
    }
    setMergeResult(null);

    try {
      const result = await mergeCertificatePdfs(targetItems, (progress) => {
        setMergeProgress({ ...progress });
      });
      setMergeResult(result);
      if (triggerPrintAfter && result.success && result.blobUrl) {
        setAutoTriggerPrint(true);
      }
    } finally {
      setIsMerging(false);
    }
  };

  const handleTriggerIframePrint = () => {
    try {
      const iframeWin = printIframeRef.current?.contentWindow;
      if (iframeWin) {
        iframeWin.focus();
        iframeWin.print();
      }
    } catch {
      // Browser PDF plugin handles print button inside viewer or user downloads merged PDF
    }
  };

  const closePrintModal = () => {
    if (isMerging) return;
    if (mergeResult?.blobUrl) {
      URL.revokeObjectURL(mergeResult.blobUrl);
    }
    setMergeResult(null);
    setMergeProgress(null);
    setAutoTriggerPrint(false);
    setPrintPreviewItems(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[#D6AF55]" />
            <h3 className="font-['Prompt'] font-bold text-lg text-[#4B267D]">
              จัดการและพิมพ์เกียรติบัตร (Batch PDF Print System)
            </h3>
          </div>
          <p className="text-xs font-['Sarabun'] text-slate-500 mt-1">
            ดึงข้อมูลตรงจากแผ่นงาน &quot;{APP_CONFIG.CERTIFICATE_SHEET}&quot; (คอลัมน์ A–F) เพื่อเลือกพิมพ์แบบรายบุคคล,
            ตามระดับเหรียญ หรือรวมเป็นไฟล์ PDF หลายหน้าความคมชัดต้นฉบับ
          </p>
        </div>

        <button
          type="button"
          onClick={fetchCertificates}
          disabled={isLoading}
          className="px-4 py-2 rounded-xl text-xs font-['Prompt'] font-semibold bg-[#FAF8FD] border border-[#7043A6]/30 text-[#4B267D] hover:bg-[#4B267D] hover:text-white transition-colors inline-flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>รีเฟรชข้อมูลจากชีต</span>
        </button>
      </div>

      {/* Error / GAS Update Notice */}
      {loadError && (
        <div
          className={`p-4 rounded-2xl border text-xs sm:text-sm font-['Sarabun'] flex items-start gap-3 ${
            loadError.isGasUpdateRequired
              ? 'bg-amber-50 border-amber-300 text-amber-950'
              : 'bg-red-50 border-red-300 text-red-900'
          }`}
        >
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1.5">
            <div className="font-['Prompt'] font-bold">
              {loadError.isGasUpdateRequired
                ? 'ต้องอัปเดตและ Deploy โค้ด Google Apps Script (Code.gs) เวอร์ชันใหม่'
                : 'ไม่สามารถโหลดข้อมูลเกียรติบัตรได้'}
            </div>
            <p>{loadError.message}</p>
            {loadError.isGasUpdateRequired && (
              <p className="text-xs text-amber-800">
                วิธีแก้ไข: คัดลอกโค้ดล่าสุดจากไฟล์ <code className="font-mono bg-amber-100 px-1 rounded">Code.gs</code>{' '}
                ไปวางใน Google Apps Script แล้วกด <strong>Deploy &gt; Manage deployments &gt; แก้ไข &gt; New version &gt; Deploy</strong>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Summary & Quick Select by Medal */}
      <div className="bg-[#FAF8FD] rounded-2xl p-4 border border-[#D6AF55]/35 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-['Prompt'] font-bold text-[#4B267D] flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-[#D6AF55]" />
            <span>เลือกด่วนตามระดับเหรียญ ({items.length} รายการทั้งหมด)</span>
          </span>
          <span className="text-xs font-['Prompt'] font-semibold text-[#7043A6]">
            เลือกอยู่ {selectedItemsList.length} รายการ
          </span>
        </div>

        <div className="flex flex-wrap gap-2 font-['Prompt'] text-xs">
          <button
            type="button"
            onClick={() => selectByMedalCategory('gold')}
            disabled={medalCounts.gold === 0}
            className="px-3 py-1.5 rounded-xl bg-[#F4E4B5]/70 hover:bg-[#D6AF55] text-[#6B480C] hover:text-[#2A1845] border border-[#D6AF55] font-semibold transition-colors disabled:opacity-40 cursor-pointer"
          >
            เลือกเฉพาะเหรียญทอง ({medalCounts.gold})
          </button>

          <button
            type="button"
            onClick={() => selectByMedalCategory('silver')}
            disabled={medalCounts.silver === 0}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-semibold transition-colors disabled:opacity-40 cursor-pointer"
          >
            เลือกเฉพาะเหรียญเงิน ({medalCounts.silver})
          </button>

          <button
            type="button"
            onClick={() => selectByMedalCategory('bronze')}
            disabled={medalCounts.bronze === 0}
            className="px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-amber-900 border border-amber-300 font-semibold transition-colors disabled:opacity-40 cursor-pointer"
          >
            เลือกเฉพาะเหรียญทองแดง ({medalCounts.bronze})
          </button>

          <button
            type="button"
            onClick={() => selectByMedalCategory('honor')}
            disabled={medalCounts.honor === 0}
            className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#4B267D] border border-[#7043A6]/35 font-semibold transition-colors disabled:opacity-40 cursor-pointer"
          >
            เลือกเฉพาะชมเชย / เข้าร่วม ({medalCounts.honor})
          </button>

          {selectedItemsList.length > 0 && (
            <button
              type="button"
              onClick={() => setSelectedKeys(new Set())}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-red-50 text-red-600 border border-red-200 font-medium transition-colors cursor-pointer ml-auto"
            >
              ล้างการเลือก
            </button>
          )}
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-slate-200">
        <div>
          <label className="block text-[11px] font-['Prompt'] font-semibold text-slate-600 mb-1">
            ค้นหาชื่อ-นามสกุล / เลขที่
          </label>
          <div className="relative">
            <input
              type="text"
              value={nameQuery}
              onChange={(e) => setNameQuery(e.target.value)}
              placeholder="พิมพ์ชื่อนักเรียน..."
              className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-['Prompt'] outline-none focus:border-[#7043A6]"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-['Prompt'] font-semibold text-slate-600 mb-1">
            ระดับชั้น
          </label>
          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-['Prompt'] bg-white outline-none focus:border-[#7043A6]"
          >
            <option value="">ทุกระดับชั้น</option>
            {availableGrades.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-['Prompt'] font-semibold text-slate-600 mb-1">
            ห้องเรียน
          </label>
          <select
            value={roomFilter}
            onChange={(e) => setRoomFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-['Prompt'] bg-white outline-none focus:border-[#7043A6]"
          >
            <option value="">ทุกห้องเรียน</option>
            {availableRooms.map((r) => (
              <option key={r} value={r}>
                ห้อง {r}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-['Prompt'] font-semibold text-slate-600 mb-1 flex items-center gap-1">
            <Filter className="w-3 h-3 text-[#7043A6]" />
            <span>กรองตามระดับเหรียญ</span>
          </label>
          <select
            value={medalFilter}
            onChange={(e) => setMedalFilter(e.target.value as 'all' | MedalCategory)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-['Prompt'] bg-white outline-none focus:border-[#7043A6]"
          >
            <option value="all">ทุกระดับเหรียญ</option>
            <option value="gold">เหรียญทอง</option>
            <option value="silver">เหรียญเงิน</option>
            <option value="bronze">เหรียญทองแดง</option>
            <option value="honor">ชมเชย / เข้าร่วม</option>
          </select>
        </div>
      </div>

      {/* Batch Action Bar */}
      <div className="bg-gradient-to-r from-[#4B267D] to-[#6536A3] text-white rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm">
        <div className="text-xs font-['Prompt'] space-y-0.5">
          <div className="font-bold text-sm text-[#F4E4B5]">
            พร้อมจัดการไฟล์ที่เลือก: {selectedItemsList.length} รายการ
          </div>
          <p className="text-white/80 font-['Sarabun']">
            ระบบจะรวมไฟล์ PDF จริงจากคอลัมน์ F ตามลำดับที่เลือก โดยคงขนาดและแนวหน้า (A4) เดิมไว้ครบถ้วน
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 font-['Prompt'] text-xs">
          <button
            type="button"
            disabled={selectedItemsList.length === 0}
            onClick={() => openPrintPreviewModal(selectedItemsList, false)}
            className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/25 font-semibold inline-flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
          >
            <Eye className="w-4 h-4 text-[#F4E4B5]" />
            <span>เปิดดูตัวอย่างก่อนพิมพ์</span>
          </button>

          <button
            type="button"
            disabled={selectedItemsList.length === 0}
            onClick={() => openPrintPreviewModal(selectedItemsList, true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#D6AF55] to-[#C99C38] hover:brightness-105 text-[#2A1845] font-bold shadow-xs inline-flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[#4B267D]" />
            <span>พิมพ์ / รวม PDF รายการที่เลือก</span>
          </button>

          <button
            type="button"
            disabled={filteredItems.length === 0}
            onClick={() => openPrintPreviewModal(filteredItems, false)}
            className="px-3.5 py-2 rounded-xl bg-white text-[#4B267D] hover:bg-[#FAF8FD] font-semibold inline-flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#7043A6]" />
            <span>รวม PDF ที่กรอง ({filteredItems.length})</span>
          </button>
        </div>
      </div>

      {/* Certificate Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAF8FD] border-b border-slate-200 text-xs font-['Prompt'] font-bold text-[#4B267D]">
                <th className="py-3 px-4 w-12 text-center">
                  <button
                    type="button"
                    onClick={toggleSelectAllVisible}
                    title="เลือกทั้งหมดที่แสดงอยู่"
                    className="inline-flex items-center justify-center text-[#4B267D] hover:text-[#7043A6] cursor-pointer"
                  >
                    {allVisibleSelected ? (
                      <CheckSquare className="w-4.5 h-4.5 text-[#4B267D]" />
                    ) : (
                      <Square className="w-4.5 h-4.5 text-slate-400" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-3 w-20">เลขที่</th>
                <th className="py-3 px-3">ชื่อ-นามสกุล</th>
                <th className="py-3 px-3 w-24">ระดับชั้น</th>
                <th className="py-3 px-3 w-20">ห้อง</th>
                <th className="py-3 px-3">ระดับเหรียญ (Col E)</th>
                <th className="py-3 px-4 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-['Sarabun']">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 font-['Prompt']">
                    <Loader2 className="w-6 h-6 animate-spin text-[#7043A6] mx-auto mb-2" />
                    <span>กำลังดึงข้อมูลเกียรติบัตรจาก Google Sheets...</span>
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 font-['Prompt']">
                    ไม่พบรายการเกียรติบัตรที่ตรงกับเงื่อนไขการค้นหา
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const realIdx = items.indexOf(item);
                  const rowKey = getRowKey(item, realIdx);
                  const isChecked = selectedKeys.has(rowKey);
                  const theme = getMedalTheme(item.medal);
                  const hasUrl = Boolean(item.certificateUrl?.trim());

                  return (
                    <tr
                      key={rowKey}
                      className={`transition-colors ${
                        isChecked ? 'bg-[#FAF8FD]' : 'hover:bg-slate-50/70'
                      }`}
                    >
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => toggleRow(item, realIdx)}
                          className="inline-flex items-center justify-center cursor-pointer"
                          aria-label={`เลือก ${item.fullName}`}
                        >
                          {isChecked ? (
                            <CheckSquare className="w-4.5 h-4.5 text-[#4B267D]" />
                          ) : (
                            <Square className="w-4.5 h-4.5 text-slate-300 hover:text-[#7043A6]" />
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-3 font-['Prompt'] font-semibold text-slate-700 tabular-nums">
                        {item.number || '-'}
                      </td>
                      <td className="py-3 px-3 font-['Prompt'] font-semibold text-[#30283A]">
                        <div>{item.fullName || '-'}</div>
                        {!hasUrl && (
                          <span className="text-[10px] text-red-600 font-normal">
                            * ไม่มีลิงก์ไฟล์ในคอลัมน์ F
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-['Prompt'] text-slate-700">
                        {item.grade || '-'}
                      </td>
                      <td className="py-3 px-3 font-['Prompt'] text-slate-700 tabular-nums">
                        {item.room || '-'}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg border text-[11px] font-['Prompt'] font-bold ${theme.badgeBg}`}
                        >
                          <Award className="w-3 h-3" />
                          <span>{item.medal || '-'}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5 font-['Prompt']">
                          <button
                            type="button"
                            onClick={() => setSinglePreviewCert(item)}
                            disabled={!hasUrl}
                            title="เปิดดูตัวอย่างรายบุคคล"
                            className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:border-[#7043A6] hover:text-[#4B267D] disabled:opacity-40 inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>ดู</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => openPrintPreviewModal([item], true)}
                            disabled={!hasUrl}
                            title="พิมพ์รายบุคคล"
                            className="px-2.5 py-1.5 rounded-lg bg-[#4B267D] hover:bg-[#30283A] text-white disabled:opacity-40 inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5 text-[#F4E4B5]" />
                            <span>พิมพ์</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Single Certificate Preview Modal */}
      {singlePreviewCert && (
        <CertificateModal
          cert={singlePreviewCert}
          onClose={() => setSinglePreviewCert(null)}
        />
      )}

      {/* Batch Print Preview & Merged PDF Modal */}
      {printPreviewItems && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-wsk-fade-in">
          <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-[#D6AF55]/60">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#4B267D] to-[#7043A6] px-6 py-4 text-white flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/15 border border-[#F4E4B5]/40 flex items-center justify-center text-[#F4E4B5]">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-['Prompt'] font-bold text-base sm:text-lg">
                    ตัวอย่างก่อนพิมพ์ &amp; รวมไฟล์ PDF เกียรติบัตร
                  </h4>
                  <p className="text-xs font-['Sarabun'] text-[#F4E4B5]">
                    จำนวนเกียรติบัตรที่เลือก: {printPreviewItems.length} รายการ
                    {mergeResult?.success ? ` · รวมสำเร็จ ${mergeResult.totalPages} หน้า PDF` : ''}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closePrintModal}
                disabled={isMerging}
                className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors disabled:opacity-40 cursor-pointer"
                aria-label="ปิดหน้าต่าง"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 bg-[#FAF8FD]">
              {/* Selection Summary Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-['Prompt']">
                <div className="bg-white rounded-2xl p-4 border border-slate-200">
                  <div className="text-xs text-slate-500">จำนวนเกียรติบัตรที่เลือก</div>
                  <div className="text-2xl font-bold text-[#4B267D] mt-0.5 tabular-nums">
                    {printPreviewItems.length} <span className="text-xs font-normal">รายการ</span>
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-slate-200">
                  <div className="text-xs text-slate-500">จำนวนหน้า PDF รวม</div>
                  <div className="text-2xl font-bold text-[#7043A6] mt-0.5 tabular-nums">
                    {mergeResult?.success ? mergeResult.totalPages : '-'}{' '}
                    <span className="text-xs font-normal">หน้า</span>
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-slate-200">
                  <div className="text-xs text-slate-500">สถานะการรวมไฟล์</div>
                  <div className="text-sm font-bold mt-1.5">
                    {isMerging ? (
                      <span className="text-[#7043A6]">กำลังดึงและรวมไฟล์ PDF...</span>
                    ) : mergeResult?.success ? (
                      <span className="text-emerald-700">พร้อมพิมพ์และดาวน์โหลด</span>
                    ) : mergeResult ? (
                      <span className="text-red-600">พบข้อผิดพลาด</span>
                    ) : (
                      <span className="text-slate-600">รอสร้าง PDF รวม</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Progress Indicator */}
              {isMerging && mergeProgress && (
                <div className="bg-white rounded-2xl p-5 border border-[#D6AF55]/60 space-y-3">
                  <div className="flex items-center justify-between text-xs font-['Prompt']">
                    <span className="font-bold text-[#4B267D] flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-[#D6AF55]" />
                      <span>กำลังประมวลผล: {mergeProgress.currentName}</span>
                    </span>
                    <span className="tabular-nums font-semibold text-[#7043A6]">
                      {mergeProgress.completed} / {mergeProgress.total}
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#4B267D] to-[#D6AF55] transition-all duration-300"
                      style={{
                        width: `${Math.round(
                          (mergeProgress.completed / Math.max(1, mergeProgress.total)) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Selected Names & Medals List (Always visible before/after merge) */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-2.5">
                <div className="text-xs font-['Prompt'] font-bold text-[#4B267D] flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#D6AF55]" />
                  <span>รายชื่อและระดับเหรียญตามลำดับการพิมพ์</span>
                </div>
                <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 pr-1">
                  {printPreviewItems.map((it, idx) => {
                    const theme = getMedalTheme(it.medal);
                    const failedInfo = mergeResult?.failedItems.find(
                      (f) => f.item === it
                    );
                    const okInfo = mergeResult?.succeededItems.find(
                      (s) => s.item === it
                    );

                    return (
                      <div
                        key={getRowKey(it, idx)}
                        className="py-2 flex flex-wrap items-center justify-between gap-2 text-xs font-['Prompt']"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-full bg-[#FAF8FD] border border-slate-200 text-[#4B267D] font-bold text-[11px] flex items-center justify-center shrink-0 tabular-nums">
                            {idx + 1}
                          </span>
                          <div>
                            <span className="font-semibold text-[#30283A]">
                              {it.fullName}
                            </span>
                            <span className="text-slate-500 font-['Sarabun'] ml-2">
                              ({it.grade || '-'} {it.room ? `ห้อง ${it.room}` : ''})
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-md border text-[11px] font-bold ${theme.badgeBg}`}
                          >
                            {it.medal || '-'}
                          </span>
                          {okInfo && (
                            <span className="inline-flex items-center gap-1 text-emerald-700 text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{okInfo.pageCount} หน้า</span>
                            </span>
                          )}
                          {failedInfo && (
                            <span className="inline-flex items-center gap-1 text-red-600 text-[11px]">
                              <XCircle className="w-3.5 h-3.5" />
                              <span>{failedInfo.reason}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Failed Items Warning Report (Strictly NO fake PDFs) */}
              {mergeResult && mergeResult.failedItems.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 space-y-2 text-xs font-['Sarabun'] text-red-900">
                  <div className="font-['Prompt'] font-bold text-red-800 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>
                      ไม่สามารถดึงไฟล์ PDF ได้ {mergeResult.failedItems.length} รายการ (ระบบไม่ได้สร้างไฟล์ปลอมทดแทน)
                    </span>
                  </div>
                  {mergeResult.errorMessage && <p>{mergeResult.errorMessage}</p>}
                  <ul className="list-disc pl-5 space-y-1">
                    {mergeResult.failedItems.map((f, i) => (
                      <li key={i}>
                        <strong>{f.item.fullName}</strong>: {f.reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Live Embedded Merged PDF Preview */}
              {mergeResult?.success && mergeResult.blobUrl && (
                <div className="bg-white rounded-2xl border border-[#D6AF55]/50 overflow-hidden shadow-sm">
                  <div className="px-4 py-2.5 bg-[#FAF8FD] border-b border-slate-200 flex items-center justify-between text-xs font-['Prompt']">
                    <span className="font-bold text-[#4B267D]">
                      ตัวอย่างเอกสาร PDF รวม ({mergeResult.totalPages} หน้า)
                    </span>
                    <span className="text-slate-500">
                      คงสัดส่วนและความคมชัดต้นฉบับทุกหน้า
                    </span>
                  </div>
                  <iframe
                    ref={printIframeRef}
                    src={mergeResult.blobUrl}
                    onLoad={() => {
                      if (autoTriggerPrint) {
                        setAutoTriggerPrint(false);
                        setTimeout(handleTriggerIframePrint, 250);
                      }
                    }}
                    title="ตัวอย่างเกียรติบัตร PDF รวม"
                    className="w-full h-[420px] bg-slate-100"
                  />
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 font-['Prompt'] text-xs sm:text-sm">
              <button
                type="button"
                onClick={closePrintModal}
                disabled={isMerging}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => runMerge(printPreviewItems, false)}
                  disabled={isMerging}
                  className="px-4 py-2.5 rounded-xl bg-[#4B267D] hover:bg-[#30283A] text-white font-semibold inline-flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isMerging ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Layers className="w-4 h-4 text-[#F4E4B5]" />
                  )}
                  <span>
                    {mergeResult?.success ? 'สร้าง PDF รวมอีกครั้ง' : 'สร้าง PDF รวม'}
                  </span>
                </button>

                {mergeResult?.success && mergeResult.blobUrl && (
                  <>
                    <a
                      href={mergeResult.blobUrl}
                      download={`thaiwsk2026-certificates-${mergeResult.succeededItems.length}.pdf`}
                      className="px-4 py-2.5 rounded-xl border border-[#7043A6]/40 text-[#4B267D] hover:bg-[#FAF8FD] font-semibold inline-flex items-center gap-2"
                    >
                      <Download className="w-4 h-4 text-[#7043A6]" />
                      <span>ดาวน์โหลด PDF รวม</span>
                    </a>

                    <button
                      type="button"
                      onClick={handleTriggerIframePrint}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D6AF55] to-[#C99C38] text-[#2A1845] font-bold shadow-sm hover:brightness-105 inline-flex items-center gap-2 cursor-pointer"
                    >
                      <Printer className="w-4 h-4 text-[#4B267D]" />
                      <span>สั่งพิมพ์ทันที</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
