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
ใช้ Pillow ในการทำ Gaussian Blur:
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
และต่อมาเพิ่ม:
Contrast
โครงสร้างใหม่:
/ready
│
├── Backend
├── Database
├── AI / Forge
├── Hismat
├── Remove Background
├── Blur
└── Contrast
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
และเพิ่ม Contrast:
contrast_status = check_contrast()
เพิ่มทุก Feature เข้า all_ready:
all_ready = (
    backend_status == "ok"
    and ai_result["status"] == "ok"
    and database_result["status"] == "ok"
    and hismat_status == "ok"
    and remove_bg_status == "ok"
    and blur_status == "ok"
    and contrast_status == "ok"
)
Response ของ /ready เพิ่ม:
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
หาก Feature ใดไม่พร้อม ระบบจะตอบ:
status = not_ready
และแสดงสถานะของแต่ละส่วนแยกกัน
15. เพิ่มฟีเจอร์ Contrast / Grayscale
เพิ่มฟีเจอร์สำหรับประมวลผลภาพโดยแปลงภาพสีเป็น Grayscale และปรับ Contrast ด้วย Histogram Equalization
สร้างไฟล์ใหม่:
backend/contrast.py
โครงสร้าง:
backend/
├── app.py
├── routes.py
├── blur.py
├── contrast.py
├── hismat.py
└── .env
โค้ดใน contrast.py:
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
     ↓
BGR → Grayscale
     ↓
Histogram Equalization
     ↓
Contrast Image
การประมวลผล Contrast ทำโดยตรงบนเครื่อง Backend ไม่ต้องส่งภาพไปยัง Service เครื่องอื่น
16. เพิ่ม Contrast Route
เพิ่ม Endpoint:
POST /contrast
รับไฟล์:
image
การทำงาน:
Frontend
   ↓
POST /contrast
   ↓
Backend
   ↓
อ่าน Image
   ↓
process_grayscale_image()
   ↓
Grayscale
   ↓
Histogram Equalization
   ↓
PNG
   ↓
Frontend
เพิ่ม Import ใน routes.py:
from contrast import process_grayscale_image
ผลลัพธ์ส่งกลับเป็น:
image/png
ชื่อไฟล์:
contrast.png
17. ติดตั้งและตรวจสอบ OpenCV
Contrast ใช้ OpenCV และ NumPy
Package ที่เกี่ยวข้อง:
opencv-python
numpy
ติดตั้ง OpenCV ใน Virtual Environment:
..\venv\Scripts\python.exe -m pip install opencv-python
ตรวจสอบ OpenCV:
..\venv\Scripts\python.exe -c "import cv2; print(cv2.__version__)"
ในระหว่างการเพิ่ม Contrast พบว่า Python ที่ใช้รัน Backend ต้องเป็น Python จาก Virtual Environment เพื่อให้สามารถเรียกใช้ Package ที่ติดตั้งไว้ได้
คำสั่งที่ใช้:
..\venv\Scripts\python.exe app.py
18. เพิ่ม Contrast Health Check
เพิ่มฟังก์ชันสำหรับตรวจสอบสถานะ Contrast:
def check_contrast():
    try:
        if callable(process_grayscale_image):
            return "ok"
        return "error"
    except Exception:
        return "error"
หน้าที่ของฟังก์ชันนี้คือ ตรวจสอบว่า process_grayscale_image พร้อมใช้งานหรือไม่
การตรวจสอบนี้ไม่ได้ประมวลผลรูปภาพจริง
19. ปรับปรุง /ready เพิ่ม Contrast
จากเดิม /ready ตรวจสอบ:
Backend
Database
AI / Forge
Hismat
Remove Background
Blur
ปรับเป็น:
/ready
│
├── Backend
├── Database
├── AI / Forge
├── Hismat
├── Remove Background
├── Blur
└── Contrast
เพิ่มการเรียก:
contrast_status = check_contrast()
และเพิ่ม Contrast ใน all_ready:
all_ready = (
    backend_status == "ok"
    and ai_result["status"] == "ok"
    and database_result["status"] == "ok"
    and hismat_status == "ok"
    and remove_bg_status == "ok"
    and blur_status == "ok"
    and contrast_status == "ok"
)
Response ใหม่ของ /ready:
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
20. Syntax Check
หลังแก้ไข routes.py มีการตรวจสอบ Syntax ด้วย:
..\venv\Scripts\python.exe -m py_compile routes.py
ตรวจสอบ contrast.py:
..\venv\Scripts\python.exe -m py_compile contrast.py
หากไม่มี Error แสดงว่าไฟล์ผ่าน Syntax Check
21. ทดสอบ /ready
มีการทดสอบ:
curl.exe http://localhost:5000/ready
หาก Flask Backend ไม่ได้เปิดรับ Connection จะได้รับ:
curl: (7) Failed to connect to localhost:5000
Could not connect to server
สาเหตุคือในช่วงเวลาที่ทดสอบ Flask Backend ไม่ได้เปิดรับ Connection ที่:
localhost:5000
การทดสอบที่ถูกต้องต้องเปิด Backend ก่อน:
..\venv\Scripts\python.exe app.py
จากนั้นจึงเรียก:
curl.exe http://localhost:5000/ready
รายการที่ต้องตรวจสอบ:
backend
ai
database
hismat
remove_bg
blur
contrast
22. ทดสอบ Contrast
หลังจากเปิด Backend:
..\venv\Scripts\python.exe app.py
ทดสอบ API:
POST /contrast
โดยส่ง:
image
ตรวจสอบผลลัพธ์ว่า Backend ส่งกลับ:
image/png
ชื่อไฟล์:
contrast.png
และตรวจสอบว่าภาพมีการ:
Grayscale
Histogram Equalization
23. สรุปสถานะงานวันที่ 04/10/2569
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
Contrast Function	✅
contrast.py	✅
Contrast Route	✅
Contrast Readiness Check	✅
ปรับ /ready	✅
Syntax Check routes.py	✅
Syntax Check contrast.py	✅
ทดสอบ /ready จริง	🔄 รอเปิด Backend และทดสอบ
ทดสอบ Remove Background Route จริง	🔄
ทดสอบ Blur Route จริง	🔄
ทดสอบ Contrast Route จริง	🔄


24. งานที่ต้องทำต่อ
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
contrast
4. ทดสอบ:
POST /remove-background
5. ตรวจสอบ image_tasks
6. ทดสอบ:
POST /blur
7. ทดสอบ Blur:
low
medium
high
8. ทดสอบ:
POST /contrast
9. ตรวจสอบผลลัพธ์ Contrast:
Grayscale
Histogram Equalization
PNG Response
10. ทดสอบการเชื่อมต่อ Feature ทั้งหมดจาก Frontend
สรุปประจำวัน
วันที่ 04/10/2569 ได้ดำเนินการต่อยอด Backend-AI โดยเพิ่มระบบ Remove Background ที่เชื่อมต่อกับ Service บน PC2, เพิ่มฟีเจอร์ Blur ที่ประมวลผลบน Backend โดยใช้ blur.py และเพิ่มฟีเจอร์ Contrast / Grayscale ที่ประมวลผลด้วย OpenCV และ Histogram Equalization
นอกจากนี้ได้เพิ่มการตรวจสอบ Hismat, Remove Background, Blur และ Contrast เข้าไปใน /ready เพื่อให้สามารถตรวจสอบสถานะของแต่ละ Feature แยกกันได้
ในส่วนของ Contrast ได้สร้าง contrast.py, เพิ่ม POST /contrast, เพิ่ม check_contrast() และเพิ่ม Contrast เข้าเงื่อนไข all_ready ของ /ready
นอกจากนี้ได้ตรวจสอบ Syntax ของ routes.py และ contrast.py รวมถึงแก้ปัญหาการใช้ Python ผิด Environment ที่ทำให้ไม่พบ Package เช่น PIL และ OpenCV
โครงสร้างฟีเจอร์และ Readiness Check ถูกเพิ่มเรียบร้อยแล้ว ส่วนที่ยังเหลือคือการทดสอบ /ready, Remove Background, Blur และ Contrast ผ่านการใช้งานจริง และทดสอบการเชื่อมต่อ Feature ทั้งหมดจาก Frontend