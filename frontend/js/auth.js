// ==========================================
// 🔒 ระบบป้องกัน: ถ้าล็อกอินอยู่แล้ว ให้เด้งไปหน้า /generate ทันที
// ==========================================
if (localStorage.getItem('userToken')) {
  window.location.replace('/generate');
}

const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

// ==========================================
// ลอจิก Sign In (บังคับต่อ Backend)
// ==========================================
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault(); 

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Signing In...';

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, password: password })
      });

      let data = {};
      try {
        data = await response.json();
      } catch (err) {
        console.warn('Backend ไม่ได้ส่งข้อมูล JSON กลับมา');
      }

      if (response.ok) {
        // ให้ Backend เป็นคนกำหนด Token ยืนยันตัวตน (ถ้าไม่มีให้ใช้ค่าเริ่มต้น)
        localStorage.setItem('userToken', data.token || 'authenticated_user');
        window.location.href = '/generate'; 
      } else {
        throw new Error(data.message || 'รหัสผ่านผิด, ไม่มีบัญชีนี้ หรือไม่สามารถเชื่อมต่อฐานข้อมูลได้');
      }
    } catch (error) {
      console.error('Login Error:', error);
      alert('เข้าสู่ระบบไม่สำเร็จ: ' + error.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });
}

// ==========================================
// ลอจิก Sign Up (บังคับต่อ Backend)
// ==========================================
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault(); 

    const username = document.getElementById('regUsername').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value.trim();
    const confirmPassword = document.getElementById('regConfirm').value.trim();
    
    const submitBtn = registerForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;

    if (password !== confirmPassword) {
      alert("❌ รหัสผ่านไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง!");
      return; 
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Creating Account...';

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: username,
          email: email, 
          password: password 
        })
      });

      let data = {};
      try {
        data = await response.json();
      } catch (err) {
        console.warn('Backend ไม่ได้ส่งข้อมูล JSON กลับมา');
      }

      if (response.ok) {
        alert("✅ สมัครสมาชิกลงฐานข้อมูลสำเร็จ! กรุณาเข้าสู่ระบบ");
        registerForm.reset();
        const loginTab = new bootstrap.Tab(document.getElementById('login-tab'));
        loginTab.show();
      } else {
        throw new Error(data.message || 'ไม่สามารถสมัครสมาชิกได้ (อีเมลอาจซ้ำ หรือเซิร์ฟเวอร์ล่ม)');
      }
    } catch (error) {
      console.error('Register Error:', error);
      alert('สมัครสมาชิกไม่สำเร็จ: ' + error.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });
}