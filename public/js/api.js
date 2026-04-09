const API = {
  token: () => localStorage.getItem('lc_token'),
  user: () => JSON.parse(localStorage.getItem('lc_user') || 'null'),
  setAuth: (token, user) => { localStorage.setItem('lc_token', token); localStorage.setItem('lc_user', JSON.stringify(user)); },
  clearAuth: () => { localStorage.removeItem('lc_token'); localStorage.removeItem('lc_user'); },

  async req(method, url, body, isForm) {
    const opts = {
      method,
      headers: { 'Authorization': 'Bearer ' + (this.token() || '') }
    };
    if (body && !isForm) { opts.headers['Content-Type'] = 'application/json'; opts.body = JSON.stringify(body); }
    else if (isForm) opts.body = body;
    const res = await fetch(url, opts);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  },

  get: (url) => API.req('GET', url),
  post: (url, body) => API.req('POST', url, body),
  put: (url, body) => API.req('PUT', url, body),
  del: (url) => API.req('DELETE', url),
  postForm: (url, form) => API.req('POST', url, form, true),
  putForm: (url, form) => API.req('PUT', url, form, true),
};

function showAlert(msg, type = 'error', container = '#alert-box') {
  const box = document.querySelector(container);
  if (!box) return;
  const icons = { error: 'fa-circle-exclamation', success: 'fa-circle-check', info: 'fa-circle-info', warning: 'fa-triangle-exclamation' };
  box.innerHTML = `<div class="alert alert-${type}"><i class="fa-solid ${icons[type]}"></i> ${msg}</div>`;
  setTimeout(() => { if (box) box.innerHTML = ''; }, 4000);
}

function modal(html) {
  const el = document.createElement('div');
  el.className = 'modal-overlay';
  el.innerHTML = html;
  el.addEventListener('click', (e) => { if (e.target === el) el.remove(); });
  document.body.appendChild(el);
  return el;
}

function formatDate(d) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatMoney(n) {
  return '₹' + (parseFloat(n) || 0).toLocaleString('en-IN');
}

function initials(name = '') {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function avatarHtml(img, name, size = 38) {
  const s = `width:${size}px;height:${size}px;border-radius:50%;`;
  if (img) return `<img src="${img}" style="${s}object-fit:cover;" onerror="this.outerHTML='<div style=\'${s}background:#e94560;display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:${Math.round(size*0.35)}px\'>${initials(name)}</div>'">`;
  return `<div style="${s}background:#e94560;display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:${Math.round(size*0.35)}px">${initials(name)}</div>`;
}