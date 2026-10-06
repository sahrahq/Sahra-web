import type { NextConfig } from 'next';

// Plain HTML per route in out/, with no server to fall over (decision 2026-09-10 §3). A static
// export has no image optimiser, so src/image-loader.ts maps a base path to one WebP per
// deviceSizes width; keep them equal to WIDTHS in tools/hero-image.ts, which writes those files.
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
