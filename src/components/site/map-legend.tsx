// The neighbourhoods as chips on the copy card, as the Cairo Map export draws them. Below md they
// are the only names shown: globals.css hides `.map-pin-label` there, as five pills would overlap.
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
