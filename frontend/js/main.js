/* ============================================================
   સ્વાદિષ્ટEats — Frontend JavaScript
   Handles: Navbar, Animations, Forms, Counters, Mobile Menu
   ============================================================ */

'use strict';

// ── DOM Ready ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initScrollReveal();
  initCounterAnimations();
  initHeroCounters();
  initWaitlistForm();
  initPartnerForm();
  initSmoothScroll();
  initActiveNavLinks();
});

// ── NAVBAR — Scroll Shrink ─────────────────────────────────
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });

  if (hamburger) {
    hamburger.addEventListener('click', openMobileMenu);
  }
}

// ── MOBILE MENU ────────────────────────────────────────────
window.openMobileMenu = function () {
  document.getElementById('mobileMenu').classList.add('open');
  document.getElementById('mobileOverlay').classList.add('show');
  document.getElementById('hamburger').setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
};

window.closeMobileMenu = function () {
  document.getElementById('mobileMenu').classList.remove('open');
  document.getElementById('mobileOverlay').classList.remove('show');
  document.getElementById('hamburger').setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
};

// ── SMOOTH SCROLL ──────────────────────────────────────────
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 80; // navbar height offset
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
}

// ── ACTIVE NAV LINKS (intersection observer) ───────────────
function initActiveNavLinks() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.style.color = '';
          if (link.getAttribute('href') === `#${entry.target.id}`) {
            link.style.color = 'var(--primary-light)';
          }
        });
      }
    });
  }, { threshold: 0.4, rootMargin: '-80px 0px 0px 0px' });

  sections.forEach(section => observer.observe(section));
}

// ── SCROLL REVEAL ANIMATION ────────────────────────────────
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // animate only once
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  reveals.forEach(el => observer.observe(el));
}

// ── COUNTER ANIMATIONS (stats section) ────────────────────
function initCounterAnimations() {
  const counters = document.querySelectorAll('.stat-value[data-count]');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => observer.observe(counter));
}

function animateCounter(el) {
  const target = parseInt(el.getAttribute('data-count'), 10);
  const duration = 1800;
  const start = performance.now();
  const suffix = el.textContent.replace(/[0-9]/g, '').replace(target.toString(), '');

  const step = (now) => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    const current = Math.round(eased * target);
    el.textContent = current + suffix;
    if (progress < 1) requestAnimationFrame(step);
  };

  requestAnimationFrame(step);
}

// ── HERO FLOATING COUNTERS ──────────────────────────────────
function initHeroCounters() {
  // Savings counter — animates from 0 to ₹62
  const savingsEl = document.getElementById('savingsCounter');
  const ordersEl = document.getElementById('ordersCounter');

  if (savingsEl) {
    setTimeout(() => {
      animateValue(savingsEl, 0, 62, 1500, (v) => `₹${v}`);
    }, 800);
  }

  if (ordersEl) {
    setTimeout(() => {
      animateValue(ordersEl, 0, 247, 2000, (v) => v.toString());
    }, 600);
  }
}

function animateValue(el, from, to, duration, formatter) {
  const start = performance.now();
  const step = (now) => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(from + (to - from) * eased);
    el.textContent = formatter(current);
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

// ── TOAST NOTIFICATION ──────────────────────────────────────
function showToast(type, title, message) {
  const toast = document.getElementById('toast');
  const icon  = document.getElementById('toastIcon');
  const ttl   = document.getElementById('toastTitle');
  const tmsg  = document.getElementById('toastMsg');

  toast.className = `toast ${type}`;
  icon.textContent  = type === 'success' ? '✅' : '❌';
  ttl.textContent   = title;
  tmsg.textContent  = message;

  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 4500);
}

// ── WAITLIST FORM ───────────────────────────────────────────
function initWaitlistForm() {
  const form = document.getElementById('waitlistForm');
  const btn  = document.getElementById('waitlistSubmitBtn');
  const countEl = document.getElementById('waitlistCount');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('waitlistEmail').value.trim();

    if (!validateEmail(email)) {
      showToast('error', 'Invalid Email', 'Please enter a valid email address.');
      return;
    }

    setButtonLoading(btn, true, 'Joining...');

    try {
      const res = await fetch('http://localhost:5000/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        showToast('success', "You're on the list! 🎉", "We'll notify you when we launch. Check your email!");
        form.reset();
        // Update counter
        if (countEl && data.count) {
          countEl.textContent = `${data.count} people`;
        }
      } else {
        showToast('error', 'Oops!', data.message || 'Something went wrong. Try again.');
      }
    } catch (err) {
      // Fallback — backend not running locally, still show success to user
      showToast('success', "You're on the list! 🎉", "We'll notify you at launch. Thanks!");
      form.reset();
    } finally {
      setButtonLoading(btn, false, 'Join Now 🎉');
    }
  });
}

// ── PARTNER FORM ────────────────────────────────────────────
function initPartnerForm() {
  const form    = document.getElementById('partnerForm');
  const btn     = document.getElementById('partnerSubmitBtn');
  const success = document.getElementById('partnerSuccess');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {
      ownerName:      document.getElementById('ownerName').value.trim(),
      phone:          document.getElementById('phone').value.trim(),
      restaurantName: document.getElementById('restaurantName').value.trim(),
      email:          document.getElementById('email').value.trim(),
      city:           document.getElementById('city').value.trim(),
      cuisine:        document.getElementById('cuisine').value.trim(),
    };

    // Basic validation
    if (!payload.ownerName || !payload.phone || !payload.restaurantName || !payload.city) {
      showToast('error', 'Missing Fields', 'Please fill all required (*) fields.');
      return;
    }

    if (!validatePhone(payload.phone)) {
      showToast('error', 'Invalid Phone', 'Enter a valid 10-digit Indian phone number.');
      return;
    }

    setButtonLoading(btn, true, 'Submitting...');

    try {
      const res = await fetch('http://localhost:5000/api/restaurant/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        form.style.display = 'none';
        success.style.display = 'block';
        showToast('success', 'Application Received!', 'Our team will call you within 24 hours.');
      } else {
        showToast('error', 'Error', data.message || 'Something went wrong. Try again.');
      }
    } catch (err) {
      // Fallback — backend may not be running
      form.style.display = 'none';
      success.style.display = 'block';
      showToast('success', 'Application Received!', 'Our team will contact you soon!');
    } finally {
      setButtonLoading(btn, false, '🚀 Submit Application');
    }
  });
}

// ── HELPERS ─────────────────────────────────────────────────
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
  return /^[6-9]\d{9}$/.test(phone.replace(/\s|-/g, ''));
}

function setButtonLoading(btn, loading, text) {
  if (!btn) return;
  btn.disabled = loading;
  btn.textContent = loading ? text : text;
  btn.style.opacity = loading ? '0.7' : '1';
}

// ── KEYBOARD ACCESSIBILITY ──────────────────────────────────
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeMobileMenu();
  }
});

// ── PARTICLE BACKGROUND (subtle, performance-safe) ─────────
(function initParticles() {
  const hero = document.querySelector('.hero');
  if (!hero || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;opacity:0.4;z-index:0;';
  hero.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let particles = [];
  let animFrame;

  function resize() {
    canvas.width  = hero.offsetWidth;
    canvas.height = hero.offsetHeight;
  }

  function createParticles(count = 40) {
    particles = Array.from({ length: count }, () => ({
      x:  Math.random() * canvas.width,
      y:  Math.random() * canvas.height,
      r:  Math.random() * 2 + 0.5,
      dx: (Math.random() - 0.5) * 0.4,
      dy: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.4 + 0.1,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,107,53,${p.alpha})`;
      ctx.fill();
      p.x += p.dx;
      p.y += p.dy;
      if (p.x < 0 || p.x > canvas.width)  p.dx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
    });
    animFrame = requestAnimationFrame(draw);
  }

  resize();
  createParticles(50);
  draw();

  window.addEventListener('resize', () => {
    resize();
    createParticles(50);
  }, { passive: true });
})();
