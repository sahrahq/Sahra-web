// Section 7 — where: 5:7, copy at the start, a Night panel with the lattice, a
// terracotta glow and the artboard's five neighbourhoods pinned at roughly
// their places on a Cairo map. The artboard labels it a map placeholder and so
// does the page. The panel's geography is fixed LTR in both languages (the
// artboard's own rule: Cairo does not mirror), so only its pin layer is forced
// `dir="ltr"` and the label keeps the page's direction.
//
// PIN POSITIONS ARE THE ARTBOARD'S, PULLED IN FROM ITS EDGES. Centred with
// `-translate-x-1/2`, a pin at 14% or 84% of a 1000px desktop panel has ~140px
// of panel on its short side — plenty for its own pill. At 380px (a ~330px
// panel after padding) the same 14% is one pin-width from the edge with no
// spare width at all, and the westernmost and easternmost pins clipped
// (reported 2026-09-10, "the map needs to look better"). Nudged in a few
// points; still reads as the same rough arrangement, no pin closer than the
// others to its edge.
import { Mashrabiya } from '@/components/brand/mashrabiya';
import type { Messages } from '@/i18n/messages';

export interface WhereProps {
  copy: Messages['where'];
}

/** Positions on the panel, as fractions of its width and height. */
const PINS = [
  { key: 'zamalek', x: '38%', y: '38%' },
  { key: 'maadi', x: '46%', y: '78%' },
  { key: 'heliopolis', x: '68%', y: '24%' },
  { key: 'newCairo', x: '80%', y: '58%' },
  { key: 'sheikhZayed', x: '20%', y: '54%' },
] as const;

export function Where({ copy }: WhereProps) {
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
      <div
        data-reveal
        className="map-panel theme-night relative overflow-hidden rounded-xl bg-surface-page text-body shadow-2 ring-1 ring-night-border md:col-span-7"
      >
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
        <p className="absolute start-4 bottom-3 text-caption uppercase tracking-overline text-faint">
          {copy.mapLabel}
        </p>
      </div>
    </section>
  );
}
