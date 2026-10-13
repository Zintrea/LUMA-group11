"""Contract tests for LUMA's PC2 background-removal service."""

import io
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from server import _remove_with_rembg, create_app, write_pid_file


PNG_BYTES = b"\x89PNG\r\n\x1a\nLUMA-TEST-PNG"


class RemoveBackgroundApiTests(unittest.TestCase):
    def setUp(self):
        self.received = None

        def fake_remove(image_bytes: bytes) -> bytes:
            self.received = image_bytes
            return PNG_BYTES

        app = create_app(remove_background=fake_remove)
        app.config["TESTING"] = True
        self.client = app.test_client()

    def test_post_image_returns_png_binary(self):
        response = self.client.post(
            "/api/remove",
            data={"image": (io.BytesIO(b"source-image"), "photo.jpg", "image/jpeg")},
            content_type="multipart/form-data",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.content_type, "image/png")
        self.assertEqual(response.data, PNG_BYTES)
        self.assertEqual(self.received, b"source-image")

    def test_post_without_image_returns_400(self):
        response = self.client.post(
            "/api/remove",
            data={},
            content_type="multipart/form-data",
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json()["message"], "image file is required")

    def test_post_non_image_returns_415(self):
        response = self.client.post(
            "/api/remove",
            data={"image": (io.BytesIO(b"not an image"), "notes.txt", "text/plain")},
            content_type="multipart/form-data",
        )

        self.assertEqual(response.status_code, 415)
        self.assertEqual(response.get_json()["message"], "unsupported image type")

    def test_post_oversized_image_returns_json_413(self):
        app = create_app(remove_background=lambda _image: PNG_BYTES)
        app.config["TESTING"] = True
        app.config["MAX_CONTENT_LENGTH"] = 1
        client = app.test_client()

        response = client.post(
            "/api/remove",
            data={"image": (io.BytesIO(b"too-large"), "photo.jpg", "image/jpeg")},
            content_type="multipart/form-data",
        )

        self.assertEqual(response.status_code, 413)
        self.assertEqual(response.get_json()["message"], "image file exceeds 15 MB limit")

    def test_remover_reuses_the_configured_rembg_session(self):
        session = object()
        with patch("server._load_session", return_value=session), patch(
            "rembg.remove", return_value=PNG_BYTES
        ) as remove:
            result = _remove_with_rembg(b"source-image")

        self.assertEqual(result, PNG_BYTES)
        remove.assert_called_once_with(b"source-image", session=session)

    def test_write_pid_file_contains_the_service_pid(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            pid_file = Path(temp_dir) / "rembg.pid"
            write_pid_file(pid_file, 4321)
            self.assertEqual(pid_file.read_text(encoding="utf-8"), "4321\n")


if __name__ == "__main__":
    unittest.main()
