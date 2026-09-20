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