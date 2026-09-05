LUMA Group 11 — Backend AI

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
   │                 └─ image_tasks
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

2. โครงสร้างโปรเจกต์

โครงสร้างที่ใช้:

LUMA-group11/
├── backend/
│   ├── app.py
│   ├── .env
│   ├── README.md
│   └── LOGBOOK.md
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

การ Sync กับทีมและ devops:

git fetch origin
git switch backend-ai
git pull origin backend-ai
git merge origin/devops
git push origin backend-ai

หาก Push แล้วขึ้น non-fast-forward ให้ใช้:

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

ผลที่ต้องได้:

{
  "status": "ok"
}

จุดนี้ยืนยันว่า:

Flask Backend = ทำงาน

9. เชื่อมต่อ Forge AI

Forge AI ใช้เครื่อง AI ที่อยู่ใน LAN

ตัวอย่าง URL ที่ใช้ระหว่างการพัฒนา:

http://10.192.0.232:7860

ทดสอบ Network:

Test-NetConnection 10.192.0.232 -Port 7860

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

ค่าที่ใช้ระหว่างการพัฒนา:

DATABASE_HOST=192.168.1.137
DATABASE_PORT=5432
DATABASE_NAME=postgres
DATABASE_USER=postgres

Password ต้องเก็บใน .env และไม่ควรใส่ใน Git หรือ README

ทดสอบ Port:

Test-NetConnection 192.168.1.137 -Port 5432

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

ในการพัฒนาที่ใช้อยู่:

FORGE_URL=http://10.192.0.232:7860

DATABASE_HOST=192.168.1.137
DATABASE_PORT=5432
DATABASE_NAME=postgres
DATABASE_USER=postgres
DATABASE_PASSWORD=<private>

ห้าม commit .env

13. .gitignore

ควรมีอย่างน้อย:

.env
backend/.env
__pycache__/
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

ตรวจสอบได้จากข้อความตอนรัน:

ENV exists: True
Database Host: 192.168.1.137
Database Port: 5432
Database Name: postgres
Database User: postgres
Database Password exists: True
Forge URL: http://10.192.0.232:7860

15. สร้าง /db-health

Endpoint:

GET /db-health

ใช้:

SELECT 1;

เพื่อทดสอบ PostgreSQL

ผลที่ทดสอบได้:

{
  "status": "ok",
  "database": "connected",
  "result": 1
}

จุดนี้ยืนยันว่า:

Backend → PostgreSQL = สำเร็จ

16. Database Schema

Database ของเพื่อนมี users และ image_tasks

users

id
username
email
password_hash
created_at

image_tasks

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

17. การทำงานของ /generate

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

18. ตัวอย่าง /generate

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

19. ทดสอบ /generate

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

ผลการทดสอบที่ได้:

image
-----
iVBORw0KGgo...

หมายความว่า Forge สร้างภาพสำเร็จและ Backend ส่ง Base64 image กลับมาได้

20. Frontend → Backend

Frontend ถูกตั้งค่าให้เรียก Backend ผ่าน IP ของเครื่อง Backend เมื่อต้องทดสอบจากเครื่องอื่นใน LAN

ไม่ใช้:

localhost

จากเครื่อง Client เพราะ localhost จะหมายถึงเครื่อง Client เอง

ใช้ IP ของเครื่อง Backend เช่น:

http://<BACKEND-IP>:5000/generate

Flow จริงที่ทดสอบ:

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

21. Prompt → Database

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

22. ตรวจสอบ Prompt ใน Database

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

23. สถานะปัจจุบัน

Python / venv                  ✅
Flask Backend                  ✅
/health                        ✅
.env                           ✅
PostgreSQL Connection          ✅
/db-health                     ✅
Forge AI Connection            ✅
Forge Image Generation         ✅
/generate                      ✅
Frontend → Backend             ✅
Backend → Forge                ✅
Forge → Backend                ✅
Backend → Frontend             ✅
Prompt → image_tasks           ✅ Implemented
Image Storage / output path    ⬜ ยังไม่ได้ทำในขั้นตอนนี้

24. ข้อควรระวัง

ห้าม commit

backend/.env

เพราะมี Database Password

ห้ามส่ง Password ใน GitHub/Discord/README

หาก Password ที่เคยแชร์เป็น Password จริง ควรเปลี่ยน Password หลังการทดสอบ

Frontend

เครื่องอื่นใน LAN ต้องเรียก Backend ด้วย IP ของเครื่อง Backend ไม่ใช่ localhost

25. Git ก่อนส่งงาน

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
git commit -m "complete backend ai integration"
git push origin backend-ai