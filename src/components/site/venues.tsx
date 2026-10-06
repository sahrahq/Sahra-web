// Venues, as the artboard lays them out. The names and ratings are the artboard's, kept at the
// owner's direction; none is a confirmed partner (decision 2026-09-10 §8 tracks it). The photos
// are the export's stock pictures (public/photos/README.md).
import Image from 'next/image';
import { Icon } from '@/components/brand/icon';
import type { Messages } from '@/i18n/messages';

export interface VenuesProps {
  copy: Messages['venues'];
}

const CARDS = [
  { key: 'v1', src: '/photos/night-dinner.jpg' },
  { key: 'v2', src: '/photos/night-friends.jpg' },
  { key: 'v3', src: '/photos/night-grill.jpg' },
  { key: 'v4', src: '/photos/night-late.jpg' },
] as const;

const MORE = ['v5', 'v6', 'v7', 'v8'] as const;

export function Venues({ copy }: VenuesProps) {
  return (
    <section
      id="venues"
      aria-label={copy.overline}
      className="mx-auto w-full max-w-7xl px-6 pt-16 text-center md:px-16"
    >
      <p data-reveal className="text-overline font-semibold uppercase tracking-overline text-faint">
        {copy.overline}
      </p>
      <ul className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {CARDS.map((c) => (
          <li
            key={c.key}
            data-reveal
            className="venue-card relative overflow-hidden rounded-lg bg-surface-sunken"
          >
            <Image src={c.src} alt="" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
            <div className="photo-shade-strong absolute inset-0" aria-hidden="true" />
            <div className="absolute start-4 bottom-3 text-start">
              <h3 className="font-display-script text-h3 font-semibold leading-tight text-night-text md:text-h2">
                {copy[c.key].name}
              </h3>
              <p className="mt-1 flex items-center gap-1 text-overline text-night-text-soft">
                <Icon name="star" size={11} className="text-premium" />
                {copy[c.key].meta}
              </p>
            </div>
          </li>
        ))}
      </ul>
      <div
        data-reveal
        className="mt-6 flex flex-wrap justify-center gap-x-8 gap-y-3 font-display-script text-h3 font-medium text-soft"
      >
        {MORE.map((key) => (
          <span key={key}>{copy[key]}</span>
        ))}
      </div>
      <p data-reveal className="mt-4 text-body-s text-faint">
        {copy.more}
      </p>
    </section>
  );
}
