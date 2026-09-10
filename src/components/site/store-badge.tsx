// The store badges, as the artboard draws them: monochrome ink glyphs on cream
// in the closer (two lines: "Download on the / App Store", "Get it on / Google
// Play"), outlined and compact on Night in the footer. In palette on purpose,
// per the artboard's note, to be swapped for the official badge assets when the
// listings exist.
//
// THE PLAY GLYPH IS NOT THE ARTBOARD'S. Its path is the official four-piece
// Google Play mark, built to be filled in four different colours; filled as
// one solid colour the seams between the pieces show as a stray mark in the
// middle (seen 2026-09-10). This is a single closed triangle instead — same
// "play" meaning, no seam, and correct for a one-colour glyph.
//
// NOT LINKS YET. There is no listing on either store (decision 2026-09-10 §8),
// so the badge is a plain element — `href="#"` is a link to nothing and
// tests/anchors.spec.ts refuses it. Both badges are shown because the owner
// asked for the artboard as drawn (2026-09-10: "where is the App Store, like
// these"); the store URLs are theirs to supply.
import type { Messages } from '@/i18n/messages';

export type Store = 'apple' | 'play';

const APPLE_GLYPH =
  'M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.12 0-.23-.02-.3-.03-.01-.06-.04-.22-.04-.39 0-1.15.572-2.27 1.206-2.98.804-.94 2.142-1.64 3.248-1.68.03.13.05.28.05.43zm4.565 15.71c-.03.07-.463 1.58-1.518 3.12-.945 1.34-1.94 2.71-3.43 2.71-1.517 0-1.9-.88-3.63-.88-1.698 0-2.302.91-3.67.91-1.377 0-2.332-1.26-3.428-2.8-1.287-1.82-2.323-4.63-2.323-7.28 0-4.28 2.797-6.55 5.552-6.55 1.448 0 2.675.95 3.6.95.865 0 2.222-1.01 3.902-1.01.613 0 2.886.06 4.374 2.19-.13.09-2.383 1.37-2.383 4.19 0 3.26 2.854 4.42 2.955 4.45z';

/** A plain rounded triangle. One shape, no seams to show when filled flat. */
const PLAY_GLYPH =
  'M6.5 3.6c0-.94 1.02-1.52 1.83-1.04l12.5 7.4c.8.47.8 1.62 0 2.09l-12.5 7.4c-.81.48-1.83-.1-1.83-1.04V3.6Z';

export interface StoreBadgeProps {
  copy: Messages['close'];
  store: Store;
  variant: 'filled' | 'outline';
}

export function StoreBadge({ copy, store, variant }: StoreBadgeProps) {
  const top = store === 'apple' ? copy.appStoreTop : copy.playTop;
  const name = store === 'apple' ? copy.appStoreName : copy.playName;
  const glyph = store === 'apple' ? APPLE_GLYPH : PLAY_GLYPH;
  if (variant === 'outline') {
    return (
      <div
        data-store-badge={store}
        className="inline-flex items-center gap-2 rounded-md border border-line px-3 py-2 text-body-s font-semibold whitespace-nowrap text-body"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d={glyph} />
        </svg>
        {name}
      </div>
    );
  }
  return (
    <div
      data-store-badge={store}
      className="inline-flex items-center gap-3 rounded-md bg-night-text px-4 py-2 text-start text-ink"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d={glyph} />
      </svg>
      <span className="flex flex-col leading-tight">
        <span className="text-caption font-medium text-ink-soft">{top}</span>
        <span className="text-body-l font-semibold">{name}</span>
      </span>
    </div>
  );
}
