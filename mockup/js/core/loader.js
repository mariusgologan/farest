/* Content loader: relative fetch (works under any GitHub Pages sub-path), format by extension, cached. */
(() => {
  const cache = new Map();
  const url = p => new URL(p, document.baseURI).href;
  async function text(path) {
    if (!cache.has(path)) cache.set(path, fetch(url(path)).then(r => { if (!r.ok) throw new Error(`${path}: ${r.status}`); return r.text(); }));
    return cache.get(path);
  }
  async function load(path) {
    const src = await text(path), ext = path.split('.').pop().toLowerCase();
    if (ext === 'json') return JSON.parse(src);
    if (ext === 'yaml' || ext === 'yml') return FE.parse.yaml(src);
    if (ext === 'csv') return FE.parse.csv(src);
    if (ext === 'md') { const { meta, body } = FE.parse.frontMatter(src); return { meta, html: FE.parse.md(body) }; }
    return src;
  }
  /* markdown for the current language, falling back to the default language */
  async function localized(base) {
    const lang = FE.store.get('lang');
    try { return await load(`${base}.${lang}.md`); } catch { return load(`${base}.${FE.config.defaults.lang}.md`); }
  }
  FE.loader = { text, load, localized };
  FE.loc = v => (v && typeof v === 'object') ? (v[FE.store.get('lang')] ?? v[FE.config.defaults.lang]) : v;

  /* "path~side~mesh" (side: left|right, mesh: insect screen), tags derived from the original file names at build time */
  const variant = spec => { const [src, ...tags] = spec.split('~'); return { src, side: tags.find(x => x === 'left' || x === 'right') || null, mesh: tags.includes('mesh') }; };

  /* boot data: every file listed in config.content */
  FE.loadAll = async () => {
    const c = FE.config.content;
    const [products, shops, offers, faq, site] = await Promise.all([c.products, c.shops, c.offers, c.faq, c.site].map(load));
    FE.db.products = products.map(r => ({
      id: r.id, cat: r.cat, group: r.group, kind: r.kind, name: r.name, w: r.w || 0, h: r.h || 0, price: r.price,
      producer: r.producer || null, profile: FE.db.producers[r.producer] || null, chambers: r.chambers || null, mm: r.mm || null,
      colour: r.colour || null, uf: r.uf || null, stock: r.stock, images: r.images ? String(r.images).split('|').map(variant) : []
    }));
    FE.db.shops = shops;
    FE.data = { offers: offers.items, faq, site };
  };
})();
