# 📓 Detailed Engineering Logbook: LUMA - AI Image Generation Platform
**Project:** ระบบสร้างรูปภาพด้วย AI จากข้อความ (Text-to-Image) พร้อมระบบจัดการหลังบ้าน (Admin Panel) - กลุ่ม 11
**Stack:** PostgreSQL (Docker), Python/Flask (Backend), HTML/CSS/Vanilla JS (Frontend), Nginx (Reverse Proxy)

---

## 📅 Phase 1: การออกแบบสถาปัตยกรรมและเตรียมฐานข้อมูล (Database & Backend Environment)
**1.1 การเตรียม Database (PostgreSQL)**
- **ปัญหาเริ่มต้น:** การแชร์ฐานข้อมูลในกลุ่มพัฒนาทำได้ยาก หากแต่ละคนต้องติดตั้ง PostgreSQL ลงเครื่องตัวเอง
- **การแก้ปัญหา:** เลือกใช้ Docker ในการรัน PostgreSQL 
- **Action:** 
  - สร้างและรัน Docker Container ชื่อ `luma-test-db`
  - ตรวจสอบการรันโปรเซสด้วยคำสั่ง `docker ps` เพื่อยืนยันสถานะ Up
  - กำหนดโครงสร้างตารางหลัก เช่น ตาราง `users` (id, username, password, role) เพื่อรองรับระบบ Authentication

**1.2 การตั้งค่า Backend (Python Flask)**
- **Action:**
  - สร้างโครงสร้าง Backend ด้วย Flask API ทำงานที่พอร์ต `5000`
  - สร้างไฟล์ `.env` ในโฟลเดอร์ `backend/` สำหรับเก็บค่า Secret Keys และ Database URL
  - ติดตั้งไลบรารีที่จำเป็นผ่าน `pip install -r requirements.txt`
  - สร้าง API Endpoints หลักเพื่อรองรับการทำงานของหน้าเว็บ

---

## 📅 Phase 2: การพัฒนาระบบหน้าบ้าน (Frontend Development)
**2.1 การออกแบบ User Interface (UI) ด้วย Vanilla Web Technologies**
- **Architecture:** พัฒนาด้วยสถาปัตยกรรมที่ไม่ง้อ Node.js โดยใช้ HTML5, CSS3 และ JavaScript เพียว เพื่อให้ทีมงานรันโปรเจกต์ได้ทันทีโดยไม่ต้องติดตั้งแพ็กเกจ
- **Frameworks:** เรียกใช้ **Bootstrap 5.3.3** และ **Bootstrap Icons** ผ่านทาง CDN สำหรับจัดวาง Layout (Grid System) และ Components ต่างๆ เพื่อให้รองรับ Responsive Design
- **Action (โครงสร้างไฟล์ HTML):**
  - `index.html`: ออกแบบหน้าหลักสำหรับ User มีส่วนประกอบคือ ฟอร์มกรอก Prompt / Negative Prompt, Dropdown เลือกโมเดล AI, ปุ่ม Generate Image, และพื้นที่แสดงรูปภาพผลลัพธ์พร้อมระบบ Spinner (Loading State)
  - `admin.html`: ออกแบบระบบหลังบ้าน (Control Panel) ประกอบด้วย 
    - Dashboard สรุปสถิติ (Total Users, Images Today, Failed Tasks)
    - Data Tables สำหรับแสดงประวัติการสร้างรูปภาพล่าสุด (Recent Generations)
    - ระบบจัดการผู้ใช้งาน (แก้ไข Role และ Status) 
    - ส่วนแสดงสถานะการเชื่อมต่อเซิร์ฟเวอร์ AI Forge

**2.2 การจัดการ Logic และ Client-Side Scripting (JavaScript)**
- **Action:** แยกไฟล์ `.js` ตามหน้าที่การทำงาน (Modularity) ให้อยู่ในโฟลเดอร์ `js/`
  - **`script.js`**: คุมการทำงานของหน้าหลัก จัดการ Event Listener เมื่อผู้ใช้กดปุ่ม Generate ล็อกปุ่มป้องกันการกดซ้ำ (Double Submit) จัดการเวลาหน่วง (SetTimeout 3 วินาที) สำหรับจำลองสถานะ Loading ก่อนนำรูปภาพมาแสดงผล
  - **`auth.js`**: จัดการระบบเข้าสู่ระบบ (Login) ดึงข้อมูลจากฟอร์มแล้วสร้าง HTTP Request ยิงไปที่ Backend (`/api/auth/login`) รวมถึงจัดการ Error Handling เพื่อดักจับและแจ้งเตือนผู้ใช้หากกรอกรหัสผิด
  - **`admin.js`**: จัดการ DOM Manipulation สำหรับหน้า Admin โดยดึงข้อมูล Data JSON จาก Backend มา Render ลงในตาราง HTML แบบไดนามิก
- **Styling:** เขียน CSS เพิ่มเติมในโฟลเดอร์ `css/style.css` สำหรับปรับแต่งหน้าตาเฉพาะจุดที่ Bootstrap ครอบคลุมไม่ถึง

---

## 📅 Phase 3: การบูรณาการ Nginx เป็น Portable Web Server
**3.1 การจัดเตรียมสภาพแวดล้อม Frontend เพื่อรันผ่าน Nginx**
- **Action:**
  - นำไฟล์ Executable ของ Nginx (`nginx.exe`) พร้อมโฟลเดอร์ `conf/` มาวางไว้ใน Root Directory ของโปรเจกต์
  - ลบโฟลเดอร์ `html/` เดิมของ Nginx ทิ้ง และตั้งค่าให้ Nginx ดึงไฟล์ HTML/CSS/JS ของระบบ LUMA ไปแสดงผลแทน
  - สร้างโฟลเดอร์ `logs/` และ `temp/` สำรองไว้ เพื่อป้องกัน Error ตอน Nginx สร้างไฟล์แคช 

**3.2 การตั้งค่า Reverse Proxy (`nginx.conf`) เพื่อแก้ปัญหา CORS**
- **ปัญหา:** ไฟล์ JavaScript (เช่น `auth.js`) ไม่สามารถยิง Request ไปหา Backend (พอร์ต 5000) ได้โดยตรงเนื่องจากติดปัญหา Cross-Origin (CORS)
- **การแก้ปัญหา:** แก้ไขไฟล์ `conf/nginx.conf`
- **Action:** 
  - กำหนดเงื่อนไข `location /api/` เพื่อหลอก Browser ว่าหน้าเว็บกับ API มาจากที่เดียวกัน
  - ให้ Nginx ทำการ `proxy_pass` ส่งข้อมูลต่อไปยัง `http://127.0.0.1:5000/` อัตโนมัติ ทำให้ Frontend ดึงข้อมูลได้ราบรื่น

---

## 📅 Phase 4: การจัดการ Version Control (Git)
**4.1 การตั้งค่า `.gitignore` เพื่อรักษาความสะอาดของ Repository**
- **Action:** กำหนดกฎการซ่อนไฟล์ไม่ให้ขึ้น Git ดังนี้:
  - ซ่อนการตั้งค่าส่วนตัวและแคช: `.env`, `backend/.env`, `__pycache__/`, `node_modules/`
  - ซ่อนไฟล์โมเดล AI ขนาดใหญ่: `*.safetensors`, `*.ckpt`, `*.pt`
  - ซ่อนโฟลเดอร์ชั่วคราวของ Nginx: `logs/`, `temp/`, `*.log` (ป้องกันปัญหาสมาชิกในทีมดึงโปรเจกต์ไปรันแล้วเกิด Git Conflict จากไฟล์ล็อกที่เปลี่ยนแปลงตลอดเวลา)

**4.2 การแก้ไขปัญหา Git File Lock**
- **Error:** เกิดข้อผิดพลาด `Unlink of file 'nginx.exe' failed` ระหว่างใช้คำสั่ง `git switch`
- **Root Cause & Fix:** Nginx ทำงานค้างอยู่เบื้องหลัง ทำให้ล็อกไฟล์ไว้ แก้ปัญหาโดยสั่งหยุดโปรเซสผ่าน Terminal ด้วย `taskkill /f /im nginx.exe` ก่อนรันคำสั่ง Git

---

## 📅 Phase 5: การทดสอบระบบ (System Testing & Debugging)
**5.1 ปัญหา Environment ของ Terminal ใน VS Code**
- **Error:** ระบบแจ้ง `The system cannot find the file specified` เมื่อสั่งรัน `start nginx`
- **การแก้ปัญหา:** สังเกตพบว่ากำลังใช้ PowerShell อยู่ จึงเปลี่ยนคำสั่งรันเป็น `.\nginx.exe` หรือเปลี่ยน Terminal กลับเป็น CMD แทน

**5.2 การทดสอบ Frontend Connection**
- **Error:** พบ Error `net::ERR_CONNECTION_REFUSED` ในหน้า Console ของ Browser (มาจากไฟล์ `auth.js`)
- **การแก้ปัญหา:** วิเคราะห์ระบบและสรุปว่า ต้องรันระบบให้ครบ 3 Service พร้อมกัน (Docker DB, Python Backend, Portable Nginx) ระบบ Frontend ถึงจะดึงข้อมูล API ได้สำเร็จ

---

## 📅 Phase 6: การเตรียมส่งมอบและเอกสารประกอบ (Deployment & Docs)
**6.1 การจัดการข้อมูลจำลอง (Mocking & Admin Roles)**
- **Action:** รันคำสั่ง SQL สดผ่าน Docker (`docker exec`) เพื่อเปลี่ยน Role ของบัญชีตัวเองในฐานข้อมูลเป็น `admin` สำหรับใช้ทดสอบระบบ Dashboard ทันที

**6.2 การจัดทำคู่มือ (README.md)**
- **Action:** รวบรวมคำสั่งและจัดทำ Workflow การรันโปรเจกต์ลงใน `README.md` เพื่อส่งมอบให้เพื่อนในทีม Clone ไปทำงานต่อได้ทันที โดยครอบคลุมตั้งแต่ การรัน Container -> การรัน Backend -> การรัน Portable Nginx