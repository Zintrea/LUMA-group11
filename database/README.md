# 📝 Database & System Architecture: AI Image Processing Web App (MVP)

**เอกสารสำหรับ:** ทีมพัฒนาระบบ และ อาจารย์ที่ปรึกษาโครงงาน
**อัปเดตล่าสุด:** [ใส่วันที่]

## 📌 ภาพรวมของระบบ (System Overview)
โปรเจกต์นี้คือเว็บแอปพลิเคชันสำหรับจัดการรูปภาพด้วย AI (สร้างรูป, ลบพื้นหลัง, ปรับความคมชัด) โดยถูกออกแบบบนพื้นฐานของ **Minimum Viable Product (MVP)** ที่เน้นความเรียบง่าย พัฒนาได้รวดเร็ว และรองรับการทำงานแยกส่วนกันของทีมงานทั้ง 4 ตำแหน่ง

### 🛠 Tech Stack
*   **Frontend:** HTML, CSS, JavaScript
*   **Backend:** Python (Flask)
*   **AI Engine:** Python (Local AI Models)
*   **Database:** PostgreSQL

---

## 🗄 โครงสร้างฐานข้อมูล (Database Schema)
ฐานข้อมูลถูกออกแบบให้ทำหน้าที่เป็น **"ศูนย์กลางการจัดการสถานะ (State Manager) และคิวงาน (Job Queue)"** โดยมี 2 ตารางหลัก ดังนี้:

### 1. ตาราง `users` (ข้อมูลผู้ใช้งาน)
ใช้สำหรับเก็บข้อมูลพื้นฐานของผู้ใช้ เพื่อรองรับระบบประวัติการใช้งาน (History) และการขยายผลในอนาคต

| คอลัมน์ | ชนิดข้อมูล | เงื่อนไข | คำอธิบาย |
| :--- | :--- | :--- | :--- |
| `id` | `SERIAL` | `PRIMARY KEY` | รหัสผู้ใช้งาน |
| `username` | `VARCHAR(50)` | `NOT NULL` | ชื่อผู้ใช้ |
| `email` | `VARCHAR(100)`| `UNIQUE, NOT NULL`| อีเมลสำหรับเข้าสู่ระบบ |
| `password_hash` | `VARCHAR(255)`| `NOT NULL` | รหัสผ่าน (ผ่านการเข้ารหัส Hash แล้ว) |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | วันที่สมัครสมาชิก |

### 2. ตาราง `image_tasks` (คิวงานประมวลผลรูปภาพ)
**หัวใจหลักของระบบ** ใช้เป็นคิวสั่งงานระหว่าง Backend (รับคำสั่ง) และ AI Engineer (ผู้ประมวลผล)

| คอลัมน์ | ชนิดข้อมูล | เงื่อนไข | คำอธิบาย |
| :--- | :--- | :--- | :--- |
| `id` | `SERIAL` | `PRIMARY KEY` | รหัสคิวงาน |
| `user_id` | `INTEGER` | `FOREIGN KEY` | รหัสผู้สั่งงาน (เชื่อมกับ `users.id`) |
| `task_type` | `ENUM` | `NOT NULL` | ประเภทงาน (`generate`, `remove_bg`, `enhance`) |
| `status` | `ENUM` | `DEFAULT 'pending'` | สถานะงาน (`pending`, `processing`, `completed`, `failed`) |
| `prompt_text` | `TEXT` | `NULLABLE` | คำสั่งสร้างรูป (ใช้เฉพาะงาน `generate`) |
| `input_image_path`| `TEXT` | `NULLABLE` | Path ไฟล์รูปต้นฉบับที่ Backend บันทึกไว้ |
| `output_image_path`|`TEXT` | `NULLABLE` | Path ไฟล์รูปผลลัพธ์ที่ AI สร้างเสร็จแล้ว |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | เวลาที่รับงานเข้าคิว |
| `updated_at` | `TIMESTAMP` | (Trigger อัปเดตอัตโนมัติ) | เวลาที่สถานะงานถูกเปลี่ยนล่าสุด |

---

## 🧠 เหตุผลในการออกแบบ (Design Rationale & Justifications)

1. **ทำไมถึงมีเพียง 2 ตาราง? (Simplicity for MVP)**
   *   ลดความซับซ้อนในการเขียนคำสั่ง SQL (JOIN) ทำให้ Backend พัฒนา API ได้รวดเร็ว 
   *   การรวม Task ทุกประเภทไว้ในตารางเดียว ช่วยให้ AI Engineer สามารถดึงงานทั้งหมดไปตรวจสอบเงื่อนไขได้จากจุดเดียว
2. **การใช้ Database เป็น Job Queue**
   *   เนื่องจากโมเดล AI รันบนเครื่อง Local และใช้เวลาประมวลผลนาน การให้ Backend รอ AI ทำงานจนเสร็จจะทำให้เกิดปัญหา Timeout 
   *   ระบบจึงใช้เทคนิค **Asynchronous Polling** ผ่านคอลัมน์ `status` เพื่อแยกการทำงานของ Backend และ AI ออกจากกันโดยสมบูรณ์
3. **การเก็บรูปเป็น Path แทนการเก็บ Binary ลง DB**
   *   เพื่อป้องกันปัญหา Database Bloat (ฐานข้อมูลบวมและทำงานช้า) ระบบจะบันทึกไฟล์รูปภาพไว้ใน File System ของ Server และเก็บเพียง URL/Path ลงในฐานข้อมูล ทำให้ประสิทธิภาพการ Query รวดเร็ว

---

## 🔄 ขั้นตอนการทำงานของระบบ (System Workflow)

เพื่อให้ทุกคนในทีมเห็นภาพตรงกัน นี่คือวงจรชีวิตของ 1 คำสั่ง (เช่น การลบพื้นหลัง):

1. **[Frontend]** ผู้ใช้อัปโหลดรูปและกดปุ่ม "ลบพื้นหลัง" -> ส่ง Request ไปที่ Backend
2. **[Backend]** 
   * รับไฟล์มาบันทึกในโฟลเดอร์ `/uploads/inputs/`
   * บันทึกข้อมูลลงฐานข้อมูล กำหนด `task_type = 'remove_bg'`, `status = 'pending'`, และใส่ `input_image_path`
   * ตอบกลับ Frontend ทันทีด้วย `Task ID` (ไม่ต้องรอ AI ทำเสร็จ)
3. **[AI Engineer]** 
   * สคริปต์ AI รันตรวจสอบฐานข้อมูลทุกๆ X วินาที (Polling) หาคิวที่ `status = 'pending'`
   * เมื่อพบงาน จะเปลี่ยนสถานะเป็น `processing` ทันที (ล็อกงานไว้)
   * โหลดรูปจาก `input_image_path` เข้าโมเดล AI ลบพื้นหลัง
   * บันทึกรูปผลลัพธ์ลง `/uploads/outputs/`
   * อัปเดตฐานข้อมูลเป็น `status = 'completed'` พร้อมแนบ `output_image_path`
4. **[Frontend]** 
   * ระหว่างรอ จะนำ `Task ID` มายิง API ถาม Backend ทุกๆ 2-3 วินาที ว่าเสร็จหรือยัง?
   * เมื่อ Backend ตอบกลับว่า `status = 'completed'` จึงนำ `output_image_path` มาแสดงผลให้ผู้ใช้ดู

---

## 👥 ขอบเขตความรับผิดชอบของทีม (Team Responsibilities)

*   **Frontend (HTML/CSS/JS):** สร้าง UI ให้รองรับสถานะ Loading และเขียนฟังก์ชัน Polling เพื่อเช็คสถานะงานจาก Backend อย่างสม่ำเสมอโดยหน้าเว็บไม่ค้าง
*   **Backend (Flask):** สร้าง API รับไฟล์/ข้อมูล จัดการสิทธิ์ผู้ใช้งาน บันทึกไฟล์ลงเซิร์ฟเวอร์ และอัปเดตข้อมูลตาราง `image_tasks`
*   **AI Engineer (Python):** เขียนสคริปต์ดึงงานที่ `pending` ไปประมวลผล จัดการ Error/Exception (เปลี่ยนสถานะเป็น `failed` หากโมเดลรันไม่ผ่าน) และอัปเดตผลลัพธ์
*   **Database (PostgreSQL):** รักษาความถูกต้องของข้อมูล (Data Integrity) และสำรองข้อมูล
