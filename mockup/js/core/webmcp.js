/* WebMCP: publishes the shop as a tool contract for in-browser AI agents (navigator.modelContext, W3C WebMCP draft; Edge/Chrome behind the
   "WebMCP testing" flag). Each tool calls the same FE.api / FE.cart / FE.store / FE.router the UI uses, so an agent sees what the visitor sees.
   No-op where the API is missing. Nothing here places an order: checkout stays a human step. */
(() => {
  const mc = document.modelContext || navigator.modelContext;
  if (!mc?.registerTool) return;
  const { store } = FE;
  const byId = (list, id) => list.find(x => x.id === id);
  const ok = data => ({ content: [{ type: 'text', text: JSON.stringify(data) }] });
  const fail = msg => ({ isError: true, content: [{ type: 'text', text: JSON.stringify({ error: msg }) }] });
  const view = { readOnlyHint: true };
  const cartView = () => ({ lines: store.get('cart').map((l, i) => { const p = byId(FE.db.products, l.pid); return { index: i, id: l.pid, name: p.name, side: l.side, mesh: l.mesh, qty: l.qty, unit: p.price, line: p.price * l.qty }; }), count: FE.cart.count(), total: FE.cart.total(), currency: FE.config.brand.currency });
  const slim = p => ({ id: p.id, name: p.name, cat: p.cat, group: p.group, price: p.price, stock: p.stock, w: p.w, h: p.h });
  const where = () => ({ route: FE.router.current(), title: document.title });

  /* go to a hash route and wait for its view to finish rendering */
  async function go(route) {
    if (FE.router.current() === route) await FE.router.run(); else FE.router.go(route);
    for (let i = 0; i < 100 && (FE.router.current() !== route || FE.router.pending() || FE.$('#view').getAttribute('aria-busy')); i++) await FE.sleep(50);
  }
  const routes = ['/', '/c/windows', '/c/doors', '/c/accessories', '/p/<productId>', '/calculator', '/calculator/summary', '/shops', '/page/<slug>'];

  const tools = [
    { name: 'get_site_info', description: 'Describe this shop (FAR EST windows and doors webshop), the current page and the routes navigate_to accepts. Call first.', annotations: view,
      inputSchema: { type: 'object', properties: {} },
      run: () => ({ brand: FE.config.brand.name, currency: FE.config.brand.currency, ...where(), routes, categories: FE.db.categories.map(c => c.id), languages: FE.config.langs, themes: ['auto', 'light', 'dark'], phone: FE.db.callCenter[0], cart: cartView() }) },
    { name: 'navigate_to', description: 'Show a page of the shop. Route is a hash route such as /, /c/windows, /p/<id>, /calculator, /shops, /page/about (see get_site_info).',
      inputSchema: { type: 'object', properties: { route: { type: 'string', description: 'Route starting with /' } }, required: ['route'] },
      run: async ({ route }) => { if (typeof route !== 'string' || route[0] !== '/') return fail('route must start with /'); await go(route); return where(); } },
    { name: 'search_products', description: 'List products, 12 per page, with filters. Prices are fixed per SKU, in lei with VAT.', annotations: view,
      inputSchema: { type: 'object', properties: {
        q: { type: 'string', description: 'Free text, name or WxH size' }, cat: { type: 'string', enum: ['windows', 'doors', 'accessories'] },
        group: { type: 'string' }, stock: { type: 'string' }, max: { type: 'number', description: 'Highest price' },
        sort: { type: 'string', enum: ['featured', 'price-asc', 'price-desc', 'size'] }, page: { type: 'integer', minimum: 1 } } },
      run: async a => {
        const qs = new URLSearchParams(Object.entries(a || {}).filter(([, v]) => v !== undefined && v !== '')).toString();
        const r = await FE.api.get('/products' + (qs ? '?' + qs : ''));
        return { products: r.data.map(slim), ...r.meta };
      } },
    { name: 'get_product', description: 'Full details of one product by id, including the profile system and photo variants (hinge sides, insect screen).', annotations: view,
      inputSchema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] },
      run: async ({ id }) => { const r = await FE.api.get('/products/' + encodeURIComponent(id)); if (!r.ok) return fail(r.error); const v = FE.variantsOf(r.data); return { ...r.data, images: undefined, sides: v.sides, meshOption: v.mesh }; } },
    { name: 'get_cart', description: 'The visitor\'s cart: lines, quantities and total.', annotations: view,
      inputSchema: { type: 'object', properties: {} }, run: cartView },
    { name: 'add_to_cart', description: 'Add a product to the cart (the cart badge updates on the page).',
      inputSchema: { type: 'object', properties: { id: { type: 'string' }, qty: { type: 'integer', minimum: 1, maximum: 99 }, side: { type: 'string', description: 'Hinge side from get_product sides' }, mesh: { type: 'boolean', description: 'With insect screen' } }, required: ['id'] },
      run: ({ id, qty = 1, side, mesh }) => {
        const p = byId(FE.db.products, id); if (!p) return fail('unknown product ' + id);
        const line = { ...FE.defaultLine(p), qty: Math.min(99, Math.max(1, Math.floor(qty))) };
        const v = FE.variantsOf(p);
        if (side) { if (!v.sides.includes(side)) return fail('side must be one of ' + JSON.stringify(v.sides)); line.side = side; }
        if (mesh) { if (!v.mesh) return fail('no insect screen option for this product'); line.mesh = true; }
        FE.cart.add(line); FE.toast(FE.t('toast.added')); return cartView();
      } },
    { name: 'update_cart_line', description: 'Set the quantity of a cart line by its index from get_cart; quantity 0 removes it.',
      inputSchema: { type: 'object', properties: { index: { type: 'integer', minimum: 0 }, qty: { type: 'integer', minimum: 0, maximum: 99 } }, required: ['index', 'qty'] },
      run: ({ index, qty }) => { if (!store.get('cart')[index]) return fail('no cart line ' + index); FE.cart.update(index, l => { l.qty = qty; return l; }); return cartView(); } },
    { name: 'open_cart', description: 'Open the cart panel on the page so the visitor can review it. Placing the order is left to the visitor.',
      inputSchema: { type: 'object', properties: {} }, run: () => { FE.flows.cart(); return cartView(); } },
    { name: 'set_preferences', description: 'Change display preferences: theme and language.',
      inputSchema: { type: 'object', properties: { theme: { type: 'string', enum: ['auto', 'light', 'dark'] }, lang: { type: 'string', enum: FE.config.langs } } },
      run: ({ theme, lang } = {}) => {
        const patch = {}; if (theme) patch.theme = theme; if (lang) patch.lang = lang;
        if (!FE.config.langs.includes(patch.lang ?? 'ro') || !['auto', 'light', 'dark'].includes(patch.theme ?? 'auto')) return fail('invalid value');
        store.set(patch); return { theme: store.get('theme'), lang: store.get('lang') };
      } },
    { name: 'get_configurator_options', description: 'Choices for get_quote: window and door typologies, series, colours, glass.', annotations: view,
      inputSchema: { type: 'object', properties: {} },
      run: () => { const D = FE.cfg.data; return { types: Object.keys(D.types), series: D.series.map(s => ({ id: s.id, colours: s.colours })), glass: D.glass.map(g => g.id), products: D.products.map(p => p.id), maxQuantity: D.pricing.maxQty }; } },
    { name: 'get_quote', description: 'Illustrative price for a made-to-measure window or door (not the shop price list). Sizes in mm; limits depend on type and series.', annotations: view,
      inputSchema: { type: 'object', properties: { type: { type: 'string' }, series: { type: 'string' }, colour: { type: 'string' }, glass: { type: 'string' },
        width: { type: 'integer', description: 'mm' }, height: { type: 'integer', description: 'mm' }, quantity: { type: 'integer', minimum: 1 } }, required: ['type', 'series', 'colour', 'glass', 'width', 'height'] },
      run: async a => { const r = await FE.api.post('/quote', { quantity: 1, ...a }); return r.ok ? r.data : fail(r.error); } }
  ];

  for (const { run, ...def } of tools) {
    /* a result that is already a tool result (fail) passes through */
    mc.registerTool({ ...def, execute: async args => { try { const r = await run(args || {}); return r?.content ? r : ok(r); } catch (e) { return fail(e.message); } } });
  }
  FE.webmcp = { tools: tools.map(t => t.name) };
})();
