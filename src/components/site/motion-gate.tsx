'use client';

// The gate between a static section and its motion — ONE definition for every
// editorial-tier section (decision 2026-09-10 §5, rule 8).
//
// After hydration it asks the browser one question — does this reader prefer
// reduced motion? — and only if the answer is no does it render the lazily
// imported motion component, which is where GSAP lives. Two consequences, both
// measured in the tests:
//   - GSAP is a lazy chunk, not first-load JS (tools/bundle-size.ts);
//   - a reduced-motion reader downloads none of it and nothing moves; the
//     static HTML is the final state.
//
// The preference is re-checked if it changes while the page is open: switching
// it on unmounts the motion, whose own gsap.matchMedia reverts every tween.
import type { ComponentType } from 'react';
import { useEffect, useState } from 'react';

const REDUCE = '(prefers-reduced-motion: reduce)';

export function MotionGate({ Motion }: { Motion: ComponentType }) {
  const [allowed, setAllowed] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(REDUCE);
    const apply = () => setAllowed(!mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);
  return allowed ? <Motion /> : null;
}
