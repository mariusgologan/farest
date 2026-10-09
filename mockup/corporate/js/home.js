/* Corporate home: restrained, structured company page. Replaces FE.views.home; every other view is shared with the default app. */
(() => {
  const { h, raw, t, money, icon, ui } = FE;
  const set = (host, tpl) => { host.innerHTML = tpl.toString(); };

  FE.views.home = async host => {
    const [{ data: w }, { data: faq }, { data: shops }, { data: cats }] = await Promise.all(['/welcome', '/faq', '/shops', '/categories'].map(u => FE.api.get(u)));
    const m = w.meta, site = FE.data.site, systems = FE.db.profiles.filter(p => p.site);
    const COLS = ['system', 'thickness', 'chambers', ...(systems.some(p => p.uf != null) ? ['thermal'] : [])];
    const count = id => FE.db.products.filter(p => p.cat === id).length;
    const photoOf = id => FE.db.products.find(p => p.cat === id && p.images[0])?.images[0].src;
    const metrics = [
      ['since', FE.config.brand.since, true], ['factory', FE.config.brand.factory, true], ['shops', shops.length],
      ['brands', systems.length], ['range', FE.db.products.length]];
    FE.ambient.page = null; FE.ambient.setPicture(null);
    set(host, h`
      <section class="c-hero">
        <div class="c-hero-copy">
          <p class="c-kicker">${t('corp.kicker')} · ${m.eyebrow}</p>
          <h1>${m.title}</h1>
          <p class="lead">${m.lead}</p>
          <div class="row">
            <a class="btn primary lg" href="#/calculator">${t('corp.offer')}</a>
            <button class="btn ghost lg" data-action="callback">${icon('phone', 20)} ${m.cta_secondary}</button>
          </div>
        </div>
        ${site.hero ? h`<figure class="c-hero-art"><img src="${site.hero}" alt=""></figure>` : ''}
      </section>
      <section class="c-metrics" aria-label="${t('corp.kicker')}">${metrics.map(([k, v, year]) => h`<div><b>${year ? v : FE.num(v)}</b><span>${t(`corp.metrics.${k}`)}</span></div>`)}</section>
      <section class="c-section">
        <header class="c-head"><h2>${t('corp.range.title')}</h2><p class="muted">${t('corp.range.lead')}</p></header>
        <div class="c-range">${cats.map(c => h`<a class="c-line" href="#/c/${c.id}">
          ${photoOf(c.id) ? h`<img src="${photoOf(c.id)}" alt="" loading="lazy">` : ''}
          <div><h3>${t(`cat.${c.id}.title`)}</h3><p class="muted">${t(`cat.${c.id}.lead`)}</p></div>
          <span class="c-more">${t('corp.range.items', { n: count(c.id) })} · ${t('corp.range.see')} ${icon('chevron', 16)}</span></a>`)}</div>
      </section>
      <section class="c-section">
        <header class="c-head"><h2>${t('corp.systems.title')}</h2><p class="muted">${t('corp.systems.lead')}</p></header>
        <div class="c-table c-systems" data-cols="${COLS.length}">
          <div class="c-tr c-th" aria-hidden="true">${COLS.map(c => h`<span>${t(`corp.systems.${c}`)}</span>`)}</div>
          ${systems.map(p => h`<button class="c-tr" data-action="open-profile" data-id="${p.id}">
            <span><b>${p.name}</b><small class="muted">${t(p.blurb)}</small></span>
            <span>${p.mm ? `${p.mm} mm` : '–'}</span><span>${p.chambers ?? '–'}</span>${COLS.includes('thermal') ? h`<span>${p.uf != null ? FE.num(p.uf) : '–'}</span>` : ''}</button>`)}
        </div>
      </section>
      <section class="c-section c-split">
        <div><h2>${t('corp.production.title')}</h2><div class="prose">${raw(w.html)}</div></div>
        ${site.factory ? h`<figure class="c-photo"><img src="${site.factory}" alt="" loading="lazy"></figure>` : ''}
      </section>
      <section class="c-section">
        <header class="c-head"><h2>${t('corp.locations.title')}</h2><p class="muted">${t('corp.locations.lead')}</p></header>
        <div class="c-table c-locations">
          <div class="c-tr c-th"><span>${t('corp.locations.title')}</span><span>${t('corp.locations.address')}</span><span>${t('corp.locations.phone')}</span><span></span></div>
          ${shops.map(sh => h`<div class="c-tr"><span><b>${FE.loc(sh.name)}</b></span><span>${FE.loc(sh.address)}</span>
            <span><a href="tel:${sh.phone.replace(/\s/g, '')}">${sh.phone}</a></span>
            <span class="row"><button class="btn ghost small" data-action="map" data-id="${sh.id}">${icon('pin', 16)} ${t('shops.map')}</button></span></div>`)}
        </div>
      </section>
      <section class="c-section"><h2>${t('home.faq')}</h2><div class="faq">${faq.map(f => h`<details><summary>${FE.loc(f.q)}</summary><p class="muted">${FE.loc(f.a)}</p></details>`)}</div></section>
      <section class="c-cta"><div><h2>${t('corp.cta.title')}</h2><p>${t('corp.cta.lead')}</p></div>
        <div class="row"><a class="btn primary lg" href="#/calculator">${t('corp.offer')}</a><button class="btn ghost lg" data-action="callback">${icon('phone', 20)} ${m.cta_secondary}</button></div></section>`);
  };
})();
