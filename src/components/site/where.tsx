// Section 7 — where, composed the way the owner's second Claude Design export
// ("SAHRA Cairo Map") draws it: the map is the WHOLE BAND, edge to edge, and
// the copy floats over it on a Night card (owner, 2026-09-11 — "make it this
// shape, taking the whole space"). It replaces the 5/7 grid this section had,
// where the map was a panel in the right-hand cell.
//
// The export reserves ~500px of fit padding on the card's side so no pin ever
// lands under the copy; cairo-map.tsx measures THIS card (`data-map-reserve`)
// rather than assuming a width, because ours is 480px at 1280 and the page
// gutter grows past that.
//
// Below md a card cannot float over a ~380px map without hiding it, so the
// same two things stack: the copy, then a full-bleed map strip under it.
//
// The lattice and the vignette are the export's own two overlays — they sit
// above the tiles (and, as in the export, above the pins: Leaflet's panes are
// all inside one z-400 stacking context, so a z-499 sibling clears them) and
// give the band's edges a fade instead of a hard rectangle. `.where-map` is
// z-0 so both stay behind the card.
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
      className="where-band theme-night relative isolate mt-24 overflow-hidden bg-surface-page text-body"
    >
      <div className="relative z-10 mx-auto grid w-full max-w-7xl px-6 pt-16 pb-10 md:grid-cols-12 md:px-16 md:py-24">
        <div
          data-reveal
          data-map-reserve
          className="where-card rounded-xl border border-line p-6 shadow-2 md:col-span-5 md:p-10"
        >
          <p className="text-overline font-semibold uppercase tracking-overline text-accent">
            {copy.overline}
          </p>
          <h2
            id="where-title"
            className="mt-4 font-display-script text-h1 font-semibold leading-tight text-balance text-body md:text-display"
          >
            {copy.title}
          </h2>
          <p className="mt-4 text-body-l leading-normal text-pretty text-soft">{copy.lead}</p>
          <MapLegend copy={copy} />
        </div>
      </div>
      <div className="where-map">
        {/* The static fallback: shown until the real map mounts, or always,
            without JavaScript. The map (below) covers it once it is ready. */}
        <Mashrabiya className="text-body" opacity={0.05} />
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
        {/* 0.035, not the export's 0.07: the export strokes its lattice at
            half alpha and then fades the layer, so 0.07 of a half-alpha
            drawing is what it actually paints. At the full 0.07 ours read as
            a visible grid laid over Cairo. */}
        <Mashrabiya className="where-lattice text-body" opacity={0.035} />
        <div className="map-vignette" aria-hidden="true" />
      </div>
    </section>
  );
}
