/* Live shop prices on a static host: re-read products.csv (a cheap 304 when unchanged) on focus, on reconnect and
   every few minutes while visible; changed prices and stock are patched in place, the page is not re-rendered. */
(() => {
  const path = () => FE.config.content.products;
  let last = null, busy = null, timer = 0;

  /* elements tagged by ui.price / ui.stock with the SKU they show */
  function patch(changed) {
    for (const p of changed) {
      FE.$$(`[data-price-of="${p.id}"]`).forEach(el => { el.textContent = FE.money(p.price); FE.motion?.pulse(el); });
      FE.$$(`[data-stock-of="${p.id}"]`).forEach(el => { el.outerHTML = FE.ui.stock(p.stock, p.id).toString(); });
    }
  }

  async function check() {
    if (busy) return busy;
    busy = (async () => {
      try {
        const r = await fetch(new URL(path(), document.baseURI).href, { cache: 'no-cache' });
        if (!r.ok) return [];
        const src = await r.text();
        last ??= await FE.loader.text(path());
        if (src === last) return [];
        last = src;
        const rows = new Map(FE.parse.csv(src).map(r => [r.id, r]));
        const changed = FE.db.products.filter(p => {
          const r = rows.get(p.id);
          if (!r || (r.price === p.price && r.stock === p.stock)) return false;
          p.price = r.price; p.stock = r.stock;
          return true;
        });
        if (changed.length) {
          patch(changed);
          FE.store.set({ prices: Date.now() });
          FE.toast(FE.t('prices.updated'));
        }
        return changed;
      } catch { return []; /* offline: keep the last known prices */ }
      finally { busy = null; }
    })();
    return busy;
  }

  function schedule() {
    clearTimeout(timer);
    const { pollMs, jitter } = FE.config.prices;
    timer = setTimeout(() => { if (document.visibilityState === 'visible') check(); schedule(); }, pollMs * (1 - jitter + Math.random() * 2 * jitter));
  }

  function start() {
    addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') check(); });
    addEventListener('online', () => check());
    schedule();
    return check();
  }

  FE.prices = { check, start };
})();
