/* Overlay stack. Every layer knows its depth; layers below recede (scale, shift, dim) so the hierarchy stays readable.
   kinds: modal | sheet | drawer | popover. On compact layouts modal and drawer become bottom sheets (CSS). */
(() => {
  const stack = [];
  let uid = 0;
  const host = () => FE.$('#overlays');
  const cfg = FE.config.overlay;
  const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])';

  function refresh() {
    stack.forEach((l, i) => {
      const above = stack.length - 1 - i;
      l.el.style.setProperty('--above', above);
      l.el.dataset.covered = above > 0 ? 'true' : 'false';
      l.el.inert = above > 0;
      const crumbs = FE.$('.crumbs', l.el);
      if (crumbs) crumbs.innerHTML = stack.slice(0, i).map(x => `<button class="crumb" data-action="overlay-back-to" data-layer="${x.id}">${FE.esc(x.title)}</button><span aria-hidden="true">›</span>`).join('');
    });
    FE.$('#frame').inert = stack.some(l => l.kind !== 'popover');
    document.documentElement.dataset.overlayDepth = stack.length;
  }

  function close(id, result) {
    const i = stack.findIndex(l => l.id === id);
    if (i < 0) return;
    stack.splice(i).reverse().forEach(l => {
      l.el.classList.remove('in');
      l.el.classList.add('out');
      setTimeout(() => l.el.remove(), cfg.exitMs);
      l.resolve(l.id === id ? result : undefined);
      l.restore?.focus?.();
    });
    refresh();
  }

  function position(l, anchor) {
    const panel = FE.$('.panel', l.el), d = host().getBoundingClientRect(), a = anchor.getBoundingClientRect();
    const r = { left: a.left - d.left, right: a.right - d.left, top: a.top - d.top, bottom: a.bottom - d.top, width: a.width };
    const w = panel.offsetWidth, h = panel.offsetHeight, m = 12;
    const below = r.bottom + 8 + h < d.height || r.top < h;
    panel.style.left = FE.clamp(r.left + r.width / 2 - w / 2, m, d.width - w - m) + 'px';
    panel.style.top = (below ? r.bottom + 8 : r.top - h - 8) + 'px';
  }

  FE.overlay = {
    depth: () => stack.length,
    top: () => stack[stack.length - 1]?.id,
    closeTop: () => stack.length && close(stack[stack.length - 1].id),
    closeAll: () => stack[0] && close(stack[0].id),
    close,
    open({ kind = 'modal', size = 'md', title = '', render, anchor, labelKey }) {
      if (stack.filter(l => l.kind !== 'popover').length >= cfg.maxDepth) return Promise.resolve();
      if (kind === 'popover') stack.filter(l => l.kind === 'popover').forEach(l => close(l.id));
      const id = 'ov' + ++uid;
      const el = document.createElement('div');
      el.className = 'layer';
      el.dataset.kind = kind; el.dataset.size = size; el.dataset.layer = id;
      el.innerHTML = `<div class="scrim" data-action="overlay-scrim"></div>
        <section class="panel acrylic thick e-5" role="${kind === 'popover' ? 'dialog' : 'dialog'}" aria-modal="${kind !== 'popover'}" aria-labelledby="${id}-t">
          <div class="panel-head"><nav class="crumbs" aria-label="${FE.esc(FE.t('a11y.path'))}"></nav>
            <h2 id="${id}-t" class="panel-title">${FE.esc(title)}</h2>
            <button class="icon-btn" data-action="overlay-close" data-layer="${id}" aria-label="${FE.esc(FE.t('a11y.close'))}">${FE.icon('close')}</button></div>
          <div class="panel-body"></div></section>`;
      let resolve; const closed = new Promise(r => resolve = r);
      const layer = { id, kind, title, el, resolve, restore: document.activeElement };
      stack.push(layer);
      host().append(el);
      const body = FE.$('.panel-body', el);
      const api = {
        id, body, close: r => close(id, r),
        setTitle: t => { layer.title = t; FE.$('.panel-title', el).textContent = t; },
        open: opts => FE.overlay.open(opts)
      };
      render(body, api);
      refresh();
      if (anchor && kind === 'popover') position(layer, anchor);
      requestAnimationFrame(() => { el.classList.add('in'); (FE.$('[autofocus]', el) || FE.$(FOCUSABLE, FE.$('.panel-body', el)) || FE.$('.icon-btn', el)).focus({ preventScroll: true }); });
      return closed;
    }
  };

  FE.actions.register('overlay-close', (el, ev, d) => close(d.layer));
  FE.actions.register('overlay-back-to', (el, ev, d) => { const i = stack.findIndex(l => l.id === d.layer); if (i >= 0 && stack[i + 1]) close(stack[i + 1].id); });
  FE.actions.register('overlay-scrim', el => { const l = stack.find(x => x.el === el.parentElement); if (l) close(l.id); });

  document.addEventListener('keydown', ev => {
    const top = stack[stack.length - 1];
    if (!top) return;
    if (ev.key === 'Escape') { ev.preventDefault(); close(top.id); }
    if (ev.key === 'Tab') {
      const items = FE.$$(FOCUSABLE, top.el).filter(n => n.offsetParent !== null);
      if (!items.length) return;
      const first = items[0], last = items[items.length - 1];
      if (ev.shiftKey && document.activeElement === first) { ev.preventDefault(); last.focus(); }
      else if (!ev.shiftKey && document.activeElement === last) { ev.preventDefault(); first.focus(); }
    }
  });
  addEventListener('hashchange', () => FE.overlay.closeAll());
})();
