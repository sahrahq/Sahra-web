// LOOK at the built site. Rule 1 for a website: ask the browser, not the JSX.
//
//   pnpm build && node tools/snap.ts [--out .snaps] [--routes /,/ar] [--reduced-motion] [--open-menu] [--settle 3500] [--widths 1280,1440,380] [--scroll] [--sections]
//
// Serves out/ on a local port, opens each route in headless Chromium at a
// desktop width and at 380 px, and writes PNGs named <route>--<width>.png.
// Every "done" claim about a section in Phase 2 comes with these, in both
// languages. The folder is gitignored; the pictures are for the report, the
// committed evidence is the Playwright test suite.
import { chromium } from '@playwright/test';
import { existsSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { createStaticServer, listen } from './serve-out.ts';

const args = process.argv.slice(2);
const flag = (name: string, fallback: string) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};
const outDir = resolve(flag('--out', '.snaps'));
const routes = flag('--routes', '/,/ar').split(',');
const reducedMotion = args.includes('--reduced-motion');
const openMenu = args.includes('--open-menu');
// --scroll: walk the page to the bottom and back first, so scroll-triggered
// reveals have run and the full-page frame shows the page as a reader leaves it.
const scroll = args.includes('--scroll');
// --sections: one PNG per <main> section and the footer, named <base>--<id>.png.
const sections = args.includes('--sections');
// --settle <ms>: wait after load, so a frame shows the RESTING state after the
// editorial motion has finished rather than a moment inside it.
const settle = Number(flag('--settle', '0'));
const site = resolve('out');
if (!existsSync(join(site, 'index.html'))) {
  console.error('out/index.html not found — run `pnpm build` first');
  process.exit(1);
}

const server = createStaticServer(site);
const port = await listen(server);
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
try {
  for (const width of flag('--widths', '1280,380').split(',').map(Number)) {
    const context = await browser.newContext({
      viewport: { width, height: width === 380 ? 760 : width === 1440 ? 900 : 800 },
      deviceScaleFactor: 1,
      reducedMotion: reducedMotion ? 'reduce' : 'no-preference',
    });
    const page = await context.newPage();
    for (const route of routes) {
      await page.goto(`http://127.0.0.1:${port}${route}`, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      if (scroll) {
        const total = await page.evaluate(() => document.documentElement.scrollHeight);
        for (let y = 0; y < total; y += 400) {
          await page.evaluate((top) => window.scrollTo(0, top), y);
          await page.waitForTimeout(80);
        }
        await page.evaluate(() => window.scrollTo(0, 0));
      }
      if (settle > 0) await page.waitForTimeout(settle);
      const suffix = `${reducedMotion ? '--reduced' : ''}`;
      const base = `${route === '/' ? 'root' : route.replace(/^\//, '').replace(/\//g, '_')}--${width}`;
      await page.screenshot({ path: join(outDir, `${base}${suffix}.png`), fullPage: true });
      console.log(join(outDir, `${base}${suffix}.png`));
      if (sections) {
        for (const el of await page.locator('main > section, footer').all()) {
          const id = (await el.getAttribute('id')) ?? (await el.evaluate((n) => n.tagName.toLowerCase()));
          await el.scrollIntoViewIfNeeded();
          await page.waitForTimeout(900);
          await el.screenshot({ path: join(outDir, `${base}--${id}${suffix}.png`) });
          console.log(join(outDir, `${base}--${id}${suffix}.png`));
        }
      }
      if (openMenu && width === 380) {
        // The mobile disclosure, opened by clicking what is on screen.
        await page.getByRole('button', { expanded: false }).first().click();
        await page.screenshot({ path: join(outDir, `${base}--menu${suffix}.png`), fullPage: false });
        console.log(join(outDir, `${base}--menu${suffix}.png`));
      }
    }
    await context.close();
  }
} finally {
  await browser.close();
  server.close();
}
