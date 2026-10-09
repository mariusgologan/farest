/* All user-facing copy. Add a language by adding a sibling object; missing keys fall back to ro. */
FE.content = {
  ro: {
    meta: { title: 'FAR EST · Ferestre și uși PVC' },
    a11y: { close: 'Închide', path: 'Traseu', pages: 'Pagini' },
    nav: { home: 'Acasă', windows: 'Ferestre', doors: 'Uși', acc: 'Accesorii', calc: 'Configurator', shops: 'Magazine' },
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
    cfg: {
      title: 'Configurator ferestre și uși', lead: 'Alege forma, deschiderea și dimensiunile. Vezi prețul pe loc și adaugă produsul în proiect.', crumb: 'Ferestre și uși PVC / Configurator',
      project: { label: 'Proiect activ', none: 'Niciun proiect deschis', create: 'Creează un proiect pentru a începe.', draft: 'Nesalvat · adaugă primul produs', readOnly: 'Doar consultare', change: 'Schimbă proiectul', new: '+ Proiect nou', rename: 'Date proiect', mark: 'Marchează {s}', reopen: 'Redeschide ca ofertă',
        saved: 'Salvat în acest browser. Proiectul nu este o comandă transmisă.', unsaved: 'Nesalvat. Proiectul se salvează după adăugarea primului produs.', locked: 'Proiect {s}: blocat pentru modificări. Redeschide-l ca ofertă ca să-l modifici.',
        nameHint: 'Introdu numele proiectului și telefonul clientului. Proiectul se salvează după primul produs.', name: 'Nume proiect', phone: 'Telefon client', shop: 'Magazin', createBtn: 'Creează proiectul', saveData: 'Salvează datele' },
      status: { OFERTA: 'Ofertă', PLATITA: 'Plătit', FINALIZATA: 'Finalizat', confirmTitle: 'Confirmă schimbarea stării', confirm: 'Schimbi starea proiectului „{name}” din {from} în {to}?', lockNote: 'Produsele și datele nu mai pot fi modificate.', reopenNote: 'Produsele pot fi modificate din nou.', confirmBtn: 'Confirmă', changed: 'Starea proiectului: {s}' },
      perr: { name: 'Introdu un nume de proiect, de maximum 80 de caractere.', duplicate: 'Există deja un proiect cu acest nume. Alege alt nume.', phone: 'Introdu un număr de telefon valid, cu 7–15 cifre.', locked: 'Proiectul este blocat pentru modificări.', conflict: 'Proiectul a fost modificat în altă filă. Redeschide-l înainte să salvezi.', missing: 'Proiectul sau poziția nu mai există.', noproject: 'Creează mai întâi un proiect.', quota: 'Browserul nu mai are spațiu pentru salvare.', storage: 'Browserul nu a putut salva proiectul.', max: 'Un proiect poate avea cel mult 200 de poziții.', qty: 'Cantitatea cumulată depășește limita de 9.999 bucăți.', transition: 'Schimbarea de stare nu este permisă.', range: 'Data de început este după data de sfârșit.' },
      pickProduct: 'Alege produsul', pickForm: 'Alege forma ferestrei', pickOpening: 'Alege cum se deschide', pickModel: 'Alege modelul ușii', pickDoor: 'Alege tipologia ușii', pickVariant: 'Alege varianta ușii', pickVariantPui: 'Alege varianta ușii cu pui',
      openingHint: 'La modelele mobile alegi direct Stânga sau Dreapta, privit din interior.', doorHint: 'Alege Stânga sau Dreapta. Toate ușile se deschid spre interior.',
      oneLeaf: 'Un canat', oneLeafHint: 'Un singur canat de ușă', twoLeaves: 'Două canate – cu pui', twoLeavesHint: 'Canat principal + canat secundar', sideWhere: 'Pe ce parte vrei deschiderea?', variant: 'Alege varianta:',
      left: 'Stânga', right: 'Dreapta', fixed: 'Fără deschidere', kipp: 'Deschidere prin rabatare', threshold: 'Prag', inward: 'Spre interior', opening: 'Deschidere {side}', pui: 'Pui {n} mm', window: 'Fereastră', panelName: 'Panou · Tâmplării cuplate', coupling: 'Cuplaj {n} mm',
      width: 'Lățime', height: 'Înălțime', qty: 'Bucăți', pcs: 'buc.', range: 'Între {min} și {max}', limits: 'Dimensiuni disponibile: lățime {w1}–{w2} mm · înălțime {h1}–{h2} mm.', sizeWindow: 'Dimensiuni și cantitate', sizeDoor: 'Dimensiuni și cantitate',
      err: { empty: '{f}: introdu o valoare mai mare decât zero.', int: '{f}: introdu un număr întreg.', min: '{f} este prea mică: {v}. Minimum: {min} mm.', max: '{f} este prea mare: {v}. Maximum: {max} mm.', qty: 'Cantitatea trebuie să fie un număr întreg între 1 și {max}.' },
      finish: 'Serie, culoare și sticlă', finishDoor: 'Serie, culoare și material', series: 'Serie', colour: 'Culoare', glass: 'Sticlă', material: 'Material', profileSection: 'Secțiune profil {name}', texture: 'Vezi textura {name}', textureHint: 'Imaginea ilustrează aspectul; culoarea se confirmă pe mostră în magazin.', glassHint: 'Imaginea ilustrează aspectul geamului; mostra se vede în magazin.',
      configuredWindow: 'Fereastra configurată', configuredDoor: 'Ușa configurată', pickFirst: 'Alege un model pentru a vedea prețul.', completeSize: 'Completează dimensiunile pentru a vedea prețul.', calculating: 'Se calculează prețul…', calculatingHint: 'Calculăm configurația aleasă.', quoteFailed: 'Prețul nu a putut fi calculat. Încearcă din nou.',
      unit: 'Preț / buc.', total: 'Total', noPrice: 'Preț indisponibil', saveNoPrice: 'Poți salva configurația fără preț.', addToProject: 'Adaugă în proiect', saveChanges: 'Salvează modificările', cancel: 'Anulează', previewLabel: 'Schița produsului: {type}, {w} × {h} mm',
      saved: 'Produsul a fost salvat în proiect.', savedChanges: 'Modificările au fost salvate.', 'another?': 'Mai configurezi un produs sau vrei să vezi tot proiectul?', another: 'Mai configurez un produs', viewSummary: 'Vezi rezumatul proiectului', merged: 'Produsul exista deja la poziția {i}. Cantitate: {a} + {b} = {c} bucăți.',
      projectItems: 'Produsele din proiect', emptyProject: 'Produsele salvate vor apărea aici, cu imagine și detalii.', config1: 'configurație', configN: 'configurații', projectTotal: 'Total proiect', subtotal: 'Subtotal', unpriced: 'poziții fără preț', duplicate: 'Duplică', delete: 'Șterge', editing: 'Editezi produsul selectat.', dupReady: 'Copie pregătită. Modifică dimensiunile.',
      decor: 'Vezi ușa în decor', decorHint: '{n} interioare · previzualizare', decorNote: 'Simulare orientativă. Modificările se aplică imediat în configurator.', decorOpen: 'Deschide ușa', decorClose: 'Închide ușa', decorSel: { model: 'Model ușă', colour: 'Culoare', glass: 'Material', side: 'Deschidere' },
      manager: { title: 'Proiectele mele', name: 'Caută după nume', phone: 'Caută după telefon', status: 'Stare', sort: 'Sortare', from: 'Creat de la', to: 'Creat până la', allStates: 'Toate stările', newest: 'Cele mai noi', oldest: 'Cele mai vechi', statusAsc: 'Stare: ofertă → finalizat', statusDesc: 'Stare: finalizat → ofertă', reset: 'Resetează căutarea', open: 'Deschide', found: 'proiecte găsite', none: 'Niciun proiect găsit.' },
      pn: { lead: 'Două tâmplării cuplate: alege schema, seria și culoarea.', scheme: 'Schema panoului', arrangement: 'Poziția ușii', unit: 'Tâmplăria {n}', door: 'ușă', window: 'fereastră', model: 'Model', side: 'Deschidere', fill: 'Umplutură', choose: 'Alege…', range: 'Interval permis: {min}–{max} mm.', equal: 'Cotele trebuie să fie egale.', taller: 'Fereastra laterală nu poate fi mai înaltă decât ușa.',
        coupling: 'Cuplaj {n} mm.', ruleSide: 'Fereastra laterală se aliniază sus cu ușa și nu poate fi mai înaltă.', ruleTop: 'Supralumina are aceeași lățime cu ușa.', ruleHeights: 'Ferestrele alăturate au aceeași înălțime.', ruleWidths: 'Ferestrele suprapuse au aceeași lățime.', calc: 'Calculează prețul panoului', hint: 'Alege opțiunile și completează cotele.', overall: 'Gabarit total: {w} × {h} mm', fee: 'Include cuplajul.', preview: 'Schița panoului' },
      sum: { title: 'Rezumat', created: 'Data creării', date: 'Data rezumatului', phone: 'Telefon client', empty: 'Nu ai adăugat încă produse în proiect.', line: 'Total poziție', noPrice: 'Preț indisponibil pentru această configurație.', positions: 'poziții', grand: 'Total general', partial: 'Totalul general nu poate fi calculat: {n} poziții nu au preț.', note: 'Prețurile sunt cele calculate la configurare. Rezumatul nu este o comandă transmisă.', print: 'Printează / Salvează PDF', quote: 'Cere ofertă' }
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
    nav: { home: 'Home', windows: 'Windows', doors: 'Doors', acc: 'Accessories', calc: 'Configurator', shops: 'Shops' },
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
    cfg: {
      title: 'Window and door configurator', lead: 'Pick the shape, opening and size. See the price right away and add the product to the project.', crumb: 'PVC windows and doors / Configurator',
      project: { label: 'Active project', none: 'No project open', create: 'Create a project to begin.', draft: 'Unsaved · add the first product', readOnly: 'View only', change: 'Change project', new: '+ New project', rename: 'Project details', mark: 'Mark as {s}', reopen: 'Reopen as quote',
        saved: 'Saved in this browser. A project is not a submitted order.', unsaved: 'Not saved yet. The project is saved when you add the first product.', locked: 'Project {s}: locked. Reopen it as a quote to change it.',
        nameHint: 'Enter the project name and the customer phone. The project is saved with the first product.', name: 'Project name', phone: 'Customer phone', shop: 'Shop', createBtn: 'Create project', saveData: 'Save details' },
      status: { OFERTA: 'Quote', PLATITA: 'Paid', FINALIZATA: 'Completed', confirmTitle: 'Confirm the status change', confirm: 'Change the status of project “{name}” from {from} to {to}?', lockNote: 'Products and details can no longer be changed.', reopenNote: 'Products can be changed again.', confirmBtn: 'Confirm', changed: 'Project status: {s}' },
      perr: { name: 'Enter a project name of at most 80 characters.', duplicate: 'A project with this name already exists. Pick another name.', phone: 'Enter a valid phone number with 7–15 digits.', locked: 'The project is locked.', conflict: 'The project was changed in another tab. Reopen it before saving.', missing: 'The project or item no longer exists.', noproject: 'Create a project first.', quota: 'The browser has no space left to save.', storage: 'The browser could not save the project.', max: 'A project can hold at most 200 items.', qty: 'The combined quantity exceeds 9,999 pieces.', transition: 'That status change is not allowed.', range: 'The start date is after the end date.' },
      pickProduct: 'Choose the product', pickForm: 'Choose the window shape', pickOpening: 'Choose how it opens', pickModel: 'Choose the door model', pickDoor: 'Choose the door type', pickVariant: 'Choose the door variant', pickVariantPui: 'Choose the variant with side leaf',
      openingHint: 'Opening models let you pick Left or Right, seen from inside.', doorHint: 'Pick Left or Right. All doors open inward.',
      oneLeaf: 'One leaf', oneLeafHint: 'A single door leaf', twoLeaves: 'Two leaves, with side leaf', twoLeavesHint: 'Main leaf + secondary leaf', sideWhere: 'Which side should open?', variant: 'Pick the variant:',
      left: 'Left', right: 'Right', fixed: 'No opening', kipp: 'Tilt opening', threshold: 'Threshold', inward: 'Opens inward', opening: '{side} opening', pui: 'Side leaf {n} mm', window: 'Window', panelName: 'Panel · Coupled units', coupling: 'Coupling {n} mm',
      width: 'Width', height: 'Height', qty: 'Pieces', pcs: 'pcs', range: 'Between {min} and {max}', limits: 'Available sizes: width {w1}–{w2} mm · height {h1}–{h2} mm.', sizeWindow: 'Size and quantity', sizeDoor: 'Size and quantity',
      err: { empty: '{f}: enter a value above zero.', int: '{f}: enter a whole number.', min: '{f} is too small: {v}. Minimum: {min} mm.', max: '{f} is too large: {v}. Maximum: {max} mm.', qty: 'Quantity must be a whole number from 1 to {max}.' },
      finish: 'Series, colour and glass', finishDoor: 'Series, colour and material', series: 'Series', colour: 'Colour', glass: 'Glass', material: 'Material', profileSection: '{name} profile section', texture: 'See the {name} texture', textureHint: 'The picture illustrates the look; confirm the colour on a sample in store.', glassHint: 'The picture illustrates the glass; see a sample in store.',
      configuredWindow: 'Configured window', configuredDoor: 'Configured door', pickFirst: 'Pick a model to see the price.', completeSize: 'Complete the size to see the price.', calculating: 'Calculating the price…', calculatingHint: 'We are pricing your selection.', quoteFailed: 'The price could not be calculated. Try again.',
      unit: 'Price each', total: 'Total', noPrice: 'Price unavailable', saveNoPrice: 'You can still save this configuration without a price.', addToProject: 'Add to project', saveChanges: 'Save changes', cancel: 'Cancel', previewLabel: 'Product sketch: {type}, {w} × {h} mm',
      saved: 'The product was saved in the project.', savedChanges: 'Changes saved.', 'another?': 'Configure another product, or see the whole project?', another: 'Configure another', viewSummary: 'View project summary', merged: 'This product already exists at position {i}. Quantity: {a} + {b} = {c} pcs.',
      projectItems: 'Products in the project', emptyProject: 'Saved products will appear here, with picture and details.', config1: 'configuration', configN: 'configurations', projectTotal: 'Project total', subtotal: 'Subtotal', unpriced: 'items without price', duplicate: 'Duplicate', delete: 'Delete', editing: 'Editing the selected product.', dupReady: 'Copy ready. Change the size.',
      decor: 'See the door in a room', decorHint: '{n} interiors · preview', decorNote: 'Indicative simulation. Changes apply to the configurator immediately.', decorOpen: 'Open the door', decorClose: 'Close the door', decorSel: { model: 'Door model', colour: 'Colour', glass: 'Material', side: 'Opening' },
      manager: { title: 'My projects', name: 'Search by name', phone: 'Search by phone', status: 'Status', sort: 'Sort', from: 'Created from', to: 'Created until', allStates: 'All statuses', newest: 'Newest first', oldest: 'Oldest first', statusAsc: 'Status: quote → completed', statusDesc: 'Status: completed → quote', reset: 'Reset search', open: 'Open', found: 'projects found', none: 'No project found.' },
      pn: { lead: 'Two coupled units: pick the scheme, series and colour.', scheme: 'Panel scheme', arrangement: 'Door position', unit: 'Unit {n}', door: 'door', window: 'window', model: 'Model', side: 'Opening', fill: 'Infill', choose: 'Choose…', range: 'Allowed range: {min}–{max} mm.', equal: 'The sizes must be equal.', taller: 'The side window cannot be taller than the door.',
        coupling: 'Coupling {n} mm.', ruleSide: 'The side window is aligned to the top of the door and cannot be taller.', ruleTop: 'The transom has the same width as the door.', ruleHeights: 'Windows side by side share the same height.', ruleWidths: 'Stacked windows share the same width.', calc: 'Calculate the panel price', hint: 'Pick the options and complete the sizes.', overall: 'Overall size: {w} × {h} mm', fee: 'Includes the coupling.', preview: 'Panel sketch' },
      sum: { title: 'Summary', created: 'Created', date: 'Summary date', phone: 'Customer phone', empty: 'No products in the project yet.', line: 'Line total', noPrice: 'Price unavailable for this configuration.', positions: 'items', grand: 'Grand total', partial: 'The grand total cannot be calculated: {n} items have no price.', note: 'Prices are those calculated at configuration. This summary is not a submitted order.', print: 'Print / Save as PDF', quote: 'Request a quote' }
    },
    shops: {
      title: 'FAR EST shops', lead: 'Come and see the profiles and colours.', hours: 'Mon–Fri 09:00–18:00', serviceTitle: 'Service and repairs', serviceLead: 'Adjustments, hardware and gasket replacement.', map: 'Map', route: 'Directions in Google Maps'
    },
    error: { 404: 'Page not found.', home: 'Home', load: 'Could not load the content', loadHint: 'Serve the site from a static server (e.g. GitHub Pages or python3 -m http.server), not from file://.' },
    foot: { about: 'About us', warranty: 'Warranty and service', tag: 'PVC joinery manufacturer since {year}.', mock: 'Design mockup. Catalogue and prices come from the 2026-10-08 site capture; offers and the calculator are illustrative.' }
  }
};
