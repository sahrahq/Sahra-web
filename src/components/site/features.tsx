// Section 5 — what you get: the artboard's sunken band, 4:8, copy at the start
// and a two-column grid of its five cards (the sixth cell stays empty, as
// drawn).
//
// Every card is a claim with a symbol in decision 2026-09-10 §6: Arabic and
// English (arb_test.dart, the journey walks both), real availability
// (availability.service.ts), book without a deposit (no payments module, by
// design), saved places (saved_screen.dart, GET /saved), booking history (the
// past tab of my_bookings_screen.dart).
import type { Messages } from '@/i18n/messages';

export interface FeaturesProps {
  copy: Messages['features'];
}

const ITEMS = ['f1', 'f2', 'f3', 'f4', 'f5'] as const;

export function Features({ copy }: FeaturesProps) {
  return (
    <section id="features" aria-labelledby="features-title" className="mt-24 bg-surface-sunken py-24">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-6 md:grid-cols-12 md:gap-16 md:px-16">
        <div data-reveal className="md:col-span-4">
          <p className="text-overline font-semibold uppercase tracking-overline text-accent">
            {copy.overline}
          </p>
          <h2
            id="features-title"
            className="mt-4 font-display-script text-h1 font-semibold leading-tight text-balance text-body md:text-display"
          >
            {copy.title}
          </h2>
          <p className="mt-4 text-body-l leading-normal text-pretty text-soft">{copy.lead}</p>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2 md:col-span-8">
          {ITEMS.map((key) => (
            <li key={key} data-reveal className="rounded-lg border border-line bg-surface-card px-6 py-5">
              <h3 className="font-display-script text-h2 font-semibold leading-tight text-body">
                {copy[key].title}
              </h3>
              <p className="mt-2 text-body-m leading-normal text-pretty text-soft">{copy[key].body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
