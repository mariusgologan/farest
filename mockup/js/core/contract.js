/* API contract checker: the JSON Schema subset used by content/api-contract.json. check() returns the first
   failing path with a reason, or null when the value fits. */
(() => {
  let spec = null;
  const kind = v => v === null ? 'null' : Array.isArray(v) ? 'array' : Number.isInteger(v) ? 'integer' : typeof v;
  const resolve = ref => ref.replace(/^#\//, '').split('/').reduce((o, k) => o?.[k], spec) ?? (() => { throw new Error('contract: bad $ref ' + ref); })();

  function check(s, v, at = '$') {
    if (s.$ref) { const e = check(resolve(s.$ref), v, at); if (e) return e; }
    if (s.anyOf) { const es = s.anyOf.map(x => check(x, v, at)); if (es.every(Boolean)) return es.length === 1 ? es[0] : `${at}: matches no allowed shape (${es.join('; ')})`; }
    const k = kind(v);
    if (s.type) { const ts = [].concat(s.type); if (!ts.includes(k) && !(k === 'integer' && ts.includes('number'))) return `${at}: expected ${ts.join('|')}`; }
    if (s.enum && !s.enum.includes(v)) return `${at}: not one of ${s.enum.join(', ')}`;
    if (k === 'string') {
      if (s.minLength != null && v.length < s.minLength) return `${at}: too short`;
      if (s.maxLength != null && v.length > s.maxLength) return `${at}: too long`;
      if (s.pattern && !new RegExp(s.pattern).test(v)) return `${at}: bad format`;
    }
    if (k === 'number' || k === 'integer') {
      if (!Number.isFinite(v)) return `${at}: not finite`;
      if (s.minimum != null && v < s.minimum) return `${at}: below ${s.minimum}`;
      if (s.maximum != null && v > s.maximum) return `${at}: above ${s.maximum}`;
    }
    if (k === 'array') {
      if (s.minItems != null && v.length < s.minItems) return `${at}: too few items`;
      if (s.maxItems != null && v.length > s.maxItems) return `${at}: too many items`;
      if (s.items) for (let i = 0; i < v.length; i++) { const e = check(s.items, v[i], `${at}[${i}]`); if (e) return e; }
    }
    if (k === 'object') {
      for (const r of s.required || []) if (v[r] === undefined) return `${at}.${r}: required`;
      for (const [p, ps] of Object.entries(s.properties || {})) if (v[p] !== undefined) { const e = check(ps, v[p], `${at}.${p}`); if (e) return e; }
      if (s.additionalProperties === false) { const extra = Object.keys(v).find(p => !(p in (s.properties || {}))); if (extra) return `${at}.${extra}: not allowed`; }
    }
    return null;
  }

  FE.contract = {
    use: json => { spec = json; },
    route: key => spec?.routes[key] || null,
    check
  };
})();
