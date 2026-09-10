// Generates the web's brand plumbing from the design package. ONE source,
// several outputs, one check:
//
//   node tools/generate-tokens.ts          # write
//   node tools/generate-tokens.ts --check  # verify current (CI)
//
// Outputs (all generated — never edit by hand):
//   src/styles/tokens.css   :root design variables (--sahra-*), the .theme-night
//                           overrides, the Tailwind default-theme resets, and
//                           an @theme inline block mapping every token to a
//                           utility namespace. `bg-purple-500` does not exist
//                           after this file; `bg-terracotta` does.
//   src/styles/tokens.ts    the same values, typed, for code that needs a value
//                           rather than a class (GSAP colour tweens, OG images).
//   src/fonts/poppins/*     Poppins TTFs + licence, copied from
//                           docs/design/assets/fonts (self-hosted via next/font/local).
//   public/brand/*.png      the two logo variants.
//   src/app/icon.png        the favicon — the terracotta mark.
//   src/components/brand/icon-paths.ts
//                           every glyph of docs/design/components/core/Icon.jsx.
//
// Same contract as packages/sahra_design_system/tool/generate_tokens.dart:
// tokens.json is the single source, the check regenerates in memory and fails
// on any difference, so a value cannot drift.
//
// CLASSIFICATION. Colours are classified by SHAPE (a hex value, or an alias of
// one). Everything else is classified by its NAMESPACE PREFIX — `space-`,
// `radius-`, `text-`, `font-`, `shadow-`, `leading-`, `tracking-` — because a
// pixel value alone cannot say whether it is a font size or a padding, and
// Tailwind needs to know. A token with a prefix this file does not know is a
// HARD ERROR, not a silent skip: the next person adds the namespace on purpose.
//
// One deliberate renaming, mechanical and documented here: colour tokens whose
// name starts with `text-` (text-body, text-soft, text-faint) lose that prefix
// in the Tailwind namespace, so the utility is `text-body`, not `text-text-body`.
// Nothing else is renamed.
//
// Font families: the design package names families by string ('Poppins').
// next/font exposes each loaded family as a CSS variable instead, so the four
// families are substituted here — the ONLY place that mapping exists. See
// src/fonts.ts for the variables.
import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const web = resolve(here, '..');
const repo = resolve(web, '..', '..');
const design = join(repo, 'docs', 'design');

const tokensJson = join(design, 'tokens.json');
if (!existsSync(tokensJson)) {
  console.error(`tokens.json not found at ${tokensJson}`);
  process.exit(1);
}

type Tokens = { root: Record<string, string>; themeNight: Record<string, string> };
type Kind = 'color' | 'font' | 'font-size' | 'spacing' | 'radius' | 'shadow' | 'leading' | 'tracking';

const FONT_VARIABLES: Record<string, string> = {
  Poppins: 'var(--font-poppins)',
  Newsreader: 'var(--font-newsreader)',
  'Reem Kufi': 'var(--font-reem-kufi)',
  'IBM Plex Sans Arabic': 'var(--font-plex-arabic)',
};

const VAR_REF = /^var\(--([a-z0-9-]+)\)$/;

function classify(name: string, value: string, root: Record<string, string>): Kind {
  if (/^#[0-9a-fA-F]{3,8}$/.test(value)) return 'color';
  const ref = VAR_REF.exec(value);
  if (ref) {
    const target = ref[1];
    if (!(target in root)) throw new Error(`${name} aliases --${target}, which is not a token`);
    return classify(target, root[target], root);
  }
  if (name.startsWith('font-')) return 'font';
  if (name.startsWith('text-') && /px$/.test(value)) return 'font-size';
  if (name.startsWith('space-') && /px$/.test(value)) return 'spacing';
  if (name.startsWith('radius-') && /px$/.test(value)) return 'radius';
  if (name.startsWith('shadow-')) return 'shadow';
  if (name.startsWith('leading-') && /^[\d.]+$/.test(value)) return 'leading';
  if (name.startsWith('tracking-') && /em$/.test(value)) return 'tracking';
  throw new Error(
    `cannot classify token "${name}" = ${JSON.stringify(value)} — add its namespace on purpose`,
  );
}

function themeName(name: string, kind: Kind): string {
  switch (kind) {
    case 'color':
      return `--color-${name.startsWith('text-') ? name.slice('text-'.length) : name}`;
    case 'font':
      return `--${name}`; // font-latin → --font-latin
    case 'font-size':
      return `--${name}`; // text-h1 → --text-h1
    case 'spacing':
      return `--spacing-${name.slice('space-'.length)}`;
    case 'radius':
    case 'shadow':
    case 'leading':
    case 'tracking':
      return `--${name}`;
  }
}

function designValue(value: string): string {
  // Aliases point at the prefixed variable, never at Tailwind's namespace.
  const ref = VAR_REF.exec(value);
  if (ref) return `var(--sahra-${ref[1]})`;
  let out = value;
  for (const [family, variable] of Object.entries(FONT_VARIABLES)) {
    out = out.replace(`'${family}'`, variable);
  }
  return out;
}

function generateCss(tokens: Tokens): string {
  const lines: string[] = [];
  lines.push('/* GENERATED by apps/web/tools/generate-tokens.ts from docs/design/tokens.json.');
  lines.push('   Do not edit. Regenerate: pnpm --filter web tokens. CI: tokens:check. */');
  lines.push('');
  lines.push(':root {');
  for (const [name, value] of Object.entries(tokens.root)) {
    lines.push(`  --sahra-${name}: ${designValue(value)};`);
  }
  lines.push('}');
  lines.push('');
  lines.push('/* Night is a SECTION rhythm on this site, not a toggle (decision 2026-09-10 §5). */');
  lines.push('.theme-night {');
  for (const [name, value] of Object.entries(tokens.themeNight)) {
    if (!(name in tokens.root)) throw new Error(`themeNight overrides "${name}", which root does not define`);
    lines.push(`  --sahra-${name}: ${designValue(value)};`);
  }
  lines.push('}');
  lines.push('');
  lines.push('/* Tailwind defaults OFF. What is not a token is not a class. Breakpoints,');
  lines.push('   containers, easings and font weights are kept: none of them is a brand value. */');
  lines.push('@theme {');
  lines.push('  --color-*: initial;');
  lines.push('  --spacing: initial;');
  lines.push('  --spacing-*: initial;');
  lines.push('  --font-sans: initial;');
  lines.push('  --font-serif: initial;');
  lines.push('  --font-mono: initial;');
  lines.push('  --text-*: initial;');
  lines.push('  --radius-*: initial;');
  lines.push('  --shadow-*: initial;');
  lines.push('  --inset-shadow-*: initial;');
  lines.push('  --drop-shadow-*: initial;');
  lines.push('  --text-shadow-*: initial;');
  lines.push('  --leading-*: initial;');
  lines.push('  --tracking-*: initial;');
  lines.push('  --blur-*: initial;');
  lines.push('  --animate-*: initial;');
  lines.push('}');
  lines.push('');
  lines.push('/* inline: utilities keep the var() reference, so a .theme-night section');
  lines.push('   re-themes bg-surface-page and text-body with no extra classes. */');
  lines.push('@theme inline {');
  // Zero is the ABSENCE of spacing, not a spacing value — the same reasoning
  // sahra_lints applies to Colors.transparent. Without it `top-0`, `p-0` and
  // `inset-0` stop existing, and the reset above removed Tailwind's bare `0`.
  lines.push('  --spacing-0: 0px;');
  const seen = new Map<string, string>();
  for (const [name, value] of Object.entries(tokens.root)) {
    const kind = classify(name, value, tokens.root);
    const theme = themeName(name, kind);
    const clash = seen.get(theme);
    if (clash) throw new Error(`"${name}" and "${clash}" both map to ${theme}`);
    seen.set(theme, name);
    lines.push(`  ${theme}: var(--sahra-${name});`);
  }
  lines.push('}');
  lines.push('');
  return lines.join('\n');
}

function generateTs(tokens: Tokens): string {
  const lines: string[] = [];
  lines.push('// GENERATED by apps/web/tools/generate-tokens.ts from docs/design/tokens.json.');
  lines.push('// Do not edit. Regenerate: pnpm --filter web tokens. CI: tokens:check.');
  lines.push('//');
  lines.push('// For code that needs a VALUE rather than a class: a GSAP colour tween, an OG');
  lines.push('// image. Components use Tailwind utilities; nothing outside this file spells');
  lines.push('// a colour.');
  lines.push('');
  lines.push('export const tokens = {');
  lines.push('  root: {');
  for (const [name, value] of Object.entries(tokens.root)) {
    lines.push(`    ${JSON.stringify(name)}: ${JSON.stringify(designValue(value))},`);
  }
  lines.push('  },');
  lines.push('  night: {');
  for (const [name, value] of Object.entries(tokens.themeNight)) {
    lines.push(`    ${JSON.stringify(name)}: ${JSON.stringify(designValue(value))},`);
  }
  lines.push('  },');
  lines.push('} as const;');
  lines.push('');
  lines.push('export type TokenName = keyof typeof tokens.root;');
  lines.push('');
  lines.push('/** The CSS variable a token is served from, for inline styles and canvases. */');
  lines.push('export const cssVar = (name: TokenName): string => `var(--sahra-${name})`;');
  lines.push('');
  return lines.join('\n');
}

// ──────────────────────────────────────────────────────────────── icons ──

// The icon drawings have ONE owner: docs/design/components/core/Icon.jsx. The
// site does not retype them; it extracts every non-empty entry of that file's
// `P` object into src/components/brand/icon-paths.ts and drift-checks it with
// the tokens. Until 2026-09-10 the paths were typed by hand and "kept in step
// by eye" — the audit that day found the set had already diverged (one glyph
// drawn only on the web). The Flutter set (sahra_icon.dart) is still a hand
// port with no such check.
function generateIconPaths(): string {
  const src = readFileSync(join(design, 'components', 'core', 'Icon.jsx'), 'utf8');
  const start = src.indexOf('const P={');
  const end = src.indexOf('};', start);
  if (start < 0 || end < 0) throw new Error('Icon.jsx: cannot find the P object');
  const body = src.slice(start, end);
  const entries: [string, string][] = [];
  const re = /^\s*"?([a-z0-9-]+)"?:"((?:[^"\\]|\\.)*)",?\s*(?:\/\/.*)?$/gm;
  for (const m of body.matchAll(re)) {
    if (m[2] === '') continue; // Icon.jsx keeps one empty placeholder entry
    if (!/^(<(path|circle|rect)\s[^>]*\/>)+$/.test(m[2]))
      throw new Error(`Icon.jsx: "${m[1]}" is not path/circle/rect markup`);
    entries.push([m[1], m[2]]);
  }
  if (entries.length < 30)
    throw new Error(`Icon.jsx: only ${entries.length} glyphs parsed — the file shape changed`);
  const lines: string[] = [];
  lines.push('// GENERATED by apps/web/tools/generate-tokens.ts from docs/design/components/core/Icon.jsx.');
  lines.push('// Do not edit. Regenerate: pnpm --filter web tokens. CI: tokens:check.');
  lines.push('//');
  lines.push('// Every drawing in the SAHRA icon set, as the markup strings the design package');
  lines.push('// stores them in. icon.tsx parses these into real SVG children at module load.');
  lines.push('');
  lines.push('export const ICON_PATHS = {');
  for (const [name, markup] of entries) lines.push(`  ${JSON.stringify(name)}: ${JSON.stringify(markup)},`);
  lines.push('} as const;');
  lines.push('');
  return lines.join('\n');
}

// ─────────────────────────────────────────────────────────────── assets ──

type Copy = { from: string; to: string };

function assetCopies(): Copy[] {
  const fontsDir = join(design, 'assets', 'fonts');
  const copies: Copy[] = [];
  for (const file of readdirSync(fontsDir).sort()) {
    if (/^Poppins-.*\.ttf$/.test(file) || file === 'OFL.txt') {
      copies.push({ from: join(fontsDir, file), to: join(web, 'src', 'fonts', 'poppins', file) });
    }
  }
  copies.push({ from: join(design, 'assets', 'logo.png'), to: join(web, 'public', 'brand', 'logo.png') });
  copies.push({
    from: join(design, 'assets', 'logo-terracotta.png'),
    to: join(web, 'public', 'brand', 'logo-terracotta.png'),
  });
  copies.push({
    from: join(design, 'assets', 'logo-terracotta.png'),
    to: join(web, 'src', 'app', 'icon.png'),
  });
  return copies;
}

const normalise = (s: string) => s.replace(/\r\n/g, '\n').trimEnd();

function sha(path: string): string {
  if (!existsSync(path)) return 'missing';
  // .gitattributes normalises text to LF in the index while a Windows working
  // copy may hold CRLF; a licence file must not fail the check for that.
  const bytes = path.endsWith('.txt')
    ? Buffer.from(normalise(readFileSync(path, 'utf8')))
    : readFileSync(path);
  return createHash('sha256').update(bytes).digest('hex');
}

// ──────────────────────────────────────────────────────────────── main ──

const tokens = JSON.parse(readFileSync(tokensJson, 'utf8')) as Tokens;
const outputs: Record<string, string> = {
  [join(web, 'src', 'styles', 'tokens.css')]: generateCss(tokens),
  [join(web, 'src', 'styles', 'tokens.ts')]: generateTs(tokens),
  [join(web, 'src', 'components', 'brand', 'icon-paths.ts')]: generateIconPaths(),
};
const copies = assetCopies();
const check = process.argv.includes('--check');

if (check) {
  const stale: string[] = [];
  for (const [path, content] of Object.entries(outputs)) {
    const current = existsSync(path) ? readFileSync(path, 'utf8') : '';
    if (normalise(current) !== normalise(content)) stale.push(path);
  }
  for (const { from, to } of copies) {
    if (sha(from) !== sha(to)) stale.push(to);
  }
  if (stale.length > 0) {
    console.error('STALE — the design package changed without regenerating:');
    for (const s of stale) console.error(`  ${s}`);
    console.error('Run: pnpm --filter web tokens');
    process.exit(1);
  }
  console.log(`tokens are current (${Object.keys(outputs).length} files, ${copies.length} assets).`);
} else {
  for (const [path, content] of Object.entries(outputs)) {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, content);
    console.log(`wrote ${path}`);
  }
  for (const { from, to } of copies) {
    mkdirSync(dirname(to), { recursive: true });
    copyFileSync(from, to);
  }
  console.log(`copied ${copies.length} assets.`);
}
