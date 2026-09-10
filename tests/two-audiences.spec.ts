// §3 — two audiences as two cards, cream and Night, in both locales.
//
// The section's claim is visual: the two cards are DIFFERENT WORLDS. So the
// test reads painted colours rather than class names — it asserts the two
// backgrounds differ, that the Night card really is the night token, and that
// its text clears AA against it, computed in the browser from the painted
// values. A `theme-night` class that stopped resolving would still be in the
// markup; it would not survive this.
import { expect, test } from '@playwright/test';
import ar from '../messages/ar.json' with { type: 'json' };
import en from '../messages/en.json' with { type: 'json' };
import { contrast } from './helpers/contrast';

const LOCALES = [
  { locale: 'en', path: '/', m: en },
  { locale: 'ar', path: '/ar', m: ar },
] as const;

for (const { locale, path, m } of LOCALES) {
  test.describe(`two audiences [${locale}]`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(path);
      // Both halves carry `[data-reveal]` (GSAP autoAlpha: hidden until their
      // OWN ScrollTrigger crosses 88% of the viewport). The two halves are not
      // the same height in every language, so scrolling only the section's TOP
      // into view can leave the taller one's trigger point below the fold —
      // its heading then reads as `visibility:hidden`, invisible to
      // `getByRole` and to elementsFromPoint alike (found 2026-09-10, EN
      // phone: the restaurants half is taller there than in Arabic). Scrolling
      // to the restaurants half itself crosses both.
      await page.locator('#diners [data-audience="restaurants"]').scrollIntoViewIfNeeded();
      // Both halves are one staggered reveal group; let it finish (0.7s tween,
      // 0.1s stagger) before any test reads geometry or paint — mid-tween a
      // card is still offset by its own translateY (seen 2026-09-10, a 19px
      // gap between two halves that share a CSS grid row).
      await page.waitForTimeout(1000);
    });

    test('two cards, each with an overline, heading, line and one action; three captioned photos; two rows', async ({
      page,
    }) => {
      const section = page.locator('#diners');
      await expect(section).toHaveAttribute('aria-label', m.audiences.label);

      const diners = section.locator('[data-audience="diners"]');
      await expect(diners.getByText(m.audiences.diners.overline)).toBeVisible();
      await expect(diners.getByRole('heading', { level: 2, name: m.audiences.diners.title })).toBeVisible();
      await expect(diners.getByText(m.audiences.diners.line)).toBeVisible();
      await expect(diners.getByRole('link', { name: m.audiences.diners.cta })).toHaveAttribute(
        'href',
        `${path}#get-the-app`,
      );
      for (const caption of [
        m.audiences.diners.photo1,
        m.audiences.diners.photo2,
        m.audiences.diners.photo3,
      ]) {
        await expect(diners.getByText(caption, { exact: true })).toBeVisible();
      }
      const photos = diners.locator('img');
      await expect(photos).toHaveCount(3);
      for (const img of await photos.all()) {
        expect(await img.evaluate((el) => (el as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
      }

      const restaurants = section.locator('[data-audience="restaurants"]');
      await expect(
        restaurants.getByRole('heading', { level: 2, name: m.audiences.restaurants.title }),
      ).toBeVisible();
      await expect(restaurants.getByText(m.audiences.restaurants.line)).toBeVisible();
      await expect(restaurants.getByText(m.audiences.restaurants.row1Guest)).toBeVisible();
      await expect(restaurants.getByText(m.audiences.restaurants.row2Status)).toBeVisible();
      await expect(restaurants.getByRole('link', { name: m.audiences.restaurants.cta })).toHaveAttribute(
        'href',
        `${path}#restaurants`,
      );
      // Never "download": the restaurants app does not exist (decision §6).
      expect(m.audiences.restaurants.cta).not.toBe(m.nav.getApp);
    });

    test('the cards are two worlds: cream-card and Night, painted, not just classed', async ({ page }) => {
      const section = page.locator('#diners');
      const bg = (sel: string) =>
        section.locator(sel).evaluate((n) => getComputedStyle(n as HTMLElement).backgroundColor);
      const cream = await bg('[data-audience="diners"]');
      const night = await bg('[data-audience="restaurants"]');
      expect(cream, 'the two cards must not share a background').not.toBe(night);
      expect(night).toBe('rgb(26, 19, 16)');
      expect(cream).toBe('rgb(251, 246, 238)');
    });

    test('every text on the Night card clears AA against it', async ({ page }) => {
      const night = page.locator('#diners [data-audience="restaurants"]');
      expect(await contrast(night.getByRole('heading', { level: 2 })), 'heading').toBeGreaterThanOrEqual(4.5);
      expect(await contrast(night.getByText(m.audiences.restaurants.line)), 'line').toBeGreaterThanOrEqual(
        4.5,
      );
      expect(
        await contrast(night.getByText(m.audiences.restaurants.row1Status)),
        'the seated status in the night warning tone',
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        await contrast(night.getByRole('link', { name: m.audiences.restaurants.cta })),
        'the underlined action',
      ).toBeGreaterThanOrEqual(4.5);
    });

    test('side by side (7:5) on a desktop, stacked on a phone', async ({ page }, testInfo) => {
      const diners = page.locator('#diners [data-audience="diners"]');
      const restaurants = page.locator('#diners [data-audience="restaurants"]');
      const a = (await diners.boundingBox())!;
      const b = (await restaurants.boundingBox())!;
      if (testInfo.project.name === 'phone') {
        expect(b.y, 'the Night card follows the cream one').toBeGreaterThanOrEqual(a.y + a.height - 1);
        expect(b.height).toBeLessThan(testInfo.project.use.viewport!.height);
      } else {
        expect(Math.abs(a.y - b.y), 'the cards share a top edge').toBeLessThan(2);
        expect(Math.abs(a.height - b.height), 'the cards are the same height').toBeLessThan(2);
        expect(a.width, 'the diner card is the wider one').toBeGreaterThan(b.width);
        // In Arabic the diner card is the one on the right.
        if (locale === 'ar') expect(a.x).toBeGreaterThan(b.x);
        else expect(a.x).toBeLessThan(b.x);
      }
    });
  });
}
