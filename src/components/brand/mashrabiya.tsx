// Mashrabiya — the traditional Cairo carved-wood screen, abstracted to an
// eight-point-star lattice. Ported from docs/design/components/brand/Mashrabiya.jsx.
// SAHRA's signature texture: backdrops, dividers, empty states. Distinctly
// Cairene, not a generic 'Arabic pattern'. Tiles seamlessly.
//
// One deliberate difference from the reference: the reference takes a colour
// STRING and bakes it into a data-URL background, which needs a literal
// (`rgba(221,95,53,0.5)` in its default). Here the lattice is an inline SVG
// <pattern> stroked with `currentColor`, so the colour comes from a token
// utility on the element — `<Mashrabiya className="text-accent" />` — and no
// file on this site spells a colour. Same drawing, same 44px tile.
//
// FADES. The landing's artboard masks the lattice three ways: strongest at the
// top centre (the hero), at the bottom centre (the restaurants and get-the-app
// bands), or rising from the bottom edge (the restaurant card). `fade` names
// them; `true` keeps the reference's own top fade.
import type { CSSProperties } from 'react';
import { useId } from 'react';

export type MashrabiyaFade = boolean | 'top' | 'bottom' | 'rise';

export interface MashrabiyaProps {
  /** 0–1. The reference uses 0.03–0.08 on surfaces. */
  opacity?: number;
  /** Tile size in px. 44 is the drawing's native size. */
  tile?: number;
  /** Where the lattice is strongest; see the note above. */
  fade?: MashrabiyaFade;
  /** Token colour utility, e.g. `text-accent` or `text-body`. */
  className?: string;
  style?: CSSProperties;
}

const MASKS: Record<'top' | 'bottom' | 'rise', string> = {
  top: 'radial-gradient(90% 70% at 50% 0%, black, transparent 80%)',
  bottom: 'radial-gradient(70% 60% at 50% 100%, black, transparent 80%)',
  rise: 'linear-gradient(to top, black, transparent 70%)',
};

function maskFor(fade: MashrabiyaFade): CSSProperties {
  if (fade === false) return {};
  const mask = MASKS[fade === true ? 'top' : fade];
  return { WebkitMaskImage: mask, maskImage: mask };
}

export function Mashrabiya({ opacity = 1, tile = 44, fade = false, className, style }: MashrabiyaProps) {
  const id = useId();
  return (
    <svg
      aria-hidden="true"
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        opacity,
        pointerEvents: 'none',
        ...maskFor(fade),
        ...style,
      }}
    >
      <defs>
        <pattern id={id} width={tile} height={tile} patternUnits="userSpaceOnUse" viewBox="0 0 44 44">
          <g fill="none" stroke="currentColor" strokeWidth={1}>
            <path d="M22 2 L42 22 L22 42 L2 22 Z" />
            <path d="M8 8 H36 V36 H8 Z" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}
