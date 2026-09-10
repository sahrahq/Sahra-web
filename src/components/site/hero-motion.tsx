'use client';

// The hero's motion — the FIRST editorial-tier code on the site (decision
// 2026-09-10 §5). Loaded lazily by hero-motion-gate.tsx, never on the
// first-load path, never for a reduced-motion reader.
//
//   - headline: SplitText, WORDS not characters — splitting Arabic into
//     characters breaks its joining; words are safe in both scripts and read
//     better in Latin too. No mask: see the note at the split.
//   - supporting line and CTAs follow, staggered.
//   - the phone rises in with them; it does NOT float or drift once settled.
//     An earlier version bobbed it up and down forever and drifted it on
//     scroll — on a hand-drawn artboard phone, cropped by the band's edge, a
//     phone that never stops moving reads as a glitch, not as life (found
//     2026-09-10). It gets one entrance, then holds still.
//
// gsap.matchMedia() still owns every tween even though the gate already
// checked the preference: if the reader turns reduced motion on mid-page,
// GSAP reverts everything to the resting state on its own.
//
// It marks the section `data-motion="on"` once the timelines exist, which is
// how tests/hero.spec.ts distinguishes "motion happened and finished" from
// "motion never loaded" — both end with every word at opacity 1.
//
// Known cost: the static HTML paints the headline before this runs, then
// SplitText hides and reveals it. A brief re-reveal on a slow connection, not
// a missing headline.
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP, SplitText);

export function HeroMotionImpl() {
  useGSAP(() => {
    const section = document.getElementById('hero');
    if (!section) return;
    const headline = section.querySelector<HTMLElement>('[data-hero-headline]');
    const phone = section.querySelector<HTMLElement>('[data-hero-phone]');
    const follow = section.querySelectorAll<HTMLElement>('[data-hero-follow]');
    if (!headline || !phone) return;

    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      // NO MASK. `mask: 'words'` wraps each word in an overflow-clipped box the
      // exact height of the line, and Reem Kufi's tall forms and Newsreader's
      // descenders both reach past that box — measured 2026-09-10: the resting
      // headline was clipped in Arabic at 1280 and in English at 380. The words
      // rise and fade in instead; nothing is ever clipped in either script.
      const split = SplitText.create(headline, {
        type: 'words',
        autoSplit: true,
        onSplit: (self) =>
          gsap.from(self.words, { y: 28, autoAlpha: 0, duration: 0.8, ease: 'power3.out', stagger: 0.07 }),
      });
      gsap.from(follow, {
        y: 16,
        autoAlpha: 0,
        duration: 0.6,
        ease: 'power2.out',
        stagger: 0.1,
        delay: 0.45,
      });
      const rise = gsap.from(phone, { y: 24, autoAlpha: 0, duration: 0.7, ease: 'power2.out', delay: 0.3 });
      section.dataset.motion = 'on';
      return () => {
        split.revert();
        rise.kill();
        delete section.dataset.motion;
      };
    });
    return () => mm.revert();
  });
  return null;
}
