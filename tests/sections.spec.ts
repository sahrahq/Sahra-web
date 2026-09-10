// §5–§11 — what you get, venues, where, for restaurants, FAQ, get the app, the
// footer — in both locales, from the static export.
//
// Alongside "is it there", the pins that keep the page honest about what it
// is: the store badges are not links until the listings exist (never `#`), the
// drawn screens carry the message files' strings, every photo has pixels.
import { expect, test, type Locator } from '@playwright/test';
import ar from '../messages/ar.json' with { type: 'json' };
import en from '../messages/en.json' with { type: 'json' };
import { contrast } from './helpers/contrast';

const LOCALES = [
  { locale: 'en', path: '/', m: en },
  { locale: 'ar', path: '/ar', m: ar },
] as const;

/**
 * Every card, line and photo caption in these sections is `[data-reveal]`:
 * hidden (GSAP `autoAlpha`, which sets `visibility:hidden`, not just opacity)
 * until its OWN ScrollTrigger crosses 88% of the viewport. Scrolling only the
 * section's TOP into view does not guarantee its LOWEST reveal group has —
 * the venues cards' contrast measured 1.1 (white text on the section's own
 * cream, not the photo shade) because the heading was still `visibility:
 * hidden` when read, and `elementsFromPoint` cannot see a hidden element at
 * all (found 2026-09-10; the same gap hid a whole card from a role query on
 * `features`, and the restaurants half of §3 from one on `two-audiences`).
 * Scrolling the LAST `[data-reveal]` descendant into view crosses every
 * trigger above it too.
 */
async function revealAll(section: Locator) {
  await section.locator('[data-reveal]').last().scrollIntoViewIfNeeded();
}

for (const { locale, path, m } of LOCALES) {
  test.describe(`sections [${locale}]`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(path);
    });

    test('what you get: the five cards, on the sunken band', async ({ page }) => {
      const section = page.locator('#features');
      await section.scrollIntoViewIfNeeded();
      await revealAll(section);
      await expect(section.getByRole('heading', { level: 2, name: m.features.title })).toBeVisible();
      await expect(section.getByText(m.features.lead)).toBeVisible();
      await expect(section.getByRole('listitem')).toHaveCount(5);
      for (const key of ['f1', 'f2', 'f3', 'f4', 'f5'] as const) {
        await expect(section.getByRole('heading', { level: 3, name: m.features[key].title })).toBeAttached();
      }
      expect(await section.evaluate((n) => getComputedStyle(n).backgroundColor)).toBe('rgb(243, 236, 224)');
    });

    test('venues: four photo cards with a name and a line, four more names, the footnote', async ({
      page,
    }) => {
      const section = page.locator('#venues');
      await section.scrollIntoViewIfNeeded();
      await revealAll(section);
      await expect(section.getByText(m.venues.overline)).toBeAttached();
      await expect(section.getByRole('listitem')).toHaveCount(4);
      for (const key of ['v1', 'v2', 'v3', 'v4'] as const) {
        await expect(section.getByRole('heading', { level: 3, name: m.venues[key].name })).toBeAttached();
        await expect(section.getByText(m.venues[key].meta)).toBeAttached();
      }
      for (const key of ['v5', 'v6', 'v7', 'v8'] as const) {
        await expect(section.getByText(m.venues[key], { exact: true })).toBeAttached();
      }
      for (const img of await section.locator('img').all()) {
        expect(await img.evaluate((el) => (el as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
      }
      await expect(section.getByText(m.venues.more)).toBeAttached();
      // Cream caption on the shade: legible on every picture.
      for (const h of await section.getByRole('heading', { level: 3 }).all()) {
        expect(await contrast(h)).toBeGreaterThanOrEqual(4.5);
      }
    });

    test('where: the five neighbourhoods pinned on a Night panel that never mirrors', async ({ page }) => {
      const section = page.locator('#where');
      await section.scrollIntoViewIfNeeded();
      await revealAll(section);
      await expect(section.getByRole('heading', { level: 2, name: m.where.title })).toBeVisible();
      await expect(section.getByRole('listitem')).toHaveCount(5);
      for (const key of ['zamalek', 'maadi', 'heliopolis', 'newCairo', 'sheikhZayed'] as const) {
        await expect(section.getByText(m.where[key], { exact: true })).toBeAttached();
      }
      await expect(section.getByText(m.where.mapLabel)).toBeAttached();
      // Geography is fixed: Sheikh Zayed is west of Zamalek, which is west of New Cairo, in both languages.
      const x = async (name: string) => (await section.getByText(name, { exact: true }).boundingBox())!.x;
      expect(await x(m.where.sheikhZayed)).toBeLessThan(await x(m.where.zamalek));
      expect(await x(m.where.zamalek)).toBeLessThan(await x(m.where.newCairo));
    });

    test('for restaurants: Night band, 48px headline on a desktop, the drawn operator window, CTA to the joining answer', async ({
      page,
    }, testInfo) => {
      const section = page.locator('#restaurants');
      await section.scrollIntoViewIfNeeded();
      await revealAll(section);
      expect(await section.evaluate((n) => getComputedStyle(n).backgroundColor)).toBe('rgb(26, 19, 16)');
      const h2 = section.getByRole('heading', { level: 2, name: m.operator.title });
      await expect(h2).toBeVisible();
      if (testInfo.project.name !== 'phone') {
        expect(await h2.evaluate((n) => getComputedStyle(n).fontSize)).toBe('48px');
      }
      await expect(section.getByRole('link', { name: m.operator.cta })).toHaveAttribute(
        'href',
        `${path}#partner`,
      );
      const dash = section.locator('[data-operator-mock]');
      await expect(dash.getByText(m.operator.dash.title)).toBeVisible();
      await expect(dash.getByText(m.operator.dash.k1)).toBeVisible();
      await expect(dash.getByText(m.operator.dash.b1Name)).toBeVisible();
      if (testInfo.project.name !== 'phone') {
        // On md+ the window's height is fixed and shorter than its content, so
        // it is cut by the band: it ends where the band ends. Below md the
        // sidebar and floor plan are hidden and the window sizes to its own
        // content instead (a fixed height there clipped the KPI grid and the
        // bookings list — found 2026-09-10), so this geometry is a desktop
        // claim only. Let its own reveal (data-reveal on the dash) finish
        // first — mid-tween it is still offset by its own translateY.
        await page.waitForTimeout(1000);
        const d = (await dash.boundingBox())!;
        const s = (await section.boundingBox())!;
        expect(Math.abs(d.y + d.height - (s.y + s.height))).toBeLessThan(4);
      }
      // "Download" never appears for restaurants: the app does not exist yet.
      expect(await section.innerText()).not.toContain(m.nav.getApp);
    });

    test('FAQ: five closed answers, the plus that opens and folds them, and #partner on the joining question', async ({
      page,
    }) => {
      const section = page.locator('#faq');
      await section.scrollIntoViewIfNeeded();
      await revealAll(section);
      await expect(section.getByRole('heading', { level: 2, name: m.faq.title })).toBeVisible();
      const items = section.locator('details');
      await expect(items).toHaveCount(5);
      // Every question is on screen; every answer starts closed — a FAQ, not a
      // page of already-open answers (seen 2026-09-10, before this test existed).
      for (const key of ['q1', 'q2', 'q3', 'q4', 'q5'] as const) {
        await expect(section.getByText(m.faq[key].q)).toBeVisible();
        await expect(section.getByText(m.faq[key].a)).toBeHidden();
      }
      for (const item of await items.all()) await expect(item).not.toHaveAttribute('open');
      await expect(section.locator('details#partner')).toHaveCount(1);
      const first = items.first();
      await first.locator('summary').click();
      await expect(first).toHaveAttribute('open', '');
      await expect(first.getByText(m.faq.q1.a)).toBeVisible();
      await first.locator('summary').click();
      await expect(first).not.toHaveAttribute('open');
      await expect(first.getByText(m.faq.q1.a)).toBeHidden();
    });

    test('get the app: the gold moment, both badges as drawn and not yet links, the drawn phone', async ({
      page,
    }) => {
      const section = page.locator('#get-the-app');
      await section.scrollIntoViewIfNeeded();
      await revealAll(section);
      expect(await section.evaluate((n) => getComputedStyle(n).backgroundColor)).toBe('rgb(26, 19, 16)');
      await expect(section.getByRole('heading', { level: 2, name: m.close.title })).toBeVisible();
      const overline = section.getByText(m.close.overline);
      await expect(overline).toBeVisible();
      expect(await overline.evaluate((n) => getComputedStyle(n).color), 'gold overline').toBe(
        'rgb(224, 169, 109)',
      );
      await expect(section.locator('[data-store-badge="apple"]')).toHaveCount(1);
      await expect(section.locator('[data-store-badge="play"]')).toHaveCount(1);
      await expect(section.getByText(m.close.appStoreName)).toBeVisible();
      await expect(section.getByText(m.close.playName)).toBeVisible();
      // Not links until the listings exist — and never `#`.
      await expect(section.locator('[data-store-badge] a, a[data-store-badge]')).toHaveCount(0);
      await expect(section.getByText(m.close.phone1)).toBeAttached();
      await expect(section.locator('img[src*="/shots/"]')).toHaveCount(0);
    });

    test('footer: mark, tagline, both outlined badges, links with targets, and the other language', async ({
      page,
    }) => {
      const footer = page.getByRole('contentinfo');
      await footer.scrollIntoViewIfNeeded();
      await expect(footer.getByText(m.footer.tagline)).toBeVisible();
      await expect(footer.locator('[data-store-badge]')).toHaveCount(2);
      await expect(footer.getByRole('link', { name: m.footer.how })).toHaveAttribute(
        'href',
        `${path}#how-it-works`,
      );
      await expect(footer.getByRole('link', { name: m.footer.hoods })).toHaveAttribute(
        'href',
        `${path}#where`,
      );
      await expect(footer.getByRole('link', { name: m.hero.partner })).toHaveAttribute(
        'href',
        `${path}#partner`,
      );
      await expect(footer.getByRole('link', { name: m.footer.operator })).toHaveAttribute(
        'href',
        `${path}#restaurants`,
      );
      await expect(footer.getByRole('link', { name: m.footer.privacy })).toHaveAttribute(
        'href',
        locale === 'ar' ? '/ar/privacy' : '/privacy',
      );
      await expect(footer.getByRole('link', { name: m.footer.terms })).toHaveAttribute(
        'href',
        locale === 'ar' ? '/ar/terms' : '/terms',
      );
      await expect(footer.getByRole('link', { name: m.nav.switchLocaleLabel })).toHaveAttribute(
        'href',
        locale === 'ar' ? '/' : '/ar',
      );
    });

    test('the page never scrolls sideways', async ({ page }) => {
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, 'horizontal overflow in px').toBeLessThanOrEqual(0);
    });

    test('scroll reveals run with motion allowed and every section ends fully shown', async ({
      page,
    }, testInfo) => {
      test.skip(testInfo.project.name === 'reduced-motion', 'asserted the other way round in hero.spec.ts');
      await expect(page.locator('body')).toHaveAttribute('data-reveal-motion', 'on', { timeout: 10_000 });
      await page.locator('#get-the-app').scrollIntoViewIfNeeded();
      await page.getByRole('contentinfo').scrollIntoViewIfNeeded();
      await expect
        .poll(
          () =>
            page
              .locator('[data-reveal]')
              .evaluateAll((els) => els.filter((e) => getComputedStyle(e).opacity !== '1').length),
          { timeout: 8_000 },
        )
        .toBe(0);
    });
  });
}
