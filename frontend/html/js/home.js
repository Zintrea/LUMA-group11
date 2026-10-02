// ==========================================
// 🏠 LUMA HOME
// ตรวจ Login จาก Backend Session
// ไม่ใช้ localStorage.userToken
// ==========================================

document.addEventListener(
  'DOMContentLoaded',
  async () => {

    const loginBtn =
      document.getElementById(
        'navLoginBtn'
      );

    const startBtn =
      document.getElementById(
        'navStartBtn'
      );

    const ctaBtn =
      document.getElementById(
        'heroCtaBtn'
      );


    // ========================================
    // ตรวจ Session
    // ========================================

    try {

      const response =
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


      // --------------------------------------
      // ยังไม่ได้ Login
      // --------------------------------------

      if (
        response.status === 401
      ) {

        return;
      }


      // --------------------------------------
      // Backend ยังไม่มี /auth/me
      // หน้า Home ยังเปิดต่อได้
      // --------------------------------------

      if (
        response.status === 404
      ) {

        console.warn(
          'Backend ยังไม่มี /auth/me'
        );

        return;
      }


      if (!response.ok) {

        return;
      }


      const data =
        await response.json();


      // ========================================
      // Login อยู่
      // ========================================

      if (
        data.status === 'success' &&
        data.user
      ) {

        // --------------------------------------
        // ซ่อน Sign In
        // --------------------------------------

        if (loginBtn) {

          loginBtn.classList.add(
            'd-none'
          );

        }


        // --------------------------------------
        // Get Started → Workspace
        // --------------------------------------

        if (startBtn) {

          startBtn.innerHTML =
            '<i class="bi bi-palette me-1"></i> Workspace';

          startBtn.href =
            '/generate';

        }


        // --------------------------------------
        // Hero CTA → Workspace
        // --------------------------------------

        if (ctaBtn) {

          ctaBtn.innerHTML =
            '<i class="bi bi-palette me-2"></i> Go to Workspace';

          ctaBtn.href =
            '/generate';

        }

      }

    } catch (error) {

      console.error(
        'Home Session Check Error:',
        error
      );

    }

  }
);