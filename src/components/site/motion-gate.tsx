'use client';

// The one gate for editorial-tier motion (decision 2026-09-10 §5): after hydration it renders the
// lazy motion component only if the reader does not prefer reduced motion, so that reader
// downloads no GSAP. Turning the preference on mid-page unmounts it; its gsap.matchMedia reverts.
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
