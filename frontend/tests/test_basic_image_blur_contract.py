import unittest
from pathlib import Path


FRONTEND_DIR = Path(__file__).resolve().parents[1]
INDEX_HTML = FRONTEND_DIR / "index.html"
SCRIPT_JS = FRONTEND_DIR / "js" / "script.js"


class TestBasicImageBlurFrontendContract(unittest.TestCase):
    def test_blur_controls_exist_in_the_backend_ai_frontend(self):
        html = INDEX_HTML.read_text(encoding="utf-8")

        self.assertIn('id="blurForm"', html)
        self.assertIn('id="blurImage"', html)
        self.assertIn('name="blurStrength"', html)
        self.assertIn('id="btnBlur"', html)
        self.assertIn('id="blurResultImage"', html)

    def test_blur_posts_image_and_strength_to_the_backend(self):
        script = SCRIPT_JS.read_text(encoding="utf-8")

        self.assertIn("fetch('/api/blur'", script)
        self.assertIn("formData.append('image'", script)
        self.assertIn("formData.append('strength'", script)
        self.assertNotIn("http://10.192.", script)


if __name__ == "__main__":
    unittest.main()
