'use strict';

/* ─── LOADER ─────────────────────────────────────── */
const loader = document.getElementById('loader');
const loaderFill = document.querySelector('.loader-fill');
window.addEventListener('load', () => {
  loaderFill.style.width = '100%';
  setTimeout(() => { loader.classList.add('hidden'); initAll(); }, 2000);
});

/* ─── CURSOR ─────────────────────────────────────── */
const cur = document.getElementById('cursor');
const ring = document.getElementById('cursor-ring');
let cx = 0, cy = 0, rx = 0, ry = 0;
document.addEventListener('mousemove', e => {
  cx = e.clientX; cy = e.clientY;
  cur.style.left = cx + 'px'; cur.style.top = cy + 'px';
});
(function followRing() {
  rx += (cx - rx) * 0.1; ry += (cy - ry) * 0.1;
  ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
  requestAnimationFrame(followRing);
})();
document.querySelectorAll('a,button,.grid-cell,.warmth-photo,.gr-item,.cu-item').forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
});

/* ─── NAV ─────────────────────────────────────────── */
const nav = document.getElementById('nav');
const navName = document.getElementById('navSectionName');
const navDots = document.querySelectorAll('.nav-dot');
const sections = document.querySelectorAll('.section');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
  updateScrollProgress();
  updateNavDots();
}, { passive: true });
navDots.forEach(dot => {
  dot.addEventListener('click', () => {
    document.getElementById(dot.dataset.target)?.scrollIntoView({ behavior: 'smooth' });
  });
});
function updateNavDots() {
  let active = 0;
  sections.forEach((s, i) => {
    const r = s.getBoundingClientRect();
    if (r.top <= window.innerHeight * 0.5) active = i;
  });
  navDots.forEach((d, i) => d.classList.toggle('active', i === active));
  navName.textContent = sections[active]?.dataset.name || '';
}

/* ─── SCROLL PROGRESS ─────────────────────────────── */
const scrollFill = document.getElementById('scroll-fill');
function updateScrollProgress() {
  const total = document.body.scrollHeight - window.innerHeight;
  if (total > 0) scrollFill.style.height = (window.scrollY / total * 100) + '%';
}

/* ─── INIT ─────────────────────────────────────────── */
function initAll() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const delay = parseFloat(e.target.dataset.delay || 0) * 1000;
      setTimeout(() => e.target.classList.add('in'), delay);
      obs.unobserve(e.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
  document.querySelectorAll('.reveal,.reveal-up,.reveal-photo').forEach(el => obs.observe(el));

  const sObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      e.target.classList.toggle('active', e.isIntersecting);
    });
  }, { threshold: 0.3 });
  sections.forEach(s => sObs.observe(s));

  const fbObs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
  }, { threshold: 0.4 });
  const fb = document.querySelector('.freedom-bars');
  if (fb) fbObs.observe(fb);

  initSyntax();
  initChaos();
  initEnding();
  initLightbox();
  initGridCells();
  initParallax();
  initSpotlight();
  initBanquet();
}

/* ─── SYNTAX ─────────────────────────────────────── */
const wordPairs = [
  { from: 'CHAOS',  to: 'ACTION',    taiwan: ['C','A','O'] },
  { from: 'CHAOS',  to: 'NATION',    taiwan: ['A','N'] },
  { from: 'LOST',   to: 'STAND',     taiwan: ['T','A','N'] },
  { from: 'MESS',   to: 'MEANS',     taiwan: ['A','N'] },
  { from: 'NOISE',  to: 'ONSITE',    taiwan: ['I','N'] },
  { from: 'WAIT',   to: 'TAIWAN',    taiwan: ['T','A','I','W','N'] },
  { from: 'WIN',    to: 'TWIN',      taiwan: ['T','W','I','N'] },
  { from: 'RAIN',   to: 'TRAIN',     taiwan: ['T','A','I','N'] },
  { from: 'ANT',    to: 'WANT',      taiwan: ['W','A','N','T'] },
  { from: 'OWN',    to: 'TOWN',      taiwan: ['T','W','N'] },
  { from: 'NOT',    to: 'NOTION',    taiwan: ['N','T','I'] },
  { from: 'WRIT',   to: 'WRITTEN',   taiwan: ['W','I','T','N'] },
  { from: 'MOAN',   to: 'WOMAN',     taiwan: ['W','A','N'] },
  { from: 'SPIN',   to: 'SPAIN',     taiwan: ['A','I','N'] },
  { from: 'WINE',   to: 'TWINE',     taiwan: ['T','W','I','N'] },
  { from: 'WIST',   to: 'TWIST',     taiwan: ['T','W','I'] },
  { from: 'THIN',   to: 'WITHIN',    taiwan: ['W','T','I','N'] },
  { from: 'AND',    to: 'WAND',      taiwan: ['W','A','N'] },
  { from: 'WIT',    to: 'AWAIT',     taiwan: ['W','A','I','T'] },
  { from: 'TWIN',   to: 'TWAIN',     taiwan: ['T','W','A','I','N'] },
  { from: 'TAME',   to: 'ANIMATE',   taiwan: ['A','N','T'] },
  { from: 'WANT',   to: 'WANTON',    taiwan: ['W','A','N','T'] },
  { from: 'TAN',    to: 'TITAN',     taiwan: ['T','I','A','N'] },
  { from: 'NATION', to: 'INNOVATION',taiwan: ['N','A','T','I'] },
  { from: 'PLAIN',  to: 'CAPTAIN',   taiwan: ['T','A','I','N'] },
  { from: 'STING',  to: 'WAITING',   taiwan: ['W','A','T','I','N'] },
];
let pairIdx = 0, isAnimating = false;
const syntaxFrom = document.getElementById('syntaxFrom');
const syntaxTo   = document.getElementById('syntaxTo');
const syntaxBtn  = document.getElementById('syntaxNext');

function renderWord(el, word, tc) {
  el.innerHTML = '';
  word.split('').forEach(ch => {
    const s = document.createElement('span');
    s.className = 's-letter' + (tc.includes(ch) ? ' taiwan' : '');
    s.textContent = ch;
    el.appendChild(s);
  });
}
function animateTransform(fw, tw, tc) {
  if (isAnimating) return;
  isAnimating = true;
  syntaxFrom.querySelectorAll('.s-letter').forEach((l, i) => {
    setTimeout(() => l.classList.add('out'), i * 60);
  });
  const delay = fw.length * 60 + 200;
  syntaxTo.innerHTML = '';
  tw.split('').forEach((ch, i) => {
    const s = document.createElement('span');
    s.className = 's-letter in' + (tc.includes(ch) ? ' taiwan' : '');
    s.textContent = ch;
    syntaxTo.appendChild(s);
    setTimeout(() => s.classList.remove('in'), delay + i * 70);
  });
  setTimeout(() => { renderWord(syntaxFrom, fw, tc); isAnimating = false; },
    delay + tw.length * 70 + 300);
}
function initSyntax() {
  const p = wordPairs[pairIdx];
  renderWord(syntaxFrom, p.from, p.taiwan);
  renderWord(syntaxTo,   p.to,   p.taiwan);
  syntaxBtn.addEventListener('click', () => {
    pairIdx = (pairIdx + 1) % wordPairs.length;
    const n = wordPairs[pairIdx];
    animateTransform(n.from, n.to, n.taiwan);
  });
  const sObs = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) return;
    let auto = setInterval(() => {
      pairIdx = (pairIdx + 1) % wordPairs.length;
      const n = wordPairs[pairIdx];
      animateTransform(n.from, n.to, n.taiwan);
    }, 3500);
    syntaxBtn.addEventListener('click', () => clearInterval(auto), { once: true });
    sObs.unobserve(entries[0].target);
  }, { threshold: 0.5 });
  const ss = document.getElementById('s-syntax');
  if (ss) sObs.observe(ss);
}

/* ─── CHAOS CANVAS ───────────────────────────────── */
function initChaos() {
  const canvas = document.getElementById('chaosCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const colors = ['#B23A3A','#2F5D9F','#3A7D44','#C9A84C','#7B4F9E'];
  let particles = [], settled = false, W, H;

  function resize() { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight; }
  window.addEventListener('resize', resize, { passive: true });
  resize();

  class Particle {
    constructor() { this.reset(true); }
    reset(rand) {
      this.x     = rand ? Math.random() * W : W / 2;
      this.y     = rand ? Math.random() * H : H / 2;
      this.vx    = (Math.random() - .5) * (settled ? 1.5 : 3.5);
      this.vy    = (Math.random() - .5) * (settled ? 1.5 : 3.5);
      this.rad   = Math.random() * 2 + 1;
      this.alpha = Math.random() * .6 + .3;
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.life  = Math.random() * 200 + 100;
      this.age   = 0;
    }
    update() {
      if (settled) {
        this.vx += (Math.sin(this.y * .012 + Date.now() * .0005) - this.vx) * .06;
        this.vy += (Math.cos(this.x * .012 + Date.now() * .0005) - this.vy) * .06;
      } else {
        this.vx += (Math.random() - .5) * .3;
        this.vy += (Math.random() - .5) * .3;
      }
      this.x += this.vx; this.y += this.vy; this.age++;
      if (this.age > this.life || this.x < -10 || this.x > W + 10 || this.y < -10 || this.y > H + 10)
        this.reset(false);
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.rad, 0, Math.PI * 2);
      ctx.fillStyle = this.color + Math.floor(this.alpha * 255).toString(16).padStart(2, '00');
      ctx.fill();
    }
  }

  for (let i = 0; i < 200; i++) particles.push(new Particle());
  function loop() {
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.fillRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(loop);
  }
  loop();

  function burst(bx, by, count) {
    for (let i = 0; i < count; i++) {
      const p = new Particle();
      p.x = bx; p.y = by;
      p.vx = (Math.random() - .5) * 7;
      p.vy = (Math.random() - .5) * 7;
      p.rad = Math.random() * 3 + 1;
      particles.push(p);
    }
    if (particles.length > 320) particles.splice(0, particles.length - 320);
  }

  const isMobile = window.matchMedia('(pointer: coarse)').matches;
  let autoBurst = null;

  const cObs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      setTimeout(() => { settled = true; }, 1800);
      if (isMobile && !autoBurst) {
        autoBurst = setInterval(() => {
          if (W && H) burst(W * 0.2 + Math.random() * W * 0.6, H * 0.2 + Math.random() * H * 0.6, 14);
        }, 2200);
      }
    } else {
      settled = false;
      if (autoBurst) { clearInterval(autoBurst); autoBurst = null; }
    }
  }, { threshold: 0.4 });
  const cs = document.getElementById('s-chaos');
  if (cs) cObs.observe(cs);

  canvas.addEventListener('click', e => {
    const r = canvas.getBoundingClientRect();
    burst(e.clientX - r.left, e.clientY - r.top, 24);
  });
  if (isMobile) {
    canvas.style.pointerEvents = 'none';
    const content = document.querySelector('.chaos-content');
    if (content) {
      content.style.pointerEvents = 'auto';
      content.addEventListener('touchend', () => {
        if (W && H) burst(W * 0.25 + Math.random() * W * 0.5, H * 0.25 + Math.random() * H * 0.5, 22);
      }, { passive: true });
    }
  } else {
    canvas.addEventListener('touchend', e => {
      const r = canvas.getBoundingClientRect();
      const t = e.changedTouches[0];
      burst(t.clientX - r.left, t.clientY - r.top, 24);
    }, { passive: true });
  }
}

/* ─── ENDING ─────────────────────────────────────── */
function initEnding() {
  const chips       = document.querySelectorAll('.w-chip');
  const dropWord    = document.getElementById('dropWord');
  const placeholder = document.querySelector('.drop-placeholder');
  const dropZone    = document.getElementById('dropZone');

  function setWord(word, activeChip) {
    chips.forEach(c => c.classList.remove('selected'));
    if (activeChip) activeChip.classList.add('selected');
    dropWord.classList.remove('show');
    placeholder.classList.add('hidden');
    dropZone.classList.add('active');
    setTimeout(() => { dropWord.textContent = word; dropWord.classList.add('show'); }, 200);
  }

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      setWord(chip.dataset.word, chip);
    });
    chip.setAttribute('draggable', true);
    chip.addEventListener('dragstart', e => {
      e.dataTransfer.setData('text/plain', chip.dataset.word);
      chip.classList.add('selected');
    });
  });
  dropZone.addEventListener('dragover',  e => { e.preventDefault(); dropZone.classList.add('active'); });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('active'));
  dropZone.addEventListener('drop', e => {
    e.preventDefault();
    const w = e.dataTransfer.getData('text/plain');
    const match = Array.from(chips).find(c => c.dataset.word === w);
    setWord(w, match || null);
  });
}

/* ─── SPOTLIGHT ──────────────────────────────────── */
function initSpotlight() {
  const section = document.getElementById('s-marginal');
  if (!section) return;
  let lit = false;
  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !lit) {
      setTimeout(() => {
        section.classList.add('spotlight-active');
        lit = true;
      }, 1000);
    }
  }, { threshold: 0.5 });
  obs.observe(section);
}

/* ─── BANQUET ─────────────────────────────────────── */
function initBanquet() {
  const viewport = document.getElementById('banquetViewport');
  const rotateG  = document.getElementById('banquetRotate');
  if (!viewport || !rotateG) return;
  let rotation = 0, isDragging = false, startX = 0, startRot = 0;

  function applyRotation(deg) {
    rotateG.setAttribute('transform', `rotate(${deg}, 800, 800)`);
  }

  viewport.addEventListener('mousedown', e => {
    isDragging = true; startX = e.clientX; startRot = rotation;
  });
  document.addEventListener('mousemove', e => {
    if (!isDragging) return;
    rotation = startRot + (e.clientX - startX) * 0.45;
    applyRotation(rotation);
  });
  document.addEventListener('mouseup', () => { isDragging = false; });
  viewport.addEventListener('touchstart', e => {
    isDragging = true; startX = e.touches[0].clientX; startRot = rotation;
  }, { passive: true });
  viewport.addEventListener('touchmove', e => {
    if (!isDragging) return;
    e.preventDefault();
    rotation = startRot + (e.touches[0].clientX - startX) * 0.45;
    applyRotation(rotation);
  }, { passive: false });
  viewport.addEventListener('touchend', () => { isDragging = false; });
}

/* ─── LIGHTBOX ────────────────────────────────────── */
function initLightbox() {
  const lb         = document.getElementById('lightbox');
  const lbImg      = document.getElementById('lbImg');
  const lbClose    = document.getElementById('lbClose');
  const lbBackdrop = document.getElementById('lbBackdrop');

  function open(src) {
    lbImg.src = src;
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    lb.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => { lbImg.src = ''; }, 400);
  }

  document.querySelectorAll('[data-lightbox]').forEach(el => {
    el.addEventListener('click', () => open(el.dataset.lightbox));
  });
  lbClose.addEventListener('click', close);
  lbBackdrop.addEventListener('click', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  window.addEventListener('pagehide', close);
}

/* ─── GRID CELLS ─────────────────────────────────── */
function initGridCells() {
  const cells        = document.querySelectorAll('.grid-cell');
  const cellBox      = document.getElementById('cellBox');
  const cellBoxImg   = document.getElementById('cellBoxImg');
  const cellBoxBd    = document.getElementById('cellBoxBackdrop');
  const cellBoxClose = document.getElementById('cellBoxClose');
  let activeCell     = null;

  function openCellBox(cell) {
    const photo = cell.dataset.photo;
    const rect  = cell.getBoundingClientRect();
    activeCell  = cell;

    cellBoxImg.src          = photo;
    cellBoxImg.style.top    = rect.top    + 'px';
    cellBoxImg.style.left   = rect.left   + 'px';
    cellBoxImg.style.width  = rect.width  + 'px';
    cellBoxImg.style.height = rect.height + 'px';

    cellBox.classList.add('open');
    document.body.style.overflow = 'hidden';

    requestAnimationFrame(() => requestAnimationFrame(() => {
      const pad = 40;
      const tw  = Math.min(window.innerWidth  - pad * 2, 1100);
      const th  = Math.min(window.innerHeight - pad * 2, 820);
      cellBoxImg.style.top    = (window.innerHeight - th) / 2 + 'px';
      cellBoxImg.style.left   = (window.innerWidth  - tw) / 2 + 'px';
      cellBoxImg.style.width  = tw + 'px';
      cellBoxImg.style.height = th + 'px';
    }));
  }

  function closeCellBox() {
    if (!activeCell) return;
    const rect = activeCell.getBoundingClientRect();
    cellBoxImg.style.top    = rect.top    + 'px';
    cellBoxImg.style.left   = rect.left   + 'px';
    cellBoxImg.style.width  = rect.width  + 'px';
    cellBoxImg.style.height = rect.height + 'px';
    setTimeout(() => {
      cellBox.classList.remove('open');
      document.body.style.overflow = '';
      activeCell = null;
      setTimeout(() => { cellBoxImg.src = ''; }, 50);
    }, 460);
  }

  cells.forEach(cell => {
    cell.addEventListener('click', e => { e.stopPropagation(); openCellBox(cell); });
  });
  cellBoxClose.addEventListener('click', closeCellBox);
  cellBoxBd.addEventListener('click', closeCellBox);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeCellBox(); });
}

/* ─── PARALLAX ───────────────────────────────────── */
function initParallax() {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  const bg = document.querySelector('#s-opening .section-bg');
  if (!bg) return;
  document.addEventListener('mousemove', e => {
    const x = (e.clientX / window.innerWidth  - 0.5) * 18;
    const y = (e.clientY / window.innerHeight - 0.5) * 18;
    bg.style.transform = `translate(${x}px,${y}px) scale(1.06)`;
  });
}