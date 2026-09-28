document.addEventListener('DOMContentLoaded', () => {
    // UX Logic: ถ้าล็อกอินอยู่แล้ว ให้เปลี่ยนปุ่มไปหน้า Generate
    if (localStorage.getItem('userToken')) {
        const loginBtn = document.getElementById('navLoginBtn');
        const startBtn = document.getElementById('navStartBtn');
        const ctaBtn = document.getElementById('heroCtaBtn');
        
        if (loginBtn) loginBtn.classList.add('d-none'); // ซ่อนปุ่ม Sign In
        
        if (startBtn) {
            startBtn.innerHTML = '<i class="bi bi-palette me-1"></i> Workspace';
            startBtn.href = '/generate';
        }
        
        if (ctaBtn) {
            ctaBtn.innerHTML = '<i class="bi bi-palette me-2"></i> Go to Workspace';
            ctaBtn.href = '/generate';
        }
    }
});