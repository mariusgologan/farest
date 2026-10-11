/* B2B (data-segment="b2b"): the home for builders, developers and resellers, and the volume quote request. Every other view is shared;
   prices show without VAT through FE.money (js/core/i18n.js). Company figures are the company's own claims on farest.ro. */
(() => {
  const { h, t, money, icon, ui } = FE;
  const copy = () => FE.content[FE.store.get('lang')]?.trade || FE.content[FE.config.defaults.lang].trade; /* the lists and figures */

  /* K of finished products (W/m²K) per profile, from the catalogue; premium systems carry the published Ug range instead */
  function thermal(p) {
    const k = FE.db.products.filter(x => x.profile === p.id && x.uf).map(x => +x.uf);
    if (k.length) return `K ${FE.num(Math.min(...k))}–${FE.num(Math.max(...k))}`;
    return p.tier >= 2 ? `Ug ${FE.num(1)}${FE.store.get('lang') === 'ro' ? ',0' : '.0'}–${FE.num(1.3)}` : '–';
  }

  const projects = () => {
    const ps = FE.projects.list().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    if (!ps.length) return h`<p class="muted">${t('trade.projects.none')}</p><a class="btn ghost" href="#/calculator">${icon('calc', 18)} ${t('trade.projects.create')}</a>`;
    return h`<div class="t-scroll"><table class="t-table"><thead><tr><th scope="col">${t('trade.projects.name')}</th><th scope="col">${t('trade.projects.status')}</th><th scope="col" class="num">${t('cfg.pcs')}</th><th scope="col" class="num">${t('trade.projects.total')}</th><td></td></tr></thead>
      <tbody>${ps.map(p => h`<tr><th scope="row">${p.name}</th><td data-label="${t('trade.projects.status')}">${t(`cfg.status.${FE.projects.state(p)}`)}</td><td class="num" data-label="${t('cfg.pcs')}">${FE.projects.pieces(p)}</td><td class="num" data-label="${t('trade.projects.total')}">${money(FE.projects.total(p))}</td>
        <td><button class="btn link small" data-action="trade-project" data-id="${p.id}">${t('trade.projects.open')} ${icon('chevron', 16)}</button></td></tr>`)}</tbody></table></div>`;
  };

  FE.views.trade = async host => {
    const site = FE.data.site, b = FE.config.brand, c = copy(), fig = c.fig;
    FE.ambient.page = site.factory || null; FE.ambient.setPicture(FE.ambient.page);
    host.innerHTML = h`
      <section class="hero t-hero acrylic e-2" data-pic="${site.factory || ''}">
        <div class="hero-copy">
          <p class="eyebrow">${t('trade.eyebrow')}</p>
          <h1>${t('trade.title')}</h1>
          <p class="lead">${t('trade.lead')}</p>
          <div class="row">
            <button class="btn primary lg" data-action="trade-quote">${t('trade.quote')}</button>
            <a class="btn ghost lg" href="#/calculator">${icon('calc', 20)} ${t('trade.configure')}</a>
          </div>
          <ul class="t-perks">${c.perks.map(x => h`<li>${icon('check', 16)} ${x}</li>`)}</ul>
        </div>
        <div class="hero-art" aria-hidden="true">${site.factory ? h`<img class="hero-photo" src="${site.factory}" alt="" loading="lazy" width="1200" height="430">` : ''}</div>
      </section>
      <section class="t-figs acrylic e-1" aria-label="${t('trade.eyebrow')}"><dl>${[[fig.since, b.since], [fig.factory, b.factory], [fig.glass, FE.num(1000) + '+'], [fig.warranty, 5]].map(([k, v]) => h`<div><dt>${k}</dt><dd>${v}</dd></div>`)}</dl>
        <p class="muted small">${fig.note}</p></section>
      <section><h2>${t('trade.who.title')}</h2>
        <div class="grid t-who">${c.who.items.map(([i, ti, li]) => h`<div class="fact acrylic e-1"><span class="fact-ico">${icon(i, 24)}</span><b>${ti}</b><span class="muted">${li}</span></div>`)}</div></section>
      <section class="t-band acrylic e-1"><div class="row spread"><div><h2>${t('trade.systems.title')}</h2><p class="muted">${t('trade.systems.lead')}</p></div></div>
        <div class="t-scroll"><table class="t-table"><thead><tr>${['name', 'depth', 'chambers', 'seals', 'thermal'].map(k => h`<th scope="col">${t(`trade.systems.${k}`)}</th>`)}<td></td></tr></thead>
          <tbody>${FE.db.profiles.map(p => h`<tr><th scope="row">${p.name}</th><td data-label="${t('trade.systems.depth')}">${p.mm ? p.mm + ' mm' : '–'}</td><td data-label="${t('trade.systems.chambers')}">${p.chambers ?? '–'}</td><td data-label="${t('trade.systems.seals')}">${p.seals ?? '–'}</td><td data-label="${t('trade.systems.thermal')}">${thermal(p)}</td>
            <td><button class="btn link small" data-action="open-profile" data-id="${p.id}">${t('trade.systems.sheet')} ${icon('chevron', 16)}</button></td></tr>`)}</tbody></table></div>
        <p class="muted small">${t('trade.systems.note')}</p></section>
      <section><h2>${t('trade.steps.title')}</h2>
        <ol class="grid how t-steps">${c.steps.items.map(([a, d], i) => h`<li class="acrylic e-1"><span class="num">${i + 1}</span><b>${a}</b><span class="muted">${d}</span></li>`)}</ol></section>
      <section class="t-band acrylic e-1" data-bind="projects"><h2>${t('trade.projects.title')}</h2><p class="muted">${t('trade.projects.lead')}</p>${projects()}</section>
      <section class="split-band acrylic thick e-2"><div><h2>${t('trade.manager.title')}</h2><p class="muted">${t('trade.manager.lead')}</p></div>
        <div class="row"><button class="btn primary lg" data-action="trade-quote">${t('trade.quote')}</button>
          <a class="btn ghost lg" href="tel:${FE.db.callCenter[0].replace(/\s/g, '')}">${icon('phone', 20)} ${t('trade.manager.call')}</a></div></section>`.toString();
  };

  /* ---------- volume quote request: company, quantities, optionally the cart ---------- */
  FE.flows.tradeQuote = () => FE.overlay.open({
    title: t('trade.form.title'), size: 'md',
    render(body, ov) {
      const cart = FE.store.get('cart'), n = cart.reduce((s, l) => s + l.qty, 0);
      body.innerHTML = h`<form class="stack t-form" novalidate><p class="muted">${t('trade.form.lead')}</p>
        <div class="t-fields">
          ${ui.field('tq-company', t('trade.form.company'), 'type="text" autocomplete="organization" required maxlength="120" autofocus')}
          ${ui.field('tq-cui', t('trade.form.cui'), 'type="text" required maxlength="14" autocapitalize="characters"', t('trade.form.cuiHint'))}
          ${ui.field('tq-name', t('trade.form.name'), 'type="text" autocomplete="name" required maxlength="120"')}
          ${ui.field('tq-phone', t('form.phone'), 'type="tel" autocomplete="tel" inputmode="tel" required', t('form.phoneHint'))}
          ${ui.field('tq-email', t('trade.form.email'), 'type="email" autocomplete="email" required maxlength="160"')}
          <label class="field" for="tq-type"><span>${t('trade.form.type')}</span><select id="tq-type" name="tq-type">${['builder', 'developer', 'reseller', 'other'].map(k => h`<option value="${k}">${t(`trade.form.types.${k}`)}</option>`)}</select></label>
          ${ui.field('tq-quantity', t('trade.form.quantity'), `type="number" inputmode="numeric" min="1" max="100000" required value="${Math.max(n, 1)}"`)}
        </div>
        <label class="field" for="tq-message"><span>${t('trade.form.message')}</span><textarea id="tq-message" name="tq-message" rows="3" maxlength="1000"></textarea></label>
        ${cart.length ? h`<label class="check"><input type="checkbox" name="tq-attach" checked><span>${t('trade.form.attach', { n })}</span></label>` : ''}
        <p class="error" role="alert" data-bind="err" hidden></p>
        <button class="btn primary lg" type="submit">${t('trade.form.send')}</button></form>`.toString();
      const form = FE.$('form', body), err = FE.$('[data-bind=err]', body);
      form.addEventListener('submit', async e => {
        e.preventDefault();
        /* ui.field names each input after its id (tq-...): the request takes the bare names */
        const f = Object.fromEntries([...new FormData(form)].map(([k, v]) => [k.slice(3), v])), attach = f.attach; delete f.attach;
        Object.assign(f, { cui: f.cui.replace(/\s/g, '').toUpperCase(), quantity: Number(f.quantity) }, attach ? { items: cart.map(l => ({ pid: l.pid, qty: l.qty })) } : {});
        FE.$$('[aria-invalid]', form).forEach(x => x.removeAttribute('aria-invalid'));
        const btn = FE.$('button[type=submit]', form); btn.disabled = true;
        const r = await FE.api.post('/trade-requests', f);
        btn.disabled = false;
        if (!r.ok) { err.hidden = false; err.textContent = t('form.error'); const bad = r.detail?.match(/^body\.(\w+)/)?.[1]; const el = form.elements['tq-' + bad]; el?.setAttribute('aria-invalid', 'true'); el?.focus(); return; }
        ov.close(); FE.toast(t('trade.form.ok', { ref: r.data.ref }));
      });
    }
  });

  FE.actions.register('trade-quote', () => { FE.$$('.layer[data-kind=popover]').length && FE.overlay.closeTop(); FE.flows.tradeQuote(); });
  FE.actions.register('trade-project', (el, ev, d) => { FE.projects.open(d.id); location.hash = '#/calculator/summary'; });
})();
