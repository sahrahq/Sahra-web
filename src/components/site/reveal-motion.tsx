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

/** How far, in px, an element rises as it reveals. */
const RISE = 24;

export function RevealMotionImpl() {
  useGSAP(() => {
    const items = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    if (items.length === 0) return;

    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      // This chunk arrives after first paint, so the reader may already be
      // partway down the page when it runs. Once they have scrolled, anything
      // inside the viewport is content they are looking at, and hiding it to
      // replay its entrance takes it away from them — a card on the phone
      // vanished and stayed gone until the next scroll (found 2026-09-11).
      // Those stay as they are; only what is still below the fold gets an
      // entrance. At the top of the page nothing has been read yet, so what
      // peeks in above the fold there (the two audience cards at 1440×900)
      // keeps its entrance, as it always had.
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
      // A from() tween renders its start state the moment it is created, and
      // ScrollTrigger measures the element as it then stands — RISE px lower
      // than the layout puts it — both when the trigger is made and on every
      // refresh() after it; nothing reverts the offset before measuring (found
      // 2026-09-11; without the correction below every line sat at ~85% of the
      // viewport instead of the 88% the design gives, and the fifth "what you
      // get" card, scrolled to 86.5%, stayed hidden). An un-revealed element is
      // always offset by exactly RISE, and a revealed one's trigger is already
      // gone (`once`), so subtracting RISE from the measured edge gives the
      // layout edge every time.
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
