/* Dependency-free parsers for the static content files.
   yaml: subset (maps, lists, lists of maps, quoted/plain scalars, numbers, booleans, null, # comments; no anchors, no block scalars).
   csv: RFC 4180 quotes, header row -> objects. md: safe subset (escapes HTML first). */
(() => {
  /* split flow collections on commas outside quotes */
  const flowSplit = s => { const out = []; let cur = '', q = null; for (const c of s) { if (q) { if (c === q) q = null; cur += c; } else if (c === '"' || c === "'") { q = c; cur += c; } else if (c === ',') { out.push(cur); cur = ''; } else cur += c; } if (cur.trim()) out.push(cur); return out.map(x => x.trim()).filter(Boolean); };
  const scalar = s => {
    s = s.trim();
    if (/^"(.*)"$/.test(s)) return s.slice(1, -1).replace(/\\"/g, '"').replace(/\\n/g, '\n');
    if (/^'(.*)'$/.test(s)) return s.slice(1, -1).replace(/''/g, "'");
    if (/^\[.*\]$/.test(s)) return flowSplit(s.slice(1, -1)).map(scalar);
    if (/^\{.*\}$/.test(s)) return Object.fromEntries(flowSplit(s.slice(1, -1)).map(kv => { const i = kv.indexOf(':'); return [scalar(kv.slice(0, i)), scalar(kv.slice(i + 1))]; }));
    if (/^(true|false)$/.test(s)) return s === 'true';
    if (/^(null|~|)$/.test(s)) return null;
    if (/^-?\d+(\.\d+)?$/.test(s)) return +s;
    return s;
  };
  const stripComment = l => l.replace(/(^|\s)#.*$/, m => (/["']/.test(l.slice(0, l.indexOf('#'))) && (l.slice(0, l.indexOf('#')).match(/["']/g) || []).length % 2 ? m : ''));

  function yaml(src) {
    const lines = src.replace(/\r/g, '').split('\n').map(stripComment).filter(l => l.trim()).map(l => ({ ind: l.match(/^ */)[0].length, txt: l.trim() }));
    let i = 0;
    const block = ind => (lines[i]?.txt.startsWith('- ') || lines[i]?.txt === '-') ? list(ind) : map(ind);
    function map(ind) {
      const o = {};
      while (i < lines.length && lines[i].ind === ind && !lines[i].txt.startsWith('- ')) {
        const m = lines[i].txt.match(/^("[^"]*"|'[^']*'|[^:]+?):(?:\s+(.*))?$/);
        if (!m) throw new Error('yaml: bad line ' + lines[i].txt);
        const key = scalar(m[1]); i++;
        if (m[2] != null && m[2] !== '') o[key] = scalar(m[2]);
        else if (i < lines.length && (lines[i].ind > ind || (lines[i].ind === ind && lines[i].txt.startsWith('- ')))) o[key] = block(lines[i].ind);
        else o[key] = null;
      }
      return o;
    }
    function list(ind) {
      const a = [];
      while (i < lines.length && lines[i].ind === ind && lines[i].txt.startsWith('-')) {
        const rest = lines[i].txt.slice(1).trim();
        if (!rest) { i++; a.push(block(lines[i].ind)); }
        else if (/^("[^"]*"|'[^']*'|[^:"'\[]+):(\s|$)/.test(rest)) { lines[i] = { ind: ind + 2, txt: rest }; a.push(map(ind + 2)); }
        else { a.push(scalar(rest)); i++; }
      }
      return a;
    }
    return lines.length ? block(lines[0].ind) : {};
  }

  function csv(src) {
    const rows = []; let row = [], cur = '', q = false;
    for (let k = 0; k < src.length; k++) {
      const c = src[k];
      if (q) { if (c === '"' && src[k + 1] === '"') { cur += '"'; k++; } else if (c === '"') q = false; else cur += c; }
      else if (c === '"') q = true;
      else if (c === ',') { row.push(cur); cur = ''; }
      else if (c === '\n' || c === '\r') { if (c === '\r' && src[k + 1] === '\n') k++; row.push(cur); rows.push(row); row = []; cur = ''; }
      else cur += c;
    }
    if (cur || row.length) { row.push(cur); rows.push(row); }
    const [head, ...body] = rows.filter(r => r.some(x => x.trim()));
    return body.map(r => Object.fromEntries(head.map((k, j) => [k.trim(), scalar(r[j] ?? '')])));
  }

  const esc = FE.esc;
  const inline = s => esc(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, t, u) => /^(https?:|mailto:|tel:|#|\/|\.)/.test(u.replace(/&amp;/g, '&')) ? `<a href="${u}">${t}</a>` : t);
  function md(src) {
    const out = []; let list = null, para = [];
    const flush = () => { if (para.length) out.push(`<p>${inline(para.join(' '))}</p>`); para = []; };
    const close = () => { if (list) out.push(`</${list}>`); list = null; };
    for (const line of src.replace(/\r/g, '').split('\n')) {
      let m;
      if (!line.trim()) { flush(); close(); }
      else if ((m = line.match(/^(#{1,4})\s+(.*)$/))) { flush(); close(); out.push(`<h${m[1].length + 1}>${inline(m[2])}</h${m[1].length + 1}>`); }
      else if ((m = line.match(/^\s*([-*]|\d+\.)\s+(.*)$/))) { flush(); const t = /\d/.test(m[1]) ? 'ol' : 'ul'; if (list !== t) { close(); out.push(`<${t}>`); list = t; } out.push(`<li>${inline(m[2])}</li>`); }
      else if ((m = line.match(/^>\s?(.*)$/))) { flush(); close(); out.push(`<blockquote>${inline(m[1])}</blockquote>`); }
      else if (/^---+$/.test(line.trim())) { flush(); close(); out.push('<hr>'); }
      else para.push(line.trim());
    }
    flush(); close();
    return out.join('\n');
  }

  /* "---\nyaml\n---\nmarkdown" */
  function frontMatter(src) {
    const m = src.replace(/\r/g, '').match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
    return m ? { meta: yaml(m[1]), body: m[2] } : { meta: {}, body: src };
  }
  FE.parse = { yaml, csv, md, frontMatter, scalar };
})();
