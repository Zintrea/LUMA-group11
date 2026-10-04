"""Verify the live LUMA PC2 rembg service using the PC3 request contract."""

from __future__ import annotations

import os
import sys
from pathlib import Path

import requests


ROOT = Path(__file__).resolve().parent
INPUT_FILE = ROOT / "test-input.png"
OUTPUT_DIR = ROOT / "output"
SERVICE_URL = os.getenv("REMBG_URL", "http://127.0.0.1:7000").rstrip("/")


def main() -> int:
    if not INPUT_FILE.exists():
        print(f"FAIL: Test input is missing: {INPUT_FILE}")
        return 1

    OUTPUT_DIR.mkdir(exist_ok=True)
    output_file = OUTPUT_DIR / "verify-output.png"

    try:
        with INPUT_FILE.open("rb") as image_file:
            response = requests.post(
                f"{SERVICE_URL}/api/remove",
                files={"image": (INPUT_FILE.name, image_file, "image/png")},
                timeout=180,
            )
    except requests.RequestException as error:
        print(f"FAIL: Cannot call {SERVICE_URL}/api/remove")
        print(error)
        return 1

    if response.status_code != 200:
        print(f"FAIL: Expected HTTP 200, received HTTP {response.status_code}")
        print(response.text[:500])
        return 1

    content_type = response.headers.get("Content-Type", "").split(";", 1)[0]
    if content_type != "image/png":
        print(f"FAIL: Expected image/png, received {content_type or 'missing content type'}")
        return 1

    if not response.content.startswith(b"\x89PNG\r\n\x1a\n"):
        print("FAIL: Response body is not a valid PNG stream")
        return 1

    output_file.write_bytes(response.content)
    print("PASS: PC2 rembg service accepted multipart field 'image'")
    print("PASS: Service returned non-empty image/png output")
    print(f"Output: {output_file}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
