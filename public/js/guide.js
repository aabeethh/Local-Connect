const Guide = {
  layout(page, contentHtml) {
    const user = API.user();
    const navItems = [
      { id: 'dashboard', icon: 'fa-gauge', label: 'Dashboard' },
      { id: 'requests', icon: 'fa-bell', label: 'Booking Requests' },
      { id: 'packages', icon: 'fa-box-open', label: 'My Packages' },
      { id: 'revenue', icon: 'fa-chart-line', label: 'Revenue' },
      { id: 'profile', icon: 'fa-user', label: 'My Profile' },
    ];
    document.getElementById('app').innerHTML = `
      <div class="app-layout">
        <aside class="sidebar">
          <div class="sidebar-logo">Local<span>Connect</span></div>
          <div class="sidebar-user">
            <div class="avatar">${user.profile_image ? `<img src="${user.profile_image}">` : initials(user.name)}</div>
            <div class="sidebar-user-info"><small>Guide</small><strong>${user.name}</strong></div>
          </div>
          <nav class="sidebar-nav">
            ${navItems.map(n => `
              <div class="nav-item ${page === n.id ? 'active' : ''}" onclick="Guide.navigate('${n.id}')">
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
      case 'requests': this.renderRequests(); break;
      case 'packages': this.renderPackages(); break;
      case 'revenue': this.renderRevenue(); break;
      case 'profile': this.renderProfile(); break;
    }
  },

  async renderDashboard() {
    this.layout('dashboard', `<div id="gdash"></div>`);
    const [status, bookings, revenue] = await Promise.all([
      API.get('/api/guide/profile-status').catch(() => ({ complete: 0 })),
      API.get('/api/guide/bookings').catch(() => []),
      API.get('/api/guide/revenue').catch(() => ({ payments: [], total: 0 }))
    ]);
    const pending = bookings.filter(b => b.status === 'pending').length;
    const accepted = bookings.filter(b => b.status === 'accepted').length;
    document.getElementById('gdash').innerHTML = `
      <div class="topbar"><div class="page-title">Guide Dashboard <small>Welcome, ${API.user().name}</small></div></div>
      ${!status.complete ? `<div class="alert alert-warning"><i class="fa-solid fa-triangle-exclamation"></i> Your profile is incomplete. <a onclick="Guide.navigate('profile')" style="cursor:pointer;font-weight:600">Set up your profile →</a></div>` : ''}
      <div class="stat-grid">
        <div class="stat-card"><div class="stat-icon orange"><i class="fa-solid fa-clock"></i></div><div><div class="stat-num">${pending}</div><div class="stat-label">Pending Requests</div></div></div>
        <div class="stat-card"><div class="stat-icon green"><i class="fa-solid fa-check"></i></div><div><div class="stat-num">${accepted}</div><div class="stat-label">Accepted Tours</div></div></div>
        <div class="stat-card"><div class="stat-icon blue"><i class="fa-solid fa-list"></i></div><div><div class="stat-num">${bookings.length}</div><div class="stat-label">Total Requests</div></div></div>
        <div class="stat-card"><div class="stat-icon purple"><i class="fa-solid fa-indian-rupee-sign"></i></div><div><div class="stat-num">${formatMoney(revenue.total)}</div><div class="stat-label">Total Earned</div></div></div>
      </div>
      ${pending > 0 ? `<div class="alert alert-info"><i class="fa-solid fa-bell"></i> You have ${pending} pending booking request(s). <a onclick="Guide.navigate('requests')" style="cursor:pointer;font-weight:600">View Requests →</a></div>` : ''}
      <div class="card">
        <div class="section-title mb-2">Recent Bookings</div>
        ${bookings.slice(0,5).length ? bookings.slice(0,5).map(b => `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:0.75rem 0;border-bottom:1px solid #f3f4f6">
            <div>
              <strong>${b.tourist_name}</strong> — ${b.place_name}
              <div class="text-muted">${formatDate(b.travel_date)}</div>
            </div>
            <span class="status-badge status-${b.status}">${b.status}</span>
          </div>`).join('') : `<div class="empty"><i class="fa-solid fa-calendar-xmark"></i><p>No bookings yet</p></div>`}
      </div>`;
  },

  async renderRequests() {
    this.layout('requests', `<div class="topbar"><div class="page-title">Booking Requests <small>Manage tourist requests</small></div></div><div id="requests-list"></div>`);
    const bookings = await API.get('/api/guide/bookings').catch(() => []);
    document.getElementById('requests-list').innerHTML = bookings.length ? bookings.map(b => `
      <div class="booking-card">
        <div class="booking-header">
          <div style="display:flex;align-items:center;gap:0.75rem">
            ${avatarHtml(b.tourist_image, b.tourist_name, 42)}
            <div>
              <strong>${b.tourist_name}</strong>
              <div class="text-muted">${b.tourist_email} · ${b.tourist_phone || 'No phone'}</div>
            </div>
          </div>
          <span class="status-badge status-${b.payment_status === 'paid' ? 'paid' : b.status}">${b.payment_status === 'paid' ? 'Paid' : b.status}</span>
        </div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:0.75rem;font-size:0.83rem;color:#6b7280;margin-bottom:1rem">
          <div><strong style="color:#374151;display:block">Place</strong>${b.place_name}</div>
          <div><strong style="color:#374151;display:block">Package</strong>${b.package_title || 'Custom'}</div>
          <div><strong style="color:#374151;display:block">Date</strong>${formatDate(b.travel_date)}</div>
          <div><strong style="color:#374151;display:block">People</strong>${b.num_people}</div>
          <div><strong style="color:#374151;display:block">Amount</strong>${formatMoney(b.total_amount)}</div>
          <div><strong style="color:#374151;display:block">Requested</strong>${formatDate(b.created_at)}</div>
        </div>
        ${b.tourist_message ? `<div style="background:#f9fafb;padding:0.6rem 1rem;border-radius:8px;font-size:0.82rem;color:#6b7280;margin-bottom:0.75rem"><i class="fa-solid fa-comment"></i> "${b.tourist_message}"</div>` : ''}
        ${b.status === 'pending' ? `
          <div style="display:flex;gap:0.75rem">
            <button class="btn btn-success btn-sm" onclick="Guide.respondBooking(${b.id},'accepted')"><i class="fa-solid fa-check"></i> Accept</button>
            <button class="btn btn-danger btn-sm" onclick="Guide.respondBooking(${b.id},'rejected')"><i class="fa-solid fa-xmark"></i> Decline</button>
          </div>` : ''}
        ${b.payment_status === 'paid' ? `<div class="alert alert-success" style="margin:0"><i class="fa-solid fa-circle-check"></i> Tourist has paid. Payment will be transferred to your account.</div>` : ''}
      </div>`).join('') : `<div class="card"><div class="empty"><i class="fa-solid fa-inbox"></i><p>No booking requests yet</p></div></div>`;
  },

  async respondBooking(id, status) {
    try {
      await API.put(`/api/guide/bookings/${id}`, { status });
      showAlert(status === 'accepted' ? 'Booking accepted! Tourist will be notified.' : 'Booking declined.', status === 'accepted' ? 'success' : 'info', '#app');
      Guide.renderRequests();
    } catch(e) { showAlert(e.message); }
  },

  async renderPackages() {
    this.layout('packages', `<div class="topbar"><div class="page-title">My Packages <small>Create and manage tour packages</small></div><button class="btn btn-primary btn-sm" onclick="Guide.showAddPackage()"><i class="fa-solid fa-plus"></i> Add Package</button></div><div id="pkg-list"></div>`);
    await this.loadPackages();
  },

  async loadPackages() {
    const user = API.user();
    const packages = await API.get(`/api/guides/${user.id}/packages`).catch(() => []);
    document.getElementById('pkg-list').innerHTML = packages.length ? `
      <div class="card-grid">
        ${packages.map(p => `
          <div class="card">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:0.75rem">
              <strong>${p.title}</strong>
              <button class="btn btn-danger btn-sm" onclick="Guide.deletePackage(${p.id})"><i class="fa-solid fa-trash"></i></button>
            </div>
            <div class="package-price">${formatMoney(p.price)}<span style="font-size:0.78rem;color:#9ca3af"> / person</span></div>
            <div style="margin:0.5rem 0;font-size:0.82rem;color:#6b7280">
              <span><i class="fa-solid fa-clock"></i> ${p.duration}</span>
              <span style="margin-left:1rem"><i class="fa-solid fa-users"></i> Max ${p.max_people}</span>
            </div>
            <p style="font-size:0.82rem;color:#6b7280">${p.description || ''}</p>
            ${p.includes ? `<div style="font-size:0.78rem;color:#9ca3af;margin-top:0.5rem"><strong>Includes:</strong> ${p.includes}</div>` : ''}
          </div>`).join('')}
      </div>` : `<div class="card"><div class="empty"><i class="fa-solid fa-box-open"></i><p>No packages yet. Add your first package!</p></div></div>`;
  },

  showAddPackage() {
    modal(`<div class="modal">
      <div class="modal-header">
        <span class="modal-title">Add Package</span>
        <button class="modal-close" onclick="document.querySelector('.modal-overlay').remove()">✕</button>
      </div>
      <div id="alert-box"></div>
      <div class="form-row">
        <div class="form-group"><label>Package Title</label><input id="pt" placeholder="e.g. Full Day Tour"></div>
        <div class="form-group"><label>Price (₹ per person)</label><input type="number" id="pp" placeholder="1500"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Duration</label><input id="pd" placeholder="e.g. 8 hours"></div>
        <div class="form-group"><label>Max People</label><input type="number" id="pm" placeholder="10"></div>
      </div>
      <div class="form-group"><label>Description</label><textarea id="pdesc" placeholder="What does this tour include?"></textarea></div>
      <div class="form-group"><label>Includes</label><input id="pinc" placeholder="Meals, Transport, Guide fee..."></div>
      <button class="btn btn-primary w-full" id="add-pkg-btn" onclick="Guide.addPackage()">Add Package</button>
    </div>`);
  },

  async addPackage() {
    const data = {
      title: document.getElementById('pt')?.value,
      price: document.getElementById('pp')?.value,
      duration: document.getElementById('pd')?.value,
      max_people: document.getElementById('pm')?.value,
      description: document.getElementById('pdesc')?.value,
      includes: document.getElementById('pinc')?.value,
    };
    if (!data.title || !data.price) return showAlert('Title and price required');
    const btn = document.getElementById('add-pkg-btn');
    btn.innerHTML = '<span class="spinner"></span>'; btn.disabled = true;
    try {
      await API.post('/api/guide/packages', data);
      document.querySelector('.modal-overlay')?.remove();
      Guide.loadPackages();
    } catch(e) {
      showAlert(e.message);
      btn.textContent = 'Add Package'; btn.disabled = false;
    }
  },

  async deletePackage(id) {
    if (!confirm('Delete this package?')) return;
    await API.del(`/api/guide/packages/${id}`);
    Guide.loadPackages();
  },

  async renderRevenue() {
    this.layout('revenue', `<div class="topbar"><div class="page-title">Revenue & Payments</div></div><div id="rev-content"></div>`);
    const rev = await API.get('/api/guide/revenue').catch(() => ({ payments: [], total: 0 }));
    document.getElementById('rev-content').innerHTML = `
      <div class="stat-grid" style="margin-bottom:1.5rem">
        <div class="stat-card"><div class="stat-icon green"><i class="fa-solid fa-indian-rupee-sign"></i></div><div><div class="stat-num">${formatMoney(rev.total)}</div><div class="stat-label">Total Earned</div></div></div>
        <div class="stat-card"><div class="stat-icon blue"><i class="fa-solid fa-receipt"></i></div><div><div class="stat-num">${rev.payments.length}</div><div class="stat-label">Transactions</div></div></div>
      </div>
      <div class="card">
        <div class="section-title mb-2">Payment History</div>
        ${rev.payments.length ? `
          <div class="table-wrap">
            <table>
              <thead><tr><th>Tourist</th><th>Place</th><th>Amount</th><th>Method</th><th>Txn ID</th><th>Date</th></tr></thead>
              <tbody>
                ${rev.payments.map(p => `<tr>
                  <td>${p.tourist_name}</td>
                  <td>${p.place_name}</td>
                  <td class="revenue-amount">${formatMoney(p.amount)}</td>
                  <td><span class="tag tag-blue">${p.payment_method}</span></td>
                  <td style="font-family:monospace;font-size:0.8rem">${p.transaction_id}</td>
                  <td>${formatDate(p.paid_at)}</td>
                </tr>`).join('')}
              </tbody>
            </table>
          </div>` : `<div class="empty"><i class="fa-solid fa-chart-bar"></i><p>No payments received yet</p></div>`}
      </div>`;
  },

  async renderProfile() {
    this.layout('profile', `<div class="topbar"><div class="page-title">My Profile</div></div><div id="gp-content"></div>`);
    const me = await API.get('/api/me').catch(() => API.user());
    document.getElementById('gp-content').innerHTML = `
      <div class="profile-banner">
        <div class="profile-avatar-lg">${me.profile_image ? `<img src="${me.profile_image}">` : initials(me.name)}</div>
        <div class="profile-info"><h2>${me.name}</h2><p>${me.email} · Guide</p></div>
      </div>
      <div class="card">
        <div class="section-title mb-2">Edit Profile</div>
        <div id="alert-box"></div>
        <form id="gprofile-form">
          <div class="form-row">
            <div class="form-group"><label>Full Name</label><input name="name" value="${me.name || ''}"></div>
            <div class="form-group"><label>Phone</label><input name="phone" value="${me.phone || ''}"></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Your District</label>
              <select name="district">
                ${['Thiruvananthapuram','Kollam','Pathanamthitta','Alappuzha','Kottayam','Idukki','Ernakulam','Thrissur','Palakkad','Malappuram','Kozhikode','Wayanad','Kannur','Kasaragod'].map(d => `<option ${(me.district||'')==d?'selected':''}>${d}</option>`).join('')}
              </select>
            </div>
            <div class="form-group"><label>Experience (years)</label><input type="number" name="experience_years" value="${me.experience_years || ''}"></div>
          </div>
          <div class="form-group"><label>Languages</label><input name="languages" value="${me.languages || ''}" placeholder="Malayalam, English, Hindi"></div>
          <div class="form-group"><label>Specialization</label><input name="specialization" value="${me.specialization || ''}" placeholder="e.g. Wildlife, Heritage, Adventure"></div>
          <div class="form-group"><label>Bio</label><textarea name="bio">${me.bio || ''}</textarea></div>
          <div class="form-group"><label>Profile Photo</label><input type="file" name="profile_image" accept="image/*"></div>
          <button type="button" class="btn btn-primary" id="save-gp-btn" onclick="Guide.saveProfile()">Save Profile</button>
        </form>
      </div>`;
  },

  async saveProfile() {
    const form = document.getElementById('gprofile-form');
    const fd = new FormData(form);
    const btn = document.getElementById('save-gp-btn');
    btn.innerHTML = '<span class="spinner"></span>'; btn.disabled = true;
    try {
      await API.putForm('/api/guide/profile', fd);
      const me = await API.get('/api/me');
      API.setAuth(API.token(), { ...API.user(), name: me.name, profile_image: me.profile_image });
      showAlert('Profile updated!', 'success');
    } catch(e) { showAlert(e.message); }
    btn.textContent = 'Save Profile'; btn.disabled = false;
  }
};