/* Topic strip: once the page title has scrolled away, a thin row under the header (at the very top while the menus are hidden) says where
   the reader is: page › section › item, the item being the card, row or panel at the top of the screen. It follows the scroll, so a long
   list of cards or specs stays tied to its topic. It repeats headings already on the page, so it is hidden from assistive tech. */
(() => {
  const frame = FE.$('#frame'), bar = FE.$('#topic'), view = FE.$('#view');
  const ITEM = '.card, .tile, .offer, .fact, .how li, .faq details, .t-table tbody tr, .cfg-sec, .line, .pdp-spec, .buybox';
  const TITLE = '.card-title, h2, h3, summary, th, b';
  const text = el => (el?.textContent || '').trim().replace(/\s+/g, ' ');
  let ticking = false, last = '';

  function update() {
    ticking = false;
    const h1 = FE.$('h1', view), top = FE.$('#top').getBoundingClientRect(), line = (document.documentElement.dataset.bars === 'hidden' ? 0 : top.bottom) + bar.offsetHeight + 8;
    const on = !!h1 && h1.getBoundingClientRect().bottom < line && !+document.documentElement.dataset.overlayDepth;
    bar.toggleAttribute('data-on', on);
    if (!on) return;
    /* the section: the last heading outside an item that has passed the line; the item: the first one still reaching below it */
    let sec = null;
    for (const el of FE.$$('h2', view)) { if (el.getBoundingClientRect().top >= line) break; if (!el.parentElement.closest(ITEM)) sec = el; }
    const item = FE.$$(ITEM, view).find(el => { const b = el.getBoundingClientRect(); return b.height && b.bottom > line + 24 && b.top < line + frame.clientHeight / 3; });
    const parts = [text(h1), text(sec), text(item && FE.$(TITLE, item))].filter((s, i, a) => s && a.indexOf(s) === i);
    const key = parts.join('›');
    if (key === last) return;
    last = key;
    bar.firstElementChild.innerHTML = parts.map((s, i) => FE.h`<span class="${i === parts.length - 1 ? 'now' : ''}">${s}</span>`).join('');
  }
  const ask = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  frame.addEventListener('scroll', ask, { passive: true });
  addEventListener('resize', ask);
  /* a new page starts with the strip away; content that arrives later (catalogue pages) is picked up on the next scroll */
  addEventListener('hashchange', () => { last = ''; bar.removeAttribute('data-on'); });
  FE.store.on((s, prev, patch) => { if ('lang' in patch || 'segment' in patch) { last = ''; ask(); } });
})();
