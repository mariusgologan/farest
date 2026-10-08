/* Window light. A soft pane-shaped patch of sun (or moon) and a fan of faint rays fall across the page; their angle and
   warmth follow the real time of day, and the rays slowly breathe as if thin cloud passed. Time can be forced from the
   appearance popover. Everything sits behind the content and is decorative. */
(() => {
  const root = document.documentElement, cfg = FE.config.sky, el = FE.$('#device'), rays = FE.$('.sky-rays');

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
      r.style.setProperty('--r-w', rnd(1.2, 5.5).toFixed(1) + 'vmin');
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
    st.setProperty('--sky-tilt', (p === null ? 12 : (0.5 - q) * -40) + 'deg');
  }

  buildRays();
  FE.sky = { apply };
  FE.store.on((st, prev, patch) => { if ('time' in patch || 'ambient' in patch) apply(); });
  setInterval(apply, cfg.refreshMs);
  apply();
})();
