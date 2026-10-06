import { defineConfig, devices } from '@playwright/test';

// Runs against the static export in out/ (`pnpm build` first), served by tools/serve-out.ts as a
// static host would, so the tests see what ships. The reduced-motion project is where
// tests/hero.spec.ts checks that nothing moves.
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
