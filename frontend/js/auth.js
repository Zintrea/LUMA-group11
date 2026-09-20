// ==========================================
// 🔒 ระบบป้องกัน: ถ้าล็อกอินอยู่แล้ว ให้เด้งไปหน้า /generate ทันที
// ==========================================
if (localStorage.getItem('userToken')) {
  window.location.replace('/generate');
}

const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

// ==========================================
// ลอจิก Sign In (Login)
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

      // พยายามอ่านข้อความจาก Backend (ป้องกันกรณีเพื่อนส่งหน้าขาวๆ หรือค่าว่างกลับมา)
      let data = {};
      try {
        data = await response.json();
      } catch (err) {
        console.warn('Backend ไม่ได้ส่ง JSON กลับมา');
      }

      // ขอแค่การตอบกลับเป็นสีเขียว (HTTP 200 OK) ก็ถือว่าล็อกอินผ่านทันที
      if (response.ok) {
        localStorage.setItem('userToken', 'is_logged_in_true');
        window.location.href = '/generate'; 
      } else {
        throw new Error(data.message || 'รหัสผ่านผิด หรือไม่มีบัญชีนี้');
      }
    } catch (error) {
      console.error('Login Error:', error);
      alert('เข้าสู่ระบบไม่สำเร็จ: ' + error.message);
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });
}

// ==========================================
// ลอจิก Sign Up (Register)
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
        console.warn('Backend ไม่ได้ส่ง JSON กลับมา');
      }

      // ขอแค่การตอบกลับเป็นสีเขียว (HTTP 200 OK) ก็ถือว่าสมัครผ่านทันที
      if (response.ok) {
        alert("✅ สมัครสมาชิกสำเร็จ! ระบบจะพากลับไปหน้าเข้าสู่ระบบ");
        
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        registerForm.reset();

        const loginTab = new bootstrap.Tab(document.getElementById('login-tab'));
        loginTab.show();
      } else {
        throw new Error(data.message || 'ไม่สามารถสมัครสมาชิกได้');
      }
    } catch (error) {
      console.error('Register Error:', error);
      alert('สมัครสมาชิกไม่สำเร็จ: ' + error.message);
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });
}