# คู่มือการติดตั้ง GOOGLE APPS SCRIPT WEB APP
## THAI WSK 2026 — ตัวกลางเชื่อมต่อ Google Sheets โดยตรง

คู่มือนี้สำหรับผู้ดูแลระบบในการติดตั้ง Google Apps Script (Code.gs) ซึ่งทำหน้าที่เป็น Web App API Gateway เชื่อมต่อโดยตรงกับ Google Spreadsheet ID: `1EsneYlqKXHZakue-7fhHWzfNYOgmgitfUrMy-kzqiTI`

---

## จุดเด่นของการใช้ Google Apps Script
1. **ทำงานร่วมกับ Google Sheets โดยตรง:** ใช้คำสั่ง `SpreadsheetApp.openById()` ภายในโครงสร้างพื้นฐานของ Google โดยไม่ต้องสร้าง Service Account ซับซ้อน
2. **ไม่ใช้ Cloudflare Worker:** ยกเลิกการใช้งาน Cloudflare Worker และไม่มีค่าใช้จ่ายเพิ่มเติม
3. **รองรับ GitHub Pages:** สามารถส่งคำขอผ่าน `fetch` แบบ GET หรือ POST (`Content-Type: text/plain`) จาก GitHub Pages ได้อย่างราบรื่น
4. **ความปลอดภัย:** สิทธิ์เข้าถึงฐานข้อมูลผูกกับบัญชี Google ของผู้สร้างสเปรดชีต และสามารถอ่านชีตได้โดยตรง

---

## ขั้นตอนการติดตั้งทีละขั้นตอน

### ขั้นตอนที่ 1: เปิด Google Apps Script ใน Google Sheets
1. เปิดไฟล์ Google Sheets ของโครงการ (Spreadsheet ID: `1EsneYlqKXHZakue-7fhHWzfNYOgmgitfUrMy-kzqiTI`)
2. คลิกที่เมนูด้านบน: **ส่วนขยาย (Extensions)** > **Apps Script**
3. ระบบจะเปิดหน้าต่างแก้ไขโค้ด Apps Script ขึ้นมา

### ขั้นตอนที่ 2: วางโค้ด Code.gs
1. ลบโค้ดเดิมในไฟล์ `Code.gs` ทั้งหมด
2. คัดลอกโค้ดทั้งหมดจากไฟล์ `Code.gs` (ในโฟลเดอร์โปรเจกต์นี้) ไปวางแทนที่
3. กดปุ่ม **บันทึก (Save)** (ไอคอนแผ่นดิสก์ หรือกด `Ctrl + S`)

### ขั้นตอนที่ 3: เผยแพร่เป็น Web App (Deploy)
1. คลิกปุ่มสีน้ำเงิน **การทำให้ใช้งานได้ (Deploy)** มุมบนขวา > เลือก **การทำให้ใช้งานได้ใหม่ (New deployment)**
2. คลิกไอคอนรูปเฟือง ⚙️ ข้าง "เลือกประเภท" (Select type) > เลือก **เว็บแอป (Web app)**
3. ตั้งค่าดังนี้:
   - **คำอธิบาย (Description):** `THAI WSK 2026 Database Gateway`
   - **ดำเนินการในฐานะ (Execute as):** `ฉัน (Me - your email)`
   - **ผู้มีสิทธิ์เข้าถึง (Who has access):** `ทุกคน (Anyone)` *(สำคัญมาก: ต้องเลือก Anyone เพื่อให้เว็บไซต์บน GitHub Pages สามารถเรียกดูคะแนนและเกียรติบัตรได้)*
4. คลิกปุ่ม **ทำให้ใช้งานได้ (Deploy)**
5. หาก Google ขอให้ตรวจสอบสิทธิ์ (Authorize access):
   - คลิก **ตรวจสอบสิทธิ์ (Authorize access)**
   - เลือกบัญชี Google ของคุณ
   - หากขึ้นหน้าต่างเตือน "Google ยังไม่ได้ยืนยันแอปนี้" ให้คลิก **ขั้นสูง (Advanced)** > คลิก **ไปยัง THAI WSK 2026 (ไม่ปลอดภัย) / Go to ... (unsafe)**
   - คลิก **อนุญาต (Allow)**
6. เมื่อ Deploy สำเร็จ คุณจะได้รับ **URL ของเว็บแอป (Web App URL)** ที่ลงท้ายด้วย `/exec` เช่น:
   ```
   https://script.google.com/macros/s/AKfycbx.../exec
   ```
7. คัดลอก URL ดังกล่าวเก็บไว้

---

## ขั้นตอนที่ 4: นำ URL ไปเชื่อมต่อเพื่อให้ใช้งานได้ทุกอุปกรณ์ (Shared Configuration)

เพื่อให้โทรศัพท์มือถือ แท็บเล็ต และคอมพิวเตอร์ทุกเครื่องสามารถเข้าถึงฐานข้อมูลได้ทันที โดย**ไม่ต้อง**เข้าไปตั้งค่าในแต่ละเครื่อง:

### วิธีที่ 1: กำหนดผ่านไฟล์ `public/app-config.json` (แนะนำสูงสุดสำหรับ GitHub Pages)
1. เปิดไฟล์ `public/app-config.json` ในโปรเจกต์
2. นำ URL ที่ลงท้ายด้วย `/exec` ไปใส่ในค่า `gasWebAppUrl`:
   ```json
   {
     "gasWebAppUrl": "https://script.google.com/macros/s/AKfycb.../exec",
     "spreadsheetId": "1EsneYlqKXHZakue-7fhHWzfNYOgmgitfUrMy-kzqiTI",
     "scoreSheet": "ตรวจสอบคะแนน",
     "certificateSheet": "ดาวน์โหลดเกียรติบัตร",
     "appName": "THAI WSK 2026"
   }
   ```
3. Commit และ Push ขึ้น GitHub Pages — ทุกอุปกรณ์ในโลกจะโหลด URL เดียวกันนี้จากไฟล์ config ส่วนกลางและเชื่อมต่อได้ทันที!

### วิธีที่ 2: ตั้งค่าและส่งออกจากหน้า Admin Dashboard
1. เปิดหน้าเว็บไซต์ เข้าเมนู **"สำหรับแอดมิน"** > แท็บ **"ฐานข้อมูล & Google Apps Script"**
2. วาง URL ลงในช่องแล้วกด **"ทดสอบการเชื่อมต่อ (Health Check)"**
3. ระบบจะทำการตรวจสอบความถูกต้อง ๖ ด้านทันที
4. กดปุ่ม **"ดาวน์โหลด app-config.json"** (หรือกด "คัดลอก JSON")
5. นำไฟล์ที่ได้ไปใส่ไว้ที่โฟลเดอร์ `public/app-config.json` ใน GitHub แล้ว Deploy

### วิธีที่ 3: กำหนดผ่าน Environment Variable (.env หรือ GitHub Secrets)
กำหนดใน GitHub Repository Secrets / Variables หรือไฟล์ `.env`:
```env
VITE_GAS_URL="https://script.google.com/macros/s/AKfycb.../exec"
```

---

## ข้อควรระวังสำคัญเพื่อไม่ให้ระบบขัดข้องบนอุปกรณ์อื่น
1. **ต้องใช้ URL ที่ลงท้ายด้วย `/exec` เท่านั้น (ห้ามใช้ `/dev`):**
   - URL `/dev` เป็น URL ทดสอบสำหรับนักพัฒนา ซึ่ง Google จะบังคับให้ต้องล็อกอินบัญชี Google ของเจ้าของสคริปต์ ทำให้โทรศัพท์หรือบุคคลอื่นไม่สามารถเรียกดูข้อมูลได้
2. **สิทธิ์ Who has access ต้องเลือก "Anyone (ทุกคน)":**
   - หากเลือกเป็น "Only myself" หรือ "Anyone with Google account" เบราว์เซอร์บนมือถือที่ไม่ล็อกอิน Google จะถูกบล็อกทันที
3. **ห้ามพึ่งพา LocalStorage เพียงอย่างเดียว:**
   - การบันทึก URL ใน LocalStorage จะมีผลเฉพาะเบราว์เซอร์เครื่องนั้นเท่านั้น ต้องบันทึกลง `public/app-config.json` หรือ `VITE_GAS_URL` เพื่อให้ทุกอุปกรณ์ใช้งานร่วมกันได้

---

## การทดสอบการทำงาน
เมื่อเชื่อมต่อแล้ว ผู้ใช้งานสามารถ:
1. **ตรวจสอบคะแนนสอบ:** ค้นหาชื่อ-นามสกุล ในแผ่นงาน `ตรวจสอบคะแนน` (A:F)
2. **ดาวน์โหลดเกียรติบัตร:** ค้นหาชื่อและเปิดดู/ดาวน์โหลดไฟล์จากแผ่นงาน `ดาวน์โหลดเกียรติบัตร` (A:F)
3. **อัปเดตข้อมูลอัตโนมัติ:** เมื่อคุณเพิ่มหรือแก้ไขคะแนนใน Google Sheets ข้อมูลบนหน้าเว็บจะอัปเดตตามทันทีโดย **ไม่ต้อง Deploy เว็บไซต์ใหม่**
