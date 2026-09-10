// next/image loader for a static export.
//
// There is no image server in `output: 'export'`, so every picture on the site
// is a file in public/. Two kinds:
//   - a plain file (`/brand/logo.png`, `/shots/en/day/book.png`): returned as is,
//     at any requested width — one file, no variants;
//   - a RESPONSIVE SET, addressed by a base path with no extension
//     (`/hero/hero-en`): the loader returns `<base>-<width>.webp` for the widths
//     in next.config.ts `images.deviceSizes`, which are exactly the files
//     tools/hero-image.ts writes. next/image then emits a srcset and, with
//     `priority`, a <link rel="preload" imagesrcset> for the hero.
export default function loader({ src, width }: { src: string; width: number; quality?: number }): string {
  if (/\.[a-z0-9]+$/i.test(src)) return src;
  return `${src}-${width}.webp`;
}
