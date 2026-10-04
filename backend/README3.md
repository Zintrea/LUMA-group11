LUMA Group 11 --- README3
ภาพรวมงาน Backend-AI วันที่ 04/10/2569
เอกสารนี้สรุปงาน Backend-AI ที่ดำเนินการต่อจาก README2.md
โดยเพิ่มฟีเจอร์ประมวลผลรูปภาพ ได้แก่ Remove Background, Blur และ Contrast
รวมถึงปรับระบบ Health / Readiness Check ให้ตรวจสอบสถานะของแต่ละฟีเจอร์ได้
1. Remove Background
เพิ่มฟีเจอร์สำหรับลบพื้นหลังรูปภาพ โดย Backend ทำหน้าที่เป็นตัวกลางระหว่าง Frontend และ
Remove Background Service บนเครื่องอื่นในเครือข่าย
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
Service:
http://10.192.0.200:7000
Endpoint:
POST /api/remove
1.1 Environment Configuration
ใน backend/.env:
REMBG_URL=http://10.192.0.200:7000
Backend อ่าน URL จาก Environment Variable แทนการเขียน IP ไว้ใน Route โดยตรง
1.2 Remove Background Route
Endpoint:
POST /remove-background
Flow:
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
ใช้ตารางเดิม image_tasks โดยกำหนด:
task_type = remove_bg
สถานะ:
processing
completed
failed
Response:
image/png
ชื่อไฟล์:
background_removed.png
2. Blur Image
เพิ่มฟีเจอร์ Blur สำหรับประมวลผลรูปภาพบน Backend โดยตรง
สร้าง:
backend/blur.py
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
  Strength     Radius
  low               3
  medium            8
  high             16
2.1 Blur API
Endpoint:
POST /blur
รับ:
image
strength
รองรับ:
low
medium
high
Flow:
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
3. Hismat Feature
ระบบมี Hismat ผ่าน:
POST /hismat
ใช้:
from hismat import hismat
รับ:
source_image
reference_image
และส่งผลลัพธ์กลับเป็น:
image/png
4. Contrast / Grayscale Image Processing
เพิ่มฟีเจอร์สำหรับแปลงภาพเป็น Grayscale และปรับ Contrast ด้วย Histogram
Equalization
สร้าง:
backend/contrast.py
โครงสร้าง:
backend/
├── app.py
├── routes.py
├── blur.py
├── contrast.py
├── hismat.py
└── .env
4.1 Contrast Function
import cv2


def process_grayscale_image(image):
    """
    แปลงภาพสีเป็น Grayscale
    และปรับ Contrast ด้วย Histogram Equalization
    """

    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    output = cv2.equalizeHist(gray)

    return output
การทำงาน:
Color Image
     │
     ▼
BGR → Grayscale
     │
     ▼
Histogram Equalization
     │
     ▼
Contrast Image
4.2 Contrast API
Endpoint:
POST /contrast
รับ:
image
Flow:
Frontend
   │
   │ POST /contrast
   │ image
   ▼
Backend
   │
   ▼
Decode Image
   │
   ▼
contrast.py
   │
   ├── Grayscale
   │
   └── Histogram Equalization
   │
   ▼
PNG
   │
   ▼
Frontend
Import:
from contrast import process_grayscale_image
ใช้ OpenCV และ NumPy ในการ Decode และ Encode ภาพ
ผลลัพธ์:
image/png
ชื่อไฟล์:
contrast.png
4.3 Contrast Dependency
Package ที่เกี่ยวข้อง:
opencv-python
numpy
ติดตั้ง OpenCV ใน Virtual Environment:
..\venv\Scripts\python.exe -m pip install opencv-python
ตรวจสอบ:
..\venv\Scripts\python.exe -c "import cv2; print(cv2.__version__)"
การรัน Backend:
..\venv\Scripts\python.exe app.py
5. Feature Health Check
ปรับ /ready ให้ตรวจสอบ:
/ready
│
├── Backend
├── Database
├── AI / Forge
├── Hismat
├── Remove Background
├── Blur
└── Contrast
5.1 Hismat Check
def check_hismat():
    try:
        if callable(hismat):
            return "ok"
        return "error"
    except Exception:
        return "error"
5.2 Remove Background Check
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
5.3 Blur Check
def check_blur():
    try:
        if callable(blur_image) and isinstance(BLUR_RADII, dict):
            return "ok"
        return "error"
    except Exception:
        return "error"
5.4 Contrast Check
def check_contrast():
    try:
        if callable(process_grayscale_image):
            return "ok"
        return "error"
    except Exception:
        return "error"
ตรวจสอบว่า process_grayscale_image พร้อมใช้งาน โดยไม่ประมวลผลภาพจริง
6. Updated /ready
เพิ่ม:
contrast_status = check_contrast()
และรวมใน all_ready:
all_ready = (
    backend_status == "ok"
    and ai_result["status"] == "ok"
    and database_result["status"] == "ok"
    and hismat_status == "ok"
    and remove_bg_status == "ok"
    and blur_status == "ok"
    and contrast_status == "ok"
)
Response เมื่อพร้อม:
{
    "status": "ready",
    "backend": "ok",
    "ai": "ok",
    "database": "ok",
    "hismat": "ok",
    "remove_bg": "ok",
    "blur": "ok",
    "contrast": "ok"
}
หาก Contrast ไม่พร้อม:
{
    "status": "not_ready",
    "backend": "ok",
    "ai": "ok",
    "database": "ok",
    "hismat": "ok",
    "remove_bg": "ok",
    "blur": "ok",
    "contrast": "error"
}
7. AI Forge Configuration
FORGE_URL=http://10.192.0.200:7860
Backend ใช้:
FORGE_URL = os.getenv(
    "FORGE_URL",
    "http://10.192.0.200:7860"
)
8. Backend Environment
FORGE_URL=http://10.192.0.200:7860
REMBG_URL=http://10.192.0.200:7000
ไม่ควรเขียน Password หรือ Secret Key ลงใน Source Code โดยตรง
9. Dependency
Hismat และ Blur ใช้ Pillow:
from PIL import Image
from PIL import ImageFilter
Contrast ใช้:
import cv2
import numpy as np
ระหว่างทดสอบพบว่า Backend ต้องรันด้วย Python จาก Virtual Environment เพื่อให้
Package ที่ติดตั้งไว้ถูกใช้งาน:
..\venv\Scripts\python.exe app.py
หากไม่มี OpenCV:
ModuleNotFoundError: No module named 'cv2'
ให้ติดตั้ง:
..\venv\Scripts\python.exe -m pip install opencv-python
10. Syntax Check
ตรวจสอบ routes.py:
..\venv\Scripts\python.exe -m py_compile routes.py
ตรวจสอบ contrast.py:
..\venv\Scripts\python.exe -m py_compile contrast.py
หากไม่มี Error แสดงว่าไฟล์ผ่าน Syntax Check
11. การทดสอบ
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
เพิ่ม:
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
Contrast
สร้าง:
contrast.py
เพิ่ม:
POST /contrast
รองรับ:
Grayscale
Histogram Equalization
สถานะ:
ฟังก์ชันและ Route ถูกเพิ่ม
เพิ่มเข้า Readiness Check
รอทดสอบ Route จริง
/ready
ตรวจสอบ:
Backend
Database
AI / Forge
Hismat
Remove Background
Blur
Contrast
ก่อนหน้านี้การทดสอบ curl ไม่สำเร็จเมื่อ Flask Backend ไม่ได้เปิดรับที่
localhost:5000:
curl: (7) Failed to connect to localhost:5000
ดังนั้น /ready ต้องทดสอบหลังจากเปิด Backend
12. สถานะงานปัจจุบัน
  ส่วนงาน                                 สถานะ
  Security / Authentication              ✅
  Admin System                           ✅
  AI Model Selection                     ✅
  AI Forge                               ✅
  Image Generation                       ✅
  Hismat Route                           ✅
  Hismat Readiness Check                 ✅
  Remove Background Route                ✅
  Remove Background Service Connection   ✅
  Remove Background Readiness Check      ✅
  Blur Function                          ✅
  Blur Route                             ✅
  Blur Readiness Check                   ✅
  Contrast Function                      ✅
  Contrast Route                         ✅
  Contrast Readiness Check               ✅
  /ready รวมทุก Feature                 🔄 รอทดสอบ
  Remove Background Route จริง            🔄 รอทดสอบ
  Blur Route จริง                         🔄 รอทดสอบ
  Contrast Route จริง                     🔄 รอทดสอบ
  Hismat ผ่าน /ready                    🔄 รอทดสอบ
13. งานที่ต้องทำต่อ
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
contrast
4. ทดสอบ:
POST /remove-background
5. ตรวจสอบ image_tasks:
task_type = remove_bg
status = completed
6. ทดสอบ:
POST /blur
7. ทดสอบ Blur:
low
medium
high
8. ทดสอบ:
POST /contrast
9. ตรวจสอบผลลัพธ์:
Grayscale
Histogram Equalization
PNG Response
10. ทดสอบการทำงานจาก Frontend
14. เอกสารที่เกี่ยวข้อง
README2.md
    → Security / Authentication / Admin / AI Model

README3.md
    → Remove Background / Blur / Hismat / Contrast / Readiness

LOGBOOK2.md
    → รายละเอียดงานวันที่ 28/09/2569

LOGBOOK3.md
    → รายละเอียดขั้นตอนและการทดสอบวันที่ 04/10/2569

backend/README.md
    → รายละเอียดการใช้งาน Backend

backend/LOGBOOK.md
    → Logbook เดิมของ Backend
15. สรุป
งาน Backend-AI วันที่ 04/10/2569 เป็นการต่อยอดจากระบบ Security, Admin และ
AI Model Selection โดยเพิ่มฟีเจอร์ประมวลผลรูปภาพ ได้แก่ Remove Background,
Blur และ Contrast
Remove Background ทำงานผ่าน Service บน PC2 ส่วน Backend PC3
ทำหน้าที่เป็นตัวกลางระหว่าง Frontend และ Remove Background Service
Blur ประมวลผลโดยตรงบน Backend PC3 ด้วย Pillow และรองรับระดับ low,
medium และ high
Contrast ประมวลผลโดยตรงบน Backend PC3 ด้วย OpenCV โดยแปลงภาพเป็น Grayscale
และใช้ Histogram Equalization เพื่อปรับ Contrast ของภาพ
นอกจากนี้ระบบ /ready ได้ถูกปรับให้สามารถตรวจสอบสถานะของแต่ละ Feature แยกกัน
ได้แก่:
Backend
Database
AI / Forge
Hismat
Remove Background
Blur
Contrast
โครงสร้าง Feature และ Route สำหรับ Contrast ถูกเพิ่มแล้ว รวมถึงการตรวจสอบ
Contrast ใน /ready
ปัจจุบันส่วนที่เหลือคือการทดสอบ /ready และ API ของแต่ละ Feature ผ่านการใช้งานจริง
เพื่อยืนยันการทำงานของระบบทั้งหมด