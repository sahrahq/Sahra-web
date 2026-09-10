// §1 — the nav renders in both locales, from the static export.
//
// Copy is read from the message files, never typed here: a test that hardcodes
// "Diners" breaks every time the (unreviewed) copy is edited, and its job is to
// outlive that. Direction and the language switch are asserted from the DOM.
import { expect, test } from './fixtures';
import ar from '../messages/ar.json' with { type: 'json' };
import en from '../messages/en.json' with { type: 'json' };

const LOCALES = [
  { locale: 'en', path: '/', dir: 'ltr', m: en, other: '/ar' },
  { locale: 'ar', path: '/ar', dir: 'rtl', m: ar, other: '/' },
] as const;

for (const { locale, path, dir, m, other } of LOCALES) {
  test.describe(`nav [${locale}]`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(path);
    });

    test('document direction and language are static in the HTML', async ({ page }) => {
      await expect(page.locator('html')).toHaveAttribute('lang', locale);
      await expect(page.locator('html')).toHaveAttribute('dir', dir);
    });

    test('wordmark, links and switch are present and point where the prompt says', async ({
      page,
    }, testInfo) => {
      const nav = page.getByRole('navigation', { name: m.nav.label });
      await expect(nav).toBeVisible();
      await expect(nav.getByRole('link', { name: m.brand.name })).toHaveAttribute('href', path);

      const phone = testInfo.project.name === 'phone';
      if (phone) {
        // Folded: open it by the only control there is, then the links must be there.
        const button = nav.getByRole('button', { name: m.nav.menuOpen });
        await expect(button).toHaveAttribute('aria-expanded', 'false');
        await button.click();
        await expect(nav.getByRole('button', { name: m.nav.menuClose })).toHaveAttribute(
          'aria-expanded',
          'true',
        );
      }
      const scope = phone ? page.getByRole('banner') : nav;
      for (const [key, hash] of [
        ['diners', '#diners'],
        ['restaurants', '#restaurants'],
        ['faq', '#faq'],
      ] as const) {
        await expect(scope.getByRole('link', { name: m.nav[key] }).first()).toHaveAttribute(
          'href',
          `${path}${hash}`,
        );
      }
      await expect(scope.getByRole('link', { name: m.nav.getApp }).first()).toHaveAttribute(
        'href',
        `${path}#get-the-app`,
      );
    });

    test('the language switch keeps the reader on the same page in the other language', async ({ page }) => {
      const nav = page.getByRole('navigation', { name: m.nav.label });
      const sw = nav.getByRole('link', { name: m.nav.switchLocaleLabel }).first();
      await expect(sw).toHaveAttribute('href', other);
      await sw.click();
      await expect(page).toHaveURL(new RegExp(`${other.replace('/', '\\/')}$`));
      await expect(page.locator('html')).toHaveAttribute('lang', locale === 'en' ? 'ar' : 'en');
    });

    test('every control in the nav is at least 44px tall', async ({ page }) => {
      const nav = page.getByRole('navigation', { name: m.nav.label });
      const boxes = await nav
        .locator('a:visible, button:visible')
        .evaluateAll((els) =>
          els.map((el) => ({ h: el.getBoundingClientRect().height, text: (el.textContent ?? '').trim() })),
        );
      expect(boxes.length).toBeGreaterThan(0);
      for (const b of boxes) expect(b.h, b.text).toBeGreaterThanOrEqual(44);
    });
  });
}
