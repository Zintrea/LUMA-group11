LUMA Group 11 — Backend AI LOGBOOK

Project

LUMA Group 11

Role

Backend-AI

Main Responsibility

พัฒนา Backend สำหรับเป็นตัวกลางระหว่าง:

Frontend
   ↓
Backend
   ├── PostgreSQL
   └── Forge AI

Phase 1 — เริ่มต้น Repository และ Branch

งาน

เริ่มแยกงาน Backend ออกจาก branch หลักของทีม

สร้าง branch:

git switch -c backend

ต่อมางาน Backend-AI ใช้ branch:

backend-ai

มีการ Merge งาน Backend เข้ากับ backend-ai และ Push ขึ้น Remote

Phase 2 — ตั้งค่า Python

ตรวจสอบ Python

โปรเจกต์ใช้ Python 3.10

ตรวจสอบ:

python --version

ผลที่ใช้:

Python 3.10.11

Phase 3 — สร้าง Virtual Environment

เข้าโปรเจกต์:

cd "C:\Ai gen\ProjectFN\LUMA-group11"

สร้าง:

python -m venv venv

เปิดใช้งาน PowerShell:

Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\venv\Scripts\Activate.ps1

ผล:

(venv)

Phase 4 — ติดตั้ง Flask

ติดตั้ง:

pip install flask

ตรวจสอบ Flask:

python -c "import flask; print(flask.__version__)"

เวอร์ชันที่ใช้ระหว่างพัฒนา:

Flask 3.1.3

Phase 5 — สร้าง Backend ตัวแรก

สร้าง:

backend/app.py

เริ่มจาก Health API:

GET /health

Response:

{
  "status": "ok"
}

ทดสอบสำเร็จ

Phase 6 — ติดตั้ง Packages ที่ต้องใช้

ติดตั้ง:

pip install flask requests psycopg2-binary python-dotenv flask-cors

สร้าง:

pip freeze > requirements.txt

Packages ที่เกี่ยวข้อง:

flask
requests
psycopg2-binary
python-dotenv
flask-cors

Phase 7 — เชื่อม Forge AI

กำหนด Forge URL สำหรับการพัฒนา:

http://10.192.0.232:7860

ตรวจสอบ Network:

Test-NetConnection 10.192.0.232 -Port 7860

ผล:

TcpTestSucceeded : True

Phase 8 — ทดสอบ Forge

สร้างโปรแกรมทดสอบส่ง Prompt ไป:

POST /sdapi/v1/txt2img

ได้รับภาพกลับมาเป็น Base64

จากนั้นบันทึกภาพทดสอบเป็น:

forge_test.png

ผล:

Backend machine → Forge AI → image

สำเร็จ

Phase 9 — เชื่อม PostgreSQL

Database Server:

192.168.1.137

Port:

5432

ค่าที่ใช้ระหว่างการพัฒนา:

DATABASE_HOST=192.168.1.137
DATABASE_PORT=5432
DATABASE_NAME=postgres
DATABASE_USER=postgres

Password เก็บไว้ใน .env

Phase 10 — แก้ปัญหา Environment

ช่วงแรก Backend ยังโหลด Environment ไม่ตรงตำแหน่ง

จึงกำหนด:

BASE_DIR = Path(__file__).resolve().parent
ENV_FILE = BASE_DIR / ".env"
load_dotenv(ENV_FILE)

ทำให้ Backend โหลด:

backend/.env

ตรวจสอบได้:

ENV exists: True
Database Host: 192.168.1.137
Database Port: 5432
Database Name: postgres
Database User: postgres
Database Password exists: True
Forge URL: http://10.192.0.232:7860

Phase 11 — สร้าง /db-health

สร้าง:

GET /db-health

ใช้ SQL:

SELECT 1;

ผลการทดสอบ:

{
  "status": "ok",
  "database": "connected",
  "result": 1
}

สรุป:

Backend → PostgreSQL = สำเร็จ

Phase 12 — ตรวจสอบ Database Schema ของทีม

ได้รับ database/init.sql ของเพื่อน

พบว่า Database มี:

users
image_tasks

image_tasks มี:

id
user_id
task_type
status
prompt_text
input_image_path
output_image_path
created_at
updated_at

ดังนั้น Prompt จาก Frontend จะเก็บใน:

image_tasks.prompt_text

งาน Generate ใช้:

task_type = generate

Status:

pending
processing
completed
failed

Phase 13 — เพิ่ม Database ใน /generate

ปรับ /generate ให้ทำงาน:

รับ Prompt
   ↓
INSERT image_tasks
   ↓
pending
   ↓
processing
   ↓
ส่ง Prompt ไป Forge
   ↓
รับ Base64
   ↓
completed
   ↓
ส่งกลับ Frontend

หากเกิด Error:

status = failed

Phase 14 — ทดสอบ /generate

ใช้ PowerShell:

$body = @{
    prompt = "แมวใส่แว่นกำลังนั่งอยู่ในห้องเรียน"
    user_id = 1
} | ConvertTo-Json

Invoke-RestMethod `
    -Uri "http://localhost:5000/generate" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body

ผลการทดสอบ:

image
-----
iVBORw0KGgo...

ได้รับ Base64 image กลับมา

สรุป:

Prompt → Backend → Forge → Backend = สำเร็จ

Phase 15 — Frontend Integration

Frontend ถูกตั้งค่าให้เรียก Backend ผ่าน IP ของเครื่อง Backend

ไม่ใช้ localhost สำหรับเครื่อง Client ใน LAN

Flow ที่ทดสอบ:

Frontend
   ↓
Backend
   ↓
Forge AI
   ↓
Backend
   ↓
Frontend

ผล:

Generate ภาพจาก Frontend ได้
แสดงภาพบน Frontend ได้

Phase 16 — Prompt Storage

เพิ่มการบันทึก Prompt ลง:

image_tasks.prompt_text

พร้อม:

user_id
task_type
status

ตัวอย่าง:

user_id    = 1
task_type  = generate
status     = pending
prompt_text = "แมวใส่แว่น..."

หลัง Forge สำเร็จ:

status = completed

Phase 17 — ตรวจสอบ Database

SQL สำหรับตรวจสอบ:

SELECT
    id,
    user_id,
    task_type,
    status,
    prompt_text,
    created_at,
    updated_at
FROM image_tasks
ORDER BY id DESC;

เป้าหมาย:

Prompt ที่ Frontend ส่ง
ต้องปรากฏใน image_tasks.prompt_text

Current Status

รายการ

สถานะ

Repository / Branch

✅

Python 3.10

✅

Virtual Environment

✅

Flask

✅

requirements.txt

✅

/health

✅

.env

✅

Forge Network

✅

Forge Generate Test

✅

PostgreSQL Connection

✅

/db-health

✅

/generate

✅

Frontend → Backend

✅

Backend → Forge

✅

Forge → Backend

✅

Backend → Frontend

✅

Prompt → PostgreSQL

✅ Implemented

Image Storage

⬜

ปัญหาที่พบและการแก้ไข

1. PowerShell ไม่อนุญาต Activate.ps1

แก้ด้วย:

Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

จากนั้น:

.\venv\Scripts\Activate.ps1

2. Python Version ไม่ตรง

เครื่องมี Python หลายเวอร์ชัน

โปรเจกต์ใช้:

Python 3.10.11

จึงใช้ python ที่ชี้ไปยัง Python 3.10 แทนการใช้ py ที่อาจชี้ไปยังเวอร์ชันอื่น

3. Database เชื่อมต่อ localhost ผิดเครื่อง

แก้ DATABASE_HOST ให้ชี้ไปยัง Database Server:

192.168.1.137

และใช้ .env

4. .env ไม่ถูกโหลด

แก้ให้โหลดจาก:

backend/.env

โดยใช้ Path(__file__).resolve().parent

หลังแก้ไข:

ENV exists: True
PASSWORD exists: True

5. Forge เชื่อมต่อไม่ได้

ตรวจสอบด้วย:

Test-NetConnection 10.192.0.232 -Port 7860

เมื่อได้:

TcpTestSucceeded : True

จึงทดสอบ /sdapi/v1/txt2img

Next Steps

ตรวจสอบว่า Prompt ถูกบันทึกใน image_tasks จริง

ทดสอบ Generate จาก Frontend บน LAN อีกครั้ง

ตรวจสอบ pending → processing → completed/failed

หากทีมต้องการ ให้ทำ Image Storage และบันทึก output_image_path

Sync branch กับ devops

Commit

Push backend-ai

Integration กับทีม

Git ก่อนส่ง Integration

git fetch origin
git switch backend-ai
git pull origin backend-ai
git merge origin/devops

ตรวจสอบ:

git status

เพิ่มไฟล์:

git add backend/app.py backend/README.md backend/LOGBOOK.md requirements.txt .gitignore

Commit:

git commit -m "complete backend ai integration"

Push:

git push origin backend-ai

Security Note

ห้าม commit:

backend/.env

และห้ามใส่ Database Password จริงใน:

README.md
LOGBOOK.md
Git
GitHub

หาก Credential เคยถูกเผยแพร่โดยไม่ตั้งใจ ควรเปลี่ยน Credential ก่อนใช้งานจริง