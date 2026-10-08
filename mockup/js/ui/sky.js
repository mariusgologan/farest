/* Window light, reduced to a soft halo behind the page. Its position and warmth follow the real time of day (sun low and warm at
   the edges of the day, high and neutral at noon, cool at night); the time can be forced from the appearance popover. */
(() => {
  const root = document.documentElement, cfg = FE.config.sky, el = FE.$('#device');

  const dayOfYear = d => Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 864e5);
  /* where is the sun? p runs 0 (sunrise) to 1 (sunset); null at night */
  function sun(now, force) {
    const f = Math.cos(2 * Math.PI * (dayOfYear(now) - cfg.midsummerDay) / 365), h = now.getHours() + now.getMinutes() / 60;
    const rise = cfg.sunrise.base - f * cfg.sunrise.swing, set = cfg.sunset.base + f * cfg.sunset.swing;
    if (force === 'night') return null;
    if (force === 'day') return h > rise && h < set ? (h - rise) / (set - rise) : 0.5;
    return h > rise && h < set ? (h - rise) / (set - rise) : null;
  }

  function apply() {
    const s = FE.store, p = sun(new Date(), s.get('time'));
    root.dataset.sky = s.get('ambient') === 'off' ? 'off' : p === null ? 'night' : 'day';
    const q = p === null ? 0.5 : p, high = Math.sin(Math.PI * q);
    el.style.setProperty('--sky-x', (p === null ? 62 : 8 + q * 78) + '%');
    el.style.setProperty('--sky-warm', (p === null ? 0 : 1 - high).toFixed(2));
  }

  FE.sky = { apply };
  FE.store.on((st, prev, patch) => { if ('time' in patch || 'ambient' in patch) apply(); });
  setInterval(apply, cfg.refreshMs);
  apply();
})();
