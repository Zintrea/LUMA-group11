LUMA Group 11 — LOGBOOK2

วันที่ 28/09/2569

หัวข้องาน

Backend-AI: ความปลอดภัย, Authentication, Admin API และ Model Selection

เอกสารนี้บันทึกรายละเอียดงานที่ดำเนินการในวันนี้ ตั้งแต่ส่วนความปลอดภัยและระบบผู้ใช้ ไปจนถึง Admin API และการเลือก AI Model

1. การจัดการความปลอดภัยของ Backend

1.1 Environment Configuration

ตรวจสอบการตั้งค่า Backend ให้ใช้ไฟล์ .env สำหรับค่าที่สำคัญของระบบ เช่น

SECRET_KEY
FORGE_URL
DB_HOST
DB_PORT
DB_NAME
DB_USER
DB_PASSWORD

ไม่ควรเขียน Password ของ Database หรือ Secret Key ลงใน Source Code โดยตรง

ตัวอย่างรูปแบบ:

SECRET_KEY=your_secret_key
FORGE_URL=http://<AI_FORGE_IP>:7860
DB_HOST=<DATABASE_IP>
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=<DATABASE_PASSWORD>

ข้อควรระวัง

.env

ต้องไม่ถูก Commit ขึ้น Git เนื่องจากอาจมีข้อมูลสำคัญของระบบ

2. Authentication และ Password

ระบบมี Authentication สำหรับควบคุมการเข้าใช้งาน Backend

API ที่เกี่ยวข้อง:

POST /auth/register
POST /auth/login
GET  /auth/me
POST /auth/logout

2.1 Register

ผู้ใช้สามารถสมัครสมาชิกผ่าน:

POST /auth/register

ข้อมูลที่เกี่ยวข้องกับการสมัครสมาชิกจะถูกจัดการโดย Backend

ไม่ควรส่งหรือแสดง Password ของผู้ใช้กลับมาใน Response

2.2 Login

ทดสอบการ Login ด้วย Username และ Password

เมื่อ Login สำเร็จ Backend จะสร้าง Session และเก็บข้อมูลที่จำเป็น เช่น

user_id
username
role

จากนั้นสามารถใช้ Session สำหรับเรียก API ที่ต้องมีการ Authentication ได้

2.3 ตรวจสอบ Session

ทดสอบ:

GET /auth/me

เพื่อดูข้อมูลผู้ใช้ที่ Login อยู่

ข้อมูลสำคัญ เช่น:

id
username
role
is_active

Password ไม่ควรถูกส่งกลับใน Response

2.4 Logout

ทดสอบ:

POST /auth/logout

เพื่อออกจาก Session

3. Session Security

ตรวจสอบการตั้งค่า Session ของ Flask

มีการตั้งค่าเกี่ยวกับ Cookie เช่น:

HTTPOnly = True
SameSite = Lax
Secure = False

การตั้งค่าเหล่านี้ใช้ควบคุมพฤติกรรมของ Session Cookie

โดย HTTPOnly ช่วยป้องกันไม่ให้ JavaScript ฝั่ง Client อ่าน Cookie โดยตรง

4. Admin Role และสิทธิ์การเข้าถึง

ระบบมีการแบ่ง Role สำหรับผู้ใช้

ตัวอย่าง:

user
admin

API สำหรับ Admin จะตรวจสอบ Session และ Role ก่อนอนุญาตให้เข้าถึง

แนวคิดการตรวจสอบ:

มี Session หรือไม่
       ↓
ค้นหาผู้ใช้ใน Database
       ↓
ตรวจสอบ is_active
       ↓
ตรวจสอบ role
       ↓
admin ?
  ├─ ใช่ → อนุญาต
  └─ ไม่ใช่ → ปฏิเสธ

5. Admin Dashboard

ทดสอบ:

GET /admin/dashboard

Dashboard สามารถแสดงข้อมูลสรุปของระบบ เช่น

Total Users
Images Today
Failed Tasks
AI Forge Status

จากการทดสอบ Backend สามารถเรียก Dashboard ได้สำเร็จ

6. Admin Users API

ทดสอบ API สำหรับจัดการผู้ใช้:

GET   /admin/users
GET   /admin/users/<id>
PATCH /admin/users/<id>

ใช้สำหรับ:

ดูรายชื่อผู้ใช้

ดูรายละเอียดผู้ใช้

เปลี่ยนข้อมูลที่อนุญาตให้แก้ไข

จัดการ Role

จัดการสถานะ Active

Security Check

ตรวจสอบว่า Admin ไม่สามารถ:

ปิดการใช้งาน Account ของตัวเอง

และไม่สามารถ:

เปลี่ยน Role ของตัวเองจาก admin เป็น user

เมื่อทดสอบแล้ว Backend ปฏิเสธคำขอที่ไม่อนุญาต

7. Password Security ใน Admin API

ตรวจสอบ Response ของ:

GET /admin/users
GET /admin/users/<id>

ไม่พบข้อมูล:

password_hash

ในข้อมูลที่ส่งกลับให้ Client

ดังนั้นข้อมูล Password Hash จะไม่ถูกเปิดเผยผ่าน Admin User API

8. Admin AI

ทดสอบ:

GET /admin/ai

ใช้ตรวจสอบสถานะการเชื่อมต่อกับ AI Forge

ผลการทดสอบ:

AI Forge → Online

9. Admin AI Models

ทดสอบ:

GET /admin/ai/models

ใช้ดูรายการ Model ที่มีอยู่ใน AI Forge

จากการตรวจสอบพบ Model ที่ต้องใช้สำหรับระบบ ได้แก่

sdeautifulRealistic_brav5.safetensors

sdnyloraCheckpoint_bakedvaeBlessedFp16.safetensors

10. Recent Generations

ทดสอบ:

GET /admin/recent-generations

ใช้ดูรายการการ Generate ล่าสุดจากระบบ

ข้อมูลที่เกี่ยวข้องกับงาน Generate สามารถนำไปแสดงในหน้า Admin ได้

11. Model Selection

หลังจากส่วน Admin และ Security ได้รับการทดสอบ จึงดำเนินการต่อในส่วน Model Selection

ระบบกำหนด Model ที่สามารถเลือกได้ 2 แบบ:

Model

Key

Anime / 2D Art

anime

Realistic

realistic

12. Model ที่ใช้จริง

Anime

sdnyloraCheckpoint_bakedvaeBlessedFp16.safetensors

Key:

anime

Realistic

sdeautifulRealistic_brav5.safetensors

Key:

realistic

Frontend ควรส่ง Key ให้ Backend แทนการส่งชื่อ Model ที่แสดงบนหน้าเว็บ

13. การตรวจสอบ Model

Backend ตรวจสอบค่าที่ได้รับจาก Frontend

ค่าที่อนุญาต:

anime
realistic

ตัวอย่างที่ถูกต้อง:

{
  "prompt": "anime boy standing in a forest",
  "model": "anime"
}

ตัวอย่างที่ถูกต้อง:

{
  "prompt": "a realistic portrait of a young man standing in a forest",
  "model": "realistic"
}

14. การทดสอบ Anime Model

ทดสอบผ่าน Thunder Client:

POST http://localhost:5000/generate

Request:

{
  "prompt": "anime boy standing in a forest",
  "model": "anime",
  "steps": 10,
  "width": 512,
  "height": 512
}

ผล:

200 OK

ได้รับ Image กลับมาเป็น Base64

สรุป:

Anime Model → ผ่าน

15. การทดสอบ Realistic Model

Request:

{
  "prompt": "a realistic portrait of a young man standing in a forest",
  "model": "realistic",
  "steps": 10,
  "width": 512,
  "height": 512
}

ผล:

200 OK

ได้รับ Image กลับมาเป็น Base64

สรุป:

Realistic Model → ผ่าน

16. การทดสอบ Model ที่ไม่ถูกต้อง

ทดสอบด้วย:

{
  "prompt": "test",
  "model": "abc"
}

Backend ตอบกลับ:

{
  "message": "model must be realistic or anime",
  "status": "error"
}

สรุปว่า Backend สามารถป้องกัน Model ที่ไม่ได้รับอนุญาตได้

17. การทดสอบผ่าน Frontend

หลังจาก Backend ผ่านการทดสอบด้วย Thunder Client ได้ทดลอง Generate ผ่านหน้าเว็บ

หน้าเว็บมี Dropdown:

AI Model (Checkpoint)

Anime / 2D Art

แต่เมื่อกด Generate พบ Response:

{
  "message": "model must be realistic or anime",
  "status": "error"
}

18. วิเคราะห์ปัญหา Frontend

จากผลการทดสอบพบว่า Backend ทำงานถูกต้อง เพราะ:

Thunder Client
    ↓
Anime       → 200 OK
Realistic   → 200 OK

ดังนั้นปัญหาอยู่ที่ Request จาก Frontend

Frontend ต้องส่ง:

model = anime

หรือ:

model = realistic

ไม่ใช่ส่งข้อความแสดงผล เช่น:

Anime / 2D Art

ตัวอย่าง Dropdown ที่เหมาะสม:

<select id="modelSelect">
    <option value="anime">Anime / 2D Art</option>
    <option value="realistic">Realistic</option>
</select>

โดย:

value="anime"

คือค่าที่ส่งไป Backend

ส่วน:

Anime / 2D Art

คือข้อความที่ผู้ใช้เห็น

19. ผลการทดสอบรวม

ส่วนที่ทดสอบ

ผล

Environment / .env

✅

Authentication

✅

Login

✅

Session

✅

/auth/me

✅

Logout

✅

Admin Role

✅

Admin Dashboard

✅

Admin Users

✅

Admin User Detail

✅

Admin User Update

✅

ป้องกัน Admin แก้ Role ตัวเอง

✅

ป้องกัน Admin ปิด Account ตัวเอง

✅

ไม่เปิดเผย Password Hash

✅

Admin AI Status

✅

Admin AI Models

✅

Recent Generations

✅

Anime Model

✅

Realistic Model

✅

Invalid Model Validation

✅

Frontend Model Request

🔄 ต้องแก้

20. งานที่ต้องดำเนินการต่อ

งาน Backend-AI ในส่วน Security, Admin และ Model Selection ผ่านการทดสอบแล้ว

งานที่เหลือคือ Frontend:

ตรวจสอบ Dropdown Model

ตรวจสอบค่า value

เพิ่ม/ตรวจสอบ model ใน Request /generate

ทดสอบเลือก Anime จากหน้าเว็บ

ทดสอบเลือก Realistic จากหน้าเว็บ

ตรวจสอบ Request ใน Developer Tools → Network

ตรวจสอบว่า Response ได้ Image กลับมา

Request ที่ต้องได้:

{
  "prompt": "....",
  "model": "anime"
}

หรือ:

{
  "prompt": "....",
  "model": "realistic"
}

21. สรุปงานวันที่ 28/09/2569

วันนี้ดำเนินงาน Backend-AI ครอบคลุม 3 ส่วนหลัก:

Security

Environment Configuration

Authentication

Password / Password Hash Protection

Session

Role-based Access

Admin Security

Admin

Dashboard

Users

User Detail

User Update

AI Status

AI Models

Recent Generations

Security Test สำหรับ Admin

Model Selection

Anime Model

Realistic Model

Model Validation

Generate Test ผ่าน Thunder Client

Invalid Model Test

ตรวจสอบการเชื่อมต่อ AI Forge

ผลการทดสอบ:

Backend Security    → ✅
Authentication      → ✅
Admin API           → ✅
Admin Security      → ✅
AI Forge            → ✅
Anime Model         → ✅
Realistic Model     → ✅
Model Validation    → ✅
Frontend Integration→ 🔄

สถานะปัจจุบัน: Backend-AI ในส่วน Security, Admin และ Model Selection พร้อมใช้งานและผ่านการทดสอบแล้ว เหลือการแก้ Frontend ให้ส่งค่า model ไปยัง /generate ให้ตรงกับ Backend