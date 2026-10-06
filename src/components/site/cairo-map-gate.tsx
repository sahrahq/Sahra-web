'use client';

// Leaflet as a lazy chunk, outside first-load JS (tools/bundle-size.ts); `ssr: false` because it
// touches `window` at import. Not behind MotionGate: only the pins' pulse moves, and the
// reduced-motion rule in globals.css stills it, so every reader gets the map.
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
