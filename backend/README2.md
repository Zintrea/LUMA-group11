LUMA Group 11 — README2

ภาพรวมงาน Backend-AI วันที่ 28/09/2569

เอกสารนี้สรุปภาพรวมงานที่ดำเนินการในวันนี้ โดยครอบคลุม 3 ส่วนหลักของ Backend-AI ได้แก่

🔐 Security / Authentication

👤 Admin API

🤖 AI Model Selection

รายละเอียดขั้นตอนและผลการทดสอบแบบละเอียดอยู่ใน LOGBOOK2.md

1. Security / Authentication

ระบบ Backend มีการจัดการ Authentication และ Session เพื่อควบคุมการเข้าใช้งาน API

API หลัก:

POST /auth/register
POST /auth/login
GET  /auth/me
POST /auth/logout

เมื่อ Login สำเร็จ Backend จะเก็บข้อมูลที่จำเป็นใน Session เช่น:

user_id
username
role

Password ไม่ควรถูกส่งกลับใน Response และ Admin User API ไม่เปิดเผย password_hash

1.1 Environment Configuration

ข้อมูลสำคัญของระบบเก็บไว้ใน:

backend/.env

เช่น:

SECRET_KEY
FORGE_URL
DB_HOST
DB_PORT
DB_NAME
DB_USER
DB_PASSWORD

ไม่ควรเขียน Password หรือ Secret Key ลงใน Source Code โดยตรง และไม่ควร Commit .env ขึ้น Git

1.2 Session Security

Backend ใช้ Flask Session และมีการตั้งค่าที่เกี่ยวข้องกับ Cookie เช่น:

HTTPOnly = True
SameSite = Lax
Secure = False

โดย HTTPOnly ช่วยไม่ให้ JavaScript ฝั่ง Client อ่าน Session Cookie โดยตรง

2. Admin System

ระบบมี Role สำหรับผู้ใช้ เช่น:

user
admin

Admin API จะตรวจสอบ:

Session
   ↓
User
   ↓
is_active
   ↓
role
   ↓
admin

เฉพาะผู้ใช้ที่มีสิทธิ์ Admin เท่านั้นจึงสามารถเรียก Admin API ได้

2.1 Admin Dashboard

GET /admin/dashboard

ใช้แสดงข้อมูลสรุปของระบบ เช่น:

จำนวนผู้ใช้

จำนวนการ Generate วันนี้

จำนวน Task ที่ล้มเหลว

สถานะ AI Forge

2.2 Admin Users

GET   /admin/users
GET   /admin/users/<id>
PATCH /admin/users/<id>

ใช้สำหรับดูและจัดการข้อมูลผู้ใช้ตามสิทธิ์ที่กำหนด

มีการตรวจสอบความปลอดภัยเพิ่มเติม:

Admin ไม่สามารถปิด Account ของตัวเอง

Admin ไม่สามารถเปลี่ยน Role ของตัวเองจาก admin เป็น user

ไม่ส่ง password_hash กลับไปให้ Client

2.3 Admin AI

ตรวจสอบสถานะ AI Forge:

GET /admin/ai

และดูรายการ AI Model:

GET /admin/ai/models

2.4 Recent Generations

GET /admin/recent-generations

ใช้สำหรับดูรายการ Generate ล่าสุด เพื่อให้ Admin สามารถตรวจสอบประวัติการทำงานของระบบได้

3. AI Model Selection

ระบบรองรับการเลือก AI Model สำหรับ Image Generation จำนวน 2 แบบ

ชื่อที่แสดง

ค่า Model

Anime / 2D Art

anime

Realistic

realistic

Model ที่ใช้ใน AI Forge:

Anime
sdnyloraCheckpoint_bakedvaeBlessedFp16.safetensors

Realistic
sdeautifulRealistic_brav5.safetensors

3.1 รูปแบบการทำงาน

Frontend
   │
   │ prompt + model
   ▼
Backend
   │
   │ ตรวจสอบ Model
   ├── anime
   └── realistic
   │
   ▼
AI Forge
   │
   │ Generate Image
   ▼
Backend
   │
   ▼
Frontend

Frontend ไม่ควรส่งชื่อ Model แบบอิสระ แต่ส่ง Key ที่ Backend กำหนด:

anime
realistic

3.2 ตัวอย่าง Request

Anime

{
  "prompt": "anime boy standing in a forest",
  "model": "anime",
  "steps": 10,
  "width": 512,
  "height": 512
}

Realistic

{
  "prompt": "a realistic portrait of a young man standing in a forest",
  "model": "realistic",
  "steps": 10,
  "width": 512,
  "height": 512
}

3.3 Model Validation

Backend อนุญาตเฉพาะ:

anime
realistic

ถ้าส่งค่าอื่น เช่น:

{
  "prompt": "test",
  "model": "abc"
}

Backend จะตอบกลับ:

{
  "message": "model must be realistic or anime",
  "status": "error"
}

เพื่อป้องกันการใช้ Model ที่ไม่ได้กำหนดไว้

4. Image Generation

Endpoint หลัก:

POST /generate

Backend รับข้อมูลจาก Frontend แล้วดำเนินการ:

รับ Prompt
   ↓
ตรวจสอบ Session
   ↓
ตรวจสอบข้อมูล
   ↓
ตรวจสอบ Model
   ↓
สร้าง Image Task
   ↓
ส่ง Request ไป AI Forge
   ↓
รับ Image
   ↓
บันทึกสถานะ Task
   ↓
ส่ง Image กลับ Frontend

ผลลัพธ์ Image จะถูกส่งกลับในรูปแบบ Base64

5. Health / System Check

Backend มี Endpoint สำหรับตรวจสอบสถานะระบบ:

GET /health
GET /health/db
GET /health/ai
GET /ready

ใช้ตรวจสอบ:

Backend

PostgreSQL

AI Forge

Readiness ของระบบ

6. การทดสอบที่ดำเนินการ

การทดสอบ Backend ทำผ่าน Thunder Client

Authentication

Login                 → ✅
Session /auth/me      → ✅
Logout                → ✅

Admin

Dashboard             → ✅
Users                 → ✅
User Detail           → ✅
User Update           → ✅
Admin AI              → ✅
Admin AI Models       → ✅
Recent Generations    → ✅

Security

Password Hash ไม่ถูกเปิดเผย       → ✅
Admin ปิด Account ตัวเอง          → ❌ ถูกป้องกัน
Admin ลด Role ตัวเอง              → ❌ ถูกป้องกัน

Model Selection

Anime                  → 200 OK ✅
Realistic              → 200 OK ✅
Invalid Model          → 400 / ถูกปฏิเสธ ✅

7. ปัญหาที่พบจาก Frontend

หลังจาก Backend ผ่านการทดสอบแล้ว ได้ทดสอบ Generate ผ่านหน้าเว็บ

หน้าเว็บมี Dropdown:

AI Model (Checkpoint)

Anime / 2D Art

แต่เมื่อกด Generate พบ:

{
  "message": "model must be realistic or anime",
  "status": "error"
}

จากการทดสอบพบว่า Backend ทำงานถูกต้อง เพราะ Anime และ Realistic ผ่านเมื่อทดสอบโดยตรงผ่าน Thunder Client

จุดที่ต้องตรวจสอบต่อคือ Frontend ต้องส่งค่า:

model = anime

หรือ:

model = realistic

ไปที่:

POST /generate

ไม่ใช่ส่งข้อความที่แสดงบนหน้าเว็บ เช่น:

Anime / 2D Art

8. สถานะงานปัจจุบัน

ส่วนงาน

สถานะ

Security / Environment

✅

Authentication

✅

Login / Session

✅

Password Protection

✅

Admin Role

✅

Admin Dashboard

✅

Admin Users

✅

Admin Security

✅

Admin AI

✅

Recent Generations

✅

AI Forge

✅

Image Generation

✅

Anime Model

✅

Realistic Model

✅

Model Validation

✅

Frontend Model Request

🔄 กำลังตรวจสอบ

Generate ผ่าน Frontend

🔄 รอทดสอบหลังแก้

9. งานที่ต้องทำต่อ

ตรวจสอบ Dropdown Model ใน Frontend

ตรวจสอบ value ของ Anime / Realistic

ตรวจสอบ Request /generate

ให้ Frontend ส่ง model เป็น anime หรือ realistic

ทดสอบ Generate จากหน้าเว็บอีกครั้ง

ตรวจสอบ Request ผ่าน Developer Tools → Network

ตรวจสอบว่าได้รับ Image กลับจาก Backend

10. เอกสารที่เกี่ยวข้อง

README2.md
    → สรุปภาพรวมงานที่ทำวันนี้

LOGBOOK2.md
    → รายละเอียดขั้นตอน การทดสอบ และปัญหาที่พบ

backend/README.md
    → รายละเอียดการใช้งาน Backend

backend/LOGBOOK.md
    → Logbook เดิมของโปรเจกต์

สรุป

งานวันนี้ครอบคลุม Security, Authentication, Admin และ Model Selection ของ Backend-AI

ส่วน Backend ได้ผ่านการทดสอบในประเด็นหลักแล้ว รวมถึงการ Login, Session, Admin API, Security และการเลือก Model Anime / Realistic

ปัจจุบันส่วนที่เหลือคือ การเชื่อม Model Selection จาก Frontend ให้ส่งค่า model ตรงตามที่ Backend กำหนด เพื่อให้การ Generate ผ่านหน้าเว็บทำงานสมบูรณ์