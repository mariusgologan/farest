/* Tiny helpers: safe HTML templating, DOM shortcuts, safe storage. */
FE.$ = (s, r = document) => r.querySelector(s);
FE.$$ = (s, r = document) => [...r.querySelectorAll(s)];
class Raw { constructor(s) { this.s = s; } toString() { return this.s; } }
FE.raw = s => new Raw(s);
FE.esc = v => String(v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
/* h`...`: escapes every interpolation unless it is raw() or an array of such. */
FE.h = (strs, ...vals) => new Raw(strs.reduce((o, s, i) => {
  let v = vals[i - 1];
  v = v instanceof Raw ? v.s : Array.isArray(v) ? v.map(x => x instanceof Raw ? x.s : FE.esc(x ?? '')).join('') : FE.esc(v ?? '');
  return o + v + s;
}));
FE.storage = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode: state stays in memory */ } }
};
FE.sleep = ms => new Promise(r => setTimeout(r, ms));
FE.clamp = (n, a, b) => Math.min(b, Math.max(a, n));
