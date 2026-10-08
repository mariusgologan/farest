/* Contextual ambient light.
   Colours come from the route context; a picture (product photo, hero, shop) pulls them toward its own palette,
   proportional to how colourful it is (white windows nudge a little, walnut doors and shop photos pull strongly).
   A hovered/selected swatch (calculator) overrides; time of day shifts the hue. */
(() => {
  const root = document.documentElement, cfgI = FE.config.ambientImage;
  const daypart = () => { const h = new Date().getHours() || 24; return FE.config.dayparts.find(d => h >= d.from && h < d.to) || FE.config.dayparts[1]; };

  const hex2rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const rgb2hex = c => '#' + c.map(v => Math.round(FE.clamp(v, 0, 255)).toString(16).padStart(2, '0')).join('');
  const mix = (a, b, k) => rgb2hex(hex2rgb(a).map((v, i) => v + (hex2rgb(b)[i] - v) * k));
  function rgb2hsl([r, g, b]) {
    r /= 255; g /= 255; b /= 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
    if (!d) return [0, 0, l];
    const s = d / (1 - Math.abs(2 * l - 1));
    const h = mx === r ? ((g - b) / d + 6) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return [h * 60, s, l];
  }
  function hsl2hex(h, s, l) {
    const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c / 2;
    const [r, g, b] = [[c, x, 0], [x, c, 0], [0, c, x], [0, x, c], [x, 0, c], [c, 0, x]][Math.floor(h / 60) % 6];
    return rgb2hex([(r + m) * 255, (g + m) * 255, (b + m) * 255]);
  }

  /* palette of a same-origin picture: hue histogram weighted by chroma, background (near white/black) ignored */
  const cache = new Map();
  function palette(src) {
    if (!cache.has(src)) cache.set(src, new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        try {
          const n = cfgI.size, cv = document.createElement('canvas'); cv.width = cv.height = n;
          const cx = cv.getContext('2d', { willReadFrequently: true }); cx.drawImage(img, 0, 0, n, n);
          const px = cx.getImageData(0, 0, n, n).data, B = cfgI.buckets, bins = Array.from({ length: B }, () => ({ w: 0, rgb: [0, 0, 0] }));
          let used = 0, chroma = 0;
          for (let i = 0; i < px.length; i += 4) {
            const rgb = [px[i], px[i + 1], px[i + 2]], [h, s, l] = rgb2hsl(rgb);
            if (l > cfgI.maxLight || l < cfgI.minLight) continue;
            const w = s * (1 - Math.abs(2 * l - 1)) + 0.02, bin = bins[Math.floor(h / 360 * B) % B];
            bin.w += w; rgb.forEach((v, k) => bin.rgb[k] += v * w); used++; chroma += s;
          }
          if (!used) return resolve(null);
          bins.sort((a, b) => b.w - a.w);
          const tot = bins.reduce((s, b) => s + b.w, 0), pick = b => { const c = b.rgb.map(v => v / b.w), [h, s] = rgb2hsl(c); return hsl2hex(h, Math.max(s, cfgI.boostSat), cfgI.light); };
          const a = pick(bins[0]), second = bins.slice(1).find(b => b.w / tot > cfgI.minShare && Math.abs(rgb2hsl(b.rgb.map(v => v / b.w))[0] - rgb2hsl(bins[0].rgb.map(v => v / bins[0].w))[0]) > 30);
          resolve({ a, b: second ? pick(second) : mix(a, '#ffffff', 0.45), k: FE.clamp(0.35 + (chroma / used) * 1.6, 0.35, 0.95) });
        } catch { resolve(null); }
      };
      img.onerror = () => resolve(null);
      img.src = src;
    }));
    return cache.get(src);
  }

  function apply() {
    const s = FE.store, ctx = FE.config.ambient[s.get('context')] || FE.config.ambient.home, sw = s.get('swatch'), pic = s.get('picture'), dp = daypart();
    root.dataset.ambient = s.get('ambient');
    let [a, b] = ctx;
    if (pic) { a = mix(a, pic.a, pic.k); b = mix(b, pic.b, pic.k); }
    if (sw) a = sw;
    root.style.setProperty('--amb-a', a);
    root.style.setProperty('--amb-b', b);
    root.style.setProperty('--amb-hue', (sw || pic ? 0 : dp.hue) + 'deg');
    root.dataset.daypart = dp.id;
  }

  let token = 0;
  async function setPicture(src) {
    const t = ++token;
    if (!src) return FE.store.set({ picture: null });
    const p = await palette(src);
    if (t === token) FE.store.set({ picture: p });
  }
  FE.ambient = { apply, setPicture, palette };
  FE.store.on((st, prev, patch) => { if ('context' in patch || 'swatch' in patch || 'picture' in patch || 'ambient' in patch) apply(); });
})();
