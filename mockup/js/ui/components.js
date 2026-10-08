/* Reusable, data-driven building blocks. They return raw HTML (already escaped through FE.h). */
(() => {
  const { h, raw, icon, t, money } = FE;
  let gid = 0;
  const byId = (list, id) => list.find(x => x.id === id);
  const ui = FE.ui = {};

  ui.name = p => p.name;
  ui.profile = id => byId(FE.db.profiles, id);

  /* the shop's own photo; falls back to a drawing when a SKU has none */
  ui.img = (p, i = 0, extra = '') => p.images[i]
    ? h`<img class="photo ${extra}" src="${p.images[i].src}" alt="${p.name}" loading="lazy" decoding="async" width="550" height="550">`
    : ui.windowSvg(p);

  /* fallback drawing (also the calculator preview): proportional tilt-and-turn window or door */
  ui.windowSvg = (p, hex = FE.db.colors[0].hex, label = '') => {
    if (p.kind === 'part') return h`<div class="part-art" aria-hidden="true">${icon('tool', 56)}</div>`;
    const id = 'g' + ++gid, max = 100, ratio = p.w / p.h;
    const W = ratio >= 1 ? max : Math.round(max * ratio), H = ratio >= 1 ? Math.round(max / ratio) : max;
    const f = 6, gx = f, gy = f, gw = W - 2 * f, gh = H - 2 * f, mid = gy + gh / 2;
    const door = p.kind === 'door' ? `<rect x="${gx}" y="${gy + gh * .66}" width="${gw}" height="${gh * .34}" fill="${hex}" stroke="rgb(0 0 0 / .18)"/>` : '';
    return h`<svg class="win" viewBox="0 0 ${W} ${H}" role="img" aria-label="${label || p.name || ''}" style="aspect-ratio:${W}/${H}">
      <defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--glass-a)"/><stop offset="1" stop-color="var(--glass-b)"/></linearGradient></defs>
      <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="3" fill="${hex}" stroke="rgb(0 0 0 / .22)"/>
      <rect x="${gx}" y="${gy}" width="${gw}" height="${gh}" rx="1.5" fill="url(#${id})" stroke="rgb(0 0 0 / .25)"/>
      ${raw(door)}
      <g fill="none" stroke="var(--glass-line)" stroke-width="1" stroke-linejoin="round"><path d="M${gx} ${gy} L${gx + gw} ${mid} L${gx} ${gy + gh}"/><path d="M${gx} ${gy + gh} L${gx + gw / 2} ${gy + gh * .35} L${gx + gw} ${gy + gh}"/></g>
      <rect x="${gx + 4}" y="${mid - 5}" width="2.4" height="10" rx="1.2" fill="rgb(40 40 40 / .7)"/>
    </svg>`;
  };

  ui.stock = s => h`<span class="badge" data-tone="${{ in: 'ok', low: 'warn', order: 'info' }[s]}">${t(`stock.${s}`)}</span>`;
  ui.price = n => h`<span class="price">${money(n)}</span><span class="vat muted">${t('product.vat')}</span>`;
  ui.chip = (label, extra = '') => h`<span class="chip ${extra}">${label}</span>`;
  ui.specs = p => {
    if (p.kind === 'part') return '';
    return h`${p.mm ? ui.chip(`${p.mm} mm`) : ''}${p.chambers ? ui.chip(t('profile.chambers', { n: p.chambers })) : ''}${p.uf ? ui.chip(`K ${FE.num(p.uf)}`) : ''}`;
  };

  ui.card = p => h`<article class="card acrylic lift" data-id="${p.id}" data-pic="${p.images[0]?.src || ''}">
    <a class="card-art" href="#/p/${p.id}" aria-label="${p.name}" tabindex="-1">${ui.img(p)}</a>
    <div class="card-body">
      <h3 class="clamp"><a href="#/p/${p.id}">${p.name}</a></h3>
      <div class="row chips">${ui.specs(p)}</div>
      <div class="row spread"><div class="price-block">${ui.price(p.price)}</div>${ui.stock(p.stock)}</div>
      <div class="row card-actions">
        <button class="btn ghost" data-action="quickview" data-id="${p.id}">${t('action.quickview')}</button>
        <button class="btn primary" data-action="add" data-id="${p.id}">${icon('cart', 18)} ${t('action.add')}</button>
      </div>
    </div></article>`;

  ui.skeleton = n => h`${Array.from({ length: n }, () => h`<div class="card skeleton" aria-hidden="true"></div>`)}`;

  ui.field = (id, label, attrs = '', hint = '') => h`<label class="field" for="${id}"><span>${label}</span>
    <input id="${id}" name="${id}" ${raw(attrs)}>${hint ? h`<small class="muted">${hint}</small>` : ''}</label>`;

  ui.mount = (el, tpl) => { el.innerHTML = tpl.toString(); return el; };
})();

/* segmented control: options = ids, labels from `${ns}.${id}` */
FE.ui.segmented = (ns, ids, current, action) => FE.h`<div class="seg" role="radiogroup" aria-label="${FE.t(`${ns}.label`)}">${ids.map(id =>
  FE.h`<button role="radio" aria-checked="${id === current}" class="seg-btn" data-action="${action}" data-value="${id}">${FE.t(`${ns}.${id}`)}</button>`)}</div>`;
