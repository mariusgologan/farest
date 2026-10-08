/* Window light. A soft pane-shaped patch of sun (or moon) and a fan of faint rays fall across the page; their angle and
   warmth follow the real time of day, and the rays slowly breathe as if thin cloud passed. Time can be forced from the
   appearance popover. Everything sits behind the content and is decorative. */
(() => {
  const root = document.documentElement, cfg = FE.config.sky, el = FE.$('#device'), rays = FE.$('.sky-rays'), cv = FE.$('.sky-dust'), cx = cv.getContext('2d'), reduce = matchMedia('(prefers-reduced-motion: reduce)');

  const dayOfYear = d => Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 864e5);
  /* where is the sun? p runs 0 (sunrise) to 1 (sunset); null at night */
  function sun(now, force) {
    const f = Math.cos(2 * Math.PI * (dayOfYear(now) - cfg.midsummerDay) / 365), h = now.getHours() + now.getMinutes() / 60;
    const rise = cfg.sunrise.base - f * cfg.sunrise.swing, set = cfg.sunset.base + f * cfg.sunset.swing;
    if (force === 'night') return null;
    if (force === 'day') return h > rise && h < set ? (h - rise) / (set - rise) : 0.5;
    return h > rise && h < set ? (h - rise) / (set - rise) : null;
  }

  /* rays: thin tall strips fanned around the light source, each with its own width, strength and breathing rhythm */
  const rnd = (a, b) => a + Math.random() * (b - a);
  function buildRays() {
    const n = cfg.rays.count, [b0, b1] = cfg.rays.breathe;
    rays.innerHTML = '';
    for (let i = 0; i < n; i++) {
      const r = document.createElement('i'), k = n > 1 ? i / (n - 1) - 0.5 : 0;
      r.style.setProperty('--r-a', (k * cfg.rays.spread + rnd(-3, 3)).toFixed(1) + 'deg');
      r.style.setProperty('--r-w', rnd(...cfg.rays.width).toFixed(1) + 'vmin');
      r.style.setProperty('--r-o', rnd(.35, 1).toFixed(2));
      r.style.setProperty('--r-d', rnd(b0, b1).toFixed(1) + 's');
      r.style.setProperty('--r-s', '-' + rnd(0, b1).toFixed(1) + 's');
      rays.appendChild(r);
    }
  }

  function apply() {
    const s = FE.store, p = sun(new Date(), s.get('time'));
    root.dataset.sky = s.get('ambient') === 'off' ? 'off' : p === null ? 'night' : 'day';
    /* low sun: long, slanted light and warm; high sun: short, upright, white */
    const q = p === null ? 0.5 : p, high = Math.sin(Math.PI * q), st = el.style;
    st.setProperty('--sky-x', (p === null ? 62 : 8 + q * 78) + '%');
    st.setProperty('--sky-skew', (p === null ? -10 : (0.5 - q) * 46) + 'deg');
    st.setProperty('--sky-len', (p === null ? 1.0 : 1.5 - high * 0.55).toFixed(2));
    st.setProperty('--sky-warm', (p === null ? 0 : 1 - high).toFixed(2));
    st.setProperty('--sky-power', (p === null ? 0.55 : 0.5 + high * 0.5).toFixed(2));
    tilt = p === null ? 12 : (0.5 - q) * -40; power = p === null ? 0.55 : 0.5 + high * 0.5; srcX = p === null ? .62 : .08 + q * .78;
    st.setProperty('--sky-tilt', tilt + 'deg');
    root.style.setProperty('--glass-angle', (p === null ? 200 : 150 + (0.5 - q) * 70).toFixed(0) + 'deg');
  }

  /* live part: the fan sways on its own and leans toward the pointer; dust floats and glints only where light passes */
  let tilt = 0, power = .7, srcX = .6, lean = 0, leanTo = 0, dust = [], raf = 0, W = 0, H = 0;
  addEventListener('pointermove', e => { leanTo = e.clientX / innerWidth - .5; }, { passive: true });
  function size() {
    const r = el.getBoundingClientRect(); W = r.width; H = r.height;
    cv.width = Math.max(1, W); cv.height = Math.max(1, H);
    dust = Array.from({ length: Math.round(cfg.rays.dust * Math.min(1, W / 900 + .35)) }, () => ({ x: rnd(0, W), y: rnd(0, H), r: rnd(1, 2.8), vx: rnd(-.05, .05), vy: rnd(-.03, .09), ph: rnd(0, 6.28), sp: rnd(.4, 1.3) }));
  }
  const smooth = (a, b, x) => { const t = FE.clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  function frame(t) {
    lean += (leanTo - lean) * .04;
    const sway = Math.sin(t / 7000) * cfg.rays.sway + Math.sin(t / 2900) * cfg.rays.sway * .35 + lean * cfg.rays.follow;
    rays.style.setProperty('--sky-sway', sway.toFixed(2) + 'deg');
    cx.clearRect(0, 0, W, H);
    const sx = srcX * W, sy = -.06 * H, dir = (tilt + sway) * Math.PI / 180, half = cfg.rays.spread / 2 * Math.PI / 180;
    const night = root.dataset.sky === 'night', dark = root.dataset.theme === 'dark', col = night ? '190,210,255' : dark ? '255,244,220' : '255,190,100';
    for (const d of dust) {
      d.x += d.vx + Math.sin(t / 3000 * d.sp + d.ph) * .05; d.y += d.vy;
      if (d.y > H + 4) { d.y = -4; d.x = rnd(0, W); } if (d.x < -4) d.x = W + 4; if (d.x > W + 4) d.x = -4;
      /* angle from the light source, measured from straight down (the rays hang downwards) */
      const dx = d.x - sx, dy = d.y - sy, a = Math.atan2(dx, dy) - (-dir) , dist = Math.hypot(dx, dy);
      const inside = smooth(half, half * .35, Math.abs(Math.atan2(dx, dy) + dir)) * smooth(Math.max(W, H) * 1.1, Math.max(W, H) * .3, dist);
      if (inside < .02) continue;
      const tw = .55 + .45 * Math.sin(t / 900 * d.sp + d.ph);
      cx.fillStyle = `rgba(${col},${(inside * tw * power * (dark || night ? .6 : .5)).toFixed(3)})`;
      cx.beginPath(); cx.arc(d.x, d.y, d.r, 0, 6.283); cx.fill();
    }
    if (!document.hidden && !reduce.matches) raf = requestAnimationFrame(frame);
  }
  const start = () => { cancelAnimationFrame(raf); size(); raf = requestAnimationFrame(frame); };
  new ResizeObserver(() => { clearTimeout(start.t); start.t = setTimeout(start, 200); }).observe(el);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) start(); });
  reduce.addEventListener('change', start);

  /* glass glint follows the pointer inside the card it hovers */
  document.addEventListener('pointermove', e => {
    const g = e.target.closest?.('.acrylic'); if (!g) return;
    const r = g.getBoundingClientRect(); g.style.setProperty('--mx', (e.clientX - r.left) + 'px'); g.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }, { passive: true });

  buildRays(); start();
  FE.sky = { apply };
  FE.store.on((st, prev, patch) => { if ('time' in patch || 'ambient' in patch) apply(); });
  setInterval(apply, cfg.refreshMs);
  apply();
})();
