# 🌟 LUMA - AI Image Generation Platform (Frontend)

ส่วนนี้คือส่วนหน้าบ้าน (Frontend) ของระบบ LUMA ซึ่งเป็นแพลตฟอร์มสำหรับสร้างรูปภาพด้วย AI จากข้อความ (Text to Image) (ปัจจุบันอยู่ในสถานะ Prototype รอบแรก)

---

## 1. ส่วนนี้ทำอะไร

แสดงหน้าเว็บสำหรับให้ผู้ใช้โต้ตอบและใช้งานแพลตฟอร์ม LUMA ฟีเจอร์หลัก (Text to Image) โดยผู้ใช้สามารถ:
- กรอก Prompt / Negative Prompt
- เลือก AI Model
- กด Generate และรอรับรูปภาพจำลองแสดงบนหน้าจอ
- เช็กสถานะและทดสอบการเชื่อมต่อกับเส้นทาง (Routes) ของ Backend

---

## 2. ต้องลงอะไร

โปรเจกต์นี้พัฒนาด้วย Vanilla Web Technologies จึง**ไม่จำเป็นต้องติดตั้ง Node.js หรือ Database** สิ่งที่ใช้มีดังนี้:

- Web Browser (แนะนำ Google Chrome หรือ Microsoft Edge)
- HTML5, CSS3, JavaScript (Vanilla)
- Bootstrap 5.3.3 (ดึงผ่าน CDN)
- Bootstrap Icons (ดึงผ่าน CDN)
- **Nginx** (สำหรับรันเซิร์ฟเวอร์จำลองและทำ Reverse Proxy เชื่อมกับ Backend)

---

## 3. ติดตั้งและเปิดยังไง

ให้ทำการ Clone โปรเจกต์ลงมาที่เครื่องของคุณ จากนั้นสามารถเลือกวิธีเปิดหน้าเว็บได้ตามความเหมาะสม:

**วิธีที่ 1: เปิดผ่านไฟล์ HTML ธรรมดา (สำหรับทดสอบ UI เบื้องต้น)**
เข้าไปที่โฟลเดอร์โปรเจกต์แล้วดับเบิลคลิกเพื่อเปิดไฟล์หน้าหลัก: `index.html`

**วิธีที่ 2: ใช้ Local Server ด้วย Python**
เปิด Terminal นำทางไปยังโฟลเดอร์โปรเจกต์ แล้วรันคำสั่ง: `python -m http.server 8080`

**วิธีที่ 3: เปิดผ่าน Nginx (แนะนำสำหรับการรันร่วมกับ Backend จริง)**
นำไฟล์ทั้งหมดไปวางในโฟลเดอร์ `html` ของ Nginx จากนั้นรันตัว `nginx.exe` และเข้าใช้งานผ่าน `http://localhost` หรือ `http://[IP_เครื่องของคุณ]`

---

## 4. ทดสอบยังไง

1. **เปิดหน้าเว็บ:** หน้าเว็บต้องแสดงผลหน้า Text to Image อย่างถูกต้อง 
2. **ทดสอบช่อง Prompt:** ต้องสามารถพิมพ์ข้อความในช่อง Prompt ได้
3. **ทดสอบปุ่ม Generate:** 
   - เมื่อกดปุ่ม "Generate Image" ปุ่มจะต้องถูกล็อก (ห้ามกดซ้ำ)
   - หน้าจอจะขึ้นสถานะ Loading เป็นเวลา 3 วินาที
4. **แสดงรูปผลลัพธ์:** พื้นที่แสดง Result จะต้องโชว์รูปภาพขึ้นมาแทนที่สถานะ Loading

---

## 🚀 5. การตั้งค่า Nginx (Reverse Proxy) เพื่อเชื่อมต่อ Backend

เพื่อแก้ปัญหา CORS Error และให้เครื่องอื่นในวง LAN สามารถเข้ามาใช้งาน Frontend พร้อมยิง API ไปยัง Backend ได้ จำเป็นต้องตั้งค่า `nginx.conf` (ในโฟลเดอร์ `conf/`) ดังนี้:

```nginx
server {
    listen       80;
    server_name  _;  # ใช้ _ เพื่อรับทุก IP (ให้เครื่องอื่นเข้าถึงได้)

    # จัดการไฟล์ Frontend
    location / {
        root   html;
        index  index.html index.htm;
    }

    # ทำ Reverse Proxy ไปยัง Backend ครอบจักรวาลทุก Route
    location /api/ {
        # เปลี่ยน IP ด้านล่างให้ตรงกับเครื่อง Backend เสมอ
        proxy_pass [http://10.192.0.200:5000/](http://10.192.0.200:5000/); 
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}