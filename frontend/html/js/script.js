// ==========================================
// 🔐 1. ระบบตรวจสอบ Session
// ==========================================
async function checkSession() {
  try {
    const response = await fetch('/api/auth/me', {
      method: 'GET',
      credentials: 'include',
      headers: { 'Accept': 'application/json' }
    });

    // 🛡️ โล่ป้องกันบั๊กล็อกอินไม่ได้: เช็กว่าตอนนี้อยู่หน้า auth หรือเปล่า
    const isAuthPage = window.location.pathname.includes('/auth');

    if (response.status === 401) {
      // ถ้าไม่ได้อยู่หน้า Auth ค่อยเด้ง
      if (!isAuthPage) window.location.replace('/auth/login');
      return null;
    }

    if (response.status === 404) {
      console.error('Backend ยังไม่มี endpoint /auth/me');
      return null;
    }

    if (!response.ok) {
      throw new Error(`Session check failed (HTTP ${response.status})`);
    }

    const data = await response.json();

    if (data.status !== 'success' || !data.user) {
      if (!isAuthPage) window.location.replace('/auth/login');
      return null;
    }

    // ถ้าล็อกอินแล้ว แต่ดันเปิดหน้า login ค้างไว้ ให้เด้งเข้าหน้า workspace เลย
    if (isAuthPage) {
      window.location.replace('/generate');
    }

    return data.user;

  } catch (error) {
    console.error('Session Check Error:', error);
    return null;
  }
}

// ==========================================
// 🚪 2. ระบบออกจากระบบ
// ==========================================
async function logoutUser() {
  try {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Accept': 'application/json' }
    });
    if (!response.ok) console.warn(`Logout HTTP status: ${response.status}`);
  } catch (error) {
    console.error('Logout Error:', error);
  } finally {
    window.location.replace('/auth/login');
  }
}

// ==========================================
// 🕰️ 3. ระบบประวัติ (History)
// ==========================================
async function loadHistory() {
  const historyList = document.getElementById('historyList');
  const historyLoading = document.getElementById('historyLoading');
  if (!historyList) return;

  try {
    if (historyLoading) historyLoading.classList.remove('d-none');
    historyList.innerHTML = '';

    const response = await fetch('/api/history', { 
      method: 'GET', 
      credentials: 'include' 
    });

    if (response.status === 404) {
      if (historyLoading) historyLoading.classList.add('d-none');
      historyList.innerHTML = `<div class="text-muted text-center py-4">รอเชื่อมต่อ API /api/history จาก Backend</div>`;
      return;
    }

    if (!response.ok) throw new Error('Failed to load history');
    const res = await response.json();

    if (historyLoading) historyLoading.classList.add('d-none');

    if (!res.data || res.data.length === 0) {
      historyList.innerHTML = '<div class="text-muted text-center py-4">ยังไม่มีประวัติการสร้างรูปภาพ</div>';
      return;
    }

    res.data.forEach(item => {
      const card = document.createElement('div');
      card.className = 'card bg-secondary bg-opacity-25 border-secondary text-light';
      card.innerHTML = `
        <img src="${item.image.startsWith('http') ? item.image : 'data:image/png;base64,' + item.image}" class="card-img-top" alt="history" style="height: 150px; object-fit: cover;">
        <div class="card-body p-2">
          <p class="card-text small mb-1 text-truncate" title="${item.prompt}">${item.prompt}</p>
          <div class="d-flex justify-content-between align-items-center mt-2">
            <span class="badge bg-dark border border-secondary text-truncate" style="max-width: 60%;">${item.model ? item.model.split('\\').pop() : 'AI Model'}</span>
            <small class="text-muted" style="font-size: 0.70rem;">${item.created_at || ''}</small>
          </div>
        </div>
      `;
      historyList.appendChild(card);
    });

  } catch (error) {
    console.error('History Error:', error);
    if (historyLoading) historyLoading.classList.add('d-none');
    historyList.innerHTML = '<div class="text-danger text-center py-3">โหลดประวัติไม่สำเร็จ</div>';
  }
}

// ==========================================
// 🎨 4. โค้ดส่วน Generate รูปภาพหลัก
// ==========================================
const BACKEND_URL = '/api/generate';

document.addEventListener('DOMContentLoaded', async () => {

  const btnGenerate = document.getElementById('btnGenerate');
  const promptInput = document.getElementById('promptInput');
  const negativePromptInput = document.getElementById('negativePromptInput');
  const emptyState = document.getElementById('emptyState');
  const loadingState = document.getElementById('loadingState');
  const resultImage = document.getElementById('resultImage');
  const downloadContainer = document.getElementById('downloadContainer');
  const btnDownload = document.getElementById('btnDownload');
  const aiModelSelect = document.getElementById('aiModel');
  
  const currentUser = document.getElementById('currentUser');
  const navProfilePic = document.getElementById('navProfilePic');
  const btnLogoutDropdown = document.getElementById('btnLogoutDropdown');
  const historyOffcanvas = document.getElementById('historyOffcanvas');

  // ตรวจ Session ก่อน
  const user = await checkSession();
  
  if (!user) {
    if (btnGenerate) btnGenerate.disabled = true;
    return; // ถ้าไม่มี user ให้หยุดทำงานตรงนี้
  }

  // อัปเดต UI โปรไฟล์
  if (currentUser && user.username) currentUser.textContent = user.username;
  const editDisplayName = document.getElementById('editDisplayName');
  if(editDisplayName) editDisplayName.value = user.username;
  
  const avatarUrl = user.avatar ? user.avatar : `https://ui-avatars.com/api/?name=${user.username}&background=random`;
  if(navProfilePic) navProfilePic.src = avatarUrl;
  const modalProfilePicPreview = document.getElementById('modalProfilePicPreview');
  if(modalProfilePicPreview) modalProfilePicPreview.src = avatarUrl;

  // Logout
  if (btnLogoutDropdown) {
    btnLogoutDropdown.addEventListener('click', async () => {
      btnLogoutDropdown.disabled = true;
      btnLogoutDropdown.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Logging out...';
      await logoutUser();
    });
  }

  // History Offcanvas
  if (historyOffcanvas) {
    historyOffcanvas.addEventListener('show.bs.offcanvas', loadHistory);
  }

  // ระบบ Modal ตั้งค่าบัญชี (รอเชื่อม Backend)
  const formProfile = document.getElementById('formProfile');
  if(formProfile) {
    formProfile.addEventListener('submit', async (e) => {
      e.preventDefault();
      alert('ระบบเปลี่ยนโปรไฟล์ รอการเชื่อมต่อกับ Backend API');
    });
  }

  const formPassword = document.getElementById('formPassword');
  if(formPassword) {
    formPassword.addEventListener('submit', async (e) => {
      e.preventDefault();
      alert('ระบบเปลี่ยนรหัสผ่าน รอการเชื่อมต่อกับ Backend API');
    });
  }

  // ดาวน์โหลดรูปภาพ
  if (btnDownload) {
    btnDownload.addEventListener('click', () => {
      const imgSrc = resultImage ? resultImage.src : '';
      if (!imgSrc || imgSrc === '') return;

      const link = document.createElement('a');
      link.href = imgSrc;
      const timestamp = new Date().getTime();
      link.download = `LUMA_Image_${timestamp}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }

  // Generate Image
  if (btnGenerate) {
    btnGenerate.addEventListener('click', async () => {
      const promptText = promptInput ? promptInput.value.trim() : '';

      if (promptText === '') {
        if (promptInput) promptInput.classList.add('is-invalid');
        return;
      }
      if (promptInput) promptInput.classList.remove('is-invalid');

      btnGenerate.disabled = true;
      btnGenerate.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Generating...';

      if (emptyState) emptyState.classList.add('d-none');
      if (resultImage) resultImage.classList.add('d-none');
      if (loadingState) loadingState.classList.remove('d-none');
      if (downloadContainer) downloadContainer.classList.add('d-none');

      try {
        const payload = {
          prompt: promptText,
          negative_prompt: negativePromptInput 
            ? (negativePromptInput.value.trim() || 'low quality, blurry')
            : 'low quality, blurry',
          model: aiModelSelect ? aiModelSelect.value : ''
        };

        const response = await fetch(BACKEND_URL, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (response.status === 401) {
          window.location.replace('/auth/login');
          return;
        }

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();

        // ✅ แก้ไขเงื่อนไขให้เช็กคำว่า 'success' ตามที่ Backend ส่งมา
        if (data.status === 'success' && data.image) {
          if (resultImage) {
            resultImage.src = `data:image/png;base64,${data.image}`;
            resultImage.classList.remove('d-none');
          }
          if (loadingState) loadingState.classList.add('d-none');
          if (downloadContainer) downloadContainer.classList.remove('d-none');
        } else {
          throw new Error(data.message || 'Backend ตอบกลับมาในรูปแบบที่ไม่ถูกต้อง');
        }

      } catch (error) {
        console.error('Generate Error:', error);
        alert('สร้างรูปภาพไม่สำเร็จ: ' + error.message);
        if (loadingState) loadingState.classList.add('d-none');
        if (emptyState) emptyState.classList.remove('d-none');
      } finally {
        btnGenerate.disabled = false;
        btnGenerate.innerHTML = '<i class="bi bi-magic me-1"></i> Generate Image';
      }
    });
  }

  // เคลียร์ Error แถบ Prompt
  if (promptInput) {
    promptInput.addEventListener('input', () => {
      promptInput.classList.remove('is-invalid');
    });
  }
});