# LUMA F5 — Basic Image Blur Logbook

## วัตถุประสงค์

บันทึกการทำงาน Feature **Basic Image Blur** เพื่อให้ตั้งเครื่องใหม่ ตรวจปัญหา และทดสอบ integration ได้โดยไม่ต้องเดา

- ประมวลผลที่ **PC3 Flask Backend**
- Frontend เรียกผ่าน PC1 Nginx ด้วย `/api/blur`
- ใช้ Pillow Gaussian Blur
- ไม่ใช้ PC2, Forge, rembg, GPU, Database หรือ AI model

---

## Architecture

```text
Phone
  ↓
PC1: Frontend + Nginx
  ↓ POST /api/blur
PC3: Flask Backend
  ↓ Pillow ImageFilter.GaussianBlur
PC3: ส่ง image/png กลับ
  ↓
PC1 / Phone
```

### เหตุผลที่อยู่ PC3

Blur เป็น deterministic image processing ที่ทำงานกับไฟล์ภาพเพียงไฟล์เดียว จึงไม่จำเป็นต้องเปิด service ใหม่บน PC2 และไม่ควรแย่ง GPU/VRAM กับ Forge

---

## Implementation Record

### วันที่ 4 ตุลาคม 2026 — Backend Blur

เพิ่ม:

```text
backend/blur.py
backend/tests/test_blur.py
```

แก้:

```text
backend/routes.py
```

ฟังก์ชันหลัก:

```python
ImageFilter.GaussianBlur(radius=radius)
```

Mapping ที่ล็อกไว้:

```text
low    = radius 3
medium = radius 8
high   = radius 16
```

Route ที่เพิ่ม:

```text
POST /blur
```

เมื่อผ่าน Nginx จาก PC1 จะเรียกเป็น:

```text
POST /api/blur
```

### วันที่ 4 ตุลาคม 2026 — Frontend Caller

Frontend มีหน้าที่เพียง:

```text
1. เลือกรูป
2. เลือก low / medium / high
3. ส่ง FormData(image, strength)
4. รับ image/png
5. แสดง Preview และ Download
```

Frontend ต้องเรียก relative path เท่านั้น:

```javascript
fetch('/api/blur', { method: 'POST', body: formData })
```

ห้ามใช้:

```text
http://<PC3-IP>:5000/blur
```

เพราะ Phone ต้องเข้าระบบผ่าน PC1 เพียงจุดเดียว

---

## Backend API Details

### Request

```text
POST /api/blur
Content-Type: multipart/form-data

image=<uploaded image>
strength=low|medium|high
```

### Response เมื่อสำเร็จ

```text
HTTP 200
Content-Type: image/png
Content-Disposition: attachment; filename=blur.png
```

### Response เมื่อผิดพลาด

```text
400: image is required
400: strength must be low, medium, or high
415: cannot process image
```

---

## Setup ใหม่บน PC3

### 1. ไปที่ Project Root

```powershell
cd "<LUMA-project-root>"
```

### 2. เปิด virtual environment

```powershell
.\.venv\Scripts\Activate.ps1
```

### 3. ติดตั้ง dependencies ของ Backend

```powershell
pip install -r backend\requirements.txt
```

`Pillow` ต้องติดตั้งได้ เพราะ Blur ใช้ `PIL.ImageFilter`

### 4. เปิด Flask Backend

```powershell
python backend\app.py
```

### 5. ทดสอบด้วยไฟล์จริง

```powershell
curl.exe -X POST http://127.0.0.1:5000/blur `
  -F "image=@sample.png" `
  -F "strength=medium" `
  --output blur.png
```

### 6. ทดสอบผ่านระบบจริง

```text
Phone → PC1 Nginx → /api/blur → PC3 → Phone
```

---

## Automated Test Evidence

Backend tests:

```powershell
python -m unittest discover -s backend/tests -v
```

Acceptance checks ที่ครอบคลุม:

```text
- blur เปลี่ยนภาพ high-contrast ได้
- ขนาดและ mode ของภาพยังคงถูกต้อง
- ไม่ส่ง image ได้ 400
- strength ผิดได้ 400
- upload ถูกต้องได้ 200 image/png
```

Frontend contract tests:

```powershell
python -m unittest discover -s frontend/tests -v
```

ตรวจว่า Frontend มี upload, strength, และเรียก `/api/blur`

Syntax checks:

```powershell
python -m py_compile backend/blur.py backend/routes.py
node --check frontend/js/script.js
```

> เลือก JavaScript path ให้ตรงกับ branch ที่ deploy จริง หาก branch นั้นใช้ `frontend/html/js/script.js` ให้ตรวจ path นั้นแทน

---

## Troubleshooting

### 1. ได้ 404 Not Found

ตรวจว่า Flask ที่ PC3 pull commit ที่มี route `/blur` แล้ว และเปิด Backend ใหม่หลัง pull

```powershell
git log -1 --oneline
python backend\app.py
```

### 2. ได้ 405 Method Not Allowed

Endpoint รองรับเฉพาะ `POST` ห้ามเปิด `/api/blur` ใน Browser เพื่อทดสอบ เพราะ Browser ส่ง `GET`

### 3. ได้ 400 image is required

ตรวจ field name ต้องเป็น:

```text
image
```

ไม่ใช่ `file`, `source_image` หรือชื่ออื่น

### 4. ได้ 400 strength must be low, medium, or high

Frontend หรือ Postman ต้องส่งหนึ่งใน:

```text
low
medium
high
```

### 5. ได้ 415 cannot process image

ไฟล์ที่ส่งไม่ใช่รูป หรือ Pillow เปิดไฟล์นั้นไม่ได้ ให้ลอง PNG/JPEG ปกติก่อน

### 6. Phone เรียกไม่ได้ แต่ PC3 ทดสอบ local ผ่าน

ตรวจตามลำดับ:

```text
1. PC1 Nginx ยัง proxy /api/* → PC3 ถูกต้อง
2. PC3 Firewall เปิด port Flask ตามระบบเดิม
3. PC1 และ PC3 ใช้ devops commit เดียวกัน
4. Frontend เรียก /api/blur ไม่ใช่ IP โดยตรง
```

---

## Scope ที่ตั้งใจไม่ทำ

```text
- AI blur
- GPU blur
- Face blur
- Selective blur / brush blur
- Background-only blur
- Custom radius slider
- Image history / permanent file storage
```

Feature นี้ต้องคงความง่าย: **อัปโหลดรูป → เลือกระดับ → เบลอทั้งภาพ → รับ PNG**
