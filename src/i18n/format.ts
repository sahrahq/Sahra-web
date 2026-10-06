// Figures are Latin in both locales (DESIGN-RULES). `Intl.NumberFormat('ar')` gives Arabic-Indic
// digits; `-u-nu-latn` pins Latin digits and keeps the Arabic separators and words.
import type { Locale } from './locales';

const numberLocale: Record<Locale, string> = {
  en: 'en-EG',
  ar: 'ar-EG-u-nu-latn',
};

export function formatNumber(locale: Locale, value: number, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat(numberLocale[locale], options).format(value);
}

/** EGP, whole pounds — prices on this site are illustrative and never fractional. */
export function formatEgp(locale: Locale, value: number): string {
  return new Intl.NumberFormat(numberLocale[locale], {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 0,
  }).format(value);
}
