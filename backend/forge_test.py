import base64
import requests


# =========================
# AI Forge Configuration
# =========================

FORGE_URL = "http://10.192.0.232:7860"


# =========================
# Prompt Configuration
# =========================

payload = {
    "prompt": "a cute dog, high quality",
    "negative_prompt": "low quality, blurry",
    "steps": 10,
    "width": 512,
    "height": 512,
    "cfg_scale": 7,
    "sampler_name": "Euler a"
}


# =========================
# Send Request to Forge
# =========================

print("กำลังเชื่อมต่อ AI Forge...")
print(f"URL: {FORGE_URL}")

try:
    response = requests.post(
        f"{FORGE_URL}/sdapi/v1/txt2img",
        json=payload,
        timeout=180
    )

    # ตรวจสอบ HTTP Status
    response.raise_for_status()

    print("เชื่อมต่อ AI สำเร็จ")
    print("กำลังรับรูปภาพ...")


    # =========================
    # Read Response
    # =========================

    data = response.json()

    # ดึง Base64 ของรูปภาพ
    image_base64 = data["images"][0]


    # =========================
    # Save Image
    # =========================

    image_data = base64.b64decode(image_base64)

    output_file = "forge_test.png"

    with open(output_file, "wb") as file:
        file.write(image_data)


    print()
    print("================================")
    print("สำเร็จ!")
    print(f"สร้างไฟล์: {output_file}")
    print("================================")


except requests.exceptions.ConnectionError:
    print()
    print("ไม่สามารถเชื่อมต่อ AI Forge ได้")
    print(f"ตรวจสอบว่า AI Server เปิดอยู่ที่: {FORGE_URL}")


except requests.exceptions.Timeout:
    print()
    print("AI ใช้เวลาประมวลผลนานเกิน 180 วินาที")


except requests.exceptions.HTTPError as error:
    print()
    print("AI Server ตอบกลับด้วย HTTP Error")
    print(error)


except KeyError:
    print()
    print("Response จาก AI ไม่มีข้อมูลรูปภาพที่คาดไว้")
    print(data)


except Exception as error:
    print()
    print("เกิดข้อผิดพลาด:")
    print(error)