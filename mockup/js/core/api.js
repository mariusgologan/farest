/* A server-less API. Same contract as fetch: async, {status, ok, data, meta}. Swap the transport for real fetch later; callers do not change. */
(() => {
  const db = () => FE.db, cfg = FE.config;
  const byId = (list, id) => list.find(x => x.id === id);

  /* shop prices are fixed per SKU (lei, VAT included); variants do not change the listed price */
  const priceOf = product => product.price;

  const routes = {
    'GET /categories': () => ({ data: db().categories }),
    'GET /products': q => {
      const needle = (q.q || '').toLowerCase();
      const featured = cfg.catalog.featured;
      let list = db().products.filter(p => (!q.cat || p.cat === q.cat)
        && (!q.group || p.group === q.group)
        && (!q.stock || p.stock === q.stock)
        && (!q.max || p.price <= +q.max)
        && (!needle || (p.name + ' ' + p.w + 'x' + p.h).toLowerCase().includes(needle)));
      const rank = p => { const i = featured.indexOf(p.id); return i < 0 ? 1e3 : i; };
      const sorts = {
        'price-asc': (a, b) => a.price - b.price, 'price-desc': (a, b) => b.price - a.price,
        size: (a, b) => a.w * a.h - b.w * b.h, featured: (a, b) => rank(a) - rank(b) || a.price - b.price
      };
      list = [...list].sort(sorts[q.sort || 'featured']);
      const page = +(q.page || 1), size = cfg.catalog.pageSize;
      return { data: list.slice((page - 1) * size, page * size), meta: { total: list.length, page, pages: Math.ceil(list.length / size), size } };
    },
    'GET /products/:id': (q, { id }) => {
      const p = byId(db().products, id);
      return p ? { data: { ...p, profileData: p.profile ? byId(db().profiles, p.profile) : null } } : { status: 404, error: 'not_found' };
    },
    'GET /profiles': () => ({ data: db().profiles }),
    'GET /profiles/:id': (q, { id }) => { const p = byId(db().profiles, id); return p ? { data: p } : { status: 404, error: 'not_found' }; },
    'GET /shops': () => ({ data: db().shops }),
    'GET /offers': () => ({ data: FE.data.offers }),
    'GET /faq': () => ({ data: FE.data.faq }),
    'GET /welcome': () => FE.loader.localized(cfg.content.welcome).then(data => ({ data })),
    'GET /pages/:slug': (q, { slug }) => FE.loader.localized(`${cfg.content.pages}/${slug}`).then(data => ({ data }), () => ({ status: 404, error: 'not_found' })),
    'POST /price': b => { const p = byId(db().products, b.id); return p ? { data: { unit: priceOf(p) } } : { status: 404, error: 'not_found' }; },
    /* illustrative formula, not the shop price list */
    'POST /estimate': b => {
      const area = (b.w / 100) * (b.h / 100) * b.count;
      const tier = byId(db().profiles, b.profile).tier;
      const base = area * (310 + tier * 120) * (1 + byId(db().colors, b.color).delta);
      const install = b.install ? base * cfg.catalog.installPct : 0;
      return { data: { area: +area.toFixed(2), base: Math.round(base), install: Math.round(install), total: Math.round(base + install) } };
    },
    'POST /requests': b => (!b.phone || b.phone.replace(/\D/g, '').length < 9)
      ? { status: 422, error: 'invalid_phone' } : { status: 201, data: { ref: 'CB-' + Math.random().toString(36).slice(2, 7).toUpperCase() } },
    'POST /orders': b => (b.name && b.phone && b.items?.length)
      ? { status: 201, data: { ref: 'FE-' + Math.random().toString(36).slice(2, 8).toUpperCase() } } : { status: 422, error: 'invalid_order' }
  };

  const compiled = Object.entries(routes).map(([k, fn]) => {
    const [method, path] = k.split(' ');
    return { method, re: new RegExp('^' + path.replace(/:(\w+)/g, '(?<$1>[^/]+)') + '$'), fn };
  });

  FE.api = {
    priceOf,
    async request(method, url, body) {
      const [path, qs] = url.split('?');
      const query = Object.fromEntries(new URLSearchParams(qs || ''));
      const [min, max] = cfg.api.latency;
      await FE.sleep(min + Math.random() * (max - min));
      for (const r of compiled) {
        const m = r.method === method && path.match(r.re);
        if (m) {
          const res = await r.fn(method === 'GET' ? query : body, m.groups || {});
          return { status: 200, meta: {}, ...res, ok: (res.status || 200) < 400 };
        }
      }
      return { status: 404, ok: false, error: 'no_route' };
    },
    get: url => FE.api.request('GET', url),
    post: (url, body) => FE.api.request('POST', url, body)
  };
})();
