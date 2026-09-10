// Section 11 — the footer, as the artboard draws it: Night, a hairline above,
// 2:1:1:1 — mark, tagline and the two outlined store badges, then three
// columns of links under overlines, the last with the language switch.
//
// Every link has a target: the landing's own sections, the two legal pages
// (stubs that say they are stubs, decision 2026-09-10 §8), and the other
// language. "Partner with SAHRA" goes to the FAQ answer about joining
// (#partner); "Operator preview" to the restaurants band. The badges are the
// same not-yet-links as the closer's (store-badge.tsx).
//
// Every one of these is next/link, including the hash-only ones — see the
// note in nav.tsx: this footer renders on /privacy and /terms too, where a
// hash link is a real cross-document navigation, and Next's router is what
// makes that reliable regardless of how a static host resolves the path.
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
          {/* The "where" band draws OpenStreetMap tiles, whose licence requires
              the credit, and the owner wants the map's own corners clean — so
              the credit lives here, in the place a reader looks for credits,
              rather than over the map (decision 2026-09-10 §6 follow-up). Not
              a link, for the same reason the store badges are not. */}
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
