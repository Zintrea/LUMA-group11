# LUMA — PC2 rembg Logbook

> เอกสารปฏิบัติการสำหรับตั้งและตรวจ PC2 ใหม่ โดยละเอียดกว่า README

## 1. เป้าหมาย

PC2 เปิดบริการ Background Removal แบบ CPU ให้ PC3 เรียกผ่าน LAN:

```text
POST http://<PC2-IP>:7000/api/remove
Content-Type: multipart/form-data
Field: image
Response: image/png binary
```

Phone และ Frontend ห้ามเรียก PC2 โดยตรง:

```text
Phone → PC1 Nginx → PC3 Backend → PC2 rembg
```

## 2. ขอบเขต

- PC2 รับไฟล์และลบพื้นหลังด้วย rembg CPU
- PC2 คืน transparent PNG
- PC2 ไม่ติดต่อ PostgreSQL
- PC2 ไม่ตรวจ Flask session
- PC2 ไม่เก็บ permanent image history
- PC2 ไม่ใช่ Forge และไม่ใช้ GPU ในรอบนี้

## 3. โครงสร้าง

```text
ai/rembg/
├─ server.py                 # API wrapper ของ LUMA: field `image`
├─ requirements-cpu.txt      # dependencies ที่ pin version
├─ setup-rembg-cpu.bat       # รันครั้งแรก
├─ start-rembg-cpu.bat       # เปิด service
├─ stop-rembg-cpu.bat        # ปิด service ที่ script เริ่มไว้
├─ verify-rembg.bat          # POST test-input.png ตาม contract PC3
├─ verify.py                 # ตัวตรวจ response
├─ test-input.png            # input สำหรับ smoke test
├─ .venv/                    # local only, ignored
├─ models/                   # local only, ignored
├─ logs/                     # local only, ignored
└─ output/                   # local only, ignored
```

## 4. Prerequisites บน PC2

- Windows 11
- Python 3.11 x64 พร้อม Python Launcher (`py -3.11`)
- อินเทอร์เน็ตในครั้งแรกเพื่อดาวน์โหลด packages/model
- Port TCP 7000 ว่าง
- Firewall อนุญาตให้ PC3 เข้า PC2:7000 เท่านั้น

ห้ามใช้ Python venv เดียวกับ Flask Backend หรือ Forge

## 5. ติดตั้งครั้งแรก

1. Pull branch `backend-ai` ที่มีโฟลเดอร์ `ai/rembg/`
2. เปิด `ai/rembg/setup-rembg-cpu.bat`
3. รอจนเห็น `PASS: Setup complete.`
4. เปิด `start-rembg-cpu.bat`
5. เปิด `verify-rembg.bat`

ครั้งแรกที่ Verify อาจช้ากว่าปกติ เพราะ rembg ดาวน์โหลด model `u2net` ลง `ai/rembg/models/`

## 6. เปิด / ปิด / ตรวจ

| งาน | ไฟล์ |
|---|---|
| ติดตั้งครั้งแรก | `setup-rembg-cpu.bat` |
| เปิด service | `start-rembg-cpu.bat` |
| ตรวจ POST จริง | `verify-rembg.bat` |
| ปิด service | `stop-rembg-cpu.bat` |

## 7. Windows Firewall

ต้องรัน PowerShell แบบ Administrator และแทน `<PC3-IP>` ด้วย IPv4 จริงของ PC3:

```powershell
New-NetFirewallRule `
  -DisplayName "LUMA rembg from PC3" `
  -Direction Inbound `
  -Protocol TCP `
  -LocalPort 7000 `
  -RemoteAddress <PC3-IP> `
  -Action Allow
```

อย่าเปิด Port 7000 ให้ทุกเครื่องโดยไม่จำเป็น

## 8. สิ่งที่ PC3 ต้องใช้

```text
URL: http://<PC2-IP>:7000/api/remove
Method: POST
Content-Type: multipart/form-data
Field: image
Success: HTTP 200 + image/png binary
```

PC3 ต้องกำหนด timeout อย่างน้อย 180 วินาทีสำหรับ request แรก และถ้า PC2 ไม่ตอบ/timeout ต้องจัดการ error ฝั่ง PC3 เอง

## 9. Expected Result

หลัง `verify-rembg.bat` ผ่าน:

```text
PASS: PC2 rembg service accepted multipart field 'image'
PASS: Service returned non-empty image/png output
```

ไฟล์ผลทดสอบอยู่ที่:

```text
ai/rembg/output/verify-output.png
```

## 10. Runtime Log

ทุกครั้งที่ Start จะสร้าง log ใหม่:

```text
ai/rembg/logs/rembg-YYYYMMDD-HHMMSS-stdout.log
ai/rembg/logs/rembg-YYYYMMDD-HHMMSS-stderr.log
```

เมื่อตรวจปัญหา ให้ส่งเฉพาะบรรทัด error ที่จำเป็น ห้ามส่ง secrets หรือข้อมูล network ที่ไม่ควรเผยแพร่ขึ้น Git

## 11. Troubleshooting

| อาการ | ตรวจ / แก้ |
|---|---|
| `Python 3.11 x64 is required` | ติดตั้ง Python 3.11 x64 แล้วรัน Setup ใหม่ |
| Port 7000 ถูกใช้ | ใช้ `stop-rembg-cpu.bat` เฉพาะเมื่อเป็น LUMA service เดิม หรือเปลี่ยน process ที่ใช้ port อย่างมีเหตุผล |
| Verify ติดต่อไม่ได้ | เปิด Start script และดู `logs/*stderr.log` ล่าสุด |
| PC3 ติดต่อไม่ได้ | ตรวจ IP PC2, network เดียวกัน, Firewall rule, และ port 7000 |
| Verify ช้าครั้งแรก | รอ model download และดู runtime log |
| ได้ HTTP 415 | PC3 ต้องส่ง MIME type JPG/PNG/WebP และ field ชื่อ `image` |

## 12. Demo Checklist

```text
[ ] PC2 เปิด start-rembg-cpu.bat แล้ว
[ ] verify-rembg.bat ผ่าน
[ ] PC3 เรียก POST ด้วย field image ได้
[ ] PC3 ได้ image/png กลับ
[ ] Forge ยังเปิดและใช้งานพร้อม rembg CPU ได้
[ ] Runtime log ของรอบ Demo ถูกสร้าง
```

## 13. บันทึกผลจริง

### 4 ตุลาคม 2026 — Implementation baseline

- สร้าง LUMA API wrapper `POST /api/remove`
- Contract ใช้ multipart field `image` ตามที่ PC3 ต้องการ
- Response เป็น `image/png` binary
- ใช้ rembg CPU เท่านั้น (model: `u2net`)
- Unit tests ครอบคลุม success, missing field, invalid MIME type, file-too-large response และ PID file
- Setup → Start → Verify → Stop ผ่านบน Windows development environment
- **ยังต้องทดสอบจาก PC3 ข้ามเครื่องและตั้ง Firewall บน PC2 จริงก่อนถือว่า E2E ผ่าน**
