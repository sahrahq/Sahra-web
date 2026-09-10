// Product screenshots for the marketing site — captured from the product, never drawn.
//
//   node tools/shots.ts                 # everything
//   node tools/shots.ts --skip-flutter  # operator render only
//   node tools/shots.ts --skip-operator # app screenshots only
//
// 1. THE DINER APP. Drives apps/customer_app's own walk-through harness
//    (test/journey/journey_screenshots_test.dart) with --update-goldens and the
//    DEBUG banner off (WALKTHROUGH_BANNER=off), once in light and once with
//    WALKTHROUGH_BRIGHTNESS=dark, in both languages, and
//    copies four frames per run into public/shots/<locale>/<theme>/<screen>.png:
//
//        04-home          → discover
//        09-venue         → venue
//        14-slot-chosen   → book   (a time picked, so the confirm button carries it)
//        18-confirmed     → confirmed
//
//    The harness is the SINGLE OWNER of what the walk looks like (its fixtures
//    are private to it on purpose — two sets of canned responses would drift).
//    This tool only chooses frames. Running it rewrites the committed
//    walk-through pictures on this machine's Flutter and font stack, so it
//    RESTORES that folder from git afterwards and refuses to finish if the
//    restore left anything modified.
//
// 2. SAHRA FOR RESTAURANTS does not exist yet. The only truthful visual is the
//    design reference, docs/design/ui_kits/operator/OperatorDashboard.jsx,
//    rendered in headless Chromium at its documented 1100×680 card size, day and
//    night, into public/shots/operator/{day,night}.png — labelled in
//    docs/decisions/2026-09-10-marketing-site-in-nextjs.md §6 as a REFERENCE
//    RENDER to be replaced by real screenshots when the app exists.
//
// Screenshots are not goldens: a different Flutter version changes pixels and
// that is fine here. The Flutter that captured the committed set is printed at
// the end so it can be written into RUNNING.md.
import { chromium } from '@playwright/test';
import { execFileSync, spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const web = resolve(here, '..');
const repo = resolve(web, '..', '..');
const customerApp = join(repo, 'apps', 'customer_app');
const walkthrough = join(customerApp, 'test', 'journey', 'walkthrough');
const shots = join(web, 'public', 'shots');

const skipFlutter = process.argv.includes('--skip-flutter');
const skipOperator = process.argv.includes('--skip-operator');

const FRAMES: Record<string, string> = {
  '04-home': 'discover',
  '09-venue': 'venue',
  '14-slot-chosen': 'book',
  '18-confirmed': 'confirmed',
};
const LOCALES = ['en', 'ar'] as const;
const THEMES = ['night', 'day'] as const; // night first: the folder ends up light, then is restored anyway

function run(cmd: string, args: string[], cwd: string): void {
  console.log(`\n$ ${cmd} ${args.join(' ')}   (in ${cwd})`);
  const r = spawnSync(cmd, args, { cwd, stdio: 'inherit', shell: process.platform === 'win32' });
  if (r.status !== 0) throw new Error(`${cmd} exited ${r.status}`);
}

function git(args: string[], cwd: string): string {
  return execFileSync('git', args, { cwd, encoding: 'utf8' });
}

async function captureApp(): Promise<void> {
  if (git(['status', '--porcelain', '--', walkthrough], customerApp).trim() !== '') {
    throw new Error(`${walkthrough} has local modifications; commit or discard them before capturing`);
  }
  for (const theme of THEMES) {
    // 2× density, and a shorter (real) phone so bottom-pinned screens show their
    // filled part — see the defines in journey_screenshots_test.dart.
    const args = [
      'test',
      'test/journey/journey_screenshots_test.dart',
      '--update-goldens',
      '--dart-define=WALKTHROUGH_BANNER=off',
      '--dart-define=WALKTHROUGH_DPR=2',
      '--dart-define=WALKTHROUGH_HEIGHT=640',
    ];
    if (theme === 'night') args.push('--dart-define=WALKTHROUGH_BRIGHTNESS=dark');
    run('flutter', args, customerApp);
    for (const locale of LOCALES) {
      const from = join(walkthrough, locale);
      const files = readdirSync(from);
      const to = join(shots, locale, theme);
      mkdirSync(to, { recursive: true });
      for (const [prefix, name] of Object.entries(FRAMES)) {
        const file = files.find((f) => f.startsWith(`${prefix}.`) || f === `${prefix}.png`);
        if (!file)
          throw new Error(
            `walk-through frame ${prefix} not found in ${from} — the walk changed; update FRAMES`,
          );
        copyFileSync(join(from, file), join(to, `${name}.png`));
        console.log(`  ${locale}/${theme}/${name}.png  ←  ${file}`);
      }
    }
  }
  // Put the committed walk-through back. The pictures this machine just drew
  // are the product owner's to regenerate on the platform that owns them.
  git(['checkout', '--', walkthrough], customerApp);
  const left = git(['status', '--porcelain', '--', walkthrough], customerApp).trim();
  if (left !== '') throw new Error(`restore left modifications:\n${left}`);
  console.log('\nwalk-through folder restored from git; clean.');
  // A newer or older Flutter than the one that owns pubspec.lock rewrites the
  // lockfile and analysis_options.yaml on `pub get`. Those are NOT this tool's
  // to revert — they are listed so nobody commits them by accident.
  const other = git(['status', '--porcelain', '--', '.'], customerApp).trim();
  if (other !== '') {
    console.log(`
NOTE apps/customer_app has other local changes — review before committing:
${other}`);
  }
  const version = spawnSync('flutter', ['--version'], {
    encoding: 'utf8',
    shell: process.platform === 'win32',
  });
  console.log(`\ncaptured with: ${(version.stdout ?? '').split('\n')[0]}`);
}

async function renderOperator(): Promise<void> {
  const html = join(repo, 'docs', 'design', 'ui_kits', 'operator', 'index.html');
  if (!existsSync(html)) throw new Error(`${html} not found`);
  const out = join(shots, 'operator');
  mkdirSync(out, { recursive: true });

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1100, height: 680 }, deviceScaleFactor: 2 });
    // The reference loads React, Babel and Google fonts from the network and
    // avatars from Unsplash; wait for all of it, then for the fonts.
    await page.goto(pathToFileURL(html).href, { waitUntil: 'networkidle' });
    await page.waitForSelector('#root main', { timeout: 30_000 });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(300);
    await page.screenshot({ path: join(out, 'day.png') });
    console.log(`  operator/day.png`);

    // `dark` on OperatorDashboard does exactly two things: `theme-night` on the
    // outer div, and the cream logo instead of the terracotta one. Do those two.
    await page.evaluate(() => {
      const root = document.querySelector('#root > div');
      if (!root) throw new Error('operator root not found');
      root.classList.add('theme-night');
      const logo = root.querySelector<HTMLImageElement>('img[alt="SAHRA"]');
      if (logo) logo.src = logo.src.replace('logo-terracotta.png', 'logo.png');
    });
    await page.waitForTimeout(300);
    await page.screenshot({ path: join(out, 'night.png') });
    console.log(`  operator/night.png`);
  } finally {
    await browser.close();
  }
}

if (!skipFlutter) await captureApp();
if (!skipOperator) await renderOperator();
console.log('\ndone.');
