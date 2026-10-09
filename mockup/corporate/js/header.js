/* Corporate header and footer, drawn through the FE.skin.shell hook in js/app.js: a utility bar over the main bar with disclosure menus, and a multi-column footer.
   The bottom tab bar (compact layout) is left to the default app. */
(() => {
  const { h, t, icon, store, config } = FE;
  const top = () => FE.$('#top');
  const tel = s => s.replace(/\s/g, '');
  const lang = () => store.get('lang');

  const mega = {
    windows: () => h`
      <div class="m-col"><h3>${t('corp.mega.systems')}</h3><ul>${FE.db.profiles.map(p => h`<li><button type="button" class="m-link" data-action="open-profile" data-id="${p.id}"><b>${p.name}</b><small>${p.mm ? p.mm + ' mm' : ''}</small></button></li>`)}</ul></div>
      <div class="m-col"><h3>${t('corp.mega.range')}</h3><ul><li><a class="m-link" href="#/c/windows"><b>${t('corp.mega.all')}</b><small>${t('corp.mega.windowsRange')}</small></a></li></ul></div>
      <div class="m-col m-feature"><h3>${t('corp.menu.calc')}</h3><p>${t('corp.config.lead')}</p><a class="btn primary" href="#/calculator">${t('corp.mega.configure')}</a></div>`,
    doors: () => h`
      <div class="m-col"><h3>${t('corp.mega.range')}</h3><ul><li><a class="m-link" href="#/c/doors"><b>${t('corp.mega.all')}</b><small>${t('corp.mega.doorsRange')}</small></a></li></ul></div>
      <div class="m-col m-feature"><h3>${t('corp.menu.calc')}</h3><p>${t('corp.mega.doorsConfigure')}</p><a class="btn primary" href="#/calculator">${t('corp.mega.configure')}</a></div>`,
    company: () => h`
      <div class="m-col"><h3>${t('corp.menu.company')}</h3><ul>
        <li><a class="m-link" href="#/page/about"><b>${t('corp.mega.about')}</b><small>${t('corp.mega.companyAbout')}</small></a></li>
        <li><a class="m-link" href="#/page/warranty"><b>${t('corp.mega.warranty')}</b><small>${t('corp.mega.companyWarranty')}</small></a></li>
        <li><a class="m-link" href="#/shops"><b>${t('corp.mega.shops')}</b><small>${t('corp.mega.companyShops')}</small></a></li></ul></div>`
  };
  const trigger = (id, nav, label) => h`<li><button type="button" class="m-item" data-mega="${id}" data-nav="${nav}" aria-expanded="false" aria-controls="mega-${id}"><span>${label}</span>${icon('chevron', 14)}</button></li>`;
  const plain = (nav, route, label) => h`<li><a class="m-item" href="#${route}" data-nav="${nav}"><span>${label}</span></a></li>`;

  function header() {
    const phone = FE.db.callCenter[0];
    top().innerHTML = h`
      <div class="u-bar"><div class="wrap">
        <a href="tel:${tel(phone)}">${icon('phone', 14)} ${phone}</a><span>${t('corp.util.hours')}</span>
        <span class="u-gap"></span>
        <a href="#/shops">${t('corp.util.showroom')}</a><button type="button" class="u-link" data-action="callback">${t('corp.util.dealers')}</button><a href="tel:${tel(FE.db.service)}">${t('corp.util.service')}</a>
        <span class="u-lang" role="group" aria-label="${t('corp.util.lang')}">${config.langs.map(l => h`<button type="button" data-action="set-lang" data-value="${l}" aria-pressed="${l === lang()}">${l.toUpperCase()}</button>`)}</span>
      </div></div>
      <div class="m-bar"><div class="wrap">
        <a class="logo" href="#/" aria-label="${config.brand.name}"><b>FAR</b><span>EST</span></a>
        <nav class="m-nav" aria-label="Main"><ul>
          ${trigger('windows', 'windows', t('corp.menu.windows'))}${trigger('doors', 'doors', t('corp.menu.doors'))}${plain('acc', '/c/accessories', t('corp.menu.acc'))}${plain('calc', '/calculator', t('corp.menu.calc'))}${trigger('company', 'shops', t('corp.menu.company'))}
        </ul></nav>
        <div class="top-actions">
          <a class="icon-btn m-tel" href="tel:${tel(phone)}" aria-label="${t('phone.title')} ${phone}">${icon('phone')}</a>
          <button class="icon-btn m-phone" data-action="phone" aria-label="${t('phone.title')}" aria-haspopup="dialog">${icon('phone')}</button>
          <button class="icon-btn" data-action="settings" aria-label="${t('settings.title')}" aria-haspopup="dialog">${icon('settings')}</button>
          <button class="icon-btn cart-btn" data-action="open-cart" aria-label="${t('cart.title')}">${icon('cart')}<span class="badge-dot" data-bind="cart-count" hidden></span></button>
          <a class="btn primary m-cta" href="#/calculator">${t('corp.offer')}</a>
        </div>
      </div>
      ${Object.keys(mega).map(id => h`<div class="m-panel" id="mega-${id}" hidden><div class="wrap m-grid">${mega[id]()}</div></div>`)}
      </div>`.toString();
  }

  function footer() {
    const phone = FE.db.callCenter[0], f = k => t('corp.foot.' + k);
    FE.$('#foot').innerHTML = h`
      <div class="wrap f-grid">
        <div class="f-brand"><a class="logo" href="#/" aria-label="${config.brand.name}"><b>FAR</b><span>EST</span></a>
          <p>${config.brand.legal}</p><p class="muted small">${t('foot.tag', { year: config.brand.since })}</p></div>
        <div><h2>${f('products')}</h2><ul>
          <li><a href="#/c/windows">${t('corp.menu.windows')}</a></li><li><a href="#/c/doors">${t('corp.menu.doors')}</a></li><li><a href="#/c/accessories">${t('corp.menu.acc')}</a></li><li><a href="#/calculator">${t('corp.menu.calc')}</a></li></ul></div>
        <div><h2>${f('company')}</h2><ul>
          <li><a href="#/page/about">${t('corp.mega.about')}</a></li><li><a href="#/page/warranty">${t('corp.mega.warranty')}</a></li><li><a href="#/shops">${t('corp.mega.shops')}</a></li></ul></div>
        <div><h2>${f('contact')}</h2><ul>
          <li><a href="tel:${tel(phone)}">${phone}</a></li><li class="muted small">${t('phone.hours')}</li>
          <li><a href="tel:${tel(FE.db.service)}">${t('corp.util.service')} ${FE.db.service}</a></li></ul></div>
      </div>
      <div class="f-legal"><div class="wrap"><span>© ${config.brand.legal}. ${f('legal')}</span><span>${t('foot.mock')}</span></div></div>`.toString();
  }

  /* disclosure menus: click toggles, Escape and outside click close, a route change closes */
  function close(focusBack) {
    top().querySelectorAll('[data-mega][aria-expanded="true"]').forEach(b => {
      b.setAttribute('aria-expanded', 'false'); top().querySelector('#mega-' + b.dataset.mega).hidden = true;
      if (focusBack) b.focus();
    });
  }
  let wired = false;
  function wire() {
    if (wired) return; wired = true;
    top().addEventListener('click', e => {
      const b = e.target.closest('[data-mega]');
      if (b) { const open = b.getAttribute('aria-expanded') === 'true'; close(); if (!open) { b.setAttribute('aria-expanded', 'true'); top().querySelector('#mega-' + b.dataset.mega).hidden = false; } return; }
      if (e.target.closest('.m-panel a, .m-panel button')) setTimeout(close);
    });
    document.addEventListener('click', e => { if (!e.target.closest('#top')) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && top().querySelector('[data-mega][aria-expanded="true"]')) { e.stopPropagation(); close(true); } }, true);
    addEventListener('hashchange', () => close());
  }

  FE.skin = { shell() { header(); footer(); wire(); } };
})();
