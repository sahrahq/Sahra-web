'use client';

// The "SAHRA Cairo Map" export: Leaflet over OpenStreetMap tiles, retinted by `.map-tiles` in
// globals.css. Lazy and client-only (cairo-map-gate.tsx), over where.tsx's static panel, which
// stays for readers without JavaScript. Not interactive: it illustrates coverage, it is not a tool.
import { useEffect, useRef } from 'react';
import type { Locale } from '@/i18n/locales';
import type { Messages } from '@/i18n/messages';
import 'leaflet/dist/leaflet.css';

export interface CairoMapProps {
  locale: Locale;
  copy: Messages['where'];
}

const HOODS = [
  { key: 'zamalek', lat: 30.0609, lng: 31.2197 },
  { key: 'maadi', lat: 29.9602, lng: 31.2569 },
  { key: 'heliopolis', lat: 30.0871, lng: 31.3284 },
  { key: 'newCairo', lat: 30.03, lng: 31.47 },
  { key: 'sheikhZayed', lat: 30.04, lng: 30.98 },
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
        // OpenStreetMap's credit, a condition of using its tiles, is in the site footer
        // (`footer.mapCredit`) rather than a control on the map.
        attributionControl: false,
      });
      // The standard tiles label Cairo in Arabic in both locales; a label-free style needs a
      // provider key (decision 2026-09-10 §8).
      const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        className: 'map-tiles',
      });
      tiles.addTo(map);

      const points: [number, number][] = [];
      for (const h of HOODS) {
        const ll: [number, number] = [h.lat, h.lng];
        points.push(ll);
        const name = escapeHtml(copy[h.key]);
        const html = `<span class="map-pin"><span class="map-pin-dot"></span><span class="map-pin-ring"></span><span class="map-pin-ring"></span><span class="map-pin-label">${name}</span></span>`;
        L.marker(ll, {
          icon: L.divIcon({ html, className: '', iconSize: [14, 14], iconAnchor: [7, 7] }),
          interactive: false,
          keyboard: false,
        }).addTo(map);
      }

      const bounds = L.latLngBounds(points);
      const fit = () => {
        // From md the copy card covers the map's start side, so the fit is padded by the card's
        // measured width and no pin lands under it. Below md there is no card over the map and no
        // labels, and that padding would zoom the strip out until the five dots bunch together.
        const rtl = locale === 'ar';
        const wide = window.matchMedia('(min-width: 768px)').matches;
        const card = wide ? el.closest('section')?.querySelector('[data-map-reserve]') : null;
        let near = 36;
        if (wide) {
          const m = el.getBoundingClientRect();
          const c = card?.getBoundingClientRect();
          const covered = c ? (rtl ? m.right - c.left : c.right - m.left) : 0;
          near = Math.round(Math.max(covered, 0)) + 24;
        }
        // Labels open to the end side, so it needs a label's width or the outermost one is cut off.
        const far = wide ? 150 : 36;
        const vertical = wide ? 90 : 40;
        map!.fitBounds(bounds, {
          paddingTopLeft: [rtl ? far : near, vertical],
          paddingBottomRight: [rtl ? near : far, vertical],
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

  // No `dir` of its own: markers and tiles are placed by coordinate, and the inherited direction
  // opens each label towards the end side, away from the copy card at the start.
  return (
    <div ref={elRef} role="img" aria-label={copy.mapLabel} className="absolute inset-0 bg-surface-page" />
  );
}
