// ==========================================
// 🔐 LUMA AUTH SCRIPT (Updated with Inline & Connection Alerts)
// ==========================================

const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

// สร้างตัวแปรดึงกล่องแจ้งเตือนสีแดง
const loginAlert = document.getElementById('loginAlert');
const registerAlert = document.getElementById('registerAlert');

// ฟังก์ชันช่วยแสดงข้อความเตือน
function showAlert(element, message) {
  if (element) {
    element.textContent = message;
    element.classList.remove('d-none');
  }
}

// ฟังก์ชันซ่อนกล่องข้อความเตือน
function hideAlert(element) {
  if (element) {
    element.textContent = '';
    element.classList.add('d-none');
  }
}

// ซ่อนกล่องแจ้งเตือนทันทีเมื่อผู้ใช้เริ่มพิมพ์ใหม่
['loginUsername', 'loginPassword'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', () => hideAlert(loginAlert));
});

['regUsername', 'regEmail', 'regPassword', 'regConfirm'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', () => hideAlert(registerAlert));
});


// ------------------------------------------
// 🔐 SIGN IN
// ------------------------------------------
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert(loginAlert);

    const usernameInput = document.getElementById('loginUsername');
    const passwordInput = document.getElementById('loginPassword');

    const username = usernameInput ? usernameInput.value.trim() : '';
    const password = passwordInput ? passwordInput.value : '';
    const submitBtn = loginForm.querySelector('button[type="submit"]');

    if (!submitBtn) return;
    const originalText = submitBtn.innerHTML;

    if (!username || !password) {
      showAlert(loginAlert, 'กรุณากรอก Username และ Password ให้ครบถ้วน');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Signing In...';

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      let data = {};
      try {
        data = await response.json();
      } catch (error) {
        console.warn('Backend ไม่ได้ส่ง JSON');
      }

      if (response.ok && data.status === 'success') {
        const sessionResponse = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Accept': 'application/json' }
        });

        if (sessionResponse.ok) {
          const sessionData = await sessionResponse.json();

          if (sessionData.status === 'success') {
            console.log('Login successful', sessionData.user);

            if (sessionData.user && sessionData.user.role === 'admin') {
              window.location.replace('/admin');
              return;
            }

            window.location.replace('/generate');
            return;
          }
        }

        throw new Error('เข้าสู่ระบบสำเร็จ แต่ Backend ไม่สามารถยืนยัน Session ได้');
      }

      throw new Error(data.message || data.error || 'Username หรือ Password ไม่ถูกต้อง');

    } catch (error) {
      console.error('Login Error:', error);
      
      // 🌟 ดักจับเคสเชื่อมต่อ Backend ไม่ได้
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        showAlert(loginAlert, '⚠️ ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ Backend ได้ กรุณาตรวจสอบการเชื่อมต่อ');
      } else {
        showAlert(loginAlert, error.message);
      }
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });
}


// ------------------------------------------
// 📝 SIGN UP / REGISTER
// ------------------------------------------
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert(registerAlert);

    const usernameInput = document.getElementById('regUsername');
    const emailInput = document.getElementById('regEmail');
    const passwordInput = document.getElementById('regPassword');
    const confirmPasswordInput = document.getElementById('regConfirm');

    const username = usernameInput ? usernameInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim() : '';
    const password = passwordInput ? passwordInput.value : '';
    const confirmPassword = confirmPasswordInput ? confirmPasswordInput.value : '';
    const submitBtn = registerForm.querySelector('button[type="submit"]');

    if (!submitBtn) return;
    const originalText = submitBtn.innerHTML;

    if (!username || !email || !password || !confirmPassword) {
      showAlert(registerAlert, 'กรุณากรอกข้อมูลให้ครบทุกช่อง');
      return;
    }

    if (password !== confirmPassword) {
      showAlert(registerAlert, '❌ รหัสผ่านไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง!');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Creating Account...';

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ username, email, password })
      });

      let data = {};
      try {
        data = await response.json();
      } catch (error) {
        console.warn('Backend ไม่ได้ส่ง JSON กลับมา');
      }

      if (response.ok) {
        registerForm.reset();
        
        // สลับไปหน้า Sign In อัตโนมัติเมื่อสมัครสำเร็จ
        const loginTabElement = document.getElementById('login-tab');
        if (loginTabElement && typeof bootstrap !== 'undefined') {
          const loginTab = new bootstrap.Tab(loginTabElement);
          loginTab.show();
        }
        return;
      }

      throw new Error(data.message || data.error || 'ไม่สามารถสมัครสมาชิกได้');

    } catch (error) {
      console.error('Register Error:', error);

      // 🌟 ดักจับเคสเชื่อมต่อ Backend ไม่ได้
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        showAlert(registerAlert, '⚠️ ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ Backend ได้ กรุณาตรวจสอบการเชื่อมต่อ');
      } else {
        showAlert(registerAlert, error.message);
      }
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });
}