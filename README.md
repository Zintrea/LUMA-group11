# LUMA

AI Image Processing Project — Group 11

## สมาชิกกลุ่ม

1. นายสมเกียรติ เสนาพรม — 6710301017 — Backend
2. นายศิรวิทย์ รักแก้ว — 6710301018 — DataBase
3. นาย ธนฤทธิ์ คำวิเศษ — 6710301024 — Frontend
4. นายบุญญพัฒน์ กิตติชนม์ธวัช — 6710301033 — DevOps + AI

---

> **หมายเหตุเกี่ยวกับเอกสารนี้**
> คู่มือการรันในหน้านี้ (ตั้งแต่หัวข้อ "คู่มือการติดตั้งและรัน" ลงไป) จัดทำโดย AI (Claude) ซึ่งใช้ตรวจสอบโปรเจกต์ซ้ำทั้ง repo เมื่อวันที่ 14 ตุลาคม 2569
> ส่วนเอกสารอื่นทั้งหมด ได้แก่ README ย่อยและ LOGBOOK ในแต่ละโฟลเดอร์ ฝ่าย DevOps ได้ให้สมาชิกในทีมช่วยกันจัดทำเตรียมไว้ตั้งแต่เดือนสิงหาคม เพื่อให้โปรเจกต์นี้ portable คือย้ายไปติดตั้งและรันบนเครื่องอื่นได้
> หากข้อมูลในหน้านี้ขัดกับ README ย่อย ให้ยึดหน้านี้เป็นหลัก (ดูหัวข้อ [10. จุดที่ README ย่อยไม่ตรงกับโค้ดปัจจุบัน](#10-จุดที่-readme-ย่อยไม่ตรงกับโค้ดปัจจุบัน))

---

# คู่มือการติดตั้งและรัน

## สารบัญ

1. [LUMA ทำอะไรได้บ้าง](#1-luma-ทำอะไรได้บ้าง)
2. [สถาปัตยกรรมระบบ](#2-สถาปัตยกรรมระบบ)
3. [เลือกรูปแบบการรัน](#3-เลือกรูปแบบการรัน)
4. [สิ่งที่ต้องติดตั้งก่อน](#4-สิ่งที่ต้องติดตั้งก่อน)
5. [Clone โปรเจกต์](#5-clone-โปรเจกต์)
6. [ติดตั้งทีละส่วน](#6-ติดตั้งทีละส่วน)
7. [ลำดับการเปิดระบบและการตรวจสอบ](#7-ลำดับการเปิดระบบและการตรวจสอบ)
8. [การใช้งานเว็บ](#8-การใช้งานเว็บ)
9. [แก้ปัญหาที่พบบ่อย](#9-แก้ปัญหาที่พบบ่อย)
10. [จุดที่ README ย่อยไม่ตรงกับโค้ดปัจจุบัน](#10-จุดที่-readme-ย่อยไม่ตรงกับโค้ดปัจจุบัน)
11. [โครงสร้าง Repository](#11-โครงสร้าง-repository)

---

## 1. LUMA ทำอะไรได้บ้าง

LUMA เป็นเว็บแอปประมวลผลภาพ ผู้ใช้สมัครสมาชิกและ login แล้วใช้งานได้ดังนี้

| ฟีเจอร์ | ทำงานที่ | Backend endpoint |
| --- | --- | --- |
| สร้างภาพจาก Prompt (Text-to-Image) โมเดล `realistic` / `anime` | Stable Diffusion WebUI Forge | `POST /generate` |
| ลบพื้นหลังภาพ (Remove Background) | rembg | `POST /remove-background` |
| Histogram Matching | OpenCV ใน Backend | `POST /hismat` |
| Blur | Pillow ใน Backend | `POST /blur` |
| หน้า Admin (ดูผู้ใช้ ประวัติการสร้างภาพ สถานะ AI) | Backend + Database | `/admin/...` |

---

## 2. สถาปัตยกรรมระบบ

ระบบแบ่งเป็น 4 ส่วน ออกแบบให้แต่ละส่วนอยู่คนละเครื่องใน LAN และไม่ใช้ Docker

```text
Browser / มือถือ
      │  http://<PC1>/
      ▼
PC1  Nginx + Frontend (HTML, Bootstrap 5, Vanilla JS)      พอร์ต 80
      │  /api/*  → reverse proxy
      ▼
PC3  Backend (Flask)                                         พอร์ต 5000
      ├──► PC4  PostgreSQL                                   พอร์ต 5432
      ├──► PC2  Stable Diffusion WebUI Forge (API)          พอร์ต 7860
      └──► PC2  rembg (Remove Background, CPU)               พอร์ต 7000
```

- ผู้ใช้เข้าเว็บผ่าน PC1 เท่านั้น Frontend เรียก `/api/...` แบบ relative path จึงไม่มี IP ของ Backend อยู่ในโค้ด Frontend
- Nginx ตัด `/api` ออกก่อนส่งต่อ เช่น `/api/health` → Backend `/health`
- Backend เป็นตัวกลางเพียงตัวเดียวที่คุยกับ Database, Forge และ rembg

---

## 3. เลือกรูปแบบการรัน

รันได้ 2 แบบ **โค้ดเหมือนกันทุกอย่าง ต่างกันแค่ค่า IP ใน 2 ไฟล์** คือ `frontend/conf/nginx.conf` และ `backend/.env`

| | แบบ A: เครื่องเดียว | แบบ B: 4 เครื่องใน LAN |
| --- | --- | --- |
| เหมาะกับ | ตรวจงาน / ทดลองรัน | สถาปัตยกรรมจริงของโปรเจกต์ |
| IP ที่ใส่ทุกจุด | `127.0.0.1` | IP จริงของแต่ละเครื่อง |
| ต้องตั้ง Firewall / pg_hba.conf | ไม่ต้อง | ต้อง (หัวข้อ 6.6) |

ในคู่มือนี้จะเขียน IP เป็นตัวแปร ให้แทนค่าตามแบบที่เลือก

| ตัวแปร | แบบ A | แบบ B |
| --- | --- | --- |
| `<PC1-IP>` Nginx | `127.0.0.1` | IP ของเครื่อง Frontend |
| `<PC2-IP>` Forge + rembg | `127.0.0.1` | IP ของเครื่อง AI |
| `<PC3-IP>` Backend | `127.0.0.1` | IP ของเครื่อง Backend |
| `<PC4-IP>` PostgreSQL | `127.0.0.1` | IP ของเครื่อง Database |

ดู IP ของแต่ละเครื่องด้วยคำสั่ง `ipconfig` แล้วดูบรรทัด `IPv4 Address`

---

## 4. สิ่งที่ต้องติดตั้งก่อน

ทุกเครื่องใช้ **Windows 10/11**

| โปรแกรม | ใช้ที่เครื่อง | หมายเหตุ |
| --- | --- | --- |
| Git | ทุกเครื่อง | สำหรับ clone |
| Python **3.10** (x64) | PC3 Backend | ทีมพัฒนาและทดสอบด้วย 3.10.11 ตอนติดตั้งให้ติ๊ก *Add python.exe to PATH* และติดตั้ง *py launcher* |
| Python **3.11** (x64) | PC2 rembg | สคริปต์ `setup-rembg-cpu.bat` บังคับว่าต้องเป็น 3.11 |
| PostgreSQL | PC4 Database | ตัวติดตั้งของ EDB จาก postgresql.org จำรหัสผ่านของ user `postgres` ที่ตั้งตอนติดตั้งไว้ ใช้พอร์ต 5432 ตามค่าเริ่มต้น |
| Stability Matrix | PC2 AI | ใช้ติดตั้ง Package **Stable Diffusion WebUI Forge - Neo** ต้องมีการ์ดจอ NVIDIA |
| Nginx | PC1 Frontend | **ไม่ต้องติดตั้ง** มี `nginx.exe` อยู่ใน `frontend/` แล้ว |

> ถ้าเครื่องไม่มีการ์ดจอ NVIDIA ยังรันระบบส่วนอื่นได้ทั้งหมด (login, ลบพื้นหลัง, Histogram Matching, Blur, Admin) มีแค่การสร้างภาพจาก Prompt ที่ใช้ไม่ได้ และ `/api/ready` จะแสดง `ai` ไม่เป็น `ok`

ถ้าใช้ **แบบ A (เครื่องเดียว)** ต้องมีทั้ง Python 3.10 และ 3.11 ในเครื่องเดียวกัน ติดตั้งทั้งสองเวอร์ชันได้ปกติ และใช้คำสั่ง `py -3.10` / `py -3.11` เลือกเวอร์ชันตามที่คู่มือบอก

---

## 5. Clone โปรเจกต์

ทำที่ทุกเครื่องที่ใช้ (แบบ A ทำครั้งเดียว)

```powershell
git clone https://github.com/Zintrea/LUMA-group11.git
cd LUMA-group11
```

คำสั่งทั้งหมดต่อจากนี้รันใน **PowerShell** และเริ่มจากโฟลเดอร์ `LUMA-group11` เว้นแต่จะระบุไว้

---

## 6. ติดตั้งทีละส่วน

ติดตั้งตามลำดับ 6.1 → 6.4 เพราะ Backend ต้องรู้ที่อยู่ของ Database และ AI ก่อน

### 6.1 PC4 — PostgreSQL

1. ติดตั้ง PostgreSQL ให้เสร็จ (หัวข้อ 4)
2. สร้างตารางด้วย `database/init.sql` **ไฟล์เดียวพอ**

   ```powershell
   $env:PGCLIENTENCODING = "UTF8"
   & "C:\Program Files\PostgreSQL\<เวอร์ชัน>\bin\psql.exe" -h 127.0.0.1 -U postgres -d postgres -f database\init.sql
   ```

   - แทน `<เวอร์ชัน>` ด้วยเลขโฟลเดอร์ที่มีจริง เช่น `16` หรือ `17`
   - ระบบจะถามรหัสผ่านของ `postgres`
   - `PGCLIENTENCODING=UTF8` จำเป็น เพราะใน `init.sql` มีคอมเมนต์ภาษาไทย
   - ใช้ pgAdmin แทนได้: เปิด Query Tool ของฐานข้อมูล `postgres` แล้ว Open File เลือก `database/init.sql` แล้วกด Execute

3. ผลที่ถูกต้อง: มีตาราง `users` และ `image_tasks`

> ⚠️ **ไม่ต้องทำขั้นตอนที่ 2 (`ALTER TABLE ...`) ใน `database/README.md`** เพราะ `init.sql` สร้างคอลัมน์ `role` และ `is_active` ไว้แล้ว ถ้ารันจะ error ว่า column already exists
>
> ⚠️ `init.sql` จะลบตารางเดิมทิ้งก่อนสร้างใหม่ การรันซ้ำจะทำให้ข้อมูลผู้ใช้หายทั้งหมด

### 6.2 PC2 — AI: Stable Diffusion WebUI Forge

1. เปิด Stability Matrix → `Packages` → ติดตั้ง **Stable Diffusion WebUI Forge - Neo** (ทีมใช้ commit `neo@d2c29a6`)
2. ดาวน์โหลด Checkpoint **2 ไฟล์** ที่ Backend กำหนดชื่อไว้ในโค้ด (`backend/routes.py` ตัวแปร `ALLOWED_MODELS`)

   | โมเดลในเว็บ | ชื่อไฟล์ | ดาวน์โหลด (Civitai) | SHA256 (10 ตัวแรก) |
   | --- | --- | --- | --- |
   | `realistic` | `beautifulRealistic_brav5.safetensors` | [Beautiful Realistic Asians — เวอร์ชัน v5](https://civitai.com/models/25494?modelVersionId=63786) | `ac68270450` |
   | `anime` | `anyloraCheckpoint_bakedvaeBlessedFp16.safetensors` | [AnyLoRA — เวอร์ชัน bakedVae (blessed) fp16 NOT-PRUNED](https://civitai.com/models/23900?modelVersionId=95489) (ประมาณ 3.2 GB) | `ef49fbb25f` |

   - ทั้งสองเป็นโมเดล SD 1.5 เวอร์ชัน AnyLoRA ต้องเลือก **NOT-PRUNED** เท่านั้น (ตัว Pruned มี hash ไม่ตรง)
   - Civitai อาจให้ login ก่อนดาวน์โหลด
   - ตรวจ hash ได้ด้วย `Get-FileHash <ไฟล์> -Algorithm SHA256`

3. วางไฟล์ทั้งสองไว้ใน **โฟลเดอร์ย่อยชื่อ `sd`** ภายในโฟลเดอร์ Checkpoint ของ Forge
   (ใน Stability Matrix คือ `Data\Models\StableDiffusion\sd\`)
   ต้องมีโฟลเดอร์ `sd` เพราะ Backend เรียกโมเดลด้วยชื่อ `sd\beautifulRealistic_brav5.safetensors [ac68270450]`
4. ตั้ง Launch Arguments ของ Forge เป็น

   ```text
   --api --listen
   ```

   `--api` เปิด `/sdapi/v1/...` ให้ Backend เรียก ส่วน `--listen` ให้เครื่องอื่นใน LAN เรียกเข้ามาได้ (แบบ A ใส่ไว้ก็ไม่มีผลเสีย)
5. กด Launch แล้วตรวจว่าเปิด `http://127.0.0.1:7860/docs` ได้ และใน Web UI เห็นโมเดลทั้งสองในรายการ Checkpoint

> README ใน `ai/` ยังเขียนถึงโมเดล `mormix_v10.safetensors` ซึ่งเป็นโมเดลที่ใช้ช่วงแรก โค้ดปัจจุบันใช้ 2 โมเดลด้านบนแทน

### 6.3 PC2 — AI: rembg (Remove Background)

rembg รันด้วย CPU มีสคริปต์ `.bat` เตรียมไว้ใน `ai/rembg/`

1. ตั้งค่าครั้งแรก (ต้องมีอินเทอร์เน็ต สคริปต์จะสร้าง `.venv` และติดตั้ง package)

   ถ้าคำสั่ง `python --version` แสดง **3.11** อยู่แล้ว:

   ```powershell
   cd ai\rembg
   .\setup-rembg-cpu.bat
   ```

   ถ้า `python` เป็นเวอร์ชันอื่น (เช่นแบบ A ที่มี 3.10 ด้วย) ให้ชี้ PATH ไปที่ 3.11 ชั่วคราวก่อน:

   ```powershell
   cd ai\rembg
   $py311 = py -3.11 -c "import sys, os; print(os.path.dirname(sys.executable))"
   $env:Path = "$py311;$env:Path"
   python --version        # ต้องขึ้น Python 3.11.x
   .\setup-rembg-cpu.bat
   ```

2. เปิดบริการ: `.\start-rembg-cpu.bat` (ฟังที่ `0.0.0.0:7000`)
3. ทดสอบ: `.\verify-rembg.bat` ครั้งแรกจะดาวน์โหลดโมเดล `u2net` จึงใช้เวลาสักพัก
4. ปิดบริการ: `.\stop-rembg-cpu.bat`

รายละเอียดเพิ่มเติมอยู่ใน `ai/REMBG-LOGBOOK.md`

### 6.4 PC3 — Backend (Flask)

1. สร้าง virtual environment ด้วย Python 3.10 และติดตั้ง package

   ```powershell
   py -3.10 -m venv venv
   .\venv\Scripts\Activate.ps1
   python --version                 # ต้องขึ้น Python 3.10.x
   pip install -r backend\requirements.txt
   ```

   ถ้า PowerShell ไม่ยอมให้รัน `Activate.ps1` ให้รัน `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` ครั้งเดียวแล้วลองใหม่

2. สร้างไฟล์ `backend\.env` (ไฟล์นี้ไม่อยู่ใน Git ตั้งใจไม่ commit เพราะมีรหัสผ่าน)

   ```env
   SECRET_KEY=<สุ่มข้อความยาว ๆ>
   FORGE_URL=http://<PC2-IP>:7860
   REMBG_URL=http://<PC2-IP>:7000
   DATABASE_HOST=<PC4-IP>
   DATABASE_PORT=5432
   DATABASE_NAME=postgres
   DATABASE_USER=postgres
   DATABASE_PASSWORD=<รหัสผ่าน postgres ที่ตั้งตอนติดตั้ง>
   ```

   สร้างค่า `SECRET_KEY` ได้ด้วย:

   ```powershell
   python -c "import secrets; print(secrets.token_hex(32))"
   ```

   > ต้องมีครบทั้ง 8 บรรทัด ถ้าขาด `SECRET_KEY` จะ login ไม่ได้ ถ้าขาด `REMBG_URL` จะลบพื้นหลังไม่ได้ (README ย่อยของ backend ยังไม่ได้ใส่ 2 ค่านี้ในตัวอย่าง)
   >
   > ถ้าไม่ใส่ `FORGE_URL` โค้ดจะใช้ค่าเริ่มต้นเป็น IP เครื่องเก่าของทีม (`10.192.0.200`) ซึ่งเครื่องใหม่จะเรียกไม่ถึง

3. รัน Backend

   ```powershell
   cd backend
   python app.py
   ```

   ตอนเริ่ม โปรแกรมจะพิมพ์ค่าที่อ่านได้ ให้ตรวจว่า `ENV exists: True`, `SECRET_KEY exists: True` และ IP ถูกต้อง
   Backend ฟังที่ `0.0.0.0:5000` ต้องเปิดหน้าต่างนี้ทิ้งไว้

### 6.5 PC1 — Frontend (Nginx)

1. แก้ไฟล์ `frontend\conf\nginx.conf` บรรทัด `proxy_pass` ให้ชี้ไปที่ Backend

   ```nginx
   location /api/ {
       proxy_pass http://<PC3-IP>:5000/;
       ...
   }
   ```

   ในไฟล์ปัจจุบันยังเป็น IP เครื่องเก่าของทีม (`172.20.57.5`) ต้องเปลี่ยนเสมอ **และต้องมี `/` ปิดท้าย** เพื่อให้ Nginx ตัด `/api` ออก

2. สร้างโฟลเดอร์ `temp` (Git ไม่เก็บโฟลเดอร์ว่าง ถ้าไม่มี Nginx บน Windows จะ start ไม่ขึ้น)

   ```powershell
   cd frontend
   mkdir temp -ErrorAction SilentlyContinue
   mkdir logs -ErrorAction SilentlyContinue
   ```

3. ตรวจ config แล้วเปิด Nginx (ยังอยู่ในโฟลเดอร์ `frontend`)

   ```powershell
   .\nginx.exe -t          # ต้องขึ้น syntax is ok และ test is successful
   start nginx
   ```

4. คำสั่งที่ใช้บ่อย

   ```powershell
   .\nginx.exe -s reload    # หลังแก้ nginx.conf
   .\nginx.exe -s quit      # ปิด
   taskkill /f /im nginx.exe   # ถ้าปิดไม่ลง
   ```

### 6.6 เฉพาะแบบ B (4 เครื่อง): เปิดให้เครื่องอื่นเรียกเข้ามาได้

**Windows Firewall** รันใน PowerShell แบบ *Run as Administrator* บนเครื่องที่เกี่ยวข้อง

```powershell
# PC1
New-NetFirewallRule -DisplayName "LUMA Nginx 80"        -Direction Inbound -Protocol TCP -LocalPort 80   -Action Allow
# PC2
New-NetFirewallRule -DisplayName "LUMA Forge 7860"      -Direction Inbound -Protocol TCP -LocalPort 7860 -Action Allow
New-NetFirewallRule -DisplayName "LUMA rembg 7000"      -Direction Inbound -Protocol TCP -LocalPort 7000 -Action Allow
# PC3
New-NetFirewallRule -DisplayName "LUMA Backend 5000"    -Direction Inbound -Protocol TCP -LocalPort 5000 -Action Allow
# PC4
New-NetFirewallRule -DisplayName "LUMA PostgreSQL 5432" -Direction Inbound -Protocol TCP -LocalPort 5432 -Action Allow
```

**PostgreSQL (PC4)** ค่าเริ่มต้นรับเฉพาะการเชื่อมต่อจากเครื่องตัวเอง ต้องแก้ 2 ไฟล์ในโฟลเดอร์ `C:\Program Files\PostgreSQL\<เวอร์ชัน>\data\`

1. `postgresql.conf` ตั้งค่า

   ```conf
   listen_addresses = '*'
   ```

2. `pg_hba.conf` เพิ่มบรรทัดท้ายไฟล์ เพื่ออนุญาตเฉพาะเครื่อง Backend

   ```conf
   host    all    all    <PC3-IP>/32    scram-sha-256
   ```

3. Restart service (PowerShell แบบ Administrator)

   ```powershell
   Get-Service postgresql*                       # ดูชื่อ service
   Restart-Service postgresql-x64-<เวอร์ชัน>
   ```

**ทดสอบว่าเครื่องคุยกันได้** จาก PC3 (และจาก PC1 สำหรับพอร์ต 5000)

```powershell
Test-NetConnection <PC4-IP> -Port 5432
Test-NetConnection <PC2-IP> -Port 7860
Test-NetConnection <PC2-IP> -Port 7000
Test-NetConnection <PC3-IP> -Port 5000   # รันจาก PC1
```

ทุกบรรทัดต้องได้ `TcpTestSucceeded : True`

---

## 7. ลำดับการเปิดระบบและการตรวจสอบ

เปิดตามลำดับนี้ทุกครั้ง

1. **PC4** PostgreSQL (เป็น Windows service เปิดเองตอนบูต)
2. **PC2** Forge (Launch ใน Stability Matrix) และ `start-rembg-cpu.bat`
3. **PC3** `python app.py`
4. **PC1** `start nginx`

ตรวจทีละชั้นจากในออกนอก ถ้าชั้นไหนไม่ผ่านให้แก้ชั้นนั้นก่อน

| ลำดับ | เปิดใน Browser | ผลที่ถูกต้อง | ตรวจอะไร |
| --- | --- | --- | --- |
| 1 | `http://<PC3-IP>:5000/health` | `{"status":"ok"}` | Backend รันอยู่ |
| 2 | `http://<PC3-IP>:5000/ready` | `"status":"ready"` และทุกค่าเป็น `"ok"` | Backend ต่อ DB, Forge, rembg ได้ |
| 3 | `http://<PC1-IP>/api/health` | `{"status":"ok"}` | Nginx ส่งต่อไป Backend ได้ |
| 4 | `http://<PC1-IP>/` | หน้าแรกของ LUMA | Frontend พร้อมใช้งาน |

ถ้าข้อ 2 ได้ `not_ready` ให้ดูว่าช่องไหนไม่เป็น `ok` (`database`, `ai`, `remove_bg` ฯลฯ) แล้วไปที่หัวข้อ 9

---

## 8. การใช้งานเว็บ

1. เปิด `http://<PC1-IP>/` แล้วไปหน้า Login ที่ `http://<PC1-IP>/auth/login` เพื่อสมัครสมาชิก
2. Login แล้วไปที่ `http://<PC1-IP>/generate` เพื่อใช้ฟีเจอร์สร้างภาพ ลบพื้นหลัง Histogram Matching และ Blur
3. ภาพตัวอย่างสำหรับทดสอบ Histogram Matching อยู่ใน `test_images/` (`source.jpg`, `reference.jpg`)
4. แบบ B เปิดจากมือถือที่ต่อ Wi-Fi/LAN เดียวกันได้ด้วย `http://<PC1-IP>/`

### เปิดสิทธิ์ Admin

บัญชีที่สมัครใหม่จะเป็น `user` ถ้าต้องการเข้า `/admin` ให้สมัครผ่านเว็บก่อน แล้วรันที่ PC4

```powershell
$env:PGCLIENTENCODING = "UTF8"
& "C:\Program Files\PostgreSQL\<เวอร์ชัน>\bin\psql.exe" -h 127.0.0.1 -U postgres -d postgres -c "UPDATE users SET role = 'admin' WHERE username = '<ชื่อผู้ใช้>';"
```

ต้องได้ผลเป็น `UPDATE 1` จากนั้น Logout แล้ว Login ใหม่ แล้วเปิด `http://<PC1-IP>/admin`

---

## 9. แก้ปัญหาที่พบบ่อย

| อาการ | สาเหตุที่เป็นไปได้ | วิธีแก้ |
| --- | --- | --- |
| Nginx ไม่ start และใน `frontend\logs\error.log` มี `CreateDirectory() ... temp` | ไม่มีโฟลเดอร์ `frontend\temp` | ทำข้อ 6.5 ขั้นที่ 2 |
| Nginx ไม่ start เพราะพอร์ต 80 ถูกใช้ | มีโปรแกรมอื่นใช้พอร์ต 80 อยู่ (เช่น IIS) | ดูด้วย `netstat -ano \| findstr :80` แล้วปิดโปรแกรมนั้น |
| หน้าเว็บขึ้น แต่ `/api/...` ได้ `502 Bad Gateway` หรือค้าง | Backend ไม่ได้รัน หรือ `proxy_pass` ยังเป็น IP เก่า | ตรวจข้อ 1 ในหัวข้อ 7 แก้ `proxy_pass` แล้ว `nginx -s reload` |
| `/api/health` ไม่ได้ แต่ `:5000/health` ได้ | `proxy_pass` ไม่มี `/` ปิดท้าย หรือ Firewall PC3 บล็อก | ตรวจข้อ 6.5 และ 6.6 |
| `ALTER TABLE` error: column "role" already exists | ทำขั้นที่ 2 ของ `database/README.md` | ไม่ต้องทำขั้นนั้น ตารางถูกต้องแล้ว |
| psql error `invalid byte sequence` / `character with byte sequence` | client encoding ของ Windows ไม่ใช่ UTF-8 | ตั้ง `$env:PGCLIENTENCODING = "UTF8"` ก่อนรัน |
| `/ready` → `"database": "error"` | `.env` ผิด, PostgreSQL ไม่รับการเชื่อมต่อจาก PC3 | ตรวจ `DATABASE_*` ใน `.env` และหัวข้อ 6.6 |
| Login แล้ว error 500 / ค้าง | ไม่มี `SECRET_KEY` ใน `backend\.env` | เพิ่มตามข้อ 6.4 แล้วรัน Backend ใหม่ |
| `/ready` → `"remove_bg": "error"` | ไม่มี `REMBG_URL` หรือ rembg ไม่ได้รัน | เพิ่ม `REMBG_URL`, รัน `start-rembg-cpu.bat` |
| `/ready` → `"ai"` ไม่เป็น `ok` | Forge ไม่ได้เปิด, ไม่มี `--api`, IP ผิด | ตรวจข้อ 6.2 เปิด `http://<PC2-IP>:7860/docs` ให้ได้ |
| สร้างภาพแล้ว error เรื่องโมเดล / checkpoint | ไฟล์โมเดลไม่ได้อยู่ในโฟลเดอร์ `sd` หรือเป็นคนละเวอร์ชัน | ตรวจข้อ 6.2 ขั้นที่ 2–3 และ hash |
| `setup-rembg-cpu.bat` ขึ้น `Python 3.11 x64 is required` | คำสั่ง `python` ไม่ใช่ 3.11 | ใช้วิธีชี้ PATH ในข้อ 6.3 |

---

## 10. จุดที่ README ย่อยไม่ตรงกับโค้ดปัจจุบัน

README ย่อยเขียนไว้ระหว่างพัฒนา บางจุดล้าสมัยแล้ว ถ้าอ่าน README ย่อยประกอบ ให้ยึดตามตารางนี้

| ไฟล์ | สิ่งที่เขียนไว้ | ให้ทำแบบนี้แทน |
| --- | --- | --- |
| `database/README.md` | ขั้นที่ 2 รัน `ALTER TABLE ... ADD COLUMN role, is_active` และอ้างไฟล์ `init (1).sql` | รันแค่ `database/init.sql` (หัวข้อ 6.1) |
| `frontend/README.md` | ใช้ `docker start luma-test-db` และ `docker exec ... psql` | โปรเจกต์ไม่ใช้ Docker ใช้ PostgreSQL ที่ติดตั้งในเครื่อง (หัวข้อ 6.1 และ 8) |
| `frontend/conf/nginx.conf` | `proxy_pass http://172.20.57.5:5000/` | เปลี่ยนเป็น `<PC3-IP>` (หัวข้อ 6.5) |
| `backend/README.md` | ตัวอย่าง `.env` ไม่มี `SECRET_KEY` และ `REMBG_URL` และมี IP เครื่องเก่า | ใช้ `.env` ในหัวข้อ 6.4 |
| `ai/README.md` | ใช้โมเดล `mormix_v10.safetensors` และสคริปต์ `ai/test_forge.py` | ใช้ 2 โมเดลในหัวข้อ 6.2 สคริปต์ทดสอบ Forge จริงอยู่ที่ `backend/forge_test.py` (ต้องแก้ `FORGE_URL` ในไฟล์ก่อนรัน) |

---

## 11. โครงสร้าง Repository

```text
LUMA-group11/
├── README.md          ← คู่มือหลัก (ไฟล์นี้)
├── frontend/          ← PC1: nginx.exe, conf/nginx.conf, html/ (หน้าเว็บ)
├── ai/                ← PC2: README ของ Forge, rembg/ (สคริปต์ .bat + server.py)
├── backend/           ← PC3: app.py, routes.py, blur.py, hismat.py, contrast.py, requirements.txt
├── database/          ← PC4: init.sql
├── test_images/       ← ภาพตัวอย่างสำหรับทดสอบ
└── testapi/           ← สคริปต์ทดสอบ API
```

แต่ละโฟลเดอร์มี README และ LOGBOOK ของตัวเองที่บันทึกรายละเอียดและปัญหาที่เจอระหว่างพัฒนา
