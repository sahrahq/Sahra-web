'use client';

// Scroll reveals, loaded lazily by reveal-motion-gate.tsx (decision 2026-09-10 §5): each
// `[data-reveal]` rises and fades in once, and a row sharing a top edge shares one stagger.
// `data-reveal-motion="on"` on the body lets tests tell "ran" from "never loaded".
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/** How far, in px, an element rises as it reveals. */
const RISE = 24;

export function RevealMotionImpl() {
  useGSAP(() => {
    const items = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    if (items.length === 0) return;

    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      // The chunk can arrive after the reader has scrolled; then only what is below the fold gets
      // an entrance, as hiding what is in view takes it from them. At the top, all of it does.
      const fold = window.scrollY > 0 ? window.innerHeight : 0;
      const pending = items.filter((el) => el.getBoundingClientRect().top >= fold);
      // Group by top edge so a grid row reveals as one staggered gesture.
      const rows = new Map<number, HTMLElement[]>();
      for (const el of pending) {
        const top = Math.round((el.getBoundingClientRect().top + window.scrollY) / 8) * 8;
        const row = rows.get(top) ?? [];
        row.push(el);
        rows.set(top, row);
      }
      // from() renders its start state at once, so ScrollTrigger measures each element RISE px
      // below its layout position; `top-=${RISE}` puts the trigger back on the design's 88% line.
      const tweens = Array.from(rows.values()).map((row) =>
        gsap.from(row, {
          y: RISE,
          autoAlpha: 0,
          duration: 0.7,
          ease: 'power2.out',
          stagger: 0.08,
          scrollTrigger: { trigger: row[0], start: `top-=${RISE} 88%`, once: true },
        }),
      );
      document.body.dataset.revealMotion = 'on';
      return () => {
        tweens.forEach((t) => {
          t.scrollTrigger?.kill();
          t.kill();
        });
        gsap.set(pending, { clearProps: 'all' });
        delete document.body.dataset.revealMotion;
      };
    });
    return () => mm.revert();
  });
  return null;
}
