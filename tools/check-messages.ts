// `pnpm messages:check`, the web twin of arb_test.dart: fails on a key in one locale only, an empty
// value, Arabic-Indic digits in ar.json, an Arabic value with no Arabic letter (brand names are
// written in Arabic too) or Arabic script in en.json. The last two exempt the keys listed below.
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const web = resolve(here, '..');

type Tree = { [key: string]: string | Tree };

function flatten(tree: Tree, prefix = ''): Map<string, string> {
  const out = new Map<string, string>();
  for (const [k, v] of Object.entries(tree)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'string') out.set(key, v);
    else for (const [ck, cv] of flatten(v, key)) out.set(ck, cv);
  }
  return out;
}

const read = (locale: string): Map<string, string> =>
  flatten(JSON.parse(readFileSync(join(web, 'messages', `${locale}.json`), 'utf8')) as Tree);

const en = read('en');
const ar = read('ar');

const ARABIC_INDIC = /[٠-٩۰-۹]/;
const ARABIC_LETTER = /[؀-ۿ]/;
// The switch names the other language in it; store names and a booking code read the same in both.
const KEYS_THAT_NAME_THE_OTHER_LANGUAGE = new Set([
  'nav.switchLocale',
  'close.appStoreName',
  'close.playName',
  'how.step3.screen.r2b', // a reservation code in a drawn screen
]);

const problems: string[] = [];

for (const key of en.keys()) if (!ar.has(key)) problems.push(`ar.json is missing "${key}"`);
for (const key of ar.keys()) if (!en.has(key)) problems.push(`ar.json has "${key}", which en.json does not`);

for (const [key, value] of en) {
  if (value.trim() === '') problems.push(`en.json "${key}" is empty`);
  if (ARABIC_LETTER.test(value) && !KEYS_THAT_NAME_THE_OTHER_LANGUAGE.has(key)) {
    problems.push(`en.json "${key}" contains Arabic script`);
  }
}
for (const [key, value] of ar) {
  if (value.trim() === '') problems.push(`ar.json "${key}" is empty`);
  if (ARABIC_INDIC.test(value))
    problems.push(`ar.json "${key}" uses Arabic-Indic digits — figures are Latin (DESIGN-RULES)`);
  if (!ARABIC_LETTER.test(value) && !KEYS_THAT_NAME_THE_OTHER_LANGUAGE.has(key)) {
    problems.push(`ar.json "${key}" has no Arabic in it — a string left in English is not a translation`);
  }
}

if (problems.length > 0) {
  for (const p of problems) console.error(`RED  ${p}`);
  process.exit(1);
}
console.log(`messages: ${en.size} keys, parity ok, figures Latin, both languages present.`);
