// The <html>/<body> shell of both root layouts, one per route group, so `lang` and `dir` are
// static per tree. No font utility on <body>: globals.css picks the stack from <html lang>, and a
// utility would outrank that rule and give Arabic a fallback face.
import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { fontVariables } from '@/fonts';
import { direction, type Locale, alternatesFor } from '@/i18n/locales';
import { getMessages } from '@/i18n/messages';

export function SiteDocument({ locale, children }: { locale: Locale; children: ReactNode }) {
  const m = getMessages(locale);
  return (
    <html lang={locale} dir={direction(locale)} className={fontVariables}>
      <body className="min-h-svh bg-surface-page text-body antialiased">
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-surface-card focus:px-4 focus:py-2 focus:text-body focus:shadow-2"
        >
          {m.nav.skipToContent}
        </a>
        {children}
      </body>
    </html>
  );
}

/** Route metadata, from the message file, with hreflang pairs. */
export function metadataFor(locale: Locale, path: string): Metadata {
  const m = getMessages(locale);
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  return {
    metadataBase: new URL(site),
    title: m.meta.title,
    description: m.meta.description,
    alternates: { canonical: alternatesFor(path)[locale], languages: alternatesFor(path) },
    openGraph: {
      title: m.meta.title,
      description: m.meta.description,
      locale: locale === 'ar' ? 'ar_EG' : 'en_EG',
      type: 'website',
      siteName: m.brand.name,
    },
  };
}
