// The two locales, and the two facts about each that the router needs.
//
// EN lives at `/`, AR at `/ar` — mirrored route for route (decision 2026-09-10
// §2). Both are static: there is no runtime negotiation and no redirect, so a
// crawler and a diner see exactly the same HTML.

export const locales = ['en', 'ar'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const direction = (locale: Locale): 'ltr' | 'rtl' => (locale === 'ar' ? 'rtl' : 'ltr');

/** The other language, for the switch link. Two locales, so this is total. */
export const otherLocale = (locale: Locale): Locale => (locale === 'ar' ? 'en' : 'ar');

/** `/faq` in EN is `/ar/faq` in AR. The root is `/` and `/ar`. */
export function pathFor(locale: Locale, path: string): string {
  const clean = path === '/' ? '' : path.startsWith('/') ? path : `/${path}`;
  if (locale === defaultLocale) return clean === '' ? '/' : clean;
  return `/${locale}${clean}`;
}

/** hreflang pairs for one path, x-default pointing at EN. */
export function alternatesFor(path: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const l of locales) out[l] = pathFor(l, path);
  out['x-default'] = pathFor(defaultLocale, path);
  return out;
}
