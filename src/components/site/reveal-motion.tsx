'use client';

// The page's scroll reveals — the second editorial-tier module (decision
// 2026-09-10 §5), loaded lazily by reveal-motion-gate.tsx, never on the
// first-load path, never for a reduced-motion reader.
//
// Every `[data-reveal]` element below the hero rises 24 px and fades in as it
// enters the viewport (ScrollTrigger, once). Cards in the same grid arrive
// together: elements whose top edges are within a few pixels of each other
// share one stagger, so a row of three phones is one gesture, not three.
//
// gsap.matchMedia() owns every tween: if the reader turns reduced motion on
// mid-page, everything reverts to the resting state, which is the static HTML.
// The body is marked `data-reveal-motion="on"` so a test can tell "the module
// ran" from "the module never loaded".
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function RevealMotionImpl() {
  useGSAP(() => {
    const items = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    if (items.length === 0) return;

    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      // Group by top edge so a grid row reveals as one staggered gesture.
      const rows = new Map<number, HTMLElement[]>();
      for (const el of items) {
        const top = Math.round((el.getBoundingClientRect().top + window.scrollY) / 8) * 8;
        const row = rows.get(top) ?? [];
        row.push(el);
        rows.set(top, row);
      }
      const tweens = Array.from(rows.values()).map((row) =>
        gsap.from(row, {
          y: 24,
          autoAlpha: 0,
          duration: 0.7,
          ease: 'power2.out',
          stagger: 0.08,
          scrollTrigger: { trigger: row[0], start: 'top 88%', once: true },
        }),
      );
      document.body.dataset.revealMotion = 'on';
      return () => {
        tweens.forEach((t) => {
          t.scrollTrigger?.kill();
          t.kill();
        });
        gsap.set(items, { clearProps: 'all' });
        delete document.body.dataset.revealMotion;
      };
    });
    return () => mm.revert();
  });
  return null;
}
