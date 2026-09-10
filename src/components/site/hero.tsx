// Section 2 — the hero, from the owner's Claude Design artboard: a Night band,
// the lattice strongest at the top centre, everything centred — overline,
// headline, one supporting line, two pills — and a phone rising out of the
// band's bottom edge, cut by it.
//
// THE PHONE IS THE ARTBOARD'S. It draws the Discover screen in HTML — greeting,
// neighbourhood, the four chips, "Available tonight", one featured card — and
// the owner asked for exactly that (2026-09-10: "keep them as they are in the
// Claude Design file"). Every string comes from the message files; every colour
// from a token; the picture is the export's own (public/photos/README.md).
//
// TYPE. The artboard proposes `text-display-xl: 72px` for this headline; it is
// a token now (with `text-display-md: 48px` for the restaurants band). 40 on a
// phone, 48 from sm, 72 from lg — the Arabic headline stays on one line at each.
//
// This file is STATIC: a server component, the resting state of every element.
// Motion lives in hero-motion.tsx behind the shared gate (decision §5).
import Image from 'next/image';
import { Icon } from '@/components/brand/icon';
import { Mashrabiya } from '@/components/brand/mashrabiya';
import { HeroMotion } from '@/components/site/hero-motion-gate';
import { GET_APP } from '@/site/anchors';
import { PhoneShell } from '@/components/site/phone-shell';
import { type Locale, pathFor } from '@/i18n/locales';
import type { Messages } from '@/i18n/messages';

export interface HeroProps {
  locale: Locale;
  copy: Messages['hero'];
}

const CHIPS = ['chip1', 'chip2', 'chip3', 'chip4'] as const;

export function Hero({ locale, copy }: HeroProps) {
  const here = pathFor(locale, '/');
  const arrow = locale === 'ar' ? 'arrow-left' : 'arrow-right';
  const pill =
    'inline-flex min-h-12 items-center justify-center rounded-pill px-6 text-body-l font-semibold whitespace-nowrap transition-transform duration-150 ease-out active:scale-98';
  const chip = 'rounded-pill px-3 py-2 text-overline font-medium whitespace-nowrap';

  return (
    <section id="hero" className="theme-night relative isolate overflow-hidden bg-surface-page text-body">
      <Mashrabiya className="text-night-text" opacity={0.06} fade="top" />
      {/* pt-24 clears the overlaid nav; the inner padding is the artboard's 56px gap under it. */}
      <div className="relative mx-auto flex w-full max-w-7xl flex-col items-center px-6 pt-24 text-center md:px-16">
        <div className="flex flex-col items-center pt-6 md:pt-12">
          <p className="text-overline font-semibold uppercase tracking-overline text-faint">
            {copy.overline}
          </p>
          <h1
            data-hero-headline
            className="mt-4 max-w-4xl font-display-script text-display font-semibold leading-tight text-balance text-body sm:text-display-md lg:text-display-xl"
          >
            {copy.headline}
          </h1>
          <p data-hero-follow className="mt-5 max-w-xl text-h3 leading-normal text-pretty text-soft">
            {copy.supporting}
          </p>
          <div data-hero-follow className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href={`${here}${GET_APP}`}
              className={`${pill} bg-accent text-accent-contrast hover:bg-accent-hover hover:text-accent-contrast`}
            >
              {copy.getApp}
            </a>
            <a
              href={`${here}#restaurants`}
              className={`${pill} border border-line text-body hover:bg-surface-card hover:text-body`}
            >
              {copy.partner}
            </a>
          </div>
        </div>

        {/* The well is the band's last row; its fixed height is what crops the phone. */}
        <div className="hero-phone-well mt-10 flex w-full justify-center md:mt-12">
          <div data-hero-phone data-hero-mock className="will-change-transform">
            <PhoneShell size="hero">
              <div className="flex justify-between px-6 pt-4 text-body-s font-semibold text-body">
                <span>9:41</span>
                <span className="tracking-overline">●●●</span>
              </div>
              <div className="flex items-center justify-between px-5 pt-6">
                <div>
                  <p className="text-overline text-faint">{copy.phone.greeting}</p>
                  <p className="flex items-center gap-1 font-display-script text-h3 font-semibold text-body">
                    {copy.phone.location}
                    <Icon name="chevron-down" size={14} className="text-premium" />
                  </p>
                </div>
                <Image
                  src="/photos/mock-avatar.jpg"
                  alt=""
                  width={36}
                  height={36}
                  className="size-10 rounded-pill bg-surface-sunken object-cover"
                />
              </div>
              <div className="mt-4 flex gap-2 overflow-hidden px-5">
                {CHIPS.map((c, i) => (
                  <span
                    key={c}
                    className={`${chip} ${i === 0 ? 'bg-accent font-semibold text-accent-contrast' : 'border border-line bg-surface-card text-soft'}`}
                  >
                    {copy.phone[c]}
                  </span>
                ))}
              </div>
              <div className="flex items-baseline justify-between px-5 pt-5 pb-2">
                <span className="font-display-script text-h3 font-semibold text-body">
                  {copy.phone.available}
                </span>
                <span className="text-overline font-semibold text-gold-dark">{copy.phone.seeAll}</span>
              </div>
              <div className="mx-5 overflow-hidden rounded-lg border border-line bg-surface-card">
                <div className="mock-card-photo relative bg-surface-sunken">
                  <Image src="/photos/mock-featured.jpg" alt="" fill sizes="340px" className="object-cover" />
                  <div className="photo-shade absolute inset-0" aria-hidden="true" />
                  <span className="absolute start-3 top-3 rounded-pill bg-accent px-2 py-1 text-overline font-semibold uppercase tracking-overline text-accent-contrast">
                    {copy.phone.featured}
                  </span>
                </div>
                <div className="px-4 pt-3 pb-4">
                  <p className="font-display-script text-body-l font-semibold text-body">
                    {copy.phone.venue}
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-overline text-faint">
                    <Icon name="star" size={11} className="text-premium" />
                    4.8 (312) · {copy.phone.cuisine} · $$$
                  </p>
                  <div className="mt-3 flex justify-between border-t border-line pt-3 text-overline text-soft">
                    <span>{copy.phone.slot}</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-accent">
                      {copy.phone.book}
                      <Icon name={arrow} size={11} />
                    </span>
                  </div>
                </div>
              </div>
            </PhoneShell>
          </div>
        </div>
      </div>
      <HeroMotion />
    </section>
  );
}
