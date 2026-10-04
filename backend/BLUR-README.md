# LUMA F5 — Basic Image Blur

คู่มือใช้งานแบบสั้นสำหรับ Feature เบลอภาพบน **PC3 Flask Backend**

> Feature นี้ใช้ Gaussian Blur ผ่าน Pillow เป็น Image Processing ปกติ ไม่ใช้ AI model, Forge, rembg หรือ GPU

## หน้าที่ของ Feature

```text
Frontend / Phone
→ PC1 Nginx
→ PC3 Flask Backend
→ Pillow Gaussian Blur
→ image/png
→ Frontend / Phone
```

PC2 ไม่เกี่ยวกับ Feature นี้ค่ะ

## API Contract

```text
POST /api/blur
Content-Type: multipart/form-data

Fields
- image: ไฟล์ภาพ (required)
- strength: low | medium | high (optional; default = medium)

Success
- HTTP 200
- Content-Type: image/png
- Download filename: blur.png
```

## ระดับความเบลอ

| strength | Gaussian radius | ความหมาย |
|---|---:|---|
| `low` | 3 | เบลอเล็กน้อย |
| `medium` | 8 | เบลอระดับมาตรฐาน |
| `high` | 16 | เบลอชัดเจน |

## ไฟล์ที่เกี่ยวข้อง

```text
backend/blur.py
  ฟังก์ชัน blur_image() และค่าระดับ BLUR_RADII

backend/routes.py
  Route POST /blur

frontend/index.html / frontend/html/index.html
  UI อัปโหลดภาพและเลือกระดับความเบลอ

frontend/js/script.js / frontend/html/js/script.js
  ส่ง FormData ไปยัง /api/blur และแสดงผลลัพธ์
```

> ให้ใช้ path Frontend ที่มีอยู่ใน branch/commit ที่ deploy จริง ห้าม Frontend hardcode IP ของ PC3

## การเปิด Backend บน PC3

จาก project root:

```powershell
.\.venv\Scripts\Activate.ps1
python backend\app.py
```

ตรวจว่า Backend เปิดที่ port 5000 ตามการตั้งค่าโปรเจกต์แล้ว จึงเรียกผ่าน PC1 Nginx ด้วย `/api/blur`

## ทดสอบ API โดยตรงบน PC3

สร้าง/เตรียมไฟล์รูป เช่น `sample.png` แล้วใช้ PowerShell:

```powershell
curl.exe -X POST http://127.0.0.1:5000/blur `
  -F "image=@sample.png" `
  -F "strength=medium" `
  --output blur.png
```

ผลลัพธ์ที่ถูกต้อง:

```text
- ได้ HTTP 200
- ได้ไฟล์ blur.png
- เปิดไฟล์แล้วเห็นว่าภาพเบลอกว่าต้นฉบับ
```

## Error ที่คาดไว้

| กรณี | HTTP | Response message |
|---|---:|---|
| ไม่ส่ง `image` | 400 | `image is required` |
| strength ไม่ใช่ `low`, `medium`, `high` | 400 | `strength must be low, medium, or high` |
| ไฟล์ไม่ใช่รูป/อ่านรูปไม่ได้ | 415 | `cannot process image` |

## ตรวจสอบก่อน Merge หรือ Deploy

```powershell
python -m unittest discover -s backend/tests -v
python -m py_compile backend/blur.py backend/routes.py
```

Frontend ต้องตรวจว่า request เป็น:

```javascript
fetch('/api/blur', {
  method: 'POST',
  body: formData
})
```

## ข้อจำกัด

- เบลอทั้งภาพ ไม่ได้เลือกเบลอเฉพาะจุด
- ไม่มี face detection หรือ selective blur
- ไม่มี slider ปรับ radius แบบอิสระ
- ผลลัพธ์ถูกคืนเป็น PNG แต่ระบบยังไม่บันทึกภาพถาวร
