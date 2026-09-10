// ONE message file per locale, and nothing else may spell user-facing copy
// (sahra/no-hardcoded-copy). The English file is the schema: the Arabic one
// must have exactly the same keys, and tools/check-messages.ts fails the build
// otherwise — the ARB parity test's twin.
//
// Static imports on purpose: both files ship in the build, the types come from
// en.json, and a missing key is a TypeScript error rather than an empty string
// on a live page.
import ar from '../../messages/ar.json';
import en from '../../messages/en.json';
import type { Locale } from './locales';

export type Messages = typeof en;

const byLocale: Record<Locale, Messages> = { en, ar: ar as Messages };

export function getMessages(locale: Locale): Messages {
  return byLocale[locale];
}

/**
 * `{name}` substitution for the few strings that carry a value. Values are
 * formatted by the caller (see format.ts) so a figure is Latin in both locales.
 */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    key in values ? String(values[key]) : `{${key}}`,
  );
}
