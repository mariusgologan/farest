/* Boot: shell, layout/theme engine, global actions, routes. */
(() => {
  const { h, t, icon, store, config } = FE;
  const root = document.documentElement;
  const byId = (list, id) => list.find(x => x.id === id);
  const mq = matchMedia('(prefers-color-scheme: dark)');

  /* ---------- layout, theme, language ---------- */
  function effectiveLayout() {
    const sel = store.get('layout');
    if (sel !== 'auto') return sel;
    /* media queries, not innerWidth: reading innerWidth right after a DOM change forces a full layout */
    const b = config.layoutBreakpoints, at = px => matchMedia(`(min-width: ${px}px)`).matches;
    return at(b.wide) ? 'wide' : at(b.regular) ? 'regular' : 'compact';
  }
  /* glass or flat (config.surfaceModes, config.flat): auto is flat where glass is unsupported, unwanted, on a low-end device, or drew too slowly */
  const glassOk = CSS.supports('backdrop-filter', 'blur(1px)') || CSS.supports('-webkit-backdrop-filter', 'blur(1px)');
  const lessGlass = matchMedia('(prefers-reduced-transparency: reduce)');
  const lowEnd = () => Math.min(navigator.deviceMemory || 99, navigator.hardwareConcurrency || 99) <= config.flat.lowEnd;
  const slow = () => (store.get('slowUntil') || 0) > Date.now();
  const isFlat = () => { const m = store.get('surface'); return m === 'auto' ? !glassOk || lessGlass.matches || lowEnd() || slow() : m === 'flat'; };
  /* frame-time probes, only while auto shows glass, the page is visible and the browser is not automated (software rendering is not the device) */
  const judging = () => store.get('surface') === 'auto' && !isFlat() && !navigator.webdriver && document.visibilityState === 'visible';
  function verdict(ds) {
    const f = config.flat; if (!judging() || ds.length < 10) return;
    ds.sort((a, b) => a - b);
    if (ds[ds.length >> 1] > f.slowFrameMs || ds.filter(d => d > 2 * f.slowFrameMs).length / ds.length > f.jankShare) store.set({ slowUntil: Date.now() + f.retestDays * 864e5 });
  }
  function probe() {
    if (!judging()) return;
    const ds = []; let last = 0;
    const tick = now => { if (last) ds.push(now - last); last = now; if (ds.reduce((a, b) => a + b, 0) >= config.flat.probeMs) return verdict(ds); requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }
  /* while the visitor scrolls, time each frame (gaps after a pause are not frames); judge once scrollFrames are in */
  function probeScroll() {
    const ds = [], frame = FE.$('#frame'); let last = 0, stop = 0, run = false;
    const tick = now => { if (last) ds.push(now - last); last = now; if (ds.length >= config.flat.scrollFrames) { frame.removeEventListener('scroll', on); return verdict(ds); } if (run) requestAnimationFrame(tick); else last = 0; };
    const on = () => { if (!judging()) return frame.removeEventListener('scroll', on); clearTimeout(stop); stop = setTimeout(() => (run = false), 150); if (!run) { run = true; requestAnimationFrame(tick); } };
    frame.addEventListener('scroll', on, { passive: true });
  }
  FE.surface = { isFlat, probe, probeScroll };
  function applyEnv() {
    const theme = store.get('theme'), sel = store.get('layout'), eff = effectiveLayout();
    const scheme = theme === 'auto' ? (mq.matches ? 'dark' : 'light') : theme;
    /* a theme switch is quick for everything (css/base.css); the slow ambient glides are for colour changes, not for this */
    if (root.dataset.theme && root.dataset.theme !== scheme) { clearTimeout(applyEnv.t); root.dataset.switching = ''; applyEnv.t = setTimeout(() => delete root.dataset.switching, 400); }
    root.dataset.theme = scheme;
    root.toggleAttribute('data-flat', isFlat());
    root.dataset.layout = sel; root.dataset.eff = eff; root.dataset.nav = config.layouts[eff].nav;
    root.style.setProperty('--cols', config.layouts[eff].cols);
    root.style.setProperty('--frame-w', sel === 'auto' ? '100%' : config.layouts[sel].width + 'px');
    root.lang = store.get('lang');
    root.dataset.segment = store.get('segment');
  }

  /* ---------- shell ---------- */
  const navItem = (n, cls) => h`<a class="${cls}" href="#${n.route}" aria-label="${t(`nav.${n.id}`)}" data-nav="${n.id}" data-ctx="${n.id}">${icon(n.icon, 22)}<span>${t(`nav.${n.id}`)}</span></a>`;
  function drawShell() {
    FE.$('#top').innerHTML = h`<a class="logo" href="#/"><b>FAR</b><span>EST</span></a>
      <nav class="topnav" aria-label="Main">${config.nav.map(n => navItem(n, 'navlink'))}</nav>
      <div class="top-actions">
        ${FE.ui.segmented('segment', config.segments, store.get('segment'), 'set-segment')}
        <button class="icon-btn" data-action="phone" aria-label="${t('phone.title')}" aria-haspopup="dialog">${icon('phone')}</button>
        <button class="icon-btn" data-action="settings" aria-label="${t('settings.title')}" aria-haspopup="dialog">${icon('settings')}</button>
        <button class="icon-btn cart-btn" data-action="open-cart" aria-label="${t('cart.title')}">${icon('cart')}<span class="badge-dot" data-bind="cart-count" hidden></span></button>
      </div>`.toString();
    FE.$('#tabs').innerHTML = config.nav.filter(n => n.id !== 'acc').map(n => navItem(n, 'tab')).join('');
    FE.$('#foot').innerHTML = h`<div class="foot-in"><div><b>${config.brand.legal}</b><p class="muted small">${t('foot.tag', { year: config.brand.since })}</p><p class="small"><a href="#/page/about">${t('foot.about')}</a> · <a href="#/page/warranty">${t('foot.warranty')}</a></p></div>
      <div><p class="muted small">${t('phone.hours')}</p><p><a href="tel:${FE.db.callCenter[0].replace(/\s/g, '')}">${FE.db.callCenter[0]}</a></p></div>
      <p class="muted small">${t('foot.mock')}</p></div>`.toString();
    markActive(); badge();
  }
  const badge = () => { const n = FE.cart.count(), el = FE.$('[data-bind=cart-count]'); if (el) { el.hidden = !n; el.textContent = n; } };
  const markActive = () => FE.$$('[data-nav]').forEach(a => { const on = a.dataset.nav === store.get('context'); on ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'); });

  /* route -> ambient context */
  FE.contextFor = route => {
    const m = route.match(/^\/c\/(\w+)/); if (m) return byId(FE.db.categories, m[1])?.ambient || 'home';
    const p = route.match(/^\/p\/([\w-]+)/); if (p) return byId(FE.db.categories, byId(FE.db.products, p[1])?.cat)?.ambient || 'home';
    return { '/calculator': 'calc', '/calculator/summary': 'calc', '/shops': 'shops' }[route] || 'home';
  };
  FE.router.add('/', FE.views.home, 'home');
  FE.router.add('/c/:cat', FE.views.catalog, ({ cat }) => FE.contextFor('/c/' + cat));
  FE.router.add('/p/:id', FE.views.product, ({ id }) => FE.contextFor('/p/' + id));
  FE.router.add('/calculator', FE.views.calculator, 'calc');
  FE.router.add('/calculator/summary', FE.views.cfgSummary, 'calc');
  FE.router.add('/shops', FE.views.shops, 'shops');
  FE.router.add('/page/:slug', FE.views.page, 'home');

  /* ---------- actions ---------- */
  const A = FE.actions.register;
  A('add', (el, ev, d) => { const p = byId(FE.db.products, d.id); FE.cart.add({ pid: p.id, opening: p.opening, color: 'white', extras: [], qty: 1 }); FE.toast(t('toast.added')); });
  A('quickview', (el, ev, d) => FE.flows.quickview(d.id));
  A('configure', (el, ev, d) => FE.flows.configure(d.id));
  A('edit-line', (el, ev, d) => FE.flows.configure(FE.store.get('cart')[+d.i].pid, +d.i));
  A('open-profile', (el, ev, d) => FE.flows.profile(d.id));
  A('open-measure', () => FE.flows.measure());
  A('map', (el, ev, d) => FE.flows.map(d.id));
  A('open-cart', () => FE.flows.cart());
  A('checkout', () => FE.flows.checkout());
  A('callback', () => { FE.$$('.layer[data-kind=popover]').length && FE.overlay.closeTop(); FE.flows.callback(); });
  A('phone', el => FE.flows.phone(el));
  A('settings', el => FE.flows.settings(el));
  A('overlay-all-close', () => FE.overlay.closeAll());
  A('skip', () => FE.$('#view').focus());
  A('set-theme', (el, ev, d) => store.set({ theme: d.value }));
  A('set-layout', (el, ev, d) => store.set({ layout: d.value }));
  A('set-ambient', (el, ev, d) => store.set({ ambient: d.value }));
  A('set-surface', (el, ev, d) => store.set({ surface: d.value }));
  A('set-bars', (el, ev, d) => store.set({ bars: d.value }));
  A('set-lang', (el, ev, d) => store.set({ lang: d.value }));
  A('set-segment', (el, ev, d) => store.set({ segment: d.value }));
  /* the address stays shareable: ?b2b while the b2b segment is on, nothing for the household default */
  const segmentUrl = () => { const q = new URLSearchParams(location.search); q.delete('b2b'); q.delete('b2c'); const rest = q.toString().replace(/=(&|$)/g, '$1');
    const search = [store.get('segment') === 'b2b' ? 'b2b' : '', rest].filter(Boolean).join('&'); history.replaceState(history.state, '', (search ? '?' + search : location.pathname) + location.hash); };

  /* hovering a photo card tints the ambient light with that photo; leaving restores the page picture */
  const hover = (ev, enter) => { const el = ev.target.closest?.('[data-pic]'); if (!el || !el.dataset.pic) return; if (enter ? true : !el.contains(ev.relatedTarget)) FE.ambient.setPicture(enter ? el.dataset.pic : FE.ambient.rest()); };
  document.addEventListener('pointerover', ev => hover(ev, true));
  document.addEventListener('pointerout', ev => hover(ev, false));

  /* ---------- wiring ---------- */
  store.on((s, prev, patch) => {
    if ('theme' in patch || 'layout' in patch || 'lang' in patch || 'surface' in patch || 'slowUntil' in patch || 'segment' in patch) applyEnv();
    if ('segment' in patch) segmentUrl();
    if ('lang' in patch || 'segment' in patch) { drawShell(); FE.router.start(); }
    if ('cart' in patch) badge();
    if ('context' in patch) markActive();
  });
  mq.addEventListener('change', applyEnv); lessGlass.addEventListener('change', applyEnv);
  addEventListener('resize', () => { if (store.get('layout') === 'auto') applyEnv(); });

  /* boot: load content files, then render; installable web app via service worker (http/https only) */
  /* the shell needs only static data, so it is drawn first: the bars, footer and layout attributes are in place before the content files arrive (nothing moves later) */
  applyEnv(); drawShell(); FE.ambient.apply();
  FE.loadAll().then(() => { FE.prices.start(); return FE.router.start(); })
    .then(() => { setTimeout(probe, 1000); probeScroll(); })
    .catch(err => { FE.$('#view').removeAttribute('aria-busy'); FE.$('#view').innerHTML = `<div class="empty center stack"><h1>${t('error.load')}</h1><p class="muted">${t('error.loadHint')}</p><code>${FE.esc(err.message)}</code></div>`; });
  applyEnv();
  if (FE.config.registerSw !== false && 'serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
})();
