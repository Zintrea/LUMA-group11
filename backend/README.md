# Backend

ส่วนนี้เป็นงานของผู้รับผิดชอบ Backend

README นี้เป็นตัวอย่างสำหรับบันทึกวิธีใช้งานของส่วนนี้
ให้แก้ข้อมูลให้ตรงกับงานจริงเมื่อเริ่มพัฒนา

## 1. ส่วนนี้ทำอะไร

ตัวอย่าง:

รับคำสั่งจาก Frontend แล้วจัดการงานของระบบ เช่น

- รับ Prompt
- ติดต่อ AI
- ติดต่อ Database
- ส่งผลลัพธ์กลับ Frontend

## 2. ต้องลงอะไร

ตัวอย่าง:

- Python 3.12
- Flask

ถ้ามี Package เพิ่มเติม ให้ระบุไว้ตรงนี้

## 3. ติดตั้ง

ตัวอย่าง:

```bash
pip install -r requirements.txt
```

ถ้าไม่มี requirements.txt ให้แก้ส่วนนี้ตามวิธีติดตั้งจริง

## 4. รัน

ตัวอย่าง:

```bash
python app.py
```

ตัวอย่าง Address:

```text
localhost
```

## 5. ทดสอบ

ตัวอย่าง:

เปิด:

```text
localhost
```

หรือ Health Endpoint เช่น:

```text
localhost/health
```

ถ้า Backend ตอบกลับได้ ถือว่า Backend เปิดทำงานสำเร็จ

---

เมื่อเริ่มพัฒนาจริง ให้แก้ README นี้ให้ตรงกับคำสั่งติดตั้ง รัน และทดสอบของจริง







# Backend

ส่วนนี้เป็นงาน Backend ของโปรเจกต์ LUMA-group11

Backend ทำหน้าที่เป็นส่วนกลางในการรับ Request จาก Frontend
ประมวลผลข้อมูล และส่ง Response กลับไปยัง Frontend

ปัจจุบัน Backend อยู่ในขั้นตอนเริ่มต้นของการพัฒนา
โดยได้จัดเตรียม Flask Server และ Health Endpoint สำหรับทดสอบระบบแล้ว

---

## 1. ส่วนนี้ทำอะไร

Backend เป็นส่วนกลางของระบบ ทำหน้าที่เชื่อมต่อและจัดการการทำงานระหว่าง Frontend, AI และ Database

การทำงานหลักของ Backend ได้แก่:

- รับ Request จาก Frontend
- ตรวจสอบและจัดการข้อมูลที่ได้รับจาก Frontend
- ส่งข้อมูลไปยัง AI เพื่อประมวลผล
- รับผลลัพธ์จาก AI
- อ่านและบันทึกข้อมูลใน Database
- จัดการ API Endpoint ของระบบ
- ส่งผลลัพธ์กลับไปยัง Frontend
- จัดการ Error และ Response ของระบบ

### การทำงานของระบบ

โครงสร้างการทำงานหลัก:

Frontend
    ↓
Backend
    ↓
┌───────────────┬───────────────┐
│               │               │
▼               ▼               ▼
AI          Database       การประมวลผล
│               │
└───────┬───────┘
        ▼
     Backend
        ↓
    Frontend

Backend ทำหน้าที่เป็นตัวกลางระหว่าง Frontend, AI และ Database
โดย Frontend จะส่ง Request มายัง Backend
จากนั้น Backend จะจัดการ Request และติดต่อกับ AI หรือ Database ตามความต้องการของระบบ
ก่อนส่งผลลัพธ์กลับไปยัง Frontend

### การทำงานปัจจุบัน

ในขั้นตอนเริ่มต้น Backend มี Health Endpoint
สำหรับตรวจสอบว่า Server สามารถทำงานและตอบ Request ได้หรือไม่

Endpoint:

GET /health

Response:

{
  "status": "ok"
}

หากได้รับ Response ดังกล่าว แสดงว่า Backend สามารถทำงานได้ตามปกติ

---

## 2. ต้องลงอะไร

### Python

ใช้ Python:

Python 3.10.11

ตรวจสอบเวอร์ชัน Python:

python --version

ผลลัพธ์ที่ควรได้:

Python 3.10.11

### Flask

Backend ใช้ Flask:

Flask 3.1.3

Package และ Version ที่ใช้ในโปรเจกต์ถูกบันทึกไว้ใน:

requirements.txt

---

## 3. โครงสร้างไฟล์

โครงสร้างส่วนที่เกี่ยวข้องกับ Backend ในปัจจุบัน:

LUMA-group11/
│
├── backend/
│   ├── README.md
│   └── app.py
│
├── database/
│
├── frontend/
│
├── ai/
│
├── venv/
│
├── requirements.txt
│
└── .gitignore

รายละเอียด:

- backend/app.py - โปรแกรมหลักของ Flask Backend
- backend/README.md - เอกสารวิธีใช้งาน Backend
- requirements.txt - รายการ Python Packages ที่ Backend ต้องใช้
- venv/ - Virtual Environment สำหรับติดตั้ง Packages ของโปรเจกต์
- .gitignore - กำหนดไฟล์หรือโฟลเดอร์ที่ไม่ต้องการให้ Git ติดตาม

---

## 4. การติดตั้ง

### 4.1 ตรวจสอบ Python

เปิด Terminal ที่โฟลเดอร์หลักของโปรเจกต์:

LUMA-group11

ตรวจสอบ Python:

python --version

ต้องเป็น:

Python 3.10.11

---

### 4.2 สร้าง Virtual Environment

หากยังไม่มี Virtual Environment ให้สร้างด้วย:

python -m venv venv

จะได้โฟลเดอร์:

venv/

---

### 4.3 เปิดใช้งาน Virtual Environment

สำหรับ Windows PowerShell:

.\venv\Scripts\Activate.ps1

หาก PowerShell ไม่อนุญาตให้รัน Script ให้ใช้คำสั่งนี้ก่อน:

Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

จากนั้นเปิดใช้งานอีกครั้ง:

.\venv\Scripts\Activate.ps1

หากเปิดใช้งานสำเร็จ จะเห็น (venv) อยู่ด้านหน้า Terminal เช่น:

(venv) PS C:\Ai gen\ProjectFN\LUMA-group11>

---

### 4.4 ติดตั้ง Packages

เมื่อเปิดใช้งาน Virtual Environment แล้ว
ให้ติดตั้ง Packages จาก requirements.txt:

pip install -r requirements.txt

Packages หลักที่ใช้ในปัจจุบันคือ:

Flask 3.1.3

---

## 5. การรัน Backend

ต้องเปิดใช้งาน Virtual Environment ก่อนรัน Backend

ตรวจสอบว่ามี (venv) อยู่หน้า Terminal:

(venv) PS C:\Ai gen\ProjectFN\LUMA-group11>

จากโฟลเดอร์หลัก LUMA-group11 ให้รัน:

python backend\app.py

หาก Backend ทำงานสำเร็จ จะปรากฏข้อความประมาณ:

* Serving Flask app 'app'
* Debug mode: on
* Running on http://127.0.0.1:5000

Backend จะทำงานที่:

http://localhost:5000

หรือ:

http://127.0.0.1:5000

### หยุด Backend

หากต้องการหยุด Server ให้กด:

Ctrl + C

---

## 6. การทดสอบ Backend

หลังจากรัน Backend แล้ว ให้เปิด Web Browser

เข้า:

http://localhost:5000/health

หรือ:

http://127.0.0.1:5000/health

หาก Backend ทำงานถูกต้อง จะได้รับ Response:

{
  "status": "ok"
}

การได้รับ Response นี้หมายความว่า:

- Flask Server เปิดทำงานสำเร็จ
- Backend สามารถรับ Request ได้
- /health Endpoint ทำงานได้
- Backend สามารถส่ง Response กลับมาได้

---

## 7. Health Endpoint

### GET /health

ใช้สำหรับตรวจสอบสถานะของ Backend

Request:

GET /health

URL:

http://localhost:5000/health

Response:

{
  "status": "ok"
}

---

## 8. Git Branch

การพัฒนา Backend แยกออกจาก main
โดยใช้ Git Branch:

backend

ตรวจสอบ Branch ปัจจุบัน:

git branch

ควรเห็น:

* backend
  main

เครื่องหมาย * หมายถึง Branch ที่กำลังใช้งานอยู่

การพัฒนา Backend ให้ทำงานบน:

backend

ไม่ควรพัฒนาโดยตรงบน:

main

---

## 9. Git Workflow สำหรับ Backend

หลังจากแก้ไขหรือเพิ่มไฟล์ Backend ให้ตรวจสอบสถานะ:

git status

เพิ่มไฟล์ที่ต้องการ Commit:

git add <ชื่อไฟล์>

ตัวอย่าง:

git add backend/app.py

Commit:

git commit -m "ข้อความอธิบายการเปลี่ยนแปลง"

ตัวอย่าง:

git commit -m "Add Flask health endpoint"

---

## 10. การติดตั้ง Backend ในเครื่องใหม่

หากต้องนำโปรเจกต์ไปติดตั้งในเครื่องใหม่
ให้ทำตามขั้นตอน:

### 1. เข้าโฟลเดอร์โปรเจกต์

cd LUMA-group11

### 2. สร้าง Virtual Environment

python -m venv venv

### 3. เปิดใช้งาน Virtual Environment

Windows PowerShell:

.\venv\Scripts\Activate.ps1

หากติดปัญหา Execution Policy:

Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

แล้ว:

.\venv\Scripts\Activate.ps1

### 4. ติดตั้ง Packages

pip install -r requirements.txt

### 5. รัน Backend

python backend\app.py

### 6. ทดสอบ

เปิด:

http://localhost:5000/health

หากได้:

{
  "status": "ok"
}

แสดงว่า Backend พร้อมใช้งาน

---

## 11. สถานะปัจจุบัน

ปัจจุบัน Backend มีระบบพื้นฐานดังนี้:

- [x] สร้าง Git Branch backend
- [x] ติดตั้ง Python 3.10.11
- [x] สร้าง Virtual Environment
- [x] ติดตั้ง Flask 3.1.3
- [x] สร้าง requirements.txt
- [x] สร้าง Flask Application
- [x] สร้าง /health Endpoint
- [x] ทดสอบ Flask Server
- [x] ทดสอบ /health สำเร็จ

ส่วนการทำงานเพิ่มเติม เช่น

- การรับข้อมูลจาก Frontend
- API สำหรับระบบจริง
- การเชื่อมต่อ AI
- การเชื่อมต่อ Database
- การจัดการข้อมูลของระบบ

จะพัฒนาต่อในขั้นตอนถัดไป

---

## 12. หมายเหตุ

Backend ปัจจุบันใช้ Flask Development Server
สำหรับการพัฒนาและทดสอบภายในเครื่อง

Development Server ไม่ควรใช้สำหรับ Production Deployment

เมื่อระบบพัฒนาเสร็จและมีการ Deploy จริง
ควรเปลี่ยนไปใช้ Production WSGI Server
และตั้งค่าที่เหมาะสมกับระบบจริง

---