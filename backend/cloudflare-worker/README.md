# THAI WSK 2026 — Cloudflare Worker API Gateway

Backend API สำหรับระบบสืบศิลป์ถิ่นอักษร สืบสุนทรภาษาไทย กลุ่มสาระการเรียนรู้ภาษาไทย โรงเรียนกระทุ่มแบน "วิเศษสมุทคุณ"

## สถาปัตยกรรมความปลอดภัย
- แยกส่วน Frontend (Deploy ผ่าน GitHub Pages) ออกจาก Backend อย่างสิ้นเชิง
- ใช้ Google Service Account เชื่อมต่อกับ Google Sheets ID: `1EsneYlqKXHZakue-7fhHWzfNYOgmgitfUrMy-kzqiTI`
- ไม่เปิดเผย Private Key หรือ Access Token ให้ผู้ใช้งานในเบราว์เซอร์
- ไม่เปิด Spreadsheet ให้เป็น Public Editor
- ค้นหาข้อมูลแบบปลอดภัยและ Normalization คำนำหน้าภาษาไทย (นาย, นางสาว, เด็กชาย, ด.ช. ฯลฯ)

## แผ่นงานและช่วงข้อมูลที่ใช้งาน
1. **ตรวจสอบคะแนน**: `'ตรวจสอบคะแนน'!A:F`
   - A: เลขที่
   - B: ชื่อ-นามสกุล
   - C: ระดับชั้น
   - D: ห้อง
   - E: คะแนนที่ได้
   - F: ผลการประเมิน (ผ่าน/ไม่ผ่าน)
2. **ดาวน์โหลดเกียรติบัตร**: `'ดาวน์โหลดเกียรติบัตร'!A:F`
   - A: เลขที่
   - B: ชื่อ-นามสกุล
   - C: ระดับชั้น
   - D: ห้อง
   - E: ระดับเหรียญ
   - F: ดาวน์โหลดเกียรติบัตร (รองรับสูตร HYPERLINK, Google Drive ID และ Direct PDF)
3. **พื้นที่จัดเก็บ CMS**: `'ตรวจสอบคะแนน'!H:O` (เฉพาะเมื่อได้รับอนุญาต)

## วิธีการ Deploy Cloudflare Worker

### 1. ติดตั้ง Wrangler CLI
```bash
npm install -g wrangler
# หรือรันผ่าน npx ในโฟลเดอร์นี้
cd backend/cloudflare-worker
npm install
```

### 2. ล็อกอินเข้า Cloudflare
```bash
wrangler login
```

### 3. ตั้งค่า Secrets ใน Cloudflare Worker
ตั้งค่า Service Account Credentials ที่ได้รับสิทธิ์อ่าน Google Sheets:
```bash
wrangler secret put GOOGLE_SERVICE_ACCOUNT_EMAIL
# ใส่ Email ของ Service Account เช่น thai-wsk-service@project.iam.gserviceaccount.com

wrangler secret put GOOGLE_PRIVATE_KEY
# วาง Private Key ทั้งก้อนรวม -----BEGIN PRIVATE KEY----- ... -----END PRIVATE KEY-----

wrangler secret put ADMIN_USERNAME
# เช่น admin_wsk

wrangler secret put ADMIN_PASSWORD_HASH
# ตั้งรหัสผ่านสำหรับแอดมิน เช่น thai_wsk_2026
```

### 4. Deploy ขึ้น Cloudflare Workers
```bash
wrangler deploy
```
จะได้ URL เช่น: `https://thai-wsk-backend.<your-subdomain>.workers.dev`

### 5. นำ URL ไปใส่ใน Frontend
นำ URL ที่ได้ไปกำหนดใน:
- ไฟล์ `.env` ของ Frontend: `VITE_API_BASE_URL="https://thai-wsk-backend.<your-subdomain>.workers.dev"`
- หรือใส่ในหน้า "สำหรับแอดมิน" ในแท็บ "ฐานข้อมูล & API Gateway" บนเว็บไซต์
