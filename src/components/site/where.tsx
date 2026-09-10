// Section 7 — where: 5:7, copy at the start, and the real Cairo map from the
// owner's second Claude Design export ("SAHRA Cairo Map") — real OpenStreetMap
// tiles retinted into SAHRA Night, the same five neighbourhoods pinned at
// their real coordinates (cairo-map.tsx). Loaded lazily, client-only, since
// it is a live map and real weight; this file keeps rendering the ORIGINAL
// schematic panel underneath it as the static fallback — what a reader with
// JavaScript off, or before the map has mounted, sees instead. The panel's
// geography stays fixed LTR either way (the design's own rule: Cairo does not
// mirror), so only the pin/label layer is forced `dir="ltr"`.
import { Mashrabiya } from '@/components/brand/mashrabiya';
import { CairoMapGate } from '@/components/site/cairo-map-gate';
import { MapLegend } from '@/components/site/map-legend';
import type { Locale } from '@/i18n/locales';
import type { Messages } from '@/i18n/messages';

export interface WhereProps {
  locale: Locale;
  copy: Messages['where'];
}

/** Positions on the FALLBACK panel, as fractions of its width and height. */
const PINS = [
  { key: 'zamalek', x: '38%', y: '38%' },
  { key: 'maadi', x: '46%', y: '78%' },
  { key: 'heliopolis', x: '68%', y: '24%' },
  { key: 'newCairo', x: '80%', y: '58%' },
  { key: 'sheikhZayed', x: '20%', y: '54%' },
] as const;

export function Where({ locale, copy }: WhereProps) {
  return (
    <section
      id="where"
      aria-labelledby="where-title"
      className="mx-auto grid w-full max-w-7xl items-center gap-10 px-6 pt-24 md:grid-cols-12 md:gap-16 md:px-16"
    >
      <div data-reveal className="md:col-span-5">
        <p className="text-overline font-semibold uppercase tracking-overline text-accent">{copy.overline}</p>
        <h2
          id="where-title"
          className="mt-4 font-display-script text-h1 font-semibold leading-tight text-balance text-body md:text-display"
        >
          {copy.title}
        </h2>
        <p className="mt-4 text-body-l leading-normal text-pretty text-soft">{copy.lead}</p>
      </div>
      <div className="md:col-span-7">
        <div
          data-reveal
          className="map-panel theme-night relative overflow-hidden rounded-xl bg-surface-page text-body shadow-2 ring-1 ring-night-border"
        >
          {/* The static fallback: shown until the real map mounts, or always,
              without JavaScript. The map (below) covers it once it is ready. */}
          <Mashrabiya className="text-night-text" opacity={0.05} />
          <div className="map-glow absolute inset-0" aria-hidden="true" />
          <ul dir="ltr" className="absolute inset-0">
            {PINS.map((p) => (
              <li
                key={p.key}
                style={{ insetInlineStart: p.x, top: p.y }}
                className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-pill border border-line bg-surface-card px-3 py-1 shadow-1 whitespace-nowrap md:gap-2 md:px-4 md:py-2"
              >
                <span
                  className="size-2 shrink-0 rounded-pill bg-accent ring-4 ring-accent/25"
                  aria-hidden="true"
                />
                <span className="font-display-script text-body-m font-semibold text-body md:text-body-l">
                  {copy[p.key]}
                </span>
              </li>
            ))}
          </ul>
          <CairoMapGate locale={locale} copy={copy} />
        </div>
        {/* Below md the map itself only shows dots (globals.css hides its
            labels there — five fixed-width pills do not fit a ~330px-wide
            panel without overlapping); their names are listed here instead. */}
        <MapLegend copy={copy} />
      </div>
    </section>
  );
}
