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

  const qty = c => c.reduce((n, l) => n + (l.qty || 1), 0);
  FE.store.on((s, prev, patch) => {
    if (!('cart' in patch) || qty(s.cart) <= qty(prev.cart)) return;
    requestAnimationFrame(() => document.querySelectorAll('[data-bind=cart-count]').forEach(el => !el.hidden && FE.motion.spring(el)));
  });
})();
