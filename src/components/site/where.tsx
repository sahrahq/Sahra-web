// Where, as the "SAHRA Cairo Map" export draws it: the map fills the band and the copy floats over
// it on a Night card, which cairo-map.tsx measures (`data-map-reserve`); below md they stack. The
// map's credit is in the footer, not on the band. The lattice and vignette overlay tiles and pins.
import { Mashrabiya } from '@/components/brand/mashrabiya';
import { CairoMapGate } from '@/components/site/cairo-map-gate';
import { MapLegend } from '@/components/site/map-legend';
import type { Locale } from '@/i18n/locales';
import type { Messages } from '@/i18n/messages';

export interface WhereProps {
  locale: Locale;
  copy: Messages['where'];
}

/** Positions on the fallback panel, as fractions of its width and height. */
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
        {/* 0.035, not the export's 0.07: the export strokes at half alpha, ours at full (the
            colour is a token utility), so this paints the same texture. */}
        <Mashrabiya className="where-lattice text-body" opacity={0.035} />
        <div className="map-vignette" aria-hidden="true" />
      </div>
    </section>
  );
}
