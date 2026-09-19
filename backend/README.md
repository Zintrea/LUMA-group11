LUMA Group 11 — Backend AI

Backend-AI เป็นส่วนกลางของระบบ LUMA Group 11 ทำหน้าที่เชื่อมต่อระหว่าง Frontend, Forge AI และ PostgreSQL รวมถึงจัดการ Authentication ของผู้ใช้

0. Quick Start — เปิดใช้งาน Backend

0.1 เข้า Root ของ Project

cd "C:\Ai gen\ProjectFN\LUMA-group11"

0.2 เปิด Virtual Environment

Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\venv\Scripts\Activate.ps1

เมื่อสำเร็จจะเห็นประมาณ:

(venv) PS C:\Ai gen\ProjectFN\LUMA-group11>

0.3 ตรวจสอบ Python

python --version

โปรเจกต์ใช้:

Python 3.10.11

0.4 ตรวจสอบ Dependencies

หากเป็นการติดตั้งครั้งแรก:

pip install -r requirements.txt

หรือ:

pip install flask requests psycopg2-binary python-dotenv flask-cors

0.5 ตรวจสอบ Network ก่อนเปิด Backend

ตรวจสอบ Forge AI:

Test-NetConnection 10.192.1.91 -Port 7860

ตรวจสอบ PostgreSQL:

Test-NetConnection 10.192.1.3 -Port 5432

ต้องได้:

TcpTestSucceeded : True

0.6 เปิด Backend

python backend\app.py

หรือถ้าเข้าไปใน backend แล้ว:

cd backend
python app.py

Server:

http://localhost:5000

Flask ใช้:

app.run(host="0.0.0.0", port=5000, debug=True)

จึงสามารถให้เครื่องอื่นใน LAN เรียกผ่าน IP ของเครื่อง Backend ได้

เครื่อง Backend ใช้ localhost

เครื่อง Client ใน LAN ต้องใช้ http://<BACKEND-IP>:5000

0.7 ตรวจสอบ Routes หลังเปิด Backend

เปิด PowerShell อีกหน้าต่าง แล้วใช้:

curl.exe http://localhost:5000/health

curl.exe http://localhost:5000/ai-health

curl.exe http://localhost:5000/db-health

curl.exe http://localhost:5000/ready

ถ้า /ready ได้ประมาณ:

{
  "status": "ready",
  "backend": "ok",
  "ai": "ok",
  "database": "ok"
}

หมายความว่า Backend พร้อมใช้งาน

0.8 Routes ทั้งหมดในปัจจุบัน

Method

Route

หน้าที่

GET

/health

ตรวจสอบ Backend

GET

/ai-health

ตรวจสอบ Forge AI

GET

/db-health

ตรวจสอบ PostgreSQL

GET

/ready

ตรวจสอบความพร้อม Backend + AI + Database

POST

/auth/register

สมัครสมาชิก

POST

/auth/login

Login

POST

/generate

สร้างรูปภาพด้วย Forge AI

1. ภาพรวม

Backend-AI เป็นส่วนกลางของระบบ LUMA Group 11 ทำหน้าที่เชื่อมต่อระหว่าง Frontend, Forge AI และ PostgreSQL

Flow หลักของระบบ:

Frontend
   │
   │ POST /generate
   ▼
Backend Flask
   │
   ├──────────────► PostgreSQL
   │                    └─ image_tasks
   │
   ▼
Forge AI
   │
   │ Base64 image
   ▼
Backend
   │
   ▼
Frontend

Frontend ไม่ควรเชื่อมต่อ Database หรือ Forge AI โดยตรง แต่ให้ Backend เป็นตัวกลาง

นอกจาก Generate แล้ว Backend ยังจัดการ Authentication:

Frontend
   │
   ├── POST /auth/register
   │
   └── POST /auth/login
          │
          ▼
      Backend Flask
          │
          ▼
       PostgreSQL
          │
          └── users

2. โครงสร้างโปรเจกต์

โครงสร้างที่ใช้:

LUMA-group11/

├── backend/
│   ├── app.py
│   ├── .env
│   ├── README.md
│   └── LOGBOOK.md
│
├── ai/
├── database/
├── frontend/
├── venv/
├── requirements.txt
└── .gitignore

3. Git และ Branch

เริ่มต้นทำงานโดยแยกงาน Backend ออกจาก branch หลัก

สร้าง branch:

git switch -c backend

ภายหลังมีการใช้ branch:

backend-ai

การ Sync กับทีมและ DevOps:

git fetch origin
git switch backend-ai
git pull origin backend-ai
git merge origin/devops
git push origin backend-ai

หาก Push แล้วขึ้น non-fast-forward:

git pull --rebase origin backend-ai
git push origin backend-ai

ไม่ควรใช้ force push กับ branch ที่ทำงานร่วมกับทีมโดยไม่ตกลงกับทีมก่อน

4. ตรวจสอบ Python

โปรเจกต์ใช้ Python 3.10

ตรวจสอบ:

python --version

เวอร์ชันที่ใช้ในการทำงาน:

Python 3.10.11

หมายเหตุ: หาก py --version แสดง Python เวอร์ชันอื่น ให้ใช้คำสั่ง python ที่ชี้ไปยัง Python 3.10 ของโปรเจกต์

5. สร้าง Virtual Environment

เข้า root ของโปรเจกต์:

cd "C:\Ai gen\ProjectFN\LUMA-group11"

สร้าง venv:

python -m venv venv

เปิดใช้งานใน PowerShell:

Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\venv\Scripts\Activate.ps1

เมื่อสำเร็จจะเห็นประมาณ:

(venv) PS C:\Ai gen\ProjectFN\LUMA-group11>

6. ติดตั้ง Flask และ Packages

ติดตั้ง packages ที่ Backend ใช้:

pip install flask requests psycopg2-binary python-dotenv flask-cors

สร้าง/อัปเดต requirements:

pip freeze > requirements.txt

หรือเมื่อต้องการติดตั้งจากไฟล์:

pip install -r requirements.txt

Packages หลัก:

Flask
requests
psycopg2-binary
python-dotenv
flask-cors

7. สร้าง Flask Backend

สร้างไฟล์:

backend/app.py

Backend เริ่มต้นจาก API Health Check เพื่อทดสอบว่า Flask ทำงานได้

Endpoint:

GET /health

Response:

{
  "status": "ok"
}

รัน:

python backend/app.py

Server ใช้:

http://localhost:5000

และรันแบบ:

app.run(host="0.0.0.0", port=5000, debug=True)

เพื่อให้เครื่องอื่นใน LAN สามารถเข้าถึง Backend ผ่าน IP ของเครื่อง Backend ได้

8. ทดสอบ Backend

เปิด:

http://localhost:5000/health

หรือ PowerShell:

curl.exe http://localhost:5000/health

ผลที่ต้องได้:

{
  "status": "ok"
}

จุดนี้ยืนยันว่า:

Flask Backend = ทำงาน

9. เชื่อมต่อ Forge AI

Forge AI ใช้เครื่อง AI ที่อยู่ใน LAN

ค่าปัจจุบันที่ใช้ระหว่างการพัฒนา:

http://10.192.1.91:7860

ทดสอบ Network:

Test-NetConnection 10.192.1.91 -Port 7860

หากสำเร็จต้องเห็น:

TcpTestSucceeded : True

10. ทดสอบ Forge โดยตรง

มีการสร้างไฟล์ทดสอบสำหรับส่ง Prompt ไป Forge และรับรูปกลับมาเป็น Base64

การทดสอบยืนยันว่า:

Backend machine
      ↓
Forge AI
      ↓
Generated image

ทำงานได้

ไฟล์รูปทดสอบ forge_test.png ถูกกำหนดไม่ให้ติด Git

11. เชื่อม PostgreSQL

Database ของทีมอยู่บนเครื่อง Database ใน LAN

ค่าปัจจุบันที่ใช้ระหว่างการพัฒนา:

DATABASE_HOST=10.192.1.3
DATABASE_PORT=5432
DATABASE_NAME=postgres
DATABASE_USER=postgres

Password ต้องเก็บใน .env และไม่ควรใส่ใน Git หรือ README

ทดสอบ Port:

Test-NetConnection 10.192.1.3 -Port 5432

หากสำเร็จ:

TcpTestSucceeded : True

12. สร้าง .env

ไฟล์อยู่ที่:

backend/.env

รูปแบบ:

FORGE_URL=http://<AI-IP>:7860

DATABASE_HOST=<DATABASE-IP>
DATABASE_PORT=5432
DATABASE_NAME=<DATABASE-NAME>
DATABASE_USER=postgres
DATABASE_PASSWORD=<PASSWORD>

ค่าที่ใช้ในการพัฒนาปัจจุบัน:

FORGE_URL=http://10.192.1.91:7860

DATABASE_HOST=10.192.1.3
DATABASE_PORT=5432
DATABASE_NAME=postgres
DATABASE_USER=postgres
DATABASE_PASSWORD=<PRIVATE>

ห้าม commit .env

IP ในส่วนนี้เป็นค่าที่ใช้ในการพัฒนาปัจจุบัน หาก Network ของทีมเปลี่ยน ให้แก้ใน backend/.env ตามเครื่องจริง

13. .gitignore

ควรมีอย่างน้อย:

.env
backend/.env

**/__pycache__/
*.pyc

venv/
.venv/

node_modules/

*.log

*.safetensors
*.ckpt
*.pt
*.pth

forge_test.png

หากมีไฟล์ทดสอบที่เก็บ password เช่น testrun.env ต้องไม่ commit เช่นกัน

14. แก้ปัญหา .env

ในช่วงแรกมีปัญหาเพราะไฟล์ Environment ไม่ได้ถูกโหลดจากตำแหน่งที่ Backend ใช้งาน

จึงกำหนดตำแหน่ง .env โดยตรง:

BASE_DIR = Path(__file__).resolve().parent

ENV_FILE = BASE_DIR / ".env"

load_dotenv(ENV_FILE)

ทำให้ Backend โหลด:

backend/.env

โดยตรง

การกำหนดนี้ช่วยให้ Backend โหลด .env ได้แม้จะสั่งรันจาก Root Project:

python backend\app.py

15. สร้าง /db-health

Endpoint:

GET /db-health

ใช้:

SELECT 1;

เพื่อทดสอบ PostgreSQL

ทดสอบ:

curl.exe http://localhost:5000/db-health

ผลที่ควรได้:

{
  "status": "ok",
  "database": "connected",
  "result": 1
}

จุดนี้ยืนยันว่า:

Backend → PostgreSQL = สำเร็จ

16. /ai-health

Endpoint:

GET /ai-health

ใช้ตรวจสอบการเชื่อมต่อระหว่าง Backend และ Forge AI

ทดสอบ:

curl.exe http://localhost:5000/ai-health

Flow:

Backend
   │
   │ GET /sdapi/v1/sd-models
   ▼
Forge AI

หาก Forge สามารถตอบกลับได้ แสดงว่า:

Backend → Forge AI = สำเร็จ

17. /ready — ตรวจสอบความพร้อมก่อนใช้งาน

Endpoint:

GET /ready

ทดสอบ:

curl.exe http://localhost:5000/ready

Backend ตรวจสอบ:

Backend
   │
   ├── AI
   │
   └── Database

หากพร้อมทั้งหมด:

{
  "status": "ready",
  "backend": "ok",
  "ai": "ok",
  "database": "ok"
}

หาก Dependency ตัวใดมีปัญหา ระบบจะตอบสถานะ 503 และระบุว่าไม่พร้อม

Route นี้ใช้สำหรับตรวจสอบว่า Backend พร้อมให้บริการจริงหรือไม่

18. Database Schema

Database ของเพื่อนมี users และ image_tasks

users

Columns:

id
username
email
password_hash
created_at
role
is_active

ข้อกำหนด:

username ต้องไม่ซ้ำ

email ต้องไม่ซ้ำ

Password ต้องไม่เก็บแบบ Plain Text สำหรับผู้ใช้ใหม่

User ที่สมัครผ่าน Backend จะได้ role = user

is_active จะเป็น true

image_tasks

Columns:

id
user_id
task_type
status
prompt_text
input_image_path
output_image_path
created_at
updated_at

สำหรับงาน Generate:

task_type = generate

Status ที่ระบบรองรับ:

pending
processing
completed
failed

prompt_text คือช่องที่ใช้เก็บ Prompt จาก Frontend

user_id ต้องอ้างอิง users.id

19. Authentication

Backend มี Authentication Routes:

POST /auth/register
POST /auth/login

19.1 Register

Request:

{
  "username": "testuser01",
  "email": "testuser01@example.com",
  "password": "123456"
}

PowerShell:

curl.exe -X POST http://localhost:5000/auth/register -H "Content-Type: application/json" -d '{\"username\":\"testuser01\",\"email\":\"testuser01@example.com\",\"password\":\"123456\"}'

Backend จะ:

รับ username/email/password
        ↓
ตรวจสอบข้อมูล
        ↓
ตรวจสอบ username ซ้ำ
        ↓
ตรวจสอบ email ซ้ำ
        ↓
Hash password
        ↓
INSERT users
        ↓
role = user
is_active = true

Password ใหม่จะถูก Hash ด้วย generate_password_hash() ก่อนบันทึก

Response จะไม่ส่ง password หรือ password_hash กลับไป

19.2 Login

Request:

{
  "email": "testuser01@example.com",
  "password": "123456"
}

PowerShell:

curl.exe -X POST http://localhost:5000/auth/login -H "Content-Type: application/json" -d '{\"email\":\"testuser01@example.com\",\"password\":\"123456\"}'

Backend จะ:

รับ email/password
        ↓
ค้นหา users
        ↓
ตรวจสอบ password
        ↓
ตรวจสอบ is_active
        ↓
Login สำเร็จ

Login สำเร็จจะส่งข้อมูล User กลับมาโดยไม่ส่ง Password หรือ Password Hash

ปัจจุบัน /auth/login ยังไม่มี JWT/Token เนื่องจากยังไม่ได้กำหนด Contract ของ Token กับระบบ Frontend

20. การทำงานของ /generate

Endpoint:

POST /generate

รับข้อมูลจาก Frontend เช่น:

{
  "prompt": "แมวใส่แว่นกำลังนั่งอยู่ในห้องเรียน",
  "user_id": 1
}

Backend ทำงานตามลำดับ:

1. รับ Prompt
       ↓
2. ตรวจสอบ Prompt
       ↓
3. INSERT image_tasks
   status = pending
       ↓
4. UPDATE status = processing
       ↓
5. ส่ง Prompt ไป Forge
       ↓
6. รับ Base64 image
       ↓
7. UPDATE status = completed
       ↓
8. ส่ง image + task_id กลับ Frontend

ถ้า Forge หรือ Database เกิดปัญหา:

status = failed

21. ตัวอย่าง /generate

Request:

{
  "prompt": "แมวใส่แว่นกำลังนั่งอยู่ในห้องเรียน",
  "user_id": 1
}

สามารถส่ง parameters เพิ่มได้:

{
  "prompt": "แมวใส่แว่นกำลังนั่งอยู่ในห้องเรียน",
  "user_id": 1,
  "negative_prompt": "low quality, blurry",
  "steps": 10,
  "width": 512,
  "height": 512,
  "cfg_scale": 7,
  "sampler_name": "Euler a"
}

Response สำเร็จ:

{
  "status": "ok",
  "task_id": 1,
  "image": "BASE64_IMAGE"
}

22. ทดสอบ /generate

PowerShell:

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

หมายความว่า Forge สร้างภาพสำเร็จและ Backend ส่ง Base64 image กลับมาได้

23. Frontend → Backend

Frontend ถูกตั้งค่าให้เรียก Backend ผ่าน IP ของเครื่อง Backend เมื่อต้องทดสอบจากเครื่องอื่นใน LAN

ไม่ใช้:

localhost

จากเครื่อง Client เพราะ localhost จะหมายถึงเครื่อง Client เอง

ใช้ IP ของเครื่อง Backend เช่น:

http://<BACKEND-IP>:5000/generate

Flow จริง:

Frontend
   ↓
Backend
   ↓
Forge AI
   ↓
Backend
   ↓
Frontend

สามารถ Generate และแสดงภาพได้

24. Prompt → Database

เมื่อ Frontend ส่ง Prompt:

{
  "prompt": "แมวใส่แว่นกำลังนั่งอยู่ในห้องเรียน",
  "user_id": 1
}

Backend จะบันทึกลง:

image_tasks.prompt_text

พร้อม:

task_type = generate
status = pending

จากนั้น:

pending
   ↓
processing
   ↓
completed

25. ตรวจสอบ Prompt ใน Database

ใช้ SQL:

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

ควรเห็นข้อมูล เช่น:

id | user_id | task_type | status    | prompt_text
---+---------+-----------+-----------+-------------------------
1  | 1       | generate  | completed | แมวใส่แว่น...

26. สรุป Routes

Backend ปัจจุบันมี 7 Routes:

GET  /health
GET  /ai-health
GET  /db-health
GET  /ready

POST /auth/register
POST /auth/login

POST /generate

หน้าที่:

Health
├── /health
├── /ai-health
├── /db-health
└── /ready

Authentication
├── /auth/register
└── /auth/login

AI Generation
└── /generate

27. สถานะปัจจุบัน

Python / venv                 ✅
Flask Backend                 ✅
/health                       ✅
/ai-health                    ✅
/db-health                    ✅
/ready                        ✅
.env                          ✅
PostgreSQL Connection         ✅
Forge AI Connection           ✅
Forge Image Generation        ✅
/generate                     ✅
/auth/register                ✅
/auth/login                   ✅
Frontend → Backend            ✅
Backend → Forge               ✅
Forge → Backend               ✅
Backend → Frontend            ✅
Prompt → image_tasks          ✅ Implemented

Image Storage / output path    ⬜ ยังไม่ได้ทำในขั้นตอนนี้
JWT / Token Authentication    ⬜ ยังไม่ได้ทำ

28. ข้อควรระวัง

ห้าม commit:

backend/.env

เพราะมี Database Password

ห้ามส่ง Password ใน:

GitHub
Discord
README
LOGBOOK
Source Code

หาก Password ที่เคยแชร์เป็น Password จริง ควรเปลี่ยน Password หลังการทดสอบ

เครื่องอื่นใน LAN ต้องเรียก Backend ด้วย IP ของเครื่อง Backend ไม่ใช่ localhost

29. Git ก่อนส่งงาน

ตรวจสอบ:

git status

Sync:

git fetch origin
git switch backend-ai
git pull origin backend-ai
git merge origin/devops

ตรวจสอบว่า .env ไม่ติด Git:

git status

จากนั้น:

git add backend/app.py backend/README.md backend/LOGBOOK.md requirements.txt .gitignore

Commit:

git commit -m "update backend ai and authentication"

Push:

git push origin backend-ai

30. Workflow สำหรับการทำงานแต่ละครั้ง

ใช้ขั้นตอนนี้ทุกครั้งก่อนเริ่มทดสอบ Backend:

1. เข้า Project
      ↓
2. เปิด venv
      ↓
3. ตรวจ Python
      ↓
4. ตรวจ Forge Port
      ↓
5. ตรวจ Database Port
      ↓
6. เปิด app.py
      ↓
7. /health
      ↓
8. /ai-health
      ↓
9. /db-health
      ↓
10. /ready
      ↓
11. Backend พร้อมใช้งาน
      ↓
12. ทดสอบ Auth / Generate

คำสั่งแบบรวดเร็ว:

cd "C:\Ai gen\ProjectFN\LUMA-group11"

Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\venv\Scripts\Activate.ps1

python --version

Test-NetConnection 10.192.1.91 -Port 7860
Test-NetConnection 10.192.1.3 -Port 5432

python backend\app.py

จากนั้นเปิด PowerShell อีกหน้าต่าง:

cd "C:\Ai gen\ProjectFN\LUMA-group11"

.\venv\Scripts\Activate.ps1

curl.exe http://localhost:5000/health
curl.exe http://localhost:5000/ai-health
curl.exe http://localhost:5000/db-health
curl.exe http://localhost:5000/ready

เมื่อ /ready แสดง:

{
  "status": "ready",
  "backend": "ok",
  "ai": "ok",
  "database": "ok"