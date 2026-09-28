// ตรวจสอบสิทธิ์ Admin
async function checkAdminSession() {
  try {
    const response = await fetch('/api/auth/me', {
      method: 'GET',
      credentials: 'include',
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
      window.location.replace('/auth/login');
      return null;
    }

    const data = await response.json();
    if (data.status !== 'success' || !data.user || data.user.role !== 'admin') {
      alert('Access Denied: ไม่มีสิทธิ์เข้าถึง');
      window.location.replace('/auth/login');
      return null;
    }

    const adminUsername = document.getElementById('adminUsername');
    if (adminUsername) adminUsername.textContent = data.user.username;
    return data.user;
  } catch (error) {
    console.error('Auth Error:', error);
    window.location.replace('/auth/login');
    return null;
  }
}

// โหลด Dashboard
async function loadDashboard() {
  try {
    const res = await fetch('/api/admin/dashboard', { method: 'GET', credentials: 'include' });
    const data = await res.json();
    if (res.ok) {
      document.getElementById('statTotalUsers').textContent = data.total_users ?? 0;
      document.getElementById('statImagesToday').textContent = data.images_today ?? 0;
      document.getElementById('statFailedTasks').textContent = data.failed_tasks ?? 0;
      document.getElementById('statAiForge').textContent = data.ai_forge ?? '-';
    }

    const tableBody = document.getElementById('tableBody');
    const resGens = await fetch('/api/admin/recent-generations', { method: 'GET', credentials: 'include' });
    const dataGens = await resGens.json();

    if (resGens.ok && dataGens.data && dataGens.data.length > 0) {
      tableBody.innerHTML = '';
      dataGens.data.forEach(item => {
        const modelDisplay = item.model ? item.model.split('\\').pop() : '-';
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>#${item.task_id}</td>
          <td class="text-light fw-bold">${item.username}</td>
          <td class="text-truncate text-muted" style="max-width: 200px;">${item.prompt}</td>
          <td><small>${modelDisplay}</small></td>
          <td><span class="badge bg-success">${item.status}</span></td>
          <td class="text-muted small">${item.created_at || '-'}</td>
        `;
        tableBody.appendChild(tr);
      });
    } else {
      tableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">No data available</td></tr>';
    }
  } catch (err) {
    console.error('Dashboard Error:', err);
  }
}

// โหลด Users
async function loadUsers() {
  const table = document.getElementById('tableUsers');
  try {
    const res = await fetch('/api/admin/users', { method: 'GET', credentials: 'include' });
    const data = await res.json();
    if (res.ok && data.data) {
      table.innerHTML = '';
      data.data.forEach(user => {
        const isActive = user.is_active !== undefined ? user.is_active : user.status;
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>#${user.id}</td>
          <td class="text-light fw-bold">${user.username}</td>
          <td class="text-muted">${user.email || '-'}</td>
          <td><span class="badge bg-secondary">${user.role}</span></td>
          <td><span class="badge bg-success">${isActive}</span></td>
          <td class="text-muted small">${user.created_at || '-'}</td>
          <td class="text-end">
            <button class="btn btn-sm btn-outline-warning" onclick="openEditUser(${user.id}, '${user.username}', '${user.role}', ${isActive})">Edit</button>
          </td>
        `;
        table.appendChild(tr);
      });
    }
  } catch (err) {
    table.innerHTML = '<tr><td colspan="7" class="text-center text-danger">Error loading users</td></tr>';
  }
}

function openEditUser(id, username, role, isActive) {
  document.getElementById('editUserId').value = id;
  document.getElementById('editUsername').value = username;
  document.getElementById('editRole').value = role;
  document.getElementById('editStatus').value = isActive ? "true" : "false";
  new bootstrap.Modal(document.getElementById('editUserModal')).show();
}

document.getElementById('btnSaveUser').addEventListener('click', async () => {
  const id = document.getElementById('editUserId').value;
  const role = document.getElementById('editRole').value;
  const is_active = document.getElementById('editStatus').value === "true";

  try {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, is_active })
    });
    if (res.ok) {
      bootstrap.Modal.getInstance(document.getElementById('editUserModal')).hide();
      loadUsers();
    } else {
      alert('Update failed');
    }
  } catch (err) {
    alert('Error connecting to server');
  }
});

// โหลด AI Settings
async function loadAISettings() {
  try {
    const res = await fetch('/api/admin/ai', { method: 'GET', credentials: 'include' });
    const data = await res.json();
    if (res.ok && data.status === 'online') {
      document.getElementById('aiStatusMainText').textContent = 'Online';
      document.getElementById('aiStatusMessage').textContent = data.message || 'Connected';
    } else {
      document.getElementById('aiStatusMainText').textContent = 'Offline';
    }

    const tableModels = document.getElementById('tableModels');
    const resModels = await fetch('/api/admin/ai/models', { method: 'GET', credentials: 'include' });
    const dataModels = await resModels.json();
    if (resModels.ok && dataModels.data) {
      tableModels.innerHTML = '';
      dataModels.data.forEach(m => {
        tableModels.innerHTML += `<tr><td class="text-light">${m.model_name || m.name}</td><td><span class="badge bg-secondary font-monospace">${m.hash || '-'}</span></td></tr>`;
      });
    }
  } catch (err) {
    console.error('AI Settings Error:', err);
  }
}

// Event ควบคุม Sidebar Tabs และระบบเริ่มต้น
document.addEventListener('DOMContentLoaded', async () => {
  const admin = await checkAdminSession();
  if (!admin) return;

  loadDashboard();
  loadAISettings();

  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('.admin-section');

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      // สลับ Active Style ของเมนู
      navLinks.forEach(l => { 
        l.classList.remove('active', 'fw-bold', 'text-white', 'bg-secondary', 'bg-opacity-25'); 
        l.classList.add('text-muted'); 
      });
      link.classList.add('active', 'fw-bold', 'text-white', 'bg-secondary', 'bg-opacity-25');
      link.classList.remove('text-muted');

      // สลับแสดง Section หน้าจอ
      const targetId = link.getAttribute('data-target');
      sections.forEach(sec => {
        if (sec.id === targetId) {
          sec.classList.remove('d-none');
        } else {
          sec.classList.add('d-none');
        }
      });

      // โหลดข้อมูลตามหน้าต่างที่กด
      if (targetId === 'section-dashboard') loadDashboard();
      if (targetId === 'section-users') loadUsers();
      if (targetId === 'section-ai') loadAISettings();
    });
  });

  const btnLogout = document.getElementById('adminLogoutBtn');
  if (btnLogout) {
    btnLogout.addEventListener('click', async () => {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      window.location.replace('/auth/login');
    });
  }
});