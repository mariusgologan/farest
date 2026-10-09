/* Corporate skin: configuration and copy that differ from the default app. Loaded after data/content.js and before the core scripts.
   Figures marked as claims are the company's own statements on farest.ro (okf/company/profile.md), not verified. */
(() => {
  Object.assign(FE.config, { storageKey: 'farest.corp.v1', registerSw: false });
  Object.assign(FE.config.defaults, { theme: 'light', ambient: 'off' });

  const corp = {
    ro: {
      util: { hours: 'Luni–Vineri 09:00–18:00', showroom: 'Magazine și showroom', dealers: 'Devino dealer', service: 'Service', lang: 'Limbă' },
      offer: 'Cere ofertă',
      menu: { windows: 'Ferestre', doors: 'Uși', acc: 'Accesorii', calc: 'Configurator', company: 'Companie' },
      mega: {
        systems: 'Sisteme de profile', range: 'Gama', all: 'Toată gama', configure: 'Configurează la dimensiunea ta', about: 'Despre noi', warranty: 'Garanție și service', shops: 'Magazine',
        windowsRange: 'Ferestre PVC din stoc și la comandă', doorsRange: 'Uși de balcon, secundare și de exterior', doorsConfigure: 'Configurator uși, ornamente și T-uri', companyAbout: 'Fabrică, istorie, parteneri', companyWarranty: 'Garanție 5 ani, reparații, reglaje', companyShops: 'Adrese și program'
      },
      hero: { cta2: 'Te sunăm noi', note: 'Cifre declarate de companie pe farest.ro.' },
      figures: { since: 'Pe piață din', factory: 'Fabrică proprie din', glass: 'Unități de sticlă pe zi', dealers: 'Magazine Dedeman cu produse FAR EST', warranty: 'Ani garanție' },
      systems: { title: 'Sisteme de profile', lead: 'Profile germane certificate, alese după izolare și buget.', depth: 'Adâncime', chambers: 'Camere', seals: 'Garnituri', thermal: 'Izolare termică', sheet: 'Fișa sistemului', premium: 'Premium', shop: 'Magazin', note: 'Ug = sticlă, K = produs finit, în W/m²K, după datele publicate pe farest.ro.' },
      range: { title: 'Gama de produse', items: '{n} produs|{n} produse', see: 'Vezi gama' },
      config: { title: 'Configurator ferestre și uși', lead: 'Alegi forma, seria, culoarea și dimensiunile în mm. Prețul apare pe loc și produsele se adaugă într-un proiect cu nume.', open: 'Deschide configuratorul', list: ['Ferestre cu 1, 2 sau 3 canate', 'Uși de balcon, secundare și de exterior', 'Panouri din două tâmplării cuplate', 'Rezumat de proiect, gata de tipărit'] },
      why: {
        title: 'De ce FAR EST',
        items: [
          ['factory', 'Producție proprie', 'Fabrică lângă București din 2007.'],
          ['layers', 'Sticlă proprie', 'Linii LISEC, peste 1.000 de unități pe zi.'],
          ['shield', 'Profile certificate', 'Trocal, Kömmerling, Gealan, Salamander.'],
          ['tool', 'Feronerie Siegenia', 'Feronerie germană, reglabilă în service.'],
          ['truck', 'Montaj rapid', 'Montaj în 7 zile.'],
          ['sliders', 'Service propriu', 'Reglaje, înlocuiri de feronerie și garnituri.'],
          ['check', 'Garanție 5 ani', 'Pentru ferestre și uși PVC.'],
          ['sun', 'Culori la comandă', 'Infoliere proprie din 2010.']
        ]
      },
      certs: {
        title: 'Standarde și parteneri',
        items: [['ISO 9001', 'Sistem de management al calității, din 2004'], ['Profine', 'Parteneriat Trocal, KBE, Kömmerling din 1999'], ['Salamander', 'Garanție de 50 de ani pentru culoare'], ['Siegenia · LISEC · Elumatec', 'Feronerie, sticlă, debitare și prelucrare']]
      },
      process: {
        title: 'Cum lucrăm',
        steps: [['Măsurare', 'Consultantul măsoară la fața locului sau folosești ghidul de măsurare.'], ['Ofertă', 'Configurezi online sau primești oferta de la un consultant.'], ['Producție', 'Profile, sticlă și feronerie asamblate în fabrică.'], ['Montaj', 'Montaj de către echipele noastre sau ale dealerilor.'], ['Service', 'Reglaje și reparații, cu garanție de 5 ani.']]
      },
      refs: {
        title: 'Rețea și referințe', col: { name: 'Partener', what: 'Ce oferim', since: 'Din' },
        rows: [['Dedeman', 'Ferestre și uși FAR EST în rețeaua națională', '2025'], ['Auchan Drumul Taberei', 'Magazin propriu, București', '2014'], ['Export', 'Europa de Vest, SUA și Canada', '2026'], ['far-est.it', 'Site dedicat pentru Italia', '–']]
      },
      docs: { title: 'Documente', type: { page: 'Pagină', sheet: 'Fișă', pdf: 'PDF' }, warranty: 'Garanție și service', about: 'Despre FAR EST', summary: 'Rezumat de proiect (tipărire PDF)', systemSheet: 'Fișa sistemului {name}' },
      contact: { title: 'Contact și dealeri', lead: 'Call center, magazine proprii și service. Vino să vezi profilele și geamurile înainte să comanzi.', callcenter: 'Call center', service: 'Service', email: 'E-mail', shops: 'Magazine', address: 'Adresă', phone: 'Telefon', find: 'Toate magazinele' },
      foot: { products: 'Produse', company: 'Companie', contact: 'Contact', legal: 'Toate drepturile rezervate.' }
    },
    en: {
      util: { hours: 'Mon–Fri 09:00–18:00', showroom: 'Shops and showroom', dealers: 'Become a dealer', service: 'Service', lang: 'Language' },
      offer: 'Request an offer',
      menu: { windows: 'Windows', doors: 'Doors', acc: 'Accessories', calc: 'Configurator', company: 'Company' },
      mega: {
        systems: 'Profile systems', range: 'Range', all: 'Full range', configure: 'Configure to your size', about: 'About us', warranty: 'Warranty and service', shops: 'Shops',
        windowsRange: 'PVC windows from stock and made to order', doorsRange: 'Balcony, secondary and exterior doors', doorsConfigure: 'Door configurator, ornamental and T-bar models', companyAbout: 'Factory, history, partners', companyWarranty: '5-year warranty, repairs, adjustments', companyShops: 'Addresses and opening hours'
      },
      hero: { cta2: 'Call me back', note: 'Figures as stated by the company on farest.ro.' },
      figures: { since: 'In business since', factory: 'Own factory since', glass: 'Glass units per day', dealers: 'Dedeman stores stocking FAR EST', warranty: 'Years of warranty' },
      systems: { title: 'Profile systems', lead: 'Certified German profiles, chosen by insulation and budget.', depth: 'Depth', chambers: 'Chambers', seals: 'Seals', thermal: 'Thermal insulation', sheet: 'System sheet', premium: 'Premium', shop: 'Shop', note: 'Ug = glass, K = finished product, in W/m²K, as published on farest.ro.' },
      range: { title: 'Product range', items: '{n} product|{n} products', see: 'View range' },
      config: { title: 'Window and door configurator', lead: 'Choose the form, series, colour and sizes in mm. The price appears instantly and products go into a named project.', open: 'Open the configurator', list: ['Windows with 1, 2 or 3 sashes', 'Balcony, secondary and exterior doors', 'Panels made of two coupled units', 'Project summary, ready to print'] },
      why: {
        title: 'Why FAR EST',
        items: [
          ['factory', 'Own production', 'Factory near Bucharest since 2007.'],
          ['layers', 'Own glass', 'LISEC lines, over 1,000 units a day.'],
          ['shield', 'Certified profiles', 'Trocal, Kömmerling, Gealan, Salamander.'],
          ['tool', 'Siegenia hardware', 'German hardware, adjustable in service.'],
          ['truck', 'Fast installation', 'Installation within 7 days.'],
          ['sliders', 'Own service', 'Adjustments, hardware and seal replacement.'],
          ['check', '5-year warranty', 'On PVC windows and doors.'],
          ['sun', 'Colours to order', 'Own foiling plant since 2010.']
        ]
      },
      certs: {
        title: 'Standards and partners',
        items: [['ISO 9001', 'Quality management system, since 2004'], ['Profine', 'Trocal, KBE, Kömmerling partnership since 1999'], ['Salamander', '50-year colour guarantee'], ['Siegenia · LISEC · Elumatec', 'Hardware, glass, cutting and machining']]
      },
      process: {
        title: 'How we work',
        steps: [['Measuring', 'A consultant measures on site, or you use the measuring guide.'], ['Offer', 'Configure online or get an offer from a consultant.'], ['Production', 'Profiles, glass and hardware assembled in the factory.'], ['Installation', 'Installed by our crews or by dealers.'], ['Service', 'Adjustments and repairs, with a 5-year warranty.']]
      },
      refs: {
        title: 'Network and references', col: { name: 'Partner', what: 'What we offer', since: 'Since' },
        rows: [['Dedeman', 'FAR EST windows and doors in the national network', '2025'], ['Auchan Drumul Taberei', 'Own shop, Bucharest', '2014'], ['Export', 'Western Europe, USA and Canada', '2026'], ['far-est.it', 'Dedicated site for Italy', '–']]
      },
      docs: { title: 'Documents', type: { page: 'Page', sheet: 'Sheet', pdf: 'PDF' }, warranty: 'Warranty and service', about: 'About FAR EST', summary: 'Project summary (print to PDF)', systemSheet: '{name} system sheet' },
      contact: { title: 'Contact and dealers', lead: 'Call centre, own shops and service. Come and see the profiles and glass before you order.', callcenter: 'Call centre', service: 'Service', email: 'E-mail', shops: 'Shops', address: 'Address', phone: 'Phone', find: 'All shops' },
      foot: { products: 'Products', company: 'Company', contact: 'Contact', legal: 'All rights reserved.' }
    }
  };
  for (const l of Object.keys(corp)) FE.content[l].corp = corp[l];

  /* <base href="../"> would send #hash links to the parent page; keep them on this one */
  document.addEventListener('click', e => {
    const a = e.target.closest?.('a[href^="#"]');
    if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const h = a.getAttribute('href');
    if (h.length > 1) { e.preventDefault(); if (location.hash === h) dispatchEvent(new HashChangeEvent('hashchange')); else location.hash = h; }
  }, true);
})();
