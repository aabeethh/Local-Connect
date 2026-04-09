const Admin = {
  layout(page, contentHtml) {
    const navItems = [
      { id: 'dashboard', icon: 'fa-gauge', label: 'Dashboard' },
      { id: 'applications', icon: 'fa-file-lines', label: 'Guide Applications' },
      { id: 'guides', icon: 'fa-id-badge', label: 'All Guides' },
      { id: 'users', icon: 'fa-users', label: 'All Users' },
    ];
    document.getElementById('app').innerHTML = `
      <div class="app-layout">
        <aside class="sidebar">
          <div class="sidebar-logo">Local<span>Connect</span></div>
          <div class="sidebar-user">
            <div class="avatar" style="background:#e94560">A</div>
            <div class="sidebar-user-info"><small>Admin</small><strong>Administrator</strong></div>
          </div>
          <nav class="sidebar-nav">
            ${navItems.map(n => `
              <div class="nav-item ${page===n.id?'active':''}" onclick="Admin.navigate('${n.id}')">
                <i class="fa-solid ${n.icon}"></i> ${n.label}
              </div>`).join('')}
          </nav>
          <div class="sidebar-footer">
            <div class="nav-item" onclick="App.logout()"><i class="fa-solid fa-right-from-bracket"></i> Logout</div>
          </div>
        </aside>
        <main class="main-content">${contentHtml}</main>
      </div>`;
  },

  navigate(page) {
    switch(page) {
      case 'dashboard': this.renderDashboard(); break;
      case 'applications': this.renderApplications(); break;
      case 'guides': this.renderGuides(); break;
      case 'users': this.renderUsers(); break;
    }
  },

  async renderDashboard() {
    this.layout('dashboard', `<div id="adash"><div class="empty"><i class="fa-solid fa-spinner fa-spin"></i></div></div>`);
    const stats = await API.get('/api/admin/stats').catch(() => ({}));
    document.getElementById('adash').innerHTML = `
      <div class="topbar"><div class="page-title">Admin Dashboard <small>LocalConnect Analytics</small></div></div>
      <div class="stat-grid">
        <div class="stat-card"><div class="stat-icon blue"><i class="fa-solid fa-users"></i></div><div><div class="stat-num">${stats.tourists||0}</div><div class="stat-label">Total Tourists</div></div></div>
        <div class="stat-card"><div class="stat-icon green"><i class="fa-solid fa-id-badge"></i></div><div><div class="stat-num">${stats.guides||0}</div><div class="stat-label">Active Guides</div></div></div>
        <div class="stat-card"><div class="stat-icon orange"><i class="fa-solid fa-calendar-check"></i></div><div><div class="stat-num">${stats.bookings||0}</div><div class="stat-label">Total Bookings</div></div></div>
        <div class="stat-card"><div class="stat-icon red"><i class="fa-solid fa-clock"></i></div><div><div class="stat-num">${stats.pending_applications||0}</div><div class="stat-label">Pending Applications</div></div></div>
        <div class="stat-card"><div class="stat-icon purple"><i class="fa-solid fa-indian-rupee-sign"></i></div><div><div class="stat-num">${formatMoney(stats.revenue||0)}</div><div class="stat-label">Total Revenue</div></div></div>
      </div>
      ${stats.pending_applications > 0 ? `<div class="alert alert-warning"><i class="fa-solid fa-triangle-exclamation"></i> ${stats.pending_applications} guide application(s) pending review. <a onclick="Admin.navigate('applications')" style="cursor:pointer;font-weight:600">Review now →</a></div>` : ''}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;margin-top:1rem">
        <div class="card" style="cursor:pointer" onclick="Admin.navigate('applications')">
          <div class="section-title mb-1"><i class="fa-solid fa-file-lines" style="color:#e94560"></i> Guide Applications</div>
          <p class="text-muted">Review and approve guide enrollment requests</p>
        </div>
        <div class="card" style="cursor:pointer" onclick="Admin.navigate('guides')">
          <div class="section-title mb-1"><i class="fa-solid fa-id-badge" style="color:#2ecc71"></i> Manage Guides</div>
          <p class="text-muted">View all active guides and their details</p>
        </div>
      </div>`;
  },

  async renderApplications() {
    this.layout('applications', `<div class="topbar"><div class="page-title">Guide Applications <small>Review enrollment requests</small></div></div><div id="apps-list"></div>`);
    const apps = await API.get('/api/admin/applications').catch(() => []);
    document.getElementById('apps-list').innerHTML = apps.length ? apps.map(a => `
      <div class="booking-card">
        <div class="booking-header">
          <div>
            <strong>${a.full_name}</strong>
            <div class="text-muted">${a.email} · ${a.phone}</div>
          </div>
          <span class="status-badge status-${a.status === 'pending' ? 'pending' : a.status === 'approved' ? 'accepted' : 'rejected'}">${a.status}</span>
        </div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:0.75rem;font-size:0.83rem;color:#6b7280;margin-bottom:1rem">
          <div><strong style="color:#374151;display:block">District</strong>${a.district}</div>
          <div><strong style="color:#374151;display:block">Experience</strong>${a.experience}</div>
          <div><strong style="color:#374151;display:block">Languages</strong>${a.languages}</div>
          <div><strong style="color:#374151;display:block">Applied</strong>${formatDate(a.applied_at)}</div>
          ${a.reviewed_at ? `<div><strong style="color:#374151;display:block">Reviewed</strong>${formatDate(a.reviewed_at)}</div>` : ''}
        </div>
        ${a.about ? `<div style="background:#f9fafb;padding:0.6rem 1rem;border-radius:8px;font-size:0.82rem;color:#6b7280;margin-bottom:0.75rem">${a.about}</div>` : ''}
        ${a.status === 'pending' ? `
          <div style="display:flex;gap:0.75rem">
            <button class="btn btn-success btn-sm" onclick="Admin.reviewApp(${a.id},'approved')"><i class="fa-solid fa-check"></i> Approve</button>
            <button class="btn btn-danger btn-sm" onclick="Admin.reviewApp(${a.id},'rejected')"><i class="fa-solid fa-xmark"></i> Reject</button>
          </div>` : ''}
      </div>`).join('') : `<div class="card"><div class="empty"><i class="fa-solid fa-file-circle-check"></i><p>No applications pending</p></div></div>`;
  },

  async reviewApp(id, status) {
    try {
      await API.put(`/api/admin/applications/${id}`, { status });
      showAlert(status === 'approved' ? 'Application approved! User is now a guide.' : 'Application rejected.', status === 'approved' ? 'success' : 'info', '#app');
      Admin.renderApplications();
    } catch(e) { showAlert(e.message); }
  },

  async renderGuides() {
    this.layout('guides', `<div class="topbar"><div class="page-title">All Guides</div></div><div id="guides-content"></div>`);
    const guides = await API.get('/api/admin/guides').catch(() => []);
    document.getElementById('guides-content').innerHTML = `
      <div class="card">
        ${guides.length ? `
          <div class="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>District</th><th>Rating</th><th>Tours</th></tr></thead>
              <tbody>
                ${guides.map(g => `<tr>
                  <td><strong>${g.name}</strong></td>
                  <td>${g.email}</td>
                  <td>${g.phone || '-'}</td>
                  <td><span class="tag tag-blue">${g.district || '-'}</span></td>
                  <td><i class="fa-solid fa-star" style="color:#f39c12;font-size:0.8rem"></i> ${g.rating || 4.5}</td>
                  <td>${g.total_tours || 0}</td>
                </tr>`).join('')}
              </tbody>
            </table>
          </div>` : `<div class="empty"><i class="fa-solid fa-id-badge"></i><p>No guides yet</p></div>`}
      </div>`;
  },

  async renderUsers() {
    this.layout('users', `<div class="topbar"><div class="page-title">All Users</div></div><div id="users-content"></div>`);
    const users = await API.get('/api/admin/users').catch(() => []);
    document.getElementById('users-content').innerHTML = `
      <div class="card">
        <div class="table-wrap">
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Phone</th><th>Joined</th></tr></thead>
            <tbody>
              ${users.map(u => `<tr>
                <td><strong>${u.name}</strong></td>
                <td>${u.email}</td>
                <td><span class="tag ${u.role==='guide'?'tag-green':'tag-blue'}">${u.role}</span></td>
                <td>${u.phone || '-'}</td>
                <td>${formatDate(u.created_at)}</td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>`;
  }
};