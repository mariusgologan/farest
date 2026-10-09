/* Configurator rules: pure functions over the catalogue in content/configurator.json (FE.cfg.data).
   No DOM here. The UI asks "what is allowed for this selection?" and never hard-codes the answer. */
(() => {
  const byId = (list, id) => list.find(x => x.id === id);
  const cfg = FE.cfg = {};
  const D = () => cfg.data;
  cfg.product = id => byId(D().products, id);
  cfg.type = id => D().types[id];
  cfg.series = id => byId(D().series, id);
  cfg.colour = id => byId(D().colours, id);
  cfg.glass = id => byId(D().glass, id);
  cfg.isDoor = id => !!cfg.type(id)?.door;
  cfg.handed = id => !!cfg.type(id)?.handed;
  cfg.productOf = typeId => cfg.type(typeId)?.product;
  /* the ornamental models only exist in white; the rest of the door range follows the Esential colours */
  cfg.DOOR_COLOURS = ['alb', 'nuc', 'gri-antracit'];

  /* ---------- what can be chosen ---------- */
  /* typologies shown for a product; windows are grouped by form, exterior doors by leaves and construction */
  cfg.typesFor = ({ product, form, leaves, construction }) => Object.entries(D().types)
    .filter(([, t]) => t.product === product && (product !== 'windows' || t.form === form)
      && (product !== 'exterior' || (t.leaves === leaves && t.construction === construction)))
    .map(([id]) => id);

  cfg.seriesFor = product => (cfg.product(product).series || []).map(cfg.series);

  /* does a typology exist for this series and colour? (single opening: Esential white only; fixed + single: no dark colours) */
  cfg.available = (typeId, { series, colour }) => {
    const only = cfg.type(typeId)?.only; if (!only) return true;
    return (!only.series || only.series.includes(series)) && (!only.colour || only.colour.includes(colour)) && !(only.colourNot || []).includes(colour);
  };

  cfg.coloursFor = ({ product, series, type, construction }) => {
    const t = type && cfg.type(type);
    if ((t ? t.construction : product === 'exterior' && construction) === 'ornamental') return ['alb'];
    if (product === 'doors' || product === 'exterior') return cfg.DOOR_COLOURS;
    return cfg.series(series)?.colours || ['alb'];
  };

  cfg.glassFor = type => (cfg.type(type)?.glass || []).filter(g => cfg.glass(g));
  cfg.defaultGlass = type => { const g = cfg.glassFor(type); return g.includes('f4-lowe') ? 'f4-lowe' : g[0]; };
  cfg.thresholdsFor = type => cfg.isDoor(type) ? (cfg.product(cfg.productOf(type)).thresholds || []) : [];

  /* size limits in mm, with the per-series exceptions applied */
  cfg.limits = (type, { series } = {}) => {
    const base = { ...cfg.type(type).limits };
    for (const o of D().limitOverrides) if (o.when.series === series) Object.assign(base, o.types[type] || {});
    return base;
  };

  /* sensible starting selection when a product, series or typology changes */
  cfg.defaultColour = ({ product, series, type }) => cfg.coloursFor({ product, series, type })[0];
  cfg.reconcile = s => {
    const p = cfg.product(s.product);
    if (p.series && !p.series.includes(s.series)) s.series = p.series[0];
    if (s.type && !cfg.available(s.type, s)) { s.type = ''; s.side = ''; }
    const colours = cfg.coloursFor(s);
    if (!colours.includes(s.colour)) s.colour = colours[0];
    if (s.type) {
      if (!cfg.glassFor(s.type).includes(s.glass)) s.glass = cfg.defaultGlass(s.type);
      if (!cfg.thresholdsFor(s.type).includes(s.threshold)) s.threshold = cfg.thresholdsFor(s.type)[0] || '';
      if (!cfg.handed(s.type)) s.side = '';
    }
    return s;
  };
  cfg.blank = (product = 'windows') => cfg.reconcile({ product, form: 'one', leaves: 1, construction: 'mullions', series: 'lumena-esential', colour: 'alb', glass: 'f4-lowe', type: '', side: '', threshold: '', width: '', height: '', quantity: 1 });

  /* ---------- validation ---------- */
  const num = v => v === '' || v == null ? NaN : Number(v);
  cfg.validate = s => {
    const err = {}, lm = s.type ? cfg.limits(s.type, s) : null;
    if (!s.type) err.type = 'type';
    else if (!cfg.available(s.type, s)) err.type = 'unavailable';
    else if (cfg.handed(s.type) && !s.side) err.side = 'side';
    if (s.type && cfg.thresholdsFor(s.type).length && !s.threshold) err.threshold = 'threshold';
    for (const [k, lo, hi] of [['width', lm?.wmin, lm?.wmax], ['height', lm?.hmin, lm?.hmax]]) {
      const v = num(s[k]);
      if (!(v > 0)) err[k] = { code: 'empty' };
      else if (!Number.isInteger(v)) err[k] = { code: 'int' };
      else if (lo !== undefined && v < lo) err[k] = { code: 'min', min: lo, value: v };
      else if (hi !== undefined && v > hi) err[k] = { code: 'max', max: hi, value: v };
    }
    const q = num(s.quantity);
    if (!(Number.isInteger(q) && q >= 1 && q <= D().pricing.maxQty)) err.quantity = { code: 'qty', max: D().pricing.maxQty };
    return err;
  };

  /* two lines are the same product when everything but id, quantity and quote matches: they merge in a project */
  cfg.sameConfig = (a, b) => a.product === b.product && a.type === b.type && (a.side || '') === (b.side || '') && (a.threshold || '') === (b.threshold || '')
    && a.series === b.series && a.colour === b.colour && a.glass === b.glass && Number(a.width) === Number(b.width) && Number(a.height) === Number(b.height)
    && JSON.stringify(a.panel || null) === JSON.stringify(b.panel || null) && (a.quote?.version || '') === (b.quote?.version || '');

  /* ---------- panels: two coupled units ---------- */
  cfg.coupling = series => D().panels.coupling[series] ?? D().panels.coupling.default;
  /* which of the two components is the door, by scheme and arrangement */
  cfg.panelDoorIndex = p => p.scheme === 'door-side' ? (p.arrangement === 'door-right' ? 1 : 0) : p.scheme === 'door-top' ? 0 : -1;
  cfg.panelAxis = p => cfg.panelScheme(p.scheme)?.axis;
  cfg.panelScheme = id => byId(D().panels.schemes, id);
  /* panel series: Plus only joins windows; colours follow the series */
  cfg.panelSeries = scheme => D().panels.series.filter(s => scheme.startsWith('windows') || !D().panels.windowsOnlySeries.includes(s));
  cfg.panelColours = series => D().panels.colours[series] || [];
  /* typologies a panel unit can take: every window, or every door, that exists for the series and colour (doors other than balcony: Esential only) */
  cfg.panelModels = (isDoor, { series, colour }) => Object.entries(D().types)
    .filter(([id, t]) => (isDoor ? D().panels.doorProducts : D().panels.windowProducts).includes(t.product)
      && cfg.available(id, { series, colour }) && cfg.series(series).colours.includes(colour) && cfg.coloursFor({ product: t.product, series, type: id }).includes(colour)
      && (t.product === 'windows' || t.product === 'balcony' || series === 'lumena-esential'))
    .map(([id]) => id);
  /* execution size of each component after the coupling deduction (windows share it; a window next to a door takes all of it) */
  cfg.panelGeometry = p => {
    const th = cfg.coupling(p.series), axis = cfg.panelAxis(p) === 'vertical' ? 'width' : 'height', bothWindows = p.scheme.startsWith('windows'), di = cfg.panelDoorIndex(p);
    const comps = p.components.map((c, i) => ({ ...c, [axis]: num(c[axis]) - (bothWindows ? th / 2 : i === di ? 0 : th) }));
    const overallW = axis === 'width' ? comps.reduce((a, c) => a + c.width, 0) : Math.max(...comps.map(c => c.width));
    const overallH = axis === 'height' ? comps.reduce((a, c) => a + c.height, 0) : Math.max(...comps.map(c => c.height));
    return { components: comps, thickness: th, axis, overallW, overallH };
  };
  /* allowed range for one component, shifted by its deduction */
  cfg.panelRange = (p, i, axis) => {
    const c = p.components[i]; if (!c.type) return null;
    const lm = cfg.limits(c.type, { series: p.series });
    const [lo, hi] = axis === 'width' ? [lm.wmin, lm.wmax] : [lm.hmin, lm.hmax];
    const d = cfg.panelGeometry({ ...p, components: p.components.map(x => ({ ...x, width: 1000, height: 1000 })) }).components[i];
    const ded = 1000 - d[axis];
    return { min: lo + ded, max: hi + ded, deduction: ded };
  };
  cfg.panelErrors = p => {
    const out = [], axisShared = cfg.panelAxis(p) === 'horizontal' ? 'width' : p.scheme === 'windows-side' ? 'height' : null;
    p.components.forEach((c, i) => {
      if (!c.type) { out.push({ i, f: 'type' }); return; }
      if (cfg.handed(c.type) && !c.side) out.push({ i, f: 'side' });
      if (!c.glass) out.push({ i, f: 'glass' });
      if (cfg.thresholdsFor(c.type).length && !c.threshold) out.push({ i, f: 'threshold' });
      for (const axis of ['width', 'height']) {
        const v = num(c[axis]), r = cfg.panelRange(p, i, axis);
        if (!(v > 0)) out.push({ i, f: axis, code: 'empty' });
        else if (r && (v < r.min || v > r.max)) out.push({ i, f: axis, code: 'range', min: r.min, max: r.max });
      }
    });
    if (!out.length && axisShared && num(p.components[0][axisShared]) !== num(p.components[1][axisShared])) out.push({ i: 1, f: axisShared, code: 'equal' });
    if (!out.length && p.scheme === 'door-side') {
      const di = cfg.panelDoorIndex(p), w = p.components[1 - di];
      if (num(w.height) > num(p.components[di].height)) out.push({ i: 1 - di, f: 'height', code: 'taller' });
    }
    return out;
  };
})();
