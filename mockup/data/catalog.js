/* Reference data that rarely changes. Products, shops, offers, FAQ and picture maps are files under content/. */
FE.db = {
  /* facts from okf/company/profile-systems.md; a null means the site does not state it */
  profiles: [
    { id: 'klass60',    name: 'Klass Profile',          mm: 60, chambers: 4,    seals: 2,    tier: 1, blurb: 'profile.klass60' },
    { id: 'weiss',      name: 'Weiss profil',           mm: 60, chambers: 3,    seals: null, tier: 1, blurb: 'profile.weiss' },
    { id: 'trocal70',   name: 'Trocal 70 AD',           mm: 70, chambers: 5,    seals: null, tier: 2, blurb: 'profile.trocal70', site: 'trocal' },
    { id: 'gealan',     name: 'Gealan S8000',           mm: 74, chambers: 6,    seals: null, tier: 3, blurb: 'profile.gealan', site: 'gealan' },
    { id: 'kommerling', name: 'Kömmerling 76 MD',       mm: 76, chambers: null, seals: 3,    tier: 3, blurb: 'profile.kommerling', site: 'kommerling' },
    { id: 'salamander', name: 'Salamander GreenEvolution 76 MD', mm: 76, chambers: 6, seals: 3, tier: 4, blurb: 'profile.salamander', site: 'salamander' }
  ],
  /* shop producer label -> profile id */
  producers: { 'Klass Profile': 'klass60', 'Weiss profil': 'weiss', 'TROCAL': 'trocal70' },
  /* colours: calculator only (the shop sells white and walnut as separate SKUs) */
  colors: [
    { id: 'white',  hex: '#f4f6f8', delta: 0 },
    { id: 'golden', hex: '#b9803c', delta: 0.12 },
    { id: 'walnut', hex: '#6b4426', delta: 0.12 },
    { id: 'anthra', hex: '#3a4048', delta: 0.15 }
  ],
  /* glass options: calculator only; delta is the price uplift over standard double glazing */
  glass: [
    { id: 'clear',  delta: 0 },
    { id: 'lowe',   delta: 0.08 },
    { id: 'matt',   delta: 0.10 },
    { id: 'triple', delta: 0.22 }
  ],
  categories: [
    { id: 'windows', ambient: 'windows' },
    { id: 'doors', ambient: 'doors' },
    { id: 'accessories', ambient: 'acc' }
  ],
  /* products: content/products.csv; shops: content/shops.yaml (loaded at boot into FE.data) */
  callCenter: ['0722 521 521', '0728 853 035', '0213 504 173'],
  service: '0728 859 775'
};
