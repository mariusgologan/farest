/* Pull to refresh on touch screens. The page scrolls inside #frame, so the browser's own gesture never fires:
   at the top of #frame a downward pull shows a round indicator; released past the threshold, the page reloads. */
(() => {
  if (!('ontouchstart' in window)) return;
  const frame = FE.$('#frame'), root = document.documentElement, cfg = FE.config.pull;
  const el = document.createElement('div');
  el.className = 'pull acrylic thick e-3';
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML = FE.icon('refresh', 22).toString();
  FE.$('#device').append(el);
  let x0 = null, y0 = null, d = 0;
  const paint = () => {
    el.style.setProperty('--pull', Math.min(d, cfg.max) + 'px');
    el.style.setProperty('--p', Math.min(d / cfg.threshold, 1).toFixed(3));
    d > 0 ? el.setAttribute('data-active', '') : el.removeAttribute('data-active');
    d >= cfg.threshold ? el.setAttribute('data-ready', '') : el.removeAttribute('data-ready');
  };
  const stop = () => { x0 = y0 = null; d = 0; paint(); };
  frame.addEventListener('touchstart', e => {
    const t = e.touches[0];
    if (e.touches.length === 1 && frame.scrollTop <= 0 && !(+root.dataset.overlayDepth > 0)) { x0 = t.clientX; y0 = t.clientY; d = 0; } else stop();
  }, { passive: true });
  frame.addEventListener('touchmove', e => {
    if (y0 == null) return;
    const t = e.touches[0], dx = t.clientX - x0, dy = t.clientY - y0;
    if (frame.scrollTop > 0 || (!d && Math.abs(dx) > Math.abs(dy))) return stop(); /* scrolled, or a sideways swipe */
    d = Math.max(0, dy * cfg.resistance); paint();
  }, { passive: true });
  frame.addEventListener('touchend', () => {
    if (y0 == null) return;
    if (d < cfg.threshold) return stop();
    x0 = y0 = null; el.dataset.state = 'loading';
    location.reload();
  });
  frame.addEventListener('touchcancel', stop);
})();
