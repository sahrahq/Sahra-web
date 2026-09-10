# Hero image source

`source.png` — 1672×941, AI-generated (ChatGPT image generation, 2026-09-10),
supplied by the product owner, who holds the licence confirmation.

What it shows: a hand holding a phone with a BLANK black screen, a glass of tea
and mint, a plate of olives and bread, a cream plaster wall with a terracotta
circle. None of the objects is a real venue, a partner's food or a real place.
The screen is blank on purpose: `tools/hero-image.ts` composites a genuine app
capture (`public/shots/<locale>/day/book.png`) into it and writes
`public/hero/hero-<locale>-<width>.webp`. Nothing in the finished image invents
an interface. Provenance and what this does and does not settle:
`docs/decisions/2026-09-10-marketing-site-in-nextjs.md` §6.

Regenerate after a shots recapture: `pnpm hero:image`.
