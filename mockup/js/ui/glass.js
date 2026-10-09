/* Edge light for glass cards. The pointer (mouse, pen or finger) lights the rim of any card within reach; the closer, the brighter.
   Writes --mx/--my (pointer inside the card) and --glint (0..1) per card; css/glass.css draws it. */
(() => {
  const reach = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--edge-reach')) || 150, itemReach = 70, items = '.navlink, .tab';
  let x = 0, y = 0, queued = false, lit = new Set();
  function paint() {
    queued = false;
    const now = new Set();
    for (const g of document.querySelectorAll('.acrylic, ' + items)) {
      const r = g.getBoundingClientRect();
      if (!r.width || r.bottom < 0 || r.top > innerHeight) continue;
      const dx = Math.max(r.left - x, 0, x - r.right), dy = Math.max(r.top - y, 0, y - r.bottom), d = Math.hypot(dx, dy);
      const rr = g.matches(items) ? itemReach : reach;
      if (d > rr) continue;
      g.style.setProperty('--mx', (x - r.left) + 'px'); g.style.setProperty('--my', (y - r.top) + 'px');
      g.style.setProperty('--glint', (1 - d / rr).toFixed(2)); g.setAttribute('data-lit', ''); now.add(g);
    }
    for (const g of lit) if (!now.has(g)) { g.style.setProperty('--glint', '0'); g.removeAttribute('data-lit'); }
    lit = now;
  }
  const move = e => { x = e.clientX; y = e.clientY; if (!queued) { queued = true; requestAnimationFrame(paint); } };
  addEventListener('pointermove', move, { passive: true });
  addEventListener('pointerdown', move, { passive: true });
  const off = () => { for (const g of lit) { g.style.setProperty('--glint', '0'); g.removeAttribute('data-lit'); } lit.clear(); };
  addEventListener('pointerup', e => { if (e.pointerType !== 'mouse') off(); }, { passive: true });
  addEventListener('pointercancel', off, { passive: true });
  document.documentElement.addEventListener('pointerleave', off);
})();
