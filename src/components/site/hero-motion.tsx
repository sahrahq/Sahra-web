'use client';

// Hero motion, loaded lazily by hero-motion-gate.tsx (decision 2026-09-10 §5). The headline splits
// into words, since characters break Arabic joining; the phone rises in once, then holds still.
// `data-motion="on"` lets tests/hero.spec.ts tell "finished" from "never loaded".
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
      // No `mask: 'words'`: its clip box is one line tall, and Reem Kufi's tall forms and
      // Newsreader's descenders reach past it. tests/hero.spec.ts fails on a clipping wrapper.
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
