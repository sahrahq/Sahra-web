// §4 — how it works, in both locales: three steps, each with the artboard's
// drawn Night screen standing in a sunken card, plus the number, title and
// line under it. No product capture: the owner asked for the drawing.
import { expect, test } from './fixtures';
import ar from '../messages/ar.json' with { type: 'json' };
import en from '../messages/en.json' with { type: 'json' };

const LOCALES = [
  { locale: 'en', path: '/', m: en },
  { locale: 'ar', path: '/ar', m: ar },
] as const;

for (const { locale, path, m } of LOCALES) {
  test.describe(`how it works [${locale}]`, () => {
    test('heading, lead, and three steps with titles, lines and the drawn screens', async ({ page }) => {
      await page.goto(path);
      const section = page.locator('#how-it-works');
      await section.scrollIntoViewIfNeeded();
      await expect(section.getByRole('heading', { level: 2, name: m.how.title })).toBeVisible();
      await expect(section.getByText(m.how.lead)).toBeVisible();
      for (const [i, step] of [m.how.step1, m.how.step2, m.how.step3].entries()) {
        const li = section.locator(`[data-step="${i + 1}"]`);
        // With motion on, a step rises in as it scrolls into view — so scroll to it,
        // as a reader does, before asking whether it is there.
        await li.scrollIntoViewIfNeeded();
        await expect(li.getByRole('heading', { level: 3, name: step.title })).toBeVisible();
        await expect(li.getByText(step.body)).toBeVisible();
        await expect(li.getByText(String(i + 1), { exact: true })).toBeVisible();
        const screen = li.locator('[data-step-screen]');
        await expect(screen.getByText(step.screen.title)).toBeVisible();
        await expect(screen.getByText(step.screen.cta)).toBeVisible();
        await expect(screen.getByText(step.screen.r1a)).toBeVisible();
        // Let the scroll reveal (data-reveal, staggered 0.08s apart, each a
        // 0.7s tween) finish before reading geometry — mid-tween the whole
        // <li> is still offset by its own translateY, which swamps a "flush
        // edge" check (seen 2026-09-10). Worst case (the third, most-delayed
        // card) settles at ~0.86s after its trigger fires.
        await page.waitForTimeout(1000);
        // The phone stands on the card's foot: its bottom edge is the card's,
        // within the card's own 1px border plus sub-pixel layout rounding.
        const card = (await li.locator('.step-visual').boundingBox())!;
        const phone = (await li.locator('.mock-phone').boundingBox())!;
        expect(Math.abs(phone.y + phone.height - (card.y + card.height))).toBeLessThan(4);
        expect(phone.y, 'and its head is inside the card').toBeGreaterThan(card.y);
      }
      await expect(section.locator('img[src*="/shots/"]')).toHaveCount(0);
    });

    test('three columns on a desktop, one on a phone', async ({ page }, testInfo) => {
      await page.goto(path);
      const steps = page.locator('#how-it-works [data-step]');
      await steps.first().scrollIntoViewIfNeeded();
      // Same reveal-settle wait as above: mid-stagger, one card can still sit
      // a few px off its siblings' row.
      await page.waitForTimeout(1000);
      const boxes = await steps.evaluateAll((els) =>
        els.map((e) => {
          const r = e.getBoundingClientRect();
          return { x: Math.round(r.x), y: Math.round(r.y) };
        }),
      );
      const distinctRows = new Set(boxes.map((b) => Math.round(b.y / 4))).size;
      if (testInfo.project.name === 'phone') expect(distinctRows, 'stacked').toBe(3);
      else expect(distinctRows, 'one row').toBe(1);
    });
  });
}
