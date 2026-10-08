/* Overlay flows. Each flow is a function that opens a layer; deeper steps open further layers on the stack.
   Product -> Quick view (1) -> Configure (2) -> Profile or Measure guide (3).  Cart (1) -> Checkout (2) -> Confirmation (3). */
(() => {
  const { h, raw, t, money, icon, ui } = FE;
  const byId = (list, id) => list.find(x => x.id === id);
  const product = async id => (await FE.api.get(`/products/${id}`)).data;
  const cartCount = () => FE.store.get('cart').reduce((n, l) => n + l.qty, 0);
  const lineTotal = l => byId(FE.db.products, l.pid).price * l.qty;

  /* variants come from the shop photos: hinge side and insect screen */
  FE.variantsOf = p => ({
    sides: (sides => sides.length > 1 ? sides : [])([...new Set(p.images.map(i => i.side).filter(Boolean))]),
    mesh: new Set(p.images.map(i => i.mesh)).size > 1
  });
  FE.imageFor = (p, sel = {}) => p.images.find(i => i.side === (sel.side ?? i.side) && i.mesh === !!sel.mesh) || p.images.find(i => i.side === sel.side) || p.images[0];
  const defaults = p => { const v = FE.variantsOf(p); return { pid: p.id, side: v.sides[0] || null, mesh: false, qty: 1 }; };

  /* ---------- cart state ---------- */
  const cart = FE.cart = {
    count: cartCount,
    total: () => FE.store.get('cart').reduce((s, l) => s + lineTotal(l), 0),
    add(line) {
      const list = [...FE.store.get('cart')];
      const same = list.find(l => l.pid === line.pid && l.side === line.side && l.mesh === line.mesh);
      same ? same.qty += line.qty : list.push(line);
      FE.store.set({ cart: list });
    },
    update(i, fn) { const list = FE.store.get('cart').map((l, j) => j === i ? fn({ ...l }) : l).filter(l => l.qty > 0); FE.store.set({ cart: list }); },
  };
  FE.defaultLine = defaults;

  const seg = (ns, ids, cur, action) => ui.segmented(ns, ids, cur, action);
  const bar = (v, max) => h`<span class="meter" style="--v:${v / max}"><i></i></span>`;

  /* ---------- level 3: profile detail ---------- */
  FE.flows = {};
  FE.flows.profile = async (id) => {
    FE.overlay.open({
      title: t('profile.title'), size: 'md',
      render(body, ov) {
        const draw = pid => {
          const p = byId(FE.db.profiles, pid), img = FE.data.site.systems?.[p.site];
          ov.setTitle(p.name);
          body.innerHTML = h`${img ? h`<img class="profile-photo" src="${img}" alt="${p.name}" loading="lazy">` : ''}<p class="muted">${t(p.blurb)}</p>
            <dl class="specs">
              <dt>${t('profile.depth')}</dt><dd>${p.mm} mm ${bar(p.mm, 80)}</dd>
              ${p.chambers ? h`<dt>${t('profile.chambersLabel')}</dt><dd>${p.chambers} ${bar(p.chambers, 6)}</dd>` : ''}
              ${p.seals ? h`<dt>${t('profile.sealsLabel')}</dt><dd>${p.seals} ${bar(p.seals, 3)}</dd>` : ''}
            </dl>
            <h3>${t('profile.compare')}</h3>
            <div class="row chips">${FE.db.profiles.map(x => h`<button class="chip btn-chip" aria-pressed="${x.id === pid}" data-action="profile-pick" data-value="${x.id}">${x.name}</button>`)}</div>`.toString();
          FE.ambient.setPicture(img || null);
        };
        body.addEventListener('click', e => { const b = e.target.closest('[data-action="profile-pick"]'); if (b) draw(b.dataset.value); });
        draw(id);
      }
    }).then(() => FE.ambient.setPicture(FE.ambient.page));
  };

  /* ---------- level 3: measuring guide ---------- */
  FE.flows.measure = () => FE.overlay.open({
    title: t('measure.title'), size: 'sm',
    render: body => { body.innerHTML = h`<ol class="steps">${[1, 2, 3].map(n => h`<li><b>${t(`measure.s${n}.t`)}</b><p class="muted">${t(`measure.s${n}.d`)}</p></li>`)}</ol>
      <p class="callout">${icon('shield', 18)} ${t('measure.note')}</p>`.toString(); }
  });

  /* ---------- level 2: configure (variant = hinge side + insect screen, picture follows) ---------- */
  FE.flows.configure = async (pid, lineIndex) => {
    const p = await product(pid);
    const editing = lineIndex != null, v = FE.variantsOf(p);
    const sel = editing ? { ...FE.store.get('cart')[lineIndex] } : defaults(p);
    FE.overlay.open({
      title: t('configure.title'), size: 'lg',
      render(body, ov) {
        const show = () => { const img = FE.imageFor(p, sel); FE.$('.preview', body).innerHTML = h`${img ? h`<img class="photo" src="${img.src}" alt="${p.name}">` : ui.windowSvg(p)}<p class="muted center clamp">${p.name}</p>`.toString(); FE.ambient.setPicture(img?.src || null); };
        body.innerHTML = h`<div class="split"><div class="preview"></div>
          <form class="stack" novalidate>
            ${v.sides.length ? h`<fieldset><legend>${t('configure.side')}</legend><div class="row">${v.sides.map(sd => h`<label class="opt"><input type="radio" name="side" value="${sd}" ${sd === sel.side ? 'checked' : ''}><span>${t(`side.${sd}`)}</span></label>`)}</div></fieldset>` : ''}
            ${v.mesh ? h`<label class="check"><input type="checkbox" name="mesh" ${sel.mesh ? 'checked' : ''}><span>${t('configure.mesh')}</span></label>` : ''}
            <p class="muted small">${t('configure.note')}</p>
            <div class="row">
              ${p.profile ? h`<button type="button" class="btn link" data-action="open-profile" data-id="${p.profile}">${icon('layers', 18)} ${t('configure.profile')}</button>` : ''}
              ${p.kind === 'part' ? '' : h`<button type="button" class="btn link" data-action="open-measure">${icon('sliders', 18)} ${t('configure.measure')}</button>`}
            </div>
            <div class="row spread footer-bar"><div><div class="muted">${t('configure.unit')}</div><div class="price big">${money(p.price)}</div></div>
              <button type="submit" class="btn primary lg">${editing ? t('action.update') : t('action.add')}</button></div>
          </form></div>`.toString();
        show();
        body.addEventListener('change', e => { const f = e.target.closest('form'), d = new FormData(f); sel.side = d.get('side') ?? sel.side; sel.mesh = !!d.get('mesh'); show(); });
        body.addEventListener('submit', e => {
          e.preventDefault();
          editing ? cart.update(lineIndex, l => ({ ...l, ...sel })) : cart.add({ ...sel });
          FE.toast(t(editing ? 'toast.updated' : 'toast.added'));
          FE.overlay.closeAll();
          FE.flows.cart();
        });
      }
    }).then(() => FE.ambient.setPicture(FE.ambient.page));
  };

  /* ---------- level 1: quick view ---------- */
  FE.flows.quickview = async pid => {
    const p = await product(pid), v = FE.variantsOf(p);
    FE.overlay.open({
      title: p.name, size: 'md',
      render: body => {
        body.innerHTML = h`<div class="split"><div class="preview">${ui.img(p)}</div>
          <div class="stack">
            <div class="row chips">${ui.specs(p)}</div>
            <div class="row spread"><div class="price-block">${ui.price(p.price)}</div>${ui.stock(p.stock)}</div>
            <ul class="ticks"><li>${icon('truck', 18)} ${t('trust.delivery')}</li><li>${icon('shield', 18)} ${t('trust.warranty')}</li></ul>
            <div class="row">
              ${v.sides.length ? h`<button class="btn primary" data-action="configure" data-id="${p.id}">${icon('sliders', 18)} ${t('action.configure')}</button>` : h`<button class="btn primary" data-action="add" data-id="${p.id}">${icon('cart', 18)} ${t('action.add')}</button>`}
              <a class="btn ghost" href="#/p/${p.id}">${t('action.details')}</a>
            </div></div></div>`.toString();
        FE.ambient.setPicture(p.images[0]?.src || null);
      }
    }).then(() => FE.ambient.setPicture(FE.ambient.page));
  };

  /* ---------- level 3: confirmation ---------- */
  const confirmation = ref => FE.overlay.open({
    title: t('order.done'), size: 'sm',
    render: (body, ov) => {
      body.innerHTML = h`<div class="center stack"><span class="big-check">${icon('check', 40)}</span><p>${t('order.ref', { ref })}</p><p class="muted">${t('order.next')}</p>
        <button class="btn primary" data-action="overlay-all-close">${t('action.close')}</button></div>`.toString();
    }
  });

  /* ---------- level 2: checkout ---------- */
  FE.flows.checkout = () => FE.overlay.open({
    title: t('checkout.title'), size: 'md',
    render(body) {
      const total = cart.total(), inst = Math.round(total * FE.config.catalog.installPct);
      body.innerHTML = h`<form class="stack" data-form="checkout" novalidate>
        ${ui.field('name', t('form.name'), 'autocomplete="name" required autofocus')}
        ${ui.field('phone', t('form.phone'), 'type="tel" autocomplete="tel" required inputmode="tel"', t('form.phoneHint'))}
        ${ui.field('addr', t('form.address'), 'autocomplete="street-address"')}
        <label class="check"><input type="checkbox" name="install"><span>${t('checkout.install')}</span><b>+${money(inst)}</b></label>
        <p class="error" role="alert" data-bind="err" hidden></p>
        <div class="row spread footer-bar"><div><div class="muted">${t('cart.total')}</div><div class="price big" data-bind="tot">${money(total)}</div></div>
          <button class="btn primary lg" type="submit">${t('checkout.place')}</button></div></form>`.toString();
      const form = FE.$('form', body), tot = FE.$('[data-bind=tot]', body), err = FE.$('[data-bind=err]', body);
      form.addEventListener('change', () => tot.textContent = money(total + (form.install.checked ? inst : 0)));
      form.addEventListener('submit', async e => {
        e.preventDefault();
        const f = Object.fromEntries(new FormData(form));
        const btn = FE.$('button[type=submit]', form); btn.disabled = true;
        const r = await FE.api.post('/orders', { ...f, items: FE.store.get('cart') });
        btn.disabled = false;
        if (!r.ok) { err.hidden = false; err.textContent = t('form.error'); return; }
        FE.store.set({ cart: [] });
        confirmation(r.data.ref);
      });
    }
  });

  /* ---------- level 1: cart drawer ---------- */
  FE.flows.cart = () => {
    FE.store.set({ context: 'cart' });
    return FE.overlay.open({
      kind: 'drawer', title: t('cart.title'), size: 'md',
      render(body, ov) {
        const draw = () => {
          const list = FE.store.get('cart');
          if (!list.length) { body.innerHTML = h`<div class="empty center stack">${icon('cart', 48)}<p>${t('cart.empty')}</p><a class="btn primary" href="#/c/windows" data-action="overlay-all-close">${t('cart.browse')}</a></div>`.toString(); return; }
          const total = cart.total(), left = Math.max(0, FE.config.catalog.freeDeliveryFrom - total);
          body.innerHTML = h`<ul class="lines">${list.map((l, i) => { const p = byId(FE.db.products, l.pid), im = FE.imageFor(p, l); return h`<li class="line">
              <div class="thumb">${im ? h`<img class="photo" src="${im.src}" alt="">` : ui.windowSvg(p)}</div>
              <div class="grow"><b class="clamp">${p.name}</b>
                <div class="muted small">${[l.side && t(`side.${l.side}`), l.mesh && t('configure.mesh')].filter(Boolean).join(' · ')}</div>
                <div class="row spread"><div class="qty" role="group" aria-label="${t('cart.qty')}"><button class="icon-btn sm" data-action="qty" data-i="${i}" data-d="-1" aria-label="−">−</button><output>${l.qty}</output><button class="icon-btn sm" data-action="qty" data-i="${i}" data-d="1" aria-label="+">+</button></div>
                <b>${money(lineTotal(l))}</b></div>
                ${FE.variantsOf(p).sides.length ? h`<button class="btn link small" data-action="edit-line" data-i="${i}">${t('action.edit')}</button>` : ''}</div></li>`; })}</ul>
            <div class="free ${left ? '' : 'done'}"><span class="meter" style="--v:${Math.min(1, total / FE.config.catalog.freeDeliveryFrom)}"><i></i></span>
              <small>${left ? t('cart.freeLeft', { amount: money(left) }) : t('cart.freeDone')}</small></div>
            <div class="row spread footer-bar"><div><div class="muted">${t('cart.total')}</div><div class="price big">${money(total)}</div></div>
              <button class="btn primary lg" data-action="checkout">${t('cart.checkout')}</button></div>`.toString();
        };
        draw();
        const off = FE.store.on((s, p, patch) => { if (!body.isConnected) return off(); if ('cart' in patch) draw(); });
        body.addEventListener('click', e => {
          const b = e.target.closest('[data-action=qty]'); if (b) cart.update(+b.dataset.i, l => (l.qty += +b.dataset.d, l));
        });
      }
    }).then(() => FE.store.set({ context: ctxFor(FE.store.get('route')) }));
  };
  const ctxFor = route => FE.contextFor ? FE.contextFor(route) : 'home';

  /* ---------- level 1: callback request ---------- */
  FE.flows.callback = () => FE.overlay.open({
    title: t('callback.title'), size: 'sm',
    render(body, ov) {
      body.innerHTML = h`<form class="stack" novalidate><p class="muted">${t('callback.lead')}</p>
        ${ui.field('cb-phone', t('form.phone'), 'name="phone" type="tel" autocomplete="tel" inputmode="tel" required autofocus')}
        <p class="error" role="alert" data-bind="err" hidden></p>
        <button class="btn primary lg" type="submit">${t('callback.send')}</button></form>`.toString();
      const form = FE.$('form', body), err = FE.$('[data-bind=err]', body);
      form.addEventListener('submit', async e => {
        e.preventDefault();
        const r = await FE.api.post('/requests', { phone: form.phone.value });
        if (!r.ok) { err.hidden = false; err.textContent = t('form.error'); form.phone.setAttribute('aria-invalid', 'true'); return; }
        ov.close(); FE.toast(t('callback.ok', { ref: r.data.ref }));
      });
    }
  });

  /* ---------- popovers: phone, settings ---------- */
  FE.flows.phone = anchor => FE.overlay.open({
    kind: 'popover', anchor, title: t('phone.title'), size: 'sm',
    render: body => { body.innerHTML = h`<ul class="plain">${FE.db.callCenter.map(n => h`<li><a href="tel:${n.replace(/\s/g, '')}">${icon('phone', 18)} ${n}</a></li>`)}</ul>
      <p class="muted small">${t('phone.hours')}</p><p class="muted small">${t('phone.service')}: <a href="tel:${FE.db.service.replace(/\s/g, '')}">${FE.db.service}</a></p>
      <button class="btn primary block" data-action="callback">${t('callback.title')}</button>`.toString(); }
  });

  FE.flows.settings = anchor => FE.overlay.open({
    kind: 'popover', anchor, title: t('settings.title'), size: 'sm',
    render(body) {
      const draw = () => {
        const s = FE.store;
        body.innerHTML = h`<div class="stack">
          <div><div class="muted small">${t('settings.theme.label')}</div>${seg('settings.theme', FE.config.themes, s.get('theme'), 'set-theme')}</div>
          <div><div class="muted small">${t('settings.layout.label')}</div>${seg('settings.layout', ['auto', ...Object.keys(FE.config.layouts)], s.get('layout'), 'set-layout')}</div>
          <div><div class="muted small">${t('settings.ambient.label')}</div>${seg('settings.ambient', FE.config.ambientModes, s.get('ambient'), 'set-ambient')}</div>
          <div><div class="muted small">${t('settings.bars.label')}</div>${seg('settings.bars', FE.config.barModes, s.get('bars'), 'set-bars')}</div>
          <div><div class="muted small">${t('settings.lang.label')}</div>${seg('settings.lang', FE.config.langs, s.get('lang'), 'set-lang')}</div></div>`.toString();
      };
      draw();
      const off = FE.store.on(() => {
        if (!body.isConnected) return off();
        const focused = document.activeElement?.dataset?.value; draw();
        if (focused) FE.$(`[data-value="${focused}"]`, body)?.focus();
      });
    }
  });

  /* ---------- level 1: store map (Google Maps loads only after the visitor asks) ---------- */
  FE.flows.map = id => {
    const sh = byId(FE.db.shops, id), q = encodeURIComponent(sh.maps_query), m = FE.config.maps;
    FE.overlay.open({
      title: FE.loc(sh.name), size: 'lg',
      render(body) {
        body.innerHTML = h`<p class="muted">${FE.loc(sh.address)}</p>
          <div class="map-box" data-bind="map"><div class="map-consent stack center">${icon('pin', 40)}<p class="muted">${t('map.consent')}</p>
            <button class="btn primary" data-action="map-load">${t('map.show')}</button></div></div>
          <div class="row"><a class="btn ghost" href="${m.search + q}" target="_blank" rel="noopener">${t('map.open')}</a>
            <a class="btn primary" href="${m.route + q}" target="_blank" rel="noopener">${icon('pin', 18)} ${t('shops.route')}</a>
            <a class="btn link" href="tel:${sh.phone.replace(/\s/g, '')}">${icon('phone', 18)} ${sh.phone}</a></div>`.toString();
        FE.$('[data-action=map-load]', body).addEventListener('click', () => {
          FE.$('[data-bind=map]', body).innerHTML = h`<iframe title="${FE.loc(sh.name)}" src="${m.embed + q}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>`.toString();
        });
      }
    });
  };
})();
