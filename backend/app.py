import os
from pathlib import Path

import psycopg2
from dotenv import load_dotenv
from flask import Flask
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

# Flask Session Secret Key
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")

# Session Cookie Security
app.config["SESSION_COOKIE_HTTPONLY"] = True
app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
app.config["SESSION_COOKIE_SECURE"] = False

# CORS
CORS(app, supports_credentials=True)

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

app.config["FORGE_URL"] = FORGE_URL
app.config["DATABASE_HOST"] = DATABASE_HOST
app.config["DATABASE_PORT"] = DATABASE_PORT
app.config["DATABASE_NAME"] = DATABASE_NAME
app.config["DATABASE_USER"] = DATABASE_USER
app.config["DATABASE_PASSWORD"] = DATABASE_PASSWORD

# =========================================
# ROUTES
# =========================================

from routes import api

app.register_blueprint(api)

# =========================================
# RUN SERVER
# =========================================

if __name__ == "__main__":

    print("-----------------------------------------")
    print("LUMA Backend")
    print("-----------------------------------------")

    print("ENV file:", ENV_FILE)
    print("ENV exists:", ENV_FILE.exists())

    print("SECRET_KEY exists:", bool(os.getenv("SECRET_KEY")))

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