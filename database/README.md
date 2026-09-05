# Database ของ LUMA

โฟลเดอร์นี้เป็นส่วนจัดการฐานข้อมูล PostgreSQL ของโปรเจกต์ LUMA โดยฐานข้อมูลทำหน้าที่ 2 อย่างหลัก:

1. เก็บข้อมูลผู้ใช้สำหรับการสมัครสมาชิกและเข้าสู่ระบบ
2. เก็บคิวงานประมวลผลภาพระหว่าง Backend กับ AI Worker

ไฟล์ที่เกี่ยวข้อง:

- `init.sql` สร้างโครงสร้างฐานข้อมูล ได้แก่ Enum, ตาราง, ความสัมพันธ์ และ Trigger
- `test.sql` เพิ่มข้อมูลตัวอย่างและทดสอบการอ่านข้อมูล
- `README.md` อธิบายเหตุผลและขั้นตอนการติดตั้งใช้งาน

## 1. ภาพรวมกระบวนการทำงาน

การทำงานของระบบเมื่อผู้ใช้ส่งงานประมวลผลภาพมีลำดับดังนี้:

```text
ผู้ใช้/Frontend
	|
	v
Backend รับคำขอและบันทึก image_tasks (สถานะ pending)
	|
	v
AI Worker ค้นหางาน pending ที่เก่าที่สุด
	|
	v
เปลี่ยนสถานะเป็น processing และประมวลผล
	|
	+--> สำเร็จ: completed + output_image_path
	|
	+--> ล้มเหลว: failed
```

ฐานข้อมูลเก็บ path ของรูปภาพเท่านั้น ไม่ได้เก็บข้อมูล binary ของรูปภาพไว้ใน PostgreSQL:

- รูปต้นฉบับเก็บใน `uploads/inputs/`
- รูปผลลัพธ์เก็บใน `uploads/outputs/`
- คอลัมน์ `input_image_path` และ `output_image_path` เก็บ URL/path ที่ Backend ใช้ส่งกลับให้ Frontend

แนวทางนี้ช่วยให้ฐานข้อมูลไม่ใหญ่เกินจำเป็น และทำให้การอ่านข้อมูลคิวงานเร็วกว่าเก็บรูปเป็น BLOB ในตาราง

## 2. เหตุผลของการออกแบบ

### 2.1 แยก `users` กับ `image_tasks`

ผู้ใช้หนึ่งคนสามารถสร้างงานได้หลายงาน จึงออกแบบเป็นความสัมพันธ์แบบ one-to-many:

```text
users (1) -------- (หลาย) image_tasks
```

ตาราง `image_tasks` ใช้ `user_id` เป็น Foreign Key เพื่อระบุเจ้าของงาน และทำให้ค้นประวัติงานของผู้ใช้แต่ละคนได้

### 2.2 ใช้ Enum กับประเภทงานและสถานะ

การใช้ Enum ช่วยจำกัดค่าให้เป็นค่าที่ระบบรู้จัก ลดปัญหาการพิมพ์สถานะผิด เช่น `pendding` หรือ `complete` และทำให้ Backend/AI Worker ใช้ชุดค่าเดียวกัน

ค่าประเภทงานใน `init.sql` ปัจจุบันคือ:

- `generate` สร้างรูปจาก prompt
- `remove_bg` ลบพื้นหลัง
- `enhance` ปรับปรุงหรือขยายภาพ

ค่าสถานะงานคือ:

- `pending` งานรอ AI Worker รับไปทำ
- `processing` AI Worker กำลังประมวลผล
- `completed` ประมวลผลสำเร็จ
- `failed` ประมวลผลไม่สำเร็จ

### 2.3 ใช้ `ON DELETE CASCADE`

ถ้าลบผู้ใช้ ระบบจะลบงานทั้งหมดของผู้ใช้นั้นโดยอัตโนมัติ ป้องกันข้อมูล `image_tasks` ที่ไม่มีเจ้าของเหลืออยู่ อย่างไรก็ตามควรใช้ด้วยความระมัดระวัง เพราะการลบผู้ใช้เป็นการลบประวัติงานแบบถาวรด้วย

### 2.4 ใช้ Trigger อัปเดตเวลา

`updated_at` ต้องเปลี่ยนทุกครั้งที่สถานะหรือข้อมูลของงานเปลี่ยน เช่น `pending` เป็น `processing` หรือ `completed` จึงสร้าง Trigger ให้ PostgreSQL ตั้งค่าเป็นเวลาปัจจุบันอัตโนมัติ ลดการพึ่งพาโค้ดจากแต่ละโปรแกรม

## 3. โครงสร้างตาราง

### ตาราง `users`

| คอลัมน์ | ชนิดข้อมูล | กฎ | ความหมาย |
|---|---|---|---|
| `id` | `SERIAL` | Primary Key | รหัสผู้ใช้ เพิ่มอัตโนมัติ |
| `username` | `VARCHAR(50)` | `NOT NULL` | ชื่อผู้ใช้ |
| `email` | `VARCHAR(100)` | `UNIQUE`, `NOT NULL` | อีเมล ห้ามซ้ำ |
| `password_hash` | `VARCHAR(255)` | `NOT NULL` | รหัสผ่านที่ควรเก็บเป็นค่า hash |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | ค่าเริ่มต้นเป็นเวลาปัจจุบัน | เวลาสร้างบัญชี |

### ตาราง `image_tasks`

| คอลัมน์ | ชนิดข้อมูล | กฎ | ความหมาย |
|---|---|---|---|
| `id` | `SERIAL` | Primary Key | รหัสงาน เพิ่มอัตโนมัติ |
| `user_id` | `INTEGER` | Foreign Key, `NOT NULL` | ผู้สร้างงาน |
| `task_type` | `task_type_enum` | `NOT NULL` | ประเภทงาน |
| `status` | `task_status_enum` | ค่าเริ่มต้น `pending` | สถานะคิวงาน |
| `prompt_text` | `TEXT` | อนุญาตให้ว่าง | prompt สำหรับงานสร้าง/แก้ไขภาพ |
| `input_image_path` | `TEXT` | อนุญาตให้ว่าง | path ของรูปต้นฉบับ |
| `output_image_path` | `TEXT` | อนุญาตให้ว่าง | path ของรูปผลลัพธ์ |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | ค่าเริ่มต้นเป็นเวลาปัจจุบัน | เวลาสร้างงาน |
| `updated_at` | `TIMESTAMP WITH TIME ZONE` | ค่าเริ่มต้นเป็นเวลาปัจจุบัน | เวลาแก้ไขงานล่าสุด |

`prompt_text`, `input_image_path` และ `output_image_path` อนุญาตให้เป็น `NULL` เพราะแต่ละประเภทงานใช้ข้อมูลไม่เหมือนกัน เช่น งาน `generate` อาจไม่ต้องมี input image แต่ต้องมี prompt

## 4. สิ่งที่ต้องติดตั้ง

- PostgreSQL (แนะนำให้ใช้เวอร์ชันที่ยังได้รับการสนับสนุน)
- pgAdmin 4 สำหรับจัดการฐานข้อมูลด้วยหน้าจอ
- `psql` ซึ่งติดตั้งมากับ PostgreSQL สำหรับทำงานผ่าน Terminal

ตรวจสอบว่า PostgreSQL ทำงานอยู่บน Windows โดยเปิด `Services` แล้วตรวจสอบ service ที่ขึ้นต้นด้วย `postgresql` หรือทดสอบเชื่อมต่อด้วยคำสั่ง `psql`

## 5. วิธีสร้างฐานข้อมูลแบบละเอียด

### วิธีที่ 1: ใช้ pgAdmin

1. เปิด pgAdmin และเชื่อมต่อ PostgreSQL Server ด้วยรหัสผ่านของผู้ใช้ฐานข้อมูล
2. คลิกขวาที่ `Databases` แล้วเลือก `Create > Database...`
3. ตั้งชื่อฐานข้อมูลเป็น `luma` แล้วกด `Save`
4. เปิด `Databases > luma` คลิกขวาที่ฐานข้อมูล แล้วเลือก `Query Tool`
5. เปิดไฟล์ `database/init.sql` ใน VS Code แล้วคัดลอกเนื้อหาไปวางใน Query Tool
6. กดปุ่ม Execute หรือกด `F5`
7. Refresh ที่ `Schemas > public > Tables` ควรเห็นตาราง `users` และ `image_tasks`
8. ตรวจสอบ Enum ได้ที่ `Schemas > public > Types` และตรวจสอบ Trigger ได้ที่ `Tables > image_tasks > Triggers`

### วิธีที่ 2: ใช้ `psql` บน PowerShell

เปิด PowerShell ที่โฟลเดอร์หลักของโปรเจกต์ แล้วสร้างฐานข้อมูล:

```powershell
psql -U postgres -h localhost -p 5432 -c "CREATE DATABASE luma;"
```

จากนั้นรันไฟล์สร้างตาราง:

```powershell
psql -U postgres -h localhost -p 5432 -d luma -f database\init.sql
```

ตรวจสอบตาราง:

```powershell
psql -U postgres -h localhost -p 5432 -d luma -c "\dt"
```

ถ้าใช้ชื่อฐานข้อมูล `postgres` ตามค่าปัจจุบันใน `backend/app.py` และ `ai/worker.py` ให้ข้ามขั้นตอนสร้าง `luma` แล้วรัน `init.sql` กับ `-d postgres` แทน แต่การสร้างฐานข้อมูลแยกชื่อ `luma` จะจัดการและแยกข้อมูลของโปรเจกต์ได้ชัดเจนกว่า

## 6. การตรวจสอบหลังสร้าง

ใน pgAdmin Query Tool หรือ `psql` ให้รัน:

```sql
SELECT current_database();
\dt

SELECT typname
FROM pg_type
WHERE typname IN ('task_type_enum', 'task_status_enum');

SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name IN ('users', 'image_tasks')
ORDER BY table_name, ordinal_position;
```

ผลที่ควรได้คือเชื่อมต่ออยู่กับฐานข้อมูลที่เลือก มีตาราง 2 ตาราง มี Enum 2 ชุด และคอลัมน์ตรงกับ `init.sql`

## 7. วิธีทดสอบด้วย `test.sql`

`test.sql` ต้องรันหลังจากสร้างตารางด้วย `init.sql` แล้วเท่านั้น เพราะไฟล์นี้อ้างอิงตารางที่สร้างไว้:

```powershell
psql -U postgres -h localhost -p 5432 -d luma -f database\test.sql
```

หรือเปิด `database/test.sql` ใน pgAdmin Query Tool แล้วกด Execute

คำสั่งในไฟล์จะ:

1. เพิ่มผู้ใช้ตัวอย่าง 2 คน
2. เพิ่มงานตัวอย่าง 2 งาน
3. แสดงข้อมูลใน `users`
4. แสดงข้อมูลใน `image_tasks`
5. แสดงเฉพาะงานที่มีสถานะ `pending`

ตรวจสอบความสัมพันธ์เพิ่มเติม:

```sql
SELECT
    u.username,
    u.email,
    t.id AS task_id,
    t.task_type,
    t.status,
    t.prompt_text
FROM users AS u
JOIN image_tasks AS t ON t.user_id = u.id
ORDER BY t.created_at DESC;
```

ทดสอบ Trigger:

```sql
UPDATE image_tasks
SET status = 'processing'
WHERE id = 1;

SELECT id, status, created_at, updated_at
FROM image_tasks
WHERE id = 1;
```

ค่า `updated_at` ควรถูกเปลี่ยนเป็นเวลาล่าสุดโดยไม่ต้องระบุค่าเอง

## 8. การเชื่อมต่อกับ Backend และ AI Worker

ทั้ง `backend/app.py` และ `ai/worker.py` ใช้ค่าการเชื่อมต่อ PostgreSQL ได้แก่ host, port, database, user และ password โดยต้องตั้งค่าให้ตรงกับเครื่องที่ติดตั้ง Database:

```text
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=luma
DB_USER=postgres
DB_PASSWORD=<รหัสผ่าน PostgreSQL>
```

ปัจจุบันในโค้ดตัวอย่าง `DB_NAME` เป็น `postgres` ดังนั้นถ้าสร้างฐานข้อมูลชื่อ `luma` ต้องแก้ค่า `DB_NAME` ในทั้ง Backend และ AI Worker ให้เป็น `luma` หรือใช้ฐานข้อมูล `postgres` ตามเดิมให้ตรงกันทุกส่วน

ไม่ควรเก็บรหัสผ่านจริงไว้ใน source code หรือ commit ลง Git ควรย้ายไปใช้ Environment Variables และเปลี่ยนรหัสผ่านที่เคยใส่ไว้ในไฟล์โค้ดก่อนนำไปใช้งานจริง นอกจากนี้ `password_hash` ต้องเก็บค่า hash จากระบบเช่น `werkzeug.security.generate_password_hash` ไม่ควรเก็บรหัสผ่านแบบ plain text

## 9. การรัน `init.sql` ซ้ำและการล้างข้อมูล

`init.sql` เริ่มต้นด้วยคำสั่ง `DROP TABLE ... CASCADE` และ `DROP TYPE` เพื่อให้สร้างโครงสร้างใหม่ได้เมื่อรันซ้ำ เหมาะกับการพัฒนาและการทดสอบ แต่คำสั่งนี้จะลบข้อมูลใน `users` และ `image_tasks` ทั้งหมด จึงห้ามรันบนฐานข้อมูล Production โดยไม่สำรองข้อมูลและตรวจสอบเป้าหมายก่อน

ถ้าต้องการลบเฉพาะข้อมูลทดสอบ ให้ใช้:

```sql
TRUNCATE TABLE image_tasks, users RESTART IDENTITY CASCADE;
```

คำสั่งนี้ลบข้อมูลและรีเซ็ตเลข `id` แต่ไม่ลบโครงสร้างตาราง

## 10. ปัญหาที่พบบ่อย

### เชื่อมต่อไม่ได้

- ตรวจสอบว่า PostgreSQL service กำลังทำงาน
- ตรวจสอบ `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER` และ password
- ตรวจสอบว่า Backend และ Worker ใช้ชื่อฐานข้อมูลเดียวกัน
- ตรวจสอบ Firewall หาก Database อยู่คนละเครื่อง

### `relation does not exist`

กำลังเชื่อมต่อผิดฐานข้อมูล หรือยังไม่ได้รัน `init.sql` ให้ตรวจสอบด้วย `SELECT current_database();` แล้วรันไฟล์กับฐานข้อมูลที่ถูกต้อง

### เพิ่มงานแล้วเกิดข้อผิดพลาดเรื่อง Enum

ค่าของ `task_type` หรือ `status` ต้องตรงกับค่าที่ประกาศใน `init.sql` ตัวพิมพ์เล็กและขีดล่างมีผลต่อการตรวจสอบ

หมายเหตุ: Worker ปัจจุบันมีโค้ดรองรับงาน `inpaint` แต่ `task_type_enum` ใน `init.sql` ยังประกาศเพียง `generate`, `remove_bg`, `enhance` หากต้องการเปิดใช้งาน `inpaint` ต้องเพิ่มค่าใน Enum ด้วย migration ที่ทดสอบแล้ว เช่น `ALTER TYPE task_type_enum ADD VALUE 'inpaint';` ก่อนส่งงานประเภทนี้

### รัน `test.sql` แล้ว user id ไม่ใช่ 1 หรือ 2

เลข ID อาจต่อเนื่องจากการทดสอบครั้งก่อน ให้ตรวจสอบ ID จริงด้วย `SELECT id, username FROM users;` และใช้ ID ที่มีอยู่จริงเมื่อเพิ่ม `image_tasks`

## 11. สรุปขั้นตอนแบบสั้น

```text
1. ติดตั้งและเปิด PostgreSQL
2. สร้างฐานข้อมูล luma หรือเลือก postgres ให้ตรงกับโค้ด
3. รัน database/init.sql
4. ตรวจสอบ users, image_tasks, Enum และ Trigger
5. รัน database/test.sql เพื่อทดสอบ
6. ตั้งค่าการเชื่อมต่อให้ Backend และ AI Worker ใช้ฐานข้อมูลเดียวกัน
7. สำรองข้อมูลก่อนใช้คำสั่งที่มี DROP หรือ CASCADE
```
