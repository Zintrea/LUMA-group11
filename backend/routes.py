from flask import Blueprint, jsonify, request, current_app, session,send_file
import psycopg2
import requests
from werkzeug.security import generate_password_hash, check_password_hash
from hismat import hismat
from PIL import Image
from io import BytesIO
api = Blueprint("api", __name__)

# =========================================
# ALLOWED AI MODELS
# =========================================
# Frontend sends only "realistic" or "anime".
# Backend maps those keys to the exact model title used by Forge.
ALLOWED_MODELS = {
    "realistic": "sd\\beautifulRealistic_brav5.safetensors [ac68270450]",
    "anime": "sd\\anyloraCheckpoint_bakedvaeBlessedFp16.safetensors [ef49fbb25f]"
}

# =========================================
# DATABASE CONNECTION
# =========================================

def get_db_connection():
    return psycopg2.connect(
        host=current_app.config["DATABASE_HOST"],
        port=current_app.config["DATABASE_PORT"],
        database=current_app.config["DATABASE_NAME"],
        user=current_app.config["DATABASE_USER"],
        password=current_app.config["DATABASE_PASSWORD"]
    )

# =========================================
# ADMIN AUTHORIZATION
# =========================================

def require_admin():
    """
    ตรวจสอบว่า User ที่ Login อยู่เป็น Admin หรือไม่
    """

    user_id = session.get("user_id")

    # ยังไม่ได้ Login
    if not user_id:
        return False, 401

    conn = None
    cur = None

    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("""
            SELECT role, is_active
            FROM users
            WHERE id = %s
        """, (user_id,))

        user = cur.fetchone()

        # ไม่พบ User
        if not user:
            return False, 401

        role, is_active = user

        # Account ถูกปิด
        if not is_active:
            return False, 403

        # ไม่ใช่ Admin
        if role != "admin":
            return False, 403

        return True, 200

    except Exception:
        return False, 500

    finally:
        if cur:
            cur.close()

        if conn:
            conn.close()

# =========================================
# ADMIN AUTHORIZATION RESPONSE
# =========================================

def admin_auth_error(status_code):
    if status_code == 401:
        return jsonify({
            "status": "error",
            "message": "Authentication required"
        }), 401

    if status_code == 403:
        return jsonify({
            "status": "error",
            "message": "Admin access required"
        }), 403

    return jsonify({
        "status": "error",
        "message": "Authorization check failed"
    }), 500

# =========================================
# CHECK AI
# =========================================

def check_ai():
    """
    ตรวจสอบว่า Backend สามารถเชื่อมต่อ AI/Forge ได้หรือไม่
    """

    try:

        response = requests.get(
            f"{current_app.config['FORGE_URL']}/sdapi/v1/sd-models",
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

@api.route("/health", methods=["GET"])
def health():

    return jsonify({
        "status": "ok"
    })


# =========================================
# AI HEALTH CHECK
# =========================================

@api.route("/ai-health", methods=["GET"])
def ai_health():

    result = check_ai()

    if result["status"] == "ok":

        return jsonify(result), 200

    return jsonify(result), 503

# =========================================
# FEATURE HEALTH CHECK
# =========================================

def check_hismat():
    try:
        if callable(hismat):
            return "ok"
        return "error"
    except Exception:
        return "error"


def check_remove_bg():
    try:
        response = requests.get(
            current_app.config["REMBG_URL"],
            timeout=5
        )

        if response.status_code < 500:
            return "ok"

        return "error"

    except Exception:
        return "error"
    
# =========================================
# DATABASE HEALTH CHECK
# =========================================

@api.route("/db-health", methods=["GET"])
def db_health():

    result = check_database()

    if result["status"] == "ok":

        return jsonify(result), 200

    return jsonify(result), 503


# =========================================
# READY CHECK
# BACKEND + AI + DATABASE
# =========================================

# =========================================
# READY CHECK
# BACKEND + AI + DATABASE + FEATURES
# =========================================

@api.route("/ready", methods=["GET"])
def ready():

    backend_status = "ok"

    ai_result = check_ai()
    database_result = check_database()

    hismat_status = check_hismat()
    remove_bg_status = check_remove_bg()

    all_ready = (
        backend_status == "ok"
        and ai_result["status"] == "ok"
        and database_result["status"] == "ok"
        and hismat_status == "ok"
        and remove_bg_status == "ok"
    )

    return jsonify({
        "status": "ready" if all_ready else "not_ready",
        "backend": backend_status,
        "ai": ai_result["status"],
        "database": database_result["status"],
        "hismat": hismat_status,
        "remove_bg": remove_bg_status
    }), 200 if all_ready else 503

# =========================================
# ADMIN - DASHBOARD
# =========================================

@api.route("/admin/dashboard", methods=["GET"])
def admin_dashboard():

    # ตรวจสิทธิ์ Admin
    is_admin, status_code = require_admin()

    if not is_admin:
        return admin_auth_error(status_code)

    conn = None
    cur = None

    try:
        conn = get_db_connection()
        cur = conn.cursor()

        # -------------------------------------
        # TOTAL USERS
        # -------------------------------------

        cur.execute("""
            SELECT COUNT(*)
            FROM users;
        """)

        total_users = cur.fetchone()[0]

        # -------------------------------------
        # IMAGES TODAY
        # -------------------------------------

        cur.execute("""
            SELECT COUNT(*)
            FROM image_tasks
            WHERE task_type = 'generate'
              AND status = 'completed'
              AND created_at >= CURRENT_DATE;
        """)

        images_today = cur.fetchone()[0]

        # -------------------------------------
        # FAILED TASKS
        # -------------------------------------

        cur.execute("""
            SELECT COUNT(*)
            FROM image_tasks
            WHERE status = 'failed';
        """)

        failed_tasks = cur.fetchone()[0]

        # -------------------------------------
        # AI FORGE
        # -------------------------------------

        ai_result = check_ai()

        if ai_result["status"] == "ok":
            ai_status = "online"
        else:
            ai_status = "offline"

        # -------------------------------------
        # RESPONSE
        # -------------------------------------

        return jsonify({
            "status": "success",
            "stats": {
                "total_users": total_users,
                "images_today": images_today,
                "failed_tasks": failed_tasks,
                "ai_forge": ai_status
            }
        }), 200

    except Exception as error:

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
# ADMIN - USERS
# =========================================

@api.route("/admin/users", methods=["GET"])
def admin_users():
    """แสดงรายการผู้ใช้สำหรับ Admin โดยไม่ส่ง password/password_hash"""

    is_admin, status_code = require_admin()
    if not is_admin:
        return admin_auth_error(status_code)

    conn = None
    cur = None

    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("""
            SELECT id, username, email, role, is_active, created_at
            FROM users
            ORDER BY id ASC
        """)

        rows = cur.fetchall()

        users = []
        for row in rows:
            users.append({
                "id": row[0],
                "username": row[1],
                "email": row[2],
                "role": row[3],
                "is_active": row[4],
                "created_at": row[5].isoformat() if row[5] else None
            })

        return jsonify({
            "status": "success",
            "users": users,
            "count": len(users)
        }), 200

    except Exception as error:
        return jsonify({
            "status": "error",
            "message": str(error)
        }), 500

    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@api.route("/admin/users/<int:user_id>", methods=["GET"])
def admin_user_detail(user_id):
    """แสดงข้อมูลผู้ใช้รายคนสำหรับ Admin"""

    is_admin, status_code = require_admin()
    if not is_admin:
        return admin_auth_error(status_code)

    conn = None
    cur = None

    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("""
            SELECT id, username, email, role, is_active, created_at
            FROM users
            WHERE id = %s
        """, (user_id,))

        row = cur.fetchone()

        if not row:
            return jsonify({
                "status": "error",
                "message": "User not found"
            }), 404

        return jsonify({
            "status": "success",
            "user": {
                "id": row[0],
                "username": row[1],
                "email": row[2],
                "role": row[3],
                "is_active": row[4],
                "created_at": row[5].isoformat() if row[5] else None
            }
        }), 200

    except Exception as error:
        return jsonify({
            "status": "error",
            "message": str(error)
        }), 500

    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@api.route("/admin/users/<int:user_id>", methods=["PATCH"])
def admin_update_user(user_id):
    """Admin แก้ role และสถานะ active ของผู้ใช้"""

    is_admin, status_code = require_admin()
    if not is_admin:
        return admin_auth_error(status_code)

    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({
            "status": "error",
            "message": "Request body is required"
        }), 400

    allowed_fields = {"role", "is_active"}
    unknown_fields = set(data.keys()) - allowed_fields
    if unknown_fields:
        return jsonify({
            "status": "error",
            "message": "Only role and is_active can be updated"
        }), 400

    if "role" not in data and "is_active" not in data:
        return jsonify({
            "status": "error",
            "message": "role or is_active is required"
        }), 400

    if "role" in data:
        role = str(data["role"]).strip().lower()
        if role not in {"user", "admin"}:
            return jsonify({
                "status": "error",
                "message": "role must be user or admin"
            }), 400
    else:
        role = None

    if "is_active" in data:
        is_active = data["is_active"]
        if not isinstance(is_active, bool):
            return jsonify({
                "status": "error",
                "message": "is_active must be a boolean"
            }), 400
    else:
        is_active = None

    current_user_id = session.get("user_id")

    # ป้องกัน Admin ปิดบัญชีตัวเองหรือถอดสิทธิ์ Admin ของตัวเอง
    if user_id == current_user_id:
        if is_active is False:
            return jsonify({
                "status": "error",
                "message": "Admin cannot deactivate their own account"
            }), 400

        if role == "user":
            return jsonify({
                "status": "error",
                "message": "Admin cannot remove their own admin role"
            }), 400

    conn = None
    cur = None

    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("SELECT id FROM users WHERE id = %s", (user_id,))
        if not cur.fetchone():
            return jsonify({
                "status": "error",
                "message": "User not found"
            }), 404

        updates = []
        values = []

        if role is not None:
            updates.append("role = %s")
            values.append(role)

        if is_active is not None:
            updates.append("is_active = %s")
            values.append(is_active)

        values.append(user_id)

        cur.execute(
            f"""
            UPDATE users
            SET {', '.join(updates)}
            WHERE id = %s
            RETURNING id, username, email, role, is_active, created_at;
            """,
            tuple(values)
        )

        row = cur.fetchone()
        conn.commit()

        return jsonify({
            "status": "success",
            "message": "User updated successfully",
            "user": {
                "id": row[0],
                "username": row[1],
                "email": row[2],
                "role": row[3],
                "is_active": row[4],
                "created_at": row[5].isoformat() if row[5] else None
            }
        }), 200

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
# ADMIN - RECENT GENERATIONS
# =========================================

@api.route("/admin/recent-generations", methods=["GET"])
def admin_recent_generations():
    """แสดง Generation ล่าสุดจาก image_tasks"""

    is_admin, status_code = require_admin()
    if not is_admin:
        return admin_auth_error(status_code)

    conn = None
    cur = None

    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("""
            SELECT
                image_tasks.id,
                image_tasks.user_id,
                users.username,
                image_tasks.prompt_text,
                image_tasks.status,
                image_tasks.output_image_path,
                image_tasks.created_at,
                image_tasks.updated_at
            FROM image_tasks
            LEFT JOIN users
                ON image_tasks.user_id = users.id
            WHERE image_tasks.task_type = 'generate'
            ORDER BY image_tasks.created_at DESC
            LIMIT 10
        """)

        rows = cur.fetchall()

        generations = []
        for row in rows:
            generations.append({
                "task_id": row[0],
                "user_id": row[1],
                "username": row[2],
                "prompt": row[3],
                "model": None,
                "status": row[4],
                "output_image_path": row[5],
                "created_at": row[6].isoformat() if row[6] else None,
                "updated_at": row[7].isoformat() if row[7] else None
            })

        return jsonify({
            "status": "success",
            "generations": generations,
            "count": len(generations)
        }), 200

    except Exception as error:
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
# ADMIN - AI SERVER
# =========================================

@api.route("/admin/ai", methods=["GET"])
def admin_ai():

    is_admin, status_code = require_admin()

    if not is_admin:
        return admin_auth_error(status_code)

    ai_result = check_ai()

    if ai_result["status"] == "ok":
        return jsonify({
            "status": "success",
            "ai": {
                "status": "online",
                "message": ai_result["message"]
            }
        }), 200

    return jsonify({
        "status": "success",
        "ai": {
            "status": "offline",
            "message": ai_result["message"]
        }
    }), 200

# =========================================
# ADMIN - AI MODELS
# =========================================

@api.route("/admin/ai/models", methods=["GET"])
def admin_ai_models():

    is_admin, status_code = require_admin()

    if not is_admin:
        return admin_auth_error(status_code)

    try:

        response = requests.get(
            f"{current_app.config['FORGE_URL']}/sdapi/v1/sd-models",
            timeout=10
        )

        response.raise_for_status()

        forge_models = response.json()

        models = []

        for model in forge_models:
            models.append({
                "title": model.get("title"),
                "model_name": model.get("model_name"),
                "hash": model.get("hash"),
                "sha256": model.get("sha256"),
                "filename": model.get("filename")
            })

        return jsonify({
            "status": "success",
            "models": models
        }), 200

    except requests.exceptions.ConnectionError:

        return jsonify({
            "status": "error",
            "message": "Cannot connect to AI/Forge"
        }), 503

    except requests.exceptions.Timeout:

        return jsonify({
            "status": "error",
            "message": "Connection to AI/Forge timed out"
        }), 504

    except Exception as error:

        return jsonify({
            "status": "error",
            "message": str(error)
        }), 500
    
@api.route("/auth/register", methods=["POST"])
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

            "status": "success",

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

@api.route("/auth/login", methods=["POST"])
def login():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"status": "error", "message": "Request body is required"}), 400

    login_value = str(data.get("username", "")).strip()
    password = str(data.get("password", ""))
    if not login_value or not password:
        return jsonify({"status": "error", "message": "username/email and password are required"}), 400

    conn = None
    cur = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            SELECT id, username, email, password_hash, role, is_active, created_at
            FROM users
            WHERE username = %s OR email = %s
        """, (login_value, login_value))
        user = cur.fetchone()
        if not user:
            return jsonify({"status": "error", "message": "Invalid username/email or password"}), 401

        user_id, username, email, password_hash, role, is_active, created_at = user
        if not is_active:
            return jsonify({"status": "error", "message": "User account is inactive"}), 403

        try:
            password_valid = check_password_hash(password_hash, password)
        except (ValueError, TypeError):
            password_valid = False

        # Temporary migration for legacy plaintext passwords; remove after migration.
        if not password_valid and password_hash == password:
            new_hash = generate_password_hash(password)
            cur.execute("UPDATE users SET password_hash = %s WHERE id = %s", (new_hash, user_id))
            conn.commit()
            password_valid = True

        if not password_valid:
            return jsonify({"status": "error", "message": "Invalid username/email or password"}), 401

        session.clear()
        session["user_id"] = user_id
        session["username"] = username
        session["role"] = role
        return jsonify({
            "message": "Login successful",
            "status": "success",
            "user": {
                "id": user_id,
                "username": username,
                "email": email,
                "role": role,
                "is_active": is_active,
                "created_at": created_at.isoformat() if created_at else None
            }
        }), 200
    except Exception as error:
        if conn:
            conn.rollback()
        return jsonify({"status": "error", "message": str(error)}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


# =========================================
# AUTH - CURRENT USER
# =========================================

@api.route("/auth/me", methods=["GET"])
def me():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"status": "error", "message": "Not authenticated"}), 401
    conn = None
    cur = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            SELECT id, username, role, is_active
            FROM users
            WHERE id = %s
        """, (user_id,))
        user = cur.fetchone()
        if not user or not user[3]:
            session.clear()
            return jsonify({"status": "error", "message": "Account unavailable"}), 401
        session["user_id"] = user[0]
        session["username"] = user[1]
        session["role"] = user[2]
        return jsonify({"status": "success", "user": {"id": user[0], "username": user[1], "role": user[2]}}), 200
    except Exception as error:
        return jsonify({"status": "error", "message": str(error)}), 500
    finally:
        if cur: cur.close()
        if conn: conn.close()


# =========================================
# AUTH - LOGOUT
# =========================================

@api.route("/auth/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"status": "success", "message": "Logout successful"}), 200


# =========================================
# GENERATE
# FRONTEND → BACKEND → DATABASE → FORGE
# =========================================

@api.route("/generate", methods=["POST"])
def generate():

    # Use the authenticated user, never a user_id supplied by the client.
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"status": "error", "message": "Authentication required"}), 401

    # -------------------------------------
    # รับข้อมูลจาก Frontend
    # -------------------------------------

    data = request.get_json(silent=True)

    if not isinstance(data, dict):

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
    # Model Selection
    # Frontend ส่งเฉพาะ "realistic" หรือ "anime"
    # -------------------------------------

    model_type = str(data.get("model", "")).strip().lower()

    if model_type not in ALLOWED_MODELS:
        return jsonify({
            "status": "error",
            "message": "model must be realistic or anime"
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

            "sampler_name": sampler_name,

            # Tell Forge exactly which checkpoint to use.
            "override_settings": {
                "sd_model_checkpoint": ALLOWED_MODELS[model_type]
            },

            # Restore Forge's previous checkpoint after this request.
            "override_settings_restore_afterwards": True
        }


        print(
            "Sending prompt to Forge..."
        )

        print(
            "Prompt:",
            prompt
        )

        print(
            "Model:",
            model_type,
            "->",
            ALLOWED_MODELS[model_type]
        )


        response = requests.post(

            f"{current_app.config['FORGE_URL']}/sdapi/v1/txt2img",

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

            "status": "success",

            "task_id": task_id,

            "model": model_type,

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
# MODELS
# GET MODEL LIST FROM FORGE
# =========================================

@api.route("/models", methods=["GET"])
def models():

    try:
        response = requests.get(
            f"{current_app.config['FORGE_URL']}/sdapi/v1/sd-models",
            timeout=10
        )

        response.raise_for_status()

        forge_models = response.json()

        models = []

        for model in forge_models:
            models.append({
                "title": model.get("title"),
                "model_name": model.get("model_name"),
                "hash": model.get("hash")
            })

        return jsonify({
            "status": "success",
            "models": models
        }), 200

    except requests.exceptions.ConnectionError:
        return jsonify({
            "status": "error",
            "message": "Cannot connect to AI/Forge"
        }), 503

    except requests.exceptions.Timeout:
        return jsonify({
            "status": "error",
            "message": "Connection to AI/Forge timed out"
        }), 504

    except Exception as error:
        return jsonify({
            "status": "error",
            "message": str(error)
        }), 500

@api.route("/hismat", methods=["POST"])
def hismat_route():
    try:
        if "source_image" not in request.files:
            return jsonify({
                "status": "error",
                "message": "source_image is required"
            }), 400

        if "reference_image" not in request.files:
            return jsonify({
                "status": "error",
                "message": "reference_image is required"
            }), 400

        source_image = Image.open(
            request.files["source_image"]
        ).convert("RGB")

        reference_image = Image.open(
            request.files["reference_image"]
        ).convert("RGB")

        result = hismat(
            source_image,
            reference_image
        )

        output = BytesIO()
        result.save(output, format="PNG")
        output.seek(0)

        return send_file(
            output,
            mimetype="image/png",
            download_name="hismat.png"
        )

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@api.route("/remove-background", methods=["POST"])
def remove_background():

    if "user_id" not in session:
        return jsonify({"error": "Login required"}), 401

    if "image" not in request.files:
        return jsonify({"error": "No image"}), 400

    image = request.files["image"]

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        INSERT INTO image_tasks (user_id, task_type, status, prompt_text)
        VALUES (%s, 'remove_bg', 'processing', %s)
        RETURNING id
    """, (session["user_id"], "Background Removal"))

    task_id = cur.fetchone()[0]
    conn.commit()

    try:
        response = requests.post(
            f"{current_app.config['REMBG_URL']}/api/remove",
            files={"image": (image.filename, image.stream, image.mimetype)},
            timeout=120
        )

        response.raise_for_status()

        cur.execute(
            "UPDATE image_tasks SET status='completed' WHERE id=%s",
            (task_id,)
        )
        conn.commit()

        return send_file(
            BytesIO(response.content),
            mimetype="image/png",
            download_name="background_removed.png"
        )

    except Exception as e:
        cur.execute(
            "UPDATE image_tasks SET status='failed' WHERE id=%s",
            (task_id,)
        )
        conn.commit()

        return jsonify({"error": str(e), "task_id": task_id}), 500

    finally:
        cur.close()
        conn.close()
