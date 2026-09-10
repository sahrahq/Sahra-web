// Parity and figures for messages/*.json — the web twin of the app's
// arb_test.dart. Fails when:
//   - a key exists in one locale and not the other (same shape, same nesting)
//   - a value is empty
//   - the Arabic file contains an Arabic-Indic digit (U+0660–U+0669, U+06F0–U+06F9)
//   - an Arabic value has no Arabic letter in it (a string left in English is
//     not a translation; brand names are still written in Arabic on this site)
//   - an English value contains Arabic script, except the one key that is
//     SUPPOSED to — the language switch label, which names the other language
//     in that language.
//
//   node tools/check-messages.ts
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
// …and proper names that are the same in both languages (a store's own name is not copy).
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
