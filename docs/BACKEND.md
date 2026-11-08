# คู่มือการติดตั้ง BACKEND API (CLOUDFLARE WORKER)
## THAI WSK 2026 — Secure API Gateway

คู่มือนี้สำหรับผู้ดูแลระบบในการติดตั้ง Cloudflare Worker ซึ่งทำหน้าที่เป็นสะพานเชื่อมต่อ (Gateway) ระหว่างเว็บไซต์ที่โฮสต์บน GitHub Pages กับฐานข้อมูล Google Sheets

---

## ทำไมต้องใช้ Cloudflare Worker?
1. **GitHub Pages ไม่รองรับ Node.js Server:** เว็บไซต์ที่เผยแพร่บน GitHub Pages เป็นไฟล์ Static (HTML, JS, CSS)
2. **ความปลอดภัยของ Google Service Account:** การเชื่อมต่อ Google Sheets API ต้องใช้ Private Key หากฝังไว้ในโค้ด React บน GitHub ทุกคนจะสามารถขโมย Key ได้
3. **ป้องกัน Quota Abuse & Rate Limiting:** จัดการคำขอค้นหา ตรวจสอบความถูกต้องของคำค้นหา และปกป้องข้อมูลส่วนบุคคลของนักเรียน

---

## ขั้นตอนการติดตั้งแบบละเอียด

### ขั้นตอนที่ 1: เตรียม Google Service Account
1. ไปที่ [Google Cloud Console](https://console.cloud.google.com/)
2. สร้าง Service Account และดาวน์โหลด JSON Key
3. คัดลอก `client_email` จากไฟล์ JSON (เช่น `thai-wsk-bot@my-project.iam.gserviceaccount.com`)
4. ไปที่ Google Spreadsheet ID: `1EsneYlqKXHZakue-7fhHWzfNYOgmgitfUrMy-kzqiTI`
5. กดปุ่ม **แชร์ (Share)** มุมขวาบน และเพิ่มอีเมล Service Account พร้อมให้สิทธิ์ **ผู้แก้ไข (Editor)** (เพื่อให้สามารถบันทึกข้อมูล CMS ในคอลัมน์ H:O ได้)

### ขั้นตอนที่ 2: Deploy Cloudflare Worker
เปิด Terminal ในโฟลเดอร์โปรเจกต์:
```bash
cd backend/cloudflare-worker
npm install
npx wrangler login
```

ใส่ Secrets สำคัญผ่านคำสั่ง:
```bash
# 1. อีเมลของ Service Account
npx wrangler secret put GOOGLE_SERVICE_ACCOUNT_EMAIL

# 2. Private Key จากไฟล์ JSON (รวมบรรทัด -----BEGIN PRIVATE KEY----- ถึง -----END PRIVATE KEY-----)
npx wrangler secret put GOOGLE_PRIVATE_KEY

# 3. ชื่อผู้ใช้แอดมิน
npx wrangler secret put ADMIN_USERNAME
# ใส่: admin_wsk

# 4. รหัสผ่านแอดมิน
npx wrangler secret put ADMIN_PASSWORD_HASH
# ใส่รหัสผ่านความปลอดภัยสูง เช่น thai_wsk_2026
```

สั่ง Deploy:
```bash
npx wrangler deploy
```

เมื่อเสร็จสิ้น คุณจะได้รับ URL เช่น:
`https://thai-wsk-backend.<your-subdomain>.workers.dev`

---

## ขั้นตอนที่ 3: นำ URL ไปเชื่อมต่อกับหน้าเว็บ
คุณสามารถเลือกทำวิธีใดวิธีหนึ่ง:
1. **ผ่านแผงควบคุมหน้าเว็บ:** เข้าเว็บไซต์ ไปที่เมนู "สำหรับแอดมิน" > แท็บ "ฐานข้อมูล & API Gateway" > วาง URL แล้วกด "ทดสอบการเชื่อมต่อ"
2. **ผ่าน .env ของ GitHub Repository:** กำหนดใน GitHub Secrets หรือในไฟล์ `.env`:
   ```env
   VITE_API_BASE_URL="https://thai-wsk-backend.<your-subdomain>.workers.dev"
   ```
