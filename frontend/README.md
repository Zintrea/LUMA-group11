# 🌟 LUMA - AI Image Generation Platform (Frontend)

ส่วนนี้คือส่วนหน้าบ้าน (Frontend) ของระบบ LUMA ซึ่งเป็นแพลตฟอร์มสำหรับสร้างและจัดการรูปภาพด้วย AI (ปัจจุบันอยู่ในสถานะ Prototype รอบแรก)

---

## 1. ส่วนนี้ทำอะไร

แสดงหน้าเว็บสำหรับให้ผู้ใช้โต้ตอบและใช้งานแพลตฟอร์ม LUMA โดยครอบคลุม 4 ฟีเจอร์หลัก (Must-have) ได้แก่:

- **Text to Image (F1):** หน้าจอหลักสำหรับกรอก Prompt, กด Generate และแสดงรูปผลลัพธ์
- **Remove Background (F2):** อัปโหลดรูปภาพเพื่อลบพื้นหลัง
- **Upscale Image (F3):** อัปโหลดภาพและเลือกขนาด (2x, 4x, 8x) เพื่อเพิ่มความละเอียด
- **Inpaint & Repair (F4):** ระบบ Canvas Workspace สำหรับวาด Mask ระบายสีขาวลงบนจุดที่ต้องการแก้ไข และ Export ไฟล์รูปขาว-ดำได้

---

## 2. ต้องลงอะไร

โปรเจกต์นี้พัฒนาด้วย Vanilla Web Technologies จึง**ไม่จำเป็นต้องติดตั้ง Node.js หรือ Database** สิ่งที่ใช้มีดังนี้:

**พื้นฐาน (Core):**
- Web Browser (แนะนำ Google Chrome หรือ Microsoft Edge)
- HTML5
- CSS3
- JavaScript (Vanilla)

**Library & Framework (ดึงผ่าน CDN ไม่ต้องติดตั้งลงเครื่อง):**
- Bootstrap 5.3.3 (สำหรับจัดการ Layout และ UI)
- Bootstrap Icons (สำหรับไอคอนต่างๆ ในระบบ)

**เครื่องมือสำหรับนักพัฒนา (Optional แต่แนะนำ):**
- Text Editor: VS Code
- Extension: `Live Server` (หากต้องการจำลองเซิร์ฟเวอร์แบบง่ายๆ)
- หรือ Python (หากต้องการใช้ Local Server แบบพิมพ์คำสั่ง)

---

## 3. ติดตั้งและเปิดยังไง

ให้ทำการ Clone โปรเจกต์ลงมาที่เครื่องของคุณ จากนั้นสามารถเลือกวิธีเปิดหน้าเว็บได้ 3 วิธีตามความสะดวก:

**วิธีที่ 1: เปิดผ่านไฟล์ HTML ธรรมดา (ง่ายที่สุด)**
เข้าไปที่โฟลเดอร์โปรเจกต์ `luma_frontend` แล้วดับเบิลคลิกเพื่อเปิดไฟล์หน้าหลัก:
```text
txt2img.html
```

**วิธีที่ 2: ใช้ Local Server ด้วย Python**
เปิด Terminal หรือ Command Prompt นำทางไปยังโฟลเดอร์โปรเจกต์ `luma_frontend` แล้วรันคำสั่ง:
```bash
python -m http.server 8080
```
จากนั้นเปิด Web Browser แล้วเข้าไปที่:
```text
http://localhost:8080/txt2img.html
```

**วิธีที่ 3: เปิดผ่าน VS Code (Live Server)**
1. เปิดโฟลเดอร์โปรเจกต์ใน VS Code
2. คลิกขวาที่ไฟล์ `txt2img.html`
3. เลือก **"Open with Live Server"**

---

## 4. ทดสอบยังไง

เพื่อยืนยันว่าส่วน Frontend พร้อมสำหรับนำไปเชื่อมกับ Backend ให้ทดสอบตามขั้นตอนนี้:

1. **เปิดหน้าเว็บ:** เมื่อเปิด `txt2img.html` หน้าเว็บต้องแสดงผลหน้า **Text to Image** อย่างถูกต้อง โครงสร้างไม่เพี้ยน และสลับเมนู F1-F4 ด้านบนได้
2. **ทดสอบช่อง Prompt:** ที่เมนูด้านซ้าย ต้องสามารถพิมพ์ข้อความในช่อง Prompt และ Negative Prompt รวมถึงเลือก AI Model ได้
3. **ทดสอบปุ่ม Generate:** 
   - เมื่อกดปุ่ม **"Generate Image"** ปุ่มจะต้องถูกล็อก (ห้ามกดซ้ำ)
   - หน้าจอจะขึ้นสถานะ Loading (วงกลมหมุน) เป็นเวลาประมาณ 3 วินาที (จำลองการรอ API)
4. **แสดงรูปผลลัพธ์:** เมื่อครบเวลา พื้นที่แสดง Result ด้านขวาจะต้องโชว์รูปภาพจำลองขึ้นมาแทนที่สถานะ Loading

*(หมายเหตุ: ในรอบแรกนี้ เป็นการจำลอง Mock API ทั้งหมด หากระบบ UI ลื่นไหลตามขั้นตอนด้านบน ถือว่าส่วน Frontend ทำงานสมบูรณ์พร้อมส่งต่อ)*

---

## 📁 โครงสร้างโปรเจกต์ (Project Structure)

```text
luma_frontend/
├── assets/          # โฟลเดอร์สำหรับเก็บไฟล์รูปภาพ และฟอนต์
├── css/             
│   └── style.css    # ไฟล์ CSS หลักคุม Layout และ Theme ทั้งหมด
├── js/              
│   ├── txt2img.js   # ลอจิกการส่ง Prompt และจำลองรับรูปภาพ (F1)
│   ├── rembg.js     # ลอจิกจำลองการลบพื้นหลัง (F2)
│   ├── upscale.js   # ลอจิกจำลองการเพิ่มความละเอียด (F3)
│   └── inpaint.js   # ลอจิกควบคุมกระดานวาดรูป Canvas และ Export (F4)
├── README.md        # คู่มือการใช้งาน (ไฟล์นี้)
├── txt2img.html     # หน้าหลักของเว็บ (F1: Text to Image)
├── rembg.html       # หน้า F2: Remove Background
├── upscale.html     # หน้า F3: Upscale Image
└── inpaint.html     # หน้า F4: Inpaint & Repair
```