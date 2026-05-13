'use strict';

/* ========== LOADER ========== */
const loader = document.getElementById('loader');
const loaderProgress = document.querySelector('.loader-progress');

window.addEventListener('load', () => {
  loaderProgress.style.width = '100%';
  setTimeout(() => {
    loader.classList.add('hidden');
    document.getElementById('hero').classList.add('loaded');
    initReveal();
  }, 1900);
});

/* ========== CUSTOM CURSOR ========== */
const cursor = document.getElementById('cursor');
const follower = document.getElementById('cursor-follower');
let cx = 0, cy = 0, fx = 0, fy = 0;

document.addEventListener('mousemove', (e) => {
  cx = e.clientX;
  cy = e.clientY;
  cursor.style.left = cx + 'px';
  cursor.style.top  = cy + 'px';
});

(function animateFollower() {
  fx += (cx - fx) * 0.12;
  fy += (cy - fy) * 0.12;
  follower.style.left = fx + 'px';
  follower.style.top  = fy + 'px';
  requestAnimationFrame(animateFollower);
})();

document.querySelectorAll('a, button, .gallery-item, .palette-item, .tag').forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
});

/* ========== NAV ========== */
const nav = document.getElementById('nav');
const toggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

toggle.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  toggle.classList.toggle('open', open);
  toggle.setAttribute('aria-expanded', open);
});

navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    toggle.classList.remove('open');
  });
});

/* ========== SCROLL REVEAL ========== */
function initReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const delay = parseFloat(el.dataset.revealDelay || 0) * 1000;
      setTimeout(() => el.classList.add('revealed'), delay);
      observer.unobserve(el);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));

  /* stagger gallery items */
  const galleryObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const items = entry.target.querySelectorAll('.gallery-item');
      items.forEach((item, i) => {
        setTimeout(() => item.classList.add('revealed'), i * 80);
      });
      galleryObserver.unobserve(entry.target);
    });
  }, { threshold: 0.05 });

  const grid = document.getElementById('galleryGrid');
  if (grid) galleryObserver.observe(grid);
}

/* ========== LIGHTBOX ========== */
const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
const lightbox = document.getElementById('lightbox');
const lbImg    = document.getElementById('lbImg');
const lbTitle  = document.getElementById('lbTitle');
const lbDesc   = document.getElementById('lbDesc');
const lbNum    = document.getElementById('lbNum');
const lbClose  = document.getElementById('lbClose');
const lbPrev   = document.getElementById('lbPrev');
const lbNext   = document.getElementById('lbNext');
const lbBg     = document.getElementById('lbBackdrop');

const galleryData = galleryItems.map(item => ({
  src:   item.querySelector('img').src,
  title: item.dataset.title || '',
  desc:  item.dataset.desc  || '',
  index: parseInt(item.dataset.index, 10)
}));

let current = 0;

function openLightbox(idx) {
  current = idx;
  renderLightbox(true);
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  lbClose.focus();
}

function closeLightbox() {
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function renderLightbox(instant) {
  const d = galleryData[current];
  if (!instant) {
    lbImg.style.opacity = '0';
    lbImg.style.transform = 'scale(0.96)';
  }
  const total = galleryData.length;
  lbNum.textContent = String(current + 1).padStart(3, '0') + ' / ' + String(total).padStart(3, '0');
  lbTitle.textContent = d.title;
  lbDesc.textContent  = d.desc;

  const img = new Image();
  img.onload = () => {
    lbImg.src = img.src;
    lbImg.alt = d.title;
    requestAnimationFrame(() => {
      lbImg.style.opacity = '1';
      lbImg.style.transform = 'scale(1)';
    });
  };
  img.src = d.src;
}

function prevItem() {
  current = (current - 1 + galleryData.length) % galleryData.length;
  renderLightbox(false);
}
function nextItem() {
  current = (current + 1) % galleryData.length;
  renderLightbox(false);
}

galleryItems.forEach(item => {
  item.addEventListener('click', () => openLightbox(parseInt(item.dataset.index, 10)));
});

lbClose.addEventListener('click', closeLightbox);
lbBg.addEventListener('click', closeLightbox);
lbPrev.addEventListener('click', prevItem);
lbNext.addEventListener('click', nextItem);

document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape')     closeLightbox();
  if (e.key === 'ArrowLeft')  prevItem();
  if (e.key === 'ArrowRight') nextItem();
});

/* touch swipe on lightbox */
let touchStartX = 0;
lightbox.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
lightbox.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(dx) > 50) dx < 0 ? nextItem() : prevItem();
}, { passive: true });

/* ========== WORD SCRAMBLE ========== */
const scrambleEl = document.getElementById('scrambleText');
const words = ['台灣性感', 'Taiwan', 'Sensuality', '感官', '土地', '溫度', '呼吸', '山海', '記憶', '自由', 'Identity'];
let wordIdx = 0;
let scrambling = false;
const pool = '台灣性感あいうえおABCDEF土山海風光∞◦·ₐ₀₁₂';

function scramble(target, done) {
  const len = target.length;
  let step = 0;
  const maxSteps = len * 9;
  const id = setInterval(() => {
    scrambleEl.textContent = target.split('').map((ch, i) => {
      if (i < Math.floor(step / 9)) return ch;
      return pool[Math.floor(Math.random() * pool.length)];
    }).join('');
    if (++step > maxSteps) {
      clearInterval(id);
      scrambleEl.textContent = target;
      scrambling = false;
      if (done) done();
    }
  }, 38);
}

function triggerScramble() {
  if (scrambling) return;
  scrambling = true;
  wordIdx = (wordIdx + 1) % words.length;
  scramble(words[wordIdx]);
}

const wordPiece = document.getElementById('wordScramble');
wordPiece.addEventListener('mousemove', triggerScramble);
wordPiece.addEventListener('touchstart', triggerScramble, { passive: true });
setInterval(triggerScramble, 3200);

/* ========== COLOR PALETTE ========== */
const paletteItems = document.querySelectorAll('.palette-item');
const paletteName  = document.getElementById('paletteName');
let activeColor = null;

paletteItems.forEach(item => {
  item.style.backgroundColor = item.dataset.color;

  item.addEventListener('click', () => {
    paletteItems.forEach(p => p.classList.remove('active'));
    item.classList.add('active');
    activeColor = item.dataset.name;
    paletteName.textContent = item.dataset.name;
    paletteName.style.color = item.dataset.color;
  });

  item.addEventListener('mouseenter', () => {
    paletteName.textContent = item.dataset.name;
    paletteName.style.color = item.dataset.color;
  });
  item.addEventListener('mouseleave', () => {
    paletteName.textContent = activeColor || '點擊感受台灣的色彩';
    if (!activeColor) paletteName.style.color = '';
  });
});

/* ========== NOISE CANVAS ========== */
const canvas = document.getElementById('noiseCanvas');
const ctx = canvas.getContext('2d');
const noiseColors = [
  [45, 74, 62],    // 山林綠
  [139, 69, 19],   // 紅土棕
  [26, 58, 92],    // 海洋藍
  [201, 168, 76],  // 稻穗金
  [123, 95, 160],  // 薰衣紫
  [200, 89, 58],   // 廟宇紅
];

function resizeCanvas() {
  const parent = canvas.parentElement;
  canvas.width  = parent.clientWidth  - 80;
  canvas.height = Math.max(150, parent.clientHeight - 120);
  drawNoise();
}

function drawNoise() {
  const w = canvas.width;
  const h = canvas.height;
  const imgData = ctx.createImageData(w, h);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const c = noiseColors[Math.floor(Math.random() * noiseColors.length)];
    const b = 0.25 + Math.random() * 0.75;
    data[i]   = c[0] * b;
    data[i+1] = c[1] * b;
    data[i+2] = c[2] * b;
    data[i+3] = 200 + Math.floor(Math.random() * 55);
  }
  ctx.putImageData(imgData, 0, 0);
}

canvas.addEventListener('click', drawNoise);
canvas.addEventListener('touchstart', drawNoise, { passive: true });
window.addEventListener('resize', resizeCanvas, { passive: true });
setTimeout(resizeCanvas, 120);

/* ========== REACTION TAGS ========== */
const tags = document.querySelectorAll('.tag');
const reactionResult = document.getElementById('reactionResult');
const responses = {
  '溫暖': '你感受到了台灣的體溫 ♡',
  '遼闊': '山與海的無邊，都是你的',
  '懷念': '那些走過的路，永遠在你心裡',
  '自由': '行走就是自由最好的詮釋',
  '連結': '人與土地，永遠相連',
  '靜謐': '在靜默中，你聽見了最深的聲音',
};

tags.forEach(tag => {
  tag.addEventListener('click', () => {
    tags.forEach(t => t.classList.remove('selected'));
    tag.classList.add('selected');
    reactionResult.style.opacity = '0';
    setTimeout(() => {
      reactionResult.textContent = responses[tag.textContent.trim()] || '';
      reactionResult.style.opacity = '1';
    }, 280);
  });
});
