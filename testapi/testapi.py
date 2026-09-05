import requests

response = requests.post(
    "http://127.0.0.1:7860/login/",
    data={
        "grant_type": "password",
        "username": "ชื่อผู้ใช้จริง",
        "password": "รหัสผ่านจริง",
        "scope": "",
        "client_id": "",
        "client_secret": ""
    },
    headers={
        "accept": "application/json"
    }
)

print("Status:", response.status_code)
print("Content-Type:", response.headers.get("content-type"))
print("Response:", response.text[:500])