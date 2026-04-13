const Auth = {
  renderLanding() {
    document.getElementById('app').innerHTML = `
      <div class="landing">

        <!-- Fixed Nav -->
        <nav class="landing-nav">
          <div class="landing-logo-text">Local<span>Connect</span></div>
          <div class="landing-nav-actions">
            <button class="btn btn-outline btn-sm" onclick="Auth.renderLogin()">Sign In</button>
            <button class="btn btn-primary btn-sm" onclick="Auth.renderRegister()">Get Started</button>
          </div>
        </nav>

        <!-- Hero -->
        <section class="landing-hero">
          <div class="landing-bg"></div>
          <div class="landing-hero-content">
            <div class="landing-eyebrow">God's Own Country Awaits</div>
            <h1 class="landing-title">Discover <em>Kerala</em><br>with Local Souls</h1>
            <p class="landing-subtitle">Connect with trusted local guides who know every hidden waterfall, spice trail, and secret shore. Real experiences, authentic connections.</p>
            <div class="landing-btns">
              <button class="btn btn-primary" onclick="Auth.renderRegister()">
                <i class="fa-solid fa-compass"></i> Start Exploring
              </button>
              <button class="btn btn-outline" onclick="Auth.renderLogin()">
                <i class="fa-solid fa-arrow-right-to-bracket"></i> Sign In
              </button>
            </div>
          </div>
         
        </section>

        <!-- Features -->
        <section class="landing-features">
          <div style="text-align:center;max-width:560px;margin:0 auto 3.5rem">
            <div class="section-eyebrow" style="color:rgba(201,168,76,0.8);justify-content:center">Why LocalConnect</div>
            <h2 style="font-family:'Cormorant Garamond',serif;font-size:clamp(1.8rem,3.5vw,2.8rem);font-weight:300;color:white;line-height:1.2">
              Travel deeper, <em style="font-style:italic;color:#e8c97a">not wider</em>
            </h2>
          </div>
          <div class="features-grid">
            <div class="feature-item anim-fade-up d1">
              <div class="feature-icon"><i class="fa-solid fa-map-location-dot"></i></div>
              <div class="feature-title">Hidden Gems</div>
              <p class="feature-desc">Our guides take you beyond the tourist trail to Kerala's most extraordinary secret spots — waterfalls, villages, and ancient temples tourists never see.</p>
            </div>
            <div class="feature-item anim-fade-up d2">
              <div class="feature-icon"><i class="fa-solid fa-handshake"></i></div>
              <div class="feature-title">Verified Guides</div>
              <p class="feature-desc">Every guide is personally reviewed and approved by our admin team. Read real reviews, check languages spoken, and book with complete confidence.</p>
            </div>
            <div class="feature-item anim-fade-up d3">
              <div class="feature-icon"><i class="fa-solid fa-shield-halved"></i></div>
              <div class="feature-title">Safe & Secure</div>
              <p class="feature-desc">Transparent pricing, secure payments, and dedicated support. Your safety and satisfaction are our highest priority throughout every journey.</p>
            </div>
            <div class="feature-item anim-fade-up d1">
              <div class="feature-icon"><i class="fa-solid fa-leaf"></i></div>
              <div class="feature-title">Eco-Conscious</div>
              <p class="feature-desc">We partner with guides who practise responsible, low-impact tourism that respects Kerala's breathtaking ecosystems and wildlife.</p>
            </div>
            <div class="feature-item anim-fade-up d2">
              <div class="feature-icon"><i class="fa-solid fa-language"></i></div>
              <div class="feature-title">Local Languages</div>
              <p class="feature-desc">Communicate effortlessly. Find guides who speak your language — English, Hindi, Tamil, French, German and more — across all 14 districts.</p>
            </div>
            <div class="feature-item anim-fade-up d3">
              <div class="feature-icon"><i class="fa-solid fa-star"></i></div>
              <div class="feature-title">Curated Packages</div>
              <p class="feature-desc">From backwater houseboat stays to mountain treks, guides offer tailor-made packages with everything included — so you only focus on wonder.</p>
            </div>
          </div>
        </section>

  

        <!-- Stats Band -->
        <section style="background:linear-gradient(135deg, var(--gold) 0%, var(--coral) 100%);padding:4rem;text-align:center">
          <div style="max-width:900px;margin:0 auto;display:grid;grid-template-columns:repeat(3,1fr);gap:2rem">
            <div class="anim-fade-up d1">
              <div style="font-family:'Cormorant Garamond',serif;font-size:3rem;font-weight:600;color:white">14</div>
              <div style="font-size:0.82rem;color:rgba(255,255,255,0.8);letter-spacing:0.1em;text-transform:uppercase;margin-top:0.25rem">Districts Covered</div>
            </div>
            <div class="anim-fade-up d2">
              <div style="font-family:'Cormorant Garamond',serif;font-size:3rem;font-weight:600;color:white">50+</div>
              <div style="font-size:0.82rem;color:rgba(255,255,255,0.8);letter-spacing:0.1em;text-transform:uppercase;margin-top:0.25rem">Local Guides</div>
            </div>
            <div class="anim-fade-up d3">
              <div style="font-family:'Cormorant Garamond',serif;font-size:3rem;font-weight:600;color:white">1000+</div>
              <div style="font-size:0.82rem;color:rgba(255,255,255,0.8);letter-spacing:0.1em;text-transform:uppercase;margin-top:0.25rem">Happy Travellers</div>
            </div>
          </div>
        </section>

        <!-- How It Works -->
        <section style="background:white;padding:6rem 4rem">
          <div style="text-align:center;max-width:560px;margin:0 auto 4rem">
            <div class="section-eyebrow">Simple Process</div>
            <h2 class="showcase-title">How it <em>works</em></h2>
          </div>
          <div style="max-width:900px;margin:0 auto;display:grid;grid-template-columns:repeat(3,1fr);gap:2.5rem">
            <div class="anim-fade-up d1" style="text-align:center">
              <div style="width:72px;height:72px;border-radius:50%;background:var(--gold-pale);border:2px solid var(--gold);display:flex;align-items:center;justify-content:center;margin:0 auto 1.5rem;font-family:'Cormorant Garamond',serif;font-size:1.8rem;font-weight:600;color:var(--gold)">1</div>
              <h3 style="font-family:'Cormorant Garamond',serif;font-size:1.3rem;font-weight:600;margin-bottom:0.75rem">Create Account</h3>
              <p style="font-size:0.86rem;color:var(--muted);line-height:1.7">Sign up in seconds. No credit card required. Explore all of Kerala's destinations for free.</p>
            </div>
            <div class="anim-fade-up d2" style="text-align:center">
              <div style="width:72px;height:72px;border-radius:50%;background:var(--gold-pale);border:2px solid var(--gold);display:flex;align-items:center;justify-content:center;margin:0 auto 1.5rem;font-family:'Cormorant Garamond',serif;font-size:1.8rem;font-weight:600;color:var(--gold)">2</div>
              <h3 style="font-family:'Cormorant Garamond',serif;font-size:1.3rem;font-weight:600;margin-bottom:0.75rem">Choose a Guide</h3>
              <p style="font-size:0.86rem;color:var(--muted);line-height:1.7">Browse verified local guides by district, language, and specialisation. Read their packages and ratings.</p>
            </div>
            <div class="anim-fade-up d3" style="text-align:center">
              <div style="width:72px;height:72px;border-radius:50%;background:var(--gold-pale);border:2px solid var(--gold);display:flex;align-items:center;justify-content:center;margin:0 auto 1.5rem;font-family:'Cormorant Garamond',serif;font-size:1.8rem;font-weight:600;color:var(--gold)">3</div>
              <h3 style="font-family:'Cormorant Garamond',serif;font-size:1.3rem;font-weight:600;margin-bottom:0.75rem">Explore Kerala</h3>
              <p style="font-size:0.86rem;color:var(--muted);line-height:1.7">Book your tour, pay securely, and immerse yourself in Kerala's legendary beauty with a trusted local.</p>
            </div>
          </div>
        </section>

        <!-- CTA -->
        <section class="landing-cta">
          <div class="cta-content anim-fade-up">
            <div class="section-eyebrow" style="color:rgba(201,168,76,0.8);justify-content:center">Begin Your Journey</div>
            <h2 class="cta-title">Kerala is calling.<br><em>Are you ready?</em></h2>
            <p class="cta-desc">Join thousands of travellers who have discovered the soul of Kerala through our network of passionate local guides.</p>
            <div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap">
              <button class="btn btn-primary" onclick="Auth.renderRegister()" style="padding:0.9rem 2.5rem;font-size:1rem">
                <i class="fa-solid fa-compass"></i> Create Free Account
              </button>
              <button class="btn btn-outline" onclick="Auth.renderLogin()" style="padding:0.9rem 2.5rem;font-size:1rem">
                Sign In
              </button>
            </div>
           
          </div>
        </section>

        <!-- Footer -->
        <footer style="background:var(--ink);border-top:1px solid rgba(255,255,255,0.06);padding:2rem 4rem;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem">
          <div class="landing-logo-text" style="font-size:1rem">Local<span>Connect</span></div>
          <p style="font-size:0.75rem;color:rgba(255,255,255,0.3)">© 2025 LocalConnect. Connecting travellers with Kerala's finest guides.</p>
          <div style="display:flex;gap:1.5rem">
            <a href="#" style="color:rgba(255,255,255,0.3);font-size:0.8rem;text-decoration:none;transition:color 0.2s" onmouseover="this.style.color='var(--gold)'" onmouseout="this.style.color='rgba(255,255,255,0.3)'">Privacy</a>
            <a href="#" style="color:rgba(255,255,255,0.3);font-size:0.8rem;text-decoration:none;transition:color 0.2s" onmouseover="this.style.color='var(--gold)'" onmouseout="this.style.color='rgba(255,255,255,0.3)'">Terms</a>
          </div>
        </footer>

      </div>`;

    // Scroll-triggered animations
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, { threshold: 0.12 });

    document.querySelectorAll('.feature-item, .showcase-card, .anim-fade-up').forEach(el => {
      if (!el.classList.contains('landing-hero-content')) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(28px)';
        el.style.transition = 'opacity 0.7s ease, transform 0.7s cubic-bezier(0.22,1,0.36,1)';
        const delay = el.classList.contains('d1') ? '0.1s' : el.classList.contains('d2') ? '0.2s' : el.classList.contains('d3') ? '0.3s' : '0s';
        el.style.transitionDelay = delay;
        observer.observe(el);
      }
    });
  },

  renderLogin() {
    document.getElementById('app').innerHTML = `
      <div class="auth-page">
        <div class="auth-card">
          <span class="logo-sm">Local<span>Connect</span></span>
          <h2>Welcome back</h2>
          <p>Sign in to continue your Kerala journey</p>
          <div id="alert-box"></div>
          <div class="form-group">
            <label>Email address</label>
            <input type="email" id="email" placeholder="you@example.com">
          </div>
          <div class="form-group">
            <label>Password</label>
            <input type="password" id="password" placeholder="••••••••">
          </div>
          <button class="btn btn-primary w-full" id="login-btn" onclick="Auth.doLogin()" style="margin-top:0.5rem">
            <i class="fa-solid fa-arrow-right-to-bracket"></i> Sign In
          </button>
          <div class="auth-link" style="margin-top:1.5rem">Don't have an account? <a onclick="Auth.renderRegister()">Create one free</a></div>
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
      btn.innerHTML = '<i class="fa-solid fa-arrow-right-to-bracket"></i> Sign In'; btn.disabled = false;
    }
  },

  renderRegister() {
    document.getElementById('app').innerHTML = `
      <div class="auth-page">
        <div class="auth-card">
          <span class="logo-sm">Local<span>Connect</span></span>
          <h2>Create account</h2>
          <p>Join LocalConnect and discover Kerala</p>
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
            <label>Email address</label>
            <input type="email" id="email" placeholder="you@example.com">
          </div>
          <div class="form-group">
            <label>Password</label>
            <input type="password" id="password" placeholder="Min 6 characters">
          </div>
          <button class="btn btn-primary w-full" id="reg-btn" onclick="Auth.doRegister()" style="margin-top:0.5rem">
            <i class="fa-solid fa-user-plus"></i> Create Account
          </button>
          <div class="auth-link" style="margin-top:1.5rem">Already have an account? <a onclick="Auth.renderLogin()">Sign in</a></div>
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
      btn.innerHTML = '<i class="fa-solid fa-user-plus"></i> Create Account'; btn.disabled = false;
    }
  }
};