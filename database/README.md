# Database

ส่วนนี้เป็นงานของผู้รับผิดชอบ Database สำหรับโปรเจกต์ LUMA

## 1. ส่วนนี้ทำอะไร

เก็บข้อมูลที่ใช้ในระบบ LUMA เพื่อใช้เป็นฐานข้อมูลและคิวงาน (Job Queue) ระหว่าง Backend และ AI เช่น:

- ข้อมูลผู้ใช้ (ชื่อ, อีเมล, รหัสผ่าน)
- สถานะคิวงานประมวลผลภาพ (Pending, Processing, Completed, Failed)
- Prompt ที่ใช้สั่งสร้างรูป
- Path ของไฟล์รูปภาพต้นฉบับและไฟล์ผลลัพธ์

## 2. ต้องลงอะไร

- PostgreSQL
- pgAdmin

## 3. ติดตั้งและสร้าง Database

1. ติดตั้ง PostgreSQL
2. เปิด pgAdmin
3. สร้าง Database ชื่อ:

luma


ในโฟลเดอร์จะมีไฟล์ SQL ชื่อ: init.sql

ทดสอบ
เปิด Query Tool แล้วลองเพิ่มข้อมูล (INSERT):

INSERT INTO users (username, email, password_hash)
VALUES ('test_user', 'test@email.com', 'hashed_1234');

INSERT INTO image_tasks (user_id, task_type, status, prompt_text)
VALUES (1, 'generate', 'pending', 'แมวอวกาศสีชมพู');


## แล้วลองอ่านข้อมูล (SELECT):

- SELECT * FROM users;
- SELECT * FROM image_tasks;

# ==========================================
# 1. ตั้งค่าการเชื่อมต่อฐานข้อมูล (Database)
# ==========================================
# ⚠️ สำคัญ: เปลี่ยน IP, User, Password ให้ตรงกับเครื่องคนที่ 3 (Database)
DB_HOST = '127.0.0.1' 
DB_PORT = '5432'
DB_NAME = 'postgres' # ชื่อฐานข้อมูลที่คุณสร้างรอไว้
DB_USER = 'postgres'
DB_PASSWORD = 'omerakkaew1727151'
