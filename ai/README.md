# AI

ส่วนนี้เป็นงาน AI ของโปรเจกต์ LUMA

README นี้เป็นตัวอย่างสำหรับบันทึกวิธีใช้งานของส่วนนี้
ให้แก้ข้อมูลให้ตรงกับงานจริงเมื่อเริ่มพัฒนา

## 1. ส่วนนี้ทำอะไร

ตัวอย่าง:

ประมวลผลภาพด้วย AI เช่น

- Text-to-Image
- Upscale
- Inpainting

ในช่วงแรกให้ทำเพียง Feature ที่จำเป็นสำหรับ Minimum Demo ก่อน

## 2. ต้องลงอะไร

ตัวอย่าง:

- Stable Diffusion WebUI Forge
- AI Model ที่ใช้งานจริง
- Python ตาม Version ที่ Forge ต้องการ

ห้ามนำ Model ขนาดใหญ่เข้า Git Repository

## 3. เปิดยังไง

ตัวอย่าง:

เปิด Stable Diffusion WebUI Forge พร้อม API

ตัวอย่างคำสั่ง:

```text
run.bat --api
```

หรือให้แก้เป็นคำสั่งจริงตาม Version ที่ใช้งาน

ตัวอย่าง Address:

```text
localhost
```

## 4. ทดสอบ

ตัวอย่าง:

1. เปิด Forge
2. ส่ง Prompt ทดสอบ
3. Generate รูป
4. ต้องได้รูปผลลัพธ์กลับมา

ถ้าสร้างรูปได้ ถือว่า AI พร้อมสำหรับเชื่อมกับ Backend

---

เมื่อเริ่มพัฒนาจริง ให้แก้ README นี้ให้ตรงกับ Model, Version, วิธีเปิด และวิธีทดสอบของจริง
