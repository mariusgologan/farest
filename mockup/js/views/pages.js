/* Page views. Each takes (host, params), fetches through FE.api, renders from data + FE.t. */
(() => {
  const { h, raw, t, money, icon, ui } = FE;
  const byId = (list, id) => list.find(x => x.id === id);
  const set = (host, tpl) => { host.innerHTML = tpl.toString(); };
  const bind = (host, evt, sel, fn) => host.addEventListener(evt, e => { const el = e.target.closest(sel); if (el) fn(el, e); });

  /* ---------- welcome (home): sales-oriented landing, copy from content/*.md, *.json, *.yaml ---------- */
  FE.views = {};
  const shopLinks = sh => h`<div class="row">
      <button class="btn ghost small" data-action="map" data-id="${sh.id}">${icon('pin', 16)} ${t('shops.map')}</button>
      <a class="btn link small" href="${FE.config.maps.route + encodeURIComponent(sh.maps_query)}" target="_blank" rel="noopener">${t('shops.route')}</a></div>`;
  FE.views.home = async host => {
    const [{ data: top }, { data: w }, { data: offers }, { data: faq }, { data: shops }] = await Promise.all(
      ['/products?sort=featured&page=1', '/welcome', '/offers', '/faq', '/shops'].map(u => FE.api.get(u)));
    const picks = top.slice(0, 3), m = w.meta, site = FE.data.site;
    FE.ambient.page = site.hero || null; FE.ambient.setPicture(FE.ambient.page);
    set(host, h`
      <section class="hero acrylic e-3">
        <div class="hero-copy">
          <p class="eyebrow">${m.eyebrow}</p>
          <h1>${m.title}</h1>
          <p class="lead">${m.lead}</p>
          <div class="row">
            <a class="btn primary lg" href="#/calculator">${icon('calc', 20)} ${m.cta_primary}</a>
            <button class="btn ghost lg" data-action="callback">${icon('phone', 20)} ${m.cta_secondary}</button>
          </div>
          <p class="muted small row">${icon('shield', 16)} ${t('home.reassure')}</p>
        </div>
        <div class="hero-art" aria-hidden="true">${site.hero ? h`<img class="hero-photo" src="${site.hero}" alt="">` : ''}${picks.map((p, i) => h`<div class="float f${i} acrylic e-3">${ui.img(p)}</div>`)}</div>
      </section>
      <section class="grid offers" aria-label="${t('home.offers')}">${offers.map(o => h`
        <a class="offer acrylic lift e-1" ${raw(o.cta.startsWith('/') ? `href="#${o.cta}"` : `href="#" data-action="${o.cta}"`)}>
          <span class="fact-ico">${icon(o.icon, 24)}</span><b>${FE.loc(o.title).replace('{amount}', money(FE.config.catalog.freeDeliveryFrom))}</b><span class="muted">${FE.loc(o.text)}</span></a>`)}</section>
      <section><h2>${t('home.how')}</h2><ol class="grid how">${[1, 2, 3].map(n => h`<li class="acrylic e-1"><span class="num">${n}</span><b>${t(`how.${n}.t`)}</b><span class="muted">${t(`how.${n}.d`)}</span></li>`)}</ol></section>
      <section><div class="row spread"><h2>${t('home.popular')}</h2><a href="#/c/windows">${t('home.all')} ${icon('chevron', 16)}</a></div>
        <div class="grid cards">${picks.map(ui.card)}</div></section>
      <section class="prose-band acrylic e-2" data-pic="${site.factory || ''}"><div class="prose">${site.factory ? h`<img class="wide-photo" src="${site.factory}" alt="" loading="lazy">` : ''}${raw(w.html)}</div>
        <div class="grid facts">${['factory', 'shops', 'warranty', 'delivery'].map((k, i) => h`<div class="fact"><span class="fact-ico">${icon(['factory', 'pin', 'shield', 'truck'][i], 24)}</span><b>${t(`facts.${k}.t`, { year: FE.config.brand.factory, n: shops.length })}</b><span class="muted">${t(`facts.${k}.d`)}</span></div>`)}</div></section>
      <section><h2>${t('home.systems')}</h2>
        <div class="grid tiles">${FE.db.profiles.filter(p => p.site).map(p => h`<button class="tile acrylic lift" data-action="open-profile" data-id="${p.id}" data-pic="${site.systems[p.site] || ''}">
          ${site.systems[p.site] ? h`<img class="tile-photo" src="${site.systems[p.site]}" alt="" loading="lazy">` : ''}<b>${p.name}</b><span class="muted">${t(p.blurb)}</span><span class="row chips">${ui.chip(`${p.mm} mm`)}${p.chambers ? ui.chip(t('profile.chambers', { n: p.chambers })) : ''}</span></button>`)}</div></section>
      <section><div class="row spread"><h2>${t('home.shopsTitle')}</h2><a href="#/shops">${t('home.shopsCta')} ${icon('chevron', 16)}</a></div>
        <div class="grid cards">${shops.map(sh => h`<article class="card acrylic" data-pic="${site.shops || ''}"><div class="card-body"><h3>${FE.loc(sh.name)}</h3><p class="muted">${FE.loc(sh.address)}</p>
          <p>${icon('phone', 16)} <a href="tel:${sh.phone.replace(/\s/g, '')}">${sh.phone}</a></p>${shopLinks(sh)}</div></article>`)}</div></section>
      <section><h2>${t('home.faq')}</h2><div class="faq">${faq.map(f => h`<details class="acrylic e-1"><summary>${FE.loc(f.q)}</summary><p class="muted">${FE.loc(f.a)}</p></details>`)}</div></section>
      <section class="split-band acrylic thick e-3"><div><h2>${t('home.finalTitle')}</h2><p class="muted">${t('home.finalLead')}</p></div>
        <div class="row"><a class="btn primary lg" href="#/calculator">${icon('calc', 20)} ${m.cta_primary}</a><button class="btn ghost lg" data-action="callback">${icon('phone', 20)} ${m.cta_secondary}</button></div></section>`);
  };

  /* ---------- markdown pages: content/pages/<slug>.<lang>.md ---------- */
  FE.views.page = async (host, { slug }) => {
    const r = await FE.api.get(`/pages/${slug}`);
    if (!r.ok) return set(host, h`<div class="empty center stack"><h1>${t('error.404')}</h1><a class="btn primary" href="#/">${t('error.home')}</a></div>`);
    set(host, h`<article class="prose-page acrylic e-2"><h1>${r.data.meta.title}</h1><div class="prose">${raw(r.data.html)}</div></article>`);
  };

  /* ---------- catalogue ---------- */
  const filterForm = (q) => h`<form class="filters stack" data-form="filters" novalidate>
      <label class="field"><span>${t('filter.search')}</span><input type="search" name="q" value="${q.q || ''}" placeholder="${t('filter.searchPh')}"></label>
      ${(FE.config.catalog.groups[q.cat] || []).length > 1 ? h`<label class="field"><span>${t('filter.group')}</span><select name="group"><option value="">${t('filter.any')}</option>${FE.config.catalog.groups[q.cat].map(g => h`<option value="${g}" ${q.group === g ? 'selected' : ''}>${t(`group.${g}`)}</option>`)}</select></label>` : ''}
      <label class="field"><span>${t('filter.stock')}</span><select name="stock"><option value="">${t('filter.any')}</option>${['in', 'low', 'order'].map(s => h`<option value="${s}" ${q.stock === s ? 'selected' : ''}>${t(`stock.${s}`)}</option>`)}</select></label>
      <label class="field"><span>${t('filter.max')}: <output>${q.max ? money(q.max) : t('filter.any')}</output></span><input type="range" name="max" min="200" max="3000" step="50" value="${q.max || 3000}"></label>
      <label class="field"><span>${t('filter.sort')}</span><select name="sort">${FE.config.catalog.sorts.map(s => h`<option value="${s}" ${(q.sort || 'featured') === s ? 'selected' : ''}>${t(`sort.${s}`)}</option>`)}</select></label>
      <button type="button" class="btn ghost" data-action="filters-reset">${t('filter.reset')}</button></form>`;

  FE.views.catalog = async (host, { cat }) => {
    const q = { cat, page: 1, sort: 'featured' };
    set(host, h`<header class="page-head"><h1>${t(`cat.${cat}.title`)}</h1><p class="muted">${t(`cat.${cat}.lead`)}</p></header>
      <div class="catalog"><aside class="aside acrylic e-1" aria-label="${t('filter.title')}" data-slot="filters"></aside>
        <div><div class="row spread toolbar"><button class="btn ghost only-compact" data-action="filters-open">${icon('sliders', 18)} ${t('filter.title')}</button><p class="muted" data-bind="count" aria-live="polite"></p></div>
          <div class="grid cards" data-bind="grid"></div><nav class="pager" data-bind="pager" aria-label="${t('a11y.pages')}"></nav></div></div>`);
    const slot = FE.$('[data-slot=filters]', host);
    const apply = async () => {
      const grid = FE.$('[data-bind=grid]', host);
      grid.innerHTML = ui.skeleton(FE.config.catalog.pageSize).toString();
      const qs = new URLSearchParams(Object.fromEntries(Object.entries(q).filter(([k, v]) => v && !(k === 'max' && +v >= 3000)))).toString();
      const r = await FE.api.get(`/products?${qs}`);
      if (!host.isConnected) return;
      FE.$('[data-bind=count]', host).textContent = t('catalog.count', { n: r.meta.total });
      grid.innerHTML = r.data.length ? r.data.map(ui.card).join('') : h`<p class="empty muted">${t('catalog.none')}</p>`.toString();
      FE.$('[data-bind=pager]', host).innerHTML = r.meta.pages > 1 ? Array.from({ length: r.meta.pages }, (_, i) =>
        h`<button class="page-btn" aria-current="${i + 1 === r.meta.page}" data-action="page" data-n="${i + 1}">${i + 1}</button>`).join('') : '';
    };
    const drawFilters = () => { slot.innerHTML = filterForm(q).toString(); };
    FE.catalog = { q, apply, drawFilters, form: () => FE.$('form[data-form=filters]') };
    const onInput = (form) => { const f = new FormData(form); ['q', 'group', 'stock', 'max', 'sort'].forEach(k => { if (f.has(k)) q[k] = f.get(k) || ''; }); q.page = 1; const o = FE.$('output', form); if (o) o.textContent = +q.max >= 3000 ? t('filter.any') : money(q.max); clearTimeout(onInput.t); onInput.t = setTimeout(apply, 180); };
    FE.catalog.onInput = onInput;
    host.addEventListener('input', e => { const f = e.target.closest('form[data-form=filters]'); if (f) onInput(f); });
    drawFilters(); await apply();
  };
  FE.actions.register('page', (el, ev, d) => { FE.catalog.q.page = +d.n; FE.catalog.apply(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
  FE.actions.register('filters-reset', () => { const c = FE.catalog; Object.keys(c.q).forEach(k => { if (!['cat'].includes(k)) delete c.q[k]; }); c.q.page = 1; c.q.sort = 'featured'; FE.$$('form[data-form=filters]').forEach(f => f.reset()); c.drawFilters(); c.apply(); });
  FE.actions.register('filters-open', () => FE.overlay.open({ kind: 'sheet', title: t('filter.title'), size: 'md', render(body, ov) {
    body.innerHTML = filterForm(FE.catalog.q).toString();
    body.addEventListener('input', e => FE.catalog.onInput(e.target.closest('form')));
    body.insertAdjacentHTML('beforeend', h`<button class="btn primary block" data-action="overlay-close" data-layer="${ov.id}">${t('filter.show')}</button>`.toString());
  } }));

  /* ---------- product page: photo gallery (variants), buy box, spec table; ambient follows the shown photo ---------- */
  FE.views.product = async (host, { id }) => {
    const r = await FE.api.get(`/products/${id}`);
    if (!r.ok) return set(host, h`<div class="empty center stack"><h1>${t('error.404')}</h1><a class="btn primary" href="#/">${t('error.home')}</a></div>`);
    const p = r.data, pr = p.profileData, v = FE.variantsOf(p);
    const rel = (await FE.api.get(`/products?cat=${p.cat}&group=${p.group}&sort=price-asc`)).data.filter(x => x.id !== p.id).slice(0, 3);
    const show = i => {
      const img = p.images[i]; if (!img) return;
      FE.$('[data-bind=hero] img', host).src = img.src;
      FE.$$('.thumbs button', host).forEach((b, k) => b.setAttribute('aria-current', k === i));
      FE.ambient.page = img.src; FE.ambient.setPicture(img.src);
    };
    set(host, h`
      <nav class="breadcrumb" aria-label="${t('a11y.path')}"><a href="#/">${t('nav.home')}</a> › <a href="#/c/${p.cat}">${t(`cat.${p.cat}.title`)}</a> › <span>${p.name}</span></nav>
      <div class="pdp">
        <section class="pdp-art acrylic e-2">
          <div class="photo-plate" data-bind="hero">${p.images[0] ? h`<img class="photo" src="${p.images[0].src}" alt="${p.name}">` : ui.windowSvg(p)}</div>
          ${p.images.length > 1 ? h`<div class="thumbs" role="group" aria-label="${t('product.gallery')}">${p.images.map((im, i) => h`<button data-action="gallery" data-i="${i}" aria-current="${i === 0}" aria-label="${t('product.photo', { n: i + 1 })}"><img src="${im.src}" alt="" loading="lazy"></button>`)}</div>` : ''}
        </section>
        <section class="buybox acrylic thick e-3">
          <h1 class="long">${p.name}</h1>
          <div class="row">${ui.stock(p.stock)}${p.colour ? ui.chip(p.colour) : ''}</div>
          <div class="price-block big">${ui.price(p.price)}</div>
          <div class="row"><button class="btn primary lg grow" data-action="${v.sides.length ? 'configure' : 'add'}" data-id="${p.id}">${v.sides.length ? icon('sliders', 20) : icon('cart', 20)} ${t(v.sides.length ? 'action.configure' : 'action.add')}</button>${v.sides.length ? h`<button class="btn ghost lg" data-action="add" data-id="${p.id}">${icon('cart', 20)}<span class="sr-only">${t('action.add')}</span></button>` : ''}</div>
          <button class="btn link" data-action="callback">${icon('phone', 18)} ${t('product.askCall')}</button>
          <ul class="ticks"><li>${icon('truck', 18)} ${t('trust.delivery')}</li><li>${icon('shield', 18)} ${t('trust.warranty')}</li></ul>
        </section>
        ${p.kind !== 'part' ? h`<section class="pdp-spec acrylic e-1"><div class="row spread"><h2>${t('product.spec')}</h2>${pr ? h`<button class="btn link" data-action="open-profile" data-id="${pr.id}">${t('product.profileMore')} ${icon('chevron', 16)}</button>` : ''}</div>
          <dl class="specs">${p.producer ? h`<dt>${t('product.producer')}</dt><dd>${p.producer}</dd>` : ''}<dt>${t('product.size')}</dt><dd>${p.w} × ${p.h} cm</dd>
          ${p.mm ? h`<dt>${t('profile.depth')}</dt><dd>${p.mm} mm</dd>` : ''}${p.chambers ? h`<dt>${t('profile.chambersLabel')}</dt><dd>${p.chambers}</dd>` : ''}${p.uf ? h`<dt>${t('product.uf')}</dt><dd>${FE.num(p.uf)} W/m²K</dd>` : ''}</dl></section>` : ''}
      </div>
      ${rel.length ? h`<section><h2>${t('product.related')}</h2><div class="grid cards">${rel.map(ui.card)}</div></section>` : ''}`);
    FE.ambient.page = p.images[0]?.src || null; FE.ambient.setPicture(FE.ambient.page);
    bind(host, 'click', '[data-action=gallery]', el => show(+el.dataset.i));
  };

  /* ---------- calculator (stepper) ---------- */
  FE.views.calculator = async host => {
    const s = { step: 1, w: 100, h: 120, count: 3, profile: 'trocal70', color: 'white', install: true };
    const steps = ['size', 'system', 'result'];
    const draw = async () => {
      let body;
      if (s.step === 1) body = h`<div class="stack"><label class="field"><span>${t('calc.w')}: <output>${s.w} cm</output></span><input type="range" name="w" min="40" max="250" value="${s.w}"></label>
        <label class="field"><span>${t('calc.h')}: <output>${s.h} cm</output></span><input type="range" name="h" min="40" max="250" value="${s.h}"></label>
        <label class="field"><span>${t('calc.count')}: <output>${s.count}</output></span><input type="range" name="count" min="1" max="20" value="${s.count}"></label>
        <div class="preview small-prev">${ui.windowSvg({ kind: 'window', w: s.w, h: s.h, opening: 'tilt' })}</div></div>`;
      else if (s.step === 2) body = h`<div class="stack"><fieldset><legend>${t('profile.title')}</legend><div class="grid tiles">${FE.db.profiles.filter(p => p.tier >= 2).map(p => h`<label class="opt block"><input type="radio" name="profile" value="${p.id}" ${p.id === s.profile ? 'checked' : ''}><span><b>${p.name}</b><small class="muted"> ${p.mm} mm · ${t('profile.chambers', { n: p.chambers })}</small></span></label>`)}</div></fieldset>
        <fieldset><legend>${t('configure.color')}</legend><div class="row">${FE.db.colors.map(c => h`<label class="swatch"><input type="radio" name="color" value="${c.id}" ${c.id === s.color ? 'checked' : ''}><i style="background:${c.hex}"></i><span class="sr-only">${t(`color.${c.id}`)}</span></label>`)}</div></fieldset>
        <label class="check"><input type="checkbox" name="install" ${s.install ? 'checked' : ''}><span>${t('calc.install')}</span></label></div>`;
      else { const r = (await FE.api.post('/estimate', s)).data; body = h`<div class="result"><p class="muted">${t('calc.area', { a: r.area })}</p>
        <dl class="specs"><dt>${t('calc.base')}</dt><dd>${money(r.base)}</dd><dt>${t('calc.installCost')}</dt><dd>${money(r.install)}</dd></dl>
        <div class="price big total">${money(r.total)}</div><p class="muted small">${t('calc.disclaimer')}</p>
        <div class="row"><button class="btn primary lg" data-action="callback">${icon('phone', 20)} ${t('calc.quote')}</button><button class="btn ghost" data-action="calc-restart">${t('calc.restart')}</button></div></div>`; }
      set(FE.$('[data-bind=step]', host), body);
      FE.$$('.step', host).forEach((el, i) => { el.dataset.state = i + 1 < s.step ? 'done' : i + 1 === s.step ? 'current' : 'todo'; });
      FE.$('[data-action=calc-back]', host).hidden = s.step === 1;
      FE.$('[data-action=calc-next]', host).hidden = s.step === steps.length;
    };
    set(host, h`<header class="page-head"><h1>${t('calc.title')}</h1><p class="muted">${t('calc.lead')}</p></header>
      <section class="calc acrylic thick e-3"><ol class="stepper">${steps.map((k, i) => h`<li class="step" data-state="todo"><span>${i + 1}</span>${t(`calc.step.${k}`)}</li>`)}</ol>
        <div data-bind="step" aria-live="polite"></div>
        <div class="row spread footer-bar"><button class="btn ghost" data-action="calc-back">${icon('back', 18)} ${t('action.back')}</button><button class="btn primary" data-action="calc-next">${t('action.next')}</button></div></section>`);
    host.addEventListener('input', e => { const el = e.target; if (!el.name || !(el.name in s)) return; s[el.name] = el.type === 'range' ? +el.value : el.type === 'checkbox' ? el.checked : el.value;
      const o = el.closest('label')?.querySelector('output'); if (o) o.textContent = el.name === 'count' ? el.value : el.value + ' cm';
      if (el.name === 'w' || el.name === 'h') FE.$('.small-prev', host).innerHTML = ui.windowSvg({ kind: 'window', w: s.w, h: s.h, opening: 'tilt' }).toString();
      if (el.name === 'color') FE.store.set({ swatch: byId(FE.db.colors, el.value).delta ? byId(FE.db.colors, el.value).hex : null }); });
    FE.actions.register('calc-next', () => { s.step = Math.min(steps.length, s.step + 1); draw(); });
    FE.actions.register('calc-back', () => { s.step = Math.max(1, s.step - 1); draw(); });
    FE.actions.register('calc-restart', () => { s.step = 1; FE.store.set({ swatch: null }); draw(); });
    draw();
  };

  /* ---------- shops ---------- */
  FE.views.shops = async host => {
    const { data } = await FE.api.get('/shops');
    set(host, h`<header class="page-head"><h1>${t('shops.title')}</h1><p class="muted">${t('shops.lead')}</p></header>
      <div class="grid cards">${data.map(s => h`<article class="card acrylic lift"><div class="card-body">
        <h3>${FE.loc(s.name)}</h3><p class="muted">${FE.loc(s.address)}</p>
        <p>${icon('phone', 16)} <a href="tel:${s.phone.replace(/\s/g, '')}">${s.phone}</a></p>
        <p>${icon('mail', 16)} <a href="mailto:${s.email}">${s.email}</a></p>
        <p class="muted small">${t('shops.hours')}</p>
        ${shopLinks(s)}
        <button class="btn ghost" data-action="callback">${t('callback.title')}</button></div></article>`)}</div>
      <section class="split-band acrylic e-2"><div><h2>${t('shops.serviceTitle')}</h2><p class="muted">${t('shops.serviceLead')}</p></div><a class="btn primary" href="tel:${FE.db.service.replace(/\s/g, '')}">${icon('phone', 18)} ${FE.db.service}</a></section>`);
  };
})();
