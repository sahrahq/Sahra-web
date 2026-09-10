// Section 7 — where: 5:7, copy at the start, a Night panel with the lattice, a
// terracotta glow and the artboard's five neighbourhoods pinned at roughly
// their places on a Cairo map. The artboard labels it a map placeholder and so
// does the page. The panel's geography is fixed LTR in both languages (the
// artboard's own rule: Cairo does not mirror), so only its pin layer is forced
// `dir="ltr"` and the label keeps the page's direction.
import { Mashrabiya } from '@/components/brand/mashrabiya';
import type { Messages } from '@/i18n/messages';

export interface WhereProps {
  copy: Messages['where'];
}

/** Positions on the panel, as fractions of its width and height — the artboard's. */
const PINS = [
  { key: 'zamalek', x: '38%', y: '40%' },
  { key: 'maadi', x: '46%', y: '76%' },
  { key: 'heliopolis', x: '70%', y: '26%' },
  { key: 'newCairo', x: '84%', y: '58%' },
  { key: 'sheikhZayed', x: '14%', y: '52%' },
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
        className="map-panel theme-night relative overflow-hidden rounded-xl bg-surface-page text-body md:col-span-7"
      >
        <Mashrabiya className="text-night-text" opacity={0.04} />
        <div className="map-glow absolute inset-0" aria-hidden="true" />
        <ul dir="ltr" className="absolute inset-0">
          {PINS.map((p) => (
            <li
              key={p.key}
              style={{ insetInlineStart: p.x, top: p.y }}
              className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-pill border border-line bg-surface-card px-4 py-2 whitespace-nowrap"
            >
              <span className="size-2 rounded-pill bg-accent ring-4 ring-accent/25" aria-hidden="true" />
              <span className="font-display-script text-body-l font-semibold text-body">{copy[p.key]}</span>
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
