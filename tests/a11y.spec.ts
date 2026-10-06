// Every route, both languages, scanned by axe against WCAG 2.1 AA: it catches what a refactor
// breaks (a skipped heading level, a dangling aria-labelledby). axe finds a minority of defects,
// so a green run is a floor, never evidence the site is accessible.
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from './fixtures';

// One worker for this file: axe is CPU-bound, and run fully parallel it pushed other specs past
// their timeouts at `retries: 0`. `'default'`, not `'serial'`, so every violating route reports.
test.describe.configure({ mode: 'default' });

const ROUTES = ['/', '/privacy', '/terms', '/ar', '/ar/privacy', '/ar/terms'] as const;

for (const route of ROUTES) {
  test(`${route}: no WCAG 2.1 AA violation axe can detect`, async ({ page }, testInfo) => {
    // This file emulates reduced motion in every project, so `reduced-motion` would repeat the
    // `desktop` scan. `phone` is scanned: its folded nav is different markup.
    test.skip(
      testInfo.project.name === 'reduced-motion',
      'identical DOM to desktop, and this file already scans at rest',
    );

    // Scan at rest: color-contrast reads rendered colour, opacity included, so a reveal caught
    // mid-tween fails. `MotionGate` mounts no tweens under reduced motion.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(route);
    // The landing mounts the Cairo map lazily. Scanning before it arrives
    // would quietly skip the most complex markup on the page.
    await page.waitForLoadState('networkidle');

    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    // Print the offending markup, not just the rule id, so a red run is actionable from the CI log.
    expect(
      violations.map((v) => ({
        rule: v.id,
        impact: v.impact,
        help: v.help,
        nodes: v.nodes.map((n) => n.html),
      })),
    ).toEqual([]);
  });
}
