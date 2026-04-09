const Auth = {
  renderLanding() {
    document.getElementById('app').innerHTML = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        .lc-home * { box-sizing: border-box; margin: 0; padding: 0; }
        .lc-home { font-family: 'DM Sans', sans-serif; background: #0a0a0a; color: #fff; min-height: 100vh; overflow-x: hidden; }

        /* ── HERO ── */
        .lc-hero { position: relative; height: 100vh; min-height: 600px; display: flex; align-items: center; justify-content: center; overflow: hidden; }
        .lc-hero-slides { position: absolute; inset: 0; }
        .lc-slide { position: absolute; inset: 0; background-size: cover; background-position: center; opacity: 0; transition: opacity 1.4s ease; }
        .lc-slide.active { opacity: 1; }
        .lc-slide::after { content: ''; position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.85) 100%); }
        .lc-hero-content { position: relative; z-index: 2; text-align: center; padding: 2rem; max-width: 780px; }
        .lc-eyebrow { font-size: 0.78rem; letter-spacing: 0.22em; text-transform: uppercase; color: #f0c040; margin-bottom: 1.2rem; opacity: 0; animation: fadeUp 0.8s 0.3s forwards; }
        .lc-hero h1 { font-family: 'Playfair Display', serif; font-size: clamp(2.8rem, 7vw, 5.2rem); line-height: 1.08; margin-bottom: 1.4rem; opacity: 0; animation: fadeUp 0.8s 0.5s forwards; }
        .lc-hero h1 em { font-style: italic; color: #f0c040; }
        .lc-hero-sub { font-size: 1.1rem; color: rgba(255,255,255,0.78); line-height: 1.7; margin-bottom: 2.4rem; opacity: 0; animation: fadeUp 0.8s 0.7s forwards; }
        .lc-hero-btns { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; opacity: 0; animation: fadeUp 0.8s 0.9s forwards; }
        .lc-btn-gold { background: #f0c040; color: #0a0a0a; border: none; padding: 0.9rem 2.2rem; border-radius: 50px; font-size: 0.97rem; font-weight: 600; cursor: pointer; transition: all 0.2s; letter-spacing: 0.02em; font-family: 'DM Sans', sans-serif; }
        .lc-btn-gold:hover { background: #ffd700; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(240,192,64,0.35); }
        .lc-btn-ghost { background: transparent; color: #fff; border: 1.5px solid rgba(255,255,255,0.55); padding: 0.9rem 2.2rem; border-radius: 50px; font-size: 0.97rem; font-weight: 500; cursor: pointer; transition: all 0.2s; letter-spacing: 0.02em; font-family: 'DM Sans', sans-serif; }
        .lc-btn-ghost:hover { border-color: #fff; background: rgba(255,255,255,0.08); transform: translateY(-2px); }
        .lc-scroll-hint { position: absolute; bottom: 2rem; left: 50%; transform: translateX(-50%); z-index: 2; animation: bounce 2s infinite; opacity: 0.6; font-size: 0.78rem; letter-spacing: 0.12em; text-transform: uppercase; display: flex; flex-direction: column; align-items: center; gap: 0.4rem; }
        .lc-scroll-hint::after { content: ''; width: 1px; height: 40px; background: rgba(255,255,255,0.4); }

        /* ── STATS BAR ── */
        .lc-stats { background: #f0c040; color: #0a0a0a; display: flex; justify-content: center; gap: 0; flex-wrap: wrap; }
        .lc-stat { padding: 1.4rem 3rem; text-align: center; border-right: 1px solid rgba(0,0,0,0.12); }
        .lc-stat:last-child { border-right: none; }
        .lc-stat-num { font-family: 'Playfair Display', serif; font-size: 2rem; font-weight: 700; line-height: 1; }
        .lc-stat-label { font-size: 0.78rem; letter-spacing: 0.1em; text-transform: uppercase; margin-top: 0.2rem; opacity: 0.75; }

        /* ── ABOUT ── */
        .lc-about { max-width: 1100px; margin: 0 auto; padding: 6rem 2rem; display: grid; grid-template-columns: 1fr 1fr; gap: 5rem; align-items: center; }
        @media(max-width:768px){ .lc-about { grid-template-columns: 1fr; gap: 2.5rem; padding: 4rem 1.5rem; } }
        .lc-about-img-wrap { position: relative; }
        .lc-about-img-main { width: 100%; height: 380px; object-fit: cover; border-radius: 4px; }
        .lc-about-img-accent { width: 48%; height: 200px; object-fit: cover; border-radius: 4px; position: absolute; bottom: -2rem; right: -1.5rem; border: 5px solid #0a0a0a; box-shadow: 0 12px 40px rgba(0,0,0,0.5); }
        @media(max-width:768px){ .lc-about-img-accent { display: none; } }
        .lc-section-tag { font-size: 0.75rem; letter-spacing: 0.2em; text-transform: uppercase; color: #f0c040; margin-bottom: 1rem; }
        .lc-about h2 { font-family: 'Playfair Display', serif; font-size: clamp(2rem, 4vw, 2.8rem); line-height: 1.2; margin-bottom: 1.4rem; }
        .lc-about p { color: rgba(255,255,255,0.65); line-height: 1.8; margin-bottom: 1rem; font-size: 0.97rem; }
        .lc-features { display: flex; flex-direction: column; gap: 1rem; margin-top: 1.8rem; }
        .lc-feature { display: flex; align-items: flex-start; gap: 1rem; }
        .lc-feature-icon { width: 38px; height: 38px; border-radius: 50%; background: rgba(240,192,64,0.12); border: 1px solid rgba(240,192,64,0.3); display: flex; align-items: center; justify-content: center; color: #f0c040; font-size: 0.9rem; flex-shrink: 0; margin-top: 2px; }
        .lc-feature-text strong { display: block; font-size: 0.95rem; margin-bottom: 0.2rem; }
        .lc-feature-text span { font-size: 0.85rem; color: rgba(255,255,255,0.5); }

        /* ── PLACES STRIP ── */
        .lc-places-section { background: #111; padding: 5rem 2rem; }
        .lc-section-head { text-align: center; margin-bottom: 3rem; }
        .lc-section-head h2 { font-family: 'Playfair Display', serif; font-size: clamp(1.8rem, 4vw, 2.6rem); margin-bottom: 0.6rem; }
        .lc-section-head p { color: rgba(255,255,255,0.5); font-size: 0.97rem; }
        .lc-places-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1.2rem; max-width: 1200px; margin: 0 auto; }
        .lc-place-card { position: relative; height: 300px; border-radius: 8px; overflow: hidden; cursor: pointer; }
        .lc-place-card img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; }
        .lc-place-card:hover img { transform: scale(1.06); }
        .lc-place-card-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 55%); display: flex; flex-direction: column; justify-content: flex-end; padding: 1.4rem; }
        .lc-place-card-cat { font-size: 0.7rem; letter-spacing: 0.14em; text-transform: uppercase; color: #f0c040; margin-bottom: 0.3rem; }
        .lc-place-card-name { font-family: 'Playfair Display', serif; font-size: 1.3rem; }
        .lc-place-card-dist { font-size: 0.8rem; color: rgba(255,255,255,0.6); margin-top: 0.2rem; }

        /* ── HOW IT WORKS ── */
        .lc-how { max-width: 1000px; margin: 0 auto; padding: 6rem 2rem; }
        .lc-steps { display: grid; grid-template-columns: repeat(3,1fr); gap: 2rem; margin-top: 3rem; }
        @media(max-width:640px){ .lc-steps { grid-template-columns: 1fr; } }
        .lc-step { text-align: center; padding: 2.5rem 1.5rem; border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; transition: border-color 0.2s, background 0.2s; }
        .lc-step:hover { border-color: rgba(240,192,64,0.3); background: rgba(240,192,64,0.04); }
        .lc-step-num { font-family: 'Playfair Display', serif; font-size: 3.5rem; color: rgba(240,192,64,0.2); line-height: 1; margin-bottom: 1rem; }
        .lc-step h3 { font-size: 1.05rem; margin-bottom: 0.6rem; }
        .lc-step p { font-size: 0.87rem; color: rgba(255,255,255,0.5); line-height: 1.7; }

        /* ── CTA ── */
        .lc-cta { text-align: center; padding: 6rem 2rem; background: linear-gradient(135deg, #1a1206 0%, #0a0a0a 100%); border-top: 1px solid rgba(240,192,64,0.12); }
        .lc-cta h2 { font-family: 'Playfair Display', serif; font-size: clamp(2rem, 5vw, 3.2rem); margin-bottom: 1rem; }
        .lc-cta p { color: rgba(255,255,255,0.55); margin-bottom: 2.4rem; font-size: 1rem; }

        /* ── FOOTER ── */
        .lc-footer { background: #050505; border-top: 1px solid rgba(255,255,255,0.06); padding: 1.8rem 2rem; text-align: center; color: rgba(255,255,255,0.3); font-size: 0.82rem; }
        .lc-footer span { color: #f0c040; }

        /* ── NAVBAR ── */
        .lc-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; padding: 1.4rem 2.5rem; display: flex; justify-content: space-between; align-items: center; transition: background 0.3s, padding 0.3s; }
        .lc-nav.scrolled { background: rgba(10,10,10,0.96); backdrop-filter: blur(12px); padding: 1rem 2.5rem; box-shadow: 0 2px 20px rgba(0,0,0,0.4); }
        .lc-nav-logo { font-family: 'Playfair Display', serif; font-size: 1.5rem; font-weight: 700; color: #fff; }
        .lc-nav-logo span { color: #f0c040; }
        .lc-nav-btns { display: flex; gap: 0.8rem; }

        @keyframes fadeUp { from { opacity:0; transform: translateY(22px); } to { opacity:1; transform: translateY(0); } }
        @keyframes bounce { 0%,100% { transform: translateX(-50%) translateY(0); } 50% { transform: translateX(-50%) translateY(-8px); } }
      </style>

      <div class="lc-home">
        <!-- NAV -->
        <nav class="lc-nav" id="lc-nav">
          <div class="lc-nav-logo">Local<span>Connect</span></div>
          <div class="lc-nav-btns">
            <button class="lc-btn-ghost" style="padding:0.6rem 1.4rem;font-size:0.88rem" onclick="Auth.renderLogin()">Sign In</button>
            <button class="lc-btn-gold" style="padding:0.6rem 1.4rem;font-size:0.88rem" onclick="Auth.renderRegister()">Register</button>
          </div>
        </nav>

        <!-- HERO -->
        <section class="lc-hero">
          <div class="lc-hero-slides" id="lc-slides">
            <div class="lc-slide active" style="background-image:url('https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1800&q=80')"></div>
            <div class="lc-slide" style="background-image:url('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1800&q=80')"></div>
            <div class="lc-slide" style="background-image:url('https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=1800&q=80')"></div>
            <div class="lc-slide" style="background-image:url('https://images.unsplash.com/photo-1568454537842-d933259bb258?w=1800&q=80')"></div>
          </div>
          <div class="lc-hero-content">
            <div class="lc-eyebrow">God's Own Country · Kerala, India</div>
            <h1>Experience Kerala<br>with <em>Local Souls</em></h1>
            <p class="lc-hero-sub">Connect with trusted local guides who know every backwater, spice trail, and hidden temple. Authentic travel, real stories.</p>
            <div class="lc-hero-btns">
              <button class="lc-btn-gold" onclick="Auth.renderRegister()">Start Your Journey</button>
              <button class="lc-btn-ghost" onclick="Auth.renderLogin()">I Have an Account</button>
            </div>
          </div>
          <div class="lc-scroll-hint">Scroll</div>
        </section>

        <!-- STATS -->
        <div class="lc-stats">
          <div class="lc-stat"><div class="lc-stat-num">14</div><div class="lc-stat-label">Districts</div></div>
          <div class="lc-stat"><div class="lc-stat-num">50+</div><div class="lc-stat-label">Local Guides</div></div>
          <div class="lc-stat"><div class="lc-stat-num">100+</div><div class="lc-stat-label">Experiences</div></div>
          <div class="lc-stat"><div class="lc-stat-num">4.9★</div><div class="lc-stat-label">Avg Rating</div></div>
        </div>

        <!-- ABOUT -->
        <section class="lc-about">
          <div class="lc-about-img-wrap">
            <img class="lc-about-img-main" src="https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&q=80" alt="Kerala backwaters" loading="lazy">
            <img class="lc-about-img-accent" src="https://images.unsplash.com/photo-1568454537842-d933259bb258?w=600&q=80" alt="Kerala spices" loading="lazy">
          </div>
          <div>
            <div class="lc-section-tag">About LocalConnect</div>
            <h2>More than a trip — a genuine local experience</h2>
            <p>LocalConnect bridges the gap between travellers and the heart of Kerala. We handpick passionate local guides who share not just places, but stories, culture, and warmth that no travel agency can offer.</p>
            <p>Whether you dream of drifting through Alleppey's backwaters at dawn, trekking silent Munnar tea hills, or tasting authentic sadya in a village home — your guide is waiting.</p>
            <div class="lc-features">
              <div class="lc-feature">
                <div class="lc-feature-icon"><i class="fa-solid fa-shield-halved"></i></div>
                <div class="lc-feature-text"><strong>Verified Local Guides</strong><span>Every guide is reviewed and approved by our admin team</span></div>
              </div>
              <div class="lc-feature">
                <div class="lc-feature-icon"><i class="fa-solid fa-route"></i></div>
                <div class="lc-feature-text"><strong>Custom Packages</strong><span>Guides craft personalised tour packages for your dates and interests</span></div>
              </div>
              <div class="lc-feature">
                <div class="lc-feature-icon"><i class="fa-solid fa-lock"></i></div>
                <div class="lc-feature-text"><strong>Secure Payments</strong><span>Pay only after your booking is accepted. Always transparent pricing</span></div>
              </div>
            </div>
          </div>
        </section>

        <!-- PLACES STRIP -->
        <section class="lc-places-section">
          <div class="lc-section-head">
            <div class="lc-section-tag">Destinations</div>
            <h2>Kerala's Most Breathtaking Places</h2>
            <p>From misty hill stations to golden beaches — every district holds a wonder</p>
          </div>
          <div class="lc-places-grid">
            <div class="lc-place-card"><img src="https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=700&q=75" alt="Munnar" loading="lazy"><div class="lc-place-card-overlay"><div class="lc-place-card-cat">Nature</div><div class="lc-place-card-name">Munnar</div><div class="lc-place-card-dist">Idukki District</div></div></div>
            <div class="lc-place-card"><img src="https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=700&q=75" alt="Alleppey" loading="lazy"><div class="lc-place-card-overlay"><div class="lc-place-card-cat">Backwater</div><div class="lc-place-card-name">Alleppey</div><div class="lc-place-card-dist">Alappuzha District</div></div></div>
            <div class="lc-place-card"><img src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&q=75" alt="Wayanad" loading="lazy"><div class="lc-place-card-overlay"><div class="lc-place-card-cat">Wildlife</div><div class="lc-place-card-name">Wayanad</div><div class="lc-place-card-dist">Wayanad District</div></div></div>
            <div class="lc-place-card"><img src="https://images.unsplash.com/photo-1568454537842-d933259bb258?w=700&q=75" alt="Fort Kochi" loading="lazy"><div class="lc-place-card-overlay"><div class="lc-place-card-cat">Heritage</div><div class="lc-place-card-name">Fort Kochi</div><div class="lc-place-card-dist">Ernakulam District</div></div></div>
            <div class="lc-place-card"><img src="https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=700&q=75" alt="Kovalam" loading="lazy"><div class="lc-place-card-overlay"><div class="lc-place-card-cat">Beach</div><div class="lc-place-card-name">Kovalam Beach</div><div class="lc-place-card-dist">Thiruvananthapuram</div></div></div>
            <div class="lc-place-card"><img src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=700&q=75" alt="Thekkady" loading="lazy"><div class="lc-place-card-overlay"><div class="lc-place-card-cat">Wildlife</div><div class="lc-place-card-name">Thekkady</div><div class="lc-place-card-dist">Idukki District</div></div></div>
          </div>
        </section>

        <!-- HOW IT WORKS -->
        <section class="lc-how">
          <div class="lc-section-head">
            <div class="lc-section-tag">How It Works</div>
            <h2>Your Journey in 3 Simple Steps</h2>
          </div>
          <div class="lc-steps">
            <div class="lc-step"><div class="lc-step-num">01</div><h3>Create Account</h3><p>Sign up as a tourist in seconds. No fees, no commitments — just your next adventure.</p></div>
            <div class="lc-step"><div class="lc-step-num">02</div><h3>Explore & Book</h3><p>Browse places across all 14 Kerala districts. Find a guide and choose a package that fits you.</p></div>
            <div class="lc-step"><div class="lc-step-num">03</div><h3>Experience Kerala</h3><p>Your guide accepts, you pay securely, and you arrive ready to discover the real Kerala.</p></div>
          </div>
        </section>

        <!-- CTA -->
        <section class="lc-cta">
          <div class="lc-section-tag">Ready?</div>
          <h2>Your Kerala story<br>starts today</h2>
          <p>Join thousands of travellers who discovered Kerala the right way</p>
          <div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;">
            <button class="lc-btn-gold" onclick="Auth.renderRegister()">Create Free Account</button>
            <button class="lc-btn-ghost" onclick="Auth.renderLogin()">Sign In</button>
          </div>
          <div style="margin-top:2rem;opacity:0.35;font-size:0.78rem;">Admin: admin@localconnect.com / admin123</div>
        </section>

        <!-- FOOTER -->
        <footer class="lc-footer">
          © 2024 <span>LocalConnect</span> · Kerala Tourism Platform · Built with ❤️ for God's Own Country
        </footer>
      </div>

      <script>
        // Slideshow
        let slide = 0;
        const slides = document.querySelectorAll('.lc-slide');
        setInterval(() => {
          slides[slide].classList.remove('active');
          slide = (slide + 1) % slides.length;
          slides[slide].classList.add('active');
        }, 5000);
        // Sticky nav
        window.addEventListener('scroll', () => {
          document.getElementById('lc-nav').classList.toggle('scrolled', window.scrollY > 60);
        });
      </script>`;
  },

  renderLogin() {
    document.getElementById('app').innerHTML = `
      <div class="auth-page">
        <div class="auth-card">
          <div class="logo-sm">Local<span>Connect</span></div>
          <h2>Welcome back</h2>
          <p>Sign in to your account</p>
          <div id="alert-box"></div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" id="email" placeholder="you@example.com">
          </div>
          <div class="form-group">
            <label>Password</label>
            <input type="password" id="password" placeholder="••••••••">
          </div>
          <button class="btn btn-primary w-full" id="login-btn" onclick="Auth.doLogin()">Sign In</button>
          <div class="auth-link">Don't have an account? <a onclick="Auth.renderRegister()">Register here</a></div>
          <div class="auth-link"><a onclick="Auth.renderLanding()">← Back to home</a></div>
        </div>
      </div>`;
    document.getElementById('password').addEventListener('keydown', e => { if (e.key === 'Enter') Auth.doLogin(); });
  },

  async doLogin() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    if (!email || !password) return showAlert('Please fill all fields');
    const btn = document.getElementById('login-btn');
    btn.innerHTML = '<span class="spinner"></span> Signing in...'; btn.disabled = true;
    try {
      const data = await API.post('/api/login', { email, password });
      API.setAuth(data.token, { id: data.id, name: data.name, role: data.role, email });
      App.route();
    } catch (e) {
      showAlert(e.message);
      btn.textContent = 'Sign In'; btn.disabled = false;
    }
  },

  renderRegister() {
    document.getElementById('app').innerHTML = `
      <div class="auth-page">
        <div class="auth-card">
          <div class="logo-sm">Local<span>Connect</span></div>
          <h2>Create account</h2>
          <p>Join LocalConnect as a tourist</p>
          <div id="alert-box"></div>
          <div class="form-row">
            <div class="form-group">
              <label>Full Name</label>
              <input type="text" id="name" placeholder="Your full name">
            </div>
            <div class="form-group">
              <label>Phone</label>
              <input type="tel" id="phone" placeholder="+91 9999999999">
            </div>
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" id="email" placeholder="you@example.com">
          </div>
          <div class="form-group">
            <label>Password</label>
            <input type="password" id="password" placeholder="Min 6 characters">
          </div>
          <button class="btn btn-primary w-full" id="reg-btn" onclick="Auth.doRegister()">Create Account</button>
          <div class="auth-link">Already have an account? <a onclick="Auth.renderLogin()">Sign in</a></div>
          <div class="auth-link"><a onclick="Auth.renderLanding()">← Back to home</a></div>
        </div>
      </div>`;
  },

  async doRegister() {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const phone = document.getElementById('phone').value.trim();
    if (!name || !email || !password) return showAlert('Please fill all required fields');
    if (password.length < 6) return showAlert('Password must be at least 6 characters');
    const btn = document.getElementById('reg-btn');
    btn.innerHTML = '<span class="spinner"></span>'; btn.disabled = true;
    try {
      const data = await API.post('/api/register', { name, email, password, phone });
      API.setAuth(data.token, { id: data.id, name: data.name, role: data.role, email });
      App.route();
    } catch (e) {
      showAlert(e.message);
      btn.textContent = 'Create Account'; btn.disabled = false;
    }
  }
};