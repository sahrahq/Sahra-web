'use client';

// The scroll reveals, behind the shared gate (motion-gate.tsx), as a lazy chunk.
import dynamic from 'next/dynamic';
import { MotionGate } from '@/components/site/motion-gate';

const LazyRevealMotion = dynamic(() => import('./reveal-motion').then((m) => m.RevealMotionImpl), {
  ssr: false,
});

export function RevealMotion() {
  return <MotionGate Motion={LazyRevealMotion} />;
}
