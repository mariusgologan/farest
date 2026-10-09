/* Configurator drawings: every picture is generated from the selection (no photo files).
   FE.cfg.draw.item/panel/room/profile return an HTML string (raw). Pure: same input, same markup. */
(() => {
  const { cfg, raw } = FE;
  let seq = 0;
  const LONG = 220, GLASS_LINE = 'var(--glass-line)';
  const round = n => Math.round(n * 10) / 10;

  const frameFill = (col, id) => col.grain ? `url(#${id}g)` : col.hex;
  const defs = (id, col) => `<defs>
    <linearGradient id="${id}c" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--glass-a)"/><stop offset="1" stop-color="var(--glass-b)"/></linearGradient>
    <pattern id="${id}d" width="9" height="9" patternUnits="userSpaceOnUse"><path d="M0 4.5 Q2.2 1 4.5 4.5 T9 4.5" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width=".9"/></pattern>
    <pattern id="${id}h" width="12" height="12" patternUnits="userSpaceOnUse"><path d="M0 6 L6 0 L12 6 L6 12 Z" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width=".9"/><circle cx="6" cy="6" r="1.1" fill="#fff" fill-opacity=".5"/></pattern>
    ${col.grain ? `<pattern id="${id}g" width="14" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(90)"><rect width="14" height="6" fill="${col.hex}"/><path d="M0 1.5 Q7 0 14 1.5 M0 4.5 Q7 6 14 4.5" fill="none" stroke="${col.grain}" stroke-opacity=".55" stroke-width=".8"/></pattern>` : ''}</defs>`;

  /* a pane of glass or a PVC panel at x,y,w,h */
  const pane = (x, y, w, h, glass, col, id) => {
    const r = `x="${round(x)}" y="${round(y)}" width="${round(w)}" height="${round(h)}"`;
    if (glass === 'panel') return `<rect ${r} fill="${frameFill(col, id)}" stroke="rgb(0 0 0 / .28)" stroke-width=".8"/><rect x="${round(x + w * .12)}" y="${round(y + h * .08)}" width="${round(w * .76)}" height="${round(h * .84)}" fill="none" stroke="rgb(0 0 0 / .22)" stroke-width="1"/>`;
    return `<rect ${r} fill="url(#${id}c)" stroke="rgb(0 0 0 / .28)" stroke-width=".8"/>`
      + (glass === 'delta4-lowe' ? `<rect ${r} fill="url(#${id}d)"/><rect ${r} fill="#fff" opacity=".12"/>` : '')
      + (glass === 'hasir4-lowe' ? `<rect ${r} fill="url(#${id}h)"/>` : '')
      + (glass === 'mat4-lowe' ? `<rect ${r} fill="#fff" opacity=".62"/>` : '')
      + (glass === 'f4-lowe' ? `<rect ${r} fill="#6fc7a4" opacity=".10"/>` : '');
  };

  /* opening symbols: solid lines meet at the hinge, dashed lines mark tilt */
  const symbols = (k, h, x, y, w, ht) => {
    const turn = h === 'L' ? `M${x + w} ${y} L${x} ${y + ht / 2} L${x + w} ${y + ht}` : `M${x} ${y} L${x + w} ${y + ht / 2} L${x} ${y + ht}`;
    const tilt = `M${x} ${y} L${x + w / 2} ${y + ht} L${x + w} ${y}`;
    const st = `fill="none" stroke="${GLASS_LINE}" stroke-width="1.2" stroke-linejoin="round"`;
    return (k === 'sd' || k === 'dd' ? `<path d="${turn}" ${st}/>` : '') + (k === 'dd' || k === 'kipp' ? `<path d="${tilt}" ${st} stroke-dasharray="4 3"/>` : '');
  };
  const handle = (hinge, x, y, w, ht, k) => k === 'kipp'
    ? `<rect x="${round(x + w / 2 - 8)}" y="${round(y + 4)}" width="16" height="3" rx="1.5" fill="rgb(40 40 40 / .75)"/>`
    : `<rect x="${round(hinge === 'L' ? x + w - 6 : x + 3)}" y="${round(y + ht / 2 - 8)}" width="3" height="16" rx="1.5" fill="rgb(40 40 40 / .78)"/>`;

  /* window or balcony door leaves inside a box; item.side mirrors the pattern */
  const leaves = (item, b, id, col) => {
    const t = cfg.type(item.type);
    let parts = t.parts.map(p => ({ ...p }));
    if (item.side === 'stanga' || item.side === 'left') parts = parts.reverse().map(p => ({ ...p, h: p.h === 'L' ? 'R' : p.h === 'R' ? 'L' : p.h }));
    const f = Math.max(5, Math.min(b.w, b.h) * .055), sill = t.door ? 6 : 0, gap = 2.5;
    const cw = (b.w - 2 * f - gap * (parts.length - 1)) / parts.length, top = b.y + f, ht = b.h - 2 * f - sill;
    let out = `<rect x="${round(b.x)}" y="${round(b.y)}" width="${round(b.w)}" height="${round(b.h)}" rx="2" fill="${frameFill(col, id)}" stroke="rgb(0 0 0 / .32)"/>`;
    parts.forEach((p, i) => {
      const x = b.x + f + i * (cw + gap), mov = p.k !== 'fix', s = mov ? Math.min(6, cw * .06) : 0;
      if (mov) out += `<rect x="${round(x)}" y="${round(top)}" width="${round(cw)}" height="${round(ht)}" fill="${frameFill(col, id)}" stroke="rgb(0 0 0 / .3)" stroke-width=".8"/>`;
      out += pane(x + s, top + s, cw - 2 * s, ht - 2 * s, item.glass, col, id);
      if (mov) out += symbols(p.k, p.h, x + s, top + s, cw - 2 * s, ht - 2 * s) + handle(p.h, x + s, top + s, cw - 2 * s, ht - 2 * s, p.k);
    });
    if (sill) out += `<rect x="${round(b.x + f)}" y="${round(top + ht)}" width="${round(b.w - 2 * f)}" height="${sill}" fill="#8b929a"/>`;
    return out;
  };

  /* ornaments for the ornamental panel doors: one motif per model */
  const ornament = (m, x, y, w, h) => {
    const s = 'fill="none" stroke="rgb(0 0 0 / .3)" stroke-width="1.1"', cx = x + w / 2;
    const r = (a, b, c, d) => `<rect x="${round(x + w * a)}" y="${round(y + h * b)}" width="${round(w * c)}" height="${round(h * d)}" rx="1" ${s}/>`;
    return ({
      verona: `<path d="M${x + w * .2} ${y + h * .45} V${y + h * .2} Q${cx} ${y + h * .02} ${x + w * .8} ${y + h * .2} V${y + h * .45} Z" ${s}/>${r(.2, .55, .6, .35)}`,
      bari: r(.18, .1, .28, .8) + r(.54, .1, .28, .8),
      venetia: `<path d="M${cx} ${y + h * .12} L${x + w * .82} ${y + h * .4} L${cx} ${y + h * .68} L${x + w * .18} ${y + h * .4} Z" ${s}/>${r(.25, .74, .5, .16)}`,
      milano: r(.2, .08, .6, .24) + r(.2, .38, .6, .24) + r(.2, .68, .6, .24),
      rebecca: `<ellipse cx="${cx}" cy="${round(y + h * .35)}" rx="${round(w * .3)}" ry="${round(h * .22)}" ${s}/>${r(.2, .66, .6, .24)}`,
      bologna: r(.18, .1, .64, .36) + r(.18, .54, .3, .36) + r(.52, .54, .3, .36),
      napoli: `<circle cx="${cx}" cy="${round(y + h * .26)}" r="${round(w * .22)}" ${s}/><circle cx="${cx}" cy="${round(y + h * .72)}" r="${round(w * .22)}" ${s}/>`
    })[m] || '';
  };

  /* one door leaf: fill pattern decides where glass and panel go; the lever sits on the free edge */
  const doorLeaf = (item, x, y, w, h, id, col, { main = true, hinge = 'R' } = {}) => {
    const t = cfg.type(item.type), f = Math.max(5, w * .08), ix = x + f, iy = y + f, iw = w - 2 * f, ih = h - 2 * f;
    let out = `<rect x="${round(x)}" y="${round(y)}" width="${round(w)}" height="${round(h)}" rx="2" fill="${frameFill(col, id)}" stroke="rgb(0 0 0 / .32)"/>`;
    const glass = item.glass, fill = t.fill;
    if (fill === 'ornament') out += pane(ix, iy, iw, ih, 'panel', col, id) + ornament(t.ornament, ix, iy, iw, ih);
    else if (fill === 't-bars') {
      const g = glass === 'panel' ? 'f4-lowe' : glass;
      if (t.leaves === 1) out += pane(ix, iy, iw * .3, ih * .7, g, col, id) + pane(ix + iw * .34, iy, iw * .66, ih * .7, g, col, id) + pane(ix, iy + ih * .74, iw, ih * .26, 'panel', col, id);
      else for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++) out += pane(ix + c * (iw * .52), iy + r * (ih * .24), iw * .48, ih * .22, g, col, id);
      if (t.leaves === 2) out += pane(ix, iy + ih * .74, iw, ih * .26, 'panel', col, id);
    } else if (fill === 'panel') out += pane(ix, iy, iw, ih, 'panel', col, id);
    else if (fill === 'full') out += pane(ix, iy, iw, ih, glass, col, id);
    else {
      const gh = ih * (fill === 'third' ? .34 : .62);
      out += pane(ix, iy, iw, gh, glass, col, id) + pane(ix, iy + gh + 3, iw, ih - gh - 3, 'panel', col, id);
    }
    const lx = main ? (hinge === 'R' ? x + f * .35 : x + w - f * .35 - 3) : null;
    if (lx !== null) out += `<rect x="${round(lx)}" y="${round(y + h * .5)}" width="3" height="${round(h * .05)}" rx="1.5" fill="#5b6770"/>`;
    for (const yy of [.12, .5, .88]) out += `<rect x="${round(hinge === 'R' ? x + w - 3 : x)}" y="${round(y + h * yy - 4)}" width="3" height="8" fill="rgb(0 0 0 / .4)"/>`;
    return out;
  };

  const doorGroup = (item, b, id, col) => {
    const t = cfg.type(item.type), hinge = item.side === 'stanga' ? 'L' : 'R';
    const sill = item.threshold === 'aluminium' ? 6 : 3, h = b.h - sill;
    let out = '';
    if (t.leaves === 2) {
      const total = Number(item.width) || (t.limits.wmin + t.limits.wmax) / 2, pw = b.w * (t.pui / total), mw = b.w - pw;
      const mx = hinge === 'R' ? b.x + pw : b.x, px = hinge === 'R' ? b.x : b.x + mw;
      out += doorLeaf({ ...item, glass: item.glass }, mx, b.y, mw, h, id, col, { main: true, hinge }) + doorLeaf(item, px, b.y, pw, h, id, col, { main: false, hinge: hinge === 'R' ? 'L' : 'R' });
    } else out += doorLeaf(item, b.x, b.y, b.w, h, id, col, { main: true, hinge });
    return out + `<rect x="${round(b.x)}" y="${round(b.y + h)}" width="${round(b.w)}" height="${sill}" fill="${item.threshold === 'aluminium' ? '#aab1b8' : '#8b929a'}"/>`;
  };

  const group = (item, b, id) => {
    const col = cfg.colour(item.colour) || cfg.colour('alb');
    return cfg.type(item.type).fill ? doorGroup(item, b, id, col) : leaves(item, b, id, col);
  };

  const fit = (item, w, h) => {
    const t = cfg.type(item.type), lm = cfg.limits(t === undefined ? 'fix' : item.type, item);
    const W = Number(w) || (lm.wmin + lm.wmax) / 2, H = Number(h) || (lm.hmin + lm.hmax) / 2;
    return W / H >= 1 ? { w: LONG, h: round(LONG * H / W) } : { w: round(LONG * W / H), h: LONG };
  };
  const dimsMarkup = (x, y, w, h, W, H) => `<g font-size="11" text-anchor="middle" fill="var(--text-2)"><text x="${round(x + w / 2)}" y="${round(y + h + 17)}">${W} mm</text><text transform="translate(${round(x - 9)} ${round(y + h / 2)}) rotate(-90)">${H} mm</text></g>`;

  const wrap = (inner, vw, vh, label, cls = 'cfg-svg') => raw(`<svg class="${cls}" viewBox="0 0 ${round(vw)} ${round(vh)}" ${label ? `role="img" aria-label="${FE.esc(label)}"` : 'aria-hidden="true"'} style="aspect-ratio:${round(vw)}/${round(vh)}">${inner}</svg>`);

  const draw = FE.cfg.draw = {};

  draw.item = (item, { dims = false, label = '' } = {}) => {
    if (item.product === 'panels') return draw.panel(item, { dims, label });
    const id = 'd' + ++seq, col = cfg.colour(item.colour) || cfg.colour('alb'), sz = fit(item, item.width, item.height), pad = dims ? 26 : 3;
    const body = group(item, { x: pad, y: pad, w: sz.w, h: sz.h }, id);
    return wrap(defs(id, col) + body + (dims ? dimsMarkup(pad, pad, sz.w, sz.h, item.width || '–', item.height || '–') : ''), sz.w + 2 * pad, sz.h + 2 * pad, label);
  };

  /* panel product: two units placed to scale, a coupling gap between them */
  draw.panel = (item, { dims = false, label = '' } = {}) => {
    const p = item.panel, g = cfg.panelGeometry(p), id = 'd' + ++seq, col = cfg.colour(p.colour) || cfg.colour('alb'), pad = dims ? 26 : 3;
    const mm = n => Number(n) || 1000, ow = g.overallW + (g.axis === 'width' ? g.thickness : 0) || 1500, oh = g.overallH + (g.axis === 'height' ? g.thickness : 0) || 1500;
    const sc = LONG / Math.max(ow, oh), gap = g.thickness * sc, di = cfg.panelDoorIndex(p);
    const sized = g.components.map(c => ({ w: mm(c.width) * sc, h: mm(c.height) * sc }));
    const placed = [];
    if (p.scheme === 'windows-side') { placed[0] = { x: 0, y: 0 }; placed[1] = { x: sized[0].w + gap, y: 0 }; }
    else if (p.scheme === 'windows-stack') { placed[0] = { x: 0, y: 0 }; placed[1] = { x: 0, y: sized[0].h + gap }; }
    else if (p.scheme === 'door-side') { const d = di, w = 1 - di; const dx = d === 0 ? 0 : sized[w].w + gap; placed[d] = { x: dx, y: 0 }; placed[w] = { x: d === 0 ? sized[d].w + gap : 0, y: 0 }; }
    else { placed[1] = { x: 0, y: 0 }; placed[0] = { x: 0, y: sized[1].h + gap }; }
    const W = Math.max(...placed.map((q, i) => q.x + sized[i].w)), H = Math.max(...placed.map((q, i) => q.y + sized[i].h));
    let body = '';
    p.components.forEach((c, i) => {
      if (!c.type) { body += `<rect x="${round(pad + placed[i].x)}" y="${round(pad + placed[i].y)}" width="${round(sized[i].w)}" height="${round(sized[i].h)}" fill="none" stroke="var(--line)" stroke-dasharray="4 3"/>`; return; }
      const it = { product: cfg.productOf(c.type), type: c.type, side: c.side, threshold: c.threshold, series: p.series, colour: p.colour, glass: c.glass || cfg.defaultGlass(c.type), width: mm(c.width), height: mm(c.height) };
      body += group(it, { x: pad + placed[i].x, y: pad + placed[i].y, w: sized[i].w, h: sized[i].h }, id);
    });
    return wrap(defs(id, col) + body + (dims ? dimsMarkup(pad, pad, W, H, round(g.overallW), round(g.overallH)) : ''), W + 2 * pad, H + 2 * pad, label);
  };

  /* an interior with the door in it, to scale (door ~2.1 m in a 2.6 m wall); `open` swings the leaf */
  draw.room = (item, room, open) => {
    const id = 'd' + ++seq, col = cfg.colour(item.colour) || cfg.colour('alb'), VW = 400, VH = 300, floorY = 252, wallMm = 2600;
    const t = cfg.type(item.type), H = (Number(item.height) || 2100) / wallMm * floorY, W = (Number(item.width) || 1000) / wallMm * floorY;
    const x = VW / 2 - W / 2, y = floorY - H, hinge = item.side === 'stanga' ? 'L' : 'R';
    const door = `<g class="room-leaf" style="transform-box:fill-box;transform-origin:${hinge === 'L' ? 'left' : 'right'} center;transform:${open ? 'scaleX(.22)' : 'none'}">${doorGroup(item, { x, y, w: W, h: H }, id, col)}</g>`;
    return wrap(defs(id, col)
      + `<rect width="${VW}" height="${VH}" fill="${room.wall}"/><rect y="${floorY}" width="${VW}" height="${VH - floorY}" fill="${room.floor}"/><rect y="${floorY - 6}" width="${VW}" height="6" fill="rgb(255 255 255 / .55)"/>`
      + `<rect x="${round(x - 3)}" y="${round(y - 3)}" width="${round(W + 6)}" height="${round(H + 3)}" fill="${room.accent}"/><rect x="${round(x)}" y="${round(y)}" width="${round(W)}" height="${round(H)}" fill="#1d252c" opacity=".78"/>`
      + door + `<rect x="${round(VW * .08)}" y="${round(floorY - 70)}" width="26" height="70" rx="3" fill="${room.accent}" opacity=".7"/><circle cx="${round(VW * .08 + 13)}" cy="${round(floorY - 82)}" r="14" fill="#5f8a5a" opacity=".8"/>`
      + `<rect x="${round(VW * .78)}" y="${round(floorY - 54)}" width="56" height="54" rx="3" fill="${room.accent}" opacity=".6"/>`,
      VW, VH, '', 'cfg-svg cfg-room');
  };

  /* profile cross-section: N chambers inside the frame, two seals */
  draw.profile = series => {
    const s = cfg.series(series), n = s?.chambers || 4, id = 'd' + ++seq, w = 60, h = 78, ch = (h - 12) / n;
    let cells = '';
    for (let i = 0; i < n; i++) cells += `<rect x="12" y="${round(6 + i * ch + 1)}" width="${w - 24}" height="${round(ch - 2)}" rx="2" fill="#fff" stroke="rgb(0 0 0 / .35)"/>`;
    return wrap(`<rect x="3" y="3" width="${w - 6}" height="${h - 6}" rx="5" fill="#e6eaee" stroke="rgb(0 0 0 / .4)"/>${cells}<path d="M3 ${h * .3} h7 M3 ${h * .7} h7" stroke="#2b2f33" stroke-width="2.4"/>`, w, h, FE.t('cfg.profileSection', { name: s?.name }), 'cfg-svg cfg-profile');
  };

  draw.swatchStyle = col => col.grain ? `background:repeating-linear-gradient(90deg,${col.hex} 0 5px,${col.grain} 5px 6px,${col.hex} 6px 11px);` : `background:${col.hex};`;
  draw.glassStyle = g => ({
    'f4-lowe': 'background:linear-gradient(135deg,var(--glass-a),var(--glass-b));',
    'delta4-lowe': 'background:repeating-radial-gradient(circle at 30% 30%,rgb(255 255 255 / .5) 0 2px,transparent 2px 7px),linear-gradient(135deg,var(--glass-a),var(--glass-b));',
    'hasir4-lowe': 'background:repeating-linear-gradient(45deg,rgb(255 255 255 / .55) 0 1px,transparent 1px 8px),repeating-linear-gradient(-45deg,rgb(255 255 255 / .55) 0 1px,transparent 1px 8px),linear-gradient(135deg,var(--glass-a),var(--glass-b));',
    'mat4-lowe': 'background:linear-gradient(135deg,#f4f5f1,#e1e4de);',
    panel: 'background:#f4f6f8;'
  })[g] || '';
})();
