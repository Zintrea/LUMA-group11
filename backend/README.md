# Backend

Backend เป็นส่วนกลางของระบบ LUMA-group11
ทำหน้าที่จัดการการสื่อสารระหว่าง Frontend, AI และ Database
รวมถึงประมวลผลข้อมูลและจัดการ API ของระบบ

---

## 1. หน้าที่ของ Backend

Backend เป็นตัวกลางในการควบคุมการไหลของข้อมูลภายในระบบ

โครงสร้างการทำงานหลัก:

Frontend
    |
    | HTTP Request
    v
Backend
    |
    +------------------+
    |                  |
    v                  v
   AI              Database
    |                  |
    +--------+---------+
             |
             v
          Backend
             |
             | HTTP Response
             v
          Frontend


Backend มีหน้าที่หลักดังนี้:

- รับข้อมูลจาก Frontend
- ตรวจสอบข้อมูลที่ได้รับ
- ประมวลผลข้อมูล
- ส่งข้อมูลไปยัง AI
- รับผลลัพธ์จาก AI
- อ่านข้อมูลจาก Database
- บันทึกข้อมูลลง Database
- จัดการ API Endpoint
- จัดการ Error
- ส่ง Response กลับไปยัง Frontend

---

# 2. บทบาทของ Backend ในระบบ

Backend จะเป็นตัวกลางระหว่างส่วนต่าง ๆ ของระบบ

## 2.1 Frontend

Frontend เป็นส่วนที่ผู้ใช้งานโต้ตอบกับระบบ

Frontend จะส่ง Request มายัง Backend เช่น:

- Prompt
- ข้อมูลผู้ใช้
- ตัวเลือกการสร้างรูป
- ข้อมูลที่ต้องการค้นหา
- ข้อมูลที่ต้องการบันทึก

Backend จะรับข้อมูลเหล่านี้และนำไปประมวลผลตาม Logic ของระบบ


## 2.2 AI

Backend จะเป็นตัวกลางในการเรียกใช้งาน AI

ตัวอย่างการทำงาน:

Frontend
    |
    | Prompt
    v
Backend
    |
    | Request
    v
AI
    |
    | Result
    v
Backend
    |
    | Response
    v
Frontend


Backend ไม่ควรให้ Frontend ติดต่อ AI โดยตรง

เหตุผล:

- ควบคุมการเรียก AI จากจุดเดียว
- ซ่อนรายละเอียดของ AI Server
- จัดการ Error ได้ง่าย
- จัดการ Timeout ได้
- สามารถเปลี่ยน AI ในอนาคตได้ง่าย
- สามารถบันทึกข้อมูลการใช้งานลง Database


## 2.3 Database

Backend เป็นตัวกลางในการติดต่อ Database

ตัวอย่างการทำงาน:

Frontend
    |
    | Request
    v
Backend
    |
    | Query
    v
Database
    |
    | Data
    v
Backend
    |
    | Response
    v
Frontend


Backend จะเป็นผู้จัดการการอ่านและเขียนข้อมูลกับ Database

Frontend ไม่ควรเชื่อมต่อ Database โดยตรง

---

# 3. โครงสร้าง Backend

โครงสร้างปัจจุบัน:

LUMA-group11/
│
├── backend/
│   ├── README.md
│   ├── LOGBOOK.md
│   └── app.py
│
├── ai/
│
├── database/
│
├── frontend/
│
├── requirements.txt
│
├── venv/
│
└── .gitignore


รายละเอียด:

### backend/app.py

ไฟล์หลักของ Flask Backend

ใช้สำหรับ:

- สร้าง Flask Application
- สร้าง API Endpoint
- รับ Request
- ประมวลผล Request
- ส่ง Response

### backend/README.md

เอกสารอธิบาย Backend

### backend/LOGBOOK.md

บันทึกขั้นตอนการพัฒนา Backend โดยละเอียด

### requirements.txt

เก็บรายการ Python Package ที่ใช้ในโปรเจกต์

### venv/

Virtual Environment สำหรับแยก Package ของโปรเจกต์ออกจาก Python หลักของเครื่อง

---

# 4. เทคโนโลยีที่ใช้

## Python

Version:

Python 3.10.11


## Flask

Version:

Flask 3.1.3


Flask ใช้สำหรับสร้าง Web Server และ REST API ของ Backend


## Requests

มีแผนจะใช้ Package `requests`
สำหรับติดต่อกับ AI Server ที่อยู่บนเครื่องอื่น

Package นี้จะติดตั้งเมื่อเริ่มพัฒนาส่วนเชื่อมต่อ AI จริง

---

# 5. Environment

Backend ใช้ Virtual Environment

ชื่อ:

venv


เหตุผลที่ใช้ Virtual Environment:

- แยก Package ของโปรเจกต์
- ป้องกัน Package ชนกับโปรเจกต์อื่น
- ทำให้สมาชิกในทีมติดตั้ง Environment เหมือนกันได้
- สามารถใช้ requirements.txt ในการติดตั้ง Package ใหม่ได้

---

# 6. API

Backend จะให้บริการ API สำหรับ Frontend

API จะใช้ HTTP Request และ HTTP Response

ตัวอย่างรูปแบบ:

Frontend
    |
    | POST /api/...
    v
Backend
    |
    | Response
    v
Frontend


API จริงของระบบจะถูกกำหนดเพิ่มเติมเมื่อมีการสรุป Interface
ระหว่าง Backend, Frontend, AI และ Database

---

# 7. Health Endpoint

ปัจจุบัน Backend มี Endpoint สำหรับตรวจสอบ Server

## GET /health

URL:

http://localhost:5000/health


หน้าที่:

ตรวจสอบว่า Flask Backend สามารถเปิด Server
และตอบ Request ได้หรือไม่


Response:

{
    "status": "ok"
}


หากได้รับ Response ดังกล่าว
แสดงว่า Backend สามารถทำงานและตอบ Request ได้

---

# 8. AI Integration

AI Server ที่ใช้สำหรับการพัฒนาระบบอยู่บนเครื่องอื่นใน Network

ตัวอย่าง Address:

http://10.192.0.232:7860


Backend จะเรียก AI ผ่าน API:

/sdapi/v1/txt2img


ตัวอย่างการทำงาน:

Frontend
    |
    | Prompt
    v
Backend
    |
    | POST /sdapi/v1/txt2img
    v
AI / Forge
    |
    | Base64 Image
    v
Backend
    |
    | Response
    v
Frontend


---

# 9. AI Configuration

Backend ไม่ควร Hardcode AI เป็น:

127.0.0.1


เนื่องจาก AI Server อยู่บนเครื่องอื่น

ให้กำหนดเป็น Configuration:

FORGE_URL = "http://10.192.0.232:7860"


จากนั้น Backend สามารถเรียก:

f"{FORGE_URL}/sdapi/v1/txt2img"


การแยก URL ออกจาก Logic จะช่วยให้สามารถเปลี่ยน AI Server
ได้โดยไม่ต้องแก้ Logic หลักของระบบ

---

# 10. AI Request

ข้อมูลที่ Backend สามารถส่งไปยัง AI ได้แก่:

- prompt
- negative_prompt
- steps
- width
- height
- cfg_scale
- sampler_name


ตัวอย่าง:

{
    "prompt": "a cute cat, high quality",
    "negative_prompt": "low quality, blurry",
    "steps": 10,
    "width": 512,
    "height": 512,
    "cfg_scale": 7,
    "sampler_name": "Euler a"
}


---

# 11. AI Response

AI จะส่งข้อมูลรูปภาพกลับมาในรูปแบบ Base64

ตัวอย่างการอ่านข้อมูล:

data = response.json()

image_base64 = data["images"][0]


Backend สามารถนำข้อมูลนี้ไป:

- ส่งกลับ Frontend
- บันทึกไฟล์
- ประมวลผลเพิ่มเติม
- บันทึกข้อมูลที่เกี่ยวข้องลง Database

รายละเอียดจะขึ้นอยู่กับ Design ของระบบจริง

---

# 12. AI Error Handling

การเรียก AI ต้องมีการจัดการ Error

ตัวอย่างปัญหาที่ต้องรองรับ:

- AI Server ไม่ทำงาน
- IP ของ AI เปลี่ยน
- Network ไม่สามารถเชื่อมต่อได้
- Timeout
- AI ส่ง Response ผิดรูปแบบ
- AI ประมวลผลไม่สำเร็จ


Backend ควรส่ง Error Response ที่ Frontend เข้าใจได้

ตัวอย่าง:

{
    "error": "AI service unavailable"
}


---

# 13. Database Integration

Backend จะเป็นผู้ติดต่อ Database

ข้อมูลที่อาจเกี่ยวข้องกับระบบ เช่น:

- ข้อมูลผู้ใช้
- Prompt
- ผลลัพธ์จาก AI
- ประวัติการสร้างรูป
- ข้อมูลการใช้งานระบบ
- Metadata ของรูปภาพ


โครงสร้าง Database และชนิดของ Database
จะกำหนดหลังจากประสานงานกับผู้รับผิดชอบ Database

---

# 14. Frontend Integration

Frontend จะไม่ติดต่อ AI หรือ Database โดยตรง

การสื่อสารหลัก:

Frontend
    |
    | HTTP
    v
Backend
    |
    +------> AI
    |
    +------> Database


ข้อดี:

- ลดความซับซ้อนของ Frontend
- รวม Business Logic ไว้ที่ Backend
- เพิ่มความปลอดภัย
- เปลี่ยน AI หรือ Database ได้ง่ายขึ้น
- จัดการ Error จากจุดเดียว

---

# 15. การทำงานที่คาดหวังของระบบ

ตัวอย่าง Workflow สำหรับการสร้างรูปภาพ:

1. User กรอก Prompt ใน Frontend
2. Frontend ส่ง Prompt ไปยัง Backend
3. Backend ตรวจสอบข้อมูล
4. Backend ส่ง Prompt ไปยัง AI
5. AI สร้างรูปภาพ
6. AI ส่งผลลัพธ์กลับ Backend
7. Backend ประมวลผลผลลัพธ์
8. Backend อาจบันทึกข้อมูลลง Database
9. Backend ส่งผลลัพธ์กลับ Frontend
10. Frontend แสดงผลให้ User

Workflow:

User
  |
  v
Frontend
  |
  | Prompt
  v
Backend
  |
  v
AI
  |
  | Image
  v
Backend
  |
  +----> Database
  |
  v
Frontend
  |
  v
User

---

# 16. Git Branch

Backend พัฒนาบน Branch:

backend


มี Branch ที่เกี่ยวข้อง:

- main
- backend
- backend-ai


แนวทางการทำงาน:

main
    |
    +---- backend
              |
              +---- backend-ai


Backend สามารถพัฒนาบน Branch ของตัวเอง
และ Merge เข้ากับ Branch ที่เกี่ยวข้องตาม Workflow ของทีม

---

# 17. การติดตั้ง

## ตรวจสอบ Python

python --version


ต้องใช้:

Python 3.10.11


## สร้าง Virtual Environment

python -m venv venv


## เปิดใช้งาน Virtual Environment

Windows PowerShell:

.\venv\Scripts\Activate.ps1


หาก PowerShell ไม่อนุญาต:

Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

จากนั้น:

.\venv\Scripts\Activate.ps1


เมื่อสำเร็จจะเห็น:

(venv)


## ติดตั้ง Package

pip install -r requirements.txt

---

# 18. การรัน Backend

จากโฟลเดอร์หลัก:

LUMA-group11


รัน:

python backend\app.py


Backend จะเปิดที่:

http://localhost:5000


---

# 19. การทดสอบ

เปิด:

http://localhost:5000/health


Expected Response:

{
    "status": "ok"
}


หากได้รับ Response ดังกล่าว:

Backend Server      PASS
Health Endpoint     PASS

---

# 20. สถานะการพัฒนา

## Environment

- [x] Python 3.10.11
- [x] Git
- [x] Virtual Environment
- [x] Flask 3.1.3
- [x] requirements.txt

## Backend

- [x] Flask Application
- [x] Health Endpoint
- [x] เปิด Server ได้
- [x] ทดสอบ /health สำเร็จ

## Git

- [x] สร้าง Branch backend
- [x] Commit requirements.txt
- [x] Commit app.py
- [x] Merge backend -> backend-ai
- [x] Push backend-ai ขึ้น GitHub
- [x] ตรวจสอบ Working Tree

## Integration

- [ ] ออกแบบ API จริง
- [ ] เชื่อม Frontend
- [ ] ติดตั้ง requests
- [ ] เชื่อม AI
- [ ] ทดสอบ AI API
- [ ] เชื่อม Database
- [ ] ออกแบบ Database API
- [ ] Error Handling
- [ ] End-to-End Testing

---

# 21. แนวทางการพัฒนาต่อ

ขั้นตอนถัดไปของ Backend:

1. ประสานงานกับ Frontend
2. กำหนด API ที่ Frontend ต้องใช้
3. ประสานงานกับ AI
4. ทดสอบการเชื่อมต่อ AI Server
5. สร้าง AI Service ใน Backend
6. ประสานงานกับ Database
7. สร้าง Database Service
8. เชื่อม API ทั้งหมดเข้าด้วยกัน
9. เพิ่ม Error Handling
10. ทดสอบระบบแบบ End-to-End

---

# 22. หลักการสำคัญ

Backend ควรทำหน้าที่เป็นตัวกลางของระบบ

Frontend
    |
    v
Backend
    |
    +---- AI
    |
    +---- Database


ไม่ควรให้ Frontend ติดต่อ AI หรือ Database โดยตรง
หากไม่จำเป็นต่อ Architecture ของระบบ

การออกแบบ API และโครงสร้าง Backend จริง
จะปรับตามข้อกำหนดของระบบและการตกลงร่วมกันของสมาชิกทีม