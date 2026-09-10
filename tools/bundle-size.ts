// First-load JavaScript, measured on the thing that ships.
//
//   pnpm build && node tools/bundle-size.ts [--route ar] [--max 180]
//
// Reads the route's exported HTML from out/, collects every script it loads
// on a MODERN browser — <script src> without `nomodule`, plus
// <link rel="modulepreload"> — gzips each file the way a host would, and
// prints the total. `nomodule` scripts (Next's legacy polyfills) are listed
// separately: a browser that understands modules never fetches them, and
// Next's own "First Load JS" figure excludes them for the same reason.
//
// `--max <kB>` exits 1 above the budget — decision 2026-09-10 §3 sets it at
// 180 kB gzip for the landing. This is the number the Phase 3 CI job asserts;
// it is also how "GSAP costs X" is measured rather than estimated.
//
// Lazily imported chunks (next/dynamic) are not first-load and are not counted;
// they are a separate request after hydration, which tests/hero.spec.ts checks.
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { gzipSync } from 'node:zlib';

const args = process.argv.slice(2);
const flag = (name: string, fallback: string) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};
const route = flag('--route', '/');
const max = Number(flag('--max', '0'));
const site = resolve('out');
const htmlPath = route === '/' ? join(site, 'index.html') : join(site, `${route.replace(/^\//, '')}.html`);
if (!existsSync(htmlPath)) {
  console.error(`${htmlPath} not found — run \`pnpm build\` first`);
  process.exit(1);
}
const html = readFileSync(htmlPath, 'utf8');

const modern = new Set<string>();
const legacy = new Set<string>();
for (const m of html.matchAll(/<script([^>]*)src="([^"]+\.js[^"]*)"([^>]*)>/g)) {
  const attrs = `${m[1]} ${m[3]}`;
  (/\bnomodule\b/i.test(attrs) ? legacy : modern).add(m[2]);
}
for (const m of html.matchAll(/<link[^>]+rel="modulepreload"[^>]+href="([^"]+\.js[^"]*)"/g)) modern.add(m[1]);

function gz(src: string): { raw: number; gz: number } {
  const file = join(site, src.split('?')[0]);
  if (!existsSync(file)) {
    console.error(`referenced but missing: ${src}`);
    process.exit(1);
  }
  const bytes = readFileSync(file);
  return { raw: bytes.length, gz: gzipSync(bytes, { level: 9 }).length };
}

const kb = (n: number) => (n / 1024).toFixed(1).padStart(7);
let total = 0;
let raw = 0;
const rows: [string, number, number][] = [];
for (const src of modern) {
  const s = gz(src);
  rows.push([src.replace('/_next/static/', ''), s.raw, s.gz]);
  raw += s.raw;
  total += s.gz;
}
rows.sort((a, b) => b[2] - a[2]);
console.log(`first-load JS for ${route} (${rows.length} modern scripts)`);
console.log(`${'raw kB'.padStart(8)} ${'gzip kB'.padStart(8)}  file`);
for (const [f, r, g] of rows) console.log(`${kb(r)} ${kb(g)}  ${f}`);
console.log(`${kb(raw)} ${kb(total)}  TOTAL`);
for (const src of legacy) {
  const s = gz(src);
  console.log(
    `${kb(s.raw)} ${kb(s.gz)}  ${src.replace('/_next/static/', '')}  (nomodule — legacy browsers only, not counted)`,
  );
}
if (max > 0 && total > max * 1024) {
  console.error(`RED  ${(total / 1024).toFixed(1)} kB gzip exceeds the ${max} kB budget`);
  process.exit(1);
}
