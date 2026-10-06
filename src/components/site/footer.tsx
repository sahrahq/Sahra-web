// The footer, as the artboard draws it. Every link has a target, and each is next/link, hashes
// too, since the footer also renders on /privacy and /terms (see nav.tsx). The store badges are
// not links yet (store-badge.tsx).
import Image from 'next/image';
import Link from 'next/link';
import { GET_APP } from '@/site/anchors';
import { StoreBadge } from '@/components/site/store-badge';
import { type Locale, otherLocale, pathFor } from '@/i18n/locales';
import type { Messages } from '@/i18n/messages';

export interface SiteFooterProps {
  locale: Locale;
  /** The page's path without locale, so the language switch keeps the reader on it. */
  path: string;
  m: Messages;
}

export function SiteFooter({ locale, path, m }: SiteFooterProps) {
  const here = pathFor(locale, '/');
  const other = otherLocale(locale);
  const overline = 'text-overline font-semibold uppercase tracking-overline text-faint';
  const link = 'inline-flex min-h-12 items-center text-body-m text-soft hover:text-body';

  return (
    <footer
      aria-label={m.footer.label}
      className="theme-night border-t border-line bg-surface-page text-soft"
    >
      <div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-10 px-6 pb-10 pt-12 md:grid-cols-5 md:px-16">
        <div className="col-span-2">
          <Link href={here} className="inline-flex items-center gap-3 text-body hover:text-body">
            <Image src="/brand/logo.png" alt="" width={24} height={24} className="size-6" />
            <span
              className={`font-display-script text-body-l font-semibold ${locale === 'en' ? 'tracking-overline' : ''}`}
            >
              {m.brand.name}
            </span>
          </Link>
          <p className="mt-4 max-w-2xs text-body-m leading-normal text-faint">{m.footer.tagline}</p>
          {/* OpenStreetMap's licence requires this credit for the map's tiles; it sits here, where
              a reader looks for credits, so the map stays clean (decision 2026-09-10 §6). */}
          <p className="mt-3 text-overline text-faint">{m.footer.mapCredit}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            <StoreBadge copy={m.close} store="apple" variant="outline" />
            <StoreBadge copy={m.close} store="play" variant="outline" />
          </div>
        </div>

        <nav aria-label={m.nav.diners} className="flex flex-col gap-1">
          <span className={overline}>{m.nav.diners}</span>
          <Link href={`${here}${GET_APP}`} className={link}>
            {m.nav.getApp}
          </Link>
          <Link href={`${here}#how-it-works`} className={link}>
            {m.footer.how}
          </Link>
          <Link href={`${here}#where`} className={link}>
            {m.footer.hoods}
          </Link>
        </nav>

        <nav aria-label={m.nav.restaurants} className="flex flex-col gap-1">
          <span className={overline}>{m.nav.restaurants}</span>
          <Link href={`${here}#partner`} className={link}>
            {m.hero.partner}
          </Link>
          <Link href={`${here}#restaurants`} className={link}>
            {m.footer.operator}
          </Link>
        </nav>

        <nav aria-label={m.footer.company} className="flex flex-col gap-1">
          <span className={overline}>{m.footer.company}</span>
          <Link href={`${here}#faq`} className={link}>
            {m.nav.faq}
          </Link>
          <Link href={pathFor(locale, '/privacy')} className={link}>
            {m.footer.privacy}
          </Link>
          <Link href={pathFor(locale, '/terms')} className={link}>
            {m.footer.terms}
          </Link>
          <Link
            href={pathFor(other, path)}
            lang={other}
            hrefLang={other}
            aria-label={m.nav.switchLocaleLabel}
            className={link}
          >
            {m.nav.switchLocale}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
