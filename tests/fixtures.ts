// Every page load in this suite mounts the lazy Cairo map (cairo-map.tsx),
// which fetches real OpenStreetMap tiles for the "where" section — fine for
// one visitor, not for a suite that loads the page on the order of 200 times
// a run across every spec file, every locale and every project. Every spec
// file imports `test`/`expect` from here instead of '@playwright/test'
// directly, so that mock applies everywhere without repeating it per file.
//
// The MARKERS themselves (cairo-map.tsx's divIcons, holding the neighbourhood
// names and counts) are plain DOM the map creates before it ever asks for a
// tile, so mocking the tile image doesn't hide a real bug in them — only in
// whether a tile image itself decodes, which no test here asserts on.
import { test as base, expect } from '@playwright/test';

const TRANSPARENT_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64',
);

export const test = base.extend({
  // Named `provide`, not Playwright's usual `use` — ESLint's react-hooks
  // plugin treats any function named `use(...)` as a React hook call by
  // naming convention alone, and flags this callback (which is Playwright's
  // fixture API, unrelated to React) as one used outside a component.
  page: async ({ page }, provide) => {
    await page.route('https://tile.openstreetmap.org/**', (route) =>
      route.fulfill({ status: 200, contentType: 'image/png', body: TRANSPARENT_PNG }),
    );
    await provide(page);
  },
});

export { expect };
