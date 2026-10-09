/* All behavioural constants live here. Change a value, not the code. */
window.FE = window.FE || {};
FE.config = {
  brand: { name: 'FAR EST', legal: 'FAR EST WINDOWS SRL', since: 1991, factory: 2007, currency: 'lei', vatIncluded: true },
  content: { products: 'content/products.csv', shops: 'content/shops.yaml', offers: 'content/offers.json', faq: 'content/faq.yaml', welcome: 'content/welcome', pages: 'content/pages', site: 'content/site-images.yaml' },
  /* keyless Google Maps: embed iframe (loaded on demand) and universal links */
  maps: { embed: 'https://www.google.com/maps?output=embed&q=', search: 'https://www.google.com/maps/search/?api=1&query=', route: 'https://www.google.com/maps/dir/?api=1&destination=' },
  storageKey: 'farest.mock.v1',
  api: { base: '/api', latency: [120, 380] },
  defaults: { theme: 'auto', layout: 'auto', ambient: 'on', bars: 'auto', lang: 'ro' },
  langs: ['ro', 'en'],
  themes: ['auto', 'light', 'dark'],
  ambientModes: ['on', 'off'],
  barModes: ['auto', 'always'],
  /* menus hide after scrolling down this far (px) and return on any upward movement of this size */
  bars: { hideAfter: 90, downDelta: 6, upDelta: 3, showAbove: 40 },
  /* forced layouts render inside a frame of this width; "auto" follows the window */
  layouts: {
    compact: { width: 420, cols: 1, nav: 'tabs' },
    regular: { width: 860, cols: 2, nav: 'bar' },
    wide:    { width: 1280, cols: 3, nav: 'bar' }
  },
  layoutBreakpoints: { compact: 0, regular: 700, wide: 1100 },
  nav: [
    { id: 'home',    route: '/',                 icon: 'home' },
    { id: 'windows', route: '/c/windows',        icon: 'window' },
    { id: 'doors',   route: '/c/doors',          icon: 'door' },
    { id: 'acc',     route: '/c/accessories',    icon: 'tool' },
    { id: 'calc',    route: '/calculator',       icon: 'calc' },
    { id: 'shops',   route: '/shops',            icon: 'pin' }
  ],
  /* contextual ambient: two colours per context, tuned for both schemes by opacity tokens */
  ambient: {
    home:    ['#005aab', '#6aa9e0'],
    windows: ['#1f7fd6', '#7fd0f0'],
    doors:   ['#b8742a', '#e8b27a'],
    acc:     ['#2f9a8a', '#8fd6c4'],
    calc:    ['#6b5bd6', '#a99cf0'],
    shops:   ['#d6202e', '#f0a0a6'],
    cart:    ['#005aab', '#d6202e']
  },
  catalog: { pageSize: 8, featured: ["fereastra-pvc-4-camere-alb-56x56-cm", "fereastra-pvc-4-camere-alb-116x116-cm", "usa-exterior-din-pvc-cu-geam-termopan-pentru-terasa-osciloculisanta-5-camere-stanga-alb-180-x-210-cm"], groups: { windows: ['ferestre', 'ferestre-duble'], doors: ['usi-interior-exterior-pvc', 'usi-osciloculisante'], accessories: ['oferte'] }, sorts: ['featured', 'price-asc', 'price-desc', 'size'], freeDeliveryFrom: 1500, installPct: 0.12, vat: 0.21 },
  /* ambient from pictures: sample size, thresholds on saturation/lightness, hue buckets */
  ambientImage: { size: 36, minSat: 0.22, minLight: 0.12, maxLight: 0.92, buckets: 12, minShare: 0.035, boostSat: 0.55, light: 0.55 },
  /* configurator: size limits in mm per type, price factor, sash count; pricing is illustrative (lei per m2 by profile tier) */
  calc: {
    types: {
      fix:      { sashes: 0, handed: false, w: [400, 1500], h: [400, 1500], factor: 1 },
      tiltturn: { sashes: 1, handed: true,  w: [450, 900],  h: [500, 1600], factor: 1.15 },
      double:   { sashes: 2, handed: true,  w: [800, 1800], h: [500, 1600], factor: 1.2 },
      tilt:     { sashes: 1, handed: false, w: [450, 1000], h: [400, 800],  factor: 1.05 },
      balcony:  { sashes: 1, handed: true,  w: [700, 1000], h: [1900, 2300], factor: 1.25 }
    },
    start: { type: 'tiltturn', side: 'left', w: 800, h: 1200, qty: 1, profile: 'trocal70', color: 'white', glass: 'clear', install: true },
    perM2: 310, perTier: 120, hardwarePerSash: 90, minArea: 0.6, maxQty: 99, debounceMs: 220
  },
  overlay: { maxDepth: 4, exitMs: 220, coveredScale: .965, coveredShift: -14 },
  toastMs: 3200
};
