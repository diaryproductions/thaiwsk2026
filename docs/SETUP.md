# คู่มือการติดตั้งและตั้งค่าระบบ (SETUP GUIDE)
## THAI WSK 2026 — ระบบสืบศิลป์ถิ่นอักษร สืบสุนทรภาษาไทย
กลุ่มสาระการเรียนรู้ภาษาไทย โรงเรียนกระทุ่มแบน "วิเศษสมุทคุณ"

---

### สารบัญ
1. ภาพรวมสถาปัตยกรรมระบบ
2. ขั้นตอนการนำโค้ดขึ้น GitHub Repository
3. ขั้นตอนการตั้งค่า GitHub Pages
4. ขั้นตอนการตั้งค่า Google Apps Script (Code.gs)
5. การเชื่อมต่อ Google Sheets โดยไม่กระทบข้อมูลเดิม

---

### 1. ภาพรวมสถาปัตยกรรมระบบ
- **Frontend**: พัฒนาด้วย React, Vite, TypeScript, Tailwind CSS
- **Deployment Platform**: GitHub Pages (Static Web Hosting)
- **CI/CD Pipeline**: GitHub Actions (Build และ Deploy อัตโนมัติเมื่อ Push ไปยังสาขา `main`)
- **Backend Connector**: Google Apps Script Web App (`Code.gs`) เชื่อมต่อ Google Sheets โดยตรงด้วย `SpreadsheetApp.openById()`
- **Database**: Google Sheets (Spreadsheet ID: `1EsneYlqKXHZakue-7fhHWzfNYOgmgitfUrMy-kzqiTI`)
- **ความปลอดภัย**: ไม่ต้องใช้ Cloudflare Worker, ไม่มีการฝังรหัสผ่านลงในโค้ดหน้าบ้าน

---

### 2. นำโค้ดขึ้น GitHub Repository
1. สร้าง Repository ใหม่บน GitHub โดยตั้งชื่อว่า `thaiwsk2026`
2. ตั้งค่า Remote Repository ในคอมพิวเตอร์ของคุณ:
   ```bash
   git remote add origin https://github.com/<YOUR-GITHUB-USERNAME>/thaiwsk2026.git
   git branch -M main
   git add .
   git commit -m "feat: setup THAI WSK 2026 with Google Apps Script connector"
   git push -u origin main
   ```

---

### 3. เปิดใช้งาน GitHub Pages
1. ไปที่แท็บ **Settings** ของ Repository บน GitHub
2. คลิกเมนู **Pages** ทางด้านซ้าย
3. ในส่วน **Build and deployment**:
   - Source: เลือก **GitHub Actions**
4. เมื่อมี Commit ใหม่ไปยังสาขา `main` เวิร์กโฟลว์ `.github/workflows/deploy.yml` จะทำงานโดยอัตโนมัติ
5. เว็บไซต์จะออนไลน์ที่:
   `https://<YOUR-GITHUB-USERNAME>.github.io/thaiwsk2026/`
