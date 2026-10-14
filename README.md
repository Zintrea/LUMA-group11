# LUMA

AI Image Processing Project — Group 11

## สมาชิกกลุ่ม

1. นายสมเกียรติ เสนาพรม — 6710301017 — Backend
2. นายศิรวิทย์ รักแก้ว — 6710301018 — DataBase
3. นาย ธนฤทธิ์ คำวิเศษ — 6710301024 — Frontend
4. นายบุญญพัฒน์ กิตติชนม์ธวัช — 6710301033 — DevOps + AI

---

## 1. ภาพรวมระบบ

ระบบใช้คอมพิวเตอร์ Windows 4 เครื่อง ต่อกันในวง LAN เดียวกัน

| เครื่อง | หน้าที่ | โฟลเดอร์ | Port |
|---|---|---|---|
| PC1 | Frontend + Nginx (ผู้ใช้เข้าเว็บที่เครื่องนี้) | `frontend/` | 80 |
| PC2 | AI — Stable Diffusion Forge และ rembg | `ai/` | 7860, 7000 |
| PC3 | Backend — Flask API | `backend/` | 5000 |
| PC4 | Database — PostgreSQL | `database/` | 5432 |

```text
Browser → PC1 (Nginx) → /api/* → PC3 (Flask) → PC2 (Forge / rembg)
                                            → PC4 (PostgreSQL)
```

ผู้ใช้เข้าเว็บผ่าน PC1 เท่านั้น Frontend ไม่ได้ต่อ Database หรือ AI โดยตรง

---

## 2. ก่อนเริ่ม — จด IP ของทั้ง 4 เครื่อง

ที่แต่ละเครื่องเปิด Command Prompt แล้วพิมพ์ `ipconfig` จด IPv4 Address ไว้

```text
PC1 = ...
PC2 = ...
PC3 = ...
PC4 = ...
```

IP ที่เขียนไว้ใน README ย่อยของแต่ละส่วน (เช่น `10.192.x.x`) เป็น IP ของเครื่องกลุ่มเราตอนพัฒนา **ให้ใช้ IP ของเครื่องตัวเองแทนทุกที่**

---

## 3. ปัญหาที่เจอถ้าทำตาม README ย่อยตรง ๆ และวิธีแก้

### ปัญหา 1 — PC1: Nginx ยังชี้ไป IP Backend ของเครื่องเดิม

ไฟล์ `frontend/conf/nginx.conf` มีบรรทัดนี้

```nginx
proxy_pass http://10.192.0.180:5000/;
```

ถ้าไม่แก้ เว็บจะเปิดได้ แต่ Login / Generate / ทุกฟีเจอร์ที่เรียก API จะ error (502)

**วิธีแก้:** เปลี่ยนเป็น IP ของ PC3

```nginx
proxy_pass http://<PC3-IP>:5000/;
```

### ปัญหา 2 — PC1: Nginx อาจเปิดไม่ขึ้นเพราะไม่มีโฟลเดอร์ `temp`

Git ไม่เก็บโฟลเดอร์ว่าง ถ้า Nginx ขึ้น error ประมาณ `CreateDirectory() ... temp/client_body_temp failed`

**วิธีแก้:** สร้างโฟลเดอร์ `frontend/temp` เปล่า ๆ แล้วเปิด Nginx ใหม่

### ปัญหา 3 — PC3: ไม่มีตัวอย่างไฟล์ `.env`

Backend อ่านค่าจาก `backend/.env` ซึ่งไม่ได้อยู่ใน GitHub (ตั้งใจไม่ให้ขึ้น เพราะมีรหัสผ่าน)

ถ้าไม่มี `SECRET_KEY` จะ Login ไม่ได้ / ถ้าไม่มี `REMBG_URL` ฟีเจอร์ลบพื้นหลังจะพัง

**วิธีแก้:** สร้างไฟล์ `backend/.env` เอง ใส่ค่าตามนี้

```env
SECRET_KEY=ใส่ข้อความสุ่มยาว ๆ อะไรก็ได้

FORGE_URL=http://<PC2-IP>:7860
REMBG_URL=http://<PC2-IP>:7000

DATABASE_HOST=<PC4-IP>
DATABASE_PORT=5432
DATABASE_NAME=postgres
DATABASE_USER=postgres
DATABASE_PASSWORD=รหัสผ่าน PostgreSQL ของ PC4
```

หมายเหตุ: `backend/README.md` ยังมี path `C:\Ai gen\ProjectFN\...` และ IP เก่า ให้ใช้ path และ IP ของเครื่องตัวเองแทน

### ปัญหา 4 — PC4: README ของ database บอกชื่อไฟล์ผิด และขั้นตอนที่ 2 จะ error

- README บอกให้รัน `init (1).sql` → ไฟล์จริงชื่อ **`database/init.sql`**
- ขั้นตอนที่ 2 (`ALTER TABLE users ADD COLUMN role ..., is_active ...`) → **ไม่ต้องรัน** เพราะ `init.sql` มีสองคอลัมน์นี้อยู่แล้ว ถ้ารันจะขึ้น `column "role" already exists`

### ปัญหา 5 — PC4: เครื่องอื่นต่อ Database ไม่ได้

PostgreSQL ค่าเริ่มต้นรับเฉพาะการเชื่อมต่อจากเครื่องตัวเอง

**วิธีแก้:** ในโฟลเดอร์ data ของ PostgreSQL

1. `postgresql.conf` ตั้งค่า

   ```text
   listen_addresses = '*'
   ```

2. `pg_hba.conf` เพิ่มบรรทัดอนุญาต PC3

   ```text
   host    all    all    <PC3-IP>/32    scram-sha-256
   ```

3. Restart service PostgreSQL

### ปัญหา 6 — ไม่มีวิธีสร้างบัญชี Admin

ทุกคนที่สมัครผ่านหน้าเว็บจะเป็น `user` หน้า `/admin` ต้องใช้บัญชี `admin`

**วิธีแก้:** สมัครผ่านหน้าเว็บก่อน แล้วรัน SQL นี้ที่ PC4

```sql
UPDATE users SET role = 'admin' WHERE email = 'อีเมลที่สมัคร';
```

### ปัญหา 7 — PC2: Forge และโมเดลไม่ได้อยู่ใน GitHub

ไฟล์ Forge และโมเดลมีขนาดใหญ่ จึงไม่ได้อัปขึ้น Git

**วิธีแก้:** ทำตาม `ai/README.md`

- ติดตั้ง Stability Matrix + Stable Diffusion WebUI Forge - Neo
- นำไฟล์โมเดล `mormix_v10.safetensors` ไปใส่เอง (หรือใช้โมเดล SD อื่นแทนได้)
- ตั้ง Launch Arguments เป็น `--api --listen`
- เครื่องต้องมีการ์ดจอ (NVIDIA)

### ปัญหา 8 — PC2: rembg ต้องใช้ Python 3.11

สคริปต์ `ai/rembg/setup-rembg-cpu.bat` จะหยุดถ้า `python` ไม่ใช่ 3.11 (ส่วน Backend ใช้ Python 3.10)

รันครั้งแรกจะดาวน์โหลดโมเดล `u2net` จากอินเทอร์เน็ต เครื่องต้องต่อเน็ตได้

### ปัญหา 9 — Firewall บล็อกการเชื่อมต่อข้ามเครื่อง

ต้องเปิด Inbound port ใน Windows Firewall ของแต่ละเครื่อง

| เครื่อง | Port ที่ต้องเปิด |
|---|---|
| PC1 | 80 |
| PC2 | 7860, 7000 |
| PC3 | 5000 |
| PC4 | 5432 |

ตัวอย่างคำสั่ง (PowerShell แบบ Run as Administrator):

```powershell
New-NetFirewallRule -DisplayName "LUMA 5000" -Direction Inbound -Protocol TCP -LocalPort 5000 -Action Allow
```

### เรื่องเล็กที่ไม่ทำให้ระบบพัง

- เมนูประวัติ (History) ในหน้าเว็บยังไม่มี API ฝั่ง Backend จะขึ้นข้อความว่ารอเชื่อมต่อ
- `ai/README.md` บรรทัดแรก ๆ มีข้อความที่ก๊อปมาเกิน ข้ามไปอ่านจากหัวข้อ `# LUMA AI Setup` ได้เลย

---

## 4. วิธีติดตั้งและเปิดระบบ (เรียงตามลำดับ)

ทุกเครื่อง clone โปรเจกต์ก่อน

```powershell
git clone https://github.com/Zintrea/LUMA-group11.git
cd LUMA-group11
```

### ขั้นที่ 1 — PC4 Database

1. ติดตั้ง PostgreSQL
2. รันไฟล์ `database/init.sql` (ผ่าน pgAdmin หรือ `psql`)
3. แก้ `postgresql.conf` และ `pg_hba.conf` ตาม **ปัญหา 5**
4. เปิด Firewall port 5432

### ขั้นที่ 2 — PC2 AI

1. ติดตั้งและเปิด Forge ตาม `ai/README.md` (ใช้ `--api --listen`)
2. ทดสอบ: เปิด `http://127.0.0.1:7860/sdapi/v1/sd-models` ต้องได้รายการโมเดล
3. rembg (ต้องมี Python 3.11):

   ```text
   ai\rembg\setup-rembg-cpu.bat   ← ติดตั้ง (ครั้งแรกครั้งเดียว)
   ai\rembg\start-rembg-cpu.bat   ← เปิด service port 7000
   ai\rembg\verify-rembg.bat      ← ทดสอบ
   ```

4. เปิด Firewall port 7860 และ 7000

### ขั้นที่ 3 — PC3 Backend

ใช้ Python 3.10

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r backend\requirements.txt
```

สร้าง `backend\.env` ตาม **ปัญหา 3** แล้วเปิด Backend

```powershell
cd backend
python app.py
```

ทดสอบ (เปิดอีกหน้าต่าง):

```powershell
curl.exe http://localhost:5000/ready
```

ต้องได้ `"status": "ready"` ถ้าได้ `not_ready` ให้ดูว่าช่องไหนเป็น `error` (`ai`, `database`, `remove_bg`) แล้วเช็ค IP / Firewall ของเครื่องนั้น

เปิด Firewall port 5000

### ขั้นที่ 4 — PC1 Frontend

1. แก้ `frontend\conf\nginx.conf` ตาม **ปัญหา 1**
2. เปิด Nginx

   ```powershell
   cd frontend
   .\nginx.exe
   ```

   ถ้าเปิดไม่ขึ้น ดู **ปัญหา 2**

3. ทดสอบ: เปิด `http://localhost/api/health` ต้องได้ `{"status": "ok"}`
4. เปิด Firewall port 80

ปิด Nginx: `.\nginx.exe -s stop`  
โหลด config ใหม่หลังแก้ไฟล์: `.\nginx.exe -s reload`

---

## 5. วิธีใช้งาน

เปิด Browser จากเครื่องไหนก็ได้ในวง LAN แล้วเข้า `http://<PC1-IP>/`

| หน้า | URL |
|---|---|
| หน้าแรก | `http://<PC1-IP>/` |
| สมัคร / Login | `http://<PC1-IP>/auth/login` |
| หน้าใช้งานฟีเจอร์ | `http://<PC1-IP>/generate` |
| หน้า Admin | `http://<PC1-IP>/admin` (ต้องเป็น admin ดู **ปัญหา 6**) |

ขั้นตอน

1. สมัครสมาชิกแล้ว Login
2. ไปหน้า `/generate` เลือกฟีเจอร์ที่ต้องการ

| ฟีเจอร์ | ใส่อะไร | ทำงานที่ |
|---|---|---|
| Prompt Engineering (สร้างภาพ) | พิมพ์ prompt | PC2 Forge |
| Histogram Matching | รูปต้นฉบับ + รูปอ้างอิงสี | PC3 |
| Basic Image Blur | รูป + ระดับความเบลอ (low / medium / high) | PC3 |
| Background Removal | รูป | PC2 rembg |
| Grayscale Equalizer | รูป | ในเบราว์เซอร์ |

3. กดปุ่มประมวลผล รอผลแล้วดาวน์โหลดรูปได้

---

## 6. เช็คเร็ว ๆ เมื่อมีปัญหา

| อาการ | น่าจะเป็นที่ |
|---|---|
| เว็บเปิดไม่ได้เลย | Nginx ยังไม่เปิด หรือ Firewall PC1 port 80 |
| เว็บเปิดได้ แต่ Login / ทุกปุ่ม error 502 | IP ใน `nginx.conf` ผิด หรือ Backend PC3 ยังไม่เปิด |
| Login ไม่ได้ | ไม่มี `SECRET_KEY` ใน `.env` หรือ Database ต่อไม่ได้ |
| `/ready` บอก `database: error` | IP / รหัสผ่านใน `.env`, `pg_hba.conf`, Firewall PC4 |
| `/ready` บอก `ai: error` | Forge ยังไม่เปิด, ไม่ได้ใส่ `--api --listen`, Firewall PC2 |
| ลบพื้นหลังไม่ได้ | rembg ยังไม่เปิด หรือ `REMBG_URL` ใน `.env` ผิด |

README ย่อยของแต่ละส่วน: `frontend/html/README.md`, `backend/README.md`, `ai/README.md`, `database/README.md`
