"""LUMA PC2 Background Removal Service.

This service accepts the LUMA contract expected by PC3:
POST /api/remove with multipart field `image`, returning PNG bytes.
"""

from __future__ import annotations

import argparse
import logging
import os
from collections.abc import Callable
from functools import lru_cache
from pathlib import Path

from flask import Flask, jsonify, request, send_file
from io import BytesIO


ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_UPLOAD_BYTES = 15 * 1024 * 1024
RemoveFunction = Callable[[bytes], bytes]


@lru_cache(maxsize=1)
def _load_session():
    """Create the selected CPU rembg session once per running service."""
    from rembg import new_session

    return new_session(os.getenv("REMBG_MODEL", "u2net"))


def _remove_with_rembg(image_bytes: bytes) -> bytes:
    """Load rembg only in the live service, keeping unit tests lightweight."""
    from rembg import remove

    return remove(image_bytes, session=_load_session())


def write_pid_file(pid_file: Path, pid: int) -> None:
    """Persist the exact child process ID used by the stop script."""
    pid_file.write_text(f"{pid}\n", encoding="utf-8")


def create_app(remove_background: RemoveFunction | None = None) -> Flask:
    app = Flask(__name__)
    app.config["MAX_CONTENT_LENGTH"] = MAX_UPLOAD_BYTES
    remover = remove_background or _remove_with_rembg

    @app.post("/api/remove")
    def remove_background_route():
        uploaded = request.files.get("image")
        if uploaded is None or not uploaded.filename:
            return jsonify({"status": "error", "message": "image file is required"}), 400

        if uploaded.mimetype not in ALLOWED_MIME_TYPES:
            return jsonify({"status": "error", "message": "unsupported image type"}), 415

        image_bytes = uploaded.read()
        if not image_bytes:
            return jsonify({"status": "error", "message": "image file is empty"}), 400

        try:
            output_png = remover(image_bytes)
        except Exception:
            app.logger.exception("Background removal failed")
            return jsonify({"status": "error", "message": "background removal failed"}), 500

        app.logger.info(
            "Background removal completed: filename=%s input_bytes=%d output_bytes=%d",
            uploaded.filename,
            len(image_bytes),
            len(output_png),
        )
        return send_file(
            BytesIO(output_png),
            mimetype="image/png",
            as_attachment=False,
            download_name="background-removed.png",
        )

    @app.errorhandler(413)
    def file_too_large(_error):
        return jsonify({"status": "error", "message": "image file exceeds 15 MB limit"}), 413

    return app


def main() -> None:
    parser = argparse.ArgumentParser(description="LUMA PC2 rembg CPU service")
    parser.add_argument("--host", default=os.getenv("REMBG_HOST", "0.0.0.0"))
    parser.add_argument("--port", type=int, default=int(os.getenv("REMBG_PORT", "7000")))
    parser.add_argument("--pid-file", type=Path)
    args = parser.parse_args()

    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s %(message)s",
    )
    app = create_app()
    if args.pid_file:
        write_pid_file(args.pid_file, os.getpid())

    try:
        app.run(host=args.host, port=args.port, debug=False, use_reloader=False)
    finally:
        if args.pid_file:
            args.pid_file.unlink(missing_ok=True)


if __name__ == "__main__":
    main()
