// Figures are Latin. All of them, everywhere (DESIGN-RULES).
//
// `Intl.NumberFormat('ar')` answers in Arabic-Indic digits, exactly as
// `DateFormat.d('ar')` does in the app — and it is why reservation_copy.dart
// looks month names up in a table. The `-u-nu-latn` extension pins the Latin
// numbering system while keeping Arabic separators and words.
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
