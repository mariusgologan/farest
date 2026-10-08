/* Corporate skin: configuration and copy that differ from the default app. Loaded after data/content.js and before the core scripts. */
(() => {
  Object.assign(FE.config, { storageKey: 'farest.corp.v1', registerSw: false });
  Object.assign(FE.config.defaults, { theme: 'light', ambient: 'off' });

  const corp = {
    ro: {
      kicker: 'FAR EST WINDOWS',
      metrics: { since: 'Pe piață din', factory: 'Fabrică proprie din', shops: 'Magazine proprii', brands: 'Sisteme de profile', range: 'Produse în gamă' },
      range: { title: 'Gama de produse', lead: 'Tâmplărie PVC produsă de FAR EST, din stoc sau la dimensiunea ta.', see: 'Vezi gama', items: '{n} produs|{n} produse' },
      systems: { title: 'Sisteme de profile', lead: 'Profile germane certificate, alese după izolare și buget.', system: 'Sistem', thickness: 'Grosime', chambers: 'Camere', thermal: 'K' },
      production: { title: 'Producție și service' },
      locations: { title: 'Locații', lead: 'Magazine proprii, unde poți vedea profilele și geamurile înainte să comanzi.', address: 'Adresă', phone: 'Telefon' },
      cta: { title: 'Discută proiectul cu un consultant', lead: 'Calculează o ofertă orientativă sau lasă-ne numărul de telefon.' },
      offer: 'Cere ofertă'
    },
    en: {
      kicker: 'FAR EST WINDOWS',
      metrics: { since: 'In business since', factory: 'Own factory since', shops: 'Own shops', brands: 'Profile systems', range: 'Products in range' },
      range: { title: 'Product range', lead: 'PVC joinery made by FAR EST, from stock or to your size.', see: 'View range', items: '{n} product|{n} products' },
      systems: { title: 'Profile systems', lead: 'Certified German profiles, chosen by insulation and budget.', system: 'System', thickness: 'Thickness', chambers: 'Chambers', thermal: 'K' },
      production: { title: 'Production and service' },
      locations: { title: 'Locations', lead: 'Own shops where you can see the profiles and glass before you order.', address: 'Address', phone: 'Phone' },
      cta: { title: 'Discuss your project with a consultant', lead: 'Calculate an indicative offer or leave us your phone number.' },
      offer: 'Request an offer'
    }
  };
  for (const l of Object.keys(corp)) FE.content[l].corp = corp[l];

  /* <base href="../"> would send #hash links to the parent page; keep them on this one */
  document.addEventListener('click', e => {
    const a = e.target.closest?.('a[href^="#"]');
    if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const h = a.getAttribute('href');
    if (h.length > 1) { e.preventDefault(); if (location.hash === h) dispatchEvent(new HashChangeEvent('hashchange')); else location.hash = h; }
  }, true);
})();
