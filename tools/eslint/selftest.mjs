// Runs eslint.config.mjs over the fixtures and fails unless every rule in EXPECTED fires on
// fixtures/violations.tsx and no sahra or Tailwind rule fires on fixtures/clean.tsx, so "the lint
// would catch that" is measured. Run: node tools/eslint/selftest.mjs
import { ESLint } from 'eslint';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const web = resolve(here, '..', '..');

const EXPECTED = [
  'sahra/no-hardcoded-copy',
  'sahra/no-physical-direction',
  'sahra/no-color-literal',
  'better-tailwindcss/no-unknown-classes',
  'better-tailwindcss/no-restricted-classes',
];

const eslint = new ESLint({
  cwd: web,
  overrideConfigFile: resolve(web, 'eslint.config.mjs'),
  // `pnpm lint` ignores the fixtures; this run is the one place that reads them.
  ignore: false,
});

const [violations, clean] = await eslint.lintFiles([
  resolve(here, 'fixtures', 'violations.tsx'),
  resolve(here, 'fixtures', 'clean.tsx'),
]);

let failed = false;

const fired = new Map();
for (const m of violations.messages) {
  if (m.ruleId) fired.set(m.ruleId, (fired.get(m.ruleId) ?? 0) + 1);
}
for (const rule of EXPECTED) {
  const n = fired.get(rule) ?? 0;
  if (n === 0) {
    console.error(`RED  ${rule} did not fire on fixtures/violations.tsx`);
    failed = true;
  } else {
    console.log(`ok   ${rule} fired ${n}x on the planted violations`);
  }
}
// Anything the fixture triggers that we did not plant is noise worth knowing about.
for (const [rule, n] of fired) {
  if (!EXPECTED.includes(rule) && !rule.startsWith('@typescript-eslint/') && !rule.startsWith('react/')) {
    console.log(`note ${rule} also fired ${n}x — not planted`);
  }
}

const cleanHits = clean.messages.filter(
  (m) => m.ruleId && (m.ruleId.startsWith('sahra/') || m.ruleId.startsWith('better-tailwindcss/')),
);
if (cleanHits.length > 0) {
  failed = true;
  for (const m of cleanHits)
    console.error(`RED  false positive on fixtures/clean.tsx:${m.line} ${m.ruleId}: ${m.message}`);
} else {
  console.log('ok   nothing fired on fixtures/clean.tsx');
}

if (failed) {
  console.error('lint self-test FAILED');
  process.exit(1);
}
console.log('lint self-test passed');
