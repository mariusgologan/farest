/* All user-facing copy. Add a language by adding a sibling object; missing keys fall back to ro. */
FE.content = {
  ro: {
    meta: { title: 'FAR EST · Ferestre și uși PVC' },
    a11y: { close: 'Închide', path: 'Traseu', pages: 'Pagini' },
    nav: { home: 'Acasă', windows: 'Ferestre', doors: 'Uși', acc: 'Accesorii', calc: 'Calculator', shops: 'Magazine' },
    action: { quickview: 'Vedere rapidă', add: 'Adaugă în coș', configure: 'Configurează', details: 'Detalii', update: 'Actualizează', edit: 'Modifică', close: 'Închide', back: 'Înapoi', next: 'Continuă' },
    toast: { added: 'Adăugat în coș', updated: 'Coș actualizat' },
    stock: { in: 'În stoc', low: 'Stoc limitat', order: 'La comandă' },
    color: { white: 'Alb', golden: 'Stejar auriu', walnut: 'Nuc', anthra: 'Antracit' },
    product: { vat: 'TVA inclus', askCall: 'Sună-mă să comand', spec: 'Specificații', size: 'Dimensiuni (cm)', producer: 'Producător profil', uf: 'Coeficient K', profileMore: 'Despre profil', related: 'Vezi și', gallery: 'Fotografii', photo: 'Fotografia {n}' },
    profile: {
      title: 'Profil', depth: 'Adâncime constructivă', chambers: '{n} camere', chambersLabel: 'Camere', sealsLabel: 'Garnituri', seals: '{n} garnituri', compare: 'Compară profilele',
      klass60: 'Profil de intrare pentru locuințe, raport bun preț / izolare.',
      weiss: 'Profil pentru uși de exterior din magazin, 60 mm, 3 camere.',
      trocal70: 'Profile germane Profine, folosite în majoritatea țărilor europene.',
      gealan: 'Sistem cu 6 camere și 74 mm adâncime.',
      kommerling: 'Trei garnituri de etanșare, cel mai bun sistem din clasa sa.',
      salamander: 'GreenEvolution: 6 camere, 76 mm, 3 garnituri, eficiență energetică ridicată.'
    },
    configure: { title: 'Alege varianta', color: 'Culoare', side: 'Sensul de deschidere', mesh: 'Cu plasă de insecte', note: 'Prețul afișat este cel al produsului din magazin; diferența pentru plasă se confirmă la comandă.', profile: 'Despre profil', measure: 'Cum măsor?', unit: 'Preț' },
    side: { left: 'Stânga', right: 'Dreapta' },
    group: { ferestre: 'Ferestre simple', 'ferestre-duble': 'Ferestre duble', 'usi-interior-exterior-pvc': 'Uși de exterior', 'usi-osciloculisante': 'Uși de terasă', oferte: 'Oferte' },
    measure: { title: 'Cum măsori fereastra', s1: { t: 'Măsoară golul', d: 'Lățime și înălțime a golului din zid, în trei puncte; folosește cea mai mică valoare.' }, s2: { t: 'Scade jocul', d: 'Reducem automat 2–3 cm pentru montaj și spumă.' }, s3: { t: 'Confirmă cu noi', d: 'Un consultant poate măsura la domiciliu.' }, note: 'Măsurătoarea la domiciliu este gratuită în București.' },
    trust: { delivery: 'Livrare din fabrica proprie, termen scurt', warranty: 'Garanție și service propriu' },
    cart: { title: 'Coșul tău', empty: 'Coșul este gol.', browse: 'Vezi ferestrele', total: 'Total', checkout: 'Finalizează comanda', qty: 'Cantitate', freeLeft: 'Încă {amount} până la livrare gratuită', freeDone: 'Ai livrare gratuită' },
    checkout: { title: 'Finalizare comandă', install: 'Montaj profesional', place: 'Trimite comanda' },
    order: { done: 'Comandă trimisă', ref: 'Referința comenzii: {ref}', next: 'Te sunăm pentru confirmare în cel mai scurt timp.' },
    form: { name: 'Nume', phone: 'Telefon', phoneHint: 'ex. 0728 853 025', address: 'Adresă de livrare', error: 'Verifică datele introduse și încearcă din nou.' },
    callback: { title: 'Te sunăm noi', lead: 'Lasă numărul de telefon și un consultant te sună înapoi.', send: 'Trimite', ok: 'Cerere trimisă ({ref})' },
    phone: { title: 'Call center', hours: 'Luni–Vineri 09:00–18:00', service: 'Service' },
    settings: {
      title: 'Aspect',
      theme: { label: 'Temă', auto: 'Auto', light: 'Luminos', dark: 'Întunecat' },
      layout: { label: 'Layout', auto: 'Auto', compact: 'Telefon', regular: 'Tabletă', wide: 'Desktop' },
      ambient: { label: 'Lumină ambientală', on: 'Pornită', off: 'Oprită' },
      bars: { label: 'Meniuri la derulare', auto: 'Se ascund', always: 'Mereu vizibile' },
      lang: { label: 'Limbă', ro: 'Română', en: 'English' }
    },
    home: {
      systems: 'Sisteme de profile', popular: 'Cele mai alese', all: 'Toate', shopsTitle: 'Vino în magazin', shopsCta: 'Toate magazinele',
      reassure: 'Fără obligații: estimarea este gratuită, iar comanda se confirmă telefonic.', offers: 'Oferte', how: 'Cum comanzi', faq: 'Întrebări frecvente',
      finalTitle: 'Gata să alegi ferestrele?', finalLead: 'Calculează un preț orientativ sau vorbește cu un consultant.'
    },
    how: { 1: { t: 'Alegi sau configurezi', d: 'Din stoc sau la dimensiunea ta, cu profil, culoare și deschidere.' }, 2: { t: 'Confirmăm telefonic', d: 'Un consultant verifică măsurile și termenul.' }, 3: { t: 'Producem și livrăm', d: 'Din fabrica proprie, cu montaj opțional.' } },
    map: { consent: 'Harta se încarcă de la Google doar dacă o ceri.', show: 'Arată harta', open: 'Deschide în Google Maps' },
    facts: {
      factory: { t: 'Fabrică din {year}', d: 'Roboți de ultimă generație, în zona Capitalei.' },
      shops: { t: '{n} magazine proprii', d: 'Vezi și alege soluția potrivită.' },
      warranty: { t: 'Garanție și service', d: 'Reparații pentru ferestre și uși PVC.' },
      delivery: { t: 'Livrare rapidă', d: 'Sticlă și feronerie produse și distribuite intern.' }
    },
    cat: {
      windows: { title: 'Ferestre PVC', lead: 'Ferestre PVC cu 4 camere, simple, duble și de pivniță, în stoc.' },
      doors: { title: 'Uși PVC', lead: 'Uși de exterior și uși de terasă oscilo-culisante.' },
      accessories: { title: 'Accesorii', lead: 'Accesorii pentru ferestre și uși.' }
    },
    filter: { title: 'Filtre', search: 'Căutare', searchPh: 'ex. 86x116', group: 'Tip', stock: 'Disponibilitate', max: 'Preț maxim', sort: 'Sortare', any: 'Oricare', reset: 'Resetează', show: 'Arată rezultatele' },
    sort: { featured: 'Recomandate', 'price-asc': 'Preț crescător', 'price-desc': 'Preț descrescător', size: 'Dimensiune' },
    catalog: { count: '{n} produse', none: 'Niciun produs pentru filtrele alese.' },
    calc: {
      title: 'Configurator ferestre și uși', lead: 'Alege tipul, dimensiunile și finisajele. Prețul se actualizează pe loc, TVA inclus.',
      s1: 'Tip și deschidere', s2: 'Dimensiuni', s3: 'Profil, culoare și sticlă', s4: 'Cantitate și montaj',
      type: { label: 'Tip', fix: 'Fix', tiltturn: 'Oscilo-batantă', double: 'Două canate', tilt: 'Basculantă', balcony: 'Ușă de balcon' },
      typeHint: { fix: 'Fără deschidere', tiltturn: 'Un canat, lateral și oblic', double: 'Două canate, lateral și oblic', tilt: 'Deschidere doar oblică', balcony: 'Un canat, cu prag' },
      side: { label: 'Sensul de deschidere', left: 'Stânga', right: 'Dreapta', hint: 'Privit din interior. La două canate alegi canatul principal, cu mâner.' },
      width: 'Lățime', height: 'Înălțime', range: 'Între {min} și {max} mm', errNum: '{f}: introdu o valoare.', errMin: '{f} este prea mică. Minimum {min} mm.', errMax: '{f} este prea mare. Maximum {max} mm.',
      glass: { label: 'Sticlă', clear: 'Termopan clar', lowe: 'Low-E, izolare termică', matt: 'Mată, intimitate', triple: 'Triplu vitraj' },
      qty: 'Cantitate', install: 'Include montajul',
      summary: 'Configurația ta', area: '{a} m² / bucată (minim facturat 0,6 m²)', unit: 'Preț / bucată', base: 'Produse', installCost: 'Montaj', total: 'Total',
      invalid: 'Completează dimensiunile pentru a vedea prețul.', pending: 'Se calculează…', failed: 'Prețul nu a putut fi calculat. Încearcă din nou.',
      add: 'Adaugă în coș', update: 'Actualizează în coș', quote: 'Cere ofertă', reset: 'Resetează', editing: 'Modifici o poziție din coș.',
      disclaimer: 'Estimare orientativă; oferta finală după măsurătoare.', line: '{w}×{h} mm · {profile}', previewLabel: 'Schița configurației: {type}, {w} × {h} mm'
    },
    shops: {
      title: 'Magazine FAR EST', lead: 'Vino să vezi profilele și culorile.', hours: 'Luni–Vineri 09:00–18:00', serviceTitle: 'Service și reparații', serviceLead: 'Reglaje, înlocuiri de feronerie și garnituri.', map: 'Hartă', route: 'Indicații Google Maps'
    },
    error: { 404: 'Pagina nu a fost găsită.', home: 'Acasă', load: 'Nu s-a putut încărca conținutul', loadHint: 'Rulează site-ul printr-un server static (de ex. GitHub Pages sau python3 -m http.server), nu din file://.' },
    foot: { about: 'Despre noi', warranty: 'Garanție și service', tag: 'Producător de tâmplărie PVC din {year}.', mock: 'Mockup de design. Catalogul și prețurile provin din captura site-ului din 2026-10-08; ofertele și calculatorul sunt ilustrative.' }
  },
  en: {
    meta: { title: 'FAR EST · PVC windows and doors' },
    a11y: { close: 'Close', path: 'Path', pages: 'Pages' },
    nav: { home: 'Home', windows: 'Windows', doors: 'Doors', acc: 'Accessories', calc: 'Calculator', shops: 'Shops' },
    action: { quickview: 'Quick view', add: 'Add to cart', configure: 'Configure', details: 'Details', update: 'Update', edit: 'Edit', close: 'Close', back: 'Back', next: 'Continue' },
    toast: { added: 'Added to cart', updated: 'Cart updated' },
    stock: { in: 'In stock', low: 'Low stock', order: 'Made to order' },
    color: { white: 'White', golden: 'Golden oak', walnut: 'Walnut', anthra: 'Anthracite' },
    product: { vat: 'VAT included', askCall: 'Call me to order', spec: 'Specifications', size: 'Size (cm)', producer: 'Profile maker', uf: 'K coefficient', profileMore: 'About the profile', related: 'You may also like', gallery: 'Photos', photo: 'Photo {n}' },
    profile: {
      title: 'Profile', depth: 'Build depth', chambers: '{n} chambers', chambersLabel: 'Chambers', sealsLabel: 'Seals', seals: '{n} seals', compare: 'Compare profiles',
      klass60: 'Entry profile for homes, good price to insulation ratio.',
      weiss: 'Profile of the shop entrance doors, 60 mm, 3 chambers.',
      trocal70: 'German Profine profiles, used across most of Europe.',
      gealan: 'Six-chamber system, 74 mm deep.',
      kommerling: 'Three sealing gaskets, the best system in its class.',
      salamander: 'GreenEvolution: 6 chambers, 76 mm, 3 gaskets, high energy efficiency.'
    },
    configure: { title: 'Choose the variant', color: 'Colour', side: 'Opening side', mesh: 'With insect screen', note: 'The price shown is the shop price of the product; any difference for the screen is confirmed at order.', profile: 'About the profile', measure: 'How do I measure?', unit: 'Price' },
    side: { left: 'Left', right: 'Right' },
    group: { ferestre: 'Single windows', 'ferestre-duble': 'Double windows', 'usi-interior-exterior-pvc': 'Entrance doors', 'usi-osciloculisante': 'Terrace doors', oferte: 'Offers' },
    measure: { title: 'How to measure your window', s1: { t: 'Measure the opening', d: 'Width and height of the wall opening at three points; use the smallest value.' }, s2: { t: 'Subtract clearance', d: 'We automatically reduce 2–3 cm for fitting and foam.' }, s3: { t: 'Confirm with us', d: 'A consultant can measure at your home.' }, note: 'Home measuring is free in Bucharest.' },
    trust: { delivery: 'Delivery from our own factory, short lead times', warranty: 'Warranty and in-house service' },
    cart: { title: 'Your cart', empty: 'Your cart is empty.', browse: 'Browse windows', total: 'Total', checkout: 'Check out', qty: 'Quantity', freeLeft: '{amount} more for free delivery', freeDone: 'You get free delivery' },
    checkout: { title: 'Checkout', install: 'Professional installation', place: 'Place order' },
    order: { done: 'Order sent', ref: 'Order reference: {ref}', next: 'We will call you to confirm shortly.' },
    form: { name: 'Name', phone: 'Phone', phoneHint: 'e.g. 0728 853 025', address: 'Delivery address', error: 'Please check the details and try again.' },
    callback: { title: 'Call me back', lead: 'Leave your phone number and a consultant will call you.', send: 'Send', ok: 'Request sent ({ref})' },
    phone: { title: 'Call centre', hours: 'Mon–Fri 09:00–18:00', service: 'Service' },
    settings: {
      title: 'Appearance',
      theme: { label: 'Theme', auto: 'Auto', light: 'Light', dark: 'Dark' },
      layout: { label: 'Layout', auto: 'Auto', compact: 'Phone', regular: 'Tablet', wide: 'Desktop' },
      ambient: { label: 'Ambient light', on: 'On', off: 'Off' },
      bars: { label: 'Menus while scrolling', auto: 'Auto-hide', always: 'Always visible' },
      lang: { label: 'Language', ro: 'Română', en: 'English' }
    },
    home: {
      systems: 'Profile systems', popular: 'Most chosen', all: 'All', shopsTitle: 'Visit a shop', shopsCta: 'All shops',
      reassure: 'No obligation: the estimate is free and orders are confirmed by phone.', offers: 'Offers', how: 'How to order', faq: 'Frequently asked questions',
      finalTitle: 'Ready to choose your windows?', finalLead: 'Calculate an indicative price or talk to a consultant.'
    },
    how: { 1: { t: 'Choose or configure', d: 'From stock or to your size, with profile, colour and opening.' }, 2: { t: 'We confirm by phone', d: 'A consultant checks the measurements and lead time.' }, 3: { t: 'We build and deliver', d: 'From our own factory, with optional installation.' } },
    map: { consent: 'The map loads from Google only when you ask for it.', show: 'Show map', open: 'Open in Google Maps' },
    facts: {
      factory: { t: 'Factory since {year}', d: 'Latest-generation robots, near the capital.' },
      shops: { t: '{n} own shops', d: 'See and choose the right solution.' },
      warranty: { t: 'Warranty and service', d: 'Repairs for PVC windows and doors.' },
      delivery: { t: 'Fast delivery', d: 'Glass and hardware produced and distributed in-house.' }
    },
    cat: {
      windows: { title: 'PVC windows', lead: '4-chamber PVC windows: single, double and cellar, in stock.' },
      doors: { title: 'PVC doors', lead: 'Entrance doors and sliding-tilt terrace doors.' },
      accessories: { title: 'Accessories', lead: 'Accessories for windows and doors.' }
    },
    filter: { title: 'Filters', search: 'Search', searchPh: 'e.g. 86x116', group: 'Type', stock: 'Availability', max: 'Max price', sort: 'Sort', any: 'Any', reset: 'Reset', show: 'Show results' },
    sort: { featured: 'Recommended', 'price-asc': 'Price, low to high', 'price-desc': 'Price, high to low', size: 'Size' },
    catalog: { count: '{n} products', none: 'No product matches these filters.' },
    calc: {
      title: 'Window and door configurator', lead: 'Pick the type, size and finish. The price updates as you go, VAT included.',
      s1: 'Type and opening', s2: 'Size', s3: 'Profile, colour and glass', s4: 'Quantity and installation',
      type: { label: 'Type', fix: 'Fixed', tiltturn: 'Tilt and turn', double: 'Two sashes', tilt: 'Tilt only', balcony: 'Balcony door' },
      typeHint: { fix: 'No opening', tiltturn: 'One sash, side and tilt', double: 'Two sashes, side and tilt', tilt: 'Tilt opening only', balcony: 'One leaf, with threshold' },
      side: { label: 'Opening side', left: 'Left', right: 'Right', hint: 'Seen from inside. With two sashes you pick the main sash, the one with the handle.' },
      width: 'Width', height: 'Height', range: 'Between {min} and {max} mm', errNum: '{f}: enter a value.', errMin: '{f} is too small. Minimum {min} mm.', errMax: '{f} is too large. Maximum {max} mm.',
      glass: { label: 'Glass', clear: 'Clear double glazing', lowe: 'Low-E, thermal insulation', matt: 'Matt, privacy', triple: 'Triple glazing' },
      qty: 'Quantity', install: 'Include installation',
      summary: 'Your configuration', area: '{a} m² each (0.6 m² minimum billed)', unit: 'Price each', base: 'Products', installCost: 'Installation', total: 'Total',
      invalid: 'Complete the size to see the price.', pending: 'Calculating…', failed: 'The price could not be calculated. Try again.',
      add: 'Add to cart', update: 'Update in cart', quote: 'Request a quote', reset: 'Reset', editing: 'You are editing a cart item.',
      disclaimer: 'Indicative estimate; final offer after measuring.', line: '{w}×{h} mm · {profile}', previewLabel: 'Sketch of the configuration: {type}, {w} × {h} mm'
    },
    shops: {
      title: 'FAR EST shops', lead: 'Come and see the profiles and colours.', hours: 'Mon–Fri 09:00–18:00', serviceTitle: 'Service and repairs', serviceLead: 'Adjustments, hardware and gasket replacement.', map: 'Map', route: 'Directions in Google Maps'
    },
    error: { 404: 'Page not found.', home: 'Home', load: 'Could not load the content', loadHint: 'Serve the site from a static server (e.g. GitHub Pages or python3 -m http.server), not from file://.' },
    foot: { about: 'About us', warranty: 'Warranty and service', tag: 'PVC joinery manufacturer since {year}.', mock: 'Design mockup. Catalogue and prices come from the 2026-10-08 site capture; offers and the calculator are illustrative.' }
  }
};
