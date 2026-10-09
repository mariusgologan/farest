/* Hash router. Views register patterns; the router sets route + ambient context in the store. */
(() => {
  const table = [];
  FE.router = {
    add(pattern, view, context) {
      table.push({ re: new RegExp('^' + pattern.replace(/:(\w+)/g, '(?<$1>[^/]+)') + '$'), view, context });
    },
    go: path => { location.hash = '#' + path; },
    current: () => location.hash.slice(1) || '/',
    start() {
      if (!FE.router.started) { FE.router.started = true; addEventListener('hashchange', () => FE.router.run()); }
      return FE.router.run();
    },
    async run() {
      const path = FE.router.current();
      const render = async () => {
        const hit = table.map(r => [r, path.match(r.re)]).find(([, m]) => m);
        const [route, m] = hit || [table[0], [path]];
        const params = m.groups || {};
        const context = typeof route.context === 'function' ? route.context(params) : route.context;
        FE.ambient.page = null;
        FE.store.set({ route: path, context, swatch: null, picture: null });
        const host = FE.$('#view');
        host.setAttribute('aria-busy', 'true');
        host.innerHTML = '';
        await route.view(host, params);
        host.removeAttribute('aria-busy');
        FE.$('#frame').scrollTo({ top: 0 });
        document.title = FE.t('meta.title');
        FE.$('#view').focus({ preventScroll: true });
      };
      await (FE.motion ? FE.motion.navigate(path, render) : render());
    }
  };
})();
