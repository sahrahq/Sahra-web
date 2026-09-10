import { defineConfig, devices } from '@playwright/test';

// Tests run against the STATIC EXPORT in out/, served the way a static host
// serves it (tools/serve-out.ts) — the thing that ships, not the dev server.
// `pnpm build` first; `pnpm test` then.
//
// Three projects, all Chromium: a desktop, a 380 px phone, and the desktop
// again with `prefers-reduced-motion: reduce` emulated. The third exists so
// "nothing moves under reduced motion" is a measurement (tests/hero.spec.ts),
// not a promise in a comment.
export default defineConfig({
  testDir: 'tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'node tools/serve-out.ts --port 4173',
    url: 'http://127.0.0.1:4173/',
    reuseExistingServer: !process.env.CI,
    timeout: 15_000,
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } } },
    {
      name: 'phone',
      use: { ...devices['Desktop Chrome'], viewport: { width: 380, height: 760 }, isMobile: false },
    },
    {
      name: 'reduced-motion',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' },
    },
  ],
});
