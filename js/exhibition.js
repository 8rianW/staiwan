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
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const img = e.target.querySelector('img');
      if (img && img.dataset.src) { img.src = img.dataset.src; delete img.dataset.src; }
      fbObs.unobserve(e.target);
    });
  }, { threshold: 0.05 });
  document.querySelectorAll('.warmth-photo,.gr-item,.cu-item').forEach(el => fbObs.observe(el));

  initCrisis();
  initSyntax();
  initChaos();
  initLightbox();
  initBanquet();
  initSpotlight();
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
    if (activeCell) closeCell();
    activeCell = cell;
    cell.classList.add('active-cell');
    const photo = cell.dataset.photo;
    if (!photo) return;
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
    const cell = activeCell;
    const rect = cell.getBoundingClientRect();
    cellBoxImg.style.cssText = `top:${rect.top}px;left:${rect.left}px;width:${rect.width}px;height:${rect.height}px;opacity:0;`;
    cellBox.classList.remove('open');
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
  const fromEl = document.getElementById('syntaxFrom');
  const toEl   = document.getElementById('syntaxTo');
  const nextBtn = document.getElementById('syntaxNext');
  if (!fromEl || !toEl || !nextBtn) return;

  const TAIWAN = new Set(['T','A','I','W','A','N']);
  const PAIRS = [
    ['PAIN',   'PLAIN'],
    ['WAR',    'WARM'],
    ['WAIT',   'AWAIT'],
    ['TAN',    'TITAN'],
    ['TRAIN',  'TAIWAN'],
    ['WANT',   'IANT'],
    ['RAIN',   'TRAIN'],
    ['WIN',    'TWIN'],
    ['ANTI',   'AINT'],
    ['TWIN',   'TWAIN'],
    ['WAIN',   'TWAIN'],
    ['AINT',   'AINT'],
  ];
  let idx = 0;

  function countLetters(word) {
    const c = {};
    for (const ch of word.toUpperCase()) c[ch] = (c[ch] || 0) + 1;
    return c;
  }
  function highlightTaiwan(from, to) {
    const fc = countLetters(from);
    const tc = countLetters(to);
    const added = {};
    for (const ch of to.toUpperCase()) {
      const need = (tc[ch] || 0) - (fc[ch] || 0);
      added[ch] = Math.max(0, need);
    }
    return added;
  }

  function renderWord(el, word, added) {
    el.innerHTML = '';
    const addCount = { ...added };
    for (const ch of word.toUpperCase()) {
      const span = document.createElement('span');
      span.className = 's-letter';
      span.textContent = ch;
      if (addCount[ch] > 0 && TAIWAN.has(ch)) {
        span.classList.add('taiwan');
        addCount[ch]--;
      }
      el.appendChild(span);
    }
  }

  function animateOut(el, cb) {
    el.querySelectorAll('.s-letter').forEach((s, i) => {
      setTimeout(() => s.classList.add('out'), i * 40);
    });
    setTimeout(cb, el.querySelectorAll('.s-letter').length * 40 + 200);
  }
  function animateIn(el) {
    el.querySelectorAll('.s-letter').forEach((s, i) => {
      s.classList.add('in');
      setTimeout(() => s.classList.remove('in'), 50 + i * 55);
    });
  }

  function showPair(i) {
    const [from, to] = PAIRS[i];
    const added = highlightTaiwan(from, to);
    animateOut(fromEl, () => { renderWord(fromEl, from, {}); animateIn(fromEl); });
    animateOut(toEl,   () => { renderWord(toEl,   to,   added); animateIn(toEl); });
  }

  const [f0, t0] = PAIRS[0];
  renderWord(fromEl, f0, {});
  renderWord(toEl, t0, highlightTaiwan(f0, t0));

  nextBtn.addEventListener('click', () => {
    idx = (idx + 1) % PAIRS.length;
    showPair(idx);
  });
}

/* ─── CHAOS CANVAS ────────────────────────────────── */
function initChaos() {
  const canvas = document.getElementById('chaosCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [], animId;
  const COLORS = ['#B23A3A','#E8721C','#F5C842','#3A7D44','#2F5D9F','#7B4F9E','#F0EDE6'];

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  class Particle {
    constructor() { this.reset(true); }
    reset(initial = false) {
      this.x  = Math.random() * W;
      this.y  = initial ? Math.random() * H : H + 10;
      this.vx = (Math.random() - 0.5) * 0.6;
      this.vy = -(Math.random() * 1.2 + 0.4);
      this.r  = Math.random() * 2.5 + 0.5;
      this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.alpha = Math.random() * 0.6 + 0.2;
      this.life  = 0;
      this.maxLife = Math.random() * 200 + 100;
    }
    update() {
      this.x += this.vx; this.y += this.vy; this.life++;
      this.vx += (Math.random() - 0.5) * 0.04;
      if (this.y < -10 || this.life > this.maxLife) this.reset();
    }
    draw() {
      ctx.globalAlpha = this.alpha * (1 - this.life / this.maxLife);
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  for (let i = 0; i < 180; i++) particles.push(new Particle());

  const chaosSection = document.getElementById('s-chaos');
  let visible = false;
  const vObs = new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (visible) { resize(); if (!animId) loop(); }
  }, { threshold: 0.1 });
  if (chaosSection) vObs.observe(chaosSection);

  function loop() {
    if (!visible) { animId = null; return; }
    animId = requestAnimationFrame(loop);
    ctx.clearRect(0, 0, W, H);
    ctx.globalAlpha = 1;
    particles.forEach(p => { p.update(); p.draw(); });
    ctx.globalAlpha = 1;
  }
}

/* ─── LIGHTBOX ───────────────────────────────────── */
function initLightbox() {
  const lb      = document.getElementById('lightbox');
  const lbImg   = document.getElementById('lbImg');
  const lbClose = document.getElementById('lbClose');
  const lbBd    = document.getElementById('lbBackdrop');
  if (!lb) return;

  document.querySelectorAll('[data-lightbox]').forEach(el => {
    el.addEventListener('click', () => {
      lbImg.src = el.dataset.lightbox;
      lb.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });
  function closeLb() { lb.classList.remove('open'); document.body.style.overflow = ''; }
  if (lbClose) lbClose.addEventListener('click', closeLb);
  if (lbBd)    lbBd.addEventListener('click', closeLb);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLb(); });
}

/* ─── BANQUET ─────────────────────────────────────── */
function initBanquet() {
  const viewport = document.getElementById('banquetViewport');
  const rotateG  = document.getElementById('banquetRotate');
  const foodEls  = document.querySelectorAll('.banquet-food');
  if (!viewport || !rotateG || !foodEls.length) return;

  const FOOD_DATA = {
    oyster:     { zh: '蚵仔煎',  en: 'Oyster Omelette',        desc: '以地瓜粉、雞蛋與新鮮蚵仔煎製而成，淋上特調甜辣醬，是台灣夜市最具代表性的小吃。',       wiki: 'Oyster_omelette',         fallback: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Orh-Nee-Jian-Oyster-Omelette.jpg/640px-Orh-Nee-Jian-Oyster-Omelette.jpg' },
    chicken:    { zh: '鹹酥雞',  en: 'Taiwanese Fried Chicken', desc: '香酥的雞塊與九層塔一同入鍋炸製，鹹香酥脆，是台灣宵夜文化的靈魂小吃。',               wiki: 'Taiwanese_fried_chicken', fallback: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Yansuj%C3%AD.jpg/640px-Yansuj%C3%AD.jpg' },
    guabao:     { zh: '割包',    en: 'Gua Bao',                 desc: '鬆軟白麵包夾入滷製五花肉、花生粉與酸菜，軟嫩酥脆並存，被譽為「台灣漢堡」。',           wiki: 'Gua_bao',                 fallback: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Gua_bao_2.jpg/640px-Gua_bao_2.jpg' },
    luroufan:   { zh: '滷肉飯',  en: 'Lu Rou Fan',              desc: '肥瘦相間的豬五花以醬油、米酒、冰糖慢燉後澆在白飯上，是台灣家常滋味的最高代表。',       wiki: 'Lu_rou_fan',              fallback: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Luroufan.jpg/640px-Luroufan.jpg' },
    beefnoodle: { zh: '牛肉麵',  en: 'Beef Noodle Soup',        desc: '以紅燒湯底燉煮軟爛牛腱，搭配彈牙麵條，是台灣最驕傲的國民美食，每年舉辦比賽選出最佳口味。', wiki: 'Beef_noodle_soup',        fallback: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Taiwan_beef_noodle_soup.jpg/640px-Taiwan_beef_noodle_soup.jpg', imgOverride: 'https://tokyo-kitchen.icook.network/uploads/recipe/cover/338564/8869cd181686929d.jpg' },
    bubbletea:  { zh: '珍珠奶茶', en: 'Bubble Tea',             desc: '1980年代發源於台灣台中，Q彈珍珠搭配奶茶，是台灣對世界飲料文化最大的貢獻。',           wiki: 'Bubble_tea',              fallback: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Bubble_tea_at_Fantaasia_2015.jpg/640px-Bubble_tea_at_Fantaasia_2015.jpg', imgOverride: 'https://doqvf81n9htmm.cloudfront.net/data/crop_article/91169/shutterstock_1271869054.jpg_1140x855.jpg' },
    miansian:   { zh: '大腸麵線', en: 'Oyster Vermicelli',      desc: '以豬大腸與蚵仔燉入勾芡的麵線湯中，口感滑順，是廟會與夜市中最撫慰人心的平民小吃。',   wiki: 'Oyster_vermicelli',       fallback: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Mian_xian.jpg/640px-Mian_xian.jpg' },
    coffin:     { zh: '棺材板',  en: 'Coffin Bread',            desc: '發源於台南，以厚片土司挖空後填入濃郁奶油燉料，外酥內滑，名稱怪異卻深受喜愛。',       wiki: 'Coffin_bread',            fallback: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Coffin_bread.jpg/640px-Coffin_bread.jpg' },
    stinkytofu: { zh: '臭豆腐',  en: 'Stinky Tofu',             desc: '炸至金黃酥脆後配上酸辣泡菜，「聞起來臭，吃起來香」，是台灣夜市最具挑戰性的美食。',   wiki: 'Stinky_tofu',             fallback: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Stinky_tofu_in_Jiufen.jpg/640px-Stinky_tofu_in_Jiufen.jpg' },
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
    bpName.textContent    = `${food.zh}　${food.en}`;
    bpDesc.textContent    = food.desc;
    bpPhoto.style.opacity = '0';
    bpPhoto.src           = '';
    popup.classList.add('open');
    document.body.style.overflow = 'hidden';

    // 0. Direct override — skip all API lookups
    if (food.imgOverride) { showPhoto(food.imgOverride); return; }

    // 1. Wikipedia REST summary API
    try {
      const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(food.wiki)}`);
      if (res.ok) {
        const data = await res.json();
        const src  = data?.thumbnail?.source || data?.originalimage?.source;
        if (src) { showPhoto(src); return; }
      }
    } catch (_) {}

    // 2. Wikipedia action API
    try {
      const title = encodeURIComponent(food.wiki.replace(/_/g, ' '));
      const res  = await fetch(`https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&titles=${title}&piprop=thumbnail&pithumbsize=640&redirects=1&format=json&origin=*`);
      const data = await res.json();
      const page = data?.query?.pages ? Object.values(data.query.pages)[0] : null;
      const src  = page?.thumbnail?.source;
      if (src) { showPhoto(src); return; }
    } catch (_) {}

    // 3. Wikimedia Commons search (try English name, then wiki title)
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

    // 4. Hardcoded last-resort fallback
    if (food.fallback) showPhoto(food.fallback);
  }

  function closePopup() {
    if (!popup) return;
    popup.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => { if (bpPhoto) bpPhoto.src = ''; }, 400);
  }

  if (bpClose) bpClose.addEventListener('click', closePopup);
  if (bpBd)    bpBd.addEventListener('click', closePopup);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closePopup(); });

  /* ── rotation ── */
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

  function onDown(e) {
    const tgt = e.target.closest('.banquet-food');
    if (tgt) return;
    dragging = true;
    angVel   = 0;
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    const p = svgPoint(e);
    lastX = p.x; lastY = p.y;
    e.preventDefault();
  }
  function onMove(e) {
    if (!dragging) return;
    const p  = svgPoint(e);
    const dx = p.x - lastX;
    lastX = p.x; lastY = p.y;
    angVel = -dx * 0.003;
    angle += angVel;
    applyRotation();
    e.preventDefault();
  }
  function onUp() {
    if (!dragging) return;
    dragging = false;
    if (Math.abs(angVel) > 0.0001) rafId = requestAnimationFrame(animate);
  }

  viewport.addEventListener('mousedown',  onDown,  { passive: false });
  viewport.addEventListener('touchstart', onDown,  { passive: false });
  window.addEventListener ('mousemove',   onMove,  { passive: false });
  window.addEventListener ('touchmove',   onMove,  { passive: false });
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

/* ─── SPOTLIGHT ───────────────────────────────────── */
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