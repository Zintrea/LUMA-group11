// ==========================================
// 🔐 LUMA AUTH
// Backend Session เป็นตัว Authentication จริง
// ==========================================


// ==========================================
// Elements
// ==========================================

const loginForm =
  document.getElementById('loginForm');

const registerForm =
  document.getElementById('registerForm');


// ==========================================
// 🔐 SIGN IN
// ==========================================

if (loginForm) {

  loginForm.addEventListener(
    'submit',
    async (e) => {

      e.preventDefault();


      // --------------------------------------
      // Get Login Values
      // --------------------------------------

      const usernameInput =
        document.getElementById(
          'loginUsername'
        );

      const passwordInput =
        document.getElementById(
          'loginPassword'
        );


      const username =
        usernameInput
          ? usernameInput.value.trim()
          : '';

      const password =
        passwordInput
          ? passwordInput.value
          : '';


      const submitBtn =
        loginForm.querySelector(
          'button[type="submit"]'
        );


      if (!submitBtn) {

        console.error(
          'ไม่พบปุ่ม Submit ของ Login Form'
        );

        return;
      }


      const originalText =
        submitBtn.innerHTML;


      // --------------------------------------
      // Validation
      // --------------------------------------

      if (!username || !password) {

        alert(
          'กรุณากรอก Username และ Password'
        );

        return;
      }


      // --------------------------------------
      // Loading
      // --------------------------------------

      submitBtn.disabled = true;

      submitBtn.innerHTML =
        '<span class="spinner-border spinner-border-sm me-2"></span> Signing In...';


      try {

        // ======================================
        // LOGIN
        // ======================================

        const response =
          await fetch(
            '/api/auth/login',
            {
              method: 'POST',

              // ⭐ ส่ง / รับ Session Cookie
              credentials: 'include',

              headers: {
                'Content-Type':
                  'application/json',

                'Accept':
                  'application/json'
              },

              body: JSON.stringify({

                username:
                  username,

                password:
                  password

              })
            }
          );


        // ======================================
        // อ่าน JSON
        // ======================================

        let data = {};

        try {

          data =
            await response.json();

        } catch (error) {

          console.warn(
            'Backend ไม่ได้ส่ง JSON'
          );

        }


        // ======================================
        // LOGIN SUCCESS
        // ======================================

        if (
          response.ok &&
          data.status === 'success'
        ) {

          /*
           * สำคัญ:
           *
           * ไม่ทำ:
           * localStorage.setItem('userToken', ...)
           *
           * ไม่สร้าง token เอง
           *
           * Backend Session เป็นตัวจริง
           */


          // ------------------------------------
          // ตรวจ Session อีกครั้ง
          // ------------------------------------

          const sessionResponse =
            await fetch(
              '/api/auth/me',
              {
                method: 'GET',

                credentials: 'include',

                headers: {
                  'Accept':
                    'application/json'
                }
              }
            );


          // ------------------------------------
          // Session ใช้งานได้
          // ------------------------------------

          if (
            sessionResponse.ok
          ) {

            const sessionData =
              await sessionResponse.json();


            if (
              sessionData.status ===
                'success'
            ) {

              console.log(
                'Login successful',
                sessionData.user
              );

              window.location.replace(
                '/generate'
              );

              return;
            }
          }


          // ------------------------------------
          // Login ผ่าน แต่ Session ใช้ไม่ได้
          // ------------------------------------

          throw new Error(
            'เข้าสู่ระบบสำเร็จ แต่ Backend ไม่สามารถยืนยัน Session ได้'
          );

        }


        // ======================================
        // LOGIN FAILED
        // ======================================

        throw new Error(

          data.message ||
          data.error ||
          'Username หรือ Password ไม่ถูกต้อง'

        );


      } catch (error) {

        console.error(
          'Login Error:',
          error
        );

        alert(
          'เข้าสู่ระบบไม่สำเร็จ:\n' +
          error.message
        );


      } finally {

        submitBtn.disabled =
          false;

        submitBtn.innerHTML =
          originalText;

      }

    }
  );

}


// ==========================================
// 📝 SIGN UP / REGISTER
// ==========================================

if (registerForm) {

  registerForm.addEventListener(
    'submit',
    async (e) => {

      e.preventDefault();


      // --------------------------------------
      // Get values
      // --------------------------------------

      const usernameInput =
        document.getElementById(
          'regUsername'
        );

      const emailInput =
        document.getElementById(
          'regEmail'
        );

      const passwordInput =
        document.getElementById(
          'regPassword'
        );

      const confirmPasswordInput =
        document.getElementById(
          'regConfirm'
        );


      const username =
        usernameInput
          ? usernameInput.value.trim()
          : '';

      const email =
        emailInput
          ? emailInput.value.trim()
          : '';

      const password =
        passwordInput
          ? passwordInput.value
          : '';

      const confirmPassword =
        confirmPasswordInput
          ? confirmPasswordInput.value
          : '';


      const submitBtn =
        registerForm.querySelector(
          'button[type="submit"]'
        );


      if (!submitBtn) {

        console.error(
          'ไม่พบปุ่ม Submit ของ Register Form'
        );

        return;
      }


      const originalText =
        submitBtn.innerHTML;


      // --------------------------------------
      // Validation
      // --------------------------------------

      if (
        !username ||
        !email ||
        !password ||
        !confirmPassword
      ) {

        alert(
          'กรุณากรอกข้อมูลให้ครบทุกช่อง'
        );

        return;
      }


      if (
        password !==
        confirmPassword
      ) {

        alert(
          '❌ รหัสผ่านไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง!'
        );

        return;
      }


      // --------------------------------------
      // Loading
      // --------------------------------------

      submitBtn.disabled =
        true;

      submitBtn.innerHTML =
        '<span class="spinner-border spinner-border-sm me-2"></span> Creating Account...';


      try {

        // ======================================
        // REGISTER
        // ======================================

        const response =
          await fetch(
            '/api/auth/register',
            {
              method: 'POST',

              credentials: 'include',

              headers: {
                'Content-Type':
                  'application/json',

                'Accept':
                  'application/json'
              },

              body: JSON.stringify({

                username:
                  username,

                email:
                  email,

                password:
                  password

              })
            }
          );


        // ======================================
        // Parse JSON
        // ======================================

        let data = {};

        try {

          data =
            await response.json();

        } catch (error) {

          console.warn(
            'Backend ไม่ได้ส่ง JSON กลับมา'
          );

        }


        // ======================================
        // Register Success
        // ======================================

        if (response.ok) {

          alert(
            '✅ สมัครสมาชิกลงฐานข้อมูลสำเร็จ! กรุณาเข้าสู่ระบบ'
          );


          registerForm.reset();


          const loginTabElement =
            document.getElementById(
              'login-tab'
            );


          if (
            loginTabElement &&
            typeof bootstrap !== 'undefined'
          ) {

            const loginTab =
              new bootstrap.Tab(
                loginTabElement
              );

            loginTab.show();

          }

          return;
        }


        // ======================================
        // Register Error
        // ======================================

        throw new Error(

          data.message ||
          data.error ||
          'ไม่สามารถสมัครสมาชิกได้ (อีเมลอาจซ้ำ หรือเซิร์ฟเวอร์ล่ม)'

        );


      } catch (error) {

        console.error(
          'Register Error:',
          error
        );

        alert(
          'สมัครสมาชิกไม่สำเร็จ:\n' +
          error.message
        );


      } finally {

        submitBtn.disabled =
          false;

        submitBtn.innerHTML =
          originalText;

      }

    }
  );

}