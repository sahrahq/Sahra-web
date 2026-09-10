// A phone drawn the way the owner's Claude Design artboard draws one: a dark
// bezel, a Night screen with a notch, the screen's content laid out in HTML.
// Three sizes, the artboard's own — the hero's 340×720, the how-it-works
// 250×400 with a flat foot (it stands in a card that cuts it), the closer's
// 280×400. The geometry lives in globals.css (`.mock-phone-*`); every colour
// is a token: the bezel is ink, the screen the Night surface, the hairline the
// night border.
//
// Owner's decision, 2026-09-10: the phones show the artboard's drawn screens,
// not captures of the app — "keep them as they are in the Claude Design file".
// device-frame.tsx (the capture frame) stays in the repo, unused.
import type { ReactNode } from 'react';

export type PhoneSize = 'hero' | 'step' | 'closer';

export interface PhoneShellProps {
  size: PhoneSize;
  /** Extra classes on the bezel, e.g. the closer's gold halo. */
  className?: string;
  children: ReactNode;
}

const NOTCH: Record<PhoneSize, string> = {
  hero: 'h-6 w-24',
  step: 'h-5 w-16',
  closer: 'h-5 w-16',
};

export function PhoneShell({ size, className, children }: PhoneShellProps) {
  return (
    <div
      aria-hidden="true"
      className={`mock-phone mock-phone-${size} bg-ink shadow-3 ring-1 ring-night-border ${className ?? ''}`}
    >
      <div className="mock-screen theme-night relative h-full overflow-hidden bg-surface-page text-body">
        {size !== 'closer' && (
          <div className="absolute inset-x-0 top-2 flex justify-center">
            <div className={`${NOTCH[size]} rounded-pill bg-ink`} />
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
