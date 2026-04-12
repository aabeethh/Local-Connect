const Tourist = {
  currentPage: 'dashboard',

  layout(page, contentHtml) {
    const user = API.user();
    const navItems = [
      { id: 'dashboard', icon: 'fa-gauge', label: 'Dashboard' },
      { id: 'explore', icon: 'fa-map-location-dot', label: 'Explore Places' },
      { id: 'bookings', icon: 'fa-calendar-check', label: 'My Bookings' },
      { id: 'profile', icon: 'fa-user', label: 'My Profile' },
      { id: 'enroll-status', icon: 'fa-id-badge', label: 'Guide Enrolment' },
    ];
    document.getElementById('app').innerHTML = `
      <div class="app-layout">
        <aside class="sidebar">
          <div class="sidebar-logo">Local<span>Connect</span></div>
          <div class="sidebar-user">
            <div class="avatar">${user.profile_image ? `<img src="${user.profile_image}">` : initials(user.name)}</div>
            <div class="sidebar-user-info">
              <small>Tourist</small>
              <strong>${user.name}</strong>
            </div>
          </div>
          <nav class="sidebar-nav">
            ${navItems.map(n => `
              <div class="nav-item ${page === n.id ? 'active' : ''}" onclick="Tourist.navigate('${n.id}')">
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
    this.currentPage = page;
    switch (page) {
      case 'dashboard': this.renderDashboard(); break;
      case 'explore': this.renderExplore(); break;
      case 'bookings': this.renderBookings(); break;
      case 'profile': this.renderProfile(); break;
      case 'enroll-status': this.renderEnrollStatus(); break;
    }
  },

  async renderDashboard() {
    const user = API.user();
    this.layout('dashboard', `<div id="dash-content"><div class="empty"><i class="fa-solid fa-spinner fa-spin"></i></div></div>`);
    const [me, visits, bookings] = await Promise.all([
      API.get('/api/me').catch(() => user),
      API.get('/api/tourist/visits').catch(() => []),
      API.get('/api/tourist/bookings').catch(() => [])
    ]);
    const active = bookings.filter(b => b.status === 'accepted' && b.payment_status === 'unpaid').length;
    const paid = bookings.filter(b => b.payment_status === 'paid').length;
    document.getElementById('dash-content').innerHTML = `
      <div class="topbar"><div class="page-title">Dashboard <small>Welcome back, ${me.name}!</small></div></div>
      <div class="stat-grid">
        <div class="stat-card"><div class="stat-icon blue"><i class="fa-solid fa-map-pin"></i></div><div><div class="stat-num">${visits.length}</div><div class="stat-label">Places Visited</div></div></div>
        <div class="stat-card"><div class="stat-icon green"><i class="fa-solid fa-calendar"></i></div><div><div class="stat-num">${paid}</div><div class="stat-label">Completed Tours</div></div></div>
        <div class="stat-card"><div class="stat-icon orange"><i class="fa-solid fa-clock"></i></div><div><div class="stat-num">${active}</div><div class="stat-label">Pending Payment</div></div></div>
        <div class="stat-card"><div class="stat-icon purple"><i class="fa-solid fa-list"></i></div><div><div class="stat-num">${bookings.length}</div><div class="stat-label">Total Bookings</div></div></div>
      </div>

      <div class="enroll-banner">
        <div><h3>Become a Local Guide</h3><p>Apply from your tourist account and get a separate guide login after admin approval</p></div>
        <button class="btn btn-outline" onclick="Tourist.renderEnrollForm()">Apply as Guide</button>
      </div>

      <div class="card">
        <div class="section-header"><span class="section-title"><i class="fa-solid fa-clock-rotate-left" style="color:#e94560;margin-right:0.5rem"></i>Recently Visited Places</span></div>
        ${visits.length ? `<ul class="revenue-list">
          ${visits.map(v => `<li><div><strong>${v.place_name}</strong><div class="text-muted">${v.district}</div></div><div class="text-muted">${formatDate(v.visited_at)}</div></li>`).join('')}
        </ul>` : `<div class="empty"><i class="fa-solid fa-map"></i><p>No places visited yet. Start exploring Kerala!</p><button class="btn btn-primary btn-sm mt-2" onclick="Tourist.navigate('explore')">Explore Now</button></div>`}
      </div>

      ${active > 0 ? `<div class="alert alert-info mt-2"><i class="fa-solid fa-circle-info"></i> You have ${active} booking(s) awaiting payment. <a onclick="Tourist.navigate('bookings')" style="cursor:pointer;font-weight:600">Pay now →</a></div>` : ''}`;
  },

  async renderExplore() {
    this.layout('explore', `
      <div class="topbar"><div class="page-title">Explore Kerala <small>Discover amazing places and book local guides</small></div></div>
      <div class="filter-bar">
        <select id="district-filter" onchange="Tourist.filterPlaces()">
          <option value="">All Districts</option>
          ${['Thiruvananthapuram','Kollam','Pathanamthitta','Alappuzha','Kottayam','Idukki','Ernakulam','Thrissur','Palakkad','Malappuram','Kozhikode','Wayanad','Kannur','Kasaragod'].map(d => `<option>${d}</option>`).join('')}
        </select>
        <input type="text" id="place-search" placeholder="Search places..." oninput="Tourist.filterPlaces()" style="flex:1;max-width:300px;padding:0.6rem 1rem;border:1.5px solid #e5e7eb;border-radius:8px;font-family:inherit">
      </div>
      <div id="places-grid" class="card-grid"></div>`);
    await this.loadPlaces();
  },

  async loadPlaces(district = '', search = '') {
    const places = await API.get(`/api/places${district ? '?district=' + district : ''}`).catch(() => []);
    const filtered = search ? places.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.district.toLowerCase().includes(search.toLowerCase())) : places;

    // Unsplash image map keyed by place name (falls back to category image)
    const placeImages = {
      'Munnar':                   'https://images.unsplash.com/photo-1605276374584-bee46080205b?w=800&q=80',
      'Alleppey Backwaters':      'https://images.unsplash.com/photo-1605325984359-a41a0001d88a?w=800&q=80',
      'Wayanad Wildlife Sanctuary':'https://images.unsplash.com/photo-1489493072403-841bd36e76ea?w=800&q=80',
      'Fort Kochi':               'https://images.unsplash.com/photo-1605249217295-60d74f90801d?w=800&q=80',
      'Thekkady':                 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
      'Kovalam Beach':            'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
      'Varkala Cliff':            'https://images.unsplash.com/photo-1507838639206-4edd02385f4f?w=800&q=80',
      'Athirapally Falls':        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
      'Bekal Fort':               'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
      'Kumarakom':                'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
      'Vagamon':                  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
      'Thrissur Pooram':          'https://images.unsplash.com/photo-1586349943529-3c1021fbb225?w=800&q=80',
    };
    const categoryImages = {
      Nature:    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=75',
      Beach:     'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&q=75',
      Wildlife:  'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600&q=75',
      Heritage:  'https://images.unsplash.com/photo-1568454537842-d933259bb258?w=600&q=75',
      Backwater: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=600&q=75',
      Culture:   'https://images.unsplash.com/photo-1575540842954-99ef7dc76a5c?w=600&q=75',
    };

    document.getElementById('places-grid').innerHTML = filtered.length ? filtered.map(p => {
      const imgSrc = placeImages[p.name] || categoryImages[p.category] || 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=600&q=75';
      return `
      <div class="place-card">
        <div class="place-img">
          <img src="${imgSrc}" alt="${p.name}" loading="lazy" style="width:100%;height:100%;object-fit:cover;position:absolute;top:0;left:0;">
          <div class="place-badge">${p.category}</div>
        </div>
        <div class="place-body">
          <div class="place-name">${p.name}</div>
          <div class="place-district"><i class="fa-solid fa-location-dot"></i>${p.district}</div>
          <div class="place-desc">${p.description}</div>
          <div class="rating"><i class="fa-solid fa-star"></i> ${p.rating} <span>(Highly rated)</span></div>
          <button class="btn btn-primary w-full btn-sm" onclick="Tourist.showGuides('${p.district}','${p.name}')">
            <i class="fa-solid fa-user-tie"></i> Book a Guide
          </button>
        </div>
      </div>`}).join('') : `<div class="empty" style="grid-column:1/-1"><i class="fa-solid fa-map-pin"></i><p>No places found</p></div>`;
  },

  filterPlaces() {
    const d = document.getElementById('district-filter')?.value || '';
    const s = document.getElementById('place-search')?.value || '';
    this.loadPlaces(d, s);
  },

  async showGuides(district, placeName) {
    const guides = await API.get(`/api/guides?district=${district}`).catch(() => []);
    const m = modal(`<div class="modal">
      <div class="modal-header">
        <span class="modal-title"><i class="fa-solid fa-user-tie" style="color:#e94560"></i> Guides in ${district}</span>
        <button class="modal-close" onclick="document.querySelector('.modal-overlay').remove()">✕</button>
      </div>
      <p class="text-muted mb-2">Booking for: <strong>${placeName}</strong></p>
      <div id="guides-list">
        ${guides.length ? guides.map(g => `
          <div class="guide-card mb-2" style="margin-bottom:1rem">
            <div class="guide-header">
              <div class="guide-avatar">${g.profile_image ? `<img src="${g.profile_image}">` : initials(g.name)}</div>
              <div>
                <div class="guide-name">${g.name}</div>
                <div class="guide-meta"><i class="fa-solid fa-location-dot"></i> ${g.district} · ${g.experience_years || 0} yrs exp</div>
                <div style="margin-top:4px">
                  <i class="fa-solid fa-star" style="color:#f39c12;font-size:0.8rem"></i> <span style="font-size:0.8rem">${g.rating || 4.5}</span>
                  <span class="tag tag-blue" style="margin-left:6px">${g.languages || 'Malayalam, English'}</span>
                </div>
              </div>
            </div>
            ${g.bio ? `<p style="font-size:0.82rem;color:#6b7280;margin-bottom:0.75rem">${g.bio}</p>` : ''}
            <button class="btn btn-primary btn-sm w-full" onclick="Tourist.showPackages(${g.id},'${g.name}','${placeName}','${district}')">
              View Packages & Book
            </button>
          </div>`).join('') : `<div class="empty"><i class="fa-solid fa-user-slash"></i><p>No guides available in ${district} yet.</p></div>`}
      </div>
    </div>`);
  },

  async showPackages(guideId, guideName, placeName, district) {
    document.querySelector('.modal-overlay')?.remove();
    const packages = await API.get(`/api/guides/${guideId}/packages`).catch(() => []);
    if (!packages.length) return showAlert('This guide has no packages yet', 'info');
    let selectedPkg = null;
    const m = modal(`<div class="modal">
      <div class="modal-header">
        <span class="modal-title">Packages by ${guideName}</span>
        <button class="modal-close" onclick="document.querySelector('.modal-overlay').remove()">✕</button>
      </div>
      <p class="text-muted mb-2">Place: ${placeName} · ${district}</p>
      <div id="alert-box"></div>
      <div id="pkg-list">
        ${packages.map(p => `
          <div class="package-card" id="pkg-${p.id}" onclick="Tourist.selectPackage(${p.id}, ${p.price}, ${JSON.stringify(packages).replace(/"/g, '&quot;')})">
            <div class="package-title">${p.title}</div>
            <div class="package-meta">${p.duration} · Max ${p.max_people} people</div>
            <div style="margin:0.4rem 0;font-size:0.82rem;color:#6b7280">${p.description || ''}</div>
            <div class="package-price">${formatMoney(p.price)} <span style="font-size:0.78rem;color:#9ca3af">per person</span></div>
          </div>`).join('')}
      </div>
      <div id="book-form" style="display:none;margin-top:1rem">
        <div class="divider"></div>
        <div class="form-row">
          <div class="form-group"><label>Travel Date</label><input type="date" id="tdate" min="${new Date().toISOString().split('T')[0]}"></div>
          <div class="form-group"><label>No. of People</label><input type="number" id="npeople" value="1" min="1" max="20"></div>
        </div>
        <div class="form-group"><label>Message to Guide (optional)</label><textarea id="tmsg" placeholder="Any special requirements..."></textarea></div>
        <div id="total-display" style="font-size:0.9rem;color:#16a34a;font-weight:600;margin-bottom:1rem"></div>
        <button class="btn btn-primary w-full" id="book-btn" onclick="Tourist.confirmBooking(${guideId},'${placeName}','${district}')">Send Booking Request</button>
      </div>
    </div>`);
    Tourist._selectedPkg = null;
    Tourist._packages = packages;
  },

  selectPackage(pkgId, price, packages) {
    document.querySelectorAll('.package-card').forEach(c => c.classList.remove('selected'));
    document.getElementById('pkg-' + pkgId)?.classList.add('selected');
    Tourist._selectedPkg = { id: pkgId, price };
    document.getElementById('book-form').style.display = 'block';
    const n = parseInt(document.getElementById('npeople')?.value) || 1;
    document.getElementById('total-display').textContent = `Estimated Total: ${formatMoney(price * n)}`;
    document.getElementById('npeople').oninput = () => {
      const np = parseInt(document.getElementById('npeople').value) || 1;
      document.getElementById('total-display').textContent = `Estimated Total: ${formatMoney(price * np)}`;
    };
  },

  async confirmBooking(guideId, placeName, district) {
    if (!Tourist._selectedPkg) return showAlert('Please select a package');
    const date = document.getElementById('tdate')?.value;
    const npeople = parseInt(document.getElementById('npeople')?.value) || 1;
    const msg = document.getElementById('tmsg')?.value;
    if (!date) return showAlert('Please select a travel date');
    const btn = document.getElementById('book-btn');
    btn.innerHTML = '<span class="spinner"></span>'; btn.disabled = true;
    try {
      await API.post('/api/bookings', {
        guide_id: guideId,
        package_id: Tourist._selectedPkg.id,
        place_name: placeName,
        district,
        travel_date: date,
        num_people: npeople,
        total_amount: Tourist._selectedPkg.price * npeople,
        tourist_message: msg
      });
      document.querySelector('.modal-overlay')?.remove();
      showAlert('Booking request sent! Waiting for guide to accept.', 'success', '#app');
      setTimeout(() => Tourist.renderBookings(), 1500);
    } catch(e) {
      showAlert(e.message);
      btn.textContent = 'Send Booking Request'; btn.disabled = false;
    }
  },

  async renderBookings() {
    this.layout('bookings', `<div class="topbar"><div class="page-title">My Bookings <small>Track all your tour requests</small></div></div><div id="bookings-content"></div>`);
    const bookings = await API.get('/api/tourist/bookings').catch(() => []);
    const statusOrder = { accepted: 0, pending: 1, paid: 2, rejected: 3 };
    bookings.sort((a, b) => (statusOrder[a.status] || 9) - (statusOrder[b.status] || 9));
    document.getElementById('bookings-content').innerHTML = bookings.length ? bookings.map(b => `
      <div class="booking-card">
        <div class="booking-header">
          <div>
            <strong style="font-size:1rem">${b.place_name}</strong>
            <div class="text-muted mt-1"><i class="fa-solid fa-location-dot"></i> ${b.district}</div>
          </div>
          <span class="status-badge status-${b.payment_status === 'paid' ? 'paid' : b.status}">${b.payment_status === 'paid' ? 'Paid' : b.status.charAt(0).toUpperCase() + b.status.slice(1)}</span>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:0.75rem;font-size:0.83rem;color:#6b7280;margin-bottom:1rem">
          <div><strong style="display:block;color:#374151">Guide</strong>${b.guide_name}</div>
          <div><strong style="display:block;color:#374151">Package</strong>${b.package_title || 'Custom'}</div>
          <div><strong style="display:block;color:#374151">Date</strong>${formatDate(b.travel_date)}</div>
          <div><strong style="display:block;color:#374151">People</strong>${b.num_people}</div>
          <div><strong style="display:block;color:#374151">Amount</strong>${formatMoney(b.total_amount)}</div>
          <div><strong style="display:block;color:#374151">Booked</strong>${formatDate(b.created_at)}</div>
        </div>
        ${b.status === 'accepted' && b.payment_status === 'unpaid' ? `
          <div class="alert alert-success" style="margin-bottom:0.75rem"><i class="fa-solid fa-circle-check"></i> Guide accepted your request! Complete payment to confirm.</div>
          <button class="btn btn-success btn-sm" onclick="Tourist.showPayment(${b.id}, ${b.total_amount})">
            <i class="fa-solid fa-credit-card"></i> Pay ${formatMoney(b.total_amount)}
          </button>` : ''}
        ${b.status === 'rejected' ? `<div class="alert alert-error" style="margin-bottom:0"><i class="fa-solid fa-xmark-circle"></i> Guide declined this request.</div>` : ''}
        ${b.payment_status === 'paid' ? `<div class="alert alert-info" style="margin-bottom:0"><i class="fa-solid fa-check-circle"></i> Payment complete. Enjoy your tour!</div>` : ''}
      </div>`).join('') : `<div class="card"><div class="empty"><i class="fa-solid fa-calendar-xmark"></i><p>No bookings yet. Explore places and book a guide!</p><button class="btn btn-primary btn-sm mt-2" onclick="Tourist.navigate('explore')">Explore Now</button></div></div>`;
  },

  showPayment(bookingId, amount) {
    const m = modal(`<div class="modal">
      <div class="modal-header">
        <span class="modal-title">Complete Payment</span>
        <button class="modal-close" onclick="document.querySelector('.modal-overlay').remove()">✕</button>
      </div>
      <div id="alert-box"></div>
      <div class="alert alert-info">Amount to pay: <strong>${formatMoney(amount)}</strong></div>
      <div class="form-group">
        <label>Payment Method</label>
        <select id="pay-method">
          <option value="UPI">UPI</option>
          <option value="Card">Credit / Debit Card</option>
          <option value="NetBanking">Net Banking</option>
          <option value="Cash">Pay in Cash</option>
        </select>
      </div>
      <button class="btn btn-success w-full" id="pay-btn" onclick="Tourist.doPayment(${bookingId}, ${amount})">
        <i class="fa-solid fa-lock"></i> Pay ${formatMoney(amount)}
      </button>
    </div>`);
  },

  async doPayment(bookingId, amount) {
    const method = document.getElementById('pay-method')?.value;
    const btn = document.getElementById('pay-btn');
    btn.innerHTML = '<span class="spinner"></span> Processing...'; btn.disabled = true;
    try {
      const res = await API.post('/api/payments', { booking_id: bookingId, amount, payment_method: method });
      document.querySelector('.modal-overlay')?.remove();
      showAlert(`Payment successful! Transaction ID: ${res.transaction_id}`, 'success', '#app');
      setTimeout(() => Tourist.renderBookings(), 1500);
    } catch(e) {
      showAlert(e.message);
      btn.innerHTML = `Pay ${formatMoney(amount)}`; btn.disabled = false;
    }
  },

  async renderProfile() {
    this.layout('profile', `<div class="topbar"><div class="page-title">My Profile</div></div><div id="profile-content"></div>`);
    const [me, profile] = await Promise.all([
      API.get('/api/me').catch(() => API.user()),
      API.get('/api/tourist/profile').catch(() => null)
    ]);
    const isNew = !profile || !profile.profile_complete;
    document.getElementById('profile-content').innerHTML = `
      ${isNew ? `<div class="alert alert-warning"><i class="fa-solid fa-triangle-exclamation"></i> Please complete your profile to get the best experience.</div>` : ''}
      <div class="profile-banner">
        <div class="profile-avatar-lg">${me.profile_image ? `<img src="${me.profile_image}">` : initials(me.name)}</div>
        <div class="profile-info"><h2>${me.name}</h2><p>${me.email} · Tourist</p><p>Member since ${formatDate(me.created_at)}</p></div>
      </div>
      <div class="card">
        <div class="section-header"><span class="section-title">Edit Profile</span></div>
        <div id="alert-box"></div>
        <form id="profile-form" enctype="multipart/form-data">
          <div class="form-row">
            <div class="form-group"><label>Full Name</label><input name="name" value="${me.name || ''}"></div>
            <div class="form-group"><label>Phone</label><input name="phone" value="${me.phone || ''}"></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Date of Birth</label><input type="date" name="dob" value="${profile?.dob || ''}"></div>
            <div class="form-group"><label>Nationality</label><input name="nationality" value="${profile?.nationality || ''}" placeholder="e.g. Indian"></div>
          </div>
          <div class="form-group"><label>Address</label><input name="address" value="${me.address || ''}"></div>
          <div class="form-group"><label>Emergency Contact</label><input name="emergency_contact" value="${profile?.emergency_contact || ''}" placeholder="Name - Phone"></div>
          <div class="form-group"><label>Interests</label><input name="interests" value="${profile?.interests || ''}" placeholder="e.g. Trekking, History, Food"></div>
          <div class="form-group"><label>Bio</label><textarea name="bio">${me.bio || ''}</textarea></div>
          <div class="form-group"><label>Profile Photo</label><input type="file" name="profile_image" accept="image/*"></div>
          <button type="button" class="btn btn-primary" id="save-profile-btn" onclick="Tourist.saveProfile()">Save Profile</button>
        </form>
      </div>`;
  },

  async saveProfile() {
    const form = document.getElementById('profile-form');
    const fd = new FormData(form);
    const btn = document.getElementById('save-profile-btn');
    btn.innerHTML = '<span class="spinner"></span>'; btn.disabled = true;
    try {
      await API.putForm('/api/tourist/profile', fd);
      const me = await API.get('/api/me');
      API.setAuth(API.token(), { ...API.user(), name: me.name, profile_image: me.profile_image });
      showAlert('Profile updated successfully!', 'success');
    } catch(e) {
      showAlert(e.message);
    }
    btn.textContent = 'Save Profile'; btn.disabled = false;
  },

  async renderEnrollStatus() {
    this.layout('enroll-status', `<div class="topbar"><div class="page-title">Guide Enrolment <small>Apply to become a local guide</small></div></div><div id="enroll-content"></div>`);
    const app = await API.get('/api/guide-application/status').catch(() => null);
    if (app) {
      const statusColors = { pending: 'orange', approved: 'green', rejected: 'red' };
      document.getElementById('enroll-content').innerHTML = `
        <div class="card">
          <div class="section-header">
            <span class="section-title">Application Status</span>
            <span class="tag tag-${statusColors[app.status] || 'gray'}" style="font-size:0.9rem;padding:6px 16px">${app.status.toUpperCase()}</span>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;font-size:0.88rem;color:#6b7280">
            <div><strong style="color:#374151;display:block">Name</strong>${app.full_name}</div>
            <div><strong style="color:#374151;display:block">District</strong>${app.district}</div>
            <div><strong style="color:#374151;display:block">Languages</strong>${app.languages}</div>
            <div><strong style="color:#374151;display:block">Experience</strong>${app.experience}</div>
            <div><strong style="color:#374151;display:block">Applied</strong>${formatDate(app.applied_at)}</div>
            ${app.reviewed_at ? `<div><strong style="color:#374151;display:block">Reviewed</strong>${formatDate(app.reviewed_at)}</div>` : ''}
          </div>
          ${app.guide_email ? `<div class="alert alert-info mt-2"><i class="fa-solid fa-user-lock"></i> Guide login email: <strong>${app.guide_email}</strong></div>` : ''}
          ${app.status === 'pending' ? `<div class="alert alert-warning mt-2"><i class="fa-solid fa-clock"></i> Your application is under review by admin. Your guide login will become active after approval.</div>` : ''}
          ${app.status === 'approved' ? `<div class="alert alert-success mt-2"><i class="fa-solid fa-circle-check"></i> Congratulations! Your guide account is approved. Sign in with your guide login email and the guide password you submitted in this application.</div>` : ''}
          ${app.status === 'rejected' ? `<div class="alert alert-error mt-2"><i class="fa-solid fa-xmark-circle"></i> Your application was not approved this time.</div>` : ''}
        </div>`;
    } else {
      this.renderEnrollForm();
    }
  },

  renderEnrollForm() {
    const user = API.user();
    if (document.querySelector('.modal-overlay')) document.querySelector('.modal-overlay').remove();
    Tourist.layout('enroll-status', `
      <div class="topbar"><div class="page-title">Apply as Guide</div></div>
      <div class="card" style="max-width:600px">
        <div id="alert-box"></div>
        <p class="text-muted mb-2">Fill this application to join as a local guide. Your tourist account stays the same. After admin approval, your guide login becomes active.</p>
        <div class="form-row">
          <div class="form-group"><label>Full Name</label><input id="ga-name" value="${user.name || ''}"></div>
          <div class="form-group"><label>Email</label><input id="ga-email" value="${user.email || ''}"></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Phone</label><input id="ga-phone" placeholder="+91 9999999999"></div>
          <div class="form-group"><label>Your District</label>
            <select id="ga-district">
              ${['Thiruvananthapuram','Kollam','Pathanamthitta','Alappuzha','Kottayam','Idukki','Ernakulam','Thrissur','Palakkad','Malappuram','Kozhikode','Wayanad','Kannur','Kasaragod'].map(d => `<option>${d}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Years of Experience</label><input id="ga-exp" placeholder="e.g. 3 years"></div>
          <div class="form-group"><label>Languages Known</label><input id="ga-lang" placeholder="Malayalam, English, Hindi"></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Guide Login Email</label><input id="ga-guide-email" type="email" placeholder="guide@example.com"></div>
          <div class="form-group"><label>Guide Login Password</label><input id="ga-guide-password" type="password" placeholder="Min 6 characters"></div>
        </div>
        <div class="form-group"><label>About Yourself</label><textarea id="ga-about" placeholder="Tell us about your knowledge of the area, what makes you a great guide..."></textarea></div>
        <button class="btn btn-primary" id="enroll-btn" onclick="Tourist.submitEnroll()">Submit Application</button>
      </div>`);
  },

  async submitEnroll() {
    const data = {
      full_name: document.getElementById('ga-name')?.value,
      email: document.getElementById('ga-email')?.value,
      phone: document.getElementById('ga-phone')?.value,
      district: document.getElementById('ga-district')?.value,
      experience: document.getElementById('ga-exp')?.value,
      languages: document.getElementById('ga-lang')?.value,
      about: document.getElementById('ga-about')?.value,
      guide_email: document.getElementById('ga-guide-email')?.value,
      guide_password: document.getElementById('ga-guide-password')?.value
    };
    if (!data.full_name || !data.phone || !data.district || !data.guide_email || !data.guide_password) return showAlert('Please fill all required fields');
    if (data.guide_password.length < 6) return showAlert('Guide password must be at least 6 characters');
    const btn = document.getElementById('enroll-btn');
    btn.innerHTML = '<span class="spinner"></span>'; btn.disabled = true;
    try {
      await API.post('/api/guide-application', data);
      showAlert('Application submitted! After approval, use the guide login email and password from this form to sign in as a guide.', 'success');
      setTimeout(() => Tourist.renderEnrollStatus(), 1500);
    } catch(e) {
      showAlert(e.message);
      btn.textContent = 'Submit Application'; btn.disabled = false;
    }
  }
};
