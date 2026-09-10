// Composite a genuine app capture into the hero photograph's blank screen, and
// export the responsive WebP set the hero serves.
//
//   pnpm hero:image            # writes public/hero/hero-<locale>-<width>.webp
//
// Inputs:  assets/hero/source.png  (AI-generated scene, blank black screen —
//                                   see assets/hero/README.md)
//          public/shots/<locale>/day/book.png  (captured from the app)
// Outputs: public/hero/hero-{en,ar}-{480,800,1200,1600}.webp
//
// TECHNIQUE. Runs in the Chromium that Playwright already installs, on a
// <canvas> — no image library is added to the workspace.
//   1. The screen is FOUND, not hard-coded: the bounding box of the near-black
//      region in the middle third of the frame. If the owner regenerates the
//      scene, the box moves with it.
//   2. The capture is painted ONLY WHERE THE GLASS IS BLACK. The first version
//      clipped to the bounding rectangle and painted over the fingertips that
//      wrap onto the screen, slicing the hand and leaving no bezel around the
//      capture — a rectangle on a photo (seen 2026-09-10). Now a per-pixel mask
//      is built from the source: black glass → opaque, anything else (skin,
//      bezel, reflections) → transparent, with a short luminance ramp so the
//      edge is anti-aliased. The capture is drawn into an offscreen layer,
//      intersected with that mask (destination-in), then laid over the photo.
//      The hand stays in front because it was never black; the photo itself is
//      not edited.
//   3. Inside the box the capture is FIT BY HEIGHT: the photographed screen is
//      squatter (0.54) than the app's frame (0.46), so cover-fitting cropped
//      the title bar and the confirm button. Fitting by height loses nothing;
//      the side bands are filled with the app's page surface (a token — the
//      capture's own background), so they vanish.
//   4. Exported at four widths as WebP (quality 0.82) so the hero can serve
//      the smallest file that fills the viewport; each file's bytes are
//      printed, because an image this size can undo what lazy GSAP saved.
import { chromium } from '@playwright/test';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tokens } from '../src/styles/tokens.ts';

const here = dirname(fileURLToPath(import.meta.url));
const web = resolve(here, '..');
const source = join(web, 'assets', 'hero', 'source.png');
const outDir = join(web, 'public', 'hero');
const WIDTHS = [480, 800, 1200, 1600];
const LOCALES = ['en', 'ar'] as const;
const QUALITY = 0.82;
// Luminance (0–255) below which a source pixel counts as screen glass, and the
// width of the ramp above it over which the mask fades out (anti-aliasing).
const GLASS_MAX = 26;
const GLASS_RAMP = 14;

const dataUrl = (path: string) => `data:image/png;base64,${readFileSync(path).toString('base64')}`;

mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  await page.setContent('<!doctype html><html><body></body></html>');

  // 1: find the screen box, once, from the source.
  const screen = await page.evaluate(
    async ({ src, glassMax }) => {
      const img = new Image();
      img.src = src;
      await img.decode();
      const c = document.createElement('canvas');
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      const ctx = c.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      const { data } = ctx.getImageData(0, 0, c.width, c.height);
      const W = c.width;
      const lum = (x: number, y: number) => {
        const i = (y * W + x) * 4;
        return 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
      };
      const x0 = Math.floor(W / 3);
      const x1 = Math.floor((W * 2) / 3);
      let minX = W,
        maxX = -1,
        minY = c.height,
        maxY = -1,
        count = 0;
      for (let y = 0; y < c.height; y++) {
        for (let x = x0; x < x1; x++) {
          if (lum(x, y) < glassMax) {
            count++;
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }
      return {
        x: minX,
        y: minY,
        width: maxX - minX + 1,
        height: maxY - minY + 1,
        count,
        imageWidth: W,
        imageHeight: c.height,
      };
    },
    { src: dataUrl(source), glassMax: GLASS_MAX },
  );
  const fill = screen.count / (screen.width * screen.height);
  console.log(
    `screen box x=${screen.x} y=${screen.y} ${screen.width}×${screen.height} in ${screen.imageWidth}×${screen.imageHeight}; ${(fill * 100).toFixed(1)}% of the box is glass — the rest (hand, bezel) stays in front`,
  );
  if (screen.width < 200 || screen.height < 400 || screen.height / screen.width < 1.6 || fill < 0.8) {
    throw new Error(
      'the detected screen does not look like an upright, mostly visible phone — check assets/hero/source.png',
    );
  }

  // 2 + 3 + 4: composite per locale through the glass mask, export per width.
  const rows: [string, number][] = [];
  for (const locale of LOCALES) {
    const shot = join(web, 'public', 'shots', locale, 'day', 'book.png');
    for (const width of WIDTHS) {
      const b64 = await page.evaluate(
        async ({ bg, fg, s, width, quality, surface, glassMax, glassRamp }) => {
          const load = async (src: string) => {
            const i = new Image();
            i.src = src;
            await i.decode();
            return i;
          };
          const [bgImg, fgImg] = await Promise.all([load(bg), load(fg)]);
          const scale = width / bgImg.naturalWidth;
          const W = width;
          const H = Math.round(bgImg.naturalHeight * scale);

          // The photo, scaled.
          const out = document.createElement('canvas');
          out.width = W;
          out.height = H;
          const octx = out.getContext('2d')!;
          octx.imageSmoothingQuality = 'high';
          octx.drawImage(bgImg, 0, 0, W, H);

          // The glass mask, from the scaled photo's own pixels: opaque where the
          // glass is black, transparent where the hand or bezel is.
          const maskData = octx.getImageData(0, 0, W, H);
          const m = maskData.data;
          const bx0 = Math.floor(s.x * scale);
          const by0 = Math.floor(s.y * scale);
          const bx1 = Math.ceil((s.x + s.width) * scale);
          const by1 = Math.ceil((s.y + s.height) * scale);
          for (let y = 0; y < H; y++) {
            for (let x = 0; x < W; x++) {
              const i = (y * W + x) * 4;
              let a = 0;
              if (x >= bx0 && x < bx1 && y >= by0 && y < by1) {
                const l = 0.2126 * m[i] + 0.7152 * m[i + 1] + 0.0722 * m[i + 2];
                a =
                  l <= glassMax
                    ? 255
                    : l >= glassMax + glassRamp
                      ? 0
                      : Math.round(255 * (1 - (l - glassMax) / glassRamp));
              }
              m[i] = 0;
              m[i + 1] = 0;
              m[i + 2] = 0;
              m[i + 3] = a;
            }
          }
          const mask = document.createElement('canvas');
          mask.width = W;
          mask.height = H;
          mask.getContext('2d')!.putImageData(maskData, 0, 0);

          // The capture, fit by height into the box, on the app's own page
          // surface, then intersected with the mask.
          const layer = document.createElement('canvas');
          layer.width = W;
          layer.height = H;
          const lctx = layer.getContext('2d')!;
          lctx.imageSmoothingQuality = 'high';
          const sx = s.x * scale;
          const sy = s.y * scale;
          const sw = s.width * scale;
          const sh = s.height * scale;
          lctx.fillStyle = surface;
          lctx.fillRect(sx, sy, sw, sh);
          const k = Math.min(sw / fgImg.naturalWidth, sh / fgImg.naturalHeight);
          const dw = fgImg.naturalWidth * k;
          const dh = fgImg.naturalHeight * k;
          lctx.drawImage(fgImg, sx + (sw - dw) / 2, sy + (sh - dh) / 2, dw, dh);
          lctx.globalCompositeOperation = 'destination-in';
          lctx.drawImage(mask, 0, 0);

          octx.drawImage(layer, 0, 0);
          return out.toDataURL('image/webp', quality).split(',')[1];
        },
        {
          bg: dataUrl(source),
          fg: dataUrl(shot),
          s: screen,
          width,
          quality: QUALITY,
          surface: tokens.root['surface-page'],
          glassMax: GLASS_MAX,
          glassRamp: GLASS_RAMP,
        },
      );
      const bytes = Buffer.from(b64, 'base64');
      const file = `hero-${locale}-${width}.webp`;
      writeFileSync(join(outDir, file), bytes);
      rows.push([file, bytes.length]);
    }
  }
  console.log('\nfile                        kB');
  for (const [f, n] of rows) console.log(`${f.padEnd(26)} ${(n / 1024).toFixed(1).padStart(6)}`);
} finally {
  await browser.close();
}
