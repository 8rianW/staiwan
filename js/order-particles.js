/* Taiwan Sensuality — ORDER
   Order is not imposed. It emerges from countless acts of quiet coordination.

   Phase 0  Chaos      0 → 3s     organic brownian float
   Phase 1  Paths      3 → 6.5s   each particle moves its own way
   Phase 2  Weave      6.5 → 12s  threads interlace (茄芷袋 spirit)
   Phase 3  Form       12 → 19s   ORDER emerges — irregular, alive
   Phase 4  Dwell      19 → 24s   ORDER breathes
             19 → 19.5s  burst particles fade in  (+90% density)
             19.5→ 21s   burst holds — ORDER is unmistakable
             21 → 21.8s  burst fades out — density settles back
   Phase 5  Dissolve   24 → 28s   structure scatters back to light
   Phase 6  Becoming   28 → 32s   returning to chaos, becoming
   (loop)
*/

(function () {
  'use strict';

  const section = document.getElementById('s-order');
  const canvas  = document.getElementById('orderCanvas');
  if (!section || !canvas) return;
  const ctx = canvas.getContext('2d');

  /* ── Timing (ms) ──────────────────────────────── */
  const S = {
    paths    :  3000,
    weave    :  6500,
    form     : 12000,
    dwell    : 19000,
    dissolve : 24000,
    becoming : 28000,
    end      : 32000,
  };

  /* Burst timing relative to S.dwell */
  const B = {
    fadeIn  :   500,   // ms to reach full opacity
    hold    :  1500,   // ms at peak density
    fadeOut :   800,   // ms to fade back to 0
  };
  B.total = B.fadeIn + B.hold + B.fadeOut;  // 2800 ms

  /* ── Config ───────────────────────────────────── */
  const MOBILE      = /Mobi|Android/i.test(navigator.userAgent);
  const COUNT       = MOBILE ? 160 : 240;
  const BURST_COUNT = MOBILE ? 144 : 216;   // +90 % ≈ within 80-120 % range
  const SAMPLE      = 5;

  let W = 0, H = 0, targets = [], parts = [], bursts = [];
  let raf = null, t0 = null, active = false, cycle = 0;

  /* ── Text sampling ────────────────────────────── */
  function sampleText() {
    targets = [];
    const oc = document.createElement('canvas');
    oc.width = W; oc.height = H;
    const ox = oc.getContext('2d');
    const fs = Math.max(48, Math.min(W * 0.27, H * 0.28, 196));
    ox.font         = `300 ${fs}px 'Cormorant Garamond', Georgia, serif`;
    ox.fillStyle    = '#fff';
    ox.textAlign    = 'center';
    ox.textBaseline = 'middle';
    ox.fillText('ORDER', W * 0.5, H * 0.5);
    const px = ox.getImageData(0, 0, W, H).data;

    /* ── Pass 1: uniform base sampling across full word ── */
    for (let y = 0; y < H; y += SAMPLE)
      for (let x = 0; x < W; x += SAMPLE)
        if (px[(y * W + x) * 4 + 3] > 100)
          targets.push({ x, y });

    /* ── Pass 2: finer grid for O / R / D / E — thin strokes undersampled at step 5
         O: circular arc  R: leg diagonal  D: right arc  E: three horizontal bars
         step=3 captures strokes that fall between SAMPLE=5 grid lines
         alpha threshold 80 catches anti-aliased stroke edges too            ── */
    const fullW = ox.measureText('ORDER').width;
    let lx = W * 0.5 - fullW * 0.5;
    const lBounds = [];
    for (const ch of 'ORDER') {
      const cw = ox.measureText(ch).width;
      lBounds.push([Math.floor(lx) - 2, Math.ceil(lx + cw) + 2]);
      lx += cw;
    }
    /* O=0, R=1, D=2, E=3, R=4 */
    for (const i of [0, 1, 2, 3, 4]) {
      const [x0, x1] = lBounds[i];
      for (let y = 0; y < H; y += 3)
        for (let x = Math.max(0, x0); x <= Math.min(W - 1, x1); x += 3)
          if (px[(y * W + x) * 4 + 3] > 80)
            targets.push({ x, y });
    }
  }

  /* ── Resize ───────────────────────────────────── */
  function resize() {
    W = canvas.width  = section.offsetWidth  || window.innerWidth;
    H = canvas.height = section.offsetHeight || window.innerHeight;
    sampleText();
    if (parts.length) { assignTargets(); assignLanes(); }
    if (bursts.length)  assignBurstTargets();
  }

  /* ── Main particle ────────────────────────────── */
  function make(idx) {
    return {
      x    : Math.random() * W,
      y    : Math.random() * H,
      vx   : (Math.random() - 0.5) * 0.5,
      vy   : (Math.random() - 0.5) * 0.5,
      r    : 0.5 + Math.random() * 0.85,
      a    : 0.11 + Math.random() * 0.28,
      tx   : 0, ty : 0,   // ORDER target + jitter
      sx   : 0, sy : 0,   // dissolve scatter
      lx   : 0, ly : 0,   // lane (set by assignLanes)
      freq : 0.20 + Math.random() * 0.34,
      amp  : 26  + Math.random() * 56,
      ph   : Math.random() * Math.PI * 2,
      bO   : Math.random() * Math.PI * 2,
      jx   : (Math.random() - 0.5) * 5.5,
      jy   : (Math.random() - 0.5) * 5.5,
      warp : idx % 2 === 0,
      irr  : Math.random() < 0.05,
    };
  }

  /* ── Burst particle ───────────────────────────── */
  function makeBurst() {
    return {
      x  : 0, y : 0,
      r  : 0.45 + Math.random() * 0.70,
      a  : 0.10 + Math.random() * 0.24,
      tx : 0, ty : 0,
      jx : (Math.random() - 0.5) * 3.5,
      jy : (Math.random() - 0.5) * 3.5,
      bO : Math.random() * Math.PI * 2,
    };
  }

  function assignTargets() {
    if (!targets.length) return;
    parts.forEach(p => {
      const t = targets[Math.floor(Math.random() * targets.length)];
      p.tx = t.x + p.jx;
      p.ty = t.y + p.jy;
    });
  }

  function assignBurstTargets() {
    if (!targets.length) return;
    bursts.forEach(p => {
      const t = targets[Math.floor(Math.random() * targets.length)];
      p.tx = t.x + p.jx;
      p.ty = t.y + p.jy;
      /* pre-position invisibly so first fade-in has zero jump */
      p.x  = p.tx;
      p.y  = p.ty;
    });
  }

  function assignLanes() {
    const warps = parts.filter(p => p.warp);
    const wefts = parts.filter(p => !p.warp);
    warps.forEach((p, i) => {
      p.lx = W * 0.08 + (i / Math.max(warps.length - 1, 1)) * W * 0.84;
      p.ly = H * 0.5;
    });
    wefts.forEach((p, i) => {
      p.lx = W * 0.5;
      p.ly = H * 0.08 + (i / Math.max(wefts.length - 1, 1)) * H * 0.84;
    });
  }

  function scatter() {
    parts.forEach(p => {
      p.sx = Math.random() * W;
      p.sy = Math.random() * H;
    });
  }

  function resetPositions() {
    parts.forEach(p => {
      p.x  = Math.random() * W;
      p.y  = Math.random() * H;
      p.vx = (Math.random() - 0.5) * 0.5;
      p.vy = (Math.random() - 0.5) * 0.5;
    });
    /* snap bursts back to targets silently for next cycle */
    bursts.forEach(p => { p.x = p.tx; p.y = p.ty; });
  }

  function init() {
    resize();
    parts  = Array.from({ length: COUNT },       (_, i) => make(i));
    bursts = Array.from({ length: BURST_COUNT },  ()     => makeBurst());
    assignTargets();
    assignLanes();
    assignBurstTargets();
    scatter();
  }

  /* ── Easing ───────────────────────────────────── */
  const ease = t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

  /* ── Per-particle update ──────────────────────── */
  function step(p, el, tS) {

    if (el < S.paths) {
      // Chaos: slow organic brownian motion
      p.vx += (Math.random() - 0.5) * 0.042;
      p.vy += (Math.random() - 0.5) * 0.042;
      p.vx  = Math.max(-0.82, Math.min(0.82, p.vx * 0.979));
      p.vy  = Math.max(-0.82, Math.min(0.82, p.vy * 0.979));
      p.x  += p.vx; p.y += p.vy;
      if (p.x < 4)     p.vx += 0.09;
      if (p.x > W - 4) p.vx -= 0.09;
      if (p.y < 4)     p.vy += 0.09;
      if (p.y > H - 4) p.vy -= 0.09;

    } else if (el < S.weave) {
      // Paths: warp streams vertically, weft streams horizontally
      // Each particle has its own sine path — no central control
      if (p.warp) {
        const tx = p.lx;
        const ty = p.ly + Math.sin(tS * p.freq + p.ph) * H * 0.38;
        p.x += (tx - p.x) * 0.009;
        p.y += (ty - p.y) * 0.009;
      } else {
        const tx = p.lx + Math.cos(tS * p.freq + p.ph) * W * 0.38;
        const ty = p.ly;
        p.x += (tx - p.x) * 0.009;
        p.y += (ty - p.y) * 0.009;
      }

    } else if (el < S.form) {
      // Weave: converging toward ORDER targets with woven offsets
      // Warp oscillates vertically; weft oscillates horizontally
      // Creates interlaced 茄芷袋 texture as they approach
      const fp = Math.min((el - S.weave) / (S.form - S.weave), 1);
      const d  = 1 - fp * 0.42;
      if (p.warp) {
        const wx = Math.sin(tS * p.freq * 0.28 + p.ph) * 6  * d;
        const wy = Math.sin(tS * p.freq         + p.ph) * 36 * d;
        p.x += (p.tx + wx - p.x) * 0.011;
        p.y += (p.ty + wy - p.y) * 0.011;
      } else {
        const wx = Math.cos(tS * p.freq         + p.ph) * 36 * d;
        const wy = Math.cos(tS * p.freq * 0.28 + p.ph) * 6  * d;
        p.x += (p.tx + wx - p.x) * 0.011;
        p.y += (p.ty + wy - p.y) * 0.011;
      }

    } else if (el < S.dwell) {
      // Form: ORDER converges — irregular particles stay slightly alive
      const fp  = Math.min((el - S.form) / (S.dwell - S.form), 1);
      const spd = 0.016 + ease(fp) * 0.046;
      if (!p.irr) {
        p.x += (p.tx - p.x) * spd;
        p.y += (p.ty - p.y) * spd;
      } else {
        const d = 15 * (1 - fp * 0.70);
        p.x += (p.tx + Math.sin(tS * 0.88 + p.bO) * d - p.x) * 0.022;
        p.y += (p.ty + Math.cos(tS * 0.66 + p.bO) * d - p.y) * 0.022;
      }

    } else if (el < S.dissolve) {
      // Dwell: ORDER breathes, barely moves — it is alive
      const j = 1.6;
      p.x += (p.tx + Math.sin(tS * 0.34 + p.bO) * j - p.x) * 0.034;
      p.y += (p.ty + Math.cos(tS * 0.28 + p.bO) * j - p.y) * 0.034;

    } else if (el < S.becoming) {
      // Dissolve: scatter back to light — ORDER releases
      const fp  = Math.min((el - S.dissolve) / (S.becoming - S.dissolve), 1);
      const spd = 0.005 + ease(fp) * 0.025;
      p.x += (p.sx - p.x) * spd;
      p.y += (p.sy - p.y) * spd;

    } else {
      // Becoming: gentle organic float — back to the beginning
      p.vx += (Math.random() - 0.5) * 0.028;
      p.vy += (Math.random() - 0.5) * 0.028;
      p.vx  = Math.max(-0.62, Math.min(0.62, p.vx * 0.982));
      p.vy  = Math.max(-0.62, Math.min(0.62, p.vy * 0.982));
      p.x  += p.vx; p.y += p.vy;
      if (p.x < 4)     p.vx += 0.07;
      if (p.x > W - 4) p.vx -= 0.07;
      if (p.y < 4)     p.vy += 0.07;
      if (p.y > H - 4) p.vy -= 0.07;
    }
  }

  /* ── Per-particle draw ────────────────────────── */
  function paint(p, el, tS) {
    const breathe = 0.84 + Math.sin(tS * 0.40 + p.bO) * 0.16;
    const fade    = el < 700 ? el / 700 : 1;
    ctx.globalAlpha = Math.max(0, Math.min(1, p.a * breathe * fade));
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  }

  /* ── Burst alpha curve ────────────────────────── */
  function burstFrac(el) {
    const t = el - S.dwell;
    if (t < 0 || t >= B.total) return 0;
    if (t < B.fadeIn) return ease(t / B.fadeIn);
    if (t < B.fadeIn + B.hold) return 1;
    return ease(1 - (t - B.fadeIn - B.hold) / B.fadeOut);
  }

  /* ── Burst step + draw ────────────────────────── */
  function stepPaintBurst(p, frac, tS) {
    /* micro breathing — matches dwell phase feel */
    const j = 1.4;
    p.x += (p.tx + Math.sin(tS * 0.34 + p.bO) * j - p.x) * 0.034;
    p.y += (p.ty + Math.cos(tS * 0.28 + p.bO) * j - p.y) * 0.034;

    const breathe = 0.82 + Math.sin(tS * 0.40 + p.bO) * 0.18;
    ctx.globalAlpha = Math.max(0, Math.min(1, p.a * breathe * frac));
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  }

  /* ── UI helpers ───────────────────────────────── */
  const setVis = (id, v) => {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('visible', v);
  };

  /* ── Render loop ──────────────────────────────── */
  function tick(now) {
    if (!t0) t0 = now;

    const total    = now - t0;
    const newCycle = Math.floor(total / S.end);
    if (newCycle > cycle) {
      cycle = newCycle;
      resetPositions();
      scatter();
    }

    const el = total % S.end;
    const tS = el / 1000;

    setVis('orderCaption',  el >= S.dwell + 1400  && el < S.dissolve);
    setVis('orderBecoming', el >= S.becoming + 1600);

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#ffffff';

    /* main particles */
    parts.forEach(p => { step(p, el, tS); paint(p, el, tS); });

    /* burst overlay — extra density at ORDER completion */
    const bf = burstFrac(el);
    if (bf > 0) {
      bursts.forEach(p => stepPaintBurst(p, bf, tS));
    } else {
      /* silently keep burst particles at their targets while invisible */
      bursts.forEach(p => { p.x = p.tx; p.y = p.ty; });
    }

    ctx.globalAlpha = 1;

    raf = requestAnimationFrame(tick);
  }

  /* ── Controls ─────────────────────────────────── */
  function start() {
    if (raf || !parts.length) return;
    t0 = null; cycle = 0;
    setVis('orderCaption',  false);
    setVis('orderBecoming', false);
    raf = requestAnimationFrame(tick);
  }

  function stop() {
    if (raf) { cancelAnimationFrame(raf); raf = null; }
  }

  /* ── Observer ─────────────────────────────────── */
  new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting && !active) {
        active = true;
        if (parts.length) start();
      } else if (!e.isIntersecting && active) {
        active = false;
        stop();
        ctx.clearRect(0, 0, W, H);
        setVis('orderCaption',  false);
        setVis('orderBecoming', false);
      }
    });
  }, { threshold: 0.35 }).observe(section);

  /* ── Resize handler ───────────────────────────── */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resize(); assignTargets(); assignLanes(); scatter();
    }, 200);
  });

  /* ── Bootstrap ────────────────────────────────── */
  function go() { init(); if (active) start(); }

  if (document.fonts?.ready) {
    document.fonts.ready.then(go).catch(go);
  } else {
    setTimeout(go, 500);
  }
})();