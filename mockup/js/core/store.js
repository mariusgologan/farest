/* Single observable state. Persisted keys survive reload; everything else is session only. */
(() => {
  const persisted = ['theme', 'layout', 'ambient', 'ambientV', 'surface', 'slowUntil', 'bars', 'lang', 'segment', 'cart'];
  const saved = FE.storage.get(FE.config.storageKey, {});
  if (saved.ambient === 'on' && !saved.ambientV) saved.ambient = 'auto'; /* once: "on" saved before auto existed was the old default */
  const q = new URLSearchParams(location.search); if (q.has('b2b')) saved.segment = 'b2b'; else if (q.has('b2c')) saved.segment = 'b2c'; /* a shared link picks the segment */
  const state = { ...FE.config.defaults, cart: [], route: '/', context: 'home', swatch: null, picture: null, ambientV: 1, ...saved };
  const subs = new Set();
  FE.store = {
    get: k => state[k],
    set(patch) {
      const prev = { ...state };
      Object.assign(state, patch);
      FE.storage.set(FE.config.storageKey, Object.fromEntries(persisted.map(k => [k, state[k]])));
      subs.forEach(fn => fn(state, prev, patch));
    },
    on(fn) { subs.add(fn); return () => subs.delete(fn); }
  };
})();
