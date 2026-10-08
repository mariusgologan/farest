/* t('a.b', {n}) with {n} placeholders and a pipe plural: "one|other". Falls back to the other language, then the key. */
(() => {
  const lookup = (obj, key) => key.split('.').reduce((o, k) => o?.[k], obj);
  FE.t = (key, p = {}) => {
    const lang = FE.store.get('lang');
    let s = lookup(FE.content[lang], key) ?? lookup(FE.content[FE.config.defaults.lang], key);
    if (s == null) return key;
    if (typeof s === 'string' && s.includes('|') && 'n' in p) s = s.split('|')[p.n === 1 ? 0 : 1];
    return String(s).replace(/\{(\w+)\}/g, (_, k) => p[k] ?? '');
  };
  FE.money = n => new Intl.NumberFormat(FE.store.get('lang') === 'ro' ? 'ro-RO' : 'en-GB', { maximumFractionDigits: 0 }).format(Math.round(n)) + ' ' + FE.config.brand.currency;
  FE.num = n => new Intl.NumberFormat(FE.store.get('lang') === 'ro' ? 'ro-RO' : 'en-GB').format(n);
})();
