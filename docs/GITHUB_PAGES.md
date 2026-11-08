# คู่มือการเผยแพร่ผ่าน GITHUB PAGES (DEPLOYMENT GUIDE)
## THAI WSK 2026 — GitHub Actions & Static Hosting

คู่มือนี้สรุปกระบวนการทั้งหมดในการนำโค้ดเว็บไซต์ขึ้น GitHub Pages ด้วยระบบอัตโนมัติ

---

## 1. การตั้งค่า Base Path ใน Vite
ในไฟล์ `vite.config.ts` ได้กำหนดค่า:
```typescript
base: '/thaiwsk2026/',
```
สิ่งนี้รับประกันว่าเมื่อ Deploy ไปยัง GitHub Pages จะสามารถโหลด Asset ทุกไฟล์ได้อย่างถูกต้อง

---

## 2. โครงสร้าง URL บน GitHub Pages
เมื่อ Repository ของคุณชื่อ `thaiwsk2026`:
- **URL หลัก:** `https://<github-username>.github.io/thaiwsk2026/`
- **ระบบ Routing:** ใช้ Hash-based routing (`#home`, `#exam`, `#score`, `#certificate`, `#admin`) เพื่อป้องกันปัญหาหน้า Error 404 เมื่อผู้ใช้กด Refresh หรือเปิดลิงก์หน้ารองโดยตรงบน GitHub Pages

---

## 3. ขั้นตอนการตั้งค่าครั้งแรกบน GitHub
1. สร้าง Repository ชื่อ `thai-wsk-2026`
2. Push โค้ดทั้งหมดขึ้น branch `main`
3. ไปที่แท็บ **Settings** > **Pages**
4. ในหัวข้อ **Build and deployment**:
   - เลือก Source เป็น **GitHub Actions**
5. ไปที่แท็บ **Actions** บน GitHub เพื่อดูขั้นตอนการทำงานของ Workflow
6. เมื่อรันสำเร็จ (สัญลักษณ์เครื่องหมายถูกสีเขียว) ให้คลิกลิงก์ URL เพื่อเปิดหน้าเว็บได้ทันที

---

## 4. การอัปเดตหน้าเว็บในอนาคต
ทุกครั้งที่คุณ Push หรือแก้ไขไฟล์บนสาขา `main`:
1. GitHub Actions จะเริ่มกระบวนการ Checkout, Setup Node.js 20, Install Dependencies, Build dist อัตโนมัติ
2. GitHub Pages จะเผยแพร่เวอร์ชันใหม่ภายใน 1-2 นาที
3. สำหรับการแก้ไขเนื้อหาผ่าน Admin Dashboard (ข้อความ, ข่าว, กำหนดการ) หากเชื่อมต่อกับ Google Sheets แล้ว ผู้ใช้จะเห็นข้อมูลใหม่ทันทีโดย **ไม่ต้อง Deploy เว็บใหม่**
