ได้เลย เอาอันนี้ไปวางเป็นไฟล์นี้ได้เลย:

```text
ai/README.md
```

ด้านล่างคือ README ตัวเต็มสำหรับฝั่ง AI / Forge ของ LUMA

```md
# LUMA AI Setup — Stable Diffusion WebUI Forge

เอกสารนี้อธิบายวิธีติดตั้ง เปิดใช้งาน และทดสอบฝั่ง AI ของโปรเจกต์ LUMA

ฝั่ง AI ใช้ Stable Diffusion WebUI Forge ผ่าน Stability Matrix เพื่อให้ Backend เรียกใช้งานผ่าน HTTP API ได้

---

# 1. หน้าที่ของ AI ในระบบ LUMA

ฝั่ง AI มีหน้าที่รับ Prompt จาก Backend แล้วสร้างภาพด้วย Stable Diffusion

Flow การทำงานจริงของระบบคือ

```text
Frontend
   ↓
Backend
   ↓
Stable Diffusion WebUI Forge API
   ↓
Generated Image
   ↓
Backend ส่งผลลัพธ์กลับไป Frontend
```

Frontend ไม่ควรเรียก Forge โดยตรง  
Backend จะเป็นตัวกลางในการเรียก AI API

---

# 2. Tool ที่ใช้

```text
Launcher: Stability Matrix
AI Package: Stable Diffusion WebUI Forge - Neo
Package Commit / Version: neo@d2c29a6
Web UI Port: 7860
API Base URL: http://<AI-PC-IP>:7860
Local Web UI: http://127.0.0.1:7860
API Docs: http://127.0.0.1:7860/docs
```

> หมายเหตุ: ถ้ารันและทดสอบบนเครื่อง AI เอง ให้ใช้ `127.0.0.1`  
> แต่ถ้า Backend อยู่คนละเครื่อง ต้องใช้ IP ของเครื่อง AI แทน

---

# 3. Model ที่ใช้

```text
Model file: mormix_v10.safetensors
Model type: Stable Diffusion checkpoint
```

Model ถูกเลือกจากหน้า Web UI ของ Forge แล้วสามารถ Generate ภาพได้จริง

ถ้าเปลี่ยน Model ในอนาคต ให้แก้ชื่อ Model ในเอกสารนี้ด้วย

---

# 4. โครงสร้าง Folder ฝั่ง AI

ใน Git Repository ให้มีเฉพาะไฟล์ที่จำเป็นสำหรับการอธิบายและทดสอบ

```text
ai/
├── README.md
└── test_forge.py
```

ไม่ควรนำไฟล์เหล่านี้ขึ้น Git:

```text
models/
outputs/
venv/
Stability Matrix package folder
*.safetensors
*.ckpt
*.pt
*.pth
```

เหตุผลคือไฟล์ Model และไฟล์ติดตั้ง Forge มีขนาดใหญ่ และผูกกับเครื่องที่ติดตั้ง

---

# 5. วิธีเปิด Stable Diffusion WebUI Forge

## 5.1 เปิด Stability Matrix

1. เปิดโปรแกรม Stability Matrix
2. ไปที่เมนู `Packages`
3. เลือก Package:

```text
Stable Diffusion WebUI Forge - Neo
```

4. ตรวจสอบว่าใช้ Model ที่ต้องการแล้ว เช่น

```text
mormix_v10.safetensors
```

---

## 5.2 ตั้งค่า Launch Arguments

เนื่องจาก Backend อยู่คนละเครื่องกับเครื่อง AI ต้องเปิด Forge ด้วย API และอนุญาตให้เครื่องอื่นใน LAN เรียกเข้ามาได้

ให้ตั้งค่า Launch Arguments เป็น:

```text
--api --listen
```

ความหมาย:

```text
--api     เปิด endpoint /sdapi/v1/... ให้ Backend ใช้งาน
--listen  อนุญาตให้เครื่องอื่นใน LAN เรียกเข้ามาที่เครื่อง AI ได้
```

หลังจากตั้งค่าแล้วให้ Restart Forge ใหม่

---

# 6. URL ที่ใช้ทดสอบ

## 6.1 ทดสอบบนเครื่อง AI เอง

เปิด Browser บนเครื่อง AI แล้วเข้า:

```text
http://127.0.0.1:7860
```

ถ้าเปิดหน้า Stable Diffusion WebUI ได้ แปลว่า Forge ทำงานแล้ว

---

## 6.2 ทดสอบ API บนเครื่อง AI เอง

เปิด Browser แล้วเข้า:

```text
http://127.0.0.1:7860/sdapi/v1/sd-models
```

ผลลัพธ์ที่คาดหวัง:

```text
ต้องได้ JSON รายการ Model กลับมา
```

ตัวอย่างผลลัพธ์:

```json
[
  {
    "title": "mormix_v10.safetensors",
    "model_name": "mormix_v10"
  }
]
```

ถ้าได้ผลลัพธ์ประมาณนี้ แปลว่า API เปิดแล้ว

---

## 6.3 ทดสอบจากเครื่อง Backend

หา IP ของเครื่อง AI ก่อน

ที่เครื่อง AI เปิด Command Prompt แล้วพิมพ์:

```bat
ipconfig
```

ดูบรรทัด IPv4 Address เช่น:

```text
192.168.1.20
```

จากนั้นที่เครื่อง Backend ให้เปิด Browser แล้วเข้า:

```text
http://192.168.1.20:7860
```

ถ้าเปิดหน้า Forge ได้ แปลว่าเครื่อง Backend มองเห็นเครื่อง AI แล้ว

จากนั้นทดสอบ API:

```text
http://192.168.1.20:7860/sdapi/v1/sd-models
```

ถ้าได้ JSON รายการ Model กลับมา แปลว่า Backend สามารถเรียก AI API ได้แล้ว

---

# 7. Endpoint หลักที่ Backend ใช้

Backend ใช้ endpoint นี้ในการสร้างภาพจาก Prompt

```text
POST /sdapi/v1/txt2img
```

ตัวอย่าง URL จริง:

```text
http://192.168.1.20:7860/sdapi/v1/txt2img
```

> หมายเหตุ: Endpoint นี้ต้องเรียกด้วย POST เท่านั้น  
> ถ้าเปิดใน Browser ตรง ๆ แล้วขึ้น `Method Not Allowed` ถือว่าปกติ เพราะ Browser เรียกแบบ GET

---

# 8. ตัวอย่าง Payload สำหรับ Generate ภาพ

```json
{
  "prompt": "a cute cat, high quality",
  "negative_prompt": "low quality, blurry",
  "steps": 10,
  "width": 512,
  "height": 512,
  "cfg_scale": 7,
  "sampler_name": "Euler a",
  "batch_size": 1,
  "n_iter": 1
}
```

ผลลัพธ์ที่ได้จะเป็น JSON ที่มีภาพในรูปแบบ Base64

ตัวอย่างโครงสร้างผลลัพธ์:

```json
{
  "images": [
    "base64-image-data"
  ],
  "parameters": {},
  "info": "..."
}
```

Backend ต้องนำค่าใน `images[0]` ไปแปลงเป็นไฟล์ภาพ หรือส่งต่อให้ Frontend แสดงผล

---

# 9. การตั้งค่า Backend ให้เรียก AI

Backend ไม่ควร hardcode เป็น `127.0.0.1` ถ้า Backend อยู่คนละเครื่องกับ AI

ตัวอย่างที่ถูกต้อง:

```text
FORGE_URL=http://192.168.1.20:7860
```

ตัวอย่างที่ไม่ควรใช้ในกรณี Backend อยู่คนละเครื่อง:

```text
FORGE_URL=http://127.0.0.1:7860
```

เพราะ `127.0.0.1` หมายถึงเครื่องของตัวเอง  
ถ้า Backend ใช้ `127.0.0.1` จะกลายเป็นการเรียกเครื่อง Backend เอง ไม่ใช่เครื่อง AI

---

# 10. ทดสอบ Generate จากเครื่อง Backend ด้วย PowerShell

ที่เครื่อง Backend ให้เปิด PowerShell แล้วรันคำสั่งนี้

เปลี่ยน IP ให้ตรงกับ IP เครื่อง AI จริง:

```powershell
$body = @{
    prompt = "a cute cat, high quality"
    negative_prompt = "low quality, blurry"
    steps = 10
    width = 512
    height = 512
    cfg_scale = 7
    sampler_name = "Euler a"
    batch_size = 1
    n_iter = 1
} | ConvertTo-Json

$response = Invoke-RestMethod `
    -Uri "http://192.168.1.20:7860/sdapi/v1/txt2img" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body

[IO.File]::WriteAllBytes("forge_test.png", [Convert]::FromBase64String($response.images[0]))
```

ผลลัพธ์ที่คาดหวัง:

```text
เกิดไฟล์ forge_test.png บนเครื่อง Backend
```

ถ้าไฟล์ภาพถูกสร้างขึ้น แปลว่า Backend สามารถเรียก AI ข้ามเครื่องได้สำเร็จ

---

# 11. ทดสอบด้วย Python Script

ติดตั้ง package ที่จำเป็น:

```bash
pip install requests
```

สร้างไฟล์:

```text
ai/test_forge.py
```

ตัวอย่างโค้ด:

```python
import base64
from pathlib import Path

import requests


# แก้ IP ให้ตรงกับเครื่อง AI จริง
FORGE_URL = "http://192.168.1.20:7860"


def main():
    print("Checking Forge API...")

    try:
        model_response = requests.get(
            f"{FORGE_URL}/sdapi/v1/sd-models",
            timeout=10
        )
        model_response.raise_for_status()
        print("PASS: Forge API is reachable")
    except Exception as e:
        print("FAIL: Cannot reach Forge API")
        print(e)
        return

    payload = {
        "prompt": "a cute cat, high quality",
        "negative_prompt": "low quality, blurry",
        "steps": 10,
        "width": 512,
        "height": 512,
        "cfg_scale": 7,
        "sampler_name": "Euler a",
        "batch_size": 1,
        "n_iter": 1
    }

    print("Generating image...")

    try:
        response = requests.post(
            f"{FORGE_URL}/sdapi/v1/txt2img",
            json=payload,
            timeout=180
        )
        response.raise_for_status()

        data = response.json()
        image_base64 = data["images"][0]

        if "," in image_base64:
            image_base64 = image_base64.split(",", 1)[1]

        output_dir = Path("outputs")
        output_dir.mkdir(exist_ok=True)

        output_file = output_dir / "forge_test.png"
        output_file.write_bytes(base64.b64decode(image_base64))

        print("PASS: Image generated successfully")
        print(f"Output saved to {output_file}")

    except Exception as e:
        print("FAIL: Image generation failed")
        print(e)


if __name__ == "__main__":
    main()
```

รันคำสั่ง:

```bash
python test_forge.py
```

ผลลัพธ์ที่คาดหวัง:

```text
PASS: Forge API is reachable
PASS: Image generated successfully
Output saved to outputs/forge_test.png
```

---

# 12. Windows Firewall

ถ้าเครื่อง Backend เปิดหน้า Forge ของเครื่อง AI ไม่ได้ ให้เปิด Firewall ที่เครื่อง AI

เปิด PowerShell แบบ Run as Administrator แล้วรัน:

```powershell
New-NetFirewallRule `
    -DisplayName "Allow Stable Diffusion Forge 7860" `
    -Direction Inbound `
    -Protocol TCP `
    -LocalPort 7860 `
    -Action Allow
```

หลังจากนั้นให้ลองเปิดจากเครื่อง Backend อีกครั้ง:

```text
http://<AI-PC-IP>:7860
```

---

# 13. Checklist สำหรับ DevOps

ใช้ Checklist นี้ตรวจงานฝั่ง AI

```text
[ ] Stability Matrix เปิดได้
[ ] Stable Diffusion WebUI Forge - Neo เปิดได้
[ ] เลือก Model ได้
[ ] Generate ภาพผ่าน Web UI ได้
[ ] เปิด Forge ด้วย --api --listen
[ ] เปิด API Docs ได้ที่ /docs
[ ] เปิด /sdapi/v1/sd-models แล้วได้ JSON กลับมา
[ ] เรียก POST /sdapi/v1/txt2img ได้
[ ] Backend คนละเครื่องสามารถ Generate ภาพได้
[ ] มี ai/README.md
[ ] มีวิธีทดสอบชัดเจน
[ ] ไม่มีการ push Model หรือไฟล์ Forge ขนาดใหญ่ขึ้น Git
```

---

# 14. Definition of Done — AI Round 1

ฝั่ง AI ถือว่าเสร็จสำหรับรอบแรกเมื่อครบทั้งหมดนี้

```text
[ ] ติดตั้ง Stable Diffusion WebUI Forge ได้
[ ] มี Model ที่ใช้งานจริง
[ ] เปิด Forge ได้
[ ] เปิด API ได้
[ ] ใส่ Prompt แล้ว Generate ภาพได้จริง
[ ] Backend คนละเครื่องเรียก Generate ได้จริง
[ ] ai/README.md บอก Version, Model, วิธีเปิด และวิธีทดสอบครบ
```

สถานะล่าสุดของโปรเจกต์:

```text
[PASS] Forge เปิดได้
[PASS] API เปิดได้
[PASS] Backend คนละเครื่อง Generate ภาพได้
[TODO] ตรวจ README และเก็บหลักฐานการทดสอบ
```

---

# 15. Troubleshooting

## ปัญหา: เข้า /sdapi/v1/sd-models แล้วขึ้น Not Found

สาเหตุที่เป็นไปได้:

```text
ยังไม่ได้เปิด Forge ด้วย --api
```

วิธีแก้:

```text
เพิ่ม launch argument: --api
แล้ว Restart Forge
```

---

## ปัญหา: เข้า /sdapi/v1/txt2img แล้วขึ้น Method Not Allowed

อันนี้ไม่ใช่ปัญหา

สาเหตุ:

```text
เปิดผ่าน Browser ทำให้เป็น GET request
แต่ txt2img ต้องใช้ POST request
```

วิธีทดสอบที่ถูกต้อง:

```text
ใช้ PowerShell, Python requests, Postman หรือ Backend เรียกแบบ POST
```

---

## ปัญหา: เครื่อง Backend เรียก 127.0.0.1:7860 ไม่ได้

สาเหตุ:

```text
127.0.0.1 หมายถึงเครื่อง Backend เอง
ไม่ใช่เครื่อง AI
```

วิธีแก้:

```text
ใช้ IP ของเครื่อง AI แทน
เช่น http://192.168.1.20:7860
```

---

## ปัญหา: เครื่อง Backend เปิดหน้า Forge ของเครื่อง AI ไม่ได้

สาเหตุที่เป็นไปได้:

```text
1. เครื่องไม่ได้อยู่ LAN เดียวกัน
2. Forge ไม่ได้เปิดด้วย --listen
3. Firewall เครื่อง AI บล็อก port 7860
4. ใช้ IP เครื่อง AI ผิด
```

วิธีแก้:

```text
1. เช็ค Wi-Fi / LAN
2. เปิด Forge ด้วย --api --listen
3. เปิด Firewall port 7860
4. เช็ค IP ด้วย ipconfig
```

---

# 16. หมายเหตุสำหรับการใช้งานจริง

ตอน Demo ควรเตรียมสิ่งนี้ไว้ล่วงหน้า

```text
1. เปิดเครื่อง AI ก่อน
2. เปิด Stability Matrix
3. Start Stable Diffusion WebUI Forge - Neo
4. เช็คว่าใช้ --api --listen
5. เช็ค IP เครื่อง AI
6. ตั้งค่า FORGE_URL ใน Backend ให้ตรงกับ IP เครื่อง AI
7. ทดสอบ /sdapi/v1/sd-models
8. ทดสอบ Generate 1 รูปก่อนเริ่ม Demo
```

แนะนำให้ Fix IP เครื่อง AI หรือจด IP ทุกครั้งก่อน Demo เพราะถ้า IP เปลี่ยน Backend จะเรียก AI ไม่เจอ

---

# 17. สรุป

ฝั่ง AI ของ LUMA ใช้ Stable Diffusion WebUI Forge ที่รันผ่าน Stability Matrix

Backend จะเรียก Forge ผ่าน HTTP API โดยใช้ endpoint หลัก:

```text
POST /sdapi/v1/txt2img
```

กรณี Backend อยู่คนละเครื่องกับ AI ต้องเปิด Forge ด้วย:

```text
--api --listen
```

และ Backend ต้องใช้ URL เป็น IP ของเครื่อง AI เช่น:

```text
http://192.168.1.20:7860
```

สถานะปัจจุบัน:

```text
AI Functional Test: PASS
Backend to AI Generate Test: PASS
Documentation: README นี้ใช้เป็นเอกสารรอบแรก
```
```

จุดที่ควรแก้ก่อน commit จริงมีแค่ตรงนี้:

```text
FORGE_URL = "http://192.168.1.20:7860"
```

ให้เปลี่ยนเป็น IP เครื่อง AI ของคุณจริง และถ้าจะให้ดีใน README ให้เขียน IP เป็นตัวอย่างแบบ `<AI-PC-IP>` แต่ในบันทึกทดสอบ DevOps ค่อยจด IP จริงที่ใช้ตอนสอบงาน.