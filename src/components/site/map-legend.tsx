// Below md, cairo-map.tsx hides its floating pin labels (globals.css,
// `.map-pin-label`) — Cairo's own geography is wide enough east-west that
// fitting all five neighbourhoods into a ~330px panel leaves no room for five
// fixed-width label pills without them overlapping (found 2026-09-11). The
// map still shows all five as pulsing dots at their real positions; this is
// where their names go instead, as a plain wrapped list, so nothing that was
// on the desktop map is lost, just moved off it.
import type { Messages } from '@/i18n/messages';

const HOODS = ['zamalek', 'maadi', 'heliopolis', 'newCairo', 'sheikhZayed'] as const;

export interface MapLegendProps {
  copy: Messages['where'];
}

export function MapLegend({ copy }: MapLegendProps) {
  return (
    <ul className="mt-3 flex flex-wrap gap-2 md:hidden">
      {HOODS.map((key) => (
        <li
          key={key}
          className="inline-flex items-center gap-1 rounded-pill border border-line bg-surface-card px-3 py-1 text-body-s font-medium text-soft"
        >
          <span className="size-2 shrink-0 rounded-pill bg-accent" aria-hidden="true" />
          {copy[key]}
        </li>
      ))}
    </ul>
  );
}
