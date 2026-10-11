/* t('a.b', {n}) with {n} placeholders and a pipe plural: "one|other". Falls back to the other language, then the key. */
(() => {
  const lookup = (obj, key) => key.split('.').reduce((o, k) => o?.[k], obj);
  /* in the b2b segment a key under content.<lang>.b2b replaces the household wording (prices without VAT, ...) */
  const pick = (c, key) => (FE.store.get('segment') === 'b2b' ? lookup(c?.b2b, key) : undefined) ?? lookup(c, key);
  FE.t = (key, p = {}) => {
    const lang = FE.store.get('lang');
    let s = pick(FE.content[lang], key) ?? pick(FE.content[FE.config.defaults.lang], key);
    if (s == null) return key;
    if (typeof s === 'string' && s.includes('|') && 'n' in p) s = s.split('|')[p.n === 1 ? 0 : 1];
    return String(s).replace(/\{(\w+)\}/g, (_, k) => p[k] ?? '');
  };
  /* prices are kept with VAT; companies (b2b) see them without it. Proportional, so totals and price filters stay consistent */
  FE.moneyGross = n => new Intl.NumberFormat(FE.store.get('lang') === 'ro' ? 'ro-RO' : 'en-GB', { maximumFractionDigits: 0 }).format(Math.round(n)) + ' ' + FE.config.brand.currency;
  FE.money = n => FE.moneyGross(FE.store.get('segment') === 'b2b' ? n / (1 + FE.config.catalog.vat) : n);
  FE.num = n => new Intl.NumberFormat(FE.store.get('lang') === 'ro' ? 'ro-RO' : 'en-GB').format(n);
})();
