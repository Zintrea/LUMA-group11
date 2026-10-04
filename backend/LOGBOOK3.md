LUMA Group 11 — LOGBOOK3
วันที่ 04/10/2569
เอกสารนี้บันทึกขั้นตอนการทำงาน Backend-AI ของ LUMA Group 11 ในวันที่ 04/10/2569 โดยต่อเนื่องจากงานใน README2.md และ LOGBOOK2.md
1. ตรวจสอบและเตรียม Environment
ตรวจสอบการตั้งค่า Environment ของ Backend สำหรับ AI Forge และ Remove Background Service
ค่าที่ใช้:
FORGE_URL=http://10.192.0.200:7860
REMBG_URL=http://10.192.0.200:7000
AI Forge ใช้สำหรับ Image Generation
Remove Background Service ทำงานบนเครื่อง PC2 และ Backend เชื่อมต่อผ่าน Port 7000
2. ตรวจสอบการรัน Backend
Backend ใช้ Flask และควรรันผ่าน Python ใน Virtual Environment ของโปรเจกต์
คำสั่งที่ใช้:
..\venv\Scripts\python.exe app.py
ระหว่างการทำงานมีการตรวจสอบค่าที่ Backend โหลดจาก .env เช่น:
Database Name: postgres
Database User: postgres
Database Password exists: True
Forge URL: http://10.192.0.200:7860
REMBG URL: http://10.192.0.200:7000
Backend สามารถอ่าน Environment Configuration ได้ถูกต้อง
3. ปัญหา Python และ Pillow
ระหว่างการรัน Backend พบ Error:
ModuleNotFoundError: No module named 'PIL'
สาเหตุคือมีการรัน Backend ด้วย Python ที่ไม่ได้ใช้ Virtual Environment ของโปรเจกต์
แนวทางที่ใช้ในการรัน Backend คือ:
..\venv\Scripts\python.exe app.py
เพื่อให้ Backend ใช้ Package ที่ติดตั้งอยู่ใน venv
Pillow มีความเกี่ยวข้องกับฟีเจอร์ Hismat และ Blur เนื่องจากมีการใช้งาน:
from PIL import Image
และ:
from PIL import ImageFilter
4. เพิ่มฟีเจอร์ Remove Background
เพิ่ม Route สำหรับ Remove Background:
POST /remove-background
การทำงาน:
Frontend
   ↓
Backend
   ↓
ตรวจสอบ Session
   ↓
รับ Image
   ↓
สร้าง image_tasks
   ↓
status = processing
   ↓
ส่ง Image ไป PC2
   ↓
Remove Background Service
   ↓
รับ PNG
   ↓
status = completed
   ↓
ส่ง PNG กลับ Frontend
หากเกิด Error จะเปลี่ยน Task เป็น:
status = failed
5. Image Task สำหรับ Remove Background
ใช้ตารางเดิม:
image_tasks
ไม่มีการสร้างตารางใหม่
กำหนดประเภท Task เป็น:
task_type = remove_bg
และบันทึกสถานะ:
processing
completed
failed
ตัวอย่าง SQL ที่ใช้ใน Route:
INSERT INTO image_tasks
(
    user_id,
    task_type,
    status,
    prompt_text
)
VALUES
(
    %s,
    'remove_bg',
    'processing',
    %s
)
RETURNING id;
เมื่อประมวลผลสำเร็จ:
UPDATE image_tasks
SET status='completed'
WHERE id=%s;
หากเกิด Error:
UPDATE image_tasks
SET status='failed'
WHERE id=%s;
6. เชื่อมต่อ Remove Background Service
Backend ส่งไฟล์ไปยัง:
http://10.192.0.200:7000/api/remove
โดยส่งไฟล์ผ่าน Form Data:
image
และกำหนด Timeout:
120 seconds
ผลลัพธ์จาก Service เป็น PNG และ Backend ส่งกลับให้ Frontend ด้วย:
image/png
ชื่อไฟล์ที่ส่งกลับ:
background_removed.png
การเชื่อมต่อกับ PC2 สามารถใช้งานได้
7. เพิ่มฟังก์ชัน Blur
สร้างไฟล์ใหม่:
backend/blur.py
เพื่อแยกฟังก์ชัน Blur ออกจาก routes.py
โครงสร้าง:
backend/
├── app.py
├── routes.py
├── blur.py
├── hismat.py
└── .env
ใช้ Pillow ในการทำ Gaussian Blur
from PIL import ImageFilter
กำหนดระดับ Blur:
BLUR_RADII = {
    "low": 3,
    "medium": 8,
    "high": 16,
}
ฟังก์ชัน:
def blur_image(source_image, radius):
    return source_image.filter(
        ImageFilter.GaussianBlur(radius=radius)
    )
8. เพิ่ม Blur Route
เพิ่ม Endpoint:
POST /blur
Route รับ:
image
strength
โดย strength รองรับ:
low
medium
high
ตัวอย่างการทำงาน:
Frontend
   ↓
POST /blur
   ↓
Backend
   ↓
blur_image()
   ↓
Gaussian Blur
   ↓
PNG
   ↓
Frontend
การประมวลผล Blur ทำโดยตรงบนเครื่อง Backend ไม่ต้องส่งไปยังเครื่องอื่น
9. ตรวจสอบ Hismat
ระบบเดิมมี Route:
POST /hismat
ใช้ฟังก์ชัน:
from hismat import hismat
และใช้ Pillow ในการเปิดและประมวลผลรูปภาพ
ในวันนี้ได้เพิ่มการตรวจสอบสถานะของ Hismat เข้าไปใน /ready
โดยตรวจว่า Function สามารถเรียกใช้งานได้หรือไม่:
def check_hismat():
    try:
        if callable(hismat):
            return "ok"
        return "error"
    except Exception:
        return "error"
การตรวจสอบนี้ไม่เรียกประมวลผลรูปจริง
10. ปรับปรุง /ready
จากเดิม /ready ตรวจสอบ:
Backend
AI / Forge
Database
วันนี้เพิ่มการตรวจสอบ:
Hismat
Remove Background
Blur
โครงสร้างใหม่:
/ready
│
├── Backend
├── Database
├── AI / Forge
├── Hismat
├── Remove Background
└── Blur
11. เพิ่ม Hismat Health Check
เพิ่ม:
def check_hismat():
    try:
        if callable(hismat):
            return "ok"
        return "error"
    except Exception:
        return "error"
ใช้สำหรับตรวจสอบว่า Hismat Function พร้อมใช้งานหรือไม่
ไม่ประมวลผลรูปจริงใน /ready
12. เพิ่ม Remove Background Health Check
เพิ่ม:
def check_remove_bg():
    try:
        response = requests.get(
            current_app.config["REMBG_URL"],
            timeout=5
        )

        if response.status_code < 500:
            return "ok"

        return "error"

    except Exception:
        return "error"
หน้าที่คือทดสอบว่า Backend สามารถติดต่อ Remove Background Service ได้หรือไม่
ไม่ส่งรูปจริงไปประมวลผล
13. เพิ่ม Blur Health Check
เพิ่ม:
def check_blur():
    try:
        if callable(blur_image) and isinstance(BLUR_RADII, dict):
            return "ok"
        return "error"
    except Exception:
        return "error"
ตรวจสอบว่า:
blur_image
BLUR_RADII
พร้อมใช้งานหรือไม่
14. ปรับ Logic ของ /ready
เพิ่มการเรียกตรวจสอบ:
ai_result = check_ai()
database_result = check_database()

hismat_status = check_hismat()
remove_bg_status = check_remove_bg()
blur_status = check_blur()
และเพิ่มทุก Feature เข้า all_ready:
all_ready = (
    backend_status == "ok"
    and ai_result["status"] == "ok"
    and database_result["status"] == "ok"
    and hismat_status == "ok"
    and remove_bg_status == "ok"
    and blur_status == "ok"
)
Response ของ /ready เพิ่ม:
{
    "status": "ready",
    "backend": "ok",
    "ai": "ok",
    "database": "ok",
    "hismat": "ok",
    "remove_bg": "ok",
    "blur": "ok"
}
หาก Feature ใดไม่พร้อม ระบบจะตอบ:
status = not_ready
และแสดงสถานะของแต่ละส่วนแยกกัน
15. Syntax Check
หลังแก้ไข routes.py มีการตรวจสอบ Syntax ด้วย:
..\venv\Scripts\python.exe -m py_compile routes.py
ผลการตรวจสอบ:
ไม่มี Error
จึงยืนยันว่า routes.py ผ่าน Syntax Check
16. ทดสอบ /ready
มีการทดสอบ:
curl.exe http://localhost:5000/ready
ผลที่พบ:
curl: (7) Failed to connect to localhost:5000
Could not connect to server
สาเหตุคือในช่วงเวลาที่ทดสอบ Flask Backend ไม่ได้เปิดรับ Connection ที่:
localhost:5000
ดังนั้นผลนี้ยังไม่ใช่ Error จาก Logic ของ /ready แต่เป็นการที่ Backend ไม่ได้กำลังรันอยู่
การทดสอบที่ถูกต้องต้องเปิด Backend ก่อน:
..\venv\Scripts\python.exe app.py
จากนั้นจึงเรียก:
curl.exe http://localhost:5000/ready
17. สรุปสถานะงานวันที่ 04/10/2569
งาน	สถานะ
ตั้งค่า FORGE_URL	✅
ตั้งค่า REMBG_URL	✅
เชื่อมต่อ Remove Background PC2	✅
Remove Background Route	✅
Image Task remove_bg	✅
Blur Function	✅
blur.py	✅
Blur Route	✅
Hismat Readiness Check	✅
Remove Background Readiness Check	✅
Blur Readiness Check	✅
ปรับ /ready	✅
Syntax Check routes.py	✅
ทดสอบ /ready จริง	🔄 รอเปิด Backend และทดสอบ
ทดสอบ Remove Background Route จริง	🔄
ทดสอบ Blur Route จริง	🔄


18. งานที่ต้องทำต่อ
1. เปิด Flask Backend:
..\venv\Scripts\python.exe app.py
2. ทดสอบ:
curl.exe http://localhost:5000/ready
3. ตรวจสอบสถานะ:
backend
ai
database
hismat
remove_bg
blur
4. ทดสอบ:
POST /remove-background
5. ตรวจสอบ image_tasks
6. ทดสอบ:
POST /blur
7. ทดสอบ Blur:
low
medium
high
8. ทดสอบการเชื่อมต่อ Feature ทั้งหมดจาก Frontend
สรุปประจำวัน
วันที่ 04/10/2569 ได้ดำเนินการต่อยอด Backend-AI โดยเพิ่มระบบ Remove Background ที่เชื่อมต่อกับ Service บน PC2, เพิ่มฟีเจอร์ Blur ที่ประมวลผลบน Backend โดยใช้ blur.py, และเพิ่มการตรวจสอบ Hismat, Remove Background และ Blur เข้าไปใน /ready
นอกจากนี้ได้ตรวจสอบ Syntax ของ routes.py และแก้ปัญหาการใช้ Python ผิด Environment ที่ทำให้ไม่พบ PIL
โครงสร้างฟีเจอร์และ Readiness Check ถูกเพิ่มเรียบร้อยแล้ว ส่วนที่ยังเหลือคือการทดสอบ /ready, Remove Background และ Blur ผ่านการใช้งานจริง