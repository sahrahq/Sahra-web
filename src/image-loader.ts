// next/image loader for the static export, which has no image server. A path with an extension
// is returned as is; a base path (`/hero/hero-en`) becomes `<base>-<width>.webp`, one per
// next.config.ts `images.deviceSizes` width, so next/image can emit a srcset.
export default function loader({ src, width }: { src: string; width: number; quality?: number }): string {
  if (/\.[a-z0-9]+$/i.test(src)) return src;
  return `${src}-${width}.webp`;
}
