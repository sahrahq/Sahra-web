// A phone, drawn in the design system's hand — the vector frame every real
// capture on this site sits in (decision 2026-09-10 §6, "the method").
//
// Night surface for the body, a hairline highlight in the night border token,
// `radius-xl` outside, `radius-lg` inside (the app's own corner), the bezel one
// spacing step wide. No camera, no buttons, no reflections: nothing that
// pretends to be a specific device. The capture inside is a real frame from
// apps/customer_app rendered at 2× (tools/shots.ts), laid at its logical size so
// it is 1:1 on a 2× display and downscaled — never upscaled — on a 1× one.
//
// The frame is a plain element, so it stays crisp at any density and any width;
// the capture's `width`/`height` are its LOGICAL pixels (390 × the captured
// height), never the 2× file's.
import Image from 'next/image';

export interface DeviceFrameProps {
  /** Path under public/, e.g. `/shots/en/day/book.png` (a 2× capture). */
  src: string;
  alt: string;
  /** Logical size of the captured screen. */
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
}

export function DeviceFrame({
  src,
  alt,
  width = 390,
  height = 640,
  priority = false,
  className,
}: DeviceFrameProps) {
  return (
    <div className={`rounded-xl border border-night-border bg-night p-2 shadow-3 ${className ?? ''}`}>
      <div className="overflow-hidden rounded-lg">
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          priority={priority}
          className="block h-auto w-full"
        />
      </div>
    </div>
  );
}
