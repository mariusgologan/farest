/* Motion: route cross-fade and card-image morph (View Transitions), cart badge spring, price pulse, sash swing.
   Feature-detected and skipped under prefers-reduced-motion; nothing here runs at idle (one click listener, one store listener). */
(() => {
  const still = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NAME = 'view-transition-name', MORPH = 'product-img';
  let last = null, picked = null;

  /* the picture of the product card that was clicked is what morphs into the product page picture */
  document.addEventListener('click', e => { picked = e.target.closest?.('.card a[href^="#/p/"]')?.closest('.card')?.querySelector('.card-art > *') || null; }, true);

  const hero = () => document.querySelector('[data-bind=hero] > *');
  const play = (el, frames, opts) => { if (!el?.animate || still()) return null; return el.animate(frames, opts); };

  FE.motion = {
    /* router hook: runs `apply` (renders the route), inside a view transition when the route really changes */
    navigate(path, apply) {
      const skip = last === null || path === last || !document.startViewTransition || still();
      last = path;
      const from = !skip && /^\/p\//.test(path) ? picked : null;
      picked = null;
      if (skip) return apply();
      from?.style.setProperty(NAME, MORPH);
      const t = document.startViewTransition(async () => { await apply(); if (from) hero()?.style.setProperty(NAME, MORPH); });
      t.ready.catch(() => {});
      t.finished.catch(() => {}).finally(() => { from?.style.removeProperty(NAME); hero()?.style.removeProperty(NAME); });
      return t.updateCallbackDone;
    },
    /* the cart badge springs when the number of items goes up */
    spring(el) { play(el, [{ transform: 'scale(.55)' }, { transform: 'scale(1.3)', offset: .55 }, { transform: 'scale(1)' }], { duration: 420, easing: 'cubic-bezier(.3,1.4,.5,1)' }); },
    /* a short pulse on a value that just changed */
    pulse(el) { if (!el) return; el.style.transformOrigin = 'left center'; play(el, [{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(1.07)', opacity: .7, offset: .4 }, { transform: 'scale(1)', opacity: 1 }], { duration: 340, easing: 'ease-out' }); },
    /* sashes and door leaves in a drawing swing open and shut; `elapsed` resumes a swing whose drawing was repainted */
    swing(root, elapsed = 0) {
      root.querySelectorAll('.cfg-svg .sash').forEach(g => {
        const turn = g.dataset.k !== 'kipp', to = turn ? 'scaleX(.28)' : 'scaleY(.86)', from = turn ? 'scaleX(1)' : 'scaleY(1)';
        const a = play(g, [{ transform: from }, { transform: to, offset: .45 }, { transform: from }], { duration: 760, easing: 'ease-in-out' });
        if (a) a.currentTime = elapsed;
      });
    },
    /* animate an element between two transforms after a repaint replaced it */
    flip(el, from, to) { play(el, [{ transform: from }, { transform: to }], { duration: 500, easing: 'ease' }); }
  };

  /* 3D tilt (max 4deg) on drawings and product card pictures, fine pointers only; the container receives the pointer, its first child rotates */
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const TILT = '.cfg-review-art, .card-art';
  let tEl = null, tRaf = 0, tX = 0, tY = 0;
  const tiltChild = el => el.firstElementChild;
  const tilt = () => {
    tRaf = 0; const c = tEl && tiltChild(tEl); if (!c) return;
    const r = tEl.getBoundingClientRect(), nx = (tX - r.left) / r.width - .5, ny = (tY - r.top) / r.height - .5;
    c.classList.add('tilt'); c.style.transitionDuration = '120ms';
    c.style.transform = `perspective(700px) rotateX(${(-ny * 8).toFixed(2)}deg) rotateY(${(nx * 8).toFixed(2)}deg)`;
  };
  const move = e => { tX = e.clientX; tY = e.clientY; if (!tRaf) tRaf = requestAnimationFrame(tilt); };
  const rest = () => {
    if (!tEl) return;
    if (tRaf) { cancelAnimationFrame(tRaf); tRaf = 0; }
    const c = tiltChild(tEl); if (c) { c.style.transitionDuration = '420ms'; c.style.transform = ''; }
    tEl.removeEventListener('pointermove', move); tEl = null;
  };
  document.addEventListener('pointerover', e => {
    if (!fine.matches || still() || document.documentElement.dataset.skin === 'corporate') return;
    const el = e.target.closest?.(TILT);
    if (!el || el === tEl) return;
    rest(); tEl = el; el.addEventListener('pointermove', move, { passive: true });
  });
  document.addEventListener('pointerout', e => { if (tEl && !tEl.contains(e.relatedTarget)) rest(); });

  /* accent hint: the dominant colour of the product photo, sampled on a 24px copy and cached per image; near-neutral photos (most white PVC
     windows) give no hint and the brand accent stays. Lightness is moved until the colour reaches 4.8:1 on the lightest/darkest surface the text can sit on. */
  const hsl = ([r, g, b]) => { const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn, s = d ? d / (1 - Math.abs(2 * l - 1)) : 0;
    const h = !d ? 0 : mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; return [(h * 60 + 360) % 360, s, l]; };
  const rgb = (h, s, l) => { const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c / 2, [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x]; return [r + m, g + m, b + m]; };
  const lum = c => { const [r, g, b] = c.map(v => v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4); return .2126 * r + .7152 * g + .0722 * b; };
  const ratio = (a, b) => (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
  const hex = c => '#' + c.map(v => Math.round(Math.min(1, Math.max(0, v)) * 255).toString(16).padStart(2, '0')).join('');
  const sampled = new Map();
  const sample = src => sampled.has(src) ? sampled.get(src) : (sampled.set(src, new Promise(done => {
    const img = new Image(); img.onload = () => {
      try {
        const n = 24, cv = document.createElement('canvas'); cv.width = cv.height = n;
        const cx = cv.getContext('2d', { willReadFrequently: true }); cx.drawImage(img, 0, 0, n, n);
        const px = cx.getImageData(0, 0, n, n).data; let x = 0, y = 0, w = 0, used = 0;
        for (let i = 0; i < px.length; i += 4) {
          const [h, s, l] = hsl([px[i] / 255, px[i + 1] / 255, px[i + 2] / 255]);
          if (s < .25 || l < .15 || l > .9) continue;
          const wt = s * (1 - Math.abs(2 * l - 1)); x += Math.cos(h * Math.PI / 180) * wt; y += Math.sin(h * Math.PI / 180) * wt; w += s; used++;
        }
        done(used / (n * n) < .06 ? null : { h: (Math.atan2(y, x) * 180 / Math.PI + 360) % 360, s: Math.min(.8, Math.max(.45, w / used)) });
      } catch { done(null); }
    };
    img.onerror = () => done(null); img.src = src;
  })), sampled.get(src));
  const setAccent = async () => {
    const root = document.documentElement, src = FE.ambient?.page;
    const c = src && /^\/p\//.test(FE.store.get('route')) ? await sample(src) : null;
    if (!c || src !== FE.ambient?.page) return c === null && root.style.removeProperty('--accent-hint');
    const dark = root.dataset.theme === 'dark', ref = dark ? lum([.165, .216, .278]) : lum([.91, .93, .95]);
    let l = dark ? .68 : .36;
    for (let i = 0; i < 25 && ratio(lum(rgb(c.h, c.s, l)), ref) < 4.8; i++) l += dark ? .02 : -.02;
    root.style.setProperty('--accent-hint', hex(rgb(c.h, c.s, l)));
  };
  FE.store.on((s, prev, patch) => { if ('picture' in patch || 'theme' in patch || 'route' in patch) queueMicrotask(setAccent); });

  const qty = c => c.reduce((n, l) => n + (l.qty || 1), 0);
  FE.store.on((s, prev, patch) => {
    if (!('cart' in patch) || qty(s.cart) <= qty(prev.cart)) return;
    requestAnimationFrame(() => document.querySelectorAll('[data-bind=cart-count]').forEach(el => !el.hidden && FE.motion.spring(el)));
  });
})();
