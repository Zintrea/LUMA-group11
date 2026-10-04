// ==========================================
// 🛡️️ ADMIN PANEL SCRIPT (LUMA AI)
// ==========================================

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

// 1 & 2. โหลด Dashboard และ Recent Generations
async function loadDashboard() {
  try {
    // 1. Dashboard Stats
    const res = await fetch('/api/admin/dashboard', { method: 'GET', credentials: 'include' });
    const data = await res.json();
    
    if (res.ok) {
      const stats = data.stats || {};
      document.getElementById('statTotalUsers').textContent = stats.total_users ?? 0;
      document.getElementById('statImagesToday').textContent = stats.images_today ?? 0;
      document.getElementById('statFailedTasks').textContent = stats.failed_tasks ?? 0;
      document.getElementById('statAiForge').textContent = stats.ai_forge ?? '-';
    }

    // 2. Recent Generations
    const tableBody = document.getElementById('tableBody');
    if (!tableBody) return; // ป้องกัน Error ถ้าหาตารางไม่เจอ

    const resGens = await fetch('/api/admin/recent-generations', { method: 'GET', credentials: 'include' });
    const dataGens = await resGens.json();
    const generationsList = dataGens.generations || [];

    if (resGens.ok && generationsList.length > 0) {
      tableBody.innerHTML = '';
      generationsList.forEach(item => {
        const modelDisplay = item.model ? item.model.split('\\').pop() : '-';
        
        let statusBadge = 'bg-secondary';
        const statusStr = (item.status || '').toLowerCase();
        if (statusStr === 'completed' || statusStr === 'success') statusBadge = 'bg-success';
        else if (statusStr === 'failed' || statusStr === 'error') statusBadge = 'bg-danger';
        else if (statusStr === 'processing' || statusStr === 'pending') statusBadge = 'bg-warning text-dark';

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>#${item.task_id}</td>
          <td class="text-light fw-bold">${item.username}</td>
          <td class="text-truncate text-muted" style="max-width: 200px;">${item.prompt}</td>
          <td><small>${modelDisplay}</small></td>
          <td><span class="badge ${statusBadge}">${item.status}</span></td>
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

// 3. โหลด Users Management
async function loadUsers() {
  const table = document.getElementById('tableUsers');
  if (!table) return;

  try {
    const res = await fetch('/api/admin/users', { method: 'GET', credentials: 'include' });
    const data = await res.json();
    const usersList = data.users || [];

    if (res.ok && usersList.length > 0) {
      table.innerHTML = '';
      usersList.forEach(user => {
        const isActive = user.is_active !== undefined ? user.is_active : user.status;
        
        const statusText = isActive ? 'Active' : 'Inactive';
        const statusBadge = isActive ? 'bg-success' : 'bg-danger';

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>#${user.id}</td>
          <td class="text-light fw-bold">${user.username}</td>
          <td class="text-muted">${user.email || '-'}</td>
          <td><span class="badge bg-secondary">${user.role}</span></td>
          <td><span class="badge ${statusBadge}">${statusText}</span></td>
          <td class="text-muted small">${user.created_at || '-'}</td>
          <td class="text-end">
            <button class="btn btn-sm btn-outline-warning" onclick="openEditUser(${user.id}, '${user.username}', '${user.role}', ${isActive})">Edit</button>
          </td>
        `;
        table.appendChild(tr);
      });
    } else {
      table.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-4">No users found</td></tr>';
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

// 5. แก้ไข User ผ่าน PATCH
const btnSaveUser = document.getElementById('btnSaveUser');
if (btnSaveUser) {
  btnSaveUser.addEventListener('click', async () => {
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
        loadUsers(); // Refresh รายชื่อหลังแก้สำเร็จ
      } else {
        alert('Update failed');
      }
    } catch (err) {
      alert('Error connecting to server');
    }
  });
}

// 6 & 7. AI Server Settings & Models
async function loadAISettings() {
  try {
    const res = await fetch('/api/admin/ai', { method: 'GET', credentials: 'include' });
    const data = await res.json();
    
    const aiStatus = data.ai ? data.ai.status : 'offline';
    const aiMessage = data.ai ? data.ai.message : 'Disconnected';

    const mainText = document.getElementById('aiStatusMainText');
    const messageText = document.getElementById('aiStatusMessage');

    if (res.ok && aiStatus === 'online') {
      if(mainText) mainText.textContent = 'Online';
      if(messageText) messageText.textContent = aiMessage;
    } else {
      if(mainText) mainText.textContent = 'Offline';
      if(messageText) messageText.textContent = aiMessage;
    }

    const tableModels = document.getElementById('tableModels');
    if (!tableModels) return;

    const resModels = await fetch('/api/admin/ai/models', { method: 'GET', credentials: 'include' });
    const dataModels = await resModels.json();
    const modelsList = dataModels.models || [];

    if (resModels.ok && modelsList.length > 0) {
      tableModels.innerHTML = '';
      modelsList.forEach(m => {
        tableModels.innerHTML += `<tr><td class="text-light">${m.model_name || m.name}</td><td><span class="badge bg-secondary font-monospace">${m.hash || '-'}</span></td></tr>`;
      });
    } else {
      tableModels.innerHTML = '<tr><td colspan="2" class="text-center text-muted py-5">No models available</td></tr>';
    }
  } catch (err) {
    console.error('AI Settings Error:', err);
  }
}

// Initial Events & Tabs
document.addEventListener('DOMContentLoaded', async () => {
  const admin = await checkAdminSession();
  if (!admin) return;

  loadDashboard();
  loadAISettings();

  const navLinks = document.querySelectorAll('.admin-sidebar .nav-link');
  const sections = document.querySelectorAll('.admin-section');

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      navLinks.forEach(l => { 
        l.classList.remove('active', 'fw-bold', 'text-white', 'bg-secondary', 'bg-opacity-25'); 
        l.classList.add('text-muted'); 
      });
      link.classList.add('active', 'fw-bold', 'text-white', 'bg-secondary', 'bg-opacity-25');
      link.classList.remove('text-muted');

      const targetId = link.getAttribute('data-target');
      sections.forEach(sec => {
        if (sec.id === targetId) {
          sec.classList.remove('d-none');
        } else {
          sec.classList.add('d-none');
        }
      });

      if (targetId === 'section-dashboard') loadDashboard();
      if (targetId === 'section-users') loadUsers();
      if (targetId === 'section-ai') loadAISettings();
    });
  });

  // Logout
  const btnLogout = document.getElementById('adminLogoutBtn');
  if (btnLogout) {
    btnLogout.addEventListener('click', async () => {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      window.location.replace('/auth/login');
    });
  }
});