/* Configurator: one live page. Type, opening, size, finish and quantity update a to-scale sketch and the price together.
   The sketch (FE.ui.scheme) is also used by the cart. A configured line is {custom, unit, qty}; custom holds the choices. */
(() => {
  const { h, raw, t, money, icon, ui } = FE;
  const byId = (list, id) => list.find(x => x.id === id);
  const C = () => FE.config.calc;
  const CUSTOM_KEYS = ['type', 'side', 'w', 'h', 'profile', 'color', 'glass', 'install'];

  /* ---------- sketch: frame, glass, opening symbols (DIN: lines meet at the hinge, dashed = tilt) ---------- */
  ui.scheme = (c, { dims = false, label = '' } = {}) => {
    const spec = C().types[c.type], hex = byId(FE.db.colors, c.color)?.hex || '#f4f6f8';
    const longest = 220, ratio = c.w / c.h;
    const W = ratio >= 1 ? longest : Math.round(longest * ratio), H = ratio >= 1 ? Math.round(longest / ratio) : longest;
    const pad = dims ? 26 : 3, f = Math.max(7, Math.round(Math.min(W, H) * .06)), gid = 's' + (++ui.schemeId || (ui.schemeId = 1));
    const gx = pad + f, gy = pad + f, gw = W - 2 * f, gh = H - 2 * f;
    const threshold = c.type === 'balcony' ? 8 : 0, sh = gh - threshold;
    const n = spec.sashes, sw = n === 2 ? gw / 2 : gw;
    const sashes = n === 0 ? [{ x: gx, y: gy, w: gw, h: sh, hinge: null, tilt: false }]
      : n === 2 ? [{ x: gx, y: gy, w: sw, h: sh, hinge: 'left', tilt: c.side === 'left' }, { x: gx + sw, y: gy, w: sw, h: sh, hinge: 'right', tilt: c.side === 'right' }]
      : [{ x: gx, y: gy, w: gw, h: sh, hinge: spec.handed ? c.side : null, tilt: true }];
    const ins = 5, line = 'stroke="var(--glass-line)" stroke-width="1.1" stroke-linejoin="round" fill="none"';
    const body = sashes.map(s => {
      const gxi = s.x + (n ? ins : 0), gyi = s.y + (n ? ins : 0), gwi = s.w - (n ? 2 * ins : 0), ghi = s.h - (n ? 2 * ins : 0);
      const turn = s.hinge ? (s.hinge === 'left' ? `M${gxi + gwi} ${gyi} L${gxi} ${gyi + ghi / 2} L${gxi + gwi} ${gyi + ghi}` : `M${gxi} ${gyi} L${gxi + gwi} ${gyi + ghi / 2} L${gxi} ${gyi + ghi}`) : '';
      const tilt = n && s.tilt ? `M${gxi} ${gyi} L${gxi + gwi / 2} ${gyi + ghi} L${gxi + gwi} ${gyi}` : '';
      const hx = s.hinge === 'right' ? gxi + 4 : gxi + gwi - 6;
      const hnd = s.hinge ? `<rect x="${hx}" y="${gyi + ghi / 2 - 8}" width="3" height="16" rx="1.5" fill="rgb(40 40 40 / .75)"/>` : '';
      return `${n ? `<rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" fill="${hex}" stroke="rgb(0 0 0 / .25)"/>` : ''}
        <rect x="${gxi}" y="${gyi}" width="${gwi}" height="${ghi}" fill="url(#${gid})" stroke="rgb(0 0 0 / .28)"/>
        ${c.glass === 'matt' ? `<rect x="${gxi}" y="${gyi}" width="${gwi}" height="${ghi}" fill="#fff" opacity=".5"/>` : ''}
        ${c.glass === 'lowe' ? `<rect x="${gxi}" y="${gyi}" width="${gwi}" height="${ghi}" fill="#6fc7a4" opacity=".16"/>` : ''}
        ${c.glass === 'triple' ? `<rect x="${gxi + 5}" y="${gyi + 5}" width="${gwi - 10}" height="${ghi - 10}" fill="none" stroke="var(--glass-line)" stroke-width=".8"/>` : ''}
        ${turn ? `<path d="${turn}" ${line}/>` : ''}${tilt ? `<path d="${tilt}" ${line} stroke-dasharray="4 3"/>` : ''}${hnd}`;
    }).join('');
    const mullion = n === 2 ? `<rect x="${gx + sw - 2}" y="${gy}" width="4" height="${sh}" fill="${hex}" stroke="rgb(0 0 0 / .25)" stroke-width=".6"/>` : '';
    const sill = threshold ? `<rect x="${gx}" y="${gy + sh}" width="${gw}" height="${threshold}" fill="#8b929a"/>` : '';
    const dim = dims ? `<g class="dim" font-size="11" text-anchor="middle" fill="var(--text-2)"><text x="${pad + W / 2}" y="${pad + H + 18}">${c.w} mm</text><text transform="translate(${pad - 10} ${pad + H / 2}) rotate(-90)">${c.h} mm</text></g>` : '';
    const vb = `0 0 ${W + 2 * pad} ${H + 2 * pad}`;
    return h`<svg class="scheme" viewBox="${vb}" ${raw(label ? 'role="img"' : 'aria-hidden="true"')} aria-label="${label}" style="aspect-ratio:${W + 2 * pad}/${H + 2 * pad}">
      <defs><linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--glass-a)"/><stop offset="1" stop-color="var(--glass-b)"/></linearGradient></defs>
      <rect x="${pad}" y="${pad}" width="${W}" height="${H}" rx="3" fill="${hex}" stroke="rgb(0 0 0 / .3)"/>${raw(body)}${raw(mullion)}${raw(sill)}${raw(dim)}</svg>`;
  };

  /* mini sketch used on the type tiles */
  const miniScheme = type => ui.scheme({ type, side: 'left', w: type === 'balcony' ? 90 : type === 'double' ? 160 : type === 'tilt' ? 110 : 100, h: type === 'balcony' ? 210 : type === 'double' ? 120 : type === 'tilt' ? 70 : 120, color: 'white', glass: 'clear' });

  FE.cartLine = {
    name: c => t(`calc.type.${c.type}`),
    detail: c => t('calc.line', { w: c.w, h: c.h, profile: byId(FE.db.profiles, c.profile).name }) + ' · ' + t(`color.${c.color}`) + ' · ' + t(`calc.glass.${c.glass}`)
  };

  FE.views.calculator = async host => {
    const edit = FE.calcEdit; FE.calcEdit = null;
    const s = { ...C().start, ...(edit ? edit.custom : {}) };
    let qty = edit ? edit.qty : C().start.qty, quote = null, seq = 0, timer = 0;
    const profiles = FE.db.profiles.filter(p => p.tier >= 2), types = Object.keys(C().types);
    const radio = (name, value, checked, inner, cls = 'opt block') => h`<label class="${cls}"><input type="radio" name="${name}" value="${value}" ${raw(checked ? 'checked' : '')}>${inner}</label>`;
    const dimField = (k, label) => h`<div class="dim-field"><label class="field" for="cf-${k}"><span>${label}</span><span class="dim-in"><input id="cf-${k}" data-dim="${k}" type="number" inputmode="numeric" step="10" aria-describedby="cf-${k}-msg"><b>mm</b></span></label>
      <input class="dim-range" data-dim="${k}" type="range" step="10" aria-label="${label}"><small class="muted" id="cf-${k}-msg"></small></div>`;

    host.innerHTML = h`<header class="page-head"><h1>${t('calc.title')}</h1><p class="muted">${t('calc.lead')}</p></header>
      <div class="cfg">
        <form class="cfg-main stack" novalidate>
          <section class="cfg-sec acrylic e-2"><h2>1 · ${t('calc.s1')}</h2>
            <div class="type-grid" role="radiogroup" aria-label="${t('calc.type.label')}">${types.map(k => radio('type', k, k === s.type, h`<span class="tile-art">${miniScheme(k)}</span><span><b>${t(`calc.type.${k}`)}</b><small class="muted">${t(`calc.typeHint.${k}`)}</small></span>`, 'opt block tile'))}</div>
            <div data-bind="side"><div class="seg" role="radiogroup" aria-label="${t('calc.side.label')}">${['left', 'right'].map(k => h`<label class="seg-btn"><input type="radio" name="side" value="${k}" ${raw(k === s.side ? 'checked' : '')}>${t(`calc.side.${k}`)}</label>`)}</div>
              <small class="muted">${t('calc.side.hint')}</small></div></section>
          <section class="cfg-sec acrylic e-2"><h2>2 · ${t('calc.s2')}</h2><div class="dims">${dimField('w', t('calc.width'))}${dimField('h', t('calc.height'))}</div>
            <p><button class="btn link small" type="button" data-action="open-measure">${icon('sliders', 16)} ${t('configure.measure')}</button></p></section>
          <section class="cfg-sec acrylic e-2"><h2>3 · ${t('calc.s3')}</h2>
            <div class="sub"><b>${t('profile.title')}</b><div class="grid tiles opts">${profiles.map(p => radio('profile', p.id, p.id === s.profile, h`<span><b>${p.name}</b><small class="muted"> ${p.mm} mm${p.chambers ? ' · ' + t('profile.chambers', { n: p.chambers }) : ''}</small></span>`))}</div></div>
            <div class="sub"><b>${t('configure.color')}</b><div class="row">${FE.db.colors.map(c => h`<label class="swatch"><input type="radio" name="color" value="${c.id}" ${raw(c.id === s.color ? 'checked' : '')}><i style="background:${c.hex}"></i><span class="sr-only">${t(`color.${c.id}`)}</span></label>`)}<output class="muted" data-bind="color-name"></output></div></div>
            <div class="sub"><b>${t('calc.glass.label')}</b><div class="grid tiles opts">${FE.db.glass.map(g => radio('glass', g.id, g.id === s.glass, h`<span>${t(`calc.glass.${g.id}`)}${g.delta ? h` <small class="muted">+${Math.round(g.delta * 100)}%</small>` : ''}</span>`))}</div></div></section>
          <section class="cfg-sec acrylic e-2"><h2>4 · ${t('calc.s4')}</h2>
            <div class="row"><div class="qty" role="group" aria-label="${t('calc.qty')}"><button type="button" class="icon-btn sm" data-action="calc-qty" data-d="-1" aria-label="−">−</button><output data-bind="qty"></output><button type="button" class="icon-btn sm" data-action="calc-qty" data-d="1" aria-label="+">+</button></div>
              <label class="check grow"><input type="checkbox" name="install" ${raw(s.install ? 'checked' : '')}><span>${t('calc.install')}</span><b>+${Math.round(FE.config.catalog.installPct * 100)}%</b></label></div></section>
        </form>
        <aside class="cfg-side">        <div class="cfg-prev acrylic thick e-3"><div class="cfg-art" data-bind="art"></div>
          <div class="cfg-price" aria-live="polite"><span class="muted">${t('calc.total')}</span><b class="price big" data-bind="total">–</b><small class="muted" data-bind="status"></small></div></div>

        <section class="cfg-sum acrylic thick e-3" aria-label="${t('calc.summary')}"><h2>${t('calc.summary')}</h2>${edit ? h`<p class="muted small">${t('calc.editing')}</p>` : ''}
          <p data-bind="desc"></p><dl class="specs" data-bind="lines"></dl>
          <div class="row"><button class="btn primary lg grow" data-action="calc-add">${icon('cart', 20)} ${t(edit ? 'calc.update' : 'calc.add')}</button><button class="btn ghost" data-action="callback">${icon('phone', 18)} ${t('calc.quote')}</button></div>
          <div class="row spread"><button class="btn link small" data-action="calc-reset">${t('calc.reset')}</button><small class="muted">${t('calc.disclaimer')}</small></div></section></aside>
      </div>
      <div class="cfg-bar acrylic thick e-4"><div aria-hidden="true"><small class="muted">${t('calc.total')}</small><b class="price" data-bind="total-bar">–</b></div><button class="btn primary" data-action="calc-add">${icon('cart', 18)} ${t(edit ? 'calc.update' : 'calc.add')}</button></div>`.toString();

    const $ = sel => FE.$(sel, host), $$ = sel => FE.$$(sel, host);
    const num = el => el.value === '' ? NaN : +el.value;
    const fieldName = k => t(k === 'w' ? 'calc.width' : 'calc.height');
    const problem = k => {
      const [min, max] = C().types[s.type][k];
      if (!(s[k] > 0)) return t('calc.errNum', { f: fieldName(k) });
      if (s[k] < min) return t('calc.errMin', { f: fieldName(k), min });
      if (s[k] > max) return t('calc.errMax', { f: fieldName(k), max });
      return '';
    };

    const price = async () => {
      const id = ++seq, bad = problem('w') || problem('h');
      $('[data-bind=status]').textContent = '';
      if (bad) { quote = null; showQuote(); $('[data-bind=status]').textContent = t('calc.invalid'); return; }
      $('[data-bind=status]').textContent = t('calc.pending');
      const r = await FE.api.post('/estimate', { ...s, qty });
      if (id !== seq) return;
      quote = r.ok ? r.data : null; showQuote();
      $('[data-bind=status]').textContent = r.ok ? '' : t('calc.failed');
    };
    const showQuote = () => {
      $('[data-bind=total]').textContent = quote ? money(quote.total) : '–';
      $('[data-bind=total-bar]').textContent = quote ? money(quote.total) : '–';
      $('[data-bind=lines]').innerHTML = quote ? h`<dt>${t('calc.unit')}</dt><dd>${money(quote.unit)}</dd><dt>${t('calc.base')}</dt><dd>${money(quote.base)}</dd>${quote.install ? h`<dt>${t('calc.installCost')}</dt><dd>${money(quote.install)}</dd>` : ''}<dt>${t('calc.total')}</dt><dd><b>${money(quote.total)}</b></dd>`.toString() : '';
      $('[data-bind=desc]').textContent = quote ? t('calc.area', { a: FE.num(quote.area) }) : '';
      $$('[data-action=calc-add]').forEach(b => { b.disabled = !quote; });
    };
    /* push state to the controls, the sketch and the price */
    const sync = ({ price: recalc = true, fields = true } = {}) => {
      const spec = C().types[s.type];
      $('[data-bind=side]').hidden = !spec.handed;
      if (fields) for (const k of ['w', 'h']) {
        const [min, max] = spec[k];
        $$(`[data-dim=${k}]`).forEach(el => { el.min = min; el.max = max; if (el.type === 'range') el.value = FE.clamp(s[k], min, max); else el.value = s[k] || ''; });
      }
      for (const k of ['w', 'h']) {
        const msg = problem(k), [min, max] = spec[k], inp = $(`input[type=number][data-dim=${k}]`);
        inp.setAttribute('aria-invalid', String(!!msg));
        const m = $(`#cf-${k}-msg`); m.textContent = msg || t('calc.range', { min, max }); m.classList.toggle('error', !!msg);
      }
      $('[data-bind=color-name]').textContent = t(`color.${s.color}`);
      $('[data-bind=qty]').textContent = qty;
      const ok = !problem('w') && !problem('h'), shown = ok ? s : { ...s, w: FE.clamp(s.w || spec.w[0], spec.w[0], spec.w[1]), h: FE.clamp(s.h || spec.h[0], spec.h[0], spec.h[1]) };
      $('[data-bind=art]').innerHTML = ui.scheme(shown, { dims: true, label: t('calc.previewLabel', { type: t(`calc.type.${s.type}`), w: shown.w, h: shown.h }) }).toString();
      if (recalc) { clearTimeout(timer); timer = setTimeout(price, C().debounceMs); }
    };

    host.addEventListener('input', e => {
      const el = e.target;
      if (el.dataset.dim) {
        s[el.dataset.dim] = num(el);
        $$(`[data-dim=${el.dataset.dim}]`).forEach(o => { if (o !== el) o.value = el.type === 'range' || !isNaN(s[el.dataset.dim]) ? s[el.dataset.dim] : ''; });
        sync({ fields: false });
      } else if (el.name && el.name in s) {
        s[el.name] = el.type === 'checkbox' ? el.checked : el.value;
        if (el.name === 'type') { const sp = C().types[s.type]; for (const k of ['w', 'h']) if (s[k] > 0) s[k] = FE.clamp(s[k], sp[k][0], sp[k][1]); }
        if (el.name === 'color') FE.store.set({ swatch: byId(FE.db.colors, s.color).delta ? byId(FE.db.colors, s.color).hex : null });
        sync();
      }
    });

    host.addEventListener('submit', e => e.preventDefault());
    const A = FE.actions.register;
    A('calc-qty', (el, ev, d) => { qty = FE.clamp(qty + +d.d, 1, C().maxQty); sync(); });
    A('calc-reset', () => { Object.assign(s, C().start); qty = C().start.qty; $$('input[type=radio],input[type=checkbox]').forEach(el => { el.checked = el.type === 'checkbox' ? s.install : el.value === s[el.name]; }); FE.store.set({ swatch: null }); sync(); });
    A('calc-add', () => {
      if (!quote) return;
      const line = { custom: Object.fromEntries(CUSTOM_KEYS.map(k => [k, s[k]])), unit: quote.perUnit, qty };
      if (edit) FE.cart.update(edit.i, () => line); else FE.cart.add(line);
      FE.toast(t(edit ? 'toast.updated' : 'toast.added'));
      FE.flows.cart();
    });
    sync();
  };
})();
