/* Single observable state. Persisted keys survive reload; everything else is session only. */
(() => {
  const persisted = ['theme', 'layout', 'ambient', 'time', 'bars', 'lang', 'cart'];
  const saved = FE.storage.get(FE.config.storageKey, {});
  const state = { ...FE.config.defaults, cart: [], route: '/', context: 'home', swatch: null, picture: null, ...saved };
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
