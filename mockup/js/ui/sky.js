/* Window light. A soft pane-shaped patch of sun (or moon) falls across the page; its angle and warmth follow the real
   time of day, summer adds a warm bloom and drifting motes, winter adds frosted edges and slow snow behind the glass.
   Time and season can be forced from the appearance popover. All of it sits behind the content and is decorative. */
(() => {
  const root = document.documentElement, cfg = FE.config.sky, el = FE.$('.sky'), cv = FE.$('.sky-fx', el), cx = cv.getContext('2d');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');

  const dayOfYear = d => Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 864e5);
  /* where is the sun? p runs 0 (sunrise) to 1 (sunset); null at night */
  function sun(now, force) {
    const f = Math.cos(2 * Math.PI * (dayOfYear(now) - cfg.midsummerDay) / 365), h = now.getHours() + now.getMinutes() / 60;
    const rise = cfg.sunrise.base - f * cfg.sunrise.swing, set = cfg.sunset.base + f * cfg.sunset.swing;
    if (force === 'night') return null;
    if (force === 'day') return h > rise && h < set ? (h - rise) / (set - rise) : 0.5;
    return h > rise && h < set ? (h - rise) / (set - rise) : null;
  }
  const seasonOf = (now, force) => force !== 'auto' ? force : cfg.summerMonths.includes(now.getMonth()) ? 'summer' : cfg.winterMonths.includes(now.getMonth()) ? 'winter' : 'mild';

  function apply() {
    const s = FE.store, now = new Date(), p = sun(now, s.get('time')), season = seasonOf(now, s.get('season'));
    root.dataset.sky = s.get('ambient') === 'off' ? 'off' : p === null ? 'night' : 'day';
    root.dataset.season = season;
    /* low sun: long, slanted light and warm; high sun: short, upright, white */
    const q = p === null ? 0.5 : p, high = Math.sin(Math.PI * q);
    const st = el.style;
    st.setProperty('--sky-x', (p === null ? 62 : 8 + q * 78) + '%');
    st.setProperty('--sky-skew', (p === null ? -10 : (0.5 - q) * 46) + 'deg');
    st.setProperty('--sky-len', (p === null ? 1.0 : 1.5 - high * 0.55).toFixed(2));
    st.setProperty('--sky-warm', (p === null ? 0 : 1 - high).toFixed(2));
    st.setProperty('--sky-power', (p === null ? 0.55 : 0.5 + high * 0.5).toFixed(2));
    seed();
  }

  /* particles */
  let parts = [], raf = 0, kind = null;
  const rnd = (a, b) => a + Math.random() * (b - a);
  function size() {
    const r = el.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2);
    cv.width = Math.max(1, r.width * d); cv.height = Math.max(1, r.height * d); cv.style.width = r.width + 'px'; cv.style.height = r.height + 'px';
    cx.setTransform(d, 0, 0, d, 0, 0);
  }
  function seed() {
    const season = root.dataset.season, off = root.dataset.sky === 'off';
    kind = off ? null : season === 'winter' ? 'snow' : season === 'summer' ? 'motes' : null;
    cancelAnimationFrame(raf); size(); parts = [];
    const w = cv.clientWidth, h = cv.clientHeight;
    if (!kind) return cx.clearRect(0, 0, w, h);
    const c = cfg[kind], n = Math.min(c.max, Math.round(w / 1000 * c.perK));
    for (let i = 0; i < n; i++) parts.push(kind === 'snow'
      ? { x: rnd(0, w), y: rnd(0, h), r: rnd(1, 3.4), v: rnd(.12, .45), a: rnd(.35, .9), ph: rnd(0, 6.28), sw: rnd(8, 26) }
      : { x: rnd(0, w), y: rnd(0, h), r: rnd(1.5, 5), v: rnd(.03, .14), a: rnd(.12, .4), ph: rnd(0, 6.28), sw: rnd(10, 30) });
    draw(0);
    if (!reduce.matches) raf = requestAnimationFrame(loop);
  }
  function draw(t) {
    const w = cv.clientWidth, h = cv.clientHeight, night = root.dataset.sky === 'night', snow = kind === 'snow';
    cx.clearRect(0, 0, w, h);
    for (const p of parts) {
      const x = p.x + Math.sin(t / 2400 + p.ph) * p.sw, y = p.y;
      const g = cx.createRadialGradient(x, y, 0, x, y, p.r * (snow ? 1.6 : 3));
      const col = snow ? '255,255,255' : night ? '190,210,255' : '255,214,150';
      g.addColorStop(0, `rgba(${col},${p.a})`); g.addColorStop(1, `rgba(${col},0)`);
      cx.fillStyle = g; cx.beginPath(); cx.arc(x, y, p.r * (snow ? 1.6 : 3), 0, 6.283); cx.fill();
    }
  }
  let last = 0;
  function loop(t) {
    const dt = Math.min(48, t - last || 16); last = t;
    const w = cv.clientWidth, h = cv.clientHeight;
    for (const p of parts) {
      p.y += (kind === 'snow' ? p.v : -p.v) * dt * .06;
      if (kind === 'snow' && p.y > h + 8) { p.y = -8; p.x = rnd(0, w); }
      if (kind === 'motes' && p.y < -8) { p.y = h + 8; p.x = rnd(0, w); }
    }
    draw(t);
    if (!document.hidden) raf = requestAnimationFrame(loop);
  }
  document.addEventListener('visibilitychange', () => { if (!document.hidden && kind && !reduce.matches) { cancelAnimationFrame(raf); raf = requestAnimationFrame(loop); } });
  new ResizeObserver(() => { clearTimeout(size.t); size.t = setTimeout(seed, 200); }).observe(el);
  reduce.addEventListener('change', seed);

  FE.sky = { apply };
  FE.store.on((st, prev, patch) => { if ('time' in patch || 'season' in patch || 'ambient' in patch) apply(); });
  setInterval(apply, cfg.refreshMs);
  apply();
})();
