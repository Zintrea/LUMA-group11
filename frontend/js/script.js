// ==========================================
// 🔒 1. ระบบป้องกันหน้าเว็บ (Route Guard)
// ==========================================
if (!localStorage.getItem('userToken')) {
  window.location.replace('/auth/login');
}

// ==========================================
// 🚪 2. ระบบออกจากระบบ (Logout)
// ==========================================
const btnLogout = document.getElementById('btnLogout');
if (btnLogout) {
  btnLogout.addEventListener('click', () => {
    localStorage.removeItem('userToken'); 
    window.location.replace('/auth/login'); 
  });
}

// ==========================================
// 🎨 3. โค้ดส่วน Generate รูปภาพ
// ==========================================
// แก้ไข: เติม / ด้านหน้า เพื่อให้วิ่งเข้าท่อ Nginx ถูกต้อง
const BACKEND_URL = '/api/generate'; 

const btnGenerate = document.getElementById('btnGenerate');
const promptInput = document.getElementById('promptInput');
const negativePromptInput = document.getElementById('negativePromptInput');
const emptyState = document.getElementById('emptyState');
const loadingState = document.getElementById('loadingState');
const resultImage = document.getElementById('resultImage');

btnGenerate.addEventListener('click', async () => {
  const promptText = promptInput.value.trim();
  
  if (promptText === '') {
    promptInput.classList.add('is-invalid');
    return;
  }
  promptInput.classList.remove('is-invalid');

  btnGenerate.disabled = true;
  btnGenerate.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Generating...';
  emptyState.classList.add('d-none');
  resultImage.classList.add('d-none');
  loadingState.classList.remove('d-none');

  try {
    // แพ็กเกจข้อมูลส่งไปหา Backend (app.py ของเพื่อน)
    const payload = {
      prompt: promptText,
      negative_prompt: negativePromptInput.value.trim() || "low quality, blurry",
      user_id: 1 // ตอนนี้ Backend บังคับใช้ค่า user_id 1 ไปก่อน
    };

    const response = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    // ถ้า Backend ล่ม, ปิดอยู่, หรือตอบกลับ Error (เช่น 500, 503)
    if (!response.ok) {
      throw new Error(`เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ (HTTP status: ${response.status})`);
    }

    const data = await response.json();

    // เช็กว่า Backend ประมวลผลเสร็จ และดึงรูปจากฐานข้อมูล/AI มาให้ได้จริงๆ
    if (data.status === 'ok' && data.image) {
      resultImage.src = `data:image/png;base64,${data.image}`; 
      loadingState.classList.add('d-none');
      resultImage.classList.remove('d-none');
    } else {
      throw new Error(data.message || 'Backend ตอบกลับมาในรูปแบบที่ไม่ถูกต้อง');
    }
  } catch (error) {
    console.error('Error generating image:', error);
    // แจ้งเตือนลูกค้าทันทีที่ระบบหลังบ้านมีปัญหา
    alert('สร้างรูปภาพไม่สำเร็จ: ' + error.message);
    loadingState.classList.add('d-none');
    emptyState.classList.remove('d-none');
  } finally {
    // คืนค่าปุ่มให้กลับมากดใหม่ได้
    btnGenerate.disabled = false;
    btnGenerate.innerHTML = '<i class="bi bi-magic me-1"></i> Generate Image';
  }
});

// พิมพ์ปุ๊บ เอาเส้นแดงแจ้งเตือน Error ออก
promptInput.addEventListener('input', () => promptInput.classList.remove('is-invalid'));

// ==========================================
// 🌫️ 4. Basic Image Blur — เรียก PC3 Backend
// ==========================================
const blurForm = document.getElementById('blurForm');
const blurImageInput = document.getElementById('blurImage');
const blurStrengthInput = document.getElementById('blurStrength');
const btnBlur = document.getElementById('btnBlur');
const blurResultContainer = document.getElementById('blurResultContainer');
const blurLoadingState = document.getElementById('blurLoadingState');
const blurResultImage = document.getElementById('blurResultImage');
const btnBlurDownload = document.getElementById('btnBlurDownload');

if (blurForm) {
  blurForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const image = blurImageInput.files[0];
    if (!image) {
      alert('กรุณาอัปโหลดรูปภาพก่อน');
      return;
    }

    const originalButtonText = btnBlur.innerHTML;
    btnBlur.disabled = true;
    btnBlur.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Blurring...';
    blurResultContainer.classList.remove('d-none');
    blurResultImage.classList.add('d-none');
    btnBlurDownload.classList.add('d-none');
    blurLoadingState.classList.remove('d-none');

    try {
      const formData = new FormData();
      formData.append('image', image);
      formData.append('strength', blurStrengthInput.value);

      const response = await fetch('/api/blur', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        let message = `เซิร์ฟเวอร์ตอบกลับผิดพลาด (HTTP ${response.status})`;
        try {
          const data = await response.json();
          message = data.message || data.error || message;
        } catch (error) {
          // Keep the HTTP status message when the error body is not JSON.
        }
        throw new Error(message);
      }

      const imageBlob = await response.blob();
      blurResultImage.src = URL.createObjectURL(imageBlob);
      blurResultImage.classList.remove('d-none');
      btnBlurDownload.classList.remove('d-none');
    } catch (error) {
      alert('เบลอรูปภาพไม่สำเร็จ: ' + error.message);
    } finally {
      blurLoadingState.classList.add('d-none');
      btnBlur.disabled = false;
      btnBlur.innerHTML = originalButtonText;
    }
  });
}

if (btnBlurDownload) {
  btnBlurDownload.addEventListener('click', () => {
    if (!blurResultImage.src) return;

    const link = document.createElement('a');
    link.href = blurResultImage.src;
    link.download = `LUMA_Blur_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
}