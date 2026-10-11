/* All behavioural constants live here. Change a value, not the code. */
window.FE = window.FE || {};
FE.config = {
  brand: { name: 'FAR EST', legal: 'FAR EST WINDOWS SRL', since: 1991, factory: 2007, currency: 'lei', vatIncluded: true },
  content: { products: 'content/products.csv', shops: 'content/shops.yaml', offers: 'content/offers.json', faq: 'content/faq.yaml', welcome: 'content/welcome', pages: 'content/pages', site: 'content/site-images.yaml', configurator: 'content/configurator.json', contract: 'content/api-contract.json' },
  /* keyless Google Maps: embed iframe (loaded on demand) and universal links */
  maps: { embed: 'https://www.google.com/maps?output=embed&q=', search: 'https://www.google.com/maps/search/?api=1&query=', route: 'https://www.google.com/maps/dir/?api=1&destination=' },
  storageKey: 'farest.mock.v1',
  /* strict: a response that breaks content/api-contract.json becomes a 500 instead of reaching the page */
  api: { base: '/api', latency: [120, 380], strict: true },
  /* live shop prices: products.csv is re-read on focus, on reconnect and every pollMs (± jitter) while the page is visible */
  prices: { pollMs: 300000, jitter: 0.2 },
  /* pull to refresh (touch): px of indicator travel needed to reload; finger travel = px / resistance */
  pull: { threshold: 70, max: 100, resistance: 0.5 },
  defaults: { theme: 'auto', layout: 'auto', ambient: 'auto', surface: 'auto', bars: 'auto', lang: 'ro', segment: 'b2c' },
  langs: ['ro', 'en'],
  /* who the shop speaks to: b2c (households, prices with VAT) or b2b (companies: prices without VAT, volume quotes, a denser look).
     A link with ?b2b or ?b2c picks it; the header and Settings switch it */
  segments: ['b2c', 'b2b'],
  themes: ['auto', 'light', 'dark'],
  ambientModes: ['auto', 'on', 'off'],
  barModes: ['auto', 'always'],
  /* glass or flat panes; auto goes flat when the device lacks backdrop-filter, asks for less transparency, is low-end
     (deviceMemory or CPU cores at most lowEnd), or draws glass slowly. Two probes judge the drawing: probeMs of frames after boot,
     and the first scrollFrames frames of real scrolling (the heavy case: blurred panes moving). Slow is a median frame over
     slowFrameMs, or more than jankShare of frames over twice that. The verdict holds for retestDays, then glass gets a new trial. */
  surfaceModes: ['auto', 'glass', 'flat'],
  flat: { probeMs: 2000, scrollFrames: 90, slowFrameMs: 45, jankShare: 0.25, lowEnd: 2, retestDays: 14 },
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
  /* contextual ambient: two analogous colours per context (hues 15-40° apart, one temperature: cool pages stay cool, warm pages warm),
     so the wash never crosses the wheel through a muddy grey; the neutral middle (--amb-n, css/surfaces.css) is a grey tinted with the
     first colour, the same temperature again. Tuned for both schemes by opacity tokens */
  ambient: {
    home:    ['#2a6fb8', '#4f9fd4'],
    windows: ['#3d8bd0', '#5cb6d8'],
    doors:   ['#b8742a', '#d49a52'],
    acc:     ['#2f9a8a', '#4fb59a'],
    calc:    ['#6b5bd6', '#5a7fd8'],
    shops:   ['#d6202e', '#e2603c'],
    cart:    ['#2a6fb8', '#5a7fd8']
  },
  catalog: { pageSize: 8, featured: ["fereastra-pvc-4-camere-alb-56x56-cm", "fereastra-pvc-4-camere-alb-116x116-cm", "usa-exterior-din-pvc-cu-geam-termopan-pentru-terasa-osciloculisanta-5-camere-stanga-alb-180-x-210-cm"], groups: { windows: ['ferestre', 'ferestre-duble'], doors: ['usi-interior-exterior-pvc', 'usi-osciloculisante'], accessories: ['oferte'] }, sorts: ['featured', 'price-asc', 'price-desc', 'size'], freeDeliveryFrom: 1500, installPct: 0.12, vat: 0.21 },
  /* ambient from pictures: sample size, thresholds on saturation/lightness, hue buckets; a photo below minPull (mostly white or grey)
     leaves the context colours alone, a colourful one replaces them (hue never mixed across the wheel). The second colour is a second
     hue of the photo only when analogous (analog: degrees apart), else the first shifted by shift° */
  /* ms the scroll must settle before the ambient light follows the photo section in view */
  ambientFollowMs: 180,
  ambientImage: { size: 36, minSat: 0.22, minLight: 0.12, maxLight: 0.92, buckets: 12, minShare: 0.035, boostSat: 0.45, light: 0.55, maxPull: 0.75, minPull: 0.5, analog: [15, 60], shift: 25 },
  overlay: { maxDepth: 4, exitMs: 220, coveredScale: .965, coveredShift: -14 },
  toastMs: 3200
};
