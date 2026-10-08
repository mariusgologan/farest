/* Top and bottom menus slide away and fade while reading downwards and return on any upward scroll, at the top of the page,
   or when focus moves into them. html[data-bars="hidden"] drives css/chrome.css. */
(() => {
  const root = document.documentElement, cfg = FE.config.bars, frame = FE.$('#frame');
  let last = 0, ticking = false;
  const set = hidden => { const v = hidden ? 'hidden' : 'shown'; if (root.dataset.bars !== v) root.dataset.bars = v; };
  const update = () => {
    ticking = false;
    const y = frame.scrollTop, d = y - last;
    if (FE.store.get('bars') === 'always' || +root.dataset.overlayDepth > 0 || y < cfg.showAbove) set(false);
    else if (d > cfg.downDelta && y > cfg.hideAfter) set(true);
    else if (d < -cfg.upDelta) set(false);
    if (Math.abs(d) > cfg.upDelta) last = y;
  };
  frame.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  frame.addEventListener('focusin', e => { if (e.target.closest('#top, #tabs')) set(false); });
  FE.store.on((st, prev, patch) => { if ('bars' in patch) update(); });
  addEventListener('hashchange', () => set(false));
})();
