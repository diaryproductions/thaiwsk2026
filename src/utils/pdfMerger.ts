import { PDFDocument } from 'pdf-lib';
import { AdminCertificateItem, fetchCertificatePdfBase64Admin } from '../services/api';

export interface MergeProgress {
  completed: number;
  total: number;
  currentName: string;
  succeeded: number;
  failed: number;
}

export interface FailedCertificateItem {
  item: AdminCertificateItem;
  reason: string;
}

export interface SucceededCertificateItem {
  item: AdminCertificateItem;
  pageCount: number;
}

export interface PdfMergeResult {
  success: boolean;
  mergedBytes?: Uint8Array;
  blobUrl?: string;
  totalPages: number;
  succeededItems: SucceededCertificateItem[];
  failedItems: FailedCertificateItem[];
  requiresGasUpdate?: boolean;
  errorMessage?: string;
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function hasPdfMagicBytes(bytes: Uint8Array): boolean {
  if (!bytes || bytes.length < 5) return false;
  return bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46;
}

async function fetchSinglePdfBytes(
  item: AdminCertificateItem
): Promise<{
  ok: boolean;
  bytes?: Uint8Array;
  reason?: string;
  requiresGasUpdate?: boolean;
}> {
  const rawUrl = (item.certificateUrl || '').trim();
  if (!rawUrl) {
    return { ok: false, reason: 'ไม่มีลิงก์ไฟล์เกียรติบัตรในคอลัมน์ F' };
  }

  // 1. Primary path: fetch via authenticated Google Apps Script connector
  const gasRes = await fetchCertificatePdfBase64Admin(rawUrl);
  if (gasRes.success && gasRes.base64) {
    const bytes = base64ToUint8Array(gasRes.base64);
    if (!hasPdfMagicBytes(bytes)) {
      return { ok: false, reason: 'ข้อมูลที่ได้รับไม่ใช่ไฟล์ PDF ที่สมบูรณ์' };
    }
    return { ok: true, bytes };
  }

  // 2. If non-Drive direct CORS URL and GAS needs update or had network issue, try direct browser fetch fallback
  if (!item.isDrive && rawUrl.toLowerCase().endsWith('.pdf')) {
    try {
      const directRes = await fetch(rawUrl, { method: 'GET', redirect: 'follow' });
      if (directRes.ok) {
        const buf = await directRes.arrayBuffer();
        const bytes = new Uint8Array(buf);
        if (hasPdfMagicBytes(bytes)) {
          return { ok: true, bytes };
        }
      }
    } catch {
      // Ignore CORS error and return primary GAS reason
    }
  }

  return {
    ok: false,
    reason: gasRes.message || 'ไม่สามารถดึงไฟล์ PDF ได้',
    requiresGasUpdate: gasRes.errorType === 'UPDATE_GAS_REQUIRED',
  };
}

/**
 * Merges selected certificate PDFs in exact selected order while preserving
 * original page dimensions, orientation (A4 landscape/portrait), and resolution.
 */
export async function mergeCertificatePdfs(
  items: AdminCertificateItem[],
  onProgress?: (progress: MergeProgress) => void
): Promise<PdfMergeResult> {
  if (!items || items.length === 0) {
    return {
      success: false,
      totalPages: 0,
      succeededItems: [],
      failedItems: [],
      errorMessage: 'ยังไม่ได้เลือกรายการเกียรติบัตรสำหรับรวมไฟล์ PDF',
    };
  }

  const total = items.length;
  const fetchedResults: Array<{
    item: AdminCertificateItem;
    bytes?: Uint8Array;
    reason?: string;
    requiresGasUpdate?: boolean;
  }> = new Array(total);

  let completed = 0;
  let succeededCount = 0;
  let failedCount = 0;

  // Fetch in bounded batches (concurrency = 3) to respect GAS rate limits & keep UI responsive
  const BATCH_SIZE = 3;
  for (let start = 0; start < total; start += BATCH_SIZE) {
    const batchIndices: number[] = [];
    for (let j = start; j < Math.min(start + BATCH_SIZE, total); j++) {
      batchIndices.push(j);
    }

    await Promise.all(
      batchIndices.map(async (idx) => {
        const item = items[idx];
        const res = await fetchSinglePdfBytes(item);
        fetchedResults[idx] = {
          item,
          bytes: res.bytes,
          reason: res.reason,
          requiresGasUpdate: res.requiresGasUpdate,
        };
        completed += 1;
        if (res.ok) succeededCount += 1;
        else failedCount += 1;

        onProgress?.({
          completed,
          total,
          currentName: item.fullName,
          succeeded: succeededCount,
          failed: failedCount,
        });
      })
    );
  }

  // Merge strictly in the original selected order
  const mergedDoc = await PDFDocument.create();
  const succeededItems: SucceededCertificateItem[] = [];
  const failedItems: FailedCertificateItem[] = [];
  let requiresGasUpdate = false;

  for (const entry of fetchedResults) {
    if (entry.requiresGasUpdate) {
      requiresGasUpdate = true;
    }
    if (!entry.bytes) {
      failedItems.push({
        item: entry.item,
        reason: entry.reason || 'ไม่สามารถเข้าถึงไฟล์ PDF ได้',
      });
      continue;
    }

    try {
      const srcDoc = await PDFDocument.load(entry.bytes);
      const pageIndices = srcDoc.getPageIndices();
      if (pageIndices.length === 0) {
        failedItems.push({
          item: entry.item,
          reason: 'ไฟล์ PDF ไม่มีหน้าเอกสาร',
        });
        continue;
      }

      const copiedPages = await mergedDoc.copyPages(srcDoc, pageIndices);
      for (const page of copiedPages) {
        mergedDoc.addPage(page);
      }

      succeededItems.push({
        item: entry.item,
        pageCount: copiedPages.length,
      });
    } catch (err: any) {
      failedItems.push({
        item: entry.item,
        reason: `ไฟล์ PDF เสียหายหรือถูกเข้ารหัส (${err?.message || 'Parse error'})`,
      });
    }
  }

  const totalPages = mergedDoc.getPageCount();
  if (totalPages === 0) {
    return {
      success: false,
      totalPages: 0,
      succeededItems,
      failedItems,
      requiresGasUpdate,
      errorMessage:
        requiresGasUpdate
          ? 'กรุณาอัปเดตและ Deploy โค้ด Code.gs เวอร์ชันใหม่ใน Google Apps Script ก่อนจึงจะสามารถรวมไฟล์ PDF จาก Google Drive ได้'
          : 'ไม่สามารถรวมไฟล์ PDF ได้ เนื่องจากไม่พบไฟล์ PDF ที่เข้าถึงได้ในรายการที่เลือก',
    };
  }

  const mergedBytes = await mergedDoc.save();
  const safeBytes = new Uint8Array(mergedBytes.length);
  safeBytes.set(mergedBytes);
  const blob = new Blob([safeBytes.buffer], { type: 'application/pdf' });
  const blobUrl = URL.createObjectURL(blob);

  return {
    success: true,
    mergedBytes,
    blobUrl,
    totalPages,
    succeededItems,
    failedItems,
    requiresGasUpdate,
  };
}
