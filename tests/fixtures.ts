// Every spec imports `test`/`expect` from here, so each page load answers the Cairo map's
// OpenStreetMap tile requests locally instead of fetching them hundreds of times a run. The
// markers are DOM the map creates before any tile, so the stub hides nothing a test asserts.
import { test as base, expect } from '@playwright/test';

const TRANSPARENT_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64',
);

export const test = base.extend({
  // `provide`, not Playwright's usual `use`: the react-hooks lint treats any `use(...)` as a hook.
  page: async ({ page }, provide) => {
    await page.route('https://tile.openstreetmap.org/**', (route) =>
      route.fulfill({ status: 200, contentType: 'image/png', body: TRANSPARENT_PNG }),
    );
    await provide(page);
  },
});

export { expect };
