
/* ============================================================
   THEME TOGGLE
============================================================ */
const themeToggle = document.getElementById('theme-toggle');
const htmlEl = document.documentElement;

function applyTheme(theme) {
  htmlEl.setAttribute('data-bs-theme', theme);
  const icon = themeToggle.querySelector('i');
  if (icon) icon.className = theme === 'dark' ? 'bi bi-moon-stars-fill' : 'bi bi-sun-fill';
  localStorage.setItem('qrcraft-theme', theme);
}
themeToggle.addEventListener('click', () => {
  const cur = htmlEl.getAttribute('data-bs-theme');
  applyTheme(cur === 'dark' ? 'light' : 'dark');
});
applyTheme(localStorage.getItem('qrcraft-theme') || 'dark');

/* ============================================================
   SCROLL EFFECTS
============================================================ */
const btt = document.getElementById('back-to-top');
window.addEventListener('scroll', () => {
  btt.classList.toggle('visible', window.scrollY > 300);
  const nav = document.getElementById('main-navbar');
  if (nav) nav.style.padding = window.scrollY > 50 ? '.35rem 0' : '.5rem 0';
}, { passive: true });
btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* ============================================================
   FADE-UP ON SCROLL
============================================================ */
const fadeEls = document.querySelectorAll('.fade-up');
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
  });
}, { threshold: 0.12 });
fadeEls.forEach(el => io.observe(el));

/* ============================================================
   HERO QR GENERATOR
============================================================ */
const heroInput    = document.getElementById('hero-qr-input');
const heroFgColor  = document.getElementById('hero-fg-color');
const heroBgColor  = document.getElementById('hero-bg-color');
const heroCanvas   = document.getElementById('hero-qr-canvas');
const heroDownload = document.getElementById('hero-download-btn');
const heroTabs     = document.querySelectorAll('#hero-type-tabs .qr-tab-btn');

function generateHeroQR() {
  if (typeof QRCode === 'undefined' || !heroCanvas) return;
  const text = (heroInput && heroInput.value.trim()) || 'https://qrcraft.app';
  QRCode.toCanvas(heroCanvas, text, {
    width: 180,
    margin: 2,
    color: { dark: heroFgColor.value, light: heroBgColor.value },
    errorCorrectionLevel: 'M',
  }, () => {});
}

if (heroInput) heroInput.addEventListener('input', generateHeroQR);
if (heroFgColor) heroFgColor.addEventListener('input', generateHeroQR);
if (heroBgColor) heroBgColor.addEventListener('input', generateHeroQR);

heroTabs.forEach(btn => {
  btn.addEventListener('click', () => {
    heroTabs.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const placeholders = {
      url: 'https://example.com',
      text: 'Enter your text here...',
      email: 'user@example.com',
      phone: '+1234567890',
      wifi: 'WIFI:T:WPA;S:MyNetwork;P:password;;',
    };
    if (heroInput) {
      heroInput.placeholder = placeholders[btn.dataset.type] || 'Enter content...';
      heroInput.value = '';
    }
    generateHeroQR();
  });
});

if (heroDownload) {
  heroDownload.addEventListener('click', () => {
    if (!heroCanvas) return;
    const a = document.createElement('a');
    a.download = 'qrcraft-code.png';
    a.href = heroCanvas.toDataURL();
    a.click();
  });
}

/* ============================================================
   LIVE GENERATOR
============================================================ */
const liveInput   = document.getElementById('live-content-input');
const liveFg      = document.getElementById('live-fg');
const liveBg      = document.getElementById('live-bg');
const liveSize    = document.getElementById('live-size');
const liveEcl     = document.getElementById('live-ecl');
const liveCanvas  = document.getElementById('live-qr-canvas');
const liveGenBtns = document.querySelectorAll('.gen-type-btn');
const clearBtn    = document.getElementById('clear-live-input');

function generateLiveQR() {
  if (typeof QRCode === 'undefined' || !liveCanvas) return;
  const text = (liveInput && liveInput.value.trim()) || 'https://qrcraft.app';
  const sz   = Math.min(parseInt(liveSize && liveSize.value) || 300, 280);
  const ecl  = (liveEcl && liveEcl.value) || 'M';
  liveCanvas.width  = sz;
  liveCanvas.height = sz;
  QRCode.toCanvas(liveCanvas, text, {
    width: sz,
    margin: 2,
    color: { dark: liveFg.value, light: liveBg.value },
    errorCorrectionLevel: ecl,
  }, () => {});
}

if (liveInput) liveInput.addEventListener('input', generateLiveQR);
if (liveFg)    liveFg.addEventListener('input', generateLiveQR);
if (liveBg)    liveBg.addEventListener('input', generateLiveQR);
if (liveSize)  liveSize.addEventListener('change', generateLiveQR);
if (liveEcl)   liveEcl.addEventListener('change', generateLiveQR);
if (clearBtn)  clearBtn.addEventListener('click', () => { if (liveInput) liveInput.value = ''; generateLiveQR(); });

// Gradient presets
[
  ['grad-1', '#7c3aed', '#0b0d17'],
  ['grad-2', '#ec4899', '#1a0538'],
  ['grad-3', '#06b6d4', '#0b0d17'],
].forEach(([id, fg, bg]) => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('click', () => {
    if (liveFg) liveFg.value = fg;
    if (liveBg) liveBg.value = bg;
    generateLiveQR();
  });
});

// Sidebar type switcher
const placeholderMap = {
  qr:     'https://www.yourwebsite.com',
  barcode:'1234567890128',
  wifi:   'WIFI:T:WPA;S:MyNetwork;P:password;;',
  url:    'https://www.yourwebsite.com',
  text:   'Enter your text message here',
  vcard:  'BEGIN:VCARD\nVERSION:3.0\nFN:John Doe\nEND:VCARD',
  email:  'mailto:user@example.com',
  phone:  'tel:+1234567890',
};
liveGenBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    liveGenBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    if (liveInput) {
      liveInput.placeholder = placeholderMap[btn.dataset.genType] || 'Enter content...';
      liveInput.value = '';
    }
    generateLiveQR();
  });
});

// Download PNG
const dlPng = document.getElementById('live-download-png');
if (dlPng) dlPng.addEventListener('click', () => {
  if (!liveCanvas) return;
  const a = document.createElement('a');
  a.download = 'qrcraft-code.png';
  a.href = liveCanvas.toDataURL();
  a.click();
});

// Download SVG
const dlSvg = document.getElementById('live-download-svg');
if (dlSvg) dlSvg.addEventListener('click', () => {
  if (typeof QRCode === 'undefined') return;
  const text = (liveInput && liveInput.value.trim()) || 'https://qrcraft.app';
  QRCode.toString(text, {
    type: 'svg',
    color: { dark: liveFg ? liveFg.value : '#000', light: liveBg ? liveBg.value : '#fff' },
    errorCorrectionLevel: liveEcl ? liveEcl.value : 'M',
  }, (err, svg) => {
    if (!err) {
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.download = 'qrcraft-code.svg';
      a.href = url;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  });
});

// Reset
const resetBtn = document.getElementById('live-reset');
if (resetBtn) resetBtn.addEventListener('click', () => {
  if (liveInput) liveInput.value = 'https://www.yourwebsite.com';
  if (liveFg)    liveFg.value    = '#7c3aed';
  if (liveBg)    liveBg.value    = '#0b0d17';
  if (liveSize)  liveSize.value  = '300';
  if (liveEcl)   liveEcl.value   = 'M';
  const optLogo  = document.getElementById('opt-logo');
  const optFrame = document.getElementById('opt-frame');
  if (optLogo)  optLogo.checked  = false;
  if (optFrame) optFrame.checked = false;
  liveGenBtns.forEach(b => b.classList.remove('active'));
  const qrBtn = document.getElementById('gen-btn-qr');
  if (qrBtn) qrBtn.classList.add('active');
  generateLiveQR();
});

/* ============================================================
   INIT - wait for QRCode library
============================================================ */
window.addEventListener('load', () => {
  generateHeroQR();
  generateLiveQR();
});
