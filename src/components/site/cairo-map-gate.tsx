'use client';

// The real Cairo map, loaded as a lazy chunk — Leaflet is not part of the
// first-load bundle (tools/bundle-size.ts), and it touches `window` at import
// time, which next/dynamic's `ssr: false` is what guarantees never happens
// during the static build. Not gated on motion preference like hero-motion.tsx
// and reveal-motion.tsx: the map itself is not motion (only its pins' pulse
// is, and that is already silenced by the blanket reduced-motion rule in
// globals.css), so every reader gets the real map, moving or still.
import dynamic from 'next/dynamic';
import type { Locale } from '@/i18n/locales';
import type { Messages } from '@/i18n/messages';

const LazyCairoMap = dynamic(() => import('./cairo-map').then((m) => m.CairoMap), { ssr: false });

export interface CairoMapGateProps {
  locale: Locale;
  copy: Messages['where'];
}

export function CairoMapGate({ locale, copy }: CairoMapGateProps) {
  return <LazyCairoMap locale={locale} copy={copy} />;
}
