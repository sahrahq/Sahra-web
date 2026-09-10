// Section 3 — two audiences, as the artboard draws them: two cards on the page
// surface, 7:5. The diner's is cream with a staggered strip of three photos
// rising from its foot; the restaurant's is Night, the lattice rising from its
// bottom edge, two rows of tonight's book and an underlined "Partner with
// SAHRA". Side by side from md, stacked on a phone.
//
// PHOTOS. The three pictures came with the Claude Design export; its own notes
// call them stock stand-ins (Unsplash) to be replaced by SAHRA's venue
// photography. They are captioned by what is IN them — dinner, a lounge, a
// late kitchen — never by a place or a partner (decision 2026-09-10 §6: no
// invented venues). public/photos/README.md carries the provenance.
//
// THE TWO ROWS are the first two lines of the operator preview
// (public/shots/operator/*.png, a labelled reference render of
// OperatorDashboard.jsx): the same guests, the same statuses. An illustration
// of the preview, not a screenshot of anything.
//
// CONTRAST on the Night card, from the tokens: heading cream on night 17.75:1,
// body night-text-soft 11.45:1, "Seated" in the night warning tone 6.9:1.
import Image from 'next/image';
import { Icon, type IconName } from '@/components/brand/icon';
import { Mashrabiya } from '@/components/brand/mashrabiya';
import { GET_APP } from '@/site/anchors';
import { type Locale, pathFor } from '@/i18n/locales';
import type { Messages } from '@/i18n/messages';

export interface TwoAudiencesProps {
  locale: Locale;
  copy: Messages['audiences'];
}

const STRIP = [
  { src: '/photos/strip-dinner.jpg', key: 'photo1', height: 'strip-a' },
  { src: '/photos/strip-lounge.jpg', key: 'photo2', height: 'strip-b' },
  { src: '/photos/strip-late.jpg', key: 'photo3', height: 'strip-c' },
] as const;

const ROWS = [
  { time: '7:30', guest: 'row1Guest', status: 'row1Status', tone: 'text-warning' },
  { time: '8:00', guest: 'row2Guest', status: 'row2Status', tone: 'text-soft' },
] as const;

export function TwoAudiences({ locale, copy }: TwoAudiencesProps) {
  const here = pathFor(locale, '/');
  const arrow: IconName = locale === 'ar' ? 'arrow-left' : 'arrow-right';
  const overline = 'text-overline font-semibold uppercase tracking-overline';
  const heading =
    'mt-4 font-display-script text-h1 font-semibold leading-tight text-balance text-body md:text-display';
  const line = 'mt-4 text-body-l leading-normal text-pretty text-soft';

  return (
    <section
      id="diners"
      aria-label={copy.label}
      className="mx-auto grid w-full max-w-7xl gap-5 px-6 pt-24 md:grid-cols-12 md:px-16"
    >
      {/* The diner's card: cream, the copy at the top, the photo strip at the foot. */}
      <div
        data-audience="diners"
        data-reveal
        className="relative flex flex-col overflow-hidden rounded-xl border border-line bg-surface-card px-6 pt-8 md:col-span-7 md:px-10 md:pt-10"
      >
        <p className={`${overline} text-accent`}>{copy.diners.overline}</p>
        <h2 className={`${heading} max-w-md`}>{copy.diners.title}</h2>
        <p className={`${line} max-w-md`}>{copy.diners.line}</p>
        <a
          href={`${here}${GET_APP}`}
          className="mt-6 inline-flex min-h-12 items-center gap-2 self-start rounded-pill bg-accent px-5 text-body-m font-semibold whitespace-nowrap text-accent-contrast transition-transform duration-150 ease-out hover:bg-accent-hover hover:text-accent-contrast active:scale-98"
        >
          {copy.diners.cta}
        </a>
        <div className="mt-8 flex flex-1 items-end gap-3">
          {STRIP.map((p) => (
            <figure
              key={p.key}
              className={`${p.height} relative flex-1 overflow-hidden rounded-t-lg bg-surface-sunken`}
            >
              <Image src={p.src} alt="" fill sizes="(min-width: 768px) 20vw, 30vw" className="object-cover" />
              <div className="photo-shade absolute inset-0" aria-hidden="true" />
              <figcaption className="absolute start-3 bottom-3 text-overline font-medium text-night-text">
                {copy.diners[p.key]}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>

      {/* The restaurant's card: Night, the lattice rising from its foot. */}
      <div
        data-audience="restaurants"
        data-reveal
        className="theme-night relative flex flex-col overflow-hidden rounded-xl bg-surface-page p-6 text-body md:col-span-5 md:p-10"
      >
        <Mashrabiya className="text-night-text" opacity={0.05} fade="rise" />
        <div className="relative flex flex-1 flex-col">
          <p className={`${overline} text-faint`}>{copy.restaurants.overline}</p>
          <h2 className={heading}>{copy.restaurants.title}</h2>
          <p className={line}>{copy.restaurants.line}</p>
          <ul className="mt-6 flex flex-col gap-2 text-body-s text-soft">
            {ROWS.map((r) => (
              <li
                key={r.time}
                className="flex items-center justify-between gap-4 rounded-md border border-line bg-surface-card px-4 py-3"
              >
                <span>
                  <span className="me-3 font-display-script text-body-l font-semibold text-body">
                    {r.time}
                  </span>
                  {copy.restaurants[r.guest]}
                </span>
                <span className={`font-medium ${r.tone}`}>{copy.restaurants[r.status]}</span>
              </li>
            ))}
          </ul>
          <a
            href={`${here}#restaurants`}
            className="mt-auto inline-flex min-h-12 items-center gap-2 self-start border-b border-body pt-6 text-body-m font-semibold text-body hover:text-soft"
          >
            {copy.restaurants.cta}
            <Icon name={arrow} size={16} />
          </a>
        </div>
      </div>
    </section>
  );
}
