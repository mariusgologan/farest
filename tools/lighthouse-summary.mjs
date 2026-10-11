// Markdown summary of a folder of Lighthouse JSON reports: scores and metrics per page, then the opportunities.
import { readdirSync, readFileSync } from 'node:fs';

const [dir, base = ''] = process.argv.slice(2);
const reports = readdirSync(dir).filter(f => f.endsWith('.report.json')).sort()
  .map(f => ({ name: f.replace('.report.json', ''), r: JSON.parse(readFileSync(`${dir}/${f}`, 'utf8')) }));
const score = c => c?.score == null ? '–' : Math.round(c.score * 100);
const mark = n => n === '–' ? n : `${n >= 90 ? '🟢' : n >= 50 ? '🟠' : '🔴'} ${n}`;
const metric = (a, k) => (a[k]?.displayValue || '–').replace(/\s/g, ' ');

const out = [`## Lighthouse ${reports[0]?.r.lighthouseVersion || ''}${base ? ` · ${base}` : ''}`, '',
  '| Page | Perf | A11y | Best pr. | SEO | FCP | LCP | TBT | CLS |', '| --- | --- | --- | --- | --- | --- | --- | --- | --- |'];
const opps = new Map();
for (const { name, r } of reports) {
  const c = r.categories, a = r.audits;
  out.push(`| ${name} | ${mark(score(c.performance))} | ${mark(score(c.accessibility))} | ${mark(score(c['best-practices']))} | ${mark(score(c.seo))} | ${metric(a, 'first-contentful-paint')} | ${metric(a, 'largest-contentful-paint')} | ${metric(a, 'total-blocking-time')} | ${metric(a, 'cumulative-layout-shift')} |`);
  for (const ref of c.performance.auditRefs) {
    const x = a[ref.id];
    if (x?.score != null && x.score < 0.9 && x.details?.type === 'opportunity') {
      const o = opps.get(x.title) || { pages: [], ms: 0 };
      o.pages.push(name); o.ms = Math.max(o.ms, x.details.overallSavingsMs || 0); opps.set(x.title, o);
    }
  }
}
if (opps.size) {
  out.push('', '### Opportunities', '', '| Opportunity | Max est. saving | Pages |', '| --- | --- | --- |');
  for (const [t, o] of [...opps].sort((x, y) => y[1].ms - x[1].ms)) out.push(`| ${t} | ${Math.round(o.ms)} ms | ${o.pages.join(', ')} |`);
}
out.push('', 'SEO is low by design: the mockup sets `noindex`. Cache lifetime is fixed by GitHub Pages.');
console.log(out.join('\n'));
