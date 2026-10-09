/* Named projects: the configurator's persistence layer. One record per project in localStorage, a draft until its first
   item is saved, revision-checked so a second tab cannot silently overwrite the first.
   States: OFERTA (editable) -> PLATITA -> FINALIZATA; anything but OFERTA is read-only until reopened. */
(() => {
  const PREFIX = 'farest.proj.v1:', ACTIVE = 'farest.proj.active', MAX_ITEMS = 200;
  const listeners = new Set();
  let active = null;
  const states = () => FE.cfg.data.statuses;
  const copy = v => JSON.parse(JSON.stringify(v));
  const today = () => new Date().toISOString().slice(0, 10);
  const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLocaleLowerCase('ro-RO');
  const digits = s => String(s || '').replace(/\D/g, '').replace(/^(0040|40|0)/, '');
  const fail = code => { throw Object.assign(new Error(code), { code }); };

  const read = id => { try { const r = localStorage.getItem(PREFIX + id); return r ? JSON.parse(r) : null; } catch { return null; } };
  const write = p => { try { localStorage.setItem(PREFIX + p.id, JSON.stringify(p)); } catch (e) { fail(e.name === 'QuotaExceededError' ? 'quota' : 'storage'); } };
  const remember = id => { try { sessionStorage.setItem(ACTIVE, id); localStorage.setItem(ACTIVE, id); } catch { /* optional */ } };
  const emit = () => listeners.forEach(fn => fn(active));

  const P = FE.projects = {
    on(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    get active() { return active; },
    state: p => states().includes(p?.status) ? p.status : 'OFERTA',
    readOnly: p => !!p && P.state(p) !== 'OFERTA',

    list() {
      const out = [];
      for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k?.startsWith(PREFIX)) { const p = read(k.slice(PREFIX.length)); if (p?.items?.length) out.push(p); } }
      return out;
    },
    total: p => p.items.reduce((s, x) => s + (x.quote?.available ? x.quote.total : 0), 0),
    priced: p => p.items.filter(x => x.quote?.available).length,
    pieces: p => p.items.reduce((s, x) => s + x.quantity, 0),

    /* validation shared by create and rename */
    check(name, phone, exceptId) {
      const n = String(name || '').normalize('NFC').trim().replace(/\s+/g, ' ');
      if (!n || n.length > 80) fail('name');
      if (P.list().some(p => p.id !== exceptId && norm(p.name) === norm(n))) fail('duplicate');
      const ph = String(phone || '').trim().replace(/\s+/g, ' '), d = ph.replace(/\D/g, '');
      if (!/^\+?[0-9() .-]+$/.test(ph) || d.length < 7 || d.length > 15) fail('phone');
      return { name: n, phone: ph };
    },

    /* a new project is only a draft: it is stored when its first item is saved */
    create({ name, phone, shop }) {
      const c = P.check(name, phone);
      active = { version: 1, id: crypto.randomUUID(), ...c, shop: shop || '', status: 'OFERTA', revision: 0, createdAt: new Date().toISOString(), createdDate: today(), items: [], isDraft: true };
      emit(); return active;
    },
    open(id) { const p = read(id); if (!p) fail('missing'); active = p; remember(id); emit(); return p; },
    restore() {
      let id = ''; try { id = sessionStorage.getItem(ACTIVE) || localStorage.getItem(ACTIVE) || ''; } catch { /* */ }
      const list = P.list().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      active = list.find(p => p.id === id) || list[0] || null; emit(); return active;
    },
    rename(name, phone) {
      const p = P.mutable(); const c = P.check(name, phone, p.id); Object.assign(p, c);
      if (!p.isDraft) { p.revision++; write(p); } emit();
    },
    mutable() {
      if (!active) fail('noproject');
      if (P.readOnly(active)) fail('locked');
      if (active.isDraft) return active;
      const latest = read(active.id); if (!latest) fail('missing');
      if (latest.revision !== active.revision) fail('conflict');
      return active;
    },

    /* add a line, merging into an identical one; returns {merged: index|-1} */
    add(item) {
      const p = P.mutable(); item = copy(item);
      const same = p.items.find(x => FE.cfg.sameConfig(x, item));
      let merged = -1;
      if (same) {
        const q = same.quantity + item.quantity; if (q > FE.cfg.data.pricing.maxQty) fail('qty');
        const was = same.quantity; same.quantity = q; if (same.quote?.available) same.quote = { ...same.quote, total: same.quote.unit * q };
        merged = { index: p.items.indexOf(same), was };
      } else { if (p.items.length >= MAX_ITEMS) fail('max'); p.items.push(item); }
      P.save(p); return merged;
    },
    update(item) { const p = P.mutable(), i = p.items.findIndex(x => x.id === item.id); if (i < 0) fail('missing'); p.items[i] = copy(item); P.save(p); },
    remove(id) { const p = P.mutable(); p.items = p.items.filter(x => x.id !== id); P.save(p); },
    save(p) {
      if (p.items.length) { delete p.isDraft; p.revision = (p.revision || 0) + 1; write(p); remember(p.id); }
      else { try { localStorage.removeItem(PREFIX + p.id); } catch { /* */ } p.isDraft = true; p.revision = 0; }
      active = p; emit();
    },

    /* status changes are explicit and confirmed by the UI; reopening is the only way back */
    setStatus(next) {
      const p = active; if (!p || p.isDraft || !p.items.length) fail('noproject');
      const latest = read(p.id); if (!latest || latest.revision !== p.revision) fail('conflict');
      const cur = P.state(p), i = states().indexOf(cur), j = states().indexOf(next);
      if (j < 0 || (next !== 'OFERTA' && j !== i + 1)) fail('transition');
      latest.status = next; latest.revision++; write(latest); active = latest; emit();
    },
    nextStatus: p => { const i = states().indexOf(P.state(p)); return states()[i + 1] || null; },

    search(list, { name = '', phone = '', status = '', sort = 'created:desc', from = '', to = '' } = {}) {
      if (from && to && from > to) fail('range');
      const n = norm(name), ph = digits(phone);
      const out = list.filter(p => (!n || norm(p.name).includes(n)) && (!ph || digits(p.phone).includes(ph)) && (!status || P.state(p) === status)
        && (!from || (p.createdDate || '') >= from) && (!to || (p.createdDate || '') <= to));
      const [k, dir] = sort.split(':'), sign = dir === 'asc' ? 1 : -1;
      return out.sort((a, b) => k === 'status' ? sign * (states().indexOf(P.state(a)) - states().indexOf(P.state(b))) || a.name.localeCompare(b.name, 'ro')
        : sign * (a.createdAt || '').localeCompare(b.createdAt || '') || a.name.localeCompare(b.name, 'ro'));
    },
    deleteProject(id) { try { localStorage.removeItem(PREFIX + id); } catch { /* */ } if (active?.id === id) { active = null; } emit(); }
  };
  addEventListener('storage', e => { if (active && e.key === PREFIX + active.id && e.newValue) { active = JSON.parse(e.newValue); emit(); } });
})();
