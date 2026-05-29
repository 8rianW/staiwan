'use strict';

/* ─── LOADER ─────────────────────────────────── */
const loader = document.getElementById('loader');
const loaderFill = document.querySelector('.loader-fill');
window.addEventListener('load', () => {
  loaderFill.style.width = '100%';
  setTimeout(() => { loader.classList.add('hidden'); initAll(); }, 2000);
});

/* ─── CURSOR ─────────────────────────────────── */
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

/* ─── NAV ───────────────────────────────────────── */
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
    window._sfx?.drop(0.08);
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

/* ─── SCROLL PROGRESS ───────────────────────────── */
const scrollFill = document.getElementById('scroll-fill');
function updateScrollProgress() {
  const total = document.body.scrollHeight - window.innerHeight;
  if (total > 0) scrollFill.style.height = (window.scrollY / total * 100) + '%';
}

/* ─── INIT ───────────────────────────────────────── */
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
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const img = e.target.querySelector('img');
      if (img && img.dataset.src) { img.src = img.dataset.src; delete img.dataset.src; }
      fbObs.unobserve(e.target);
    });
  }, { threshold: 0.05 });
  document.querySelectorAll('.warmth-photo,.gr-item,.cu-item').forEach(el => fbObs.observe(el));

  initAudio();
  initParallax();
  initCrisis();
  initSyntax();
  initChaos();
  initLightbox();
  initBanquet();
  initSpotlight();
  initEnding();
  initEndingSeq();
}

/* ─── AUDIO ────────────────────────────────────── */
function initAudio() {
  const bgMusic = document.getElementById('bgMusic');
  const audioBtn = document.getElementById('audioBtn');
  if (!bgMusic || !audioBtn) return;

  let audioCtx = null;
  let musicPlaying = false;

  function getCtx() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  }

  function playTone(freq, type = 'sine', duration = 0.4, vol = 0.1) {
    try {
      const ctx = getCtx();
      const osc = ctx.createOscillator();
      const gn  = ctx.createGain();
      osc.connect(gn); gn.connect(ctx.destination);
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gn.gain.setValueAtTime(vol, ctx.currentTime);
      gn.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration + 0.05);
    } catch (_) {}
  }

  function playDrop(vol = 0.12) {
    try {
      const ctx = getCtx();
      const osc = ctx.createOscillator();
      const gn  = ctx.createGain();
      osc.connect(gn); gn.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(480, ctx.currentTime + 0.07);
      gn.gain.setValueAtTime(vol, ctx.currentTime);
      gn.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.14);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.16);
    } catch (_) {}
  }

  function playWhoosh(vol = 0.06) {
    try {
      const ctx = getCtx();
      const bufSize = Math.floor(ctx.sampleRate * 0.35);
      const buf  = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const d    = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) d[i] = Math.random() * 2 - 1;
      const src  = ctx.createBufferSource();
      src.buffer = buf;
      const filt = ctx.createBiquadFilter();
      filt.type  = 'bandpass';
      filt.frequency.setValueAtTime(280, ctx.currentTime);
      filt.frequency.exponentialRampToValueAtTime(2800, ctx.currentTime + 0.28);
      filt.Q.value = 0.5;
      const gn = ctx.createGain();
      gn.gain.setValueAtTime(vol, ctx.currentTime);
      gn.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
      src.connect(filt); filt.connect(gn); gn.connect(ctx.destination);
      src.start();
    } catch (_) {}
  }

  window._sfx = { tone: playTone, drop: playDrop, whoosh: playWhoosh };

  function toggleMusic() {
    if (!musicPlaying) {
      getCtx();
      bgMusic.volume = 0;
      bgMusic.play().then(() => {
        musicPlaying = true;
        audioBtn.classList.add('playing');
        let vol = 0;
        const id = setInterval(() => {
          vol = Math.min(vol + 0.005, 0.18);
          bgMusic.volume = vol;
          if (vol >= 0.18) clearInterval(id);
        }, 55);
      }).catch(() => {});
    } else {
      let vol = bgMusic.volume;
      const id = setInterval(() => {
        vol = Math.max(vol - 0.012, 0);
        bgMusic.volume = vol;
        if (vol <= 0) {
          clearInterval(id);
          bgMusic.pause();
          musicPlaying = false;
          audioBtn.classList.remove('playing');
        }
      }, 55);
    }
  }

  audioBtn.addEventListener('click', toggleMusic);
}

/* ─── PARALLAX ───────────────────────────────────── */
function initParallax() {
  const bg = document.getElementById('openingBg');
  if (!bg || window.matchMedia('(pointer: coarse)').matches) return;
  let tX = 0, tY = 0, cX = 0, cY = 0;
  document.addEventListener('mousemove', e => {
    tX = (e.clientX / window.innerWidth  - 0.5) * -22;
    tY = (e.clientY / window.innerHeight - 0.5) * -22;
  }, { passive: true });
  (function lerp() {
    cX += (tX - cX) * 0.06;
    cY += (tY - cY) * 0.06;
    bg.style.transform = `translate(${cX.toFixed(2)}px,${cY.toFixed(2)}px)`;
    requestAnimationFrame(lerp);
  })();
}

/* ─── IDENTITY CRISIS ─────────────────────────────── */
function initCrisis() {
  const cells = document.querySelectorAll('.grid-cell');
  const cellBox    = document.getElementById('cellBox');
  const cellBoxImg = document.getElementById('cellBoxImg');
  const cellBoxClose = document.getElementById('cellBoxClose');
  const cellBoxBd  = document.getElementById('cellBoxBackdrop');
  if (!cellBox) return;

  let activeCell = null;

  function openCell(cell) {
    window._sfx?.tone(523, 'sine', 0.5, 0.09);
    if (activeCell) closeCell();
    activeCell = cell;
    cell.classList.add('active-cell');
    const photo = cell.dataset.photo;
    if (!photo) return;
    const capEl = document.getElementById('cellBoxCaption');
    if (capEl) {
      const descP = cell.querySelector('.gc-desc p');
      capEl.textContent = descP ? descP.textContent : '';
    }
    const rect = cell.getBoundingClientRect();
    cellBoxImg.style.cssText = `top:${rect.top}px;left:${rect.left}px;width:${rect.width}px;height:${rect.height}px;opacity:0;`;
    cellBoxImg.src = photo;
    cellBox.classList.add('open');
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const tw = Math.min(window.innerWidth * 0.85, 720);
      const th = tw * 0.75;
      const tx = (window.innerWidth - tw) / 2;
      const ty = (window.innerHeight - th) / 2;
      cellBoxImg.style.cssText = `top:${ty}px;left:${tx}px;width:${tw}px;height:${th}px;opacity:1;`;
    }));
  }

  function closeCell() {
    if (!activeCell) return;
    window._sfx?.tone(440, 'sine', 0.3, 0.06);
    const cell = activeCell;
    const rect = cell.getBoundingClientRect();
    cellBoxImg.style.cssText = `top:${rect.top}px;left:${rect.left}px;width:${rect.width}px;height:${rect.height}px;opacity:0;`;
    cellBox.classList.remove('open');
    const capEl = document.getElementById('cellBoxCaption');
    if (capEl) capEl.textContent = '';
    setTimeout(() => { cell.classList.remove('active-cell'); if (activeCell === cell) activeCell = null; }, 480);
  }

  cells.forEach(cell => {
    cell.addEventListener('click', e => {
      e.stopPropagation();
      if (activeCell === cell) closeCell();
      else openCell(cell);
    });
  });

  if (cellBoxClose) cellBoxClose.addEventListener('click', closeCell);
  if (cellBoxBd)    cellBoxBd.addEventListener('click', closeCell);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeCell(); });
}

/* ─── SYNTAX ──────────────────────────────────────── */
function initSyntax() {
  const wordArea = document.getElementById('synWordArea');
  const meaning  = document.getElementById('synMeaning');
  if (!wordArea || !meaning) return;

  const COLORS = { T:'#E05555', A:'#D4A843', I:'#5B88D4', W:'#5DB86A', N:'#D4A843' };
  const GLOW   = {
    T:'rgba(224,85,85,0.55)', A:'rgba(212,168,67,0.55)',
    I:'rgba(91,136,212,0.55)', W:'rgba(93,184,106,0.55)', N:'rgba(212,168,67,0.55)',
  };

  const PAIRS = [
    { from:'PAIN',  to:'PAINT',  twIdx:[4],     zh:'痛苦 → 創作' },
    { from:'CHAOS', to:'ACTION', twIdx:[2,3,5], zh:'混亂 → 行動' },
    { from:'SIN',   to:'SAINT',  twIdx:[1,4],   zh:'罪惡 → 聖潔' },
    { from:'ILL',   to:'WILL',   twIdx:[0],     zh:'病態 → 意志' },
    { from:'RUST',  to:'TRUST',  twIdx:[0],     zh:'鏽蝕 → 信任' },
    { from:'FEAR',  to:'AWARE',  twIdx:[1,2],   zh:'恐懼 → 覺察' },
    { from:'DARK',  to:'DAWN',   twIdx:[2,3],   zh:'黑暗 → 黎明' },
    { from:'WEAK',  to:'AWAKE',  twIdx:[0],     zh:'虛弱 → 覺醒' },
    { from:'HURT',  to:'TRUTH',  twIdx:[0],     zh:'傷痛 → 真實' },
    { from:'ASH',   to:'WASH',   twIdx:[0],     zh:'灰燼 → 洗淨' },
  ];

  let idx = 0;
  let timers = [];

  function later(fn, ms) { const id = setTimeout(fn, ms); timers.push(id); return id; }
  function clearAll() { timers.forEach(clearTimeout); timers = []; }

  function runPair(pairIdx) {
    clearAll();
    const pair   = PAIRS[pairIdx];
    const twSet  = new Set(pair.twIdx);
    const addChs = [...twSet].map(i => pair.to[i]);

    wordArea.innerHTML = '';
    meaning.className  = 'syn-meaning';
    meaning.textContent = pair.zh;

    /* Phase 1: FROM word drifts in */
    const fromWrap = document.createElement('div');
    fromWrap.className = 'syn-from-word';
    wordArea.appendChild(fromWrap);

    const fromSpans = pair.from.split('').map((ch, i) => {
      const s = document.createElement('span');
      s.className   = 'syn-l';
      s.textContent = ch;
      s.style.opacity   = '0';
      s.style.transform = 'translateY(18px)';
      s.style.filter    = 'blur(6px)';
      fromWrap.appendChild(s);
      later(() => {
        s.style.transition = 'opacity 0.9s ease, transform 0.9s cubic-bezier(0.16,1,0.3,1), filter 0.9s ease';
        s.style.opacity    = '1';
        s.style.transform  = 'translateY(0)';
        s.style.filter     = 'blur(0)';
      }, 80 + i * 110);
      return s;
    });

    /* Phase 2: Taiwan letters emerge from darkness */
    const floaters = [];
    later(() => {
      addChs.forEach((ch, i) => {
        const f      = document.createElement('span');
        f.className  = 'syn-float-l';
        const col    = COLORS[ch] || '#C9A84C';
        const glow   = GLOW[ch]   || 'rgba(201,168,76,0.5)';
        const spread = (i - (addChs.length - 1) / 2) * 52;
        const sx     = spread + (Math.random() - 0.5) * 90;
        const sy     = -98 - Math.random() * 46;
        const hy     = -68 - i * 16;

        f.style.color      = col;
        f.style.textShadow = `0 0 28px ${glow}`;
        f.style.opacity    = '0';
        f.style.transform  = `translate(calc(-50% + ${sx}px), calc(-50% + ${sy}px))`;
        f.style.filter     = 'blur(14px)';
        wordArea.appendChild(f);
        floaters.push(f);

        later(() => {
          f.style.transition = 'opacity 1.4s ease, transform 1.4s cubic-bezier(0.16,1,0.3,1), filter 1.4s ease';
          f.style.transform  = `translate(calc(-50% + ${spread}px), calc(-50% + ${hy}px))`;
          f.style.opacity    = '0.78';
          f.style.filter     = 'blur(0.5px)';
        }, 80 + i * 200);
      });

      /* Phase 3: Cinematic dissolve — no scatter */
      later(() => {
        /* FROM letters: slow vertical dissolve upward, no fly-out */
        fromSpans.forEach((el, i) => {
          later(() => {
            el.style.transition = 'opacity 1.5s ease, transform 1.5s ease, filter 1.5s ease';
            el.style.opacity    = '0';
            el.style.transform  = 'translateY(-12px) scale(0.94)';
            el.style.filter     = 'blur(10px)';
          }, i * 45);
        });

        /* Taiwan floaters: breathe inward and dissolve, no scatter */
        floaters.forEach((f, i) => {
          later(() => {
            f.style.transition = 'opacity 1.3s ease, transform 1.5s cubic-bezier(0.16,1,0.3,1), filter 1.3s ease';
            f.style.transform  = `translate(-50%, calc(-50% + ${-14 + i * 10}px)) scale(0.76)`;
            f.style.opacity    = '0';
            f.style.filter     = 'blur(8px)';
          }, i * 60);
        });

        /* Phase 4: TO word assembles from blur */
        later(() => {
          wordArea.innerHTML = '';
          const toWrap = document.createElement('div');
          toWrap.className = 'syn-to-word';
          wordArea.appendChild(toWrap);

          pair.to.split('').forEach((ch, i) => {
            const s    = document.createElement('span');
            const isTw = twSet.has(i);
            s.className   = 'syn-l' + (isTw ? ' tw' : '');
            s.textContent = ch;
            if (isTw) s.style.color = COLORS[ch] || '#C9A84C';
            s.style.opacity   = '0';
            s.style.transform = 'translateY(12px) scale(0.92)';
            s.style.filter    = 'blur(8px)';
            toWrap.appendChild(s);

            later(() => {
              s.style.transition = 'opacity 1.0s ease, transform 1.0s cubic-bezier(0.16,1,0.3,1), filter 1.0s ease';
              s.style.opacity    = '1';
              s.style.transform  = 'translateY(0) scale(1)';
              s.style.filter     = 'blur(0)';
              if (isTw) {
                later(() => {
                  if (s.isConnected) s.style.animation = 'synTwBreathe 3.5s ease-in-out infinite';
                }, 1000);
              }
            }, 60 + i * 100);
          });

          later(() => meaning.classList.add('visible'), 700);

          later(() => {
            if (toWrap.isConnected)
              toWrap.style.animation = 'synWordBreathe 5s ease-in-out infinite';
          }, 1400);

          /* Fade out then next pair */
          later(() => {
            if (toWrap.isConnected) {
              toWrap.style.animation  = 'none';
              toWrap.style.transition = 'opacity 0.85s ease';
              toWrap.style.opacity    = '0';
            }
            meaning.classList.remove('visible');
            later(() => { idx = (idx + 1) % PAIRS.length; runPair(idx); }, 900);
          }, 3000);

        }, 1000); /* Phase 4 starts 1s into Phase 3 */
      }, 1400);   /* Phase 3 starts 1.4s after Phase 2 */
    }, 1500);     /* Phase 2 starts at 1.5s */
  }

  const section = document.getElementById('s-syntax');
  let started = false;
  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !started) {
      started = true;
      later(() => runPair(0), 600);
    }
  }, { threshold: 0.35 });
  if (section) obs.observe(section);
}

/* ─── CHAOS CANVAS ─────────────────────────────────── */
function initChaos() {
  const canvas = document.getElementById('chaosCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const COLORS = ['#B23A3A','#2F5D9F','#3A7D44','#C9A84C','#7B4F9E'];
  let particles = [], settled = false, W, H, animId = null;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
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
      this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
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
      if (this.age > this.life || this.x < -10 || this.x > W+10 || this.y < -10 || this.y > H+10)
        this.reset(false);
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.rad, 0, Math.PI * 2);
      ctx.fillStyle = this.color + Math.floor(this.alpha * 255).toString(16).padStart(2, '0');
      ctx.fill();
    }
  }

  for (let i = 0; i < 200; i++) particles.push(new Particle());

  let visible = false, settleTimer = null;
  const isMobile = window.matchMedia('(pointer: coarse)').matches;
  let autoBurst = null;

  const chaosSection = document.getElementById('s-chaos');
  const vObs = new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (visible) {
      resize();
      settled = false;
      if (settleTimer) clearTimeout(settleTimer);
      settleTimer = setTimeout(() => { settled = true; }, 1800);
      if (!animId) loop();
      if (isMobile && !autoBurst) {
        autoBurst = setInterval(() => {
          if (W && H) burst(W * .2 + Math.random() * W * .6, H * .2 + Math.random() * H * .6, 14);
        }, 2200);
      }
    } else {
      settled = false;
      if (settleTimer) clearTimeout(settleTimer);
      if (autoBurst) { clearInterval(autoBurst); autoBurst = null; }
    }
  }, { threshold: 0.1 });
  if (chaosSection) vObs.observe(chaosSection);

  function loop() {
    if (!visible) { animId = null; return; }
    animId = requestAnimationFrame(loop);
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.fillRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
  }

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

  if (!isMobile) {
    canvas.addEventListener('click', e => burst(e.offsetX, e.offsetY, 20));
  }
}

/* ─── LIGHTBOX ───────────────────────────────────── */
function initLightbox() {
  const lb      = document.getElementById('lightbox');
  const lbImg   = document.getElementById('lbImg');
  const lbClose = document.getElementById('lbClose');
  const lbBd    = document.getElementById('lbBackdrop');
  const lbCap   = document.getElementById('lbCaption');
  if (!lb) return;

  document.querySelectorAll('[data-lightbox]').forEach(el => {
    el.addEventListener('click', () => {
      window._sfx?.whoosh(0.07);
      lbImg.src = el.dataset.lightbox;
      const img = el.querySelector('img');
      if (lbCap) lbCap.textContent = img?.alt || el.dataset.caption || '';
      lb.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });
  function closeLb() { window._sfx?.tone(494, 'sine', 0.25, 0.06); lb.classList.remove('open'); document.body.style.overflow = ''; }
  if (lbClose) lbClose.addEventListener('click', closeLb);
  if (lbBd)    lbBd.addEventListener('click', closeLb);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLb(); });
}

/* ─── BANQUET ───────────────────────────────────────── */
function initBanquet() {
  const viewport = document.getElementById('banquetViewport');
  const rotateG  = document.getElementById('banquetRotate');
  const foodEls  = document.querySelectorAll('.banquet-food');
  if (!viewport || !rotateG || !foodEls.length) return;

  const FOOD_DATA = {
    oyster:     { zh: '蚵仙4煎',  en: 'Oyster Omelette',        desc: '以地瓜粉、雞蛋與新鮮蚵仙4煎製而成，淋上特調甜辣醬，是台灣夜市最具代表性的小吃。',       wiki: 'Oyster_omelette',         fallback: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Orh-Nee-Jian-Oyster-Omelette.jpg/640px-Orh-Nee-Jian-Oyster-Omelette.jpg' },
    chicken:    { zh: '鸹鄭雞',  en: 'Taiwanese Fried Chicken', desc: '香鄭的雞塊與九層塔一同入鍋炸製，鸹香鄭脆，是台灣宵夜文化的靈魂小吃。',               wiki: 'Taiwanese_fried_chicken', fallback: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Yansuj%C3%AD.jpg/640px-Yansuj%C3%AD.jpg' },
    guabao:     { zh: '割包',    en: 'Gua Bao',                 desc: '鬆軟白麵包夾入滇製五花肉、花生粉與酸菜，軟嫩鄭脆並存，被譽為「台灣漢堡」。',           wiki: 'Gua_bao',                 fallback: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Gua_bao_2.jpg/640px-Gua_bao_2.jpg' },
    luroufan:   { zh: '滇肉飯',  en: 'Lu Rou Fan',              desc: '肥瘦相間的豬五花以醬油、米酒、冰糖慢燉後澆在白飯上，是台灣家常滋味的最高代表。',       wiki: 'Lu_rou_fan',              fallback: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Luroufan.jpg/640px-Luroufan.jpg' },
    beefnoodle: { zh: '牛肉麵',  en: 'Beef Noodle Soup',        desc: '以紅燒湯底燉煮軟裛牛踱，搞配彈牙麵條，是台灣最驕傲的國民美食，每年舉辦比賽選出最佳口味。', wiki: 'Beef_noodle_soup',        fallback: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Taiwan_beef_noodle_soup.jpg/640px-Taiwan_beef_noodle_soup.jpg', imgOverride: 'https://tokyo-kitchen.icook.network/uploads/recipe/cover/338564/8869cd181686929d.jpg' },
    bubbletea:  { zh: '珍珠奶茶', en: 'Bubble Tea',             desc: '1980年代發源於台灣台中，Q很珍珠搞配奶茶，是台灣對世界飲料文化最大的貢獻。',           wiki: 'Bubble_tea',              fallback: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Bubble_tea_at_Fantaasia_2015.jpg/640px-Bubble_tea_at_Fantaasia_2015.jpg', imgOverride: 'https://doqvf81n9htmm.cloudfront.net/data/crop_article/91169/shutterstock_1271869054.jpg_1140x855.jpg' },
    miansian:   { zh: '大腸麵線', en: 'Oyster Vermicelli',      desc: '以豬大腸與蚵仙4燉入勾芝的麵線湯中，口感滑順，是廟會與夜市中最殫慰人心的平民小吃。',   wiki: 'Oyster_vermicelli',       fallback: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Mian_xian.jpg/640px-Mian_xian.jpg' },
    coffin:     { zh: '棺材板',  en: 'Coffin Bread',            desc: '發源於台南，以厚片土司挖空後填入濃郁奶油燉料，外鄭內滑，名稱怪異卻深受喜愛。',       wiki: 'Coffin_bread',            fallback: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Coffin_bread.jpg/640px-Coffin_bread.jpg' },
    stinkytofu: { zh: '臭豆腥',  en: 'Stinky Tofu',             desc: '炸至金黃鄭脆後配上酸辣泡菜，「聞起來臭，吃起來香」，是台灣夜市最具挑戰性的美食。',   wiki: 'Stinky_tofu',             fallback: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Stinky_tofu_in_Jiufen.jpg/640px-Stinky_tofu_in_Jiufen.jpg' },
    bawan:      { zh: '肉圓',    en: 'Ba-Wan',                  desc: '以地瓜粉製成半透明外皮，包裹豬絞肉、竹筍與香菇，清蒸或油炸後淋上甜辣醬，是彰化、台南的在地驕傲。', wiki: 'Ba-wan',            fallback: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Bawan.jpg/640px-Bawan.jpg' },
  };

  const popup   = document.getElementById('banquetPopup');
  const bpBd    = document.getElementById('bp-backdrop');
  const bpClose = document.getElementById('bp-close');
  const bpName  = document.getElementById('bp-name');
  const bpDesc  = document.getElementById('bp-desc');
  const bpPhoto = document.getElementById('bp-photo');

  function showPhoto(src) {
    bpPhoto.onload = () => { bpPhoto.style.opacity = '1'; };
    bpPhoto.onerror = () => {};
    bpPhoto.src = src;
  }

  async function openPopup(key) {
    const food = FOOD_DATA[key];
    if (!food || !popup) return;
    window._sfx?.tone(784, 'sine', 0.6, 0.1);
    bpName.textContent    = `${food.zh}　${food.en}`;
    bpDesc.textContent    = food.desc;
    bpPhoto.style.opacity = '0';
    bpPhoto.src           = '';
    popup.classList.add('open');
    document.body.style.overflow = 'hidden';

    if (food.imgOverride) { showPhoto(food.imgOverride); return; }

    try {
      const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(food.wiki)}`);
      if (res.ok) {
        const data = await res.json();
        const src  = data?.thumbnail?.source || data?.originalimage?.source;
        if (src) { showPhoto(src); return; }
      }
    } catch (_) {}

    try {
      const title = encodeURIComponent(food.wiki.replace(/_/g, ' '));
      const res  = await fetch(`https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&titles=${title}&piprop=thumbnail&pithumbsize=640&redirects=1&format=json&origin=*`);
      const data = await res.json();
      const page = data?.query?.pages ? Object.values(data.query.pages)[0] : null;
      const src  = page?.thumbnail?.source;
      if (src) { showPhoto(src); return; }
    } catch (_) {}

    for (const q of [food.en, food.wiki.replace(/_/g, ' ')]) {
      try {
        const res = await fetch(`https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(q)}&prop=imageinfo&iiprop=url&iiurlwidth=640&gsrlimit=8&format=json&origin=*`);
        const data  = await res.json();
        const pages = Object.values(data?.query?.pages || {});
        for (const pg of pages) {
          const info = pg?.imageinfo?.[0];
          const full = (info?.url || '').toLowerCase();
          if (/\.(jpg|jpeg|png)$/.test(full)) {
            showPhoto(info.thumburl || info.url);
            return;
          }
        }
      } catch (_) {}
    }

    if (food.fallback) showPhoto(food.fallback);
  }

  function closePopup() {
    if (!popup) return;
    window._sfx?.tone(523, 'sine', 0.3, 0.06);
    popup.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => { if (bpPhoto) bpPhoto.src = ''; }, 400);
  }

  if (bpClose) bpClose.addEventListener('click', closePopup);
  if (bpBd)    bpBd.addEventListener('click', closePopup);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closePopup(); });

  const SVG_W = 800, SVG_H = 430;
  const PIVOT_X = 400, PIVOT_Y = 0;
  const RADIUS  = 300;
  let   angle   = 0;
  let   dragging = false, lastX = 0, lastY = 0, angVel = 0;

  function positionFoods() {
    foodEls.forEach(el => {
      const theta = (parseFloat(el.dataset.theta) || 0) * Math.PI / 180;
      const a = (angle + theta);
      const x = PIVOT_X + RADIUS * Math.cos(a);
      const y = PIVOT_Y + RADIUS * Math.sin(a);
      el.setAttribute('transform', `translate(${x.toFixed(1)},${y.toFixed(1)})`);
    });
  }

  function applyRotation() {
    rotateG.setAttribute('transform', `rotate(${(angle * 180 / Math.PI).toFixed(3)},${PIVOT_X},${PIVOT_Y})`);
    positionFoods();
  }

  let rafId = null;
  function animate() {
    if (Math.abs(angVel) < 0.0001) { angVel = 0; rafId = null; return; }
    angVel *= 0.97;
    angle  += angVel;
    applyRotation();
    rafId = requestAnimationFrame(animate);
  }

  function svgPoint(e) {
    const svg = document.getElementById('banquetSvg');
    const pt  = svg.createSVGPoint();
    const src = e.touches ? e.touches[0] : e;
    pt.x = src.clientX; pt.y = src.clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  }

  let touchStartX = 0, touchStartY = 0, touchDir = null;

  function onDown(e) {
    const tgt = e.target.closest('.banquet-food');
    if (tgt) return;
    const hint = document.getElementById('rotateHint');
    if (hint) hint.classList.add('hidden');
    dragging = true;
    touchDir = null;
    angVel   = 0;
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    const p = svgPoint(e);
    lastX = p.x; lastY = p.y;
    if (e.touches) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      window.addEventListener('touchmove', onMove, { passive: false });
    } else {
      e.preventDefault();
    }
  }
  function onMove(e) {
    if (!dragging) return;
    if (e.touches) {
      if (touchDir === null) {
        const dx = Math.abs(e.touches[0].clientX - touchStartX);
        const dy = Math.abs(e.touches[0].clientY - touchStartY);
        if (dx + dy < 8) return;
        touchDir = dx >= dy ? 'h' : 'v';
      }
      if (touchDir === 'v') { dragging = false; window.removeEventListener('touchmove', onMove); return; }
    }
    const p  = svgPoint(e);
    const dx = p.x - lastX;
    lastX = p.x; lastY = p.y;
    angVel = -dx * 0.003;
    angle += angVel;
    applyRotation();
    if (e.cancelable) e.preventDefault();
  }
  function onUp() {
    if (!dragging) return;
    dragging = false;
    window.removeEventListener('touchmove', onMove);
    if (Math.abs(angVel) > 0.0001) rafId = requestAnimationFrame(animate);
  }

  viewport.addEventListener('mousedown',  onDown,  { passive: false });
  viewport.addEventListener('touchstart', onDown,  { passive: true });
  window.addEventListener ('mousemove',   onMove,  { passive: false });
  window.addEventListener ('mouseup',     onUp);
  window.addEventListener ('touchend',    onUp);

  foodEls.forEach(el => {
    el.addEventListener('click', e => {
      const fg = e.currentTarget;
      if (Math.abs(angVel) > 0.005) return;
      if (fg) openPopup(fg.dataset.food);
    });
    el.addEventListener('touchend', e => {
      const item = e.currentTarget;
      if (Math.abs(angVel) > 0.005) return;
      openPopup(item.dataset.food);
    }, { passive: true });
  });

  applyRotation();
}

/* ─── ENDING ───────────────────────────────────────── */
function initEnding() {
  const chips       = document.querySelectorAll('.w-chip');
  const dropZone    = document.getElementById('dropZone');
  const dropWord    = document.getElementById('dropWord');
  const placeholder = dropZone?.querySelector('.drop-placeholder');
  if (!chips.length || !dropZone || !dropWord) return;

  function spawnParticles(fromEl) {
    const rect = fromEl.getBoundingClientRect();
    const cx = rect.left + rect.width  / 2;
    const cy = rect.top  + rect.height / 2;
    const count = 16;
    for (let i = 0; i < count; i++) {
      const el = document.createElement('span');
      const size = 3 + Math.random() * 4;
      const dur  = 420 + Math.random() * 280;
      el.style.cssText = [
        'position:fixed',
        `width:${size}px`,
        `height:${size}px`,
        'border-radius:50%',
        `background:${Math.random() > 0.4 ? 'var(--gold)' : 'var(--text)'}`,
        `left:${cx}px`,
        `top:${cy}px`,
        'pointer-events:none',
        'z-index:9999',
        'opacity:0.85',
        `transition:transform ${dur}ms cubic-bezier(0.1,0,0.2,1),opacity ${dur}ms ease`,
        'transform:translate(-50%,-50%)',
      ].join(';');
      document.body.appendChild(el);
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
      const dist  = 36 + Math.random() * 64;
      requestAnimationFrame(() => requestAnimationFrame(() => {
        el.style.transform = `translate(calc(-50% + ${(Math.cos(angle) * dist).toFixed(1)}px), calc(-50% + ${(Math.sin(angle) * dist).toFixed(1)}px)) scale(0.15)`;
        el.style.opacity   = '0';
      }));
      setTimeout(() => el.remove(), dur + 50);
    }
  }

  function flashZone() {
    dropZone.classList.add('flash');
    setTimeout(() => dropZone.classList.remove('flash'), 600);
  }

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      window._sfx?.drop(0.14);
      window._sfx?.tone(880, 'sine', 0.45, 0.07);
      const word = chip.dataset.word;
      chips.forEach(c => c.classList.remove('selected'));
      chip.classList.add('selected');

      spawnParticles(chip);

      dropWord.classList.remove('show');
      dropWord.getBoundingClientRect();
      dropWord.textContent = word;
      if (placeholder) placeholder.classList.add('hidden');
      dropZone.classList.add('active');
      flashZone();

      requestAnimationFrame(() => dropWord.classList.add('show'));
    });
  });
}

/* ─── SPOTLIGHT ───────────────────────────────────────── */
function initSpotlight() {
  const section  = document.getElementById('s-marginal');
  const ringPath = document.getElementById('marginalRingPath');
  if (!section) return;

  let lit = false, morphed = false, morphing = false, ringAnimId = null;
  const RING_R = 138, RING_N = 120;

  function getRingCenter() {
    return {
      cx: (section.offsetWidth  || window.innerWidth)  * 0.26,
      cy: (section.offsetHeight || window.innerHeight) * 0.67,
    };
  }

  function drawStaticRing() {
    if (!ringPath) return;
    const { cx, cy } = getRingCenter();
    const pts = Array.from({ length: RING_N }, (_, i) => {
      const a = (i / RING_N) * Math.PI * 2;
      const j = (Math.sin(i * 2.1) + Math.sin(i * 3.7)) * 5;
      return [(cx + (RING_R + j) * Math.cos(a)).toFixed(1),
              (cy + (RING_R + j) * Math.sin(a)).toFixed(1)];
    });
    ringPath.setAttribute('d', 'M' + pts.map(p => p.join(',')).join('L') + 'Z');
  }

  function startRingAnim() {
    if (ringAnimId || morphed || morphing) return;
    function frame(ts) {
      if (morphed || morphing) { ringAnimId = null; return; }
      const { cx, cy } = getRingCenter();
      const t = ts * 0.00055;
      const pts = Array.from({ length: RING_N }, (_, i) => {
        const a = (i / RING_N) * Math.PI * 2;
        const j = (Math.sin(i * 2.1 + t) + Math.sin(i * 3.7 + t * 0.71)) * 6;
        return [(cx + (RING_R + j) * Math.cos(a)).toFixed(1),
                (cy + (RING_R + j) * Math.sin(a)).toFixed(1)];
      });
      if (ringPath) ringPath.setAttribute('d', 'M' + pts.map(p => p.join(',')).join('L') + 'Z');
      ringAnimId = requestAnimationFrame(frame);
    }
    ringAnimId = requestAnimationFrame(frame);
  }

  function stopRingAnim() {
    if (ringAnimId) { cancelAnimationFrame(ringAnimId); ringAnimId = null; }
  }

  drawStaticRing();
  window.addEventListener('resize', () => { if (!morphed && !ringAnimId) drawStaticRing(); }, { passive: true });

  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      if (!lit) {
        setTimeout(() => { section.classList.add('spotlight-active'); lit = true; startRingAnim(); }, 1000);
      } else {
        startRingAnim();
      }
    } else {
      stopRingAnim();
    }
  }, { threshold: 0.5 });
  obs.observe(section);

  section.addEventListener('click', e => {
    if (e.target.closest('.marginal-content')) return;
    if (!lit || morphing || morphed) return;
    const tw = document.getElementById('taiwanPath');
    if (!tw) return;
    morphing = true;
    stopRingAnim();

    const { cx, cy } = getRingCenter();

    const circlePts = Array.from({ length: RING_N }, (_, i) => {
      const a = (i / RING_N) * Math.PI * 2;
      const j = (Math.sin(i * 2.1) + Math.sin(i * 3.7)) * 5;
      return [cx + (RING_R + j) * Math.cos(a), cy + (RING_R + j) * Math.sin(a)];
    });

    const pathLen = tw.getTotalLength();
    const rawPts  = Array.from({ length: RING_N }, (_, i) => {
      const pt = tw.getPointAtLength(i / RING_N * pathLen);
      return [pt.x, pt.y];
    });

    const xs = rawPts.map(p => p[0]), ys = rawPts.map(p => p[1]);
    const twCx = (Math.min(...xs) + Math.max(...xs)) / 2;
    const twCy = (Math.min(...ys) + Math.max(...ys)) / 2;
    const sc   = (RING_R * 2) / (Math.max(...ys) - Math.min(...ys));

    const taiwanPts = rawPts.map(p => [
      cx + (p[0] - twCx) * sc,
      cy + (p[1] - twCy) * sc,
    ]);

    const dur = 1400, t0 = performance.now();
    (function step(now) {
      const t    = Math.min((now - t0) / dur, 1);
      const ease = t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3) / 2;
      const pts  = circlePts.map((c, i) => [
        (c[0] + (taiwanPts[i][0] - c[0]) * ease).toFixed(1),
        (c[1] + (taiwanPts[i][1] - c[1]) * ease).toFixed(1),
      ]);
      if (ringPath) ringPath.setAttribute('d', 'M' + pts.map(p => p.join(',')).join('L') + 'Z');
      if (t < 1) requestAnimationFrame(step);
      else { morphed = true; morphing = false; section.classList.add('ring-morphed'); }
    })(t0);
  });
}

/* ─── ENDING SEQUENCE ──────────────────────────────────── */
function initEndingSeq() {
  const section = document.getElementById('s-ending-seq');
  const prompt  = document.getElementById('eseqPrompt');
  const texts   = document.getElementById('eseqTexts');
  const taiwan  = document.getElementById('eseqTaiwan');
  if (!section || !prompt || !texts || !taiwan) return;

  let started = false;

  function runSequence() {
    /* Stage 1: "Taiwan is ______" fades in (2s) */
    prompt.style.transition = 'opacity 2s ease';
    prompt.style.opacity = '1';

    /* Stage 2: at 2.5s — prompt fades out, Chinese + English fade in */
    setTimeout(() => {
      prompt.style.transition = 'opacity 3s ease';
      prompt.style.opacity = '0';
      texts.style.transition = 'opacity 1.6s ease';
      texts.style.opacity = '1';

      /* Stage 3: at 2.5+4.5=7s — texts dissolve out slowly */
      setTimeout(() => {
        texts.style.transition = 'opacity 3s ease';
        texts.style.opacity = '0';

        /* Stage 4: at 1.5s into Stage 3 — T A I W A N breathes in */
        setTimeout(() => {
          taiwan.style.transition = 'opacity 2.5s ease';
          taiwan.style.opacity = '1';
          setTimeout(() => {
            if (taiwan.isConnected)
              taiwan.style.animation = 'eseqBreathe 4s ease-in-out infinite';
          }, 2500);
        }, 1500);
      }, 4500);
    }, 2500);
  }

  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !started) {
      started = true;
      setTimeout(runSequence, 800);
    }
  }, { threshold: 0.45 });
  obs.observe(section);
}