document.addEventListener('DOMContentLoaded', () => {
    // 🔒 1. ระบบดักจับสิทธิ์ (อนาคตสามารถเช็ก Admin Token ได้ที่นี่)
    // if (!localStorage.getItem('adminToken')) {
    //   window.location.replace('/auth/login');
    // }

    // 🚪 2. ระบบ Logout สำหรับ Admin
    const btnLogout = document.getElementById('adminLogoutBtn');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            // ลบ Token (ถ้ามี) แล้วเด้งกลับหน้า Login
            // localStorage.removeItem('adminToken'); 
            window.location.replace('/auth/login'); 
        });
    }

    // 📊 3. โค้ดส่วนดึงข้อมูลสถิติจาก Backend (เตรียมไว้เขียนต่อ)
    const fetchAdminStats = async () => {
        // รอเพื่อนทำ API ค่อยมาเขียน fetch ตรงนี้ครับ
        console.log("พร้อมเชื่อมต่อ API ระบบหลังบ้าน");
    };

    fetchAdminStats();
});