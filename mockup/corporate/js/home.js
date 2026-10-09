/* Corporate home: a manufacturer's company page. Replaces FE.views.home; every other view is shared with the default app.
   Company figures come from the strings in skin.js (the company's own claims); counts and K values are computed from the catalogue. */
(() => {
  const { h, t, icon } = FE;
  const set = (host, tpl) => { host.innerHTML = tpl.toString(); };
  const list = key => FE.content[FE.store.get('lang')].corp[key];
  const sec = (cls, id, inner) => h`<section class="c-sec ${cls}" aria-labelledby="${id}"><div class="wrap">${inner}</div></section>`;
  const head = (id, title, lead) => h`<header class="c-head"><h2 id="${id}">${title}</h2>${lead ? h`<p class="muted">${lead}</p>` : ''}</header>`;
  const tel = s => String(s).replace(/\s/g, '');

  /* K of finished products (W/m²K) per profile, from the catalogue; premium systems carry the published Ug range instead */
  function thermal(p) {
    const k = FE.db.products.filter(x => x.profile === p.id && x.uf).map(x => +x.uf);
    if (k.length) return `K ${FE.num(Math.min(...k))}–${FE.num(Math.max(...k))}`;
    return p.tier >= 2 ? `Ug ${FE.num(1)}${FE.store.get('lang') === 'ro' ? ',0' : '.0'}–${FE.num(1.3)}` : '–';
  }

  FE.views.home = async host => {
    const { data: w } = await FE.api.get('/welcome'), m = w.meta, site = FE.data.site, c = list('figures');
    FE.ambient.page = null; FE.ambient.setPicture(null);
    const fig = [[c.since, FE.config.brand.since], [c.factory, FE.config.brand.factory], [c.glass, FE.num(1000) + '+'], [c.dealers, 61], [c.warranty, 5]];
    const count = id => FE.db.products.filter(p => p.cat === id).length;
    const photoOf = id => FE.db.products.find(p => p.cat === id && p.images[0])?.images[0].src;
    set(host, h`<div class="c-home">
      <section class="c-hero" ${site.hero ? h`style="--hero:url('${new URL(site.hero, document.baseURI).href}')"` : ''}><div class="wrap">
        <div class="c-hero-copy">
          <p class="c-kicker">${m.eyebrow}</p>
          <h1>${m.title}</h1>
          <p class="lead">${m.lead}</p>
          <div class="row"><a class="btn primary lg" href="#/calculator">${t('corp.offer')}</a><button type="button" class="btn ghost lg" data-action="callback">${icon('phone', 20)} ${t('corp.hero.cta2')}</button></div>
        </div></div></section>
      <section class="c-figs" aria-label="${m.eyebrow}"><div class="wrap"><dl>${fig.map(([k, v]) => h`<div><dt>${k}</dt><dd>${v}</dd></div>`)}</dl><p class="small">${t('corp.hero.note')}</p></div></section>

      ${sec('', 'h-sys', h`${head('h-sys', t('corp.systems.title'), t('corp.systems.lead'))}
        <div class="c-systems">${FE.db.profiles.map(p => h`<article class="c-sys${p.tier >= 3 ? ' premium' : ''}">
          ${site.systems?.[p.site] ? h`<img src="${site.systems[p.site]}" alt="" loading="lazy">` : ''}
          <div class="c-sys-body"><h3>${p.name}${p.tier >= 3 ? h` <span class="c-tag">${t('corp.systems.premium')}</span>` : ''}</h3>
            <p class="muted small">${t(p.blurb)}</p>
            <dl class="c-spec"><div><dt>${t('corp.systems.depth')}</dt><dd>${p.mm ? p.mm + ' mm' : '–'}</dd></div><div><dt>${t('corp.systems.chambers')}</dt><dd>${p.chambers ?? '–'}</dd></div><div><dt>${t('corp.systems.seals')}</dt><dd>${p.seals ?? '–'}</dd></div><div><dt>${t('corp.systems.thermal')}</dt><dd>${thermal(p)}</dd></div></dl>
            <button type="button" class="c-more" data-action="open-profile" data-id="${p.id}">${t('corp.systems.sheet')} ${icon('chevron', 16)}</button></div></article>`)}</div>
        <p class="muted small">${t('corp.systems.note')}</p>`)}

      ${sec('alt', 'h-range', h`${head('h-range', t('corp.range.title'))}
        <div class="c-tiles">${FE.db.categories.map(k => h`<a class="c-tile" href="#/c/${k.id}">
          ${photoOf(k.id) ? h`<img src="${photoOf(k.id)}" alt="" loading="lazy">` : ''}
          <div><h3>${t(`cat.${k.id}.title`)}</h3><p class="muted small">${t(`cat.${k.id}.lead`)}</p>
          <span class="c-more">${t('corp.range.items', { n: count(k.id) })} · ${t('corp.range.see')} ${icon('chevron', 16)}</span></div></a>`)}</div>`)}

      ${sec('band', 'h-cfg', h`<div class="c-config"><div><h2 id="h-cfg">${t('corp.config.title')}</h2><p>${t('corp.config.lead')}</p><a class="btn primary lg" href="#/calculator">${t('corp.config.open')}</a></div>
        <ul>${list('config').list.map(x => h`<li>${icon('check', 20)}<span>${x}</span></li>`)}</ul></div>`)}

      ${sec('', 'h-why', h`${head('h-why', t('corp.why.title'))}
        <ul class="c-why">${list('why').items.map(([i, ti, li]) => h`<li>${icon(i, 28)}<h3>${ti}</h3><p class="muted small">${li}</p></li>`)}</ul>`)}

      ${sec('alt', 'h-cert', h`${head('h-cert', t('corp.certs.title'))}
        <ul class="c-certs">${list('certs').items.map(([a, b]) => h`<li><b>${a}</b><span class="muted small">${b}</span></li>`)}</ul>`)}

      ${sec('', 'h-proc', h`${head('h-proc', t('corp.process.title'))}
        <ol class="c-steps">${list('process').steps.map(([a, b]) => h`<li><h3>${a}</h3><p class="muted small">${b}</p></li>`)}</ol>`)}

      ${sec('alt', 'h-refs', h`${head('h-refs', t('corp.refs.title'))}
        <table class="c-refs"><thead><tr><th scope="col">${t('corp.refs.col.name')}</th><th scope="col">${t('corp.refs.col.what')}</th><th scope="col">${t('corp.refs.col.since')}</th></tr></thead>
          <tbody>${list('refs').rows.map(([a, b, s]) => h`<tr><th scope="row">${a}</th><td>${b}</td><td>${s}</td></tr>`)}</tbody></table>`)}

      ${sec('', 'h-docs', h`${head('h-docs', t('corp.docs.title'))}
        <ul class="c-docs">
          <li><a href="#/page/warranty"><span class="c-tag">${t('corp.docs.type.page')}</span><span>${t('corp.docs.warranty')}</span>${icon('chevron', 16)}</a></li>
          <li><a href="#/page/about"><span class="c-tag">${t('corp.docs.type.page')}</span><span>${t('corp.docs.about')}</span>${icon('chevron', 16)}</a></li>
          <li><a href="#/calculator/summary"><span class="c-tag">${t('corp.docs.type.pdf')}</span><span>${t('corp.docs.summary')}</span>${icon('chevron', 16)}</a></li>
          ${FE.db.profiles.filter(p => p.tier >= 3).map(p => h`<li><button type="button" data-action="open-profile" data-id="${p.id}"><span class="c-tag">${t('corp.docs.type.sheet')}</span><span>${t('corp.docs.systemSheet', { name: p.name })}</span>${icon('chevron', 16)}</button></li>`)}
        </ul>`)}

      ${sec('alt', 'h-contact', h`${head('h-contact', t('corp.contact.title'), t('corp.contact.lead'))}
        <div class="c-contact">
          <div class="c-card"><h3>${t('corp.contact.callcenter')}</h3><ul>${FE.db.callCenter.map(n => h`<li><a href="tel:${tel(n)}">${n}</a></li>`)}</ul><p class="muted small">${t('phone.hours')}</p>
            <h3>${t('corp.contact.service')}</h3><p><a href="tel:${tel(FE.db.service)}">${FE.db.service}</a></p>
            <button type="button" class="btn primary" data-action="callback">${icon('phone', 18)} ${t('corp.hero.cta2')}</button></div>
          <table class="c-shops"><caption class="sr-only">${t('corp.contact.shops')}</caption>
            <thead><tr><th scope="col">${t('corp.contact.shops')}</th><th scope="col">${t('corp.contact.address')}</th><th scope="col">${t('corp.contact.phone')}</th><th scope="col"><span class="sr-only">${t('shops.map')}</span></th></tr></thead>
            <tbody>${FE.db.shops.map(s => h`<tr><th scope="row">${FE.loc(s.name)}</th><td>${FE.loc(s.address)}</td><td><a href="tel:${tel(s.phone)}">${s.phone}</a></td>
              <td><button type="button" class="btn ghost small" data-action="map" data-id="${s.id}">${icon('pin', 16)} ${t('shops.map')}</button></td></tr>`)}</tbody></table>
        </div>`)}
    </div>`);
  };
})();
