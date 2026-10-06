// A phone as the artboard draws one: dark bezel, Night screen, notch, content in HTML. The three
// sizes are `.mock-phone-*` in globals.css. The owner chose drawn screens over app captures
// (decision 2026-09-10 §6).
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
