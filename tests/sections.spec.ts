// What you get through the footer, both locales: each part is there, and the page stays honest
// (the badges are not links, drawn screens use the message files' strings, every photo decodes).
import { expect, test } from './fixtures';
import type { Locator } from '@playwright/test';
import ar from '../messages/ar.json' with { type: 'json' };
import en from '../messages/en.json' with { type: 'json' };
import { contrast } from './helpers/contrast';
import { expectImagesDecoded } from './helpers/images';

const LOCALES = [
  { locale: 'en', path: '/', m: en },
  { locale: 'ar', path: '/ar', m: ar },
] as const;

/** Each `[data-reveal]` is `visibility:hidden` until its own trigger fires, hiding it from role
 * queries and `elementsFromPoint`. Centring the section's last one crosses every trigger above it;
 * `scrollIntoViewIfNeeded` can stop a few px either side of the 88% line. */
async function revealAll(section: Locator) {
  await section
    .locator('[data-reveal]')
    .last()
    .evaluate((el) => el.scrollIntoView({ block: 'center' }));
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
      await expectImagesDecoded(section);
      await expect(section.getByText(m.venues.more)).toBeAttached();
      // Cream caption on the shade: legible on every picture.
      for (const h of await section.getByRole('heading', { level: 3 }).all()) {
        expect(await contrast(h)).toBeGreaterThanOrEqual(4.5);
      }
    });

    test('where: the five neighbourhoods on a full-bleed Cairo map, the copy floating clear of them', async ({
      page,
    }, testInfo) => {
      const section = page.locator('#where');
      await section.scrollIntoViewIfNeeded();
      await revealAll(section);
      await expect(section.getByRole('heading', { level: 2, name: m.where.title })).toBeVisible();
      // The static fallback panel stays in the DOM under the real map. Scoped to its own list:
      // the card's chips and the map's labels repeat the same five names.
      const fallback = section.locator('ul[dir="ltr"]');
      await expect(fallback.getByRole('listitem')).toHaveCount(5);
      for (const key of ['zamalek', 'maadi', 'heliopolis', 'newCairo', 'sheikhZayed'] as const) {
        await expect(fallback.getByText(m.where[key], { exact: true })).toBeAttached();
      }
      // Geography is fixed: Sheikh Zayed is west of Zamalek, which is west of New Cairo, in both languages.
      const x = async (name: string) => (await fallback.getByText(name, { exact: true }).boundingBox())!.x;
      expect(await x(m.where.sheikhZayed)).toBeLessThan(await x(m.where.zamalek));
      expect(await x(m.where.zamalek)).toBeLessThan(await x(m.where.newCairo));

      // The real map is a lazy chunk with stubbed tiles (tests/fixtures.ts), so this asserts
      // Leaflet's container and the markers, never a tile image.
      const map = section.locator('[role="img"]');
      await expect(map).toHaveAttribute('aria-label', m.where.mapLabel, { timeout: 10_000 });
      // Leaflet adds its class to the element it was given, not to a child.
      await expect(map).toHaveClass(/leaflet-container/, { timeout: 10_000 });
      const phone = testInfo.project.name === 'phone';
      for (const key of ['zamalek', 'maadi', 'heliopolis', 'newCairo', 'sheikhZayed'] as const) {
        // `exact`: a label is the name alone, so the export's venue counts cannot creep back.
        // Below md the labels are hidden by CSS and the card's chips carry the names.
        const label = map.getByText(m.where[key], { exact: true });
        if (phone) await expect(label).toBeAttached();
        else await expect(label).toBeVisible();
      }

      // The five names as chips on the copy card, at every width.
      const chips = section.locator('[data-map-reserve] ul');
      await expect(chips.getByRole('listitem')).toHaveCount(5);
      for (const key of ['zamalek', 'maadi', 'heliopolis', 'newCairo', 'sheikhZayed'] as const) {
        await expect(chips.getByText(m.where[key], { exact: true })).toBeVisible();
      }

      if (!phone) {
        // From md the copy card floats over the map: every label must stay inside the band and
        // clear of the card, which also catches Arabic labels opening towards the card.
        const band = (await map.boundingBox())!;
        const card = (await section.locator('[data-map-reserve]').boundingBox())!;
        for (const key of ['zamalek', 'maadi', 'heliopolis', 'newCairo', 'sheikhZayed'] as const) {
          const label = (await map.getByText(m.where[key], { exact: true }).boundingBox())!;
          expect(label.x, `${key}: the label starts inside the band`).toBeGreaterThanOrEqual(band.x - 1);
          expect(label.x + label.width, `${key}: the label ends inside the band`).toBeLessThanOrEqual(
            band.x + band.width + 1,
          );
          const overCard =
            label.x < card.x + card.width &&
            label.x + label.width > card.x &&
            label.y < card.y + card.height &&
            label.y + label.height > card.y;
          expect(overCard, `${key}: the label is clear of the copy card`).toBe(false);
        }
      }
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
        // From md the window has a fixed height and ends where the band ends; below md it sizes to
        // its content. Wait out its own reveal first: mid-tween it is offset by its translateY.
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
      // Every question is on screen, and every answer starts closed.
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
      // The map's tiles must be credited, and the credit lives here rather than on the map.
      await expect(footer.getByText(m.footer.mapCredit)).toBeVisible();
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
