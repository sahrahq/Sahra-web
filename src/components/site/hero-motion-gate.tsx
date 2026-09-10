'use client';

// The hero's motion, behind the shared gate (motion-gate.tsx). `next/dynamic`
// with ssr:false is what makes hero-motion.tsx — and GSAP — a separate chunk.
import dynamic from 'next/dynamic';
import { MotionGate } from '@/components/site/motion-gate';

const LazyHeroMotion = dynamic(() => import('./hero-motion').then((m) => m.HeroMotionImpl), { ssr: false });

export function HeroMotion() {
  return <MotionGate Motion={LazyHeroMotion} />;
}
