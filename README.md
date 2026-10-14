# LUMA

AI Image Processing Project — Group 11

## สมาชิกกลุ่ม

1. นายสมเกียรติ เสนาพรม — 6710301017 — Backend
2. นายศิรวิทย์ รักแก้ว — 6710301018 — DataBase
3. นาย ธนฤทธิ์ คำวิเศษ — 6710301024 — Frontend
4. นายบุญญพัฒน์ กิตติชนม์ธวัช — 6710301033 — DevOps + AI

> คู่มือการรันด้านล่างจัดทำโดย AI (Claude) ที่ใช้รีเช็กโปรเจกต์เมื่อ 14 ต.ค. 2569
> ส่วน README และ LOGBOOK ในแต่ละโฟลเดอร์ ฝ่าย DevOps ให้ทีมช่วยกันเตรียมไว้ตั้งแต่เดือนสิงหาคม เพื่อให้โปรเจกต์ portable

---

## ระบบมี 4 ส่วน

| เครื่อง | ส่วน | พอร์ต | โฟลเดอร์ |
| --- | --- | --- | --- |
| PC1 | Nginx + หน้าเว็บ | 80 | `frontend/` |
| PC2 | AI: Forge + rembg | 7860, 7000 | `ai/` |
| PC3 | Backend (Flask) | 5000 | `backend/` |
| PC4 | PostgreSQL | 5432 | `database/` |

รันทั้งหมดบนเครื่องเดียวได้ โดยใส่ IP ทุกจุดเป็น `127.0.0.1`

## สิ่งที่ต้องมี

- Windows 10/11, Git
- Python 3.10 (Backend) และ Python 3.11 (rembg)
- PostgreSQL
- Stability Matrix + การ์ดจอ NVIDIA (ใช้สำหรับสร้างภาพเท่านั้น)

```powershell
git clone https://github.com/Zintrea/LUMA-group11.git
cd LUMA-group11
```

## 1. Database (PC4)

รัน `database/init.sql` ใน pgAdmin หรือ psql (ไม่ต้องรัน `ALTER TABLE` ใน `database/README.md`)

## 2. AI (PC2)

**Forge:** ติดตั้ง *Stable Diffusion WebUI Forge - Neo* ใน Stability Matrix แล้วตั้ง Launch Arguments เป็น `--api --listen`
จากนั้นโหลดโมเดล 2 ตัวไปไว้ในโฟลเดอร์ `sd` ของ Checkpoint:
- [beautifulRealistic_brav5.safetensors](https://civitai.com/models/25494?modelVersionId=63786)
- [anyloraCheckpoint_bakedvaeBlessedFp16.safetensors](https://civitai.com/models/23900?modelVersionId=95489)

**rembg:** ในโฟลเดอร์ `ai\rembg` รัน `setup-rembg-cpu.bat` หนึ่งครั้ง แล้วรัน `start-rembg-cpu.bat`

## 3. Backend (PC3)

```powershell
py -3.10 -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r backend\requirements.txt
```

สร้างไฟล์ `backend\.env`

```env
SECRET_KEY=ข้อความสุ่มอะไรก็ได้
FORGE_URL=http://<PC2-IP>:7860
REMBG_URL=http://<PC2-IP>:7000
DATABASE_HOST=<PC4-IP>
DATABASE_PORT=5432
DATABASE_NAME=postgres
DATABASE_USER=postgres
DATABASE_PASSWORD=<รหัสผ่าน postgres>
```

```powershell
cd backend
python app.py
```

## 4. Frontend (PC1)

แก้ `frontend\conf\nginx.conf` บรรทัด `proxy_pass` เป็น `http://<PC3-IP>:5000/`

```powershell
cd frontend
mkdir temp
start nginx
```

## 5. เปิดใช้งาน

เปิดระบบตามลำดับ PC4 → PC2 → PC3 → PC1 จากนั้นเปิด `http://<PC1-IP>/`

- `http://<PC3-IP>:5000/ready` ถ้าทุกค่าเป็น `ok` แปลว่าระบบพร้อมใช้งาน
- ถ้าแยก 4 เครื่อง ต้องเปิด Firewall ตามพอร์ตในตารางด้านบน และตั้ง PostgreSQL ให้รับการเชื่อมต่อจาก PC3 (`listen_addresses = '*'` และเพิ่ม IP ของ PC3 ใน `pg_hba.conf`)
