// Section 8 — for restaurants: the artboard's second Night band. Centred copy
// with the 48px headline (`text-display-md`, the artboard's size), one filled
// "Partner with SAHRA", and under it a window — top corners rounded, no bottom
// edge — with the operator view drawn in HTML and cut by the band's end.
//
// THE WINDOW IS THE ARTBOARD'S DRAWING: sidebar, title, walk-in, four KPIs,
// three bookings, the floor grid — its strings from the message files, its
// figures here, every colour a token. Owner's decision, 2026-09-10 ("keep them
// as they are in the Claude Design file"). Below md the sidebar and the floor
// plan fold away and the middle column carries the window.
//
// The CTA goes to the FAQ answer about joining (#partner): the artboard's
// `#partner` had no target, and the contact channel is an open question
// (decision §8).
import Image from 'next/image';
import { Mashrabiya } from '@/components/brand/mashrabiya';
import { type Locale, pathFor } from '@/i18n/locales';
import type { Messages } from '@/i18n/messages';

export interface OperatorProps {
  locale: Locale;
  copy: Messages['operator'];
  brand: string;
}

const KPIS = [
  { key: 'k1', value: '46' },
  { key: 'k2', value: '72%' },
  { key: 'k3', value: '18' },
  { key: 'k4', value: '1' },
] as const;

const BOOKINGS = [
  {
    time: '7:30',
    name: 'b1Name',
    party: '2',
    table: 'T4',
    status: 'b1Status',
    tone: 'text-terracotta-light',
  },
  { time: '8:00', name: 'b2Name', party: '4', table: 'T9', status: 'b2Status', tone: 'text-soft' },
  { time: '9:00', name: 'b3Name', party: '6', table: 'T12', status: 'b3Status', tone: 'text-warning' },
] as const;

/** The artboard's floor: which of the twelve tables is seated, reserved next, or free. */
const TABLES = [
  'free',
  'seated',
  'free',
  'next',
  'free',
  'free',
  'next',
  'free',
  'seated',
  'next',
  'free',
  'free',
] as const;
const TABLE_TONE: Record<(typeof TABLES)[number], string> = {
  free: 'border-line bg-surface-card text-faint',
  seated: 'border-terracotta bg-terracotta/20 text-terracotta-light',
  next: 'border-gold-dark bg-gold/15 text-premium',
};

const SIDEBAR = ['sbFloor', 'sbGuests', 'sbReviews', 'sbMenu'] as const;

export function Operator({ locale, copy, brand }: OperatorProps) {
  const here = pathFor(locale, '/');
  const d = copy.dash;
  return (
    <section
      id="restaurants"
      aria-labelledby="operator-title"
      className="theme-night relative mt-24 overflow-hidden bg-surface-page pt-24 text-body"
    >
      <Mashrabiya className="text-night-text" opacity={0.05} fade="bottom" />
      <div className="relative mx-auto w-full max-w-7xl px-6 md:px-16">
        <div data-reveal className="flex flex-col items-center text-center">
          <p className="text-overline font-semibold uppercase tracking-overline text-faint">
            {copy.overline}
          </p>
          <h2
            id="operator-title"
            className="mt-4 max-w-3xl font-display-script text-h1 font-semibold leading-tight text-balance text-body md:text-display-md"
          >
            {copy.title}
          </h2>
          <p className="mt-5 max-w-xl text-body-l leading-normal text-pretty text-soft">{copy.lead}</p>
          <a
            href={`${here}#partner`}
            className="mt-8 inline-flex min-h-12 items-center justify-center rounded-pill bg-accent px-6 text-body-l font-semibold whitespace-nowrap text-accent-contrast transition-transform duration-150 ease-out hover:bg-accent-hover hover:text-accent-contrast active:scale-98"
          >
            {copy.cta}
          </a>
        </div>

        <div
          data-reveal
          data-operator-mock
          className="mock-dash mx-auto mt-16 flex w-full max-w-5xl overflow-hidden rounded-t-lg border border-b-0 border-line bg-surface-card text-body-s"
        >
          <aside className="mock-dash-side hidden flex-col gap-1 border-e border-line px-3 py-5 md:flex">
            <div className="flex items-center gap-2 px-2 pb-4">
              <Image src="/brand/logo.png" alt="" width={22} height={22} className="size-6" />
              <div>
                <p className="font-display-script text-caption font-semibold tracking-overline text-body">
                  {brand}
                </p>
                <p className="text-overline uppercase text-faint">{d.forRest}</p>
              </div>
            </div>
            <p className="rounded-md bg-terracotta/20 px-3 py-2 font-semibold text-terracotta-light">
              {d.sbTonight}
            </p>
            {SIDEBAR.map((k) => (
              <p key={k} className="px-3 py-2 text-soft">
                {d[k]}
              </p>
            ))}
          </aside>

          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-center justify-between gap-4 border-b border-line px-6 py-4">
              <div>
                <p className="font-display-script text-h3 font-semibold text-body">{d.title}</p>
                <p className="text-caption text-faint">{d.sub}</p>
              </div>
              <span className="rounded-pill bg-accent px-3 py-2 text-caption font-semibold whitespace-nowrap text-accent-contrast">
                {d.walkIn}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 px-6 pt-4 md:flex">
              {KPIS.map((k) => (
                <div key={k.key} className="flex-1 rounded-lg border border-line bg-surface-sunken px-4 py-3">
                  <p className="text-overline uppercase text-faint">{d[k.key]}</p>
                  <p className="mt-1 font-display-script text-h2 font-semibold text-body">{k.value}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-2 px-6 pt-4">
              {BOOKINGS.map((b) => (
                <div
                  key={b.time}
                  className="flex items-center gap-3 rounded-lg border border-line bg-surface-sunken px-4 py-3"
                >
                  <span className="w-12 shrink-0 font-display-script text-body-l font-semibold text-body">
                    {b.time}
                  </span>
                  {/* No avatar: a plain coloured circle with no guest photo behind
                      it read as a broken image placeholder, not a design choice
                      (reported 2026-09-10) — there is no photo for it to hold,
                      here or anywhere a real guest's avatar would need one, so
                      it is gone rather than faked. The table code is still the
                      first to go on a narrow window, so the guest's name — the
                      one thing worth reading here — keeps the room. */}
                  <span className="min-w-0 flex-1 truncate text-body-m font-semibold text-body">
                    {d[b.name]}
                  </span>
                  <span className="shrink-0 text-soft">{b.party}</span>
                  <span className="hidden w-8 shrink-0 text-soft sm:inline">{b.table}</span>
                  <span className={`shrink-0 text-overline font-semibold ${b.tone}`}>{d[b.status]}</span>
                </div>
              ))}
            </div>
          </div>

          <aside className="mock-dash-floor hidden border-s border-line px-4 py-5 lg:block">
            <p className="text-overline font-semibold uppercase tracking-overline text-faint">
              {d.floorLabel}
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {TABLES.map((state, i) => (
                <div
                  key={i}
                  className={`flex aspect-square items-center justify-center rounded-md border text-overline font-semibold ${TABLE_TONE[state]}`}
                >
                  T{i + 1}
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
