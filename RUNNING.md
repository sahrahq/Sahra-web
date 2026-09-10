# Running `apps/web` — the SAHRA marketing site

What this is and is not: `docs/decisions/2026-09-10-marketing-site-in-nextjs.md`.
Marketing pages only. It never calls the API, so nothing below needs Redis,
Meilisearch, a database or a phone.

## 0. Once

Node 22 and pnpm (CI pins Node 22; the repo's `packageManager` field pins
pnpm). From the repo root:

```powershell
pnpm install
pnpm --filter web exec playwright install chromium   # for tools/snap.ts, tools/shots.ts and the tests
```

## 1. Develop

```powershell
cd apps\web
pnpm dev            # http://localhost:3000  (EN)  ·  http://localhost:3000/ar  (AR)
```

There is no theme toggle. Night is a section rhythm, not a mode.

## 2. The checks, in the order CI runs them

```powershell
pnpm tokens:check     # src/styles/tokens.* and the brand assets are current with docs/design
pnpm messages:check   # en/ar key parity, no empty strings, Latin figures, both scripts present
pnpm lint             # eslint: next + better-tailwindcss + the sahra rules
pnpm lint:selftest    # every sahra/tailwind rule fires on its fixture, none on the clean one
pnpm typecheck
pnpm format:check
pnpm build            # static export into out/
pnpm verify           # all of the above
```

`pnpm test` (Playwright) runs with this project's default worker count, which
launches one Chromium instance per worker; on a machine with limited spare
CPU/RAM that can starve individual page loads and show a handful of
unrelated-looking flaky failures. If `pnpm test` shows scattered failures,
re-run with `pnpm exec playwright test --workers=4` (or lower) before
treating any of them as real — CI sets its own worker count and is not
affected by this.

Every spec imports `test`/`expect` from `tests/fixtures.ts`, not from
`@playwright/test`: the fixture answers every `tile.openstreetmap.org` request
with a 1×1 PNG, so a run of ~200 page loads never asks the volunteer tile
servers for anything, and the map test asserts Leaflet's container and the
five markers, never pixels. A new spec that imports Playwright directly would
quietly start fetching real tiles.

Never read `$?` after piping into `tail`. Redirect to a file and read the
command's own exit code (ENGINEERING-STANDARDS, incident 6).

## 3. Tokens — one source, regenerate, never edit

`docs/design/tokens.json` is the only place a colour, spacing, radius, shadow,
type size or font stack is written. `pnpm tokens` regenerates:

- `src/styles/tokens.css` — `:root` variables (`--sahra-*`), `.theme-night`,
  the Tailwind default-theme resets and an `@theme inline` block. After it,
  `bg-purple-500` is an **unknown class** (lint error) and `bg-terracotta` is a
  class. `p-7` does not exist because `space-7` is not a token; `p-8` does.
- `src/styles/tokens.ts` — the same values for code that needs a value
  (`cssVar('accent')` for a GSAP tween; the raw hex only for OG images).
- `src/fonts/poppins/*.ttf` + licence, `public/brand/*.png`, `src/app/icon.png`.

Colour tokens whose name starts with `text-` (`text-body`, `text-soft`,
`text-faint`) drop that prefix in the class: `text-body`, not `text-text-body`.
That is the only rename, and it lives in `tools/generate-tokens.ts`.

`--spacing-0` is emitted even though `space-0` is not a token — zero is the
absence of spacing, the same way `Colors.transparent` is allowed in the app.

## 4. Copy — one file per locale

`messages/en.json` is the schema; `messages/ar.json` must match it key for key.
Components read `getMessages(locale)`; a literal string in JSX or in an `alt`,
`title`, `placeholder` or `aria-label` is a lint error (`sahra/no-hardcoded-copy`).
Figures are Latin in Arabic too — `formatNumber(locale, n)` pins
`ar-EG-u-nu-latn`, and `messages:check` rejects any Arabic-Indic digit.

The copy is the owner's Claude Design artboard's, where it is true, with every
departure listed in decision 2026-09-10 §6 ("The landing is the owner's Claude
Design artboard"). The Arabic headline "جو الليلة فين؟" is owner-approved; the
rest of the Arabic is native copy drafted from the artboard, **not yet reviewed
line by line by the product owner**. Figures stay Latin; "Google Play" is the
one value allowed to be the same in both files (a proper name, not copy).

## 5. Direction — logical only

`pl-4`, `ml-2`, `text-left`, `rounded-l-lg`, `left-0` are lint errors
(`sahra/no-physical-direction`). Use `ps-4`, `ms-2`, `text-start`,
`rounded-s-lg`, `start-0`. Same for style objects: `insetInlineStart`, not `left`.

Routes: EN at `/`, AR at `/ar`, from two route groups with their own root
layouts (`src/app/(en)`, `src/app/(ar)`), so `<html lang dir>` is static per tree
and the font stack follows it from `globals.css`. Add a page by adding it to
both groups; the body lives once, in `src/site/`.

## 6. Look at it — screenshots are the evidence, not the description

```powershell
pnpm build
node tools/snap.ts --out .snaps\phase1                 # / and /ar at 1280 and 380 px
node tools/snap.ts --routes /faq,/ar/faq --reduced-motion
```

`--scroll` walks the page first so the scroll reveals have run; `--sections`
adds one PNG per band (`root--1280--hero.png`, `ar--380--faq.png`…) so a review
looks at one thing at a time; `--open-menu` adds the phone with its menu open.
`.snaps/` is gitignored. Every "done" in a report links these — nothing is
committed before the owner has seen 1280, 1440 and 380 in both languages.

The "where" band is a live Leaflet map over OpenStreetMap tiles
(`cairo-map.tsx`); `snap.ts` does not mock them, so screenshots need the
network and cost a few tile fetches per page — fine for a review, not for a
loop.

## 7. Product screenshots — `public/shots/`, captured, never drawn

```powershell
pnpm shots                     # everything
pnpm shots --skip-flutter      # only the operator render
pnpm shots --skip-operator     # only the app frames
```

**Diner app** — drives `apps/customer_app/test/journey/journey_screenshots_test.dart`
(the walk-through harness, single owner of the fixtures) with `--update-goldens`,
`WALKTHROUGH_BANNER=off`, `WALKTHROUGH_DPR=2` (780×1400 files, laid out at 390 CSS px
so they are sharp on 2× displays and never upscaled) and `WALKTHROUGH_HEIGHT=640`
(a real short phone, so the booking screen shows its confirm bar under the time
chips rather than below an empty middle), once light and once
`WALKTHROUGH_BRIGHTNESS=dark`, and copies four frames per language and theme:

| frame            | file            |
| ---------------- | --------------- |
| `04-home`        | `discover.png`  |
| `09-venue`       | `venue.png`     |
| `14-slot-chosen` | `book.png`      |
| `18-confirmed`   | `confirmed.png` |

into `public/shots/<en|ar>/<day|night>/`. The tool then **restores
`test/journey/walkthrough` from git** and refuses to finish if anything there
is still modified — the committed walk-through belongs to the Linux CI Flutter,
not to this machine. If Flutter's `pub get` also rewrote `pubspec.lock` or
`analysis_options.yaml` (a different Flutter than the one that owns them will),
the tool lists them; **do not commit those**.

Committed set captured with **Flutter 3.48.0-0.4.pre (beta) on Windows,
2026-09-10**. Screenshots are not goldens: a different Flutter changes pixels
and that is fine here.

**Launch gate:** that set must be **recaptured on Flutter 3.44.7 stable** (the
CI Flutter) before the site goes public. Arabic text rasterises differently
across Flutter versions and platforms, and these are the images the public
sees. Run `pnpm shots` on a machine or runner with 3.44.7 and commit the result. **The
recapture carries the 2× and 390×640 settings above** — a plain walk-through run
does not produce the files the site needs.

**SAHRA for Restaurants** does not exist yet. `public/shots/operator/{day,night}.png`
is `docs/design/ui_kits/operator/OperatorDashboard.jsx` rendered in headless
Chromium at its 1100×680 card size — a **reference render**, labelled as such
in the decision file, to be replaced by real screenshots when the app exists.
It needs the network (React from unpkg, Google fonts, Unsplash avatars).

**Photography** — `public/photos/` — is the nine stock pictures that came with
the owner's Claude Design export (four venue photos, three for the diner
card's strip, two used inside the drawn hero phone); `public/photos/
README.md` says which is which. The venues band captions four of them with
the artboard's own restaurant names; none of those businesses is a confirmed
SAHRA partner (decision §6 follow-up, §8). Replace with SAHRA's own venue
photography, and confirm or remove the names, before launch.

**The hero, how-it-works and get-the-app phones, and the "for restaurants"
window, are DRAWN** (`phone-shell.tsx`, HTML inside `operator.tsx`), not
captures — the owner's explicit call (decision §6 follow-up). `public/shots/`
and `tools/shots.ts` are unused by the landing as of this change and are kept
for the same reason the retired hero photograph is: a later revision may put
real captures back in one of these spots.

**The hero photograph is retired.** `assets/hero/source.png` and `pnpm hero:image`
stay in the repo, unused — decision §6 says why and what would bring them back.

## 8. What is NOT here yet

The landing is whole — the owner's artboard, all ten bands, both languages,
with `/privacy` and `/terms` as honest stubs. Still missing, all tracked in
decision 2026-09-10 §8: the store links (neither badge is a link until its
listing exists), a partner contact channel (every "Join SAHRA" lands on the
FAQ's joining answer), the legal text, real venue photography, the Flutter
3.44.7 recapture of `public/shots/`, OG images, and the Phase 3 CI job. The
"where" map draws OpenStreetMap's public tiles with the artboard's venue
counts; a paid tile provider and real counts are launch items. `SAHRA for
Restaurants` is a drawn window because the app does not exist yet.
