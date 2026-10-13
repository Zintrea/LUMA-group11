import io
import sys
import unittest
from pathlib import Path

from PIL import Image, ImageChops

BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))

from blur import BLUR_RADII, blur_image
from app import app


class TestBlurImage(unittest.TestCase):
    def test_blur_preserves_image_size_and_mode(self):
        source = Image.new("RGB", (32, 24), "red")

        result = blur_image(source, BLUR_RADII["medium"])

        self.assertEqual(result.mode, "RGB")
        self.assertEqual(result.size, (32, 24))

    def test_blur_changes_a_high_contrast_image(self):
        source = Image.new("RGB", (40, 40), "black")
        source.paste("white", (10, 10, 30, 30))

        result = blur_image(source, BLUR_RADII["high"])

        self.assertIsNotNone(ImageChops.difference(source, result).getbbox())


class TestBlurRoute(unittest.TestCase):
    def setUp(self):
        app.config.update(TESTING=True, SECRET_KEY="test-secret")
        self.client = app.test_client()

    def test_missing_image_returns_400(self):
        response = self.client.post("/blur", data={})

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json()["message"], "image is required")

    def test_invalid_strength_returns_400(self):
        image = Image.new("RGB", (20, 20), "blue")
        data = io.BytesIO()
        image.save(data, format="PNG")
        data.seek(0)

        response = self.client.post(
            "/blur",
            data={
                "image": (data, "source.png"),
                "strength": "maximum",
            },
            content_type="multipart/form-data",
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json()["message"], "strength must be low, medium, or high")

    def test_valid_upload_returns_a_png(self):
        image = Image.new("RGB", (40, 40), "black")
        image.paste("white", (10, 10, 30, 30))
        data = io.BytesIO()
        image.save(data, format="PNG")
        data.seek(0)

        response = self.client.post(
            "/blur",
            data={
                "image": (data, "source.png"),
                "strength": "medium",
            },
            content_type="multipart/form-data",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.content_type, "image/png")
        self.assertGreater(len(response.data), 0)


if __name__ == "__main__":
    unittest.main()
