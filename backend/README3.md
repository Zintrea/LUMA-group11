LUMA Group 11 — README3
ภาพรวมงาน Backend-AI วันที่ 04/10/2569
เอกสารนี้สรุปงาน Backend-AI ที่ดำเนินการต่อจาก README2.md โดยเน้นการเพิ่มฟีเจอร์ประมวลผลรูปภาพ และการปรับระบบ Health / Readiness Check ให้สามารถตรวจสอบสถานะของแต่ละฟีเจอร์ได้
งานหลักที่ดำเนินการในวันนี้ ได้แก่
- 🖼️ Remove Background
- 🌫️ Blur Image
- 🧠 Hismat Feature Check
- ❤️ Health / Readiness Check
- 🔗 การเชื่อมต่อ Backend กับ Remove Background Service
- ⚙️ Environment Configuration
- 🗄️ Image Task Tracking
รายละเอียดขั้นตอนและการทดสอบสามารถบันทึกเพิ่มเติมใน LOGBOOK3.md
1. Remove Background
เพิ่มฟีเจอร์สำหรับลบพื้นหลังรูปภาพ โดย Backend จะทำหน้าที่เป็นตัวกลางระหว่าง Frontend และ Remove Background Service ที่ทำงานอยู่บนเครื่องอื่นในเครือข่าย
Architecture
Frontend
   │
   │ POST /remove-background
   ▼
Backend PC3
   │
   │ POST /api/remove
   ▼
Remove Background Service PC2
   │
   │ PNG
   ▼
Backend
   │
   ▼
Frontend
Remove Background Service ทำงานที่:
http://10.192.0.200:7000
Endpoint ของ Service:
POST /api/remove
1.1 Environment Configuration
เพิ่ม URL ของ Remove Background Service ลงใน:
backend/.env
ตัวอย่าง:
REMBG_URL=http://10.192.0.200:7000
Backend จะอ่านค่าจาก Environment Variable แทนการเขียน IP ของ Service ไว้ใน Route โดยตรง
2. Remove Background Route
เพิ่ม Endpoint:
POST /remove-background
Route ทำหน้าที่:
ตรวจสอบ Session
      ↓
ตรวจสอบ Image
      ↓
สร้าง image_tasks
      ↓
status = processing
      ↓
ส่ง Image ไป Remove Background Service
      ↓
รับ PNG
      ↓
status = completed
      ↓
ส่ง PNG กลับ Frontend
หากเกิดข้อผิดพลาด:
status = failed
2.1 Image Task
ใช้ตารางเดิม:
image_tasks
ไม่สร้างตารางใหม่
กำหนด:
task_type = remove_bg
สถานะหลัก:
processing
completed
failed
2.2 Response
เมื่อ Remove Background Service ทำงานสำเร็จ Backend จะส่งไฟล์กลับเป็น:
image/png
ชื่อไฟล์:
background_removed.png
3. Blur Image
เพิ่มฟีเจอร์ Blur สำหรับประมวลผลรูปภาพบนเครื่อง Backend โดยตรง
สร้างไฟล์:
backend/blur.py
โครงสร้าง:
backend/
├── app.py
├── routes.py
├── blur.py
├── hismat.py
└── .env
3.1 Blur Function
ไฟล์ blur.py ใช้ Pillow สำหรับประมวลผล Gaussian Blur
from PIL import ImageFilter

BLUR_RADII = {
    "low": 3,
    "medium": 8,
    "high": 16,
}

def blur_image(source_image, radius):
    return source_image.filter(
        ImageFilter.GaussianBlur(radius=radius)
    )
ระดับ Blur:
Strength	Radius
low	3
medium	8
high	16


4. Blur API
เพิ่ม Endpoint:
POST /blur
รับไฟล์:
image
และระดับ Blur:
strength
ค่าที่รองรับ:
low
medium
high
Blur Flow
Frontend
   │
   │ image + strength
   ▼
Backend
   │
   ▼
blur.py
   │
   │ Gaussian Blur
   ▼
PNG
   │
   ▼
Frontend
การประมวลผล Blur ทำบนเครื่อง Backend โดยตรง
5. Hismat Feature
ระบบมีฟีเจอร์ Hismat ผ่าน:
POST /hismat
ฟังก์ชันใช้:
from hismat import hismat
รับ:
source_image
reference_image
และส่งผลลัพธ์กลับเป็น:
image/png
6. Feature Health Check
ปรับ /ready ให้ตรวจสอบฟีเจอร์เพิ่มเติมจากเดิมที่ตรวจ Backend, AI / Forge และ Database
เพิ่ม:
Hismat
Remove Background
Blur
โครงสร้าง:
/ready
│
├── Backend
├── Database
├── AI / Forge
├── Hismat
├── Remove Background
└── Blur
6.1 Hismat Check
def check_hismat():
    try:
        if callable(hismat):
            return "ok"
        return "error"
    except Exception:
        return "error"
ตรวจสอบว่า Hismat Function พร้อมใช้งาน โดยไม่ประมวลผลรูปจริง
7. Remove Background Health Check
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
ใช้ตรวจสอบว่า Backend สามารถติดต่อ Remove Background Service ได้หรือไม่ โดยไม่ส่งรูปจริง
8. Blur Health Check
def check_blur():
    try:
        if callable(blur_image) and isinstance(BLUR_RADII, dict):
            return "ok"
        return "error"
    except Exception:
        return "error"
ตรวจสอบว่า blur_image และ BLUR_RADII พร้อมใช้งานหรือไม่
9. Updated /ready
/ready ตรวจสอบ:
ai_result = check_ai()
database_result = check_database()

hismat_status = check_hismat()
remove_bg_status = check_remove_bg()
blur_status = check_blur()
และรวมทุกส่วนในการตัดสิน Readiness:
all_ready = (
    backend_status == "ok"
    and ai_result["status"] == "ok"
    and database_result["status"] == "ok"
    and hismat_status == "ok"
    and remove_bg_status == "ok"
    and blur_status == "ok"
)
ตัวอย่าง Response
{
    "status": "ready",
    "backend": "ok",
    "ai": "ok",
    "database": "ok",
    "hismat": "ok",
    "remove_bg": "ok",
    "blur": "ok"
}
หาก Remove Background ไม่พร้อม:
{
    "status": "not_ready",
    "backend": "ok",
    "ai": "ok",
    "database": "ok",
    "hismat": "ok",
    "remove_bg": "error",
    "blur": "ok"
}
10. AI Forge Configuration
ปรับการเชื่อมต่อ AI Forge:
FORGE_URL=http://10.192.0.200:7860
Backend ใช้:
FORGE_URL = os.getenv(
    "FORGE_URL",
    "http://10.192.0.200:7860"
)
11. Backend Environment
Environment ที่เกี่ยวข้อง:
FORGE_URL=http://10.192.0.200:7860
REMBG_URL=http://10.192.0.200:7000
ไม่ควรเขียน Password หรือ Secret Key ลงใน Source Code โดยตรง
12. Dependency / Pillow
Hismat และ Blur ใช้ Pillow:
from PIL import Image
Blur ใช้:
from PIL import ImageFilter
ระหว่างทดสอบพบปัญหาเมื่อ Backend ถูกเรียกด้วย Python ที่ไม่ได้ใช้ Virtual Environment:
ModuleNotFoundError: No module named 'PIL'
แนวทางการรัน Backend:
..\venv\Scripts\python.exe app.py
13. Syntax Check
ตรวจสอบ Syntax ของ routes.py ด้วย:
..\venv\Scripts\python.exe -m py_compile routes.py
ผล:
ไม่มี Error
แสดงว่า routes.py ผ่าน Syntax Check
14. การทดสอบ
Remove Background
Service:
10.192.0.200:7000
สถานะการเชื่อมต่อ:
เชื่อมต่อได้
Route:
POST /remove-background
สถานะ:
รอทดสอบ Route จริง
Blur
สร้าง:
blur.py
และเพิ่ม:
POST /blur
รองรับ:
low
medium
high
สถานะ:
ฟังก์ชันและ Route ถูกเพิ่ม
รอทดสอบจริง
Hismat
Route:
POST /hismat
เพิ่ม Feature Check ใน /ready
สถานะ:
เพิ่มเข้า Readiness Check
รอทดสอบ /ready
/ready
ปรับให้ตรวจสอบ:
Backend
Database
AI / Forge
Hismat
Remove Background
Blur
การทดสอบ curl ล่าสุดยังไม่สำเร็จ เนื่องจากขณะทดสอบไม่มี Flask Backend เปิดรับที่ localhost:5000
จึงได้รับ:
curl: (7) Failed to connect to localhost:5000
ดังนั้น /ready ยังต้องทดสอบจริงหลังจากเปิด Backend
15. สถานะงานปัจจุบัน
ส่วนงาน	สถานะ
Security / Authentication	✅
Admin System	✅
AI Model Selection	✅
AI Forge	✅
Image Generation	✅
Hismat Route	✅
Hismat Readiness Check	✅
Remove Background Route	✅
Remove Background Service Connection	✅
Remove Background Readiness Check	✅
Blur Function	✅
Blur Route	✅
Blur Readiness Check	✅
/ready รวมทุก Feature	🔄 รอทดสอบ
Remove Background Route จริง	🔄 รอทดสอบ
Blur Route จริง	🔄 รอทดสอบ
Hismat ผ่าน /ready	🔄 รอทดสอบ


16. งานที่ต้องทำต่อ
1. เปิด Backend:
..\venv\Scripts\python.exe app.py
2. ทดสอบ /ready:
curl.exe http://localhost:5000/ready
3. ตรวจสอบ:
backend
ai
database
hismat
remove_bg
blur
4. ทดสอบ:
POST /remove-background
5. ตรวจสอบ image_tasks:
task_type = remove_bg
status = completed
6. ทดสอบ:
POST /blur
7. ทดสอบ low, medium, high
8. ทดสอบการทำงานจาก Frontend
17. เอกสารที่เกี่ยวข้อง
README2.md
    → Security / Authentication / Admin / AI Model

README3.md
    → Remove Background / Blur / Hismat / Readiness

LOGBOOK2.md
    → รายละเอียดงานวันที่ 28/09/2569

LOGBOOK3.md
    → รายละเอียดขั้นตอนและการทดสอบวันที่ 04/10/2569

backend/README.md
    → รายละเอียดการใช้งาน Backend

backend/LOGBOOK.md
    → Logbook เดิมของ Backend
สรุป
งาน Backend-AI วันที่ 04/10/2569 เป็นการต่อยอดจากระบบ Security, Admin และ AI Model Selection โดยเพิ่มฟีเจอร์ประมวลผลรูปภาพ ได้แก่ Remove Background และ Blur รวมถึงเพิ่มการตรวจสอบ Hismat ในระบบ Feature Health Check
Remove Background ทำงานผ่าน Service บน PC2 ส่วน Blur ประมวลผลโดยตรงบน Backend PC3 และ /ready ถูกปรับให้ตรวจสอบสถานะของ Backend, Database, AI Forge, Hismat, Remove Background และ Blur แยกกัน
ปัจจุบันโครงสร้าง Feature และ Route ถูกเพิ่มแล้ว ส่วนที่เหลือคือ ทดสอบ /ready, Remove Background และ Blur ผ่านการใช้งานจริง เพื่อยืนยันการทำงานของระบบทั้งหมด