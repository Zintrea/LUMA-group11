document.addEventListener("DOMContentLoaded", () => {
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const themeIcon = document.getElementById('themeIcon');
    
    // ถ้าหน้าเว็บไหนไม่ได้ใส่ปุ่มไว้ ให้หยุดการทำงานเพื่อไม่ให้เกิด Error
    if (!themeToggleBtn || !themeIcon) return; 

    // ดึงค่าปัจจุบันมาเซ็ตไอคอนให้ตรง
    const currentTheme = document.documentElement.getAttribute('data-bs-theme');
    updateIcon(currentTheme);

    // ดักจับการคลิกปุ่ม
    themeToggleBtn.addEventListener('click', () => {
        const themeNow = document.documentElement.getAttribute('data-bs-theme');
        const newTheme = themeNow === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-bs-theme', newTheme);
        localStorage.setItem('luma_theme', newTheme); // จำค่าลงเบราว์เซอร์
        updateIcon(newTheme);
    });

    function updateIcon(theme) {
        if (theme === 'dark') {
            themeIcon.classList.replace('bi-moon-fill', 'bi-sun-fill');
            themeToggleBtn.classList.replace('btn-outline-secondary', 'btn-outline-light');
            
            // ทำให้ปุ่ม X (Close) ใน Modal เป็นสีขาวสำหรับโหมดมืด
            document.querySelectorAll('.btn-close').forEach(btn => btn.classList.add('btn-close-white'));
        } else {
            themeIcon.classList.replace('bi-sun-fill', 'bi-moon-fill');
            themeToggleBtn.classList.replace('btn-outline-light', 'btn-outline-secondary');
            
            // คืนค่าปุ่ม X (Close) ใน Modal เป็นสีดำสำหรับโหมดสว่าง
            document.querySelectorAll('.btn-close').forEach(btn => btn.classList.remove('btn-close-white'));
        }
    }
});