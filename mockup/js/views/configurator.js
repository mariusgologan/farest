/* Configurator view. Layers: rules (js/cfg/rules.js) decide what is allowed, draw.js pictures it, projects.js stores it,
   FE.api '/quote' prices it. This file only turns state into screens: product -> form -> opening -> size -> finish -> price -> project. */
(() => {
  const { h, raw, t, money, icon } = FE;
  const cfg = FE.cfg, P = FE.projects, draw = cfg.draw;
  const loc = FE.loc;
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const sideLabel = s => t(s === 'stanga' ? 'cfg.left' : 'cfg.right');
  const colourName = id => loc(cfg.colour(id).name);
  const glassName = id => loc(cfg.glass(id).name);
  const num = v => v === '' || v == null ? NaN : Number(v);

  /* ---------- shared texts ---------- */
  const msgFor = e => t(`cfg.perr.${e.code}`) !== `cfg.perr.${e.code}` ? t(`cfg.perr.${e.code}`) : (e.message || t('cfg.perr.storage'));
  const fieldMsg = (k, e, lm) => !e ? '' : e.code === 'empty' ? t('cfg.err.empty', { f: t(`cfg.${k}`) }) : e.code === 'int' ? t('cfg.err.int', { f: t(`cfg.${k}`) })
    : e.code === 'min' ? t('cfg.err.min', { f: t(`cfg.${k}`), v: e.value, min: e.min }) : e.code === 'max' ? t('cfg.err.max', { f: t(`cfg.${k}`), v: e.value, max: e.max }) : t('cfg.err.qty', { max: FE.num(e.max) });
  const dimLine = it => `${it.width} × ${it.height} mm · ${it.quantity} ${t('cfg.pcs')}`;
  const typeName = id => loc(cfg.type(id).name);
  const itemTitle = it => it.product === 'panels' ? t('cfg.panelName') : it.product === 'windows' ? `${t('cfg.window')} · ${loc(cfg.data.forms[cfg.type(it.type).form].name)} · ${typeName(it.type)}` : typeName(it.type);
  /* the specification chips of a line: series, finish, extras */
  const specs = it => {
    if (it.product === 'panels') {
      const p = it.panel, g = cfg.panelGeometry(p);
      return [loc(cfg.panelScheme(p.scheme).name), `${cfg.series(p.series).name} · ${colourName(p.colour)}`, t('cfg.coupling', { n: g.thickness }), ...p.components.map((c, i) => `${i + 1}. ${typeName(c.type)}${c.side ? ' · ' + sideLabel(c.side) : ''} · ${glassName(c.glass)} · ${c.width}×${c.height}`)];
    }
    const ty = cfg.type(it.type), out = [`${cfg.series(it.series).name} · ${cfg.series(it.series).mm} mm`, glassName(it.glass)];
    if (ty.pui) out.push(t('cfg.pui', { n: ty.pui }));
    if (it.side) out.push(t('cfg.opening', { side: sideLabel(it.side) }));
    else out.push(t(ty.parts?.[0]?.k === 'kipp' ? 'cfg.kipp' : 'cfg.fixed'));
    if (cfg.isDoor(it.type)) out.push(t('cfg.inward'));
    if (it.threshold) out.push(loc(cfg.data.thresholds[it.threshold]));
    return out;
  };
  const colourBadge = id => { const c = cfg.colour(id); return h`<span class="cfg-badge"><i class="cfg-dot" style="${raw(draw.swatchStyle(c))}"></i>${colourName(id)}</span>`; };
  const statusBadge = p => h`<span class="cfg-status" data-s="${P.state(p)}">${t(`cfg.status.${P.state(p)}`)}</span>`;
  const fmtDate = d => /^\d{4}-\d{2}-\d{2}$/.test(d || '') ? d.split('-').reverse().join('.') : '';
  const priceText = q => q?.available ? h`${money(q.total)} <small class="muted">${t('product.vat')}</small>` : h`<span class="muted">${t('cfg.noPrice')}</span>`;

  /* ---------- view state (survives navigating away and back) ---------- */
  const V = FE.cfgView = FE.cfgView || { S: null, quote: null, busy: false, editId: null, notice: null, touched: {}, panel: null, pquote: null };
  let host, seq = 0, timer = 0;
  const $ = (s, r = host) => FE.$(s, r);
  const keepFocus = fn => { const k = document.activeElement?.dataset?.key; fn(); if (k) FE.$(`[data-key="${k}"]`, host)?.focus({ preventScroll: true }); };

  const product = () => cfg.product(V.S.product);
  const isPanels = () => V.S.product === 'panels';
  const ctx = () => ({ series: V.S.series, colour: V.S.colour });
  const types = () => cfg.typesFor({ product: V.S.product, form: V.S.form, leaves: V.S.leaves, construction: V.S.construction });

  /* ---------- pricing ---------- */
  const errors = () => cfg.validate(V.S);
  const ready = () => { const e = errors(); return !e.type && !e.side && !e.threshold && !e.width && !e.height && !e.quantity; };
  const invalidate = () => { seq++; clearTimeout(timer); V.quote = null; V.busy = false; };
  const schedule = () => {
    invalidate(); paintFinish(); paintSize();
    if (ready()) timer = setTimeout(quote, 450); else paintReview();
  };
  async function quote() {
    const id = ++seq; V.busy = true; V.quote = null; paintReview();
    const r = await FE.api.post('/quote', { ...V.S });
    if (id !== seq) return;
    V.busy = false; V.quote = r.ok ? r.data : null; V.failed = !r.ok; paintReview();
  }

  /* ---------- state changes (each re-applies the rules, then redraws) ---------- */
  /* a fresh selection; changing the form keeps the finish, changing the product starts clean */
  const reset = (product = V.S.product, keep = {}) => { const prev = V.S, s = cfg.blank(product); if (prev.product === product && ('form' in keep || 'leaves' in keep || 'construction' in keep)) Object.assign(s, { series: prev.series, colour: prev.colour }); Object.assign(s, keep); V.S = cfg.reconcile(s); V.editId = null; V.touched = {}; V.showErrors = false; };
  const choose = patch => { Object.assign(V.S, patch); cfg.reconcile(V.S); V.notice = null; schedule(); paintTop(); };
  const pickType = (id, side) => {
    const s = V.S; s.type = id; s.side = cfg.handed(id) ? side : ''; s.glass = cfg.glassFor(id).includes(s.glass) ? s.glass : cfg.defaultGlass(id);
    cfg.reconcile(s);
    /* a different leaf count or construction changes the width range: do not carry the old width over */
    const lm = cfg.limits(id, s); for (const [k, lo, hi] of [['width', lm.wmin, lm.wmax], ['height', lm.hmin, lm.hmax]]) { const v = num(s[k]); if (v && (v < lo || v > hi)) s[k] = ''; }
    syncInputs(); V.notice = null; schedule(); paintTop();
  };

  /* ---------- painting ---------- */
  const productCards = () => cfg.data.products.map(p => {
    const sample = p.id === 'panels' ? null : cfg.blank(p.id);
    let art;
    if (p.id === 'panels') art = draw.panel({ product: 'panels', panel: { scheme: 'door-side', arrangement: 'door-left', series: 'lumena-esential', colour: 'alb', components: [{ type: 'door-glass-third', side: 'dreapta', glass: 'delta4-lowe', threshold: 'frame', width: 900, height: 2000 }, { type: 'fix', glass: 'f4-lowe', width: 500, height: 1200 }] } });
    else { const type = p.sample, it = { product: p.id, type, side: 'dreapta', colour: 'alb', glass: cfg.defaultGlass(type), series: 'lumena-esential', threshold: 'frame', width: '', height: '' }; art = draw.item(it); void sample; }
    return h`<button class="cfg-card cfg-product" type="button" data-action="cfg-product" data-id="${p.id}" data-key="p-${p.id}" aria-pressed="${V.S.product === p.id}">
      <span class="cfg-art">${art}</span><span class="cfg-card-text"><b>${loc(p.name)}</b><small>${loc(p.hint)}</small></span>
      ${p.equipment ? h`<span class="cfg-equip">${p.equipment.map(e => h`<span>${loc(e)}</span>`)}</span>` : ''}</button>`;
  });

  const typeCard = id => {
    const ty = cfg.type(id), s = V.S, chosen = s.type === id, ok = cfg.available(id, ctx());
    const it = { product: ty.product, type: id, side: chosen ? s.side || 'dreapta' : 'dreapta', colour: s.colour, glass: chosen ? s.glass : cfg.defaultGlass(id), series: s.series, threshold: chosen ? s.threshold : cfg.thresholdsFor(id)[0] || '', width: chosen ? s.width : '', height: chosen ? s.height : '' };
    const th = cfg.thresholdsFor(id);
    return h`<div class="cfg-card cfg-type" data-chosen="${chosen}" ${raw(ok ? '' : 'hidden')}>
      <button class="cfg-type-pick" type="button" data-action="cfg-type" data-id="${id}" data-side="dreapta" data-key="t-${id}" aria-pressed="${chosen}">
        <span class="cfg-art">${draw.item(it)}</span><b>${loc(ty.name)}</b><small>${loc(ty.hint)}</small></button>
      ${cfg.handed(id) ? h`<small class="cfg-cap">${t(ty.sideLabel === 'ddsd' ? 'cfg.sideWhere' : 'cfg.variant')}</small><div class="cfg-sides">${['stanga', 'dreapta'].map(sd => h`<button type="button" class="btn ghost small" data-action="cfg-type" data-id="${id}" data-side="${sd}" data-key="t-${id}-${sd}" aria-pressed="${chosen && s.side === sd}" aria-label="${loc(ty.name)} — ${sideLabel(sd)}">${sd === 'stanga' ? '← ' : ''}${sideLabel(sd)}${sd === 'dreapta' ? ' →' : ''}</button>`)}</div>` : h`<small class="cfg-cap">${t(ty.parts[0].k === 'kipp' ? 'cfg.kipp' : 'cfg.fixed')}</small>`}
      ${th.length > 1 ? h`<label class="cfg-thr">${t('cfg.threshold')}<select data-act-change="cfg-threshold" data-id="${id}" aria-label="${t('cfg.threshold')} — ${loc(ty.name)}">${th.map(x => h`<option value="${x}" ${raw((chosen ? s.threshold : th[0]) === x ? 'selected' : '')}>${loc(cfg.data.thresholds[x])}</option>`)}</select></label>` : ''}</div>`;
  };

  let n = 0; const step = () => `${++n}. `;
  function paintTop() {
    keepFocus(() => {
      n = 0; const s = V.S, p = product(), pr = P.active, ro = P.readOnly(pr);
      const out = [h`<section class="cfg-bar acrylic e-2" aria-label="${t('cfg.project.label')}"><div class="cfg-bar-info"><small class="muted">${t('cfg.project.label')}</small>
          <b>${pr ? pr.name : t('cfg.project.none')}</b><span class="muted small">${pr ? [pr.isDraft ? t('cfg.project.draft') : fmtDate(pr.createdDate), pr.phone, ro ? t('cfg.project.readOnly') : ''].filter(Boolean).join(' · ') : t('cfg.project.create')}</span>${pr ? statusBadge(pr) : ''}</div>
        <div class="row cfg-bar-actions">${pr && !pr.isDraft && pr.items.length && P.nextStatus(pr) ? h`<button class="btn ghost small" data-action="cfg-status" data-s="${P.nextStatus(pr)}">${t('cfg.project.mark', { s: t(`cfg.status.${P.nextStatus(pr)}`) })}</button>` : ''}
          ${ro ? h`<button class="btn ghost small" data-action="cfg-status" data-s="OFERTA">${t('cfg.project.reopen')}</button>` : ''}
          ${pr && !ro ? h`<button class="btn ghost small" data-action="cfg-rename">${t('cfg.project.rename')}</button>` : ''}
          <button class="btn ghost small" data-action="cfg-manager" aria-haspopup="dialog">${t('cfg.project.change')}</button><button class="btn primary small" data-action="cfg-newproject">${t('cfg.project.new')}</button></div></section>`.toString()];
      out.push(h`<section><h2>${t('cfg.pickProduct')}</h2><div class="cfg-products" role="group" aria-label="${t('cfg.pickProduct')}">${productCards()}</div></section>`.toString());
      if (s.product === 'windows') out.push(h`<section><h2>${step()}${t('cfg.pickForm')}</h2><div class="cfg-forms">${Object.entries(cfg.data.forms).map(([id, f]) => {
        const sample = { product: 'windows', type: f.sample, side: 'dreapta', colour: s.colour, glass: 'f4-lowe', series: s.series, width: '', height: '' };
        return h`<button class="cfg-card cfg-product" type="button" data-action="cfg-form" data-id="${id}" data-key="f-${id}" aria-pressed="${s.form === id}"><span class="cfg-art">${draw.item(sample)}</span><span class="cfg-card-text"><b>${loc(f.name)}</b><small>${loc(f.hint)}</small></span></button>`;
      })}</div></section>`.toString());
      if (s.product === 'exterior') {
        const leafCard = c => h`<button class="cfg-card cfg-product" type="button" data-action="cfg-leaves" data-n="${c}" data-key="l-${c}" aria-pressed="${s.leaves === c}"><span class="cfg-art">${draw.item({ product: 'exterior', type: c === 1 ? 'exterior-glass-full' : 'exterior-pui-glass-full', side: 'dreapta', colour: 'alb', glass: 'f4-lowe', series: 'lumena-esential', threshold: 'frame', width: '', height: '' })}</span><span class="cfg-card-text"><b>${t(c === 1 ? 'cfg.oneLeaf' : 'cfg.twoLeaves')}</b><small>${t(c === 1 ? 'cfg.oneLeafHint' : 'cfg.twoLeavesHint')}</small></span></button>`;
        out.push(h`<section><h2>${step()}${t('cfg.pickDoor')}</h2><div class="cfg-forms">${[1, 2].map(leafCard)}</div>
          <h3>${t(s.leaves === 2 ? 'cfg.pickVariantPui' : 'cfg.pickVariant')}</h3><div class="cfg-forms">${p.constructions.map(k => { const c = cfg.data.constructions[k]; return h`<button class="cfg-card cfg-text" type="button" data-action="cfg-construction" data-id="${k}" data-key="c-${k}" aria-pressed="${s.construction === k}"><b>${loc(c.name[s.leaves])}</b><small>${loc(c.hint[s.leaves])}</small></button>`; })}</div></section>`.toString());
      }
      if (!isPanels()) {
        const list = types();
        out.push(h`<section><h2>${step()}${t(s.product === 'windows' ? 'cfg.pickOpening' : 'cfg.pickModel')}</h2><p class="muted small">${t(s.product === 'windows' ? 'cfg.openingHint' : 'cfg.doorHint')}</p>
          <div class="cfg-types" style="--n:${list.length}">${list.map(typeCard)}</div></section>`.toString());
      }
      $('#c-top').innerHTML = out.join('');
      $('#c-size').hidden = isPanels() || !s.type; $('#c-finish').hidden = isPanels() || !s.type; $('#c-review').hidden = isPanels();
      $('#c-panel').hidden = !isPanels();
      paintFinish(); paintSize(); paintAside();
      if (isPanels()) paintPanel(); else paintReview();
    });
  }

  /* size: the inputs are built once, so typing never loses focus; this only refreshes limits and messages */
  function buildSize() {
    $('#c-size').innerHTML = h`<h2 data-bind="size-h"></h2><div class="cfg-dims">
      ${['width', 'height'].map(k => h`<div class="cfg-dim"><label class="field" for="cf-${k}"><span>${t(`cfg.${k}`)} (mm)</span><input id="cf-${k}" data-dim="${k}" type="number" inputmode="numeric" step="1" aria-describedby="cf-${k}-m"></label><small id="cf-${k}-m" class="muted"></small></div>`)}
      <div class="cfg-dim"><label class="field" for="cf-quantity"><span>${t('cfg.qty')}</span><input id="cf-quantity" data-dim="quantity" type="number" inputmode="numeric" step="1" min="1" aria-describedby="cf-quantity-m"></label><small id="cf-quantity-m" class="muted"></small></div></div>
      <p class="muted small" data-bind="limits"></p><p><button class="btn link small" type="button" data-action="open-measure">${icon('sliders', 16)} ${t('configure.measure')}</button></p>`.toString();
  }
  function syncInputs() { for (const k of ['width', 'height', 'quantity']) { const el = $(`#cf-${k}`); if (el && document.activeElement !== el) el.value = V.S[k]; } }
  function paintSize() {
    const s = V.S, e = errors(), lm = s.type ? cfg.limits(s.type, s) : null;
    $('[data-bind=size-h]').textContent = `${step2()}${t(cfg.isDoor(s.type) ? 'cfg.sizeDoor' : 'cfg.sizeWindow')}`;
    for (const k of ['width', 'height', 'quantity']) {
      const el = $(`#cf-${k}`), msg = V.touched[k] || V.showErrors ? fieldMsg(k, e[k]) : '';
      if (document.activeElement !== el) el.value = s[k];
      el.setAttribute('aria-invalid', String(!!msg));
      const range = lm && k !== 'quantity' ? t('cfg.range', { min: k === 'width' ? lm.wmin : lm.hmin, max: k === 'width' ? lm.wmax : lm.hmax }) : k === 'quantity' ? t('cfg.range', { min: 1, max: FE.num(cfg.data.pricing.maxQty) }) : '';
      const m = $(`#cf-${k}-m`); m.textContent = msg || range; m.classList.toggle('error', !!msg);
    }
    $('[data-bind=limits]').textContent = lm ? t('cfg.limits', { w1: lm.wmin, w2: lm.wmax, h1: lm.hmin, h2: lm.hmax }) : '';
  }
  const step2 = () => `${(product().forms || product().leaves ? 3 : 2)}. `;

  function infoBtn(kind, id, label) { return h`<button class="cfg-info" type="button" data-action="cfg-info" data-kind="${kind}" data-id="${id}" aria-haspopup="dialog" aria-label="${label}">${kind === 'series' ? draw.profile(id) : h`<i style="${raw(kind === 'colour' ? draw.swatchStyle(cfg.colour(id)) : draw.glassStyle(id))}"></i>`}</button>`; }
  function paintFinish() {
    const s = V.S; if (!s.type) return;
    const colours = cfg.coloursFor({ product: s.product, series: s.series, type: s.type }), glass = cfg.glassFor(s.type);
    const series = cfg.seriesFor(s.product);
    const door = cfg.isDoor(s.type);
    keepFocus(() => {
      $('#c-finish').innerHTML = h`<h2>${(product().forms || product().leaves ? 4 : 3)}. ${t(door ? 'cfg.finishDoor' : 'cfg.finish')}</h2><div class="cfg-finish">
        <div class="cfg-col"><small>${t('cfg.series')}</small>${series.map(x => h`<div class="cfg-row"><button type="button" class="cfg-choice" data-action="cfg-series" data-id="${x.id}" data-key="s-${x.id}" aria-pressed="${s.series === x.id}">${x.name} · ${x.mm} mm · ${t('profile.chambers', { n: x.chambers })}</button>${infoBtn('series', x.id, t('cfg.profileSection', { name: x.name }))}</div>`)}</div>
        <div class="cfg-col"><small>${t('cfg.colour')}</small>${colours.map(c => h`<div class="cfg-row"><button type="button" class="cfg-choice" data-action="cfg-colour" data-id="${c}" data-key="c-${c}" aria-pressed="${s.colour === c}">${colourName(c)}</button>${infoBtn('colour', c, t('cfg.texture', { name: colourName(c) }))}</div>`)}</div>
        <div class="cfg-col"><small>${t(door ? 'cfg.material' : 'cfg.glass')}</small>${glass.map(g => h`<div class="cfg-row"><button type="button" class="cfg-choice" data-action="cfg-glass" data-id="${g}" data-key="g-${g}" aria-pressed="${s.glass === g}">${glassName(g)}</button>${infoBtn('glass', g, glassName(g))}</div>`)}</div></div>`.toString();
    });
  }

  function paintReview() {
    const s = V.S, e = errors(), box = $('#c-review'), q = V.quote, pr = P.active, ro = P.readOnly(pr);
    const title = door => t(door ? 'cfg.configuredDoor' : 'cfg.configuredWindow');
    let body;
    if (!s.type) body = h`<p class="muted">${t('cfg.pickFirst')}</p>`;
    else if (V.busy) body = h`<div class="cfg-loading" role="status"><span class="cfg-loading-win" aria-hidden="true"><i></i><i></i><i></i><i></i></span><div><b>${t('cfg.calculating')}</b><small class="muted">${t('cfg.calculatingHint')}</small></div></div>`;
    else if (!ready()) body = h`<p class="muted">${t('cfg.completeSize')}</p>`;
    else if (V.failed) body = h`<p class="error" role="alert">${t('cfg.quoteFailed')}</p>`;
    else if (q) body = h`<p><b>${itemTitle(s)}</b></p><p class="cfg-dimline">${dimLine(s)}</p><ul class="cfg-specs">${specs(s).map(x => h`<li>${x}</li>`)}</ul>
      ${q.available ? h`<p>${t('cfg.unit')}: <b>${money(q.unit)}</b> <small class="muted">${t('product.vat')}</small></p><h3 class="price big">${t('cfg.total')}: ${money(q.total)}</h3>` : h`<p class="muted">${q.message || t('cfg.noPrice')}</p><p class="muted small">${t('cfg.saveNoPrice')}</p>`}`;
    else body = '';
    const canAdd = !!q && !V.busy && !ro;
    box.innerHTML = h`<h2>${s.type ? title(cfg.isDoor(s.type)) : t('cfg.configuredWindow')}</h2><div class="cfg-review acrylic thick e-3"><div class="cfg-review-art">${s.type ? draw.item(s, { dims: true, label: t('cfg.previewLabel', { type: typeName(s.type), w: s.width || '–', h: s.height || '–' }) }) : ''}</div>
      <div class="cfg-review-body" aria-live="polite">${body}<p class="error" role="alert" data-bind="status"></p>
        <div class="row"><button class="btn primary lg" data-action="cfg-add" ${raw(canAdd ? '' : 'disabled')}>${icon('cart', 18)} ${t(V.editId ? 'cfg.saveChanges' : 'cfg.addToProject')}</button>
          ${V.editId ? h`<button class="btn ghost" data-action="cfg-cancel-edit">${t('action.close')}</button>` : ''}</div>
        ${ro ? h`<p class="muted small">${t('cfg.project.locked', { s: t(`cfg.status.${P.state(pr)}`) })}</p>` : ''}</div></div>
      <div class="cfg-notice" data-bind="notice" tabindex="-1" aria-live="polite" ${raw(V.notice ? '' : 'hidden')}>${V.notice ? h`<h3>${V.notice.title}</h3><p>${t('cfg.another?')}</p><div class="row"><button class="btn primary" data-action="cfg-another">${t('cfg.another')}</button><a class="btn ghost" href="#/calculator/summary">${t('cfg.viewSummary')}</a></div>` : ''}</div>`.toString();
    /* compact screens: the price and the add button stay in reach above the tab bar while the form is edited */
    const bar = $('#c-bar'); bar.hidden = isPanels() || !s.type;
    if (!bar.hidden) bar.innerHTML = h`<div aria-hidden="true"><small class="muted">${t('cfg.total')}</small><b class="price">${q?.available ? money(q.total) : '–'}</b></div><button class="btn primary" data-action="cfg-add" ${raw(canAdd ? '' : 'disabled')}>${icon('cart', 18)} ${t(V.editId ? 'cfg.saveChanges' : 'cfg.addToProject')}</button>`.toString();
    paintDecorTeaser();
  }

  function paintAside() {
    const pr = P.active, ro = P.readOnly(pr), items = pr?.items || [];
    const rows = items.map((it, i) => h`<article class="cfg-line"><div class="cfg-line-art">${draw.item(it)}${it.product === 'panels' ? '' : colourBadge(it.colour)}</div>
      <div class="cfg-line-info"><b>${i + 1}. ${itemTitle(it)}</b><p class="cfg-dimline">${dimLine(it)}</p><ul class="cfg-specs">${specs(it).slice(0, 4).map(x => h`<li>${x}</li>`)}</ul><p>${priceText(it.quote)}</p>
        ${ro ? '' : h`<div class="row cfg-line-actions"><button class="btn link small" data-action="cfg-edit" data-id="${it.id}">${t('action.edit')}</button><button class="btn link small" data-action="cfg-dup" data-id="${it.id}">${t('cfg.duplicate')}</button><button class="btn link small" data-action="cfg-del" data-id="${it.id}">${t('cfg.delete')}</button></div>`}</div></article>`);
    const priced = pr ? P.priced(pr) : 0, total = pr ? P.total(pr) : 0;
    $('#c-aside').innerHTML = h`<section class="cfg-project acrylic thick e-3"><h2>${t('cfg.projectItems')}</h2>${items.length ? h`<div>${rows}</div>
      <p class="muted small">${items.length} ${t(items.length === 1 ? 'cfg.config1' : 'cfg.configN')} · ${P.pieces(pr)} ${t('cfg.pcs')}</p>
      <p class="cfg-total">${priced === items.length ? h`${t('cfg.projectTotal')}: <b>${money(total)}</b>` : h`${t('cfg.subtotal')}: <b>${money(total)}</b> · ${items.length - priced} ${t('cfg.unpriced')}`}</p>` : h`<p class="muted">${t('cfg.emptyProject')}</p>`}
      <p class="muted small">${ro ? t('cfg.project.locked', { s: t(`cfg.status.${P.state(pr)}`) }) : pr?.isDraft ? t('cfg.project.unsaved') : t('cfg.project.saved')}</p>
      <a class="btn ghost" href="#/calculator/summary" ${raw(items.length ? '' : 'aria-disabled="true" tabindex="-1"')}>${t('cfg.viewSummary')}</a></section><div data-bind="decor"></div>`.toString();
    paintDecorTeaser();
  }
  function paintDecorTeaser() {
    const slot = $('[data-bind=decor]', host); if (!slot) return;
    const door = !isPanels() && V.S.type && cfg.isDoor(V.S.type) && V.S.type.startsWith('door') || (!isPanels() && V.S.type?.startsWith('exterior'));
    slot.innerHTML = door ? h`<button class="cfg-card cfg-decor" data-action="cfg-decor"><span class="cfg-art">${draw.room({ ...V.S, width: V.S.width || 1000, height: V.S.height || 2100 }, cfg.data.rooms[0], false)}</span><b>${t('cfg.decor')} ↗</b><small>${t('cfg.decorHint', { n: cfg.data.rooms.length })}</small></button>`.toString() : '';
  }

  /* ---------- panels: two coupled units ---------- */
  const newPanel = () => ({ scheme: 'windows-side', arrangement: 'door-left', series: 'lumena-esential', colour: 'alb', components: [0, 1].map(() => ({ type: '', side: '', glass: '', threshold: '', width: '', height: '' })) });
  const PN = () => V.panel || (V.panel = newPanel());
  function panelModels(i) {
    const p = PN(), D = cfg.data.panels, door = cfg.panelDoorIndex(p) === i;
    return (door ? D.doorTypes : D.windowTypes).filter(id => cfg.available(id, { series: p.series, colour: p.colour }));
  }
  function panelFix(reset = false) {
    const p = PN(), D = cfg.data.panels;
    if (!D.series.includes(p.series)) p.series = D.series[0];
    if (!D.colours.includes(p.colour)) p.colour = D.colours[0];
    p.components.forEach((c, i) => {
      if (reset) Object.assign(c, { type: '', side: '', glass: '', threshold: '', width: '', height: '' });
      if (c.type && !panelModels(i).includes(c.type)) Object.assign(c, { type: '', side: '', glass: '', threshold: '' });
      if (c.type) {
        if (!cfg.glassFor(c.type).includes(c.glass)) c.glass = cfg.defaultGlass(c.type);
        if (!cfg.thresholdsFor(c.type).includes(c.threshold)) c.threshold = cfg.thresholdsFor(c.type)[0] || '';
        if (!cfg.handed(c.type)) c.side = '';
      }
    });
    if (p.scheme === 'door-top') p.components[1].width = p.components[0].width;
  }
  function paintPanel() {
    const p = PN(), D = cfg.data.panels, errs = cfg.panelErrors(p), shown = V.pshow, di = cfg.panelDoorIndex(p), g = cfg.panelGeometry(p);
    const opt = (list, cur, label) => list.map(x => h`<option value="${x.v ?? x}" ${raw((x.v ?? x) === cur ? 'selected' : '')}>${label(x)}</option>`);
    const err = (i, f) => errs.find(e => e.i === i && e.f === f);
    const rule = p.scheme === 'door-side' ? t('cfg.pn.ruleSide') : p.scheme === 'door-top' ? t('cfg.pn.ruleTop') : p.scheme === 'windows-side' ? t('cfg.pn.ruleHeights') : t('cfg.pn.ruleWidths');
    const comp = (c, i) => {
      const door = di === i, models = panelModels(i), th = c.type ? cfg.thresholdsFor(c.type) : [];
      const rng = ax => { const r = c.type ? cfg.panelRange(p, i, ax) : null; return r ? t('cfg.range', { min: r.min, max: r.max }) : ''; };
      const em = (f) => { const e = err(i, f); if (!e || !shown) return ''; return e.code === 'empty' ? t('cfg.err.empty', { f: t(`cfg.${f}`) }) : e.code === 'range' ? t('cfg.pn.range', { min: e.min, max: e.max }) : e.code === 'equal' ? t('cfg.pn.equal') : e.code === 'taller' ? t('cfg.pn.taller') : t('cfg.pn.choose'); };
      return h`<fieldset class="cfg-comp acrylic e-2"><legend>${t('cfg.pn.unit', { n: i + 1 })} · ${t(door ? 'cfg.pn.door' : 'cfg.pn.window')}</legend>
        <label class="field"><span>${t('cfg.pn.model')}</span><select data-pn="type" data-i="${i}"><option value="">${t('cfg.pn.choose')}</option>${opt(models, c.type, typeName)}</select></label>
        ${c.type && cfg.handed(c.type) ? h`<label class="field"><span>${t('cfg.pn.side')}</span><select data-pn="side" data-i="${i}"><option value="">${t('cfg.pn.choose')}</option>${opt(['stanga', 'dreapta'], c.side, sideLabel)}</select></label>` : ''}
        ${c.type ? h`<label class="field"><span>${t('cfg.pn.fill')}</span><select data-pn="glass" data-i="${i}">${opt(cfg.glassFor(c.type), c.glass, glassName)}</select></label>` : ''}
        ${th.length > 1 ? h`<label class="field"><span>${t('cfg.threshold')}</span><select data-pn="threshold" data-i="${i}">${opt(th, c.threshold, x => loc(cfg.data.thresholds[x]))}</select></label>` : ''}
        ${['width', 'height'].map(ax => h`<label class="field"><span>${t(`cfg.${ax}`)} (mm)</span><input type="number" inputmode="numeric" data-pn="${ax}" data-i="${i}" value="${c[ax]}" ${raw(p.scheme === 'door-top' && i === 1 && ax === 'width' ? 'readonly' : '')} aria-invalid="${!!(shown && err(i, ax))}"><small class="${shown && err(i, ax) ? 'error' : 'muted'}">${em(ax) || rng(ax)}</small></label>`)}</fieldset>`;
    };
    keepFocus(() => {
      $('#c-panel').innerHTML = h`<section class="cfg-panel acrylic e-2"><h2>${t('cfg.panelName')}</h2><p class="muted">${t('cfg.pn.lead')}</p>
        <h3>${t('cfg.pn.scheme')}</h3><div class="cfg-forms">${D.schemes.map(s => h`<button class="cfg-card cfg-product" type="button" data-action="cfg-pn-scheme" data-id="${s.id}" data-key="ps-${s.id}" aria-pressed="${p.scheme === s.id}"><span class="cfg-art">${draw.panel({ product: 'panels', panel: { ...p, scheme: s.id, components: sampleComps(s.id, p.arrangement) } })}</span><span class="cfg-card-text"><b>${loc(s.name)}</b></span></button>`)}</div>
        <div class="cfg-pn-controls">
          ${p.scheme === 'door-side' ? h`<label class="field"><span>${t('cfg.pn.arrangement')}</span><select data-pn="arrangement">${opt(D.arrangements.map(a => ({ v: a.id, n: loc(a.name) })), p.arrangement, a => a.n)}</select></label>` : ''}
          <label class="field"><span>${t('cfg.series')}</span><select data-pn="series">${opt(D.series, p.series, s => cfg.series(s).name)}</select></label>
          <label class="field"><span>${t('cfg.colour')}</span><select data-pn="colour">${opt(D.colours, p.colour, colourName)}</select></label></div>
        <p class="cfg-relation muted" aria-live="polite">${t('cfg.pn.coupling', { n: g.thickness })} ${rule}</p>
        <div class="cfg-comps">${p.components.map(comp)}</div>
        <div class="cfg-review acrylic thick e-3"><div class="cfg-review-art">${draw.panel({ product: 'panels', panel: p }, { dims: true, label: t('cfg.pn.preview') })}</div>
          <div class="cfg-review-body" aria-live="polite">${V.pbusy ? h`<div class="cfg-loading" role="status"><span class="cfg-loading-win" aria-hidden="true"><i></i><i></i><i></i><i></i></span><b>${t('cfg.calculating')}</b></div>` : V.pquote ? (V.pquote.available ? h`<p class="cfg-dimline">${t('cfg.pn.overall', { w: Math.round(g.overallW), h: Math.round(g.overallH) })}</p><h3 class="price big">${t('cfg.total')}: ${money(V.pquote.total)}</h3><p class="muted small">${t('cfg.pn.fee')}</p>` : h`<p class="muted">${V.pquote.message}</p>`) : h`<p class="muted">${t('cfg.pn.hint')}</p>`}
            <p class="error" role="alert" data-bind="pstatus"></p>
            <div class="row"><button class="btn primary" data-action="cfg-pn-price">${t('cfg.pn.calc')}</button><button class="btn primary" data-action="cfg-pn-add" ${raw(V.pquote && !V.pbusy && !P.readOnly(P.active) ? '' : 'disabled')}>${icon('cart', 18)} ${t(V.editId ? 'cfg.saveChanges' : 'cfg.addToProject')}</button></div></div></div>
        <div class="cfg-notice" data-bind="pnotice" tabindex="-1" ${raw(V.notice ? '' : 'hidden')}>${V.notice ? h`<h3>${V.notice.title}</h3><div class="row"><button class="btn primary" data-action="cfg-another">${t('cfg.another')}</button><a class="btn ghost" href="#/calculator/summary">${t('cfg.viewSummary')}</a></div>` : ''}</div></section>`.toString();
    });
  }
  /* what a scheme thumbnail looks like: a window beside a door, to scale */
  const sampleComps = (scheme, arr) => {
    const door = { type: 'door-glass-third', side: 'dreapta', glass: 'delta4-lowe', threshold: 'frame', width: 900, height: 2000 }, win = { type: 'fix', glass: 'f4-lowe', width: 600, height: 1200 };
    if (scheme === 'windows-side') return [{ ...win, width: 700, height: 1200 }, { ...win, width: 500, height: 1200 }];
    if (scheme === 'windows-stack') return [{ ...win, width: 800, height: 500 }, { ...win, width: 800, height: 900 }];
    if (scheme === 'door-top') return [{ ...door }, { ...win, width: 900, height: 400 }];
    return arr === 'door-right' ? [{ ...win, width: 500, height: 1500 }, door] : [door, { ...win, width: 500, height: 1500 }];
  };
  async function panelQuote() {
    const p = PN(); panelFix(); V.pshow = true; const errs = cfg.panelErrors(p);
    if (errs.length) { V.pquote = null; paintPanel(); return; }
    V.pbusy = true; V.pquote = null; paintPanel();
    const r = await FE.api.post('/quote', { panel: { ...p, components: p.components.map(c => ({ ...c })) } });
    V.pbusy = false; V.pquote = r.ok ? r.data : null; paintPanel();
  }

  /* ---------- saving ---------- */
  const ensureProject = then => { if (P.active && !P.readOnly(P.active)) return then(); projectDialog('new', then); };
  function commit(item, successTitle) {
    try {
      let merged = -1;
      if (V.editId) P.update(item); else merged = P.add(item);
      V.notice = { title: merged !== -1 ? t('cfg.merged', { i: merged.index + 1, a: merged.was, b: item.quantity, c: merged.was + item.quantity }) : V.editId ? t('cfg.savedChanges') : successTitle };
      reset(V.S.product); if (isPanels()) { V.panel = null; V.pquote = null; V.pshow = false; }
      V.quote = null; paintTop(); $('[data-bind=notice]', host)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } catch (e) { const el = $('[data-bind=status]') || $('[data-bind=pstatus]'); if (el) el.textContent = msgFor(e); }
  }
  const lineFromState = () => ({ id: V.editId || uid(), product: V.S.product, type: V.S.type, side: V.S.side, threshold: V.S.threshold, series: V.S.series, colour: V.S.colour, glass: V.S.glass, width: num(V.S.width), height: num(V.S.height), quantity: num(V.S.quantity), quote: V.quote });

  /* ---------- dialogs (stacked overlays) ---------- */
  function projectDialog(mode, then) {
    const rename = mode === 'rename', pr = P.active;
    FE.overlay.open({ size: 'sm', title: t(rename ? 'cfg.project.rename' : 'cfg.project.new'), render(body, ov) {
      body.innerHTML = h`<form class="stack" novalidate><p class="muted">${t('cfg.project.nameHint')}</p>
        ${FE.ui.field('pj-name', t('cfg.project.name'), `type="text" maxlength="80" autocomplete="off" required autofocus value="${FE.esc(rename ? pr.name : '')}"`)}
        ${FE.ui.field('pj-phone', t('cfg.project.phone'), `type="tel" inputmode="tel" autocomplete="tel" maxlength="40" required value="${FE.esc(rename ? pr.phone : '')}"`)}
        ${rename ? '' : h`<label class="field" for="pj-shop"><span>${t('cfg.project.shop')}</span><select id="pj-shop" name="shop">${FE.db.shops.map(s => h`<option value="${FE.loc(s.name)}">${FE.loc(s.name)}</option>`)}</select></label>`}
        <p class="error" role="alert" data-bind="err"></p><div class="row"><button class="btn primary" type="submit">${t(rename ? 'cfg.project.saveData' : 'cfg.project.createBtn')}</button><button class="btn ghost" type="button" data-action="overlay-close" data-layer="${ov.id}">${t('cfg.cancel')}</button></div></form>`.toString();
      FE.$('form', body).addEventListener('submit', ev => {
        ev.preventDefault(); const f = new FormData(ev.target);
        try { if (rename) P.rename(f.get('pj-name'), f.get('pj-phone')); else P.create({ name: f.get('pj-name'), phone: f.get('pj-phone'), shop: f.get('shop') }); ov.close(); paintTop(); then?.(); }
        catch (e) { FE.$('[data-bind=err]', body).textContent = msgFor(e); }
      });
    } });
  }
  function managerDialog() {
    FE.overlay.open({ size: 'lg', title: t('cfg.manager.title'), render(body, ov) {
      const f = { name: '', phone: '', status: '', sort: 'created:desc', from: '', to: '' };
      const draw_ = () => {
        let list = []; let err = '';
        try { list = P.search(P.list(), f); } catch (e) { err = t('cfg.perr.range'); }
        FE.$('[data-bind=results]', body).innerHTML = (err ? h`<p class="error" role="alert">${err}</p>` : '') + (list.length ? h`<ul class="cfg-plist">${list.map(p => h`<li class="cfg-prow ${P.active?.id === p.id ? 'is-active' : ''}"><div class="grow"><b>${p.name}</b> ${statusBadge(p)}<div class="muted small">${[fmtDate(p.createdDate), p.phone, p.shop, `${p.items.length} ${t(p.items.length === 1 ? 'cfg.config1' : 'cfg.configN')}`, `${P.priced(p) === p.items.length ? '' : t('cfg.subtotal') + ': '}${money(P.total(p))}`].filter(Boolean).join(' · ')}</div></div>
          <button class="btn ghost small" data-pj="open" data-id="${p.id}">${t('cfg.manager.open')}</button><button class="btn link small" data-pj="del" data-id="${p.id}">${t('cfg.delete')}</button></li>`)}</ul><p class="muted small" role="status">${list.length} ${t('cfg.manager.found')}</p>` : h`<p class="muted" role="status">${t('cfg.manager.none')}</p>`).toString();
      };
      const sel = (k, opts) => h`<label class="field"><span>${t(`cfg.manager.${k}`)}</span><select data-f="${k}">${opts.map(([v, l]) => h`<option value="${v}">${l}</option>`)}</select></label>`;
      body.innerHTML = h`<div class="cfg-search" role="search"><label class="field"><span>${t('cfg.manager.name')}</span><input type="search" data-f="name" maxlength="80" placeholder="Ex. Popescu"></label>
        <label class="field"><span>${t('cfg.manager.phone')}</span><input type="search" data-f="phone" inputmode="tel" placeholder="Ex. 07…"></label>
        ${sel('status', [['', t('cfg.manager.allStates')], ...cfg.data.statuses.map(s => [s, t(`cfg.status.${s}`)])])}
        ${sel('sort', [['created:desc', t('cfg.manager.newest')], ['created:asc', t('cfg.manager.oldest')], ['status:asc', t('cfg.manager.statusAsc')], ['status:desc', t('cfg.manager.statusDesc')]])}
        <label class="field"><span>${t('cfg.manager.from')}</span><input type="date" data-f="from"></label><label class="field"><span>${t('cfg.manager.to')}</span><input type="date" data-f="to"></label></div>
        <div class="row"><button class="btn link small" data-pj="reset">${t('cfg.manager.reset')}</button><button class="btn primary small" data-pj="new">${t('cfg.project.new')}</button></div><div data-bind="results"></div>`.toString();
      body.addEventListener('input', e => { const k = e.target.dataset.f; if (k) { f[k] = e.target.value; draw_(); } });
      body.addEventListener('click', e => {
        const b = e.target.closest('[data-pj]'); if (!b) return; const a = b.dataset.pj;
        if (a === 'open') { try { P.open(b.dataset.id); reset(V.S.product); V.notice = null; ov.close(); paintTop(); } catch (er) { FE.toast(msgFor(er), 'err'); } }
        if (a === 'del') { P.deleteProject(b.dataset.id); paintTop(); draw_(); }
        if (a === 'new') { ov.close(); projectDialog('new'); }
        if (a === 'reset') { Object.assign(f, { name: '', phone: '', status: '', sort: 'created:desc', from: '', to: '' }); FE.$$('[data-f]', body).forEach(el => { el.value = f[el.dataset.f]; }); draw_(); }
      });
      draw_();
    } });
  }
  function statusDialog(next) {
    const pr = P.active, cur = P.state(pr);
    FE.overlay.open({ size: 'sm', title: t('cfg.status.confirmTitle'), render(body, ov) {
      body.innerHTML = h`<div class="stack"><p>${t('cfg.status.confirm', { name: pr.name, from: t(`cfg.status.${cur}`), to: t(`cfg.status.${next}`) })} ${t(next === 'OFERTA' ? 'cfg.status.reopenNote' : 'cfg.status.lockNote')}</p><p class="error" role="alert" data-bind="err"></p>
        <div class="row"><button class="btn ghost" data-action="overlay-close" data-layer="${ov.id}">${t('cfg.cancel')}</button><button class="btn primary" data-act="ok">${t('cfg.status.confirmBtn')}</button></div></div>`.toString();
      FE.$('[data-act=ok]', body).addEventListener('click', () => {
        try { P.setStatus(next); reset(V.S.product); ov.close(); paintTop(); FE.toast(t('cfg.status.changed', { s: t(`cfg.status.${next}`) })); } catch (e) { FE.$('[data-bind=err]', body).textContent = msgFor(e); }
      });
    } });
  }
  function infoDialog(kind, id, anchor) {
    FE.overlay.open({ kind: 'popover', anchor, size: 'sm', title: kind === 'series' ? cfg.series(id).name : kind === 'colour' ? colourName(id) : glassName(id), render(body) {
      body.innerHTML = kind === 'series' ? h`<div class="cfg-info-big">${draw.profile(id)}</div><p class="muted">${loc(cfg.series(id).blurb)}</p><dl class="specs"><dt>${t('profile.depth')}</dt><dd>${cfg.series(id).mm} mm</dd><dt>${t('profile.chambersLabel')}</dt><dd>${cfg.series(id).chambers}</dd></dl>`.toString()
        : h`<div class="cfg-info-big"><i class="cfg-tex" style="${raw(kind === 'colour' ? draw.swatchStyle(cfg.colour(id)) : draw.glassStyle(id))}"></i></div><p class="muted">${t(kind === 'colour' ? 'cfg.textureHint' : 'cfg.glassHint')}</p>`.toString();
    } });
  }

  /* door in a room: edits the current selection live */
  function decorDialog() {
    let room = 0, open = false;
    FE.overlay.open({ size: 'lg', title: t('cfg.decor'), render(body) {
      const s = V.S, paint = () => {
        const it = { ...V.S, width: V.S.width || 1000, height: V.S.height || 2100 }, models = cfg.typesFor({ product: it.product, form: it.form, leaves: it.leaves, construction: it.construction });
        const sel = (k, opts, cur) => h`<label class="field"><span>${t(`cfg.decorSel.${k}`)}</span><select data-d="${k}">${opts.map(([v, l]) => h`<option value="${v}" ${raw(v === cur ? 'selected' : '')}>${l}</option>`)}</select></label>`;
        body.innerHTML = h`<div class="cfg-decor-body"><div><div class="seg" role="tablist">${cfg.data.rooms.map((r, i) => h`<button class="seg-btn" role="tab" aria-selected="${i === room}" aria-checked="${i === room}" data-d="room" data-i="${i}">${loc(r.name)}</button>`)}</div><div class="cfg-decor-art">${draw.room(it, cfg.data.rooms[room], open)}</div><p class="muted small">${t('cfg.decorNote')}</p></div>
          <div class="stack">${sel('model', models.map(m => [m, typeName(m)]), it.type)}${sel('colour', cfg.coloursFor(it).map(c => [c, colourName(c)]), it.colour)}${sel('glass', cfg.glassFor(it.type).map(g => [g, glassName(g)]), it.glass)}${cfg.handed(it.type) ? sel('side', [['stanga', sideLabel('stanga')], ['dreapta', sideLabel('dreapta')]], it.side || 'dreapta') : ''}
            <button class="btn ghost" data-d="open" aria-pressed="${open}">${t(open ? 'cfg.decorClose' : 'cfg.decorOpen')}</button></div></div>`.toString();
      };
      paint();
      body.addEventListener('change', e => { const k = e.target.dataset.d; if (!k) return; if (k === 'model') pickType(e.target.value, V.S.side || 'dreapta'); else if (k === 'colour') choose({ colour: e.target.value }); else if (k === 'glass') choose({ glass: e.target.value }); else if (k === 'side') choose({ side: e.target.value }); paint(); });
      body.addEventListener('click', e => { const b = e.target.closest('[data-d]'); if (!b || b.tagName === 'SELECT') return; if (b.dataset.d === 'room') room = +b.dataset.i; if (b.dataset.d === 'open') open = !open; paint(); });
      void s;
    } });
  }

  /* ---------- actions ---------- */
  const A = FE.actions.register;
  A('cfg-product', (el, ev, d) => { reset(d.id); V.notice = null; V.quote = null; V.pquote = null; invalidate(); paintTop(); });
  A('cfg-form', (el, ev, d) => { reset('windows', { form: d.id }); invalidate(); paintTop(); });
  A('cfg-leaves', (el, ev, d) => { reset('exterior', { leaves: +d.n, construction: V.S.construction }); invalidate(); paintTop(); });
  A('cfg-construction', (el, ev, d) => { reset('exterior', { leaves: V.S.leaves, construction: d.id }); invalidate(); paintTop(); });
  A('cfg-type', (el, ev, d) => pickType(d.id, d.side));
  A('cfg-series', (el, ev, d) => choose({ series: d.id, ...(d.id === 'lumena-color-plus' ? { colour: 'golden-oak' } : { colour: V.S.colour }) }));
  A('cfg-colour', (el, ev, d) => { choose({ colour: d.id }); FE.store.set({ swatch: cfg.colour(d.id).delta ? cfg.colour(d.id).hex : null }); });
  A('cfg-glass', (el, ev, d) => choose({ glass: d.id }));
  A('cfg-info', (el, ev, d) => infoDialog(d.kind, d.id, el));
  A('cfg-add', () => { V.showErrors = true; if (!ready() || !V.quote) { paintSize(); return; } ensureProject(() => commit(lineFromState(), t('cfg.saved'))); });
  A('cfg-cancel-edit', () => { reset(V.S.product); invalidate(); paintTop(); });
  A('cfg-another', () => { V.notice = null; reset('windows'); invalidate(); paintTop(); host.scrollIntoView({ behavior: 'smooth' }); });
  A('cfg-edit', (el, ev, d) => load(d.id, false));
  A('cfg-dup', (el, ev, d) => load(d.id, true));
  A('cfg-del', (el, ev, d) => { try { P.remove(d.id); if (V.editId === d.id) reset(V.S.product); paintTop(); } catch (e) { FE.toast(msgFor(e), 'err'); } });
  A('cfg-manager', () => managerDialog());
  A('cfg-newproject', () => projectDialog('new'));
  A('cfg-rename', () => projectDialog('rename'));
  A('cfg-status', (el, ev, d) => statusDialog(d.s));
  A('cfg-decor', () => decorDialog());
  A('cfg-pn-scheme', (el, ev, d) => { PN().scheme = d.id; panelFix(true); V.pquote = null; paintPanel(); });
  A('cfg-pn-price', () => panelQuote());
  A('cfg-pn-add', () => { const p = PN(); if (!V.pquote) return; ensureProject(() => commit({ id: V.editId || uid(), product: 'panels', type: 'panou', panel: JSON.parse(JSON.stringify(p)), quantity: 1, quote: V.pquote }, t('cfg.saved'))); });

  function load(id, duplicate) {
    const it = P.active?.items.find(x => x.id === id); if (!it || P.readOnly(P.active)) return;
    V.notice = null; V.touched = {}; V.showErrors = false;
    if (it.product === 'panels') { reset('panels'); V.panel = JSON.parse(JSON.stringify(it.panel)); V.editId = duplicate ? null : it.id; V.pquote = null; V.pshow = false; paintTop(); }
    else {
      const t_ = cfg.type(it.type); V.S = { ...cfg.blank(it.product), product: it.product, form: t_.form || 'one', leaves: t_.leaves || 1, construction: t_.construction || 'mullions', type: it.type, side: it.side, threshold: it.threshold || '', series: it.series, colour: it.colour, glass: it.glass, width: it.width, height: it.height, quantity: it.quantity };
      V.editId = duplicate ? null : it.id; invalidate(); syncInputs(); paintTop(); schedule();
    }
    host.scrollIntoView({ behavior: 'smooth' });
    FE.toast(t(duplicate ? 'cfg.dupReady' : 'cfg.editing'));
  }

  /* ---------- mount ---------- */
  FE.views.calculator = async host_ => {
    host = host_; if (!V.S) V.S = cfg.blank('windows');
    host.innerHTML = h`<p class="muted small cfg-crumb">${t('cfg.crumb')}</p><header class="page-head"><h1>${t('cfg.title')}</h1><p class="muted">${t('cfg.lead')}</p></header>
      <div class="cfg"><div class="cfg-main"><div id="c-top" class="stack"></div><section id="c-size" class="cfg-sec acrylic e-2" hidden></section><section id="c-finish" class="cfg-sec acrylic e-2" hidden></section>
        <section id="c-review" class="cfg-sec" hidden></section><div id="c-panel" hidden></div></div><aside id="c-aside" class="cfg-side" aria-label="${t('cfg.projectItems')}"></aside></div><div id="c-bar" class="cfg-fixbar acrylic thick e-4" hidden></div>`.toString();
    buildSize();
    if (!P.active) P.restore();
    if (!host._cfgBound) { host._cfgBound = true; bind(); }
    paintTop(); schedule();
    V.off?.(); V.off = P.on(() => { if (host.isConnected && host.querySelector('.cfg')) { paintAside(); paintReview(); } });
    if (V.pendingLoad) { const { id, dup } = V.pendingLoad; V.pendingLoad = null; load(id, dup); }
  };
  /* one delegated listener per kind, bound once on the shared #view element */
  function bind() {
    host.addEventListener('input', e => {
      const el = e.target;
      if (el.dataset.dim) { V.S[el.dataset.dim] = el.value === '' ? '' : Number(el.value); V.touched[el.dataset.dim] = true; schedule(); }
      else if (el.dataset.pn && el.tagName === 'INPUT') { const c = PN().components[+el.dataset.i]; c[el.dataset.pn] = el.value === '' ? '' : Number(el.value); if (PN().scheme === 'door-top' && el.dataset.i === '0' && el.dataset.pn === 'width') PN().components[1].width = c.width; V.pquote = null; }
    });
    host.addEventListener('change', e => {
      const el = e.target;
      if (el.dataset.actChange === 'cfg-threshold') { const id = el.dataset.id; if (V.S.type !== id) pickType(id, V.S.side || 'dreapta'); choose({ threshold: el.value }); }
      else if (el.dataset.pn) {
        const p = PN(), k = el.dataset.pn;
        if (el.tagName === 'SELECT') { if (el.dataset.i !== undefined) { const c = p.components[+el.dataset.i]; c[k] = el.value; if (k === 'type') { c.glass = ''; c.threshold = ''; c.side = ''; } } else p[k] = el.value; panelFix(); V.pquote = null; paintPanel(); }
      }
    });
  }

  /* ---------- summary: the printable project page ---------- */
  FE.views.cfgSummary = async host_ => {
    const pr = P.active || P.restore();
    const head = pr ? h`<img class="cfg-sum-logo" src="icons/icon.svg" alt="" width="40" height="40"><h1>${t('cfg.sum.title')} · ${pr.name}</h1><p>${t('cfg.sum.created')}: ${fmtDate(pr.createdDate) || '–'} · ${t('cfg.sum.date')}: ${new Date().toLocaleDateString(FE.store.get('lang') === 'ro' ? 'ro-RO' : 'en-GB')}</p><p>${t('cfg.sum.phone')}: ${pr.phone || '–'} ${pr.shop ? '· ' + pr.shop : ''} ${statusBadge(pr)}</p>` : h`<h1>${t('cfg.sum.title')}</h1>`;
    const rows = (pr?.items || []).map((it, i) => h`<article class="cfg-sum-row"><div class="cfg-sum-art">${draw.item(it)}${it.product === 'panels' ? '' : colourBadge(it.colour)}</div><div><h2>${i + 1}. ${itemTitle(it)}</h2><p class="cfg-dimline">${dimLine(it)}</p><ul class="cfg-specs">${specs(it).map(x => h`<li>${x}</li>`)}</ul>
      ${it.quote?.available ? h`<p>${t('cfg.unit')}: ${money(it.quote.unit)}</p><p><b>${t('cfg.sum.line')}: ${money(it.quote.total)}</b></p>` : h`<p><b>${t('cfg.sum.noPrice')}</b></p>`}
      ${P.readOnly(pr) ? '' : h`<div class="row no-print"><button class="btn link small" data-action="cfg-sum-edit" data-id="${it.id}">${t('action.edit')}</button><button class="btn link small" data-action="cfg-sum-dup" data-id="${it.id}">${t('cfg.duplicate')}</button></div>`}</div></article>`);
    const items = pr?.items || [], priced = pr ? P.priced(pr) : 0;
    host_.innerHTML = h`<section class="cfg-sum acrylic e-2">${head}${items.length ? '' : h`<p class="muted">${t('cfg.sum.empty')}</p>`}${rows}
      ${items.length ? h`<p>${items.length} ${t('cfg.sum.positions')} · ${P.pieces(pr)} ${t('cfg.pcs')}</p><p class="cfg-total big">${priced === items.length ? t('cfg.sum.grand') : t('cfg.subtotal')}: <b>${money(P.total(pr))}</b></p>${priced < items.length ? h`<p class="muted">${t('cfg.sum.partial', { n: items.length - priced })}</p>` : ''}` : ''}
      <p class="muted small">${t('cfg.sum.note')}</p>
      <div class="row no-print"><a class="btn ghost" href="#/calculator">${t('cfg.another')}</a>${items.length ? h`<button class="btn primary" data-action="cfg-print">${icon('layers', 18)} ${t('cfg.sum.print')}</button><button class="btn ghost" data-action="callback">${icon('phone', 18)} ${t('cfg.sum.quote')}</button>` : ''}</div></section>`.toString();
  };
  A('cfg-print', () => window.print());
  A('cfg-sum-edit', (el, ev, d) => { V.pendingLoad = { id: d.id, dup: false }; FE.router.go('/calculator'); });
  A('cfg-sum-dup', (el, ev, d) => { V.pendingLoad = { id: d.id, dup: true }; FE.router.go('/calculator'); });
})();
