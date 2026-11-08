/**
 * THAI WSK 2026 — Cloudflare Worker API Gateway
 * เชื่อมต่อกับ Google Sheets ID: 1EsneYlqKXHZakue-7fhHWzfNYOgmgitfUrMy-kzqiTI
 * ไม่สร้างแผ่นงานใหม่ ไม่แก้ไขข้อมูล A:F และเก็บ Credentials ใน Worker Secrets
 */

export interface Env {
  // Google Service Account Credentials stored in Cloudflare Worker Secrets
  GOOGLE_SERVICE_ACCOUNT_EMAIL?: string;
  GOOGLE_PRIVATE_KEY?: string; // PEM RSA Private Key
  ADMIN_USERNAME?: string;
  ADMIN_PASSWORD_HASH?: string;
  ADMIN_JWT_SECRET?: string;
  CORS_ALLOW_ORIGIN?: string; // e.g. "https://<user>.github.io" or "*"
}

const SPREADSHEET_ID = '1EsneYlqKXHZakue-7fhHWzfNYOgmgitfUrMy-kzqiTI';
const SCORE_SHEET = 'ตรวจสอบคะแนน';
const CERTIFICATE_SHEET = 'ดาวน์โหลดเกียรติบัตร';

const THAI_PREFIXES = [
  'เด็กชาย',
  'เด็กหญิง',
  'ด.ช.',
  'ด.ญ.',
  'นาย',
  'นางสาว',
  'นาง',
  'น.ส.',
];

// Helper: Normalize Thai names
function normalizeThai(input: string): string {
  if (!input) return '';
  let cleaned = input.trim().replace(/\s+/g, ' ');
  for (const prefix of THAI_PREFIXES) {
    if (cleaned.startsWith(prefix)) {
      cleaned = cleaned.substring(prefix.length).trim();
      break;
    }
  }
  return cleaned.replace(/\s+/g, ' ').toLowerCase();
}

// Helper: Base64URL encode
function base64UrlEncode(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64UrlEncodeBytes(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Import PKCS8 RSA private key for RS256 signing
async function importPrivateKey(pem: string): Promise<CryptoKey> {
  const cleanPem = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\\n/g, '')
    .replace(/\s+/g, '');

  const binaryDer = Uint8Array.from(atob(cleanPem), (c) => c.charCodeAt(0));
  return await crypto.subtle.importKey(
    'pkcs8',
    binaryDer.buffer,
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: { name: 'SHA-256' },
    },
    false,
    ['sign']
  );
}

// Create Signed Google OAuth2 JWT Assertion
async function getGoogleAccessToken(env: Env): Promise<string> {
  if (!env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !env.GOOGLE_PRIVATE_KEY) {
    throw new Error('ยังไม่ได้กำหนด GOOGLE_SERVICE_ACCOUNT_EMAIL หรือ GOOGLE_PRIVATE_KEY ใน Cloudflare Worker Secrets');
  }

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claim = {
    iss: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedClaim = base64UrlEncode(JSON.stringify(claim));
  const dataToSign = `${encodedHeader}.${encodedClaim}`;

  const privateKey = await importPrivateKey(env.GOOGLE_PRIVATE_KEY);
  const signatureBytes = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    privateKey,
    new TextEncoder().encode(dataToSign)
  );
  const jwt = `${dataToSign}.${base64UrlEncodeBytes(new Uint8Array(signatureBytes))}`;

  // Exchange JWT for Access Token
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  if (!tokenRes.ok) {
    const errorBody = await tokenRes.text();
    throw new Error(`Google OAuth2 Token Exchange Error: ${errorBody}`);
  }

  const tokenData = (await tokenRes.json()) as { access_token: string };
  return tokenData.access_token;
}

// Fetch Range from Google Sheets API
async function getSheetValues(accessToken: string, range: string): Promise<any[][]> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(range)}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Sheets API Error (${res.status}): ${errorText}`);
  }

  const data = (await res.json()) as { values?: any[][] };
  return data.values || [];
}

// Extract URL from cell data, formulas (=HYPERLINK(...)), or text
function extractUrl(cellVal: any): string {
  if (!cellVal) return '';
  const text = String(cellVal).trim();
  const formulaMatch = text.match(/HYPERLINK\(\s*["'](https?:\/\/[^"']+)["']/i);
  if (formulaMatch && formulaMatch[1]) return formulaMatch[1];
  const urlMatch = text.match(/https?:\/\/[^\s"'<>]+/);
  return urlMatch ? urlMatch[0] : '';
}

// Format drive links
function formatDriveUrl(rawUrl: string): { previewUrl: string; downloadUrl: string; isDrive: boolean } {
  if (!rawUrl) return { previewUrl: '', downloadUrl: '', isDrive: false };
  const driveFileMatch = rawUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  const driveIdMatch = rawUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  const id = (driveFileMatch && driveFileMatch[1]) || (driveIdMatch && driveIdMatch[1]);

  if (id) {
    return {
      previewUrl: `https://drive.google.com/file/d/${id}/preview`,
      downloadUrl: `https://drive.google.com/uc?id=${id}&export=download`,
      isDrive: true,
    };
  }

  return {
    previewUrl: rawUrl,
    downloadUrl: rawUrl,
    isDrive: false,
  };
}

// Handle CORS
function getCorsHeaders(env: Env): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': env.CORS_ALLOW_ORIGIN || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const corsHeaders = getCorsHeaders(env);

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const pathname = url.pathname;

    try {
      // 1. Health check
      if (pathname === '/api/health') {
        let sheetsStatus = 'not_tested';
        let errorDetail = null;

        if (env.GOOGLE_SERVICE_ACCOUNT_EMAIL && env.GOOGLE_PRIVATE_KEY) {
          try {
            const token = await getGoogleAccessToken(env);
            if (token) sheetsStatus = 'connected_verified';
          } catch (e: any) {
            sheetsStatus = 'auth_failed';
            errorDetail = e?.message;
          }
        } else {
          sheetsStatus = 'credentials_missing_in_worker_secrets';
        }

        return new Response(
          JSON.stringify({
            status: 'ok',
            spreadsheetId: SPREADSHEET_ID,
            sheets: {
              score: SCORE_SHEET,
              certificate: CERTIFICATE_SHEET,
              cmsRange: "'ตรวจสอบคะแนน'!H:O",
            },
            sheetsApiStatus: sheetsStatus,
            errorDetail,
            timestamp: new Date().toISOString(),
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      // 2. Search Score: Sheet 'ตรวจสอบคะแนน'!A:F
      if (pathname === '/api/search-score' && request.method === 'POST') {
        const body = (await request.json()) as { query?: string; grade?: string; room?: string };
        const query = body.query?.trim();

        if (!query || query.length < 2) {
          return new Response(
            JSON.stringify({
              success: false,
              message: 'กรุณาระบุคำค้นหาชื่อ-นามสกุลอย่างน้อย ๒ ตัวอักษร',
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }

        const accessToken = await getGoogleAccessToken(env);
        const rows = await getSheetValues(accessToken, `'${SCORE_SHEET}'!A:F`);

        if (!rows || rows.length <= 1) {
          return new Response(
            JSON.stringify({
              success: false,
              message: 'ไม่พบข้อมูลในตารางตรวจสอบคะแนน',
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const normalizedQuery = normalizeThai(query);
        const dataRows = rows.slice(1); // skip row 1 header

        const matches: any[] = [];
        for (const row of dataRows) {
          const number = String(row[0] || '').trim();
          const fullName = String(row[1] || '').trim();
          const grade = String(row[2] || '').trim();
          const room = String(row[3] || '').trim();
          const score = row[4] !== undefined ? row[4] : '';
          const evaluation = String(row[5] || '').trim();

          const normalizedName = normalizeThai(fullName);
          if (normalizedName.includes(normalizedQuery)) {
            // Check filters if specified
            if (body.grade && !grade.includes(body.grade)) continue;
            if (body.room && !room.includes(body.room)) continue;

            matches.push({
              number,
              fullName,
              grade,
              room,
              score,
              evaluation,
            });
          }
        }

        // Multiple match safety rule: If more than 3 people with similar names and no grade/room specified
        if (matches.length > 2 && (!body.grade || !body.room)) {
          return new Response(
            JSON.stringify({
              success: false,
              requiresRefinement: true,
              totalMatches: matches.length,
              message: `พบผู้มีชื่อคล้ายกัน ${matches.length} รายการ กรุณาระบุระดับชั้นและห้องเพื่อความถูกต้องของข้อมูลส่วนบุคคล`,
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (matches.length === 0) {
          return new Response(
            JSON.stringify({
              success: false,
              message: 'ไม่พบข้อมูลที่ตรงกับการค้นหา',
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({
            success: true,
            data: matches,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // 3. Search Certificate: Sheet 'ดาวน์โหลดเกียรติบัตร'!A:F
      if (pathname === '/api/search-certificate' && request.method === 'POST') {
        const body = (await request.json()) as { query?: string; grade?: string; room?: string };
        const query = body.query?.trim();

        if (!query || query.length < 2) {
          return new Response(
            JSON.stringify({
              success: false,
              message: 'กรุณาระบุคำค้นหาชื่ออย่างน้อย ๒ ตัวอักษร',
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }

        const accessToken = await getGoogleAccessToken(env);
        const rows = await getSheetValues(accessToken, `'${CERTIFICATE_SHEET}'!A:F`);

        if (!rows || rows.length <= 1) {
          return new Response(
            JSON.stringify({
              success: false,
              message: 'ไม่พบข้อมูลในตารางดาวน์โหลดเกียรติบัตร',
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const normalizedQuery = normalizeThai(query);
        const dataRows = rows.slice(1);
        const matches: any[] = [];

        for (const row of dataRows) {
          const number = String(row[0] || '').trim();
          const fullName = String(row[1] || '').trim();
          const grade = String(row[2] || '').trim();
          const room = String(row[3] || '').trim();
          const medal = String(row[4] || '').trim(); // Col E: ระดับเหรียญ
          const rawUrl = extractUrl(row[5]); // Col F: URL เกียรติบัตร

          const normalizedName = normalizeThai(fullName);
          if (normalizedName.includes(normalizedQuery)) {
            if (body.grade && !grade.includes(body.grade)) continue;
            if (body.room && !room.includes(body.room)) continue;

            const driveInfo = formatDriveUrl(rawUrl);

            matches.push({
              number,
              fullName,
              grade,
              room,
              medal,
              certificateUrl: rawUrl,
              previewUrl: driveInfo.previewUrl,
              downloadUrl: driveInfo.downloadUrl,
              isDrive: driveInfo.isDrive,
            });
          }
        }

        if (matches.length > 2 && (!body.grade || !body.room)) {
          return new Response(
            JSON.stringify({
              success: false,
              requiresRefinement: true,
              totalMatches: matches.length,
              message: `พบผู้มีชื่อคล้ายกัน ${matches.length} รายการ กรุณาระบุระดับชั้นและห้อง`,
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (matches.length === 0) {
          return new Response(
            JSON.stringify({
              success: false,
              message: 'ไม่พบข้อมูลเกียรติบัตรที่ตรงกับการค้นหา',
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({
            success: true,
            data: matches,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // 4. Admin Login
      if (pathname === '/api/admin/login' && request.method === 'POST') {
        const body = (await request.json()) as { username?: string; passwordHashOrSecret?: string };
        const expectedUser = env.ADMIN_USERNAME || 'admin_wsk';
        const expectedPass = env.ADMIN_PASSWORD_HASH || 'thai_wsk_2026';

        if (body.username === expectedUser && body.passwordHashOrSecret === expectedPass) {
          const token = `wsk-token-${Date.now()}-${Math.random().toString(36).substring(2)}`;
          return new Response(
            JSON.stringify({
              success: true,
              token,
              message: 'เข้าสู่ระบบแอดมินสำเร็จ',
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({
            success: false,
            message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
        );
      }

      // 5. Site Content (CMS in H:O)
      if (pathname === '/api/site-content' && request.method === 'GET') {
        try {
          if (!env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !env.GOOGLE_PRIVATE_KEY) {
            return new Response(
              JSON.stringify({
                success: true,
                isFromBackend: false,
                message: 'Worker Secrets ยังไม่ได้ตั้งค่า',
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          const accessToken = await getGoogleAccessToken(env);
          const cmsRows = await getSheetValues(accessToken, `'${SCORE_SHEET}'!H:O`);

          if (cmsRows && cmsRows.length > 1) {
            // Find row containing master JSON
            const contentRow = cmsRows.find((r) => r[3] === 'SITE_CONTENT_MASTER');
            if (contentRow && contentRow[4]) {
              const parsed = JSON.parse(contentRow[4]);
              return new Response(
                JSON.stringify({
                  success: true,
                  content: parsed,
                  isFromBackend: true,
                }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              );
            }
          }
        } catch (e: any) {
          // fallback
        }

        return new Response(
          JSON.stringify({
            success: true,
            isFromBackend: false,
            message: 'ไม่มีข้อมูล CMS บันทึกในคอลัมน์ H:O ใช้ค่าเริ่มต้น',
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // 6. Save CMS Content (PUT to H:O)
      if (pathname === '/api/admin/content' && request.method === 'PUT') {
        const auth = request.headers.get('Authorization');
        if (!auth || !auth.startsWith('Bearer ')) {
          return new Response(
            JSON.stringify({ success: false, message: 'ไม่ได้รับอนุญาต (Unauthorized)' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
          );
        }

        const body = (await request.json()) as { content: any };
        const accessToken = await getGoogleAccessToken(env);

        // Prepare row in H:O: H=ID, I=SECTION, J=TYPE, K=KEY, L=VALUE_JSON, M=ORDER, N=ACTIVE, O=UPDATED_AT
        const rowData = [
          'CMS_01',
          'MASTER',
          'JSON',
          'SITE_CONTENT_MASTER',
          JSON.stringify(body.content),
          '1',
          'TRUE',
          new Date().toISOString(),
        ];

        const updateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/'${encodeURIComponent(
          SCORE_SHEET
        )}'!H2:O2?valueInputOption=RAW`;

        const updateRes = await fetch(updateUrl, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            values: [rowData],
          }),
        });

        if (!updateRes.ok) {
          const errText = await updateRes.text();
          throw new Error(`Sheets Update Error: ${errText}`);
        }

        return new Response(
          JSON.stringify({
            success: true,
            message: 'บันทึกข้อมูล CMS ลงคอลัมน์ H:O ของ Google Sheets สำเร็จเรียบร้อยแล้ว',
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ error: 'Endpoint not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    } catch (err: any) {
      return new Response(
        JSON.stringify({
          success: false,
          error: err?.message || 'Internal Server Error',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
  },
};
