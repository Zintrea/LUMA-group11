import unittest
from pathlib import Path


FRONTEND_DIR = Path(__file__).resolve().parents[1]
INDEX_HTML = FRONTEND_DIR / "html" / "index.html"
SCRIPT_JS = FRONTEND_DIR / "html" / "js" / "script.js"


class TestBasicImageBlurFrontendContract(unittest.TestCase):
    def test_blur_tab_has_required_controls(self):
        html = INDEX_HTML.read_text(encoding="utf-8")

        self.assertIn('id="tab-blur"', html)
        self.assertIn('id="pane-blur"', html)
        self.assertIn('id="blurForm"', html)
        self.assertIn('id="blurImage"', html)
        self.assertIn('name="blurStrength"', html)
        self.assertIn('id="btnBlur"', html)
        self.assertIn('id="blurResultImage"', html)

    def test_blur_frontend_posts_only_to_the_backend_api(self):
        script = SCRIPT_JS.read_text(encoding="utf-8")

        self.assertIn("fetch('/api/blur'", script)
        self.assertIn("formData.append('image'", script)
        self.assertIn("formData.append('strength'", script)
        self.assertNotIn("http://10.192.", script)


if __name__ == "__main__":
    unittest.main()
