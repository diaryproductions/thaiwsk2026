/**
 * =========================================================================
 * THAI WSK 2026 — Google Apps Script Web App Connector (Code.gs)
 * โครงการส่งเสริมและพัฒนาความรู้ความสามารถด้านภาษาไทย
 * กลุ่มสาระการเรียนรู้ภาษาไทย โรงเรียนกระทุ่มแบน "วิเศษสมุทคุณ"
 * =========================================================================
 *
 * ฐานข้อมูลหลัก: Google Spreadsheet ID: 1EsneYlqKXHZakue-7fhHWzfNYOgmgitfUrMy-kzqiTI
 * - แผ่นงาน 'ตรวจสอบคะแนน' (A:F)
 * - แผ่นงาน 'ดาวน์โหลดเกียรติบัตร' (A:F)
 * - พื้นที่จัดเก็บ CMS คอลัมน์ H:O ในแผ่นงาน 'ตรวจสอบคะแนน' (ห้ามแตะต้อง A:F)
 */

// 1. ค่าคงที่ของระบบฐานข้อมูล
var SPREADSHEET_ID = '1EsneYlqKXHZakue-7fhHWzfNYOgmgitfUrMy-kzqiTI';
var SCORE_SHEET = 'ตรวจสอบคะแนน';
var CERTIFICATE_SHEET = 'ดาวน์โหลดเกียรติบัตร';

// รหัสผ่านผู้ดูแลระบบสำหรับ Google Apps Script (แก้ไขได้ที่นี่)
var ADMIN_USERNAME = 'admin_wsk';
var ADMIN_PASSWORD = 'thai_wsk_2026';

// คำนำหน้าชื่อภาษาไทยสำหรับการตัดคำนำหน้าและค้นหา
var THAI_PREFIXES = [
  'เด็กชาย',
  'เด็กหญิง',
  'ด.ช.',
  'ด.ญ.',
  'นาย',
  'นางสาว',
  'นาง',
  'น.ส.',
];

/**
 * ฟังก์ชันหลักรับคำขอ GET จาก Frontend (GitHub Pages)
 */
function doGet(e) {
  try {
    var params = e && e.parameter ? e.parameter : {};
    var action = params.action || 'health';

    // 1. ตรวจสอบสถานะการเชื่อมต่อ (Health Check)
    if (action === 'health') {
      return jsonResponse(checkHealth());
    }

    // 2. ค้นหาคะแนนสอบ
    if (action === 'searchScore') {
      var query = params.query || '';
      var grade = params.grade || '';
      var room = params.room || '';
      return jsonResponse(searchScoreData(query, grade, room));
    }

    // 3. ค้นหาเกียรติบัตร
    if (action === 'searchCertificate') {
      var queryCert = params.query || '';
      var gradeCert = params.grade || '';
      var roomCert = params.room || '';
      return jsonResponse(searchCertificateData(queryCert, gradeCert, roomCert));
    }

    // 4. ดึงข้อมูล CMS สำหรับเว็บไซต์
    if (action === 'getContent') {
      return jsonResponse(getSiteContentFromSheet());
    }

    // 5. ตรวจสอบเวอร์ชัน CMS (สำหรับ Polling)
    if (action === 'getVersion') {
      return jsonResponse(getSiteVersionFromSheet());
    }

    // หากเปิดผ่านเบราว์เซอร์โดยตรงโดยไม่มี action ให้แสดงหน้า Status ของ Web App
    return HtmlService.createHtmlOutput(
      '<!DOCTYPE html><html><head><meta charset="utf-8"><title>THAI WSK 2026 Apps Script Gateway</title>' +
      '<style>body{font-family:sans-serif;padding:30px;line-height:1.6;background:#FAF8FD;color:#30283A;}' +
      '.card{background:#fff;padding:24px;border-radius:12px;border:1px solid #D6AF55;max-width:600px;margin:auto;box-shadow:0 4px 12px rgba(0,0,0,0.05);}' +
      'h2{color:#4B267D;margin-top:0;}.badge{display:inline-block;padding:4px 12px;background:#E8F5E9;color:#2E7D32;border-radius:20px;font-weight:bold;font-size:12px;}' +
      'code{background:#f3f3f3;padding:2px 6px;border-radius:4px;font-family:monospace;}</style></head><body>' +
      '<div class="card">' +
      '<span class="badge">Google Apps Script Web App: ONLINE</span>' +
      '<h2>THAI WSK 2026 — Database Connector</h2>' +
      '<p>ระบบเชื่อมต่อฐานข้อมูล Google Sheets ของโรงเรียนกระทุ่มแบน "วิเศษสมุทคุณ" พร้อมทำงานแล้ว</p>' +
      '<p><strong>Spreadsheet ID:</strong> <code>' + SPREADSHEET_ID + '</code></p>' +
      '<p><strong>แผ่นงานที่ใช้งาน:</strong><br>• <code>' + SCORE_SHEET + ' (A:F)</code><br>• <code>' + CERTIFICATE_SHEET + ' (A:F)</code><br>• <code>CMS: ' + SCORE_SHEET + ' (H:O)</code></p>' +
      '<p style="font-size:12px;color:#777;">* สามารถนำ URL ของ Web App นี้ไปใส่ในเว็บไซต์บน GitHub Pages ได้ทันที</p>' +
      '</div></body></html>'
    ).setTitle('THAI WSK 2026 Database Gateway');

  } catch (error) {
    return jsonResponse({
      success: false,
      error: error.toString(),
      message: 'เกิดข้อผิดพลาดในการประมวลผลคำขอ GET: ' + error.message,
    });
  }
}

/**
 * ฟังก์ชันหลักรับคำขอ POST จาก Frontend
 */
function doPost(e) {
  try {
    var data = {};
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        // หากส่งมาเป็น URL encoded หรือ text ธรรมดา
        data = e.parameter || {};
      }
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    var action = data.action || (e && e.parameter && e.parameter.action) || '';

    // 1. ค้นหาคะแนนสอบ (POST)
    if (action === 'searchScore') {
      return jsonResponse(searchScoreData(data.query, data.grade, data.room));
    }

    // 2. ค้นหาเกียรติบัตร (POST)
    if (action === 'searchCertificate') {
      return jsonResponse(searchCertificateData(data.query, data.grade, data.room));
    }

    // 3. เข้าสู่ระบบแอดมิน (POST)
    if (action === 'adminLogin') {
      return jsonResponse(handleAdminLogin(data.username, data.passwordHashOrSecret));
    }

    // 4. บันทึกข้อมูล CMS (POST)
    if (action === 'saveContent') {
      return jsonResponse(saveSiteContentToSheet(data.content, data.token));
    }

    return jsonResponse({
      success: false,
      message: 'ไม่พบ Action ที่ร้องขอ (' + action + ')',
    });

  } catch (error) {
    return jsonResponse({
      success: false,
      error: error.toString(),
      message: 'เกิดข้อผิดพลาดในการประมวลผลคำขอ POST: ' + error.message,
    });
  }
}

/**
 * ส่งข้อมูลออกเป็น JSON
 */
function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * ตรวจสอบความพร้อมของฐานข้อมูลและสิทธิ์เข้าถึงชีต
 */
function checkHealth() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var scoreSheetObj = ss.getSheetByName(SCORE_SHEET);
  var certSheetObj = ss.getSheetByName(CERTIFICATE_SHEET);

  var scoreSheetExists = scoreSheetObj !== null;
  var certSheetExists = certSheetObj !== null;

  var scoreRowsCount = scoreSheetExists ? scoreSheetObj.getLastRow() : 0;
  var certRowsCount = certSheetExists ? certSheetObj.getLastRow() : 0;

  return {
    status: 'ok',
    success: true,
    spreadsheetId: SPREADSHEET_ID,
    spreadsheetTitle: ss.getName(),
    sheets: {
      scoreSheet: SCORE_SHEET,
      scoreSheetExists: scoreSheetExists,
      scoreRows: scoreRowsCount,
      certificateSheet: CERTIFICATE_SHEET,
      certificateSheetExists: certSheetExists,
      certificateRows: certRowsCount,
    },
    sheetsApiStatus: 'connected_verified',
    timestamp: new Date().toISOString(),
    backendType: 'google_apps_script',
  };
}

/**
 * ตัดคำนำหน้าและจัดรูปคำค้นหาภาษาไทย
 */
function normalizeThai(input) {
  if (!input) return '';
  var text = String(input).trim().replace(/\s+/g, ' ');
  for (var i = 0; i < THAI_PREFIXES.length; i++) {
    var prefix = THAI_PREFIXES[i];
    if (text.indexOf(prefix) === 0) {
      text = text.substring(prefix.length).trim();
      break;
    }
  }
  return text.replace(/\s+/g, ' ').toLowerCase();
}

/**
 * ค้นหาคะแนนสอบจากแผ่นงาน 'ตรวจสอบคะแนน'!A:F
 */
function searchScoreData(query, gradeFilter, roomFilter) {
  if (!query || String(query).trim().length < 2) {
    return {
      success: false,
      message: 'กรุณาระบุคำค้นหาชื่อ-นามสกุลอย่างน้อย ๒ ตัวอักษร',
    };
  }

  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SCORE_SHEET);
  if (!sheet) {
    return {
      success: false,
      message: 'ไม่พบแผ่นงาน "' + SCORE_SHEET + '" ในสเปรดชีต',
    };
  }

  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    return {
      success: false,
      message: 'ไม่พบข้อมูลในตารางตรวจสอบคะแนน',
    };
  }

  // อ่านข้อมูล A:F (แถวที่ 2 ถึงแถวสุดท้าย)
  var range = sheet.getRange(2, 1, lastRow - 1, 6);
  var values = range.getValues();

  var normalizedQuery = normalizeThai(query);
  var matches = [];

  for (var i = 0; i < values.length; i++) {
    var row = values[i];
    var number = String(row[0] || '').trim();
    var fullName = String(row[1] || '').trim();
    var grade = String(row[2] || '').trim();
    var room = String(row[3] || '').trim();
    var score = row[4] !== undefined && row[4] !== null ? row[4] : '';
    var evaluation = String(row[5] || '').trim(); // ผลการประเมินคอลัมน์ F โดยตรง

    var normalizedName = normalizeThai(fullName);

    if (normalizedName.indexOf(normalizedQuery) !== -1) {
      // ตรวจสอบตัวกรองระดับชั้น
      if (gradeFilter && String(grade).indexOf(gradeFilter) === -1) {
        continue;
      }
      // ตรวจสอบตัวกรองห้อง
      if (roomFilter && String(room).indexOf(roomFilter) === -1) {
        continue;
      }

      matches.push({
        number: number,
        fullName: fullName,
        grade: grade,
        room: room,
        score: score,
        evaluation: evaluation,
      });
    }
  }

  // ป้องกันการค้นหาที่กว้างเกินไป หากมีชื่อคล้ายกันมากกว่า 2 คน
  if (matches.length > 2 && (!gradeFilter || !roomFilter)) {
    return {
      success: false,
      requiresRefinement: true,
      totalMatches: matches.length,
      message: 'พบข้อมูลผู้มีชื่อคล้ายกัน ' + matches.length + ' คน เพื่อความถูกต้องของข้อมูลส่วนบุคคล กรุณาระบุระดับชั้นและห้องเรียนเพิ่มเติม',
    };
  }

  if (matches.length === 0) {
    return {
      success: false,
      message: 'ไม่พบข้อมูลที่ตรงกับการค้นหา',
    };
  }

  return {
    success: true,
    data: matches,
  };
}

/**
 * ค้นหาเกียรติบัตรจากแผ่นงาน 'ดาวน์โหลดเกียรติบัตร'!A:F
 */
function searchCertificateData(query, gradeFilter, roomFilter) {
  if (!query || String(query).trim().length < 2) {
    return {
      success: false,
      message: 'กรุณาระบุคำค้นหาชื่ออย่างน้อย ๒ ตัวอักษร',
    };
  }

  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(CERTIFICATE_SHEET);
  if (!sheet) {
    return {
      success: false,
      message: 'ไม่พบแผ่นงาน "' + CERTIFICATE_SHEET + '" ในสเปรดชีต',
    };
  }

  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    return {
      success: false,
      message: 'ไม่พบข้อมูลในตารางดาวน์โหลดเกียรติบัตร',
    };
  }

  var range = sheet.getRange(2, 1, lastRow - 1, 6);
  var values = range.getValues();
  var formulas = range.getFormulas();
  var richText = range.getRichTextValues();

  var normalizedQuery = normalizeThai(query);
  var matches = [];

  for (var i = 0; i < values.length; i++) {
    var row = values[i];
    var number = String(row[0] || '').trim();
    var fullName = String(row[1] || '').trim();
    var grade = String(row[2] || '').trim();
    var room = String(row[3] || '').trim();
    var medal = String(row[4] || '').trim(); // Col E: ระดับเหรียญ
    
    // ดึง URL จาก Col F (รองรับ Formula, Rich Text, หรือ Plain URL)
    var rawUrl = '';
    
    // 1. ตรวจสอบสูตร =HYPERLINK("...", "...")
    var formulaF = formulas[i] ? formulas[i][5] : '';
    if (formulaF) {
      var matchFormula = formulaF.match(/HYPERLINK\(\s*["']([^"']+)["']/i);
      if (matchFormula && matchFormula[1]) {
        rawUrl = matchFormula[1];
      }
    }

    // 2. ตรวจสอบ Rich Text Link
    if (!rawUrl && richText && richText[i] && richText[i][5]) {
      var rtLink = richText[i][5].getLinkUrl();
      if (rtLink) {
        rawUrl = rtLink;
      }
    }

    // 3. ตรวจสอบข้อความ Plain Text
    if (!rawUrl && row[5]) {
      var cellText = String(row[5]).trim();
      var urlMatch = cellText.match(/https?:\/\/[^\s"'<>]+/);
      if (urlMatch) {
        rawUrl = urlMatch[0];
      }
    }

    var normalizedName = normalizeThai(fullName);
    if (normalizedName.indexOf(normalizedQuery) !== -1) {
      if (gradeFilter && String(grade).indexOf(gradeFilter) === -1) continue;
      if (roomFilter && String(room).indexOf(roomFilter) === -1) continue;

      var driveInfo = resolveDriveInfo(rawUrl);

      matches.push({
        number: number,
        fullName: fullName,
        grade: grade,
        room: room,
        medal: medal,
        certificateUrl: rawUrl,
        previewUrl: driveInfo.previewUrl,
        downloadUrl: driveInfo.downloadUrl,
        isDrive: driveInfo.isDrive,
      });
    }
  }

  if (matches.length > 2 && (!gradeFilter || !roomFilter)) {
    return {
      success: false,
      requiresRefinement: true,
      totalMatches: matches.length,
      message: 'พบข้อมูลผู้มีชื่อคล้ายกัน ' + matches.length + ' คน กรุณาระบุระดับชั้นและห้องเรียนเพิ่มเติม',
    };
  }

  if (matches.length === 0) {
    return {
      success: false,
      message: 'ไม่พบข้อมูลเกียรติบัตรที่ตรงกับการค้นหา',
    };
  }

  return {
    success: true,
    data: matches,
  };
}

/**
 * แยกแยะและแปลงลิงก์ Google Drive ให้เป็น Preview และ Download
 */
function resolveDriveInfo(rawUrl) {
  if (!rawUrl) {
    return { previewUrl: '', downloadUrl: '', isDrive: false };
  }

  var driveFileMatch = rawUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  var driveIdMatch = rawUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  var driveId = (driveFileMatch && driveFileMatch[1]) || (driveIdMatch && driveIdMatch[1]);

  if (driveId) {
    return {
      previewUrl: 'https://drive.google.com/file/d/' + driveId + '/preview',
      downloadUrl: 'https://drive.google.com/uc?id=' + driveId + '&export=download',
      isDrive: true,
    };
  }

  return {
    previewUrl: rawUrl,
    downloadUrl: rawUrl,
    isDrive: false,
  };
}

/**
 * ดึงข้อมูล CMS จากแผ่นงาน 'ตรวจสอบคะแนน' คอลัมน์ H:O
 */
function getSiteContentFromSheet() {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(SCORE_SHEET);
    if (!sheet) {
      return { success: true, isFromBackend: false, message: 'ไม่พบชีต' };
    }

    var lastRow = sheet.getLastRow();
    if (lastRow < 2) {
      return { success: true, isFromBackend: false, message: 'ยังไม่มีข้อมูล CMS' };
    }

    // ตรวจสอบคอลัมน์ H:O (แถว 2)
    var cmsRange = sheet.getRange(2, 8, Math.min(lastRow - 1, 10), 8);
    var values = cmsRange.getValues();

    for (var i = 0; i < values.length; i++) {
      var key = values[i][3]; // Col K: CMS_KEY
      var valJson = values[i][4]; // Col L: CMS_VALUE_JSON
      if (key === 'SITE_CONTENT_MASTER' && valJson) {
        var parsed = JSON.parse(valJson);
        return {
          success: true,
          content: parsed,
          isFromBackend: true,
          updatedAt: values[i][7] || new Date().toISOString(),
        };
      }
    }

    return { success: true, isFromBackend: false, message: 'ไม่มีข้อมูล CMS บันทึกไว้' };
  } catch (err) {
    return { success: false, message: err.message, isFromBackend: false };
  }
}

/**
 * ดึงเฉพาะเวอร์ชันเพื่อประหยัด Quota ในการ Polling
 */
function getSiteVersionFromSheet() {
  var res = getSiteContentFromSheet();
  if (res.success && res.content) {
    return {
      success: true,
      version: res.content.version || 1,
      updatedAt: res.updatedAt || new Date().toISOString(),
    };
  }
  return { success: false, version: 1 };
}

/**
 * ตรวจสอบรหัสผ่านแอดมิน
 */
function handleAdminLogin(username, password) {
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    var token = 'gas-token-' + new Date().getTime() + '-' + Math.floor(Math.random() * 100000);
    return {
      success: true,
      token: token,
      message: 'เข้าสู่ระบบแอดมินสำเร็จ',
    };
  }
  return {
    success: false,
    message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
  };
}

/**
 * บันทึกข้อมูล CMS ลงคอลัมน์ H:O ของแผ่นงาน 'ตรวจสอบคะแนน' (ห้ามแตะต้อง A:F)
 */
function saveSiteContentToSheet(content, token) {
  if (!content) {
    return { success: false, message: 'ไม่มีข้อมูล Content สำหรับบันทึก' };
  }

  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SCORE_SHEET);
  if (!sheet) {
    return { success: false, message: 'ไม่พบแผ่นงาน "' + SCORE_SHEET + '"' };
  }

  // กำหนดหัวตาราง H1:O1 หากยังไม่มี
  var headerRange = sheet.getRange('H1:O1');
  var currentHeaders = headerRange.getValues()[0];
  if (!currentHeaders[0]) {
    headerRange.setValues([[
      'CMS_ID',
      'CMS_SECTION',
      'CMS_TYPE',
      'CMS_KEY',
      'CMS_VALUE_JSON',
      'SORT_ORDER',
      'IS_ACTIVE',
      'UPDATED_AT',
    ]]);
  }

  // บันทึกลง H2:O2
  var rowData = [
    'CMS_01',
    'MASTER',
    'JSON',
    'SITE_CONTENT_MASTER',
    JSON.stringify(content),
    1,
    'TRUE',
    new Date().toISOString(),
  ];

  sheet.getRange('H2:O2').setValues([rowData]);

  return {
    success: true,
    message: 'บันทึกข้อมูล CMS ลงคอลัมน์ H:O ของ Google Sheets สำเร็จเรียบร้อยแล้ว ทุกอุปกรณ์จะได้รับข้อมูลอัปเดตทันที',
    updatedAt: new Date().toISOString(),
  };
}
