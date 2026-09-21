import os
from pathlib import Path

import psycopg2
import requests
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash


# =========================================
# LOAD ENV
# =========================================

BASE_DIR = Path(__file__).resolve().parent
ENV_FILE = BASE_DIR / ".env"

load_dotenv(ENV_FILE)


# =========================================
# FLASK
# =========================================

app = Flask(__name__)
CORS(app)


# =========================================
# CONFIG
# =========================================

FORGE_URL = os.getenv(
    "FORGE_URL",
    "http://10.192.1.91:7860"
)

DATABASE_HOST = os.getenv("DATABASE_HOST")
DATABASE_PORT = os.getenv("DATABASE_PORT", "5432")
DATABASE_NAME = os.getenv("DATABASE_NAME")
DATABASE_USER = os.getenv("DATABASE_USER")
DATABASE_PASSWORD = os.getenv("DATABASE_PASSWORD")


# =========================================
# DATABASE CONNECTION
# =========================================

def get_db_connection():
    return psycopg2.connect(
        host=DATABASE_HOST,
        port=DATABASE_PORT,
        database=DATABASE_NAME,
        user=DATABASE_USER,
        password=DATABASE_PASSWORD
    )


# =========================================
# CHECK AI
# =========================================

def check_ai():
    """
    ตรวจสอบว่า Backend สามารถเชื่อมต่อ AI/Forge ได้หรือไม่
    """

    try:

        response = requests.get(
            f"{FORGE_URL}/sdapi/v1/sd-models",
            timeout=5
        )

        if response.status_code == 200:

            return {
                "status": "ok",
                "ai": "connected",
                "message": "AI/Forge is ready"
            }

        return {
            "status": "error",
            "ai": "not ready",
            "message": f"AI/Forge returned HTTP {response.status_code}"
        }

    except requests.exceptions.ConnectionError:

        return {
            "status": "error",
            "ai": "not connected",
            "message": "Cannot connect to AI/Forge"
        }

    except requests.exceptions.Timeout:

        return {
            "status": "error",
            "ai": "timeout",
            "message": "Connection to AI/Forge timed out"
        }

    except Exception as error:

        return {
            "status": "error",
            "ai": "error",
            "message": str(error)
        }


# =========================================
# CHECK DATABASE
# =========================================

def check_database():
    """
    ตรวจสอบว่า Backend สามารถเชื่อมต่อ PostgreSQL ได้หรือไม่
    """

    conn = None
    cur = None

    try:

        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("SELECT 1;")

        result = cur.fetchone()

        if result and result[0] == 1:

            return {
                "status": "ok",
                "database": "connected",
                "message": "PostgreSQL is ready"
            }

        return {
            "status": "error",
            "database": "not ready",
            "message": "Database test failed"
        }

    except Exception as error:

        return {
            "status": "error",
            "database": "not connected",
            "message": str(error)
        }

    finally:

        if cur:
            cur.close()

        if conn:
            conn.close()


# =========================================
# HEALTH CHECK
# =========================================

@app.route("/health", methods=["GET"])
def health():

    return jsonify({
        "status": "ok"
    })


# =========================================
# AI HEALTH CHECK
# =========================================

@app.route("/ai-health", methods=["GET"])
def ai_health():

    result = check_ai()

    if result["status"] == "ok":

        return jsonify(result), 200

    return jsonify(result), 503


# =========================================
# DATABASE HEALTH CHECK
# =========================================

@app.route("/db-health", methods=["GET"])
def db_health():

    result = check_database()

    if result["status"] == "ok":

        return jsonify(result), 200

    return jsonify(result), 503


# =========================================
# READY CHECK
# BACKEND + AI + DATABASE
# =========================================

@app.route("/ready", methods=["GET"])
def ready():

    # Backend
    backend_status = "ok"

    # AI
    ai_result = check_ai()

    # Database
    database_result = check_database()

    # ตรวจสอบทั้งหมด
    all_ready = (
        backend_status == "ok"
        and ai_result["status"] == "ok"
        and database_result["status"] == "ok"
    )

    if all_ready:

        return jsonify({
            "status": "ready",
            "backend": "ok",
            "ai": "ok",
            "database": "ok"
        }), 200

    return jsonify({
        "status": "not_ready",
        "backend": backend_status,
        "ai": ai_result["status"],
        "database": database_result["status"]
    }), 503


# =========================================
# AUTH - REGISTER
# =========================================

@app.route("/auth/register", methods=["POST"])
def register():

    # -------------------------------------
    # รับข้อมูล
    # -------------------------------------

    data = request.get_json(silent=True)

    if not data:

        return jsonify({
            "status": "error",
            "message": "Request body is required"
        }), 400


    username = str(data.get("username", "")).strip()
    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("password", ""))


    # -------------------------------------
    # ตรวจข้อมูล
    # -------------------------------------

    if not username:

        return jsonify({
            "status": "error",
            "message": "username is required"
        }), 400


    if not email:

        return jsonify({
            "status": "error",
            "message": "email is required"
        }), 400


    if not password:

        return jsonify({
            "status": "error",
            "message": "password is required"
        }), 400


    # -------------------------------------
    # ตรวจความยาว Password
    # -------------------------------------

    if len(password) < 6:

        return jsonify({
            "status": "error",
            "message": "password must be at least 6 characters"
        }), 400


    conn = None
    cur = None

    try:

        conn = get_db_connection()
        cur = conn.cursor()


        # -------------------------------------
        # ตรวจ Username ซ้ำ
        # -------------------------------------

        cur.execute(
            """
            SELECT id
            FROM users
            WHERE username = %s;
            """,
            (username,)
        )

        existing_username = cur.fetchone()

        if existing_username:

            return jsonify({
                "status": "error",
                "message": "username already exists"
            }), 409


        # -------------------------------------
        # ตรวจ Email ซ้ำ
        # -------------------------------------

        cur.execute(
            """
            SELECT id
            FROM users
            WHERE email = %s;
            """,
            (email,)
        )

        existing_email = cur.fetchone()

        if existing_email:

            return jsonify({
                "status": "error",
                "message": "email already exists"
            }), 409


        # -------------------------------------
        # Hash Password
        # -------------------------------------

        password_hash = generate_password_hash(password)


        # -------------------------------------
        # สร้าง User
        #
        # role = user เสมอ
        # is_active = true
        # -------------------------------------

        cur.execute(
            """
            INSERT INTO users
            (
                username,
                email,
                password_hash,
                role,
                is_active
            )
            VALUES
            (
                %s,
                %s,
                %s,
                'user',
                TRUE
            )
            RETURNING
                id,
                username,
                email,
                role,
                is_active,
                created_at;
            """,
            (
                username,
                email,
                password_hash
            )
        )


        user = cur.fetchone()

        conn.commit()


        # -------------------------------------
        # ส่งข้อมูลกลับ
        # ไม่ส่ง Password
        # -------------------------------------

        return jsonify({

            "status": "ok",

            "message": "Registration successful",

            "user": {

                "id": user[0],

                "username": user[1],

                "email": user[2],

                "role": user[3],

                "is_active": user[4],

                "created_at": (
                    user[5].isoformat()
                    if user[5]
                    else None
                )
            }

        }), 201


    except psycopg2.IntegrityError:

        if conn:
            conn.rollback()

        return jsonify({

            "status": "error",

            "message": "Username or email already exists"

        }), 409


    except Exception as error:

        if conn:
            conn.rollback()

        return jsonify({

            "status": "error",

            "message": str(error)

        }), 500


    finally:

        if cur:
            cur.close()

        if conn:
            conn.close()


# =========================================
# AUTH - LOGIN
# =========================================

@app.route("/auth/login", methods=["POST"])
def login():
    data = request.get_json(silent=True)

    username = str(data.get("username", "")).strip()
    password = str(data.get("password", ""))

    if not username or not password:
        return jsonify({
            "message": "username and password are required",
            "status": "error"
        }), 400

    conn = None
    cur = None

    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("""
            SELECT
                id,
                username,
                email,
                password_hash,
                role,
                is_active,
                created_at
            FROM users
            WHERE username = %s
        """, (username,))

        user = cur.fetchone()

        if not user:
            return jsonify({
                "message": "Invalid username or password",
                "status": "error"
            }), 401

        (
            user_id,
            username,
            email,
            password_hash,
            role,
            is_active,
            created_at
        ) = user

        if not is_active:
            return jsonify({
                "message": "User account is inactive",
                "status": "error"
            }), 403

        # ตรวจสอบ Password
        password_valid = False

        try:
            password_valid = check_password_hash(
                password_hash,
                password
            )
        except Exception:
            password_valid = False

        # รองรับ User เก่าที่เก็บ Password เป็น Plain Text
        if not password_valid and password_hash == password:

            new_hash = generate_password_hash(password)

            cur.execute("""
                UPDATE users
                SET password_hash = %s
                WHERE id = %s
            """, (new_hash, user_id))

            conn.commit()

            password_valid = True

        if not password_valid:
            return jsonify({
                "message": "Invalid username or password",
                "status": "error"
            }), 401

        return jsonify({
            "message": "Login successful",
            "status": "success",
            "user": {
                "id": user_id,
                "username": username,
                "email": email,
                "role": role,
                "is_active": is_active,
                "created_at": created_at.isoformat()
            }
        }), 200

    except Exception as e:

        if conn:
            conn.rollback()

        return jsonify({
            "message": str(e),
            "status": "error"
        }), 500

    finally:

        if cur:
            cur.close()

        if conn:
            conn.close()
            
# =========================================
# GENERATE
# FRONTEND → BACKEND → DATABASE → FORGE
# =========================================

@app.route("/generate", methods=["POST"])
def generate():

    # -------------------------------------
    # รับข้อมูลจาก Frontend
    # -------------------------------------

    data = request.get_json(silent=True)

    if not data:

        return jsonify({
            "status": "error",
            "message": "Request body is required"
        }), 400


    prompt = str(data.get("prompt", "")).strip()


    if not prompt:

        return jsonify({
            "status": "error",
            "message": "prompt is required"
        }), 400


    # -------------------------------------
    # Parameters สำหรับ Forge
    # -------------------------------------

    negative_prompt = data.get(
        "negative_prompt",
        "low quality, blurry"
    )

    steps = data.get("steps", 10)
    width = data.get("width", 512)
    height = data.get("height", 512)
    cfg_scale = data.get("cfg_scale", 7)

    sampler_name = data.get(
        "sampler_name",
        "Euler a"
    )


    # -------------------------------------
    # ตอนนี้ใช้ user_id = 1 สำหรับทดสอบ
    # -------------------------------------

    user_id = data.get("user_id", 1)


    # -------------------------------------
    # DATABASE
    # สร้าง task ก่อนเริ่ม Generate
    # -------------------------------------

    conn = None
    cur = None
    task_id = None


    try:

        conn = get_db_connection()
        cur = conn.cursor()


        # -------------------------------------
        # สร้าง task เป็น pending
        # -------------------------------------

        cur.execute(
            """
            INSERT INTO image_tasks
            (
                user_id,
                task_type,
                status,
                prompt_text
            )
            VALUES
            (
                %s,
                'generate',
                'pending',
                %s
            )
            RETURNING id;
            """,
            (
                user_id,
                prompt
            )
        )


        task_id = cur.fetchone()[0]

        conn.commit()


        print(
            f"Task created: {task_id}"
        )


        # -------------------------------------
        # เปลี่ยนสถานะเป็น processing
        # -------------------------------------

        cur.execute(
            """
            UPDATE image_tasks
            SET status = 'processing'
            WHERE id = %s;
            """,
            (task_id,)
        )


        conn.commit()


        # =====================================
        # ส่ง Prompt ไป Forge
        # =====================================

        payload = {

            "prompt": prompt,

            "negative_prompt": negative_prompt,

            "steps": steps,

            "width": width,

            "height": height,

            "cfg_scale": cfg_scale,

            "sampler_name": sampler_name
        }


        print(
            "Sending prompt to Forge..."
        )

        print(
            "Prompt:",
            prompt
        )


        response = requests.post(

            f"{FORGE_URL}/sdapi/v1/txt2img",

            json=payload,

            timeout=180
        )


        response.raise_for_status()


        forge_data = response.json()


        # -------------------------------------
        # ตรวจสอบรูปจาก Forge
        # -------------------------------------

        if "images" not in forge_data:

            raise Exception(
                "Forge did not return images"
            )


        if not forge_data["images"]:

            raise Exception(
                "Forge returned empty image"
            )


        image_base64 = forge_data["images"][0]


        # =====================================
        # Generate สำเร็จ
        # เปลี่ยน status → completed
        # =====================================

        cur.execute(
            """
            UPDATE image_tasks
            SET status = 'completed'
            WHERE id = %s;
            """,
            (task_id,)
        )


        conn.commit()


        print(
            f"Task {task_id} completed"
        )


        # =====================================
        # ส่งรูปกลับ Frontend
        # =====================================

        return jsonify({

            "status": "ok",

            "task_id": task_id,

            "image": image_base64

        }), 200


    # =====================================
    # ERROR - AI CONNECTION
    # =====================================

    except requests.exceptions.ConnectionError:

        if conn and task_id:

            cur.execute(
                """
                UPDATE image_tasks
                SET status = 'failed'
                WHERE id = %s;
                """,
                (task_id,)
            )

            conn.commit()


        return jsonify({

            "status": "error",

            "message": "AI server is unavailable",

            "task_id": task_id

        }), 503


    # =====================================
    # ERROR - AI TIMEOUT
    # =====================================

    except requests.exceptions.Timeout:

        if conn and task_id:

            cur.execute(
                """
                UPDATE image_tasks
                SET status = 'failed'
                WHERE id = %s;
                """,
                (task_id,)
            )

            conn.commit()


        return jsonify({

            "status": "error",

            "message": "AI request timeout",

            "task_id": task_id

        }), 504


    # =====================================
    # ERROR - GENERAL
    # =====================================

    except Exception as error:

        if conn and task_id:

            cur.execute(
                """
                UPDATE image_tasks
                SET status = 'failed'
                WHERE id = %s;
                """,
                (task_id,)
            )

            conn.commit()


        return jsonify({

            "status": "error",

            "message": str(error),

            "task_id": task_id

        }), 500


    finally:

        if cur:
            cur.close()

        if conn:
            conn.close()


# =========================================
# RUN SERVER
# =========================================

if __name__ == "__main__":

    print("-----------------------------------------")
    print("LUMA Backend")
    print("-----------------------------------------")

    print(
        "ENV file:",
        ENV_FILE
    )

    print(
        "ENV exists:",
        ENV_FILE.exists()
    )

    print(
        "Database Host:",
        DATABASE_HOST
    )

    print(
        "Database Port:",
        DATABASE_PORT
    )

    print(
        "Database Name:",
        DATABASE_NAME
    )

    print(
        "Database User:",
        DATABASE_USER
    )

    print(
        "Database Password exists:",
        bool(DATABASE_PASSWORD)
    )

    print(
        "Forge URL:",
        FORGE_URL
    )

    print("-----------------------------------------")

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )