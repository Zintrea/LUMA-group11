// ==========================================
// 🔐 LUMA AUTH SCRIPT
// ==========================================

const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

// ------------------------------------------
// 🔐 SIGN IN
// ------------------------------------------
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const usernameInput = document.getElementById('loginUsername');
    const passwordInput = document.getElementById('loginPassword');

    const username = usernameInput ? usernameInput.value.trim() : '';
    const password = passwordInput ? passwordInput.value : '';
    const submitBtn = loginForm.querySelector('button[type="submit"]');

    if (!submitBtn) return;
    const originalText = submitBtn.innerHTML;

    if (!username || !password) {
      alert('กรุณากรอก Username และ Password');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Signing In...';

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include', // ส่ง/รับ Session Cookie
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
        // ตรวจสอบ Session อีกครั้งผ่าน /api/auth/me
        const sessionResponse = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Accept': 'application/json' }
        });

        if (sessionResponse.ok) {
          const sessionData = await sessionResponse.json();

          if (sessionData.status === 'success') {
            console.log('Login successful', sessionData.user);

            // 👑 เช็กสิทธิ์ Role: ถ้าเป็น admin ให้ไปหน้า /admin
            if (sessionData.user && sessionData.user.role === 'admin') {
              window.location.replace('/admin');
              return;
            }

            // ถ้าเป็น User ทั่วไป ไปหน้า generate
            window.location.replace('/generate');
            return;
          }
        }

        throw new Error('เข้าสู่ระบบสำเร็จ แต่ Backend ไม่สามารถยืนยัน Session ได้');
      }

      throw new Error(data.message || data.error || 'Username หรือ Password ไม่ถูกต้อง');

    } catch (error) {
      console.error('Login Error:', error);
      alert('เข้าสู่ระบบไม่สำเร็จ:\n' + error.message);
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
      alert('กรุณากรอกข้อมูลให้ครบทุกช่อง');
      return;
    }

    if (password !== confirmPassword) {
      alert('❌ รหัสผ่านไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง!');
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
        alert('✅ สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ');
        registerForm.reset();
        
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
      alert('สมัครสมาชิกไม่สำเร็จ:\n' + error.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });
}