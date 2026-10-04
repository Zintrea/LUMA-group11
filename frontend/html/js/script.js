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

    const isAuthPage = window.location.pathname.includes('/auth');

    if (response.status === 401) {
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
// 🛠️ ฟังก์ชันกลาง: ย่อและแปลงรูปภาพไม่ให้เกิน 1MB (แก้ปัญหา iOS)
// ==========================================
function compressImage(file, maxWidth = 1280, maxHeight = 1280, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Canvas blob creation failed'));
            return;
          }
          const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        }, 'image/jpeg', quality);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
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

  const user = await checkSession();
  
  if (!user) {
    if (btnGenerate) btnGenerate.disabled = true;
    return;
  }

  if (user.role === 'admin') {
    const adminBtn = document.getElementById('adminPanelBtn');
    if (adminBtn) {
      adminBtn.classList.remove('d-none');
    }
  }

  if (currentUser && user.username) currentUser.textContent = user.username;
  const editDisplayName = document.getElementById('editDisplayName');
  if(editDisplayName) editDisplayName.value = user.username;
  
  const avatarUrl = user.avatar ? user.avatar : `https://ui-avatars.com/api/?name=${user.username}&background=random`;
  if(navProfilePic) navProfilePic.src = avatarUrl;
  const modalProfilePicPreview = document.getElementById('modalProfilePicPreview');
  if(modalProfilePicPreview) modalProfilePicPreview.src = avatarUrl;

  if (btnLogoutDropdown) {
    btnLogoutDropdown.addEventListener('click', async () => {
      btnLogoutDropdown.disabled = true;
      btnLogoutDropdown.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Logging out...';
      await logoutUser();
    });
  }

  if (historyOffcanvas) {
    historyOffcanvas.addEventListener('show.bs.offcanvas', loadHistory);
  }

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

  if (promptInput) {
    promptInput.addEventListener('input', () => {
      promptInput.classList.remove('is-invalid');
    });
  }
});

// ==========================================
// 🎨 ฟีเจอร์ Histogram Matching (HisMat)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  const hismatForm = document.getElementById('hismatForm');
  const btnHismat = document.getElementById('btnHismat');
  const sourceInput = document.getElementById('sourceImage');
  const referenceInput = document.getElementById('referenceImage');
  
  const modePreset = document.getElementById('modePreset');
  const modeCustom = document.getElementById('modeCustom');
  const presetToneContainer = document.getElementById('presetToneContainer');
  const customFileContainer = document.getElementById('customFileContainer');

  const hismatEmptyState = document.getElementById('hismatEmptyState');
  const hismatLoadingState = document.getElementById('hismatLoadingState');
  const hismatResultImage = document.getElementById('hismatResultImage');
  const btnHismatDownload = document.getElementById('btnHismatDownload');

  if (modePreset && modeCustom) {
    modePreset.addEventListener('change', () => {
      if (modePreset.checked) {
        presetToneContainer.classList.remove('d-none');
        customFileContainer.classList.add('d-none');
      }
    });
    modeCustom.addEventListener('change', () => {
      if (modeCustom.checked) {
        customFileContainer.classList.remove('d-none');
        presetToneContainer.classList.add('d-none');
      }
    });
  }

  function generatePresetImage(preset) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = 512; canvas.height = 512;
      const ctx = canvas.getContext('2d');
      
      let gradient = ctx.createLinearGradient(0, 0, 512, 512);
      if (preset === 'warm') {
        gradient.addColorStop(0, '#ff7e5f'); 
        gradient.addColorStop(1, '#feb47b'); 
      } else if (preset === 'cool') {
        gradient.addColorStop(0, '#2b5876'); 
        gradient.addColorStop(1, '#4e4376'); 
      } else if (preset === 'vintage') {
        gradient.addColorStop(0, '#5e4a3d'); 
        gradient.addColorStop(1, '#cda37f'); 
      }
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 512, 512);
      
      canvas.toBlob((blob) => {
        resolve(new File([blob], `${preset}_tone.png`, { type: 'image/png' }));
      }, 'image/png');
    });
  }

  if (hismatForm) {
    hismatForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const rawSourceFile = sourceInput.files[0];
      if (!rawSourceFile) {
        alert('กรุณาอัปโหลดรูปต้นฉบับ (Source Image) ก่อนครับ');
        return;
      }

      const originalBtnText = btnHismat.innerHTML;
      btnHismat.disabled = true;
      btnHismat.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Optimizing Image...';

      try {
        // 🌟 บีบอัดรูปต้นฉบับก่อนส่ง (แก้ปัญหา iOS รูปใหญ่/HEIC)
        const sourceFile = await compressImage(rawSourceFile);

        let referenceFile = null;
        const isCustomMode = modeCustom && modeCustom.checked;

        if (isCustomMode) {
          const rawRefFile = referenceInput.files[0];
          if (!rawRefFile) {
            alert('กรุณาอัปโหลดรูปภาพอ้างอิง (Reference Image) ครับ');
            btnHismat.disabled = false;
            btnHismat.innerHTML = originalBtnText;
            return;
          }
          referenceFile = await compressImage(rawRefFile);
        } else {
          const selectedToneInput = document.querySelector('input[name="colorTone"]:checked');
          const selectedTone = selectedToneInput ? selectedToneInput.value : 'warm';
          referenceFile = await generatePresetImage(selectedTone);
        }

        btnHismat.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Processing Color...';
        
        if (hismatEmptyState) hismatEmptyState.classList.add('d-none');
        if (hismatResultImage) hismatResultImage.classList.add('d-none');
        if (btnHismatDownload) btnHismatDownload.classList.add('d-none');
        if (hismatLoadingState) hismatLoadingState.classList.remove('d-none');

        const formData = new FormData();
        formData.append('source_image', sourceFile);
        formData.append('reference_image', referenceFile);

        const response = await fetch('/api/hismat', { method: 'POST', body: formData });
        
        if (response.ok) {
          const imageBlob = await response.blob();
          const imageUrl = URL.createObjectURL(imageBlob);
          hismatResultImage.src = imageUrl;
          
          if (hismatLoadingState) hismatLoadingState.classList.add('d-none');
          if (hismatResultImage) hismatResultImage.classList.remove('d-none');
          if (btnHismatDownload) btnHismatDownload.classList.remove('d-none');
        } else {
          let errorMsg = `เซิร์ฟเวอร์ตอบกลับผิดพลาด (HTTP ${response.status})`;
          try {
            const errorData = await response.json();
            if (errorData.message) errorMsg = errorData.message;
            if (errorData.error) errorMsg = errorData.error;
          } catch (parseError) {
            if (response.status === 413) errorMsg = '❌ รูปภาพใหญ่เกินไป (แม้จะย่อแล้ว Nginx ยังบล็อก)';
            else if (response.status === 502) errorMsg = '❌ เซิร์ฟเวอร์ AI ล่ม (502 Bad Gateway)';
            else if (response.status === 504) errorMsg = '❌ เซิร์ฟเวอร์ AI ตอบกลับช้าเกินไป (504 Gateway Timeout)';
            else if (response.status === 500) errorMsg = '❌ Backend ขัดข้อง (500 Internal Error)';
          }
          throw new Error(errorMsg);
        }

      } catch (error) {
        alert('ย้อมสีภาพไม่สำเร็จ: ' + error.message);
        if (hismatLoadingState) hismatLoadingState.classList.add('d-none');
        if (hismatEmptyState) hismatEmptyState.classList.remove('d-none');
      } finally {
        btnHismat.disabled = false;
        btnHismat.innerHTML = originalBtnText;
      }
    });
  }

  if (btnHismatDownload) {
    btnHismatDownload.addEventListener('click', () => {
      const imgSrc = hismatResultImage ? hismatResultImage.src : '';
      if (!imgSrc) return;
      const link = document.createElement('a');
      link.href = imgSrc;
      link.download = `LUMA_HisMat_${new Date().getTime()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }
});

// ==========================================
// 🌫️ ฟีเจอร์ BASIC IMAGE BLUR
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  const blurForm = document.getElementById('blurForm');
  const blurImageInput = document.getElementById('blurImage');
  const blurStrengthInput = document.getElementById('blurStrength');
  const btnBlur = document.getElementById('btnBlur');
  const blurEmptyState = document.getElementById('blurEmptyState');
  const blurLoadingState = document.getElementById('blurLoadingState');
  const blurResultImage = document.getElementById('blurResultImage');
  const btnBlurDownload = document.getElementById('btnBlurDownload');

  if (blurForm) {
    blurForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const rawImage = blurImageInput.files[0];
      if (!rawImage) {
        alert('กรุณาอัปโหลดรูปภาพก่อน');
        return;
      }

      const originalButtonText = btnBlur.innerHTML;
      btnBlur.disabled = true;
      btnBlur.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Blurring...';
      blurEmptyState.classList.add('d-none');
      blurResultImage.classList.add('d-none');
      btnBlurDownload.classList.add('d-none');
      blurLoadingState.classList.remove('d-none');

      try {
        const image = await compressImage(rawImage);
        const formData = new FormData();
        formData.append('image', image);
        formData.append('strength', blurStrengthInput.value);

        const response = await fetch('/api/blur', {
          method: 'POST',
          body: formData,
          credentials: 'include'
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
        blurEmptyState.classList.remove('d-none');
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
});

// ==========================================
// 🪄 ฟีเจอร์ BACKGROUND REMOVAL (ลบพื้นหลัง)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  const removeBgForm = document.getElementById('removeBgForm');
  const bgDropZone = document.getElementById('bgDropZone');
  const bgImageInput = document.getElementById('bgImageInput');
  const bgOriginalPreview = document.getElementById('bgOriginalPreview');
  const bgOriginalPreviewContainer = document.getElementById('bgOriginalPreviewContainer');
  const btnBgReset = document.getElementById('btnBgReset');
  const btnRemoveBg = document.getElementById('btnRemoveBg');
  
  const bgAlert = document.getElementById('bgAlert');
  const bgEmptyState = document.getElementById('bgEmptyState');
  const bgLoadingState = document.getElementById('bgLoadingState');
  const bgResultContainer = document.getElementById('bgResultContainer');
  const bgResultImage = document.getElementById('bgResultImage');
  const btnBgDownload = document.getElementById('btnBgDownload');

  let selectedBgFile = null;

  function showBgAlert(msg) {
    bgAlert.textContent = msg;
    bgAlert.classList.remove('d-none');
  }

  bgDropZone.addEventListener('click', () => bgImageInput.click());
  
  bgDropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    bgDropZone.classList.add('dragover');
  });
  
  bgDropZone.addEventListener('dragleave', () => {
    bgDropZone.classList.remove('dragover');
  });
  
  bgDropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    bgDropZone.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleBgFileSelect(e.dataTransfer.files[0]);
    }
  });

  bgImageInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleBgFileSelect(e.target.files[0]);
    }
  });

  function handleBgFileSelect(file) {
    bgAlert.classList.add('d-none');
    if (!file.type.startsWith('image/') && !file.name.toLowerCase().endsWith('.heic')) {
      showBgAlert('กรุณาอัปโหลดไฟล์รูปภาพเท่านั้น');
      return;
    }
    
    selectedBgFile = file;
    bgOriginalPreview.src = URL.createObjectURL(file);
    
    bgDropZone.classList.add('d-none');
    bgOriginalPreviewContainer.classList.remove('d-none');
    btnRemoveBg.disabled = false;
  }

  btnBgReset.addEventListener('click', () => {
    selectedBgFile = null;
    bgImageInput.value = '';
    bgDropZone.classList.remove('d-none');
    bgOriginalPreviewContainer.classList.add('d-none');
    btnRemoveBg.disabled = true;
    bgAlert.classList.add('d-none');
  });

  if (removeBgForm) {
    removeBgForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      bgAlert.classList.add('d-none');

      if (!selectedBgFile) {
        showBgAlert('กรุณาอัปโหลดรูปภาพก่อนทำการลบพื้นหลัง');
        return;
      }

      const originalBtnText = btnRemoveBg.innerHTML;
      btnRemoveBg.disabled = true;
      btnRemoveBg.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Optimizing...';
      
      bgEmptyState.classList.add('d-none');
      bgResultContainer.classList.add('d-none');
      bgLoadingState.classList.remove('d-none');

      try {
        // 🌟 บีบอัดรูปก่อนส่ง (แก้ปัญหา iOS รูปใหญ่พิเศษ / ป้องกัน Nginx บล็อก)
        const compressedFile = await compressImage(selectedBgFile);

        btnRemoveBg.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Processing...';

        const formData = new FormData();
        formData.append('image', compressedFile);

        const response = await fetch('/api/remove-background', {
          method: 'POST',
          body: formData,
          credentials: 'include'
        });

        if (response.ok) {
          const imageBlob = await response.blob();
          const imgSrc = URL.createObjectURL(imageBlob);
          bgResultImage.src = imgSrc;
          
          bgLoadingState.classList.add('d-none');
          bgResultContainer.classList.remove('d-none');
        } else {
          let errorMsg = `เซิร์ฟเวอร์ตอบกลับผิดพลาด (HTTP ${response.status})`;
          try {
            const errorData = await response.json();
            if (errorData.error) errorMsg = errorData.error;
          } catch (parseError) {
            if (response.status === 413) errorMsg = '❌ รูปภาพใหญ่เกินไป (ติดลิมิต Nginx หลังบ้าน)';
            else if (response.status === 502) errorMsg = '❌ เซิร์ฟเวอร์ AI ล่ม (502 Bad Gateway)';
            else if (response.status === 504) errorMsg = '❌ เซิร์ฟเวอร์ AI ตอบกลับช้าเกินไป (504 Gateway Timeout)';
            else if (response.status === 500) errorMsg = '❌ Backend ขัดข้อง (500 Internal Error)';
          }
          throw new Error(errorMsg);
        }

      } catch (error) {
        console.error('Remove BG Error:', error);
        bgLoadingState.classList.add('d-none');
        bgEmptyState.classList.remove('d-none');
        
        if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
          showBgAlert('⚠️ ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ API ได้ (Timeout/Offline)');
        } else {
          showBgAlert(error.message);
        }
      } finally {
        btnRemoveBg.disabled = false;
        btnRemoveBg.innerHTML = originalBtnText;
      }
    });
  }

  if (btnBgDownload) {
    btnBgDownload.addEventListener('click', () => {
      const imgSrc = bgResultImage.src;
      if (!imgSrc) return;
      const link = document.createElement('a');
      link.href = imgSrc;
      link.download = `LUMA_Transparent_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }
});