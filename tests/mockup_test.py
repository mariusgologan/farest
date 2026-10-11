"""Playwright checks of the mockup: API contract, live prices, cart and checkout, service worker, both skins, axe.
Run with `make test` (the Playwright image serves a writable copy of mockup/ and runs this). Args: SITE PORT; env AXE = axe.min.js path."""
import csv, io, json, os, re, sys, time
from playwright.sync_api import sync_playwright

SITE = sys.argv[1]
BASE = f'http://127.0.0.1:{sys.argv[2]}/'
CSV = os.path.join(SITE, 'content/products.csv')
ORIG = open(CSV, encoding='utf-8').read()
results, mtime = [], [time.time() + 10]


def ok(name, cond, info=''):
    results.append((bool(cond), name, info))
    print(('PASS ' if cond else 'FAIL ') + name + (f'  [{info}]' if info and not cond else ''), flush=True)


def write_csv(src):
    with open(CSV, 'w', encoding='utf-8') as f:
        f.write(src)
    mtime[0] += 3  # strictly newer Last-Modified than anything served before (1 s resolution)
    os.utime(CSV, (mtime[0], mtime[0]))


def set_row(pid, **vals):
    rows = list(csv.DictReader(io.StringIO(open(CSV, encoding='utf-8').read())))
    for r in rows:
        if r['id'] == pid:
            r.update({k: str(v) for k, v in vals.items()})
    out = io.StringIO()
    w = csv.DictWriter(out, fieldnames=rows[0].keys(), lineterminator='\n')
    w.writeheader(); w.writerows(rows)
    write_csv(out.getvalue())


def watch(page, errs):
    page.on('console', lambda m: m.type == 'error' and errs.append('console: ' + m.text))
    page.on('pageerror', lambda e: errs.append('pageerror: ' + str(e)))
    page.on('requestfailed', lambda r: errs.append('failed: ' + r.url))


def boot(page, path='/', base=BASE):
    page.goto(base + '#' + path)
    page.wait_for_function("window.FE && FE.router.started && FE.db.products && !document.querySelector('#view').hasAttribute('aria-busy') && document.querySelector('#view').children.length")


def api(page, method, url, body=None):
    return page.evaluate('([m, u, b]) => FE.api.request(m, u, b)', [method, url, body])


PIDS = [r['id'] for r in csv.DictReader(io.StringIO(ORIG))]
PID = 'fereastra-pvc-4-camere-alb-56x56-cm'
PRICE0 = int(next(r for r in csv.DictReader(io.StringIO(ORIG)) if r['id'] == PID)['price'])

with sync_playwright() as pw:
    browser = pw.chromium.launch()

    # ---------------- API contract ----------------
    ctx = browser.new_context(service_workers='block')
    page = ctx.new_page(); errs = []; watch(page, errs); missing = []
    page.on('response', lambda r: r.status == 404 and missing.append(r.url))
    boot(page)
    api_src = open(os.path.join(SITE, 'js/core/api.js'), encoding='utf-8').read()
    contract = json.load(open(os.path.join(SITE, 'content/api-contract.json'), encoding='utf-8'))
    code_routes = set(re.findall(r"'((?:GET|POST) /[^']*)'\s*:", api_src))
    ok('every API route has a contract and every contract has a route', code_routes == set(contract['routes']), str(code_routes ^ set(contract['routes'])))

    valid = {
        ('GET', '/categories'): None, ('GET', '/products'): None, ('GET', '/products?cat=windows&sort=price-desc&page=2'): None,
        ('GET', '/products?q=alb&stock=in&max=500&group=ferestre'): None, ('GET', f'/products/{PID}'): None,
        ('GET', '/configurator'): None, ('GET', '/profiles'): None, ('GET', '/profiles/klass60'): None, ('GET', '/shops'): None,
        ('GET', '/offers'): None, ('GET', '/faq'): None, ('GET', '/welcome'): None, ('GET', '/pages/about'): None, ('GET', '/pages/warranty'): None,
        ('POST', '/price'): {'id': PID}, ('POST', '/requests'): {'phone': '0722 521 521'},
        ('POST', '/orders'): {'name': 'Ion', 'phone': '0722521521', 'items': [{'pid': PID, 'qty': 2}]},
    }
    for (m, u), b in valid.items():
        r = api(page, m, u, b)
        ok(f'{m} {u} fits the contract', r['ok'] and r['status'] in (200, 201), json.dumps(r)[:300])
    every_product = api(page, 'GET', '/products?page=1&sort=size')['meta']['pages']
    all_ok = all(api(page, 'GET', f'/products?sort=size&page={p}')['ok'] for p in range(1, every_product + 1))
    ok('every product row fits the product schema', all_ok)

    # a valid single quote and a valid panel quote
    q = page.evaluate("""async () => {
      const C = FE.cfg;
      for (const type of Object.keys(C.data.types)) {
        const s = C.blank(C.productOf(type)); s.type = type; C.reconcile(s);
        const lm = C.limits(type, s); s.width = Math.round((lm.wmin + lm.wmax) / 2); s.height = Math.round((lm.hmin + lm.hmax) / 2); s.quantity = 2;
        const r = await FE.api.post('/quote', s);
        if (r.ok && r.data.available) return r;
      }
      return null; }""")
    ok('POST /quote prices a valid configuration within the contract', q and q['data']['total'] == q['data']['unit'] * 2, json.dumps(q)[:300])
    pq = api(page, 'POST', '/quote', {'panel': {'scheme': 'door-side', 'arrangement': 'door-left', 'series': 'lumena-esential', 'colour': 'alb', 'components': [
        {'type': 'door-glass-third', 'side': 'dreapta', 'glass': 'delta4-lowe', 'threshold': 'frame', 'width': 900, 'height': 2000}, {'type': 'fix', 'glass': 'f4-lowe', 'width': 500, 'height': 1200}]}})
    ok('POST /quote prices a panel within the contract', pq['ok'] and len(pq['data'].get('parts', [])) == 2, json.dumps(pq)[:300])

    invalid = [
        ('GET', '/nope', None, 404, 'no_route'), ('GET', '/products?sort=bogus', None, 422, 'invalid_request'),
        ('GET', '/products?page=0', None, 422, 'invalid_request'), ('GET', '/products?extra=1', None, 422, 'invalid_request'),
        ('GET', '/products?max=abc', None, 422, 'invalid_request'), ('GET', '/products/BAD_ID', None, 422, 'invalid_request'),
        ('GET', '/products/nope', None, 404, 'not_found'), ('GET', '/profiles/nope', None, 404, 'not_found'), ('GET', '/pages/nope', None, 404, 'not_found'),
        ('POST', '/price', {}, 422, 'invalid_request'), ('POST', '/price', {'id': 'nope'}, 404, 'not_found'),
        ('POST', '/requests', {}, 422, 'invalid_phone'), ('POST', '/requests', {'phone': 722521521}, 422, 'invalid_phone'),
        ('POST', '/requests', {'phone': '12'}, 422, 'invalid_phone'), ('POST', '/requests', {'phone': '<script>'}, 422, 'invalid_phone'),
        ('POST', '/requests', None, 422, 'invalid_phone'),
        ('POST', '/orders', {'name': 'Ion', 'phone': '0722521521'}, 422, 'invalid_order'),
        ('POST', '/orders', {'name': 'Ion', 'phone': '0722521521', 'items': []}, 422, 'invalid_order'),
        ('POST', '/orders', {'name': '  ', 'phone': '0722521521', 'items': [{'pid': PID, 'qty': 1}]}, 422, 'invalid_order'),
        ('POST', '/orders', {'name': 'Ion', 'phone': '07', 'items': [{'pid': PID, 'qty': 1}]}, 422, 'invalid_order'),
        ('POST', '/orders', {'name': 'Ion', 'phone': '0722521521', 'items': [{'pid': PID, 'qty': 0}]}, 422, 'invalid_order'),
        ('POST', '/orders', {'name': 'Ion', 'phone': '0722521521', 'items': [{'pid': PID, 'qty': 1.5}]}, 422, 'invalid_order'),
        ('POST', '/orders', {'name': 'Ion', 'phone': '0722521521', 'items': [{'pid': PID, 'qty': '1'}]}, 422, 'invalid_order'),
        ('POST', '/orders', {'name': 'Ion', 'phone': '0722521521', 'items': [{'pid': 'nope', 'qty': 1}]}, 422, 'invalid_order'),
        ('POST', '/quote', {}, 422, 'invalid_config'), ('POST', '/quote', {'panel': {'series': 'x', 'colour': 'y', 'components': []}}, 422, 'invalid_config'),
        ('POST', '/quote', {'type': 'nope', 'series': 'x', 'colour': 'y', 'glass': 'z', 'width': 1, 'height': 1, 'quantity': 1}, 422, 'invalid_config'),
    ]
    for m, u, b, st, code in invalid:
        r = api(page, m, u, b)
        ok(f'{m} {u} {json.dumps(b)[:60]} -> {st} {code}', r['status'] == st and not r['ok'] and r['error'] == code and r['data'] is None, json.dumps(r)[:200])

    o = api(page, 'POST', '/orders', {'name': 'Ion', 'phone': '0722521521', 'install': 'on', 'items': [{'pid': PID, 'qty': 3, 'side': 'left', 'seen': 1}]})
    inst = round(PRICE0 * 3 * 0.12)
    ok('POST /orders reprices from the price list (the client price is ignored) and adds installation', o['ok'] and o['data']['total'] == PRICE0 * 3 + inst and o['data']['install'] == inst and o['data']['lines'][0]['unit'] == PRICE0, json.dumps(o)[:300])

    iso = page.evaluate(f"""async () => {{
      const a = await FE.api.get('/products/{PID}'); a.data.price = 1; a.data.images.length = 0;
      const b = await FE.api.get('/products/{PID}');
      const body = {{ id: '{PID}' }}; await FE.api.post('/price', body);
      return [b.data.price, b.data.images.length > 0, FE.db.products.find(p => p.id === '{PID}').price];
    }}""")
    ok('responses are copies: changing one does not change the API data', iso[0] == PRICE0 and iso[1] and iso[2] == PRICE0, str(iso))

    bad = page.evaluate(f"""async () => {{
      const p = FE.db.products.find(p => p.id === '{PID}'), keep = p.price; p.price = -5;
      const r = await FE.api.get('/products/{PID}'); p.price = keep; return r; }}""")
    ok('a response that breaks the contract becomes 500 contract_violation', bad['status'] == 500 and bad['error'] == 'contract_violation' and 'price' in bad.get('detail', ''), json.dumps(bad)[:200])
    ok('the only 404 files are the ones the missing page asked for', missing and all('/content/pages/nope.' in u for u in missing), str(missing))
    errs[:] = [e for e in errs if 'broke its contract' not in e and 'status of 404' not in e]  # both on purpose, above
    ok('no console errors or failed requests during the API checks', not errs, '; '.join(errs[:5]))
    ctx.close()

    # ---------------- live prices: product page, in place ----------------
    ctx = browser.new_context(service_workers='block', viewport={'width': 1280, 'height': 900})
    page = ctx.new_page(); errs = []; watch(page, errs)
    boot(page, f'/p/{PID}')
    page.evaluate("window.__same = 1; document.querySelector('#frame').scrollTo({ top: 300 })")
    scroll0 = page.evaluate("document.querySelector('#frame').scrollTop")
    shown = lambda: page.locator(f'#view .buybox [data-price-of="{PID}"]').inner_text()
    ok('product page price is tagged with its SKU', page.locator(f'#view .buybox [data-price-of="{PID}"]').count() == 1 and page.locator(f'#view .buybox [data-stock-of="{PID}"]').count() == 1)
    nochange = page.evaluate('FE.prices.check().then(c => c.length)')
    ok('a check with an unchanged file changes nothing', nochange == 0)
    set_row(PID, price=PRICE0 + 111, stock='low')
    changed = page.evaluate('FE.prices.check().then(c => c.map(p => p.id))')
    ok('a changed price is picked up', changed == [PID], str(changed))
    money = page.evaluate(f'FE.money({PRICE0 + 111})')
    ok('the price on the page changes without a reload', shown() == money and page.evaluate('window.__same') == 1, shown())
    ok('stock badge changes in place', page.locator(f'#view .buybox [data-stock-of="{PID}"]').get_attribute('data-tone') == 'warn')
    ok('scroll position is kept', abs(page.evaluate("document.querySelector('#frame').scrollTop") - scroll0) < 2)
    ok('a status toast announces the update', page.locator('#toasts .toast[role=status]').filter(has_text=page.evaluate("FE.t('prices.updated')")).count() == 1)
    ok('the API answers with the new price too', api(page, 'POST', '/price', {'id': PID})['data']['unit'] == PRICE0 + 111)

    # focus trigger (visibilitychange) and the timer
    set_row(PID, price=PRICE0 + 222)
    page.evaluate("document.dispatchEvent(new Event('visibilitychange', { bubbles: true }))")
    page.wait_for_function(f"document.querySelector('#view .buybox [data-price-of=\"{PID}\"]').textContent === FE.money({PRICE0 + 222})", timeout=5000)
    ok('returning to the tab checks the prices', True)
    ok('no console errors on the product page', not errs, '; '.join(errs[:5]))
    ctx.close()
    write_csv(ORIG)

    ctx = browser.new_context(service_workers='block')
    ctx.route('**/data/config.js', lambda route: route.fulfill(status=200, content_type='application/javascript',
              body=open(os.path.join(SITE, 'data/config.js'), encoding='utf-8').read().replace('pollMs: 300000', 'pollMs: 1500')))
    page = ctx.new_page(); errs = []; watch(page, errs)
    boot(page, '/c/windows')
    page.evaluate('window.__same = 1')
    set_row(PID, price=PRICE0 + 7)
    page.wait_for_function(f"[...document.querySelectorAll('[data-price-of=\"{PID}\"]')].some(e => e.textContent === FE.money({PRICE0 + 7}))", timeout=8000)
    ok('the poll timer updates catalogue cards without a reload', page.evaluate('window.__same') == 1)
    ok('every copy of the price on the page is updated', page.evaluate(f"[...document.querySelectorAll('[data-price-of=\"{PID}\"]')].every(e => e.textContent === FE.money({PRICE0 + 7}))"))
    ok('no console errors on the catalogue', not errs, '; '.join(errs[:5]))
    ctx.close()
    write_csv(ORIG)

    # ---------------- cart and checkout ----------------
    ctx = browser.new_context(service_workers='block')
    page = ctx.new_page(); errs = []; watch(page, errs)
    boot(page)
    page.evaluate(f"FE.cart.add({{ pid: '{PID}', qty: 2 }})")
    page.click('[data-action=open-cart]')
    page.wait_for_selector('.lines .line')
    total_el = page.locator('.layer .footer-bar .price.big').last
    ok('cart line keeps the price it was added at', page.evaluate('FE.store.get("cart")[0].seen') == PRICE0)
    ok('no repriced badge before a change', page.locator('.line [data-bind=repriced]').count() == 0)
    set_row(PID, price=PRICE0 + 50)
    page.evaluate('FE.prices.check()')
    page.wait_for_selector('.line [data-bind=repriced]')
    ok('open cart shows "price updated (was ...)" and the new total', page.evaluate(f'FE.money({PRICE0})') in page.locator('.line [data-bind=repriced]').inner_text()
       and total_el.inner_text() == page.evaluate(f'FE.money({(PRICE0 + 50) * 2})'), total_el.inner_text())
    page.click('[data-action=checkout]')
    page.wait_for_selector('[data-form=checkout]')
    ok('checkout warns that prices changed', page.locator('[data-bind=repriced]:not([hidden])').filter(has_text=page.evaluate("FE.t('checkout.repriced')")).count() == 1)
    set_row(PID, price=PRICE0 + 80)
    page.evaluate('FE.prices.check()')
    page.wait_for_function(f"document.querySelector('[data-form=checkout] [data-bind=tot]').textContent === FE.money({(PRICE0 + 80) * 2})")
    page.check('[data-form=checkout] input[name=install]')
    want = (PRICE0 + 80) * 2 + round((PRICE0 + 80) * 2 * 0.12)
    ok('open checkout total and installation follow the new price', page.locator('[data-form=checkout] [data-bind=tot]').inner_text() == page.evaluate(f'FE.money({want})'))
    page.fill('#name', 'Ion Popescu'); page.fill('#phone', '0722 521 521')
    order = page.evaluate("""() => new Promise(res => { const orig = FE.api.post; FE.api.post = async (u, b) => { const r = await orig(u, b); FE.api.post = orig; res(r); return r; };
      document.querySelector('[data-form=checkout] button[type=submit]').click(); })""")
    ok('the placed order is priced by the API at the current price', order['ok'] and order['data']['total'] == want, json.dumps(order)[:200])
    page.wait_for_selector('.big-check')
    ok('cart is emptied after the order', page.evaluate('FE.store.get("cart").length') == 0)
    ok('no console errors in cart and checkout', not errs, '; '.join(errs[:5]))
    ctx.close()
    write_csv(ORIG)

    # ---------------- service worker: network-first prices, offline fallback ----------------
    ctx = browser.new_context()
    page = ctx.new_page(); errs = []; watch(page, errs)
    boot(page)
    page.evaluate('navigator.serviceWorker.ready.then(() => true)')  # installed and activated (shell precached)
    if not page.evaluate('!!navigator.serviceWorker.controller'):
        page.reload(); boot(page)
    page.wait_for_function('navigator.serviceWorker.controller', timeout=15000)
    sw_version = re.search(r"VERSION = '([^']+)'", open(os.path.join(SITE, 'sw.js'), encoding='utf-8').read()).group(1)
    ok(f'service worker cache is {sw_version}', sw_version in page.evaluate("caches.keys().then(k => k.join(','))"))
    page.evaluate("fetch('content/products.csv'); fetch('content/configurator.json')")
    time.sleep(0.5)
    set_row(PID, price=PRICE0 + 333)
    cfg_path = os.path.join(SITE, 'content/configurator.json'); cfg_orig = open(cfg_path, encoding='utf-8').read()
    with open(cfg_path, 'w', encoding='utf-8') as f:
        f.write(cfg_orig.replace('"note":', '"probe": 1, "note":', 1))
    os.utime(cfg_path, (mtime[0], mtime[0]))
    got = page.evaluate(f"fetch('content/products.csv').then(r => r.text()).then(t => t.includes('{PID},') && t.split('\\n').find(l => l.startsWith('{PID},')).split(',')[7])")
    ok('through the service worker products.csv is fresh at once (network-first)', got == str(PRICE0 + 333), str(got))
    ok('through the service worker configurator.json is fresh at once', page.evaluate("fetch('content/configurator.json').then(r => r.json()).then(j => j.probe)") == 1)
    page.reload(); boot(page, f'/p/{PID}')
    ok('a reload shows the new price on first paint', page.locator(f'#view .buybox [data-price-of="{PID}"]').inner_text() == page.evaluate(f'FE.money({PRICE0 + 333})'))
    with open(cfg_path, 'w', encoding='utf-8') as f:
        f.write(cfg_orig)
    ctx.set_offline(True)
    ok('offline: a check keeps the last known prices without errors', page.evaluate('FE.prices.check().then(c => c.length)') == 0)
    page.reload(); boot(page, f'/p/{PID}')
    ok('offline reload still works with the cached price list', page.locator(f'#view .buybox [data-price-of="{PID}"]').inner_text() == page.evaluate(f'FE.money({PRICE0 + 333})'))
    ctx.set_offline(False)
    errs[:] = [e for e in errs if 'ERR_INTERNET_DISCONNECTED' not in e and 'Failed to fetch' not in e and 'failed: ' not in e]
    ok('no console errors with the service worker', not errs, '; '.join(errs[:5]))
    ctx.close()
    write_csv(ORIG)

    # ---------------- regression sweep, both skins ----------------
    for skin, base in (('default', BASE), ('corporate', BASE + 'corporate/')):
        ctx = browser.new_context(service_workers='block')
        page = ctx.new_page(); errs = []; watch(page, errs)
        for path in ['/', '/c/windows', '/c/doors', '/c/accessories', f'/p/{PID}', '/calculator', '/shops', '/page/about', '/page/warranty', '/p/nope']:
            boot(page, path, base)
        page.evaluate("location.hash = '#/c/windows'"); page.wait_for_selector('#view .card')
        page.select_option('select[name=sort]', 'price-desc'); page.wait_for_timeout(700)
        ok(f'{skin}: catalogue sort by price works', page.locator('#view .card').count() > 0)
        page.click('#view .card [data-action=quickview]'); page.wait_for_selector('.layer [data-price-of]')
        ok(f'{skin}: quick view price is tagged', page.locator('.layer [data-price-of]').count() >= 1)
        ok(f'{skin}: FE.prices is running', page.evaluate('typeof FE.prices.check') == 'function')
        missing = page.evaluate("""() => Promise.all([...new Set([...FE.db.products.flatMap(p => p.images.map(i => i.src)), ...JSON.stringify(FE.data.site).match(/images\\/[\\w.-]+/g)])]
          .map(src => fetch(src).then(r => r.ok && /^image\\//.test(r.headers.get('content-type')) ? null : src))).then(l => l.filter(Boolean))""")
        ok(f'{skin}: every product and site image exists', not missing, str(missing[:5]))
        ok(f'{skin}: no console errors or failed requests across all routes', not errs, '; '.join(errs[:5]))
        ctx.close()

    # ---------------- pull to refresh (touch) ----------------
    ctx = browser.new_context(service_workers='block', viewport={'width': 412, 'height': 823}, is_mobile=True, has_touch=True)
    page = ctx.new_page(); errs = []; watch(page, errs)
    cdp = ctx.new_cdp_session(page)
    def pull(dy, x=200, y=250, steps=8, end=True):
        cdp.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': [{'x': x, 'y': y}]})
        for i in range(1, steps + 1):
            cdp.send('Input.dispatchTouchEvent', {'type': 'touchMove', 'touchPoints': [{'x': x, 'y': y + dy * i / steps}]})
        ready = page.evaluate("document.querySelector('.pull').hasAttribute('data-ready')")
        if end:
            cdp.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []})
        return ready
    boot(page, '/c/windows')
    page.evaluate('window.__same = 1')
    ok('touch: the pull indicator exists and is hidden from assistive tech', page.locator('.pull[aria-hidden=true]').count() == 1)
    ok('touch: a short pull is not ready', not pull(60))
    page.wait_for_timeout(400)
    ok('touch: a short pull does not reload and the indicator resets', page.evaluate("window.__same === 1 && !document.querySelector('.pull').hasAttribute('data-active')"))
    pull(-250, y=600); page.wait_for_timeout(300)
    ok('touch: an upward swipe does not reload', page.evaluate('window.__same') == 1)
    page.evaluate("document.querySelector('#frame').scrollTo({ top: 400, behavior: 'instant' })"); page.wait_for_timeout(200)
    pull(220); page.wait_for_timeout(400)
    ok('touch: pulling while scrolled down does not reload', page.evaluate('window.__same') == 1)
    page.evaluate("document.querySelector('#frame').scrollTo({ top: 0, behavior: 'instant' })"); page.wait_for_timeout(200)
    page.click('#view .card [data-action=quickview]'); page.wait_for_selector('.layer')
    pull(220, y=120); page.wait_for_timeout(400)
    ok('touch: pulling with an overlay open does not reload', page.evaluate('window.__same') == 1)
    page.evaluate('FE.overlay.closeAll()'); page.wait_for_timeout(500)
    with page.expect_navigation():
        ready = pull(220)
    ok('touch: a long pull at the top is ready and reloads the page', ready)
    boot(page, '/c/windows')
    ok('touch: after the reload the same route is shown', page.evaluate('window.__same === undefined && location.hash') == '#/c/windows')
    ok('touch: no console errors', not errs, '; '.join(errs[:5]))
    ctx.close()
    ctx = browser.new_context(service_workers='block'); page = ctx.new_page(); boot(page)
    ok('desktop (no touch): no pull indicator', page.locator('.pull').count() == 0)
    ctx.close()

    # ---------------- ambient light follows the content ----------------
    ctx = browser.new_context(service_workers='block', viewport={'width': 412, 'height': 823}, is_mobile=True, has_touch=True)
    page = ctx.new_page(); errs = []; watch(page, errs)
    boot(page, '/')
    hues = page.evaluate("""() => { const hue = x => { const [r, g, b] = [1, 3, 5].map(i => parseInt(x.slice(i, i + 2), 16) / 255), mx = Math.max(r, g, b), d = mx - Math.min(r, g, b);
        return d ? (mx === r ? ((g - b) / d + 6) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4) * 60 : 0; };
      const apart = (x, y) => { const d = Math.abs(hue(x) - hue(y)) % 360; return Math.round(Math.min(d, 360 - d)); };
      return Object.entries(FE.config.ambient).map(([k, [a, b]]) => [k, apart(a, b)]); }""")
    ok('ambient: every context pairs analogous colours (one temperature, no muddy blend)', all(d <= 45 for _, d in hues), hues)
    ok('ambient: auto is the default mode', page.evaluate('FE.store.get("ambient")') == 'auto')
    pic = lambda: page.evaluate('FE.store.get("picture") && FE.store.get("picture").a')
    pal = lambda sel: page.evaluate(f"FE.ambient.palette(document.querySelector('{sel}').dataset.pic).then(p => p && p.a)")
    page.wait_for_function('FE.store.get("picture")', timeout=8000)
    hero = pic()
    ok('ambient: on arrival the light takes the hero photo', hero == page.evaluate("FE.ambient.palette(FE.data.site.hero).then(p => p.a)"), hero)
    page.evaluate("document.querySelector('.prose-band').scrollIntoView({ block: 'center', behavior: 'instant' })")
    band = pal('.prose-band')
    page.wait_for_function(f'FE.store.get("picture") && FE.store.get("picture").a === "{band}"', timeout=5000)
    ok('ambient: scrolling to a photo band tints the light with it (no hover needed)', pic() == band and band != hero, f'{pic()} {band} {hero}')
    page.evaluate("document.querySelector('#frame').scrollTo({ top: 0, behavior: 'instant' })")
    page.wait_for_function(f'FE.store.get("picture") && FE.store.get("picture").a === "{hero}"', timeout=5000)
    ok('ambient: back at the top the page picture returns', pic() == hero)
    page.evaluate("document.querySelector('.prose-band').scrollIntoView({ block: 'center', behavior: 'instant' })")
    page.wait_for_function(f'FE.store.get("picture").a === "{band}"', timeout=5000)
    page.evaluate("void FE.flows.map(FE.db.shops[0].id)"); page.wait_for_selector('.layer')
    ok('ambient: the map takes the shops colour while it is open', page.evaluate('FE.store.get("context")') == 'shops')
    page.evaluate('FE.overlay.closeAll()'); page.wait_for_timeout(500)
    ok('ambient: closing it restores the context and the section picture', page.evaluate('FE.store.get("context")') != 'shops' and pic() == band, f'{pic()} {band}')
    page.evaluate(f"FE.cart.add({{ pid: '{PID}', qty: 1 }})")
    page.click('[data-action=open-cart]'); page.wait_for_selector('.lines .line')
    line = page.evaluate(f"FE.ambient.palette(FE.imageFor(FE.db.products.find(p => p.id === '{PID}'), {{}}).src).then(p => p.a)")
    ok('ambient: the cart tints the light with what is being bought', pic() == line, f'{pic()} {line}')
    page.evaluate('FE.overlay.closeAll()'); page.wait_for_timeout(500)
    back = page.evaluate("FE.ambient.palette(FE.ambient.rest()).then(p => p.a)")
    ok('ambient: closing the cart gives the light back to the section in view', pic() == back, f'{pic()} {back} {line}')
    glowing = page.evaluate("[...document.querySelectorAll('[data-glow]')].map(e => e.className)")
    ok('ambient: the section in view glows, and only it', len(glowing) == 1 and page.evaluate("document.querySelector('[data-glow]').dataset.pic === FE.ambient.rest()"), glowing)
    glow_c = page.evaluate("getComputedStyle(document.querySelector('[data-glow]')).getPropertyValue('--glow-c').trim()")
    ok('ambient: the glow takes the colour of its own photo', glow_c == page.evaluate("FE.ambient.palette(document.querySelector('[data-glow]').dataset.pic).then(p => p.a)"), glow_c)
    page.emulate_media(color_scheme='dark'); page.evaluate("FE.store.set({ theme: 'dark' })"); page.wait_for_timeout(300)
    lit = page.evaluate("""[...document.querySelectorAll('*')].map(e => getComputedStyle(e).boxShadow).join(' ').match(/(rgba?|color)\\([^)]*\\)/g).filter(c => { const v = c.match(/[\\d.]+/g).map(Number), a = c.includes('/') || c.startsWith('rgba') ? v[v.length - 1] : 1; const [r, g, b] = c.startsWith('color') ? v.slice(0, 3).map(x => x * 255) : v; return a > .05 && Math.max(r, g, b) > 120 && !(c.includes('255') || (r > 240 && g > 240 && b > 240)); })""")
    ok('ambient: dark theme: no shadow is lit (coloured or bright), except the white inner highlights', not lit, lit[:3])
    page.evaluate("FE.store.set({ theme: 'light' })"); page.emulate_media(color_scheme='light')
    page.evaluate("FE.store.set({ theme: 'dark' })")
    ok('theme switch: panes switch quickly (no 5 s ambient glide)', page.evaluate("getComputedStyle(document.querySelector('.prose-band')).transitionDuration").split(',')[0].strip() in ('0.22s',), page.evaluate("getComputedStyle(document.querySelector('.prose-band')).transitionDuration"))
    page.evaluate("FE.store.set({ theme: 'light' })"); page.wait_for_timeout(500)
    page.mouse.move(1, 1)  # hover tints in "on" mode too; keep the pointer off the cards
    page.evaluate("FE.store.set({ ambient: 'on' })"); page.wait_for_function(f'FE.store.get("picture").a === "{hero}"', timeout=5000)
    page.evaluate("document.querySelector('.prose-band').scrollIntoView({ block: 'center', behavior: 'instant' })"); page.wait_for_timeout(700)
    ok('ambient: in "on" mode scrolling does not change the light', pic() == hero, f'{pic()} {hero}')
    ok('ambient: no section glow outside auto mode', page.locator('[data-glow]').count() == 0)
    page.evaluate("FE.store.set({ ambient: 'auto' })"); page.wait_for_function(f'FE.store.get("picture").a === "{band}"', timeout=5000)
    ok('ambient: switching back to auto picks up the section in view', pic() == band)
    page.evaluate("FE.store.set({ ambient: 'off' })"); page.evaluate("document.querySelector('#frame').scrollTo({ top: 0, behavior: 'instant' })"); page.wait_for_timeout(500)
    ok('ambient: no console errors', not errs, '; '.join(errs[:5]))
    ctx.close()

    # ---------------- ambient: old saved "on" moves to auto once ----------------
    ctx = browser.new_context(service_workers='block')
    page = ctx.new_page(); errs = []; watch(page, errs)
    page.add_init_script("if (!localStorage.getItem('farest.mock.v1')) localStorage.setItem('farest.mock.v1', JSON.stringify({ ambient: 'on' }))")
    boot(page, '/')
    ok('ambient: a saved "on" from before auto existed becomes auto', page.evaluate('FE.store.get("ambient")') == 'auto')
    page.evaluate("FE.store.set({ ambient: 'on' })"); page.reload(); page.wait_for_function('window.FE && FE.router && FE.router.started')
    ok('ambient: a later explicit "on" is kept', page.evaluate('FE.store.get("ambient")') == 'on')
    ctx.close()

    # ---------------- prose links and preloads ----------------
    ctx = browser.new_context(service_workers='block', viewport={'width': 412, 'height': 846}, has_touch=True, is_mobile=True)
    page = ctx.new_page(); errs = []; watch(page, errs)
    ok('preloads: added for the boot data on non-Apple browsers', page.goto(BASE) and page.locator('link[rel=preload][as=fetch]').count() == 7)
    for r in ('/page/about', '/page/warranty'):
        boot(page, r); page.wait_for_function('!document.querySelector("#view").hasAttribute("aria-busy")')
        small = page.evaluate("[...document.querySelectorAll('#view a')].filter(e => { const b = e.getBoundingClientRect(); return b.width && b.height < 24; }).map(e => e.textContent)")
        ok(f'{r}: links are at least 24px tall', not small, small)
    ok('prose links: no console errors', not errs, '; '.join(errs[:5]))
    ctx.close()

    # ---------------- flat style: switch and automation ----------------
    ctx = browser.new_context(service_workers='block')
    page = ctx.new_page(); errs = []; watch(page, errs)
    boot(page, '/')
    blur = lambda: page.evaluate("getComputedStyle(document.querySelector('.card.acrylic')).backdropFilter")
    ok('flat: glass by default where backdrop-filter works', not page.evaluate("document.documentElement.hasAttribute('data-flat')") and blur() != 'none', blur())
    page.click('#top [data-action=settings]'); page.click('[data-action=set-surface][data-value=flat]')
    ok('flat: the settings switch turns the panes flat', page.evaluate("document.documentElement.hasAttribute('data-flat')") and blur() == 'none', blur())
    page.evaluate('FE.overlay.closeAll()')
    page.add_init_script("document.addEventListener('readystatechange', () => { if (document.readyState === 'interactive') window.__early = document.documentElement.hasAttribute('data-flat'); })")
    page.reload(); page.wait_for_function('window.FE && FE.router && FE.router.started')
    ok('flat: a saved choice applies before the app scripts run (inline script)', page.evaluate('window.__early') is True)
    page.evaluate("FE.store.set({ surface: 'auto', slowUntil: 0 })")
    ok('flat: auto is glass again on a capable device', not page.evaluate("document.documentElement.hasAttribute('data-flat')"))
    ok('flat: no console errors', not errs, '; '.join(errs[:5]))
    ctx.close()
    ctx = browser.new_context(service_workers='block')
    ctx.add_init_script("Object.defineProperty(Navigator.prototype, 'webdriver', { get: () => false })")
    page = ctx.new_page(); boot(page, '/')
    page.evaluate("FE.config.flat.slowFrameMs = 0; FE.config.flat.probeMs = 3000; FE.store.set({ slowUntil: 0 }); FE.surface.probe()")
    page.wait_for_function("document.documentElement.hasAttribute('data-flat')", timeout=15000)
    until = page.evaluate("FE.store.get('slowUntil') - Date.now()")
    ok('flat: the boot probe turns a slow device flat for retestDays', 13 * 864e5 < until <= 14 * 864e5, until)
    page.evaluate("FE.store.set({ slowUntil: Date.now() - 1 })")
    ok('flat: after retestDays glass gets a new trial', not page.evaluate("document.documentElement.hasAttribute('data-flat')"))
    page.evaluate("FE.config.flat.scrollFrames = 20; FE.surface.probeScroll()")
    page.mouse.move(640, 400)
    for _ in range(40):
        page.mouse.wheel(0, 120); page.wait_for_timeout(30)
        if page.evaluate("document.documentElement.hasAttribute('data-flat')"): break
    ok('flat: the scroll probe judges real scrolling frames', page.evaluate("document.documentElement.hasAttribute('data-flat') && FE.store.get('slowUntil') > Date.now()"))
    page.evaluate("FE.store.set({ surface: 'glass' })")
    ok('flat: an explicit "glass" overrides the slow verdict', not page.evaluate("document.documentElement.hasAttribute('data-flat')"))
    ctx.close()
    ctx = browser.new_context(service_workers='block')
    ctx.add_init_script("Object.defineProperty(Navigator.prototype, 'hardwareConcurrency', { get: () => 2 })")
    page = ctx.new_page(); boot(page, '/')
    ok('flat: auto is flat on a low-end device (2 cores)', page.evaluate("document.documentElement.hasAttribute('data-flat')"))
    ctx.close()

    # ---------------- accessibility of the new states ----------------
    ctx = browser.new_context(service_workers='block')
    page = ctx.new_page(); errs = []; watch(page, errs)
    boot(page)
    page.evaluate(f"FE.store.set({{ cart: [{{ pid: '{PID}', qty: 1, seen: 1 }}] }})")
    page.click('[data-action=open-cart]'); page.wait_for_selector('.line [data-bind=repriced]')
    page.click('[data-action=checkout]'); page.wait_for_selector('[data-form=checkout] [data-bind=repriced]:not([hidden])')
    page.add_script_tag(path=os.environ.get('AXE', '/capture/tools/axe.min.js'))
    for theme in ('light', 'dark'):
        page.evaluate(f"FE.store.set({{ theme: '{theme}' }})"); page.wait_for_timeout(400)
        v = page.evaluate("axe.run(document.querySelector('#overlays'), { runOnly: ['wcag2a', 'wcag2aa'] }).then(r => r.violations.map(v => v.id + ':' + v.nodes.length))")
        ok(f'axe: cart + checkout with a repriced line, {theme}', not v, str(v))
    ctx.close()
    browser.close()

write_csv(ORIG)
failed = [r for r in results if not r[0]]
print(f'\n{len(results) - len(failed)}/{len(results)} passed')
sys.exit(1 if failed else 0)
