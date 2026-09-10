// Section 10 — get the app: the artboard's closing Night band and its one gold
// moment. Gold overline, the big headline, one line, both store badges, and a
// phone rising out of the band's foot inside a gold glow — cut by the band so
// only its top shows: the mark, "Table for 2 · 9:00 PM", "Confirmed · Layali
// Lounge". Drawn, as the artboard draws it (owner's decision, 2026-09-10).
//
// GOLD, ONCE (design rules): the overline, the glow, the phone's halo. Gold on
// Night clears AA at 8.79:1. The headline is `text-display-lg` (64) where the
// artboard says 56 — the ladder has 48 and 64, and 64 is the step below 72.
import Image from 'next/image';
import { Mashrabiya } from '@/components/brand/mashrabiya';
import { PhoneShell } from '@/components/site/phone-shell';
import { StoreBadge } from '@/components/site/store-badge';
import type { Messages } from '@/i18n/messages';

export interface GetTheAppProps {
  copy: Messages['close'];
}

export function GetTheApp({ copy }: GetTheAppProps) {
  return (
    <section
      id="get-the-app"
      aria-labelledby="close-title"
      className="theme-night relative mt-24 overflow-hidden bg-surface-page pt-24 text-body"
    >
      <Mashrabiya className="text-night-text" opacity={0.04} fade="bottom" />
      <div className="closer-glow absolute inset-0" aria-hidden="true" />
      <div className="relative mx-auto flex w-full max-w-7xl flex-col items-center px-6 text-center md:px-16">
        <div data-reveal className="flex flex-col items-center">
          <p className="text-overline font-semibold uppercase tracking-overline text-premium">
            {copy.overline}
          </p>
          <h2
            id="close-title"
            className="mt-4 max-w-2xl font-display-script text-display font-semibold leading-tight text-balance text-body md:text-display-lg"
          >
            {copy.title}
          </h2>
          <p className="mt-5 max-w-md text-body-l leading-normal text-soft">{copy.lead}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <StoreBadge copy={copy} store="apple" variant="filled" />
            <StoreBadge copy={copy} store="play" variant="filled" />
          </div>
        </div>
        <div className="closer-phone-well mt-10 flex w-full justify-center">
          <PhoneShell size="closer" className="closer-phone">
            <div className="flex flex-col items-center pt-10">
              <Image src="/brand/logo.png" alt="" width={44} height={44} className="size-12" />
              <p className="mt-3 font-display-script text-h3 font-semibold text-body">{copy.phone1}</p>
              <p className="mt-1 text-caption text-premium">{copy.phone2}</p>
            </div>
          </PhoneShell>
        </div>
      </div>
    </section>
  );
}
