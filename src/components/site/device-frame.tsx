// A vector phone frame for a 2× capture from tools/shots.ts, laid out at its logical size (not the
// file's) so it is 1:1 on a 2× display and never upscaled. Unused, as the landing draws its
// phones (phone-shell.tsx); kept for a return to captures (decision 2026-09-10 §6).
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
