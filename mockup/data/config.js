/* All behavioural constants live here. Change a value, not the code. */
window.FE = window.FE || {};
FE.config = {
  brand: { name: 'FAR EST', legal: 'FAR EST WINDOWS SRL', since: 1991, factory: 2007, currency: 'lei', vatIncluded: true },
  content: { products: 'content/products.csv', shops: 'content/shops.yaml', offers: 'content/offers.json', faq: 'content/faq.yaml', welcome: 'content/welcome', pages: 'content/pages', site: 'content/site-images.yaml' },
  /* keyless Google Maps: embed iframe (loaded on demand) and universal links */
  maps: { embed: 'https://www.google.com/maps?output=embed&q=', search: 'https://www.google.com/maps/search/?api=1&query=', route: 'https://www.google.com/maps/dir/?api=1&destination=' },
  storageKey: 'farest.mock.v1',
  api: { base: '/api', latency: [120, 380] },
  defaults: { theme: 'auto', layout: 'auto', ambient: 'on', time: 'auto', bars: 'auto', lang: 'ro' },
  langs: ['ro', 'en'],
  themes: ['auto', 'light', 'dark'],
  ambientModes: ['on', 'off'],
  barModes: ['auto', 'always'],
  /* menus hide after scrolling down this far (px) and return on any upward movement of this size */
  bars: { hideAfter: 90, downDelta: 6, upDelta: 3, showAbove: 40 },
  timeModes: ['auto', 'day', 'night'],
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
  /* window light: sunrise/sunset hours swing with the season of the year (f = 1 at midsummer, -1 at midwinter);
     rays: count, spread (deg), and how long one breath of light takes (s) */
  sky: {
    sunrise: { base: 6.5, swing: 1.0 }, sunset: { base: 18.5, swing: 2.0 }, midsummerDay: 172,
    refreshMs: 60000, rays: { count: 9, spread: 46, breathe: [9, 19] }
  },
  /* time-of-day nudges the ambient hue rotation (degrees) and strength */
  dayparts: [
    { from: 5,  to: 11, id: 'morning', hue: -8, boost: 1.0 },
    { from: 11, to: 17, id: 'day',     hue: 0,  boost: 1.0 },
    { from: 17, to: 21, id: 'evening', hue: 14, boost: 1.1 },
    { from: 21, to: 29, id: 'night',   hue: 24, boost: .8 }
  ],
  catalog: { pageSize: 8, featured: ["fereastra-pvc-4-camere-alb-56x56-cm", "fereastra-pvc-4-camere-alb-116x116-cm", "usa-exterior-din-pvc-cu-geam-termopan-pentru-terasa-osciloculisanta-5-camere-stanga-alb-180-x-210-cm"], groups: { windows: ['ferestre', 'ferestre-duble'], doors: ['usi-interior-exterior-pvc', 'usi-osciloculisante'], accessories: ['oferte'] }, sorts: ['featured', 'price-asc', 'price-desc', 'size'], freeDeliveryFrom: 1500, installPct: 0.12, vat: 0.21 },
  /* ambient from pictures: sample size, thresholds on saturation/lightness, hue buckets */
  ambientImage: { size: 36, minSat: 0.22, minLight: 0.12, maxLight: 0.92, buckets: 12, minShare: 0.035, boostSat: 0.55, light: 0.55 },
  overlay: { maxDepth: 4, exitMs: 220, coveredScale: .965, coveredShift: -14 },
  toastMs: 3200
};
