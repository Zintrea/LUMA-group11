# 🗄️ Database Setup Guide

เอกสารนี้อธิบายขั้นตอนการตั้งค่าและอัปเดตโครงสร้างฐานข้อมูล (PostgreSQL) สำหรับโปรเจกต์ของเรา

## 📋 สิ่งที่ต้องเตรียม
* โปแกรม PostgreSQL
* เครื่องมือจัดการฐานข้อมูล เช่น pgAdmin, DBeaver หรือใช้งานผ่าน `psql` command line

---

## 🚀 ขั้นตอนการติดตั้ง (Database Initialization)

ในการติดตั้งฐานข้อมูลครั้งแรก กรุณาทำตาม 2 ขั้นตอนด้านล่างนี้ตามลำดับ:

### ขั้นตอนที่ 1: รันสคริปต์เริ่มต้น
นำไฟล์ `init (1).sql` ไปรันในฐานข้อมูลของคุณ สคริปต์นี้จะทำการเคลียร์ข้อมูลเก่า (ถ้ามี) และสร้างโครงสร้างพื้นฐานใหม่ทั้งหมด 

**สิ่งที่จะถูกสร้างในขั้นตอนนี้:**
- `task_type_enum` และ `task_status_enum`
- ตาราง `users` (ข้อมูลผู้ใช้เบื้องต้น)
- ตาราง `image_tasks` (ข้อมูลงานประมวลผลภาพ)
- Trigger สำหรับอัปเดตฟิลด์ `updated_at` อัตโนมัติเมื่อมีการแก้ไขข้อมูล

### ขั้นตอนที่ 2: รันคำสั่งอัปเดตตาราง (Schema Update)
หลังจากรันขั้นตอนที่ 1 เสร็จสมบูรณ์แล้ว ให้ทำการรันคำสั่ง SQL ด้านล่างนี้เพิ่มเติม เพื่อเพิ่มคอลัมน์สำหรับการจัดการสิทธิ์และสถานะของผู้ใช้งานเข้าไปในตาราง `users`:

```sql
ALTER TABLE users
ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'user',
ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE;
```

---

## 📊 สรุปโครงสร้างตาราง (Schema Overview)

เพื่อให้ทีมเห็นภาพรวม หลังจากทำตามขั้นตอนครบถ้วนแล้ว โครงสร้างของตารางหลักจะมีรายละเอียดดังนี้:

### 1. `users` Table (ตารางผู้ใช้งาน)
| Column | Type | Constraints / Default | Note |
| :--- | :--- | :--- | :--- |
| `id` | SERIAL | PRIMARY KEY | |
| `username` | VARCHAR(50) | NOT NULL | |
| `email` | VARCHAR(100) | UNIQUE, NOT NULL | |
| `password_hash` | VARCHAR(255)| NOT NULL | |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| `role` | VARCHAR(20) | NOT NULL, DEFAULT 'user' | *(เพิ่มใหม่ในขั้นตอน 2)* |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT TRUE | *(เพิ่มใหม่ในขั้นตอน 2)* |

### 2. `image_tasks` Table (ตารางงานประมวลผลภาพ)
| Column | Type | Constraints / Default |
| :--- | :--- | :--- |
| `id` | SERIAL | PRIMARY KEY |
| `user_id` | INTEGER | FOREIGN KEY (users.id) ON DELETE CASCADE |
| `task_type` | task_type_enum | NOT NULL ('generate', 'remove_bg', 'enhance') |
| `status` | task_status_enum | DEFAULT 'pending' ('pending', 'processing', 'completed', 'failed') |
| `prompt_text` | TEXT | |
| `input_image_path` | TEXT | |
| `output_image_path`| TEXT | |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP (มี Trigger อัปเดตอัตโนมัติ) |
