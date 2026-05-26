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

  initParallax();
  initCrisis();
  initSyntax();
  initChaos();
  initLightbox();
  initBanquet();
  initSpotlight();
}

/* ─── PARALLAX ────────────────────────────────────── */
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
  const fromEl = document.getElementById('syntaxFrom');
  const toEl   = document.getElementById('syntaxTo');
  const nextBtn = document.getElementById('syntaxNext');
  if (!fromEl || !toEl || !nextBtn) return;

  const TAIWAN = new Set(['T','A','I','W','A','N']);
  const PAIRS = [
    ['PAIN',  'PAINT'],   // 痛苦→彩繪  (+T from TAIWAN)
    ['RAIN',  'TRAIN'],   // 阻礙→成長  (+T from TAIWAN)
    ['ILL',   'WILL'],    // 病弱→意志  (+W from TAIWAN)
    ['WAIT',  'AWAIT'],   // 苦等→期待  (+A from TAIWAN)
    ['WIN',   'TWIN'],    // 孤勝→並肩  (+T from TAIWAN)
    ['WAIN',  'TWAIN'],   // 重擔→二元  (+T from TAIWAN)
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
      lbImg.src = el.dataset.lightbox;
      const img = el.querySelector('img');
      if (lbCap) lbCap.textContent = img?.alt || el.dataset.caption || '';
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

/* ─── SPOTLIGHT ───────────────────────────────────── */
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