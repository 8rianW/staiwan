/* Taiwan Sensuality — ORDER section particle animation
   Three phases: Chaos → Weave (茄芷袋) → Form "ORDER"   */

(function () {
  'use strict';

  const section = document.getElementById('s-order');
  const canvas  = document.getElementById('orderCanvas');
  if (!section || !canvas) return;
  const ctx = canvas.getContext('2d');

  // ─── Config ─────────────────────────────────────────
  const COUNT    = /Mobi|Android/i.test(navigator.userAgent) ? 150 : 220;
  const IREG_N   = Math.floor(COUNT * 0.05);
  const T_CHAOS  = 2600;  // ms
  const T_WEAVE  = 3200;  // ms
  const T_FORM   = 4000;  // ms
  const SAMPLE   = 5;     // pixel sample step

  // ─── State ──────────────────────────────────────────
  let W = 0, H = 0, targets = [];
  let parts = [], raf = null, t0 = null, active = false;

  // ─── Resize & sample ────────────────────────────────
  function resize() {
    W = canvas.width  = section.offsetWidth  || window.innerWidth;
    H = canvas.height = section.offsetHeight || window.innerHeight;
    targets = [];
    const oc = document.createElement('canvas');
    oc.width = W; oc.height = H;
    const ox = oc.getContext('2d');
    const fs = Math.max(56, Math.min(W * 0.28, H * 0.30, 210));
    ox.font         = `300 ${fs}px 'Cormorant Garamond', Georgia, serif`;
    ox.fillStyle    = '#fff';
    ox.textAlign    = 'center';
    ox.textBaseline = 'middle';
    ox.fillText('ORDER', W * 0.5, H * 0.5);
    const px = ox.getImageData(0, 0, W, H).data;
    for (let y = 0; y < H; y += SAMPLE) {
      for (let x = 0; x < W; x += SAMPLE) {
        if (px[(y * W + x) * 4 + 3] > 100) targets.push(x, y);
      }
    }
  }

  // ─── Particle factory ───────────────────────────────
  function make(idx) {
    return {
      x  : Math.random() * W,
      y  : Math.random() * H,
      vx : (Math.random() - .5) * .55,
      vy : (Math.random() - .5) * .55,
      r  : .7 + Math.random() * 1.3,
      a  : .20 + Math.random() * .44,
      tx : Math.random() * W,
      ty : Math.random() * H,
      bO : Math.random() * Math.PI * 2,
      pO : Math.random() * Math.PI * 2,
      wf : .32 + Math.random() * .68,
      wX : 22  + Math.random() * 44,
      wY : 18  + Math.random() * 34,
      wp : idx % 2 === 0,
      ir : idx < IREG_N
    };
  }

  function assignTargets() {
    if (!targets.length) return;
    const n = targets.length >> 1;
    parts.forEach(p => {
      const i = Math.floor(Math.random() * n) * 2;
      p.tx = targets[i];
      p.ty = targets[i + 1];
    });
  }

  function init() {
    resize();
    parts = Array.from({ length: COUNT }, (_, i) => make(i));
    assignTargets();
  }

  function resetPositions() {
    parts.forEach(p => {
      p.x  = Math.random() * W;
      p.y  = Math.random() * H;
      p.vx = (Math.random() - .5) * .55;
      p.vy = (Math.random() - .5) * .55;
    });
  }

  // ─── Per-particle update ─────────────────────────────
  function step(p, ts, phase, fp) {
    if (phase === 0) {
      p.vx += (Math.random() - .5) * .06;
      p.vy += (Math.random() - .5) * .06;
      p.vx = Math.max(-1.1, Math.min(1.1, p.vx * .97));
      p.vy = Math.max(-1.1, Math.min(1.1, p.vy * .97));
      p.x  += p.vx;  p.y += p.vy;
      if (p.x < 6)     p.vx += .09;
      if (p.x > W - 6) p.vx -= .09;
      if (p.y < 6)     p.vy += .09;
      if (p.y > H - 6) p.vy -= .09;
    } else if (phase === 1) {
      let wx, wy;
      if (p.wp) {
        wx = Math.sin(ts * p.wf * .38 + p.pO) * p.wX * .22;
        wy = Math.sin(ts * p.wf        + p.pO) * p.wY;
      } else {
        wx = Math.sin(ts * p.wf        + p.pO) * p.wX;
        wy = Math.cos(ts * p.wf * .38 + p.pO) * p.wY * .22;
      }
      p.x += (p.tx + wx - p.x) * .011;
      p.y += (p.ty + wy - p.y) * .011;
    } else {
      const spd = .024 + Math.min(fp, 1) * .048;
      if (!p.ir) {
        p.x += (p.tx - p.x) * spd;
        p.y += (p.ty - p.y) * spd;
      } else {
        const drift = 13 * (1 - Math.min(fp, 1) * .62);
        p.x += (p.tx + Math.sin(ts * .82 + p.pO) * drift - p.x) * .022;
        p.y += (p.ty + Math.cos(ts * .60 + p.pO) * drift - p.y) * .022;
      }
    }
  }

  // ─── Per-particle draw ───────────────────────────────
  function paint(p, ts) {
    const b = .83 + Math.sin(ts * .44 + p.bO) * .17;
    ctx.globalAlpha = Math.max(0, Math.min(1, p.a * b));
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r * (.92 + b * .08), 0, Math.PI * 2);
    ctx.fill();
  }

  // ─── Render loop ──────────────────────────────────────
  function tick(ts) {
    if (!t0) t0 = ts;
    const el = ts - t0, tS = el / 1000;

    let phase, fp = 0;
    if      (el < T_CHAOS)             phase = 0;
    else if (el < T_CHAOS + T_WEAVE)   phase = 1;
    else {
      phase = 2;
      fp    = (el - T_CHAOS - T_WEAVE) / T_FORM;
    }

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#ffffff';
    parts.forEach(p => { step(p, tS, phase, fp); paint(p, tS); });
    ctx.globalAlpha = 1;

    if (phase === 2 && fp > 0.60) {
      const cap = document.getElementById('orderCaption');
      if (cap && !cap.classList.contains('visible')) cap.classList.add('visible');
    }

    raf = requestAnimationFrame(tick);
  }

  // ─── Controls ─────────────────────────────────────────
  function start() {
    if (raf || !parts.length) return;
    t0 = null;
    resetPositions();
    document.getElementById('orderCaption')?.classList.remove('visible');
    raf = requestAnimationFrame(tick);
  }

  function stop() {
    if (raf) { cancelAnimationFrame(raf); raf = null; }
  }

  // ─── Observe section visibility ───────────────────────
  new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting && !active) {
        active = true;
        if (parts.length) start();
      } else if (!e.isIntersecting && active) {
        active = false;
        stop();
        ctx.clearRect(0, 0, W, H);
      }
    });
  }, { threshold: 0.35 }).observe(section);

  // ─── Resize handler ───────────────────────────────────
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { resize(); assignTargets(); }, 200);
  });

  // ─── Bootstrap ────────────────────────────────────────
  function go() {
    init();
    if (active) start();
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(go).catch(go);
  } else {
    setTimeout(go, 500);
  }
})();
