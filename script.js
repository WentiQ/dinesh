/* ═══════════════════════════════════════════════════════════════
   PORTFOLIO — SCRIPT.JS
   ═══════════════════════════════════════════════════════════════ */

'use strict';

// ── Utility: debounce ──────────────────────────────────────────
const debounce = (fn, wait) => {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
};

// ── Utility: clamp ────────────────────────────────────────────
const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

/* ════════════════════════════════════════════════════════════════
   1. LOADER
════════════════════════════════════════════════════════════════ */
(function initLoader() {
  const loader = document.getElementById('loader');
  if (!loader) return;

  const done = () => {
    loader.classList.add('hidden');
    document.body.style.overflow = '';
    // Trigger hero reveals
    document.querySelectorAll('#hero .reveal-up, #hero .reveal-right').forEach(el => {
      el.classList.add('revealed');
    });
  };

  document.body.style.overflow = 'hidden';

  // Complete after animation + slight buffer
  window.addEventListener('load', () => {
    setTimeout(done, 1900);
  });

  // Fallback
  setTimeout(done, 3000);
})();

/* ════════════════════════════════════════════════════════════════
   2. CUSTOM CURSOR
════════════════════════════════════════════════════════════════ */
(function initCursor() {
  if (window.matchMedia('(hover: none)').matches) return;

  const cursor = document.getElementById('cursor');
  const follower = document.getElementById('cursor-follower');
  if (!cursor || !follower) return;

  let mx = -100, my = -100;
  let fx = -100, fy = -100;
  let raf;

  const onMove = e => { mx = e.clientX; my = e.clientY; };
  document.addEventListener('mousemove', onMove, { passive: true });

  const loop = () => {
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';

    fx += (mx - fx) * 0.12;
    fy += (my - fy) * 0.12;
    follower.style.left = fx + 'px';
    follower.style.top  = fy + 'px';

    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);
})();

/* ════════════════════════════════════════════════════════════════
   3. NAVBAR SCROLL BEHAVIOUR
════════════════════════════════════════════════════════════════ */
(function initNavbar() {
  const nav = document.getElementById('navbar');
  if (!nav) return;

  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 48);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ════════════════════════════════════════════════════════════════
   4. MOBILE MENU
════════════════════════════════════════════════════════════════ */
(function initMobileMenu() {
  const burger = document.getElementById('navBurger');
  const menu   = document.getElementById('mobileMenu');
  if (!burger || !menu) return;

  let open = false;

  const toggle = () => {
    open = !open;
    burger.classList.toggle('open', open);
    menu.classList.toggle('open', open);
    document.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
  };

  burger.addEventListener('click', toggle);

  // Close on link click
  menu.querySelectorAll('.mob-link').forEach(link => {
    link.addEventListener('click', () => {
      if (open) toggle();
    });
  });

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && open) toggle();
  });
})();

/* ════════════════════════════════════════════════════════════════
   5. HERO CANVAS — PARTICLE GRID
════════════════════════════════════════════════════════════════ */
(function initHeroCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, particles = [], mouse = { x: -9999, y: -9999 };

  const NUM_PARTICLES = 80;

  const resize = () => {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  };

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x  = Math.random() * W;
      this.y  = Math.random() * H;
      this.ox = this.x;
      this.oy = this.y;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = (Math.random() - 0.5) * 0.3;
      this.r  = Math.random() * 1.5 + 0.5;
      this.a  = Math.random() * 0.5 + 0.1;
    }
    update() {
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const repel = 80;
      if (dist < repel) {
        const force = (repel - dist) / repel * 1.5;
        this.vx -= (dx / dist) * force * 0.3;
        this.vy -= (dy / dist) * force * 0.3;
      }
      // Spring back
      this.vx += (this.ox - this.x) * 0.01;
      this.vy += (this.oy - this.y) * 0.01;
      // Dampen
      this.vx *= 0.94;
      this.vy *= 0.94;
      this.x += this.vx;
      this.y += this.vy;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(232,213,176,${this.a})`;
      ctx.fill();
    }
  }

  const init = () => {
    resize();
    particles = Array.from({ length: NUM_PARTICLES }, () => new Particle());
  };

  const drawLines = () => {
    const MAX_DIST = 120;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < MAX_DIST) {
          const alpha = (1 - d / MAX_DIST) * 0.08;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(232,213,176,${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  };

  let raf;
  const loop = () => {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    drawLines();
    raf = requestAnimationFrame(loop);
  };

  window.addEventListener('resize', debounce(() => {
    resize();
    particles.forEach(p => p.reset());
  }, 300));

  document.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  }, { passive: true });

  init();
  loop();
})();

/* ════════════════════════════════════════════════════════════════
   5.5. HERO PARALLAX EFFECT
════════════════════════════════════════════════════════════════ */
(function initHeroEffects() {
  const heroBgImage = document.querySelector('.hero-bg-image');
  const hero = document.getElementById('hero');

  if (!heroBgImage) return;

  const isMobile = window.matchMedia('(max-width: 768px)').matches;

  // ── Parallax on scroll (disabled on mobile for performance)
  const onScroll = () => {
    if (isMobile) return;
    
    const heroRect = hero.getBoundingClientRect();
    const scrollProgress = 1 - (heroRect.bottom / window.innerHeight);
    
    if (heroRect.bottom > 0) {
      const parallaxAmount = Math.min(scrollProgress * 60, 60);
      heroBgImage.style.transform = `translateY(${parallaxAmount}px)`;
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
})();

/* ════════════════════════════════════════════════════════════════
   6. SCROLL REVEAL
════════════════════════════════════════════════════════════════ */
(function initScrollReveal() {
  const selectors = '.reveal-up, .reveal-left, .reveal-right';
  const elements = document.querySelectorAll(selectors);

  // Skip hero — handled by loader
  const targets = [...elements].filter(el => !el.closest('#hero'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  targets.forEach(el => observer.observe(el));
})();

/* ════════════════════════════════════════════════════════════════
   7. ANIMATED COUNTERS
════════════════════════════════════════════════════════════════ */
(function initCounters() {
  const counters = document.querySelectorAll('[data-count]');

  const easeOut = t => 1 - Math.pow(1 - t, 3);

  const animateCounter = (el) => {
    const target = parseInt(el.dataset.count, 10);
    const duration = 1400;
    const start = performance.now();

    const step = (now) => {
      const elapsed = now - start;
      const progress = clamp(elapsed / duration, 0, 1);
      el.textContent = Math.round(easeOut(progress) * target);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    };

    requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
})();

/* ════════════════════════════════════════════════════════════════
   8. SKILL BARS
════════════════════════════════════════════════════════════════ */
(function initSkillBars() {
  const bars = document.querySelectorAll('.skill-fill');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const w = entry.target.dataset.width;
        entry.target.style.width = w + '%';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  bars.forEach(bar => observer.observe(bar));
})();

/* ════════════════════════════════════════════════════════════════
   9. PROJECT FILTER
════════════════════════════════════════════════════════════════ */
(function initProjectFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.project-card');
  const grid  = document.getElementById('projectsGrid');

  if (!filterBtns.length || !cards.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      // Update active state
      filterBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      // Filter cards
      cards.forEach(card => {
        const cat = card.dataset.category;
        const show = filter === 'all' || cat === filter;

        if (show) {
          card.style.display = '';
          card.style.position = '';
          card.classList.remove('hidden');
          requestAnimationFrame(() => card.classList.add('revealed'));
        } else {
          card.classList.add('hidden');
          setTimeout(() => {
            if (card.classList.contains('hidden')) card.style.display = 'none';
          }, 400);
        }
      });
    });
  });
})();

/* ════════════════════════════════════════════════════════════════
   10. PROJECT MODAL
════════════════════════════════════════════════════════════════ */
(function initModal() {
  const overlay = document.getElementById('modalOverlay');
  const closeBtn = document.getElementById('modalClose');
  const content  = document.getElementById('modalContent');

  if (!overlay) return;

  const projectData = {
    guardian: {
      title: 'Guardian',
      tags: ['AI Wearable', 'Hardware', 'Rural Health', 'IoT', 'National Award 🏆'],
      body: `
        <p>Guardian is an AI-powered wearable device designed to bring real-time health monitoring to rural and underserved communities in India. The device monitors key vital signs, runs on-device inference for anomaly detection, and communicates alerts via a low-power wireless network.</p>
        <p>The project won the <strong style="color:var(--accent)">Nation Builder Competition</strong> — a national-level innovation challenge — for its combination of technical depth, accessibility, and direct societal impact.</p>
        <h3>Key Features</h3>
        <ul>
          <li>Real-time vital sign monitoring: heart rate, SpO₂, temperature, motion</li>
          <li>On-device ML for anomaly detection and early warning</li>
          <li>LoRa-based low-power wireless communication for remote areas</li>
          <li>Solar-assisted charging for off-grid deployment</li>
          <li>Companion mobile dashboard for community health workers</li>
        </ul>
        <h3>Tech Stack</h3>
        <ul>
          <li>Microcontroller: ARM Cortex-M4 with FPU for real-time inference</li>
          <li>Sensors: MAX30102 (SpO₂/HR), MLX90614 (IR temp), MPU6050 (IMU)</li>
          <li>Communication: LoRa SX1276, BLE 5.0</li>
          <li>Software: C++, Python (ML pipeline), Firebase (cloud sync)</li>
        </ul>
      `
    },
    lifeline: {
      title: 'LifeLine AI',
      tags: ['Healthcare AI', 'Web App', 'Gemini API', 'Firebase'],
      body: `
        <p>LifeLine AI is an intelligent, conversational healthcare assistant that helps users understand symptoms, get medication guidance, and improve health literacy — particularly for users with limited access to healthcare professionals.</p>
        <p>Built entirely as a web application, it's accessible from any device without installation, making it immediately usable in low-resource settings.</p>
        <h3>Key Features</h3>
        <ul>
          <li>Symptom checker and preliminary health guidance powered by Gemini Pro</li>
          <li>Medication lookup with dosage and interaction information</li>
          <li>Multi-language support for regional accessibility</li>
          <li>Conversation history and health journal via Firebase Firestore</li>
          <li>Emergency triage detection with redirect to nearest services</li>
        </ul>
        <h3>Tech Stack</h3>
        <ul>
          <li>Frontend: Vanilla JavaScript, HTML5, CSS3 (progressive enhancement)</li>
          <li>AI: Google Gemini API (gemini-pro) for conversational intelligence</li>
          <li>Backend: Firebase (Auth, Firestore, Hosting)</li>
          <li>Performance: Service Worker caching, offline mode</li>
        </ul>
      `
    },
    thermal: {
      title: 'Battery Thermal Runaway Simulation',
      tags: ['Heat Transfer', 'MATLAB', 'FDM', 'Research', 'ME212L'],
      body: `
        <p>A 2D transient finite difference method (FDM) solver built in MATLAB for simulating thermal runaway in lithium-ion battery cells. This was a major project for the ME212L Heat Transfer course at IIT Tirupati.</p>
        <p>The simulation models the progression of heat generation during a fault event, identifies the critical safety window, and quantifies deviation between simplified 1D models and full 2D analysis.</p>
        <h3>Simulation Capabilities</h3>
        <ul>
          <li>2D transient heat conduction with non-uniform, time-varying heat generation</li>
          <li>Active heat source modelling during runaway phase</li>
          <li>Safety window identification: time before critical threshold breach</li>
          <li>Quantitative 2D vs. 1D deviation analysis</li>
          <li>Animated temperature field visualisation</li>
        </ul>
        <h3>Validation & Tools</h3>
        <ul>
          <li>Cross-validated against Energy2D thermal simulations</li>
          <li>Grid independence study confirming mesh convergence</li>
          <li>MATLAB: custom FDM solver, ODE integration, heatmap plotting</li>
          <li>Energy2D: independent verification of transient profiles</li>
        </ul>
      `
    },
    motor: {
      title: 'DC Motor PID Control System',
      tags: ['Mechatronics', 'Arduino', 'PID', 'Python', 'ME Lab'],
      body: `
        <p>A complete DC motor speed control system developed as part of the Mechatronic System Design lab at IIT Tirupati. The system implements a full PID controller with encoder feedback, soft-start ramps, IR obstacle detection, and a real-time Python dashboard.</p>
        <h3>System Components</h3>
        <ul>
          <li>Controller: Arduino Mega 2560</li>
          <li>Motor driver: L298P (HW-172 shield), 12V DC motor</li>
          <li>Feedback: Quadrature encoder (200 CPR), interrupt-driven counting</li>
          <li>Sensing: IR obstacle sensor for automated stop events</li>
        </ul>
        <h3>Software Features</h3>
        <ul>
          <li>PID speed controller with tuned Kp, Ki, Kd parameters</li>
          <li>PWM soft-start and soft-stop ramps for motor protection</li>
          <li>Serial telemetry protocol (100Hz update rate)</li>
          <li>Python real-time dashboard: live RPM plot, PID error trace, setpoint overlay</li>
          <li>Step response analysis and Ziegler-Nichols tuning documentation</li>
        </ul>
      `
    },
    flexspline: {
      title: 'Flexspline Machining — Strain Wave Gears',
      tags: ['Manufacturing', 'Metrology', 'Research Paper', 'AMT Course'],
      body: `
        <p>A comprehensive academic literature synthesis on advanced machining processes for flexsplines in strain wave (harmonic drive) gears — the precision components used in robotic joints, satellite actuators, and aerospace mechanisms.</p>
        <p>This term paper for the Advanced Manufacturing Technology course at IIT Tirupati synthesised over 30 research papers into a structured analysis of machining strategies, tolerancing, and quality assurance.</p>
        <h3>Topics Covered</h3>
        <ul>
          <li>Flexspline geometry and functional tolerancing requirements</li>
          <li>Turning and grinding strategies for thin-walled components</li>
          <li>Gear hobbing and shaving for the external spline profile</li>
          <li>Surface finish requirements and texture analysis</li>
          <li>Heat treatment considerations and distortion control</li>
          <li>CMM-based metrology and gear measurement techniques</li>
        </ul>
        <h3>Outcome</h3>
        <ul>
          <li>Structured comparison of manufacturing process chains</li>
          <li>Process selection matrix for different production volumes</li>
          <li>Identified research gaps in electrochemical machining of Inconel flexsplines</li>
        </ul>
      `
    },
    ecopolis: {
      title: 'ECOPOLIS',
      tags: ['Game Dev', 'JavaScript', 'HTML Canvas', 'Browser Game'],
      body: `
        <p>ECOPOLIS is a browser-based ecological city-building board game where players manage resources, construct sustainable infrastructure, and respond to environmental events. Fully playable in-browser with no plugins or downloads required.</p>
        <p>The game was developed across multiple design-code iterations, with particular attention to tile placement geometry, inner path logic, and a rich event card system that creates emergent gameplay.</p>
        <h3>Game Features</h3>
        <ul>
          <li>Hexagonal tile grid with dynamic adjacency-based scoring</li>
          <li>Resource management: energy, water, biomass, population</li>
          <li>30+ unique event cards with branching consequences</li>
          <li>Technology tree unlocking sustainable infrastructure</li>
          <li>Animated tile transitions and particle effects on canvas</li>
        </ul>
        <h3>Technical Details</h3>
        <ul>
          <li>Pure vanilla JavaScript — no frameworks or libraries</li>
          <li>HTML5 Canvas for board rendering and animations</li>
          <li>Custom hex-grid math for tile placement and pathfinding</li>
          <li>CSS animations for UI transitions and card reveals</li>
          <li>localStorage for game state persistence across sessions</li>
        </ul>
      `
    }
  };

  const open = (projectId) => {
    const data = projectData[projectId];
    if (!data) return;

    content.innerHTML = `
      <h2>${data.title}</h2>
      <div class="modal-tags">${data.tags.map(t => `<span class="modal-tag">${t}</span>`).join('')}</div>
      ${data.body}
    `;

    overlay.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    overlay.focus();
  };

  const close = () => {
    overlay.setAttribute('hidden', '');
    document.body.style.overflow = '';
  };

  // Open on detail button click
  document.querySelectorAll('.project-detail-btn').forEach(btn => {
    btn.addEventListener('click', () => open(btn.dataset.project));
  });

  // Open on card keyboard Enter/Space
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const btn = card.querySelector('.project-detail-btn');
        if (btn) open(btn.dataset.project);
      }
    });
  });

  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
})();

/* ════════════════════════════════════════════════════════════════
   11. TESTIMONIAL SLIDER
════════════════════════════════════════════════════════════════ */
(function initTestimonials() {
  const track  = document.getElementById('testimonialTrack');
  const prev   = document.getElementById('testPrev');
  const next   = document.getElementById('testNext');
  const dotsEl = document.getElementById('testDots');

  if (!track) return;

  const cards = track.querySelectorAll('.testimonial-card');
  const total = cards.length;
  let current = 0;
  let auto;

  // Build dots
  cards.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'test-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Testimonial ${i + 1}`);
    dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    dot.addEventListener('click', () => goTo(i));
    dotsEl.appendChild(dot);
  });

  const dots = dotsEl.querySelectorAll('.test-dot');

  const goTo = (idx) => {
    current = (idx + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => {
      d.classList.toggle('active', i === current);
      d.setAttribute('aria-selected', String(i === current));
    });
  };

  prev.addEventListener('click', () => { goTo(current - 1); resetAuto(); });
  next.addEventListener('click', () => { goTo(current + 1); resetAuto(); });

  const startAuto = () => { auto = setInterval(() => goTo(current + 1), 5000); };
  const resetAuto = () => { clearInterval(auto); startAuto(); };

  startAuto();

  // Pause on hover
  track.parentElement.addEventListener('mouseenter', () => clearInterval(auto));
  track.parentElement.addEventListener('mouseleave', startAuto);

  // Touch / swipe
  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) { dx > 0 ? goTo(current - 1) : goTo(current + 1); }
    resetAuto();
  }, { passive: true });
})();

/* ════════════════════════════════════════════════════════════════
   12. CONTACT FORM
════════════════════════════════════════════════════════════════ */
(function initContactForm() {
  const form    = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  if (!form) return;

  const validators = {
    name:    v => v.trim().length >= 2  ? '' : 'Please enter your name.',
    email:   v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Enter a valid email address.',
    subject: v => v.trim().length >= 3  ? '' : 'Please enter a subject.',
    message: v => v.trim().length >= 20 ? '' : 'Message must be at least 20 characters.',
  };

  const showError = (field, msg) => {
    field.classList.toggle('error', !!msg);
    const errEl = field.closest('.form-group').querySelector('.form-error');
    if (errEl) errEl.textContent = msg;
  };

  // Live validation
  Object.keys(validators).forEach(name => {
    const field = form.elements[name];
    if (!field) return;
    field.addEventListener('blur', () => {
      showError(field, validators[name](field.value));
    });
    field.addEventListener('input', () => {
      if (field.classList.contains('error')) {
        showError(field, validators[name](field.value));
      }
    });
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    let valid = true;

    Object.keys(validators).forEach(name => {
      const field = form.elements[name];
      if (!field) return;
      const err = validators[name](field.value);
      showError(field, err);
      if (err) valid = false;
    });

    if (!valid) return;

    // Simulate send
    const btn = form.querySelector('.form-submit');
    btn.disabled = true;
    btn.querySelector('span').textContent = 'Sending…';

    setTimeout(() => {
      form.reset();
      btn.disabled = false;
      btn.querySelector('span').textContent = 'Send message';
      success.classList.add('show');
      success.focus();
      setTimeout(() => success.classList.remove('show'), 6000);
    }, 1200);
  });
})();

/* ════════════════════════════════════════════════════════════════
   13. MAGNETIC BUTTONS
════════════════════════════════════════════════════════════════ */
(function initMagneticButtons() {
  if (window.matchMedia('(hover: none)').matches) return;

  document.querySelectorAll('.magnetic-btn').forEach(btn => {
    let rect;

    const onEnter = () => { rect = btn.getBoundingClientRect(); };
    const onMove  = (e) => {
      if (!rect) return;
      const cx = rect.left + rect.width  / 2;
      const cy = rect.top  + rect.height / 2;
      const dx = (e.clientX - cx) * 0.28;
      const dy = (e.clientY - cy) * 0.28;
      btn.style.transform = `translate(${dx}px, ${dy}px)`;
    };
    const onLeave = () => {
      btn.style.transform = '';
      rect = null;
    };

    btn.addEventListener('mouseenter', onEnter);
    btn.addEventListener('mousemove', onMove);
    btn.addEventListener('mouseleave', onLeave);
  });
})();

/* ════════════════════════════════════════════════════════════════
   14. SMOOTH SCROLL & ACTIVE NAV LINK
════════════════════════════════════════════════════════════════ */
(function initActiveNav() {
  const links    = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  const onScroll = () => {
    let current = '';
    sections.forEach(section => {
      if (window.scrollY >= section.offsetTop - 120) current = section.id;
    });

    links.forEach(link => {
      const href = link.getAttribute('href').replace('#', '');
      link.classList.toggle('active', href === current);
      if (href === current) {
        link.style.color = 'var(--text-1)';
      } else {
        link.style.color = '';
      }
    });
  };

  window.addEventListener('scroll', debounce(onScroll, 60), { passive: true });
})();

/* ════════════════════════════════════════════════════════════════
   15. PARALLAX HERO ORB
════════════════════════════════════════════════════════════════ */
(function initParallax() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const orbs = document.querySelectorAll('.hero-orb');
  if (!orbs.length) return;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    orbs[0] && (orbs[0].style.transform = `translateY(${y * 0.15}px) scale(1)`);
    orbs[1] && (orbs[1].style.transform = `translateY(${y * -0.08}px) scale(1)`);
    orbs[2] && (orbs[2].style.transform = `translateY(${y * 0.22}px) scale(1)`);
  }, { passive: true });
})();

/* ════════════════════════════════════════════════════════════════
   16. FLOATING BADGES MOUSE PARALLAX
════════════════════════════════════════════════════════════════ */
(function initBadgeParallax() {
  if (window.matchMedia('(hover: none)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const b1 = document.querySelector('.photo-badge-1');
  const b2 = document.querySelector('.photo-badge-2');

  document.addEventListener('mousemove', e => {
    const cx = window.innerWidth  / 2;
    const cy = window.innerHeight / 2;
    const dx = (e.clientX - cx) / cx;
    const dy = (e.clientY - cy) / cy;

    if (b1) b1.style.transform = `translate(${dx * -6}px, ${dy * -6}px)`;
    if (b2) b2.style.transform = `translate(${dx *  6}px, ${dy *  6}px)`;
  }, { passive: true });
})();

/* ════════════════════════════════════════════════════════════════
   17. FOOTER BACK-TO-TOP
════════════════════════════════════════════════════════════════ */
(function initFooterLogo() {
  const logo = document.querySelector('.footer-logo');
  if (!logo) return;

  logo.addEventListener('click', e => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

/* ════════════════════════════════════════════════════════════════
   INIT LOG
════════════════════════════════════════════════════════════════ */
console.log('%cDinesh Portfolio · Built with ♥', 'color: #e8d5b0; font-family: serif; font-size: 14px;');
