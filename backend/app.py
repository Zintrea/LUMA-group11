import os
from pathlib import Path

import psycopg2
import requests
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS


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
    "http://10.192.0.232:7860"
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
# HEALTH CHECK
# =========================================

@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok"
    })


# =========================================
# DATABASE HEALTH CHECK
# =========================================

@app.route("/db-health", methods=["GET"])
def db_health():

    conn = None
    cur = None

    try:

        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("SELECT 1;")

        result = cur.fetchone()

        return jsonify({
            "status": "ok",
            "database": "connected",
            "result": result[0]
        })

    except Exception as error:

        return jsonify({
            "status": "error",
            "database": "not connected",
            "message": str(error)
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

    data = request.get_json()

    if not data:

        return jsonify({
            "status": "error",
            "message": "Request body is required"
        }), 400


    prompt = data.get("prompt", "").strip()


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


        # สร้าง task เป็น pending

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


        print(f"Task created: {task_id}")


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


        print("Sending prompt to Forge...")
        print("Prompt:", prompt)


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
    # ERROR
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

    print("ENV file:", ENV_FILE)
    print("ENV exists:", ENV_FILE.exists())

    print("Database Host:", DATABASE_HOST)
    print("Database Port:", DATABASE_PORT)
    print("Database Name:", DATABASE_NAME)
    print("Database User:", DATABASE_USER)

    print(
        "Database Password exists:",
        bool(DATABASE_PASSWORD)
    )

    print("Forge URL:", FORGE_URL)

    print("-----------------------------------------")

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )