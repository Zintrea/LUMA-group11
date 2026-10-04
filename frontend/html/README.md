# 🌟 LUMA - AI Image Generation Platform

แพลตฟอร์มสำหรับสร้างรูปภาพด้วย AI จากข้อความ (Text-to-Image) พร้อมระบบจัดการหลังบ้าน (Admin Panel)

---

## 👥 สำหรับเพื่อนร่วมทีม (วิธีดึงโปรเจกต์มาเปิดรันที่เครื่อง)

เมื่อทำการ `git pull` โปรเจกต์ล่าสุดมาแล้ว ให้ทำตามขั้นตอนการรันระบบทั้ง 3 ส่วนตามลำดับนี้ครับ:

### ขั้นที่ 1: เตรียมฐานข้อมูล (Database)
เปิด Terminal และรันคำสั่ง Docker เพื่อเปิดใช้งาน PostgreSQL ของโปรเจกต์:

    docker start luma-test-db

*(หมายเหตุ: หากเพิ่งดึงโปรเจกต์มาครั้งแรกและยังไม่มี Container ให้ทำตามขั้นตอนการ Setup Database ของกลุ่มเพื่อนร่วมทีมก่อน)*

### ขั้นที่ 2: รันระบบหลังบ้าน (Backend - Flask)
1. เปิด Terminal ใหม่ แล้วเข้าไปที่โฟลเดอร์ backend:
    
       cd backend
    
2. ติดตั้ง Library ที่จำเป็น (หากยังไม่เคยลง):
    
       pip install -r requirements.txt
    
3. รันเซิร์ฟเวอร์ Python:
    
       python app.py
    
*(ปล่อยหน้าจอนี้รันค้างไว้ ห้ามปิด Terminal)*

### ขั้นที่ 3: รันระบบหน้าบ้าน (Nginx Frontend แบบพกพา)
โปรเจกต์นี้ฝัง Nginx ไว้ในตัวแล้ว ไม่ต้องติดตั้งโปรแกรม Nginx เพิ่มเติมในเครื่องครับ:
1. เปิด Terminal อีกหน้าต่าง แล้ว `cd` เข้ามาที่ **โฟลเดอร์หลักของโปรเจกต์** (โฟลเดอร์ที่มีไฟล์ `nginx.exe` วางอยู่)
2. สั่งรัน Nginx ตามชนิดของ Terminal ที่ใช้:
   - **ถ้าใช้ Command Prompt (CMD):**
     
         start nginx
     
   - **ถ้าใช้ PowerShell ใน VS Code:**
     
         .\nginx.exe
     
3. เปิด Web Browser (Chrome / Edge) แล้วเข้าไปที่: **`http://127.0.0.1`** หรือ **`http://localhost`**

---

## 🛠️ วิธีหยุดการทำงาน (เมื่อเลิกใช้งาน)
- **ปิด Nginx:** รันคำสั่งนี้ใน Terminal เพื่อปิดการทำงานของ Nginx:

      taskkill /f /im nginx.exe

- **ปิด Backend:** กดปุ่ม `Ctrl + C` ในหน้า Terminal ของ Python

---

## 👑 วิธีการตั้งสิทธิ์ Admin (สำหรับผู้ดูแลระบบ)
บัญชีที่สมัครสมาชิกใหม่ผ่านหน้าเว็บเริ่มต้นจะเป็นสิทธิ์ `user` หากต้องการทดสอบหน้า Admin Panel ให้รันคำสั่งนี้ผ่าน Terminal เพื่อเปลี่ยนสิทธิ์ตัวเองใน Database:

    docker exec -i luma-test-db psql -U postgres -d luma_db -c "UPDATE users SET role = 'admin' WHERE username = 'ชื่อผู้ใช้ของคุณ';"

*(เปลี่ยนคำว่า 'ชื่อผู้ใช้ของคุณ' เป็น Username ที่คุณสมัครไว้ แล้วทำการ Log out และ Log in ใหม่)*