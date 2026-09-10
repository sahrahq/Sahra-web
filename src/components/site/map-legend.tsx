// The five neighbourhoods as chips on the copy card, where the owner's Cairo
// Map export puts them — and the only place the names appear below md, since
// cairo-map.tsx hides its floating pin labels there (globals.css,
// `.map-pin-label`): Cairo's east-west spread needs a zoom small enough that
// five fixed-width label pills land on top of each other in a ~380px strip.
import type { Messages } from '@/i18n/messages';

const HOODS = ['zamalek', 'maadi', 'heliopolis', 'newCairo', 'sheikhZayed'] as const;

export interface MapLegendProps {
  copy: Messages['where'];
}

export function MapLegend({ copy }: MapLegendProps) {
  return (
    <ul className="mt-6 flex flex-wrap gap-2">
      {HOODS.map((key) => (
        <li
          key={key}
          className="inline-flex items-center gap-2 rounded-pill border border-line bg-surface-sunken px-3 py-1 text-body-s font-medium text-soft"
        >
          <span className="size-2 shrink-0 rounded-pill bg-accent" aria-hidden="true" />
          {copy[key]}
        </li>
      ))}
    </ul>
  );
}
