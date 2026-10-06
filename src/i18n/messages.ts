// One message file per locale; nothing else spells copy (sahra/no-hardcoded-copy). en.json is the
// schema and tools/check-messages.ts fails when ar.json's keys differ. Static imports type the
// messages from en.json, so a missing key is a type error, not an empty string on the page.
import ar from '../../messages/ar.json';
import en from '../../messages/en.json';
import type { Locale } from './locales';

export type Messages = typeof en;

const byLocale: Record<Locale, Messages> = { en, ar: ar as Messages };

export function getMessages(locale: Locale): Messages {
  return byLocale[locale];
}

/** `{name}` substitution; the caller formats values (format.ts), so figures stay Latin. */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    key in values ? String(values[key]) : `{${key}}`,
  );
}
