// Converts every JPG/PNG in mockup/images to WebP (longest side at most MAX px), removes the source and rewrites
// references in mockup/content. Run with `make images`; already converted files are left alone.
import sharp from 'sharp';
import { readdir, readFile, writeFile, unlink, stat } from 'node:fs/promises';

const DIR = 'mockup/images', MAX = 1200, QUALITY = 78;
const REFS = ['mockup/content/products.csv', 'mockup/content/site-images.yaml'];

let before = 0, after = 0;
const done = [];
for (const f of (await readdir(DIR)).filter(f => /\.(jpe?g|png)$/i.test(f))) {
  const src = `${DIR}/${f}`, out = src.replace(/\.\w+$/, '.webp');
  await sharp(src).rotate().resize({ width: MAX, height: MAX, fit: 'inside', withoutEnlargement: true }).webp({ quality: QUALITY }).toFile(out);
  before += (await stat(src)).size; after += (await stat(out)).size;
  await unlink(src);
  done.push(f);
}
for (const p of REFS) {
  const s = await readFile(p, 'utf8');
  const t = s.replace(/(images\/[\w-]+)\.(jpe?g|png)\b/gi, '$1.webp');
  if (t !== s) await writeFile(p, t);
}
console.log(done.length ? `images: ${done.length} converted, ${(before / 1024).toFixed(0)} KB -> ${(after / 1024).toFixed(0)} KB` : 'images: nothing to convert');
