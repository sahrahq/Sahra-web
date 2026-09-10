'use client';

// Section 1 — the nav, as the owner's Claude Design artboard draws it: on the
// Night hero band, the mark and the wordmark at the start, Diners · Restaurants
// · FAQ in the middle in the soft night text, then the language switch as an
// outlined pill and "Get the app" as the one filled terracotta pill.
//
// It OVERLAYS the hero (absolute, top of the page) so the <header> stays a
// top-level banner landmark while the lattice runs behind it, exactly as in the
// artboard where the nav sits inside the band. `overlay={false}` gives the
// legal pages a plain Night strip instead.
//
// Anchors always point at the landing (`/#diners`, `/ar#faq`), whatever page the
// reader is on; the language switch keeps them on the SAME page (`path`).
//
// EVERY LINK HERE IS next/link, not a plain <a> — including the hash-only
// ones. From the landing itself that is the same document either way; from
// `/privacy` or `/terms` (SiteNav renders on both) a plain `<a href="/ar#faq">`
// is a real cross-document browser navigation, and a static host that expects
// a trailing slash on `/ar` (several do; this repo's own preview server does
// not) turns that into an error page instead of a scroll — found 2026-09-10 by
// clicking "Get the app" from the privacy page. Next's router fetches the
// target route itself, so it never asks a static file server to resolve the
// path, and it still renders a real `<a href>` for the tests and for anyone
// without JavaScript to fall back to.
//
// Chrome motion follows the DESIGN SYSTEM tier (150–200 ms, no bounce): the
// mobile panel fades in over 150 ms and the reduced-motion rule in globals.css
// collapses that to nothing. This is a client component only for the mobile
// disclosure; everything it renders is in the static HTML, menu closed.
import Image from 'next/image';
import Link from 'next/link';
import { useId, useState } from 'react';
import { Icon } from '@/components/brand/icon';
import { type Locale, otherLocale, pathFor } from '@/i18n/locales';
import type { Messages } from '@/i18n/messages';
// Not re-exported: a client-file export used as a value in a Server Component
// is exactly the bug src/site/anchors.ts's comment describes. Import GET_APP
// from '@/site/anchors' directly, the same as this file does below.
import { GET_APP } from '@/site/anchors';

export interface SiteNavProps {
  locale: Locale;
  /** The page's path without locale, e.g. '/', so the switch keeps the reader on the same page. */
  path: string;
  copy: Messages['nav'];
  brand: string;
  /** Sit on top of the hero band (the landing) rather than in the flow (legal pages). */
  overlay?: boolean;
}

const LINKS = [
  { key: 'diners', hash: '#diners' },
  { key: 'restaurants', hash: '#restaurants' },
  { key: 'faq', hash: '#faq' },
] as const;

export function SiteNav({ locale, path, copy, brand, overlay = true }: SiteNavProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const other = otherLocale(locale);
  const landing = pathFor(locale, '/');

  const linkClass =
    'inline-flex min-h-12 items-center rounded-pill px-4 text-body-m font-medium text-soft hover:text-body';
  const switchClass =
    'inline-flex min-h-12 items-center rounded-pill border border-line px-4 text-body-s font-semibold text-soft hover:bg-surface-card hover:text-body';
  const pillClass =
    'inline-flex min-h-12 items-center gap-2 rounded-pill bg-accent px-5 text-body-m font-semibold text-accent-contrast transition-transform duration-150 ease-out hover:bg-accent-hover hover:text-accent-contrast active:scale-98';

  return (
    <header
      className={`theme-night text-body ${overlay ? 'absolute inset-x-0 top-0 z-40' : 'relative bg-surface-page'}`}
    >
      <nav
        aria-label={copy.label}
        className="relative mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-5 md:px-16"
      >
        <Link href={landing} className="inline-flex min-h-12 items-center gap-3 text-body hover:text-body">
          <Image src="/brand/logo.png" alt="" width={28} height={28} className="size-8" />
          <span
            className={`font-display-script text-h3 font-semibold ${locale === 'en' ? 'tracking-overline' : ''}`}
          >
            {brand}
          </span>
        </Link>

        {/* Desktop: the three links in the middle, switch + pill at the end. */}
        <ul className="hidden items-center gap-2 md:flex">
          {LINKS.map((l) => (
            <li key={l.key}>
              <Link href={`${landing}${l.hash}`} className={linkClass}>
                {copy[l.key]}
              </Link>
            </li>
          ))}
        </ul>
        <div className="hidden items-center gap-4 md:flex">
          <Link
            href={pathFor(other, path)}
            lang={other}
            hrefLang={other}
            aria-label={copy.switchLocaleLabel}
            className={switchClass}
          >
            {copy.switchLocale}
          </Link>
          <Link href={`${landing}${GET_APP}`} className={pillClass}>
            {copy.getApp}
          </Link>
        </div>

        {/* Mobile: the switch stays visible (a reader in the wrong language must not dig for it), the rest folds. */}
        <div className="flex items-center gap-2 md:hidden">
          <Link
            href={pathFor(other, path)}
            lang={other}
            hrefLang={other}
            aria-label={copy.switchLocaleLabel}
            className={switchClass}
          >
            {copy.switchLocale}
          </Link>
          <button
            type="button"
            aria-expanded={open}
            aria-controls={panelId}
            aria-label={open ? copy.menuClose : copy.menuOpen}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex size-12 items-center justify-center rounded-pill text-body hover:bg-surface-card"
          >
            <Icon name={open ? 'x' : 'menu'} size={22} />
          </button>
        </div>
      </nav>

      {/* min-h-dvh (a real Tailwind size, not an arbitrary value): the panel's
          own content is shorter than the hero behind it, and both share the
          same Night colour — without a floor this deep, the hero's own
          headline and CTAs showed through right under the panel's, reading as
          one broken overlapping block rather than a menu over a page (found
          2026-09-10). This makes it a full-screen takeover instead, however
          short its own two lines of links are. */}
      <div
        id={panelId}
        hidden={!open}
        className="absolute inset-x-0 top-full min-h-dvh border-y border-line bg-surface-page px-6 pb-6 pt-2 shadow-3 transition-opacity duration-150 ease-out md:hidden"
      >
        <ul className="flex flex-col">
          {LINKS.map((l) => (
            <li key={l.key}>
              <Link
                href={`${landing}${l.hash}`}
                onClick={() => setOpen(false)}
                className={`${linkClass} w-full justify-start text-body-l`}
              >
                {copy[l.key]}
              </Link>
            </li>
          ))}
        </ul>
        <Link
          href={`${landing}${GET_APP}`}
          onClick={() => setOpen(false)}
          className={`${pillClass} mt-4 w-full justify-center`}
        >
          {copy.getApp}
        </Link>
      </div>
    </header>
  );
}
