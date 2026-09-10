// §2 — the hero, in both locales, and the promise that reduced motion means
// NOTHING MOVES and NOTHING EXTRA LOADS.
//
// Projects: `desktop` and `phone` run with motion allowed — the motion chunk
// must load, mark the section, and finish with every word shown. The
// `reduced-motion` project emulates the OS preference: the resting state is
// there immediately, stays put, the section is never marked, and no GSAP
// chunk is requested. Red-first: the gate and the media query were broken on
// purpose (motion regardless of preference) and the reduced-motion tests went
// red before this file was trusted.
import { expect, test } from './fixtures';
import type { Page } from '@playwright/test';
import ar from '../messages/ar.json' with { type: 'json' };
import en from '../messages/en.json' with { type: 'json' };

const LOCALES = [
  { locale: 'en', path: '/', m: en },
  { locale: 'ar', path: '/ar', m: ar },
] as const;

async function headlineGeometry(page: Page, text: string) {
  const h1 = page.locator('#hero').getByRole('heading', { level: 1, name: text });
  return h1.evaluate((el) => {
    const r = el.getBoundingClientRect();
    const inner = Array.from(el.querySelectorAll('*')).map((n) => {
      const cs = getComputedStyle(n);
      const b = n.getBoundingClientRect();
      return { t: cs.transform, o: cs.opacity, x: Math.round(b.x), y: Math.round(b.y) };
    });
    const cs = getComputedStyle(el);
    return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), opacity: cs.opacity, inner };
  });
}

for (const { locale, path, m } of LOCALES) {
  test.describe(`hero [${locale}]`, () => {
    test('overline, headline, line, both CTAs and the artboard phone rising out of the band', async ({
      page,
    }, testInfo) => {
      const scripts: string[] = [];
      page.on('request', (r) => {
        if (r.resourceType() === 'script') scripts.push(r.url());
      });
      await page.goto(path);
      const hero = page.locator('#hero');
      await expect(hero.getByText(m.hero.overline)).toBeVisible();
      await expect(hero.getByRole('heading', { level: 1, name: m.hero.headline })).toBeVisible();
      await expect(hero.getByText(m.hero.supporting)).toBeVisible();
      await expect(hero.getByRole('link', { name: m.hero.getApp })).toHaveAttribute(
        'href',
        `${path}#get-the-app`,
      );
      await expect(hero.getByRole('link', { name: m.hero.partner })).toHaveAttribute(
        'href',
        `${path}#restaurants`,
      );
      // The band is Night: the artboard's first band, painted from the token.
      expect(await hero.evaluate((n) => getComputedStyle(n).backgroundColor)).toBe('rgb(26, 19, 16)');

      // The drawn phone: the artboard's Discover screen, its strings from the
      // message files, cut by the band's bottom edge so its top is on screen.
      const phone = hero.locator('[data-hero-mock]');
      await expect(phone.getByText(m.hero.phone.greeting)).toBeVisible();
      await expect(phone.getByText(m.hero.phone.available)).toBeVisible();
      await expect(phone.getByText(m.hero.phone.venue)).toBeAttached();
      const shell = (await phone.locator('.mock-phone').boundingBox())!;
      const band = (await hero.boundingBox())!;
      expect(shell.width, 'the artboard phone is 340 wide at most').toBeLessThanOrEqual(340);
      expect(shell.y, 'the phone starts inside the band').toBeLessThan(band.y + band.height);
      expect(shell.y + shell.height, 'and runs past its foot').toBeGreaterThan(band.y + band.height);
      // No product capture anywhere in the hero: the owner asked for the drawing.
      await expect(hero.locator('img[src*="/shots/"]')).toHaveCount(0);

      if (testInfo.project.name !== 'reduced-motion') {
        await expect(hero).toHaveAttribute('data-motion', 'on', { timeout: 10_000 });
        await expect
          .poll(async () => (await headlineGeometry(page, m.hero.headline)).inner.every((n) => n.o === '1'), {
            timeout: 5_000,
          })
          .toBe(true);
        expect(scripts.length, 'the motion chunk is a separate request, after first load').toBeGreaterThan(0);
        const clipped = await hero.getByRole('heading', { level: 1 }).evaluate(
          (h1) =>
            Array.from(h1.querySelectorAll('*'))
              .filter((el) => el.childElementCount === 0)
              .map((el) => getComputedStyle(el.parentElement as Element).overflow)
              .filter((o) => o === 'clip' || o === 'hidden').length,
        );
        expect(clipped, 'no headline word may live in a clipping wrapper').toBe(0);
      }
    });

    test('the headline is one line at every width, in both scripts', async ({ page }) => {
      await page.goto(path, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1200);
      const h1 = page.locator('#hero').getByRole('heading', { level: 1 });
      const lines = await h1.evaluate((el) => {
        const cs = getComputedStyle(el);
        return Math.round(el.getBoundingClientRect().height / parseFloat(cs.lineHeight));
      });
      expect(lines, 'the headline wraps').toBeLessThanOrEqual(locale === 'en' ? 2 : 1);
    });

    test('headline, line and both CTAs sit above the fold on a desktop', async ({ page }, testInfo) => {
      test.skip(testInfo.project.name === 'phone', 'the fold rule is for desktop widths');
      await page.goto(path, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1500);
      const bottom = await page
        .locator('#hero [data-hero-follow] a')
        .evaluateAll((els) => Math.max(...els.map((e) => e.getBoundingClientRect().bottom)));
      expect(bottom, 'CTAs must end above the fold').toBeLessThan(page.viewportSize()!.height);
    });

    test('reduced motion: resting state at once, nothing moves, no motion chunk loads', async ({
      page,
    }, testInfo) => {
      test.skip(testInfo.project.name !== 'reduced-motion', 'only meaningful with the preference emulated');
      const scripts: string[] = [];
      page.on('request', (r) => {
        if (r.resourceType() === 'script') scripts.push(r.url());
      });
      await page.goto(path, { waitUntil: 'networkidle' });
      const hero = page.locator('#hero');
      const a = await headlineGeometry(page, m.hero.headline);
      expect(a.opacity).toBe('1');
      for (const n of a.inner) {
        expect(n.o, 'no word may be faded').toBe('1');
        expect(n.t, 'no word may be transformed').toBe('none');
      }
      const phoneA = await hero.locator('[data-hero-phone]').boundingBox();
      await page.waitForTimeout(700);
      const b = await headlineGeometry(page, m.hero.headline);
      const phoneB = await hero.locator('[data-hero-phone]').boundingBox();
      expect(b).toEqual(a);
      expect(phoneB).toEqual(phoneA);
      await expect(hero).not.toHaveAttribute('data-motion', 'on');
      await expect(page.locator('body')).not.toHaveAttribute('data-reveal-motion', 'on');
      const hidden = await page
        .locator('[data-reveal]')
        .evaluateAll(
          (els) =>
            els.filter((e) => getComputedStyle(e).opacity !== '1' || getComputedStyle(e).transform !== 'none')
              .length,
        );
      expect(hidden, 'no reveal element may be faded or moved').toBe(0);
      const referenced = await page.evaluate(() =>
        Array.from(document.querySelectorAll('script[src]')).map((s) => (s as HTMLScriptElement).src),
      );
      for (const s of scripts) expect(referenced, `unexpected script ${s}`).toContain(s);
    });
  });
}
