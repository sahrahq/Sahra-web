'use client';

// The real Cairo map — the owner's second Claude Design export ("SAHRA Cairo
// Map"), which the schematic panel in where.tsx stood in for until now. A
// live Leaflet map over real OpenStreetMap tiles, retinted into SAHRA Night
// by a CSS filter on the tile layer (globals.css `.map-tiles`), with the
// same five neighbourhoods pinned at their real coordinates and a pulsing
// terracotta dot for each — not schematic percentages on a drawn rectangle,
// an actual map of Cairo.
//
// LOADED LAZILY, CLIENT-ONLY (cairo-map-gate.tsx, next/dynamic ssr:false) —
// Leaflet is real weight (see decision 2026-09-10 §7) that no visitor should
// pay for before this section scrolls into view, and it touches `window` at
// import time, which a static export's build-time render cannot do. Until it
// mounts, where.tsx keeps rendering its own static schematic panel in the
// same space; this map replaces it, not the other way around, so a reader on
// a slow connection or with JavaScript off still sees a real (if simpler)
// picture of where SAHRA is.
//
// COUNTS ARE NOT LIVE DATA. The five figures below (14, 9, 11…) are the
// design's own — nothing today counts "venues live in Zamalek" anywhere in
// the product, so these are placeholder figures on a placeholder feature,
// carried the same way the venues band's borrowed names are: kept because the
// owner asked for the design as drawn, flagged rather than hidden (decision
// §8 — replace with a real count, or drop the count, before this is public).
//
// NOT INTERACTIVE, ON PURPOSE. Panning, scroll-zoom and touch-zoom are all
// off (matching the design): this is a picture that happens to be a real map,
// not a tool for finding an address.
import { useEffect, useRef } from 'react';
import type { Locale } from '@/i18n/locales';
import type { Messages } from '@/i18n/messages';
import 'leaflet/dist/leaflet.css';

export interface CairoMapProps {
  locale: Locale;
  copy: Messages['where'];
}

const HOODS = [
  { key: 'zamalek', lat: 30.0609, lng: 31.2197, count: 14 },
  { key: 'maadi', lat: 29.9602, lng: 31.2569, count: 9 },
  { key: 'heliopolis', lat: 30.0871, lng: 31.3284, count: 11 },
  { key: 'newCairo', lat: 30.03, lng: 31.47, count: 16 },
  { key: 'sheikhZayed', lat: 30.04, lng: 30.98, count: 7 },
] as const;

/** Escapes the handful of characters that matter inside a divIcon's HTML string. */
function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function CairoMap({ locale, copy }: CairoMapProps) {
  const elRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    let cancelled = false;
    let map: import('leaflet').Map | undefined;

    void import('leaflet').then((L) => {
      if (cancelled || !el) return;
      map = L.map(el, {
        zoomControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        boxZoom: false,
        keyboard: false,
        touchZoom: false,
        attributionControl: true,
      });
      const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
        className: 'map-tiles',
      });
      tiles.addTo(map);

      const points: [number, number][] = [];
      for (const h of HOODS) {
        const ll: [number, number] = [h.lat, h.lng];
        points.push(ll);
        const name = escapeHtml(copy[h.key]);
        const count = `${h.count} ${escapeHtml(copy.venuesCount)}`;
        const html = `<span class="map-pin"><span class="map-pin-dot"></span><span class="map-pin-ring"></span><span class="map-pin-ring"></span><span class="map-pin-label">${name}<small>${count}</small></span></span>`;
        L.marker(ll, {
          icon: L.divIcon({ html, className: '', iconSize: [14, 14], iconAnchor: [7, 7] }),
          interactive: false,
          keyboard: false,
        }).addTo(map);
      }

      const bounds = L.latLngBounds(points);
      const fit = () => {
        // The label reads to the END of its pin in both directions (logical,
        // like the rest of the site) — so the fit padding gives the map more
        // room on whichever side the labels actually extend into, RTL or LTR.
        // Below md there are no labels (globals.css hides `.map-pin-label`;
        // map-legend.tsx lists the names instead), and keeping their room
        // there zoomed a 330px-wide panel out to the whole Delta-to-Suez
        // region with the five dots bunched in its middle (seen 2026-09-11 at
        // 380). Only the dot and its pulse rings need clearing then.
        const rtl = locale === 'ar';
        const labels = window.matchMedia('(min-width: 768px)').matches;
        map!.fitBounds(bounds, {
          paddingTopLeft: [labels ? (rtl ? 60 : 140) : 36, labels ? 50 : 40],
          paddingBottomRight: [labels ? (rtl ? 140 : 60) : 36, labels ? 50 : 40],
        });
      };
      fit();
      const onResize = () => fit();
      window.addEventListener('resize', onResize);
      map.once('remove', () => window.removeEventListener('resize', onResize));
    });

    return () => {
      cancelled = true;
      map?.remove();
    };
    // Rebuilding on locale change re-fits the padding for the new label side.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);

  return (
    <div
      ref={elRef}
      role="img"
      aria-label={copy.mapLabel}
      dir="ltr" // Cairo's geography does not mirror; only the labels' own script does.
      className="absolute inset-0 bg-surface-page"
    />
  );
}
