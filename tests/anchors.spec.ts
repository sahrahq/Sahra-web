// Dead anchors have a deadline, not a comment.
//
// Every same-page anchor on the landing — in the nav, the hero CTAs, the
// footer, anywhere — is listed here with the section that gives it a target.
// The whole artboard is built, so every entry is landed; the `landed` flag
// stays so a future section can be listed before it exists.
//
// The first test pins the SET: a new same-page link that is not listed here
// fails, so nothing can point at nothing unannounced. `href="#"` in particular
// (a link to nothing, the artboard's store badges) can never ship.
import { expect, test } from '@playwright/test';

const ANCHORS = [
  { hash: '#content', section: 'the skip link target (Phase 1)', landed: true },
  { hash: '#diners', section: '§3 two audiences', landed: true },
  { hash: '#how-it-works', section: '§4 how it works (footer link)', landed: true },
  { hash: '#where', section: '§7 where (footer link)', landed: true },
  { hash: '#restaurants', section: '§8 for restaurants', landed: true },
  { hash: '#partner', section: '§9 FAQ, the joining answer — every "Partner with SAHRA"', landed: true },
  { hash: '#faq', section: '§9 FAQ', landed: true },
  { hash: '#get-the-app', section: '§10 get the app', landed: true },
] as const;

for (const path of ['/', '/ar']) {
  test.describe(`anchors [${path}]`, () => {
    test('the page links to exactly the listed same-page anchors, and never to "#"', async ({ page }) => {
      await page.goto(path);
      const hashes = await page
        .locator('a[href*="#"]')
        .evaluateAll((els) =>
          Array.from(new Set(els.map((a) => '#' + (a.getAttribute('href') ?? '').split('#')[1]))).sort(),
        );
      expect(hashes).toEqual([...ANCHORS.map((a) => a.hash)].sort());
      await expect(page.locator('a[href="#"], a[href$="#"]')).toHaveCount(0);
    });

    for (const a of ANCHORS) {
      test(`${a.hash} has a target — ${a.section}`, async ({ page }) => {
        test.fixme(!a.landed, `${a.hash} is satisfied by ${a.section}, not built yet`);
        await page.goto(path);
        await expect(page.locator(`[id="${a.hash.slice(1)}"]`)).toHaveCount(1);
      });
    }
  });
}
