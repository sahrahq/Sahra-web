import { expect, type Locator } from '@playwright/test';

// Asserts every `<img>` in `scope` decoded, polling first: `naturalWidth` is 0 until decode, so
// reading it at once races the network. A missing or broken asset still fails, on the timeout.
export async function expectImagesDecoded(scope: Locator): Promise<void> {
  const images = await scope.locator('img').all();
  for (const img of images) {
    await expect
      .poll(
        () =>
          img.evaluate((el) => (el as HTMLImageElement).complete && (el as HTMLImageElement).naturalWidth),
        {
          message: 'an <img> in this section never decoded — broken src, or a 404 from the export',
        },
      )
      .toBeGreaterThan(0);
  }
}
