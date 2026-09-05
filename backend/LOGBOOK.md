# Backend Development Logbook

Project: LUMA-group11

ส่วนรับผิดชอบ: Backend

วันที่เริ่มดำเนินการ: 5 กันยายน 2026

---

# 1. เป้าหมายของการเตรียม Backend

เป้าหมายเริ่มต้น:

1. เตรียม Environment สำหรับ Backend
2. แยก Git Branch สำหรับ Backend
3. ติดตั้ง Python
4. สร้าง Virtual Environment
5. ติดตั้ง Flask
6. สร้าง Flask Server
7. สร้าง Health Endpoint
8. ทดสอบ Backend
9. จัดการ Git
10. เตรียมโครงสร้างสำหรับเชื่อม Frontend, AI และ Database

---

# 2. ตรวจสอบ Python

## ตำแหน่ง

เริ่มต้นที่:

C:\Ai gen\ProjectFN


ตรวจสอบ Python:

python --version


ผลลัพธ์:

Python 3.10.11


ตรวจสอบ Python Launcher:

py --version


ผลลัพธ์:

Python 3.14.6


## การตัดสินใจ

เครื่องมี Python 2 Version:

- Python 3.10.11
- Python 3.14.6

เลือกใช้:

Python 3.10.11


เหตุผล:

ต้องการใช้ Python Version ที่กำหนดสำหรับ Environment ของ Backend
และหลีกเลี่ยงปัญหา Compatibility ของ Package ที่อาจเกิดกับ Python Version ใหม่กว่า

---

# 3. ตรวจสอบ Git

ใช้:

git --version


ผลลัพธ์:

git version 2.54.0.windows.1


สรุป:

Git พร้อมใช้งาน

---

# 4. ตรวจสอบ Git Repository

ตอนแรกอยู่ที่:

C:\Ai gen\ProjectFN


ลอง:

git branch


พบ Error:

fatal: not a git repository
(or any of the parent directories): .git


## วิเคราะห์ปัญหา

ตรวจสอบไฟล์:

dir


พบโฟลเดอร์:

LUMA-group11


Repository จริงอยู่ที่:

C:\Ai gen\ProjectFN\LUMA-group11


จึงเข้าไป:

cd .\LUMA-group11


จากนั้น Git สามารถทำงานได้

---

# 5. ตรวจสอบ Branch

ใช้:

git branch


พบ:

* main


หมายความว่า Repository มี Branch:

main


และกำลังอยู่บน:

main

---

# 6. สร้าง Backend Branch

เนื่องจากไม่ต้องการพัฒนา Backend โดยตรงบน main

สร้าง Branch:

backend


ใช้คำสั่ง:

git switch -c backend


ผลลัพธ์:

Switched to a new branch 'backend'


ตรวจสอบ:

git branch


ผลลัพธ์:

* backend
  main


สรุป:

สร้าง Branch backend สำเร็จ

---

# 7. ตรวจสอบ Python บน Backend Branch

ใช้:

python --version


ผลลัพธ์:

Python 3.10.11


สรุป:

Backend ใช้ Python 3.10.11

---

# 8. สร้าง Virtual Environment

อยู่ที่:

C:\Ai gen\ProjectFN\LUMA-group11


ใช้:

python -m venv venv


ผลลัพธ์:

สร้างโฟลเดอร์:

venv/


หน้าที่:

Virtual Environment ใช้แยก Package ของ Backend
ออกจาก Python Environment หลักของเครื่อง

---

# 9. เปิด Virtual Environment

ทดลอง:

.\venv\Scripts\Activate.ps1


พบ Error:

cannot be loaded because running scripts is disabled on this system


## สาเหตุ

PowerShell Execution Policy ไม่อนุญาตให้รัน Script

## วิธีแก้

ใช้:

Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass


จากนั้น:

.\venv\Scripts\Activate.ps1


ผลลัพธ์:

(venv) PS C:\Ai gen\ProjectFN\LUMA-group11>


สรุป:

Virtual Environment เปิดสำเร็จ

---

# 10. ติดตั้ง Flask

อัปเกรด pip:

python -m pip install --upgrade pip


ติดตั้ง Flask:

pip install flask


ตรวจสอบ:

python -c "import flask; print(flask.__version__)"


ผลลัพธ์:

3.1.3


พบ Warning:

DeprecationWarning

เกี่ยวกับ `flask.__version__`

วิเคราะห์แล้ว:

เป็น Warning ไม่ใช่ Error
และไม่กระทบการทำงานของ Flask

สรุป:

Flask 3.1.3 ติดตั้งสำเร็จ

---

# 11. สร้าง requirements.txt

ใช้:

pip freeze > requirements.txt


ตรวจสอบ:

type requirements.txt


พบ Package เช่น:

click==8.5.0
Flask==3.1.3
itsdangerous==2.2.0
Jinja2==3.1.6
MarkupSafe==3.0.3
Werkzeug==3.1.8


สรุป:

สร้าง requirements.txt สำเร็จ

---

# 12. ตรวจสอบ Git

ใช้:

git status


พบ:

Untracked files:
    requirements.txt


หมายความว่า:

requirements.txt เป็นไฟล์ใหม่
และยังไม่ได้ถูก Git ติดตาม

---

# 13. Add requirements.txt

ใช้:

git add requirements.txt


ตรวจสอบ:

git status


พบ:

Changes to be committed:

new file: requirements.txt


สรุป:

requirements.txt ถูก Stage สำเร็จ

---

# 14. Commit requirements.txt

ใช้:

git commit -m "Add backend requirements"


ผลลัพธ์:

[backend f76440f] Add backend requirements


สรุป:

Commit requirements.txt สำเร็จ

---

# 15. ตรวจสอบ Working Tree

ใช้:

git status


ผลลัพธ์:

nothing to commit, working tree clean


สรุป:

ไม่มีไฟล์ค้างจาก Commit นี้

---

# 16. สร้าง Flask Application

สร้างไฟล์:

backend/app.py


โค้ดเริ่มต้น:

from flask import Flask

app = Flask(__name__)


@app.route("/health")
def health():
    return {"status": "ok"}


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)


---

# 17. อธิบาย app.py

## Import Flask

from flask import Flask


ใช้เรียก Flask Framework

---

## สร้าง Application

app = Flask(__name__)


สร้าง Flask Application

---

## สร้าง Health Endpoint

@app.route("/health")
def health():
    return {"status": "ok"}


เมื่อ Client Request:

GET /health


Backend ส่ง:

{
    "status": "ok"
}


---

## เปิด Server

app.run(
    host="0.0.0.0",
    port=5000,
    debug=True
)


ความหมาย:

host:

0.0.0.0


อนุญาตให้ Server รับ Connection จาก Network Interface

port:

5000


กำหนด Port ของ Flask Server

debug:

True


ใช้สำหรับ Development
และช่วย Reload Server เมื่อมีการแก้ไข Code

---

# 18. รัน Backend ครั้งแรก

จาก:

C:\Ai gen\ProjectFN\LUMA-group11


ใช้:

python backend\app.py


ผลลัพธ์:

* Serving Flask app 'app'
* Debug mode: on
* Running on http://127.0.0.1:5000


และมี Address Network:

http://10.192.0.167:5000


สรุป:

Flask Server เปิดสำเร็จ

---

# 19. ทดสอบ Health Endpoint

เปิด Browser:

http://localhost:5000/health


ได้รับ:

{
    "status": "ok"
}


สรุป:

PASS


สิ่งที่พิสูจน์ได้:

- Flask Server เปิดได้
- Backend รับ Request ได้
- `/health` ทำงาน
- Backend ส่ง Response ได้

---

# 20. ทดสอบภาษาไทย

ทดลองเปลี่ยน:

return {"status": "โสด"}


Browser แสดง:

{
    "status": "\u0e42\u0e2a\u0e14"
}


วิเคราะห์:

เป็น Unicode Escape

ไม่ได้หมายความว่าข้อมูลเสียหาย

`\u0e42\u0e2a\u0e14`

มีความหมายเท่ากับ:

โสด


สรุป:

Backend สามารถส่งข้อมูลภาษาไทยได้

---

# 21. Commit Flask Application

หลังจากสร้าง app.py

ใช้:

git add backend/app.py


จากนั้น:

git commit -m "Add Flask health endpoint"


ผลลัพธ์:

[backend 80ba3f5] Add Flask health endpoint

1 file changed
12 insertions(+)

สรุป:

app.py ถูก Commit สำเร็จ

---

# 22. การปรับปรุง README

README เดิมเป็น Template สำหรับ Backend

จึงปรับเนื้อหาให้ตรงกับงานจริง

ข้อมูลที่ต้องมี:

- หน้าที่ Backend
- Python Version
- Flask Version
- Virtual Environment
- requirements.txt
- วิธีติดตั้ง
- วิธีรัน
- Health Endpoint
- Git Branch
- Frontend Integration
- AI Integration
- Database Integration
- Workflow

---

# 23. Git Pull ปัญหาที่พบ

ทดลอง:

git pull


พบ:

There is no tracking information for the current branch.


## สาเหตุ

Branch backend ยังไม่มี Upstream Branch ที่กำหนด

Git จึงไม่ทราบว่าจะ Pull จาก Remote Branch ใด


## การวิเคราะห์

หากต้องการดูงานของสมาชิกบน main:

git switch main
git pull


หากต้องการทำงาน Backend:

git switch backend


ไม่จำเป็นต้อง Pull backend หากไม่มี Remote Tracking
และต้องการทำงานจาก Local Branch

---

# 24. การ Merge Backend เข้า Backend-AI

กำหนด:

ต้นทาง:

backend


ปลายทาง:

backend-ai


ก่อน Merge:

git branch


ต้องอยู่:

* backend-ai
  backend
  main


---

# 25. Fetch Remote

ใช้:

git fetch origin


คำสั่งนี้ใช้ดึงข้อมูล Metadata และ Commit จาก Remote
โดยยังไม่ Merge เข้ากับ Branch ปัจจุบัน

---

# 26. Merge Backend

ขณะอยู่บน:

backend-ai


ใช้:

git merge backend


ผลลัพธ์:

Updating 074d702..d2ca341
Fast-forward


ไฟล์ที่ถูกนำเข้ามา:

backend/README.md
backend/app.py
requirements.txt


สรุป:

Merge สำเร็จ

ไม่มี Conflict

---

# 27. Push Backend-AI

ใช้:

git push origin backend-ai


ผลลัพธ์:

backend-ai -> backend-ai


สรุป:

Branch backend-ai ถูก Push ขึ้น GitHub สำเร็จ

---

# 28. ตรวจสอบหลัง Push

ใช้:

git status


ผลลัพธ์:

On branch backend-ai

Your branch is up to date with 'origin/backend-ai'.

nothing to commit, working tree clean


สรุป:

- Local Branch ตรงกับ Remote
- ไม่มีไฟล์ค้าง
- Push สำเร็จ

---

# 29. การออกแบบการเชื่อม AI

จาก Requirement ของระบบ Backend ต้องสามารถเชื่อมกับ AI Server
ที่อยู่บนเครื่องอื่นใน Network

AI Server:

http://10.192.0.232:7860


API:

/sdapi/v1/txt2img


---

# 30. การทดสอบ Network ไปยัง AI

ก่อนเรียก AI สามารถตรวจสอบ Port:

Test-NetConnection 10.192.0.232 -Port 7860


หาก:

TcpTestSucceeded : True


หมายความว่า:

เครื่อง Backend สามารถเชื่อมต่อ Port 7860 ของ AI Server ได้

---

# 31. การทดสอบ AI ผ่าน PowerShell

สร้าง Request:

$body = @{
    prompt = "a cute cat, high quality"
    negative_prompt = "low quality, blurry"
    steps = 10
    width = 512
    height = 512
    cfg_scale = 7
    sampler_name = "Euler a"
} | ConvertTo-Json


เรียก AI:

$response = Invoke-RestMethod `
    -Uri "http://10.192.0.232:7860/sdapi/v1/txt2img" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body


บันทึกผลลัพธ์:

[IO.File]::WriteAllBytes(
    "forge_test.png",
    [Convert]::FromBase64String($response.images[0])
)


หากสำเร็จ:

forge_test.png


จะถูกสร้างขึ้น

ไฟล์นี้ใช้เป็นหลักฐานว่าเครื่อง Backend
สามารถเรียก AI Server ได้

---

# 32. แนวทางการเรียก AI จาก Python

Backend จะใช้:

import requests


กำหนด AI Server:

FORGE_URL = "http://10.192.0.232:7860"


สร้าง Payload:

payload = {
    "prompt": "a cute cat, high quality",
    "negative_prompt": "low quality, blurry",
    "steps": 10,
    "width": 512,
    "height": 512,
    "cfg_scale": 7,
    "sampler_name": "Euler a"
}


ส่ง Request:

response = requests.post(
    f"{FORGE_URL}/sdapi/v1/txt2img",
    json=payload,
    timeout=180
)


อ่าน Response:

data = response.json()

image_base64 = data["images"][0]


---

# 33. เหตุผลที่ไม่ใช้ 127.0.0.1 กับ AI

ไม่ควรใช้:

FORGE_URL = "http://127.0.0.1:7860"


เพราะ:

127.0.0.1


หมายถึงเครื่องเดียวกับ Backend

แต่ AI Server อยู่ที่:

10.192.0.232


ซึ่งเป็นอีกเครื่องหนึ่งใน Network

ดังนั้น Backend ต้องเรียก:

http://10.192.0.232:7860


---

# 34. การจัดการ AI Configuration

ไม่ควรใส่ URL AI กระจายอยู่หลายตำแหน่งใน Code

ควรกำหนด Configuration:

FORGE_URL = "http://10.192.0.232:7860"


แล้วเรียกผ่าน:

f"{FORGE_URL}/sdapi/v1/txt2img"


ข้อดี:

- เปลี่ยน IP ได้ง่าย
- ลดการแก้ Code หลายจุด
- ลดความผิดพลาด
- รองรับการเปลี่ยนเครื่อง AI

ในอนาคตสามารถย้าย Configuration
ไป Environment Variable ได้

---

# 35. Backend กับ Frontend

แนวทางการทำงาน:

Frontend
    |
    | HTTP Request
    v
Backend
    |
    | Processing
    v
AI / Database
    |
    v
Backend
    |
    | HTTP Response
    v
Frontend


Backend จะรับผิดชอบ:

- Request Validation
- Business Logic
- AI Request
- Database Request
- Error Handling
- Response Formatting

---

# 36. Backend กับ Database

Database ยังไม่ได้เชื่อมต่อจริงในขั้นตอนนี้

ต้องประสานงานกับสมาชิกที่รับผิดชอบ Database ก่อน

ข้อมูลที่ต้องทราบ:

1. ใช้ Database อะไร
2. Database อยู่เครื่องไหน
3. Port อะไร
4. Database Name
5. User
6. Authentication
7. ตารางที่มี
8. Column ต่าง ๆ
9. ความสัมพันธ์ของข้อมูล

หลังจากได้ข้อมูลแล้วจึงเลือก Package
และออกแบบ Database Layer

---

# 37. Backend กับ Frontend

ก่อนสร้าง API จริงต้องประสานงานกับ Frontend

ข้อมูลที่ต้องตกลง:

1. Endpoint
2. HTTP Method
3. Request Body
4. Response Body
5. Status Code
6. Error Format
7. รูปแบบข้อมูลรูปภาพ
8. Authentication ถ้ามี

ตัวอย่าง:

POST /api/generate


Request:

{
    "prompt": "a cute cat"
}


Response:

{
    "image": "base64..."
}


หมายเหตุ:

Endpoint นี้เป็นเพียงตัวอย่าง
ยังไม่ใช่ API จริงของระบบจนกว่าจะตกลงกับสมาชิกทีม

---

# 38. สถานะปัจจุบัน

## Environment

[x] Python 3.10.11

[x] Git 2.54.0

[x] Virtual Environment

[x] Flask 3.1.3

[x] requirements.txt


## Flask

[x] Flask Application

[x] /health Endpoint

[x] Flask Server

[x] Local Testing


## Git

[x] backend Branch

[x] requirements Commit

[x] app.py Commit

[x] backend -> backend-ai Merge

[x] backend-ai Push

[x] Git Status Clean


## AI

[ ] ตรวจสอบ Network

[ ] ทดสอบ Forge API

[ ] สร้าง forge_test.png

[ ] ติดตั้ง requests

[ ] สร้าง AI Service

[ ] เชื่อม AI กับ Flask


## Database

[ ] รับข้อมูลจากสมาชิก Database

[ ] เลือก Database Package

[ ] สร้าง Database Connection

[ ] สร้าง Database Layer

[ ] ทดสอบ Database


## Frontend

[ ] รับ API Requirement

[ ] กำหนด Endpoint

[ ] กำหนด Request Format

[ ] กำหนด Response Format

[ ] เชื่อม Frontend กับ Backend


## Integration

[ ] เชื่อม Frontend -> Backend

[ ] เชื่อม Backend -> AI

[ ] เชื่อม Backend -> Database

[ ] ทดสอบ End-to-End

---

# 39. ขั้นตอนถัดไป

ลำดับการพัฒนาที่แนะนำ:

1. คุยกับสมาชิก Frontend
2. กำหนด API
3. คุยกับสมาชิก AI
4. ทดสอบ Forge API
5. ติดตั้ง requests
6. สร้าง AI Service
7. คุยกับสมาชิก Database
8. เชื่อม Database
9. รวมทุก Service เข้ากับ Flask
10. ทดสอบ API
11. ทดสอบ End-to-End
12. Commit
13. Push
14. Merge ตาม Workflow ของทีม

---

# 40. คำสั่งสำคัญที่ใช้ใน Backend

## ตรวจสอบ Branch

git branch


## เปลี่ยน Branch

git switch <branch>


ตัวอย่าง:

git switch backend


## ตรวจสอบสถานะ

git status


## ดึงข้อมูล Remote

git fetch origin


## Pull

git pull


## เพิ่มไฟล์

git add <file>


## Commit

git commit -m "message"


## Push

git push origin <branch>


## Merge

git merge <branch>


---

# 41. วิธีเริ่มทำงาน Backend ในแต่ละวัน

เปิด PowerShell

เข้า Project:

cd "C:\Ai gen\ProjectFN\LUMA-group11"


ตรวจสอบ Branch:

git branch


เปลี่ยนไป Branch ที่กำลังทำงาน:

git switch backend-ai


ตรวจสอบสถานะ:

git status


เปิด Virtual Environment:

.\venv\Scripts\Activate.ps1


หากติด Execution Policy:

Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

.\venv\Scripts\Activate.ps1


จากนั้นสามารถเริ่มพัฒนา Backend ได้

---

# 42. วิธีจบงานแต่ละวัน

ตรวจสอบ:

git status


ดูการเปลี่ยนแปลง:

git diff


เพิ่มไฟล์ที่ต้องการ:

git add <file>


Commit:

git commit -m "Describe changes"


Push:

git push origin <branch>


ตรวจสอบ:

git status


ควรได้:

nothing to commit, working tree clean

---

# 43. หลักการทำงานของ Logbook

Logbook นี้จะบันทึก:

- วันที่
- สิ่งที่ทำ
- ตำแหน่งที่ทำ
- Command ที่ใช้
- ผลลัพธ์
- Error ที่พบ
- วิธีแก้
- ผลการทดสอบ
- การตัดสินใจด้าน Design
- สถานะของงาน

เมื่อมีการพัฒนา Backend เพิ่มเติม
ให้เพิ่มบันทึกใหม่ต่อท้าย Logbook
แทนการลบประวัติเดิม

---

# 44. สรุป

Backend ได้เตรียม Environment และ Flask Server พื้นฐานเรียบร้อยแล้ว

สิ่งที่สำเร็จ:

Python
    ↓
Virtual Environment
    ↓
Flask
    ↓
Flask Application
    ↓
/health
    ↓
ทดสอบสำเร็จ


Git Workflow:

main
    ↓
backend
    ↓
backend-ai
    ↓
GitHub


ขั้นตอนต่อไปคือ:

Frontend
    ↓
Backend
    ↓
AI
    +
Database


โดยรายละเอียดของ API และ Integration จริง
จะกำหนดร่วมกับสมาชิกแต่ละส่วนก่อนเริ่มพัฒนาระบบเต็มรูปแบบ