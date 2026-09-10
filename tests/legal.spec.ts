// /privacy and /terms, both languages: they exist (the footer links to them),
// they say plainly that the text is still to come, and the language switch
// keeps the reader on the same page.
import { expect, test } from '@playwright/test';
import ar from '../messages/ar.json' with { type: 'json' };
import en from '../messages/en.json' with { type: 'json' };

const PAGES = [
  { path: '/privacy', kind: 'privacy', m: en, other: '/ar/privacy', landing: '/' },
  { path: '/terms', kind: 'terms', m: en, other: '/ar/terms', landing: '/' },
  { path: '/ar/privacy', kind: 'privacy', m: ar, other: '/privacy', landing: '/ar' },
  { path: '/ar/terms', kind: 'terms', m: ar, other: '/terms', landing: '/ar' },
] as const;

for (const { path, kind, m, other, landing } of PAGES) {
  test(`${path}: a real page that says it is a stub, with the way back and the other language`, async ({
    page,
  }, testInfo) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(m.legal[kind].metaTitle);
    await expect(page.getByRole('heading', { level: 1, name: m.legal[kind].title })).toBeVisible();
    await expect(page.getByText(m.legal[kind].body)).toBeVisible();
    await expect(page.getByRole('main').getByRole('link', { name: m.legal.back })).toHaveAttribute(
      'href',
      landing,
    );
    const banner = page.getByRole('banner');
    await expect(banner.getByRole('link', { name: m.nav.switchLocaleLabel }).first()).toHaveAttribute(
      'href',
      other,
    );
    // On a phone the middle links are folded behind the menu button; open it,
    // the same way nav.spec.ts does, before looking for the FAQ link inside.
    if (testInfo.project.name === 'phone') {
      await banner.getByRole('button', { name: m.nav.menuOpen }).click();
    }
    // The nav's anchors still point at the landing, not at this page. Every
    // one of these is a CROSS-DOCUMENT navigation (this page is /privacy or
    // /terms, not the landing), which is exactly the case that broke before
    // nav.tsx switched to next/link (2026-09-10).
    await expect(banner.getByRole('link', { name: m.nav.faq }).first()).toHaveAttribute(
      'href',
      `${landing}#faq`,
    );
    await expect(banner.getByRole('link', { name: m.nav.getApp }).first()).toHaveAttribute(
      'href',
      `${landing}#get-the-app`,
    );
  });
}
