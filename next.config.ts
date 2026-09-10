import type { NextConfig } from 'next';

// A static site. `output: 'export'` writes plain HTML per route into out/ —
// no server, nothing to fall over at 8pm on a Thursday (decision 2026-09-10 §3).
//
// Images: no optimiser in a static export, so src/image-loader.ts maps a
// responsive base path to the pre-generated WebP widths below (the hero) and
// passes plain files through unchanged (logos, app captures). deviceSizes is
// the ONE list of widths; tools/hero-image.ts writes exactly these.
const nextConfig: NextConfig = {
  output: 'export',
  reactStrictMode: true,
  images: {
    loader: 'custom',
    loaderFile: './src/image-loader.ts',
    deviceSizes: [480, 800, 1200, 1600],
    imageSizes: [72, 144],
  },
};

export default nextConfig;
