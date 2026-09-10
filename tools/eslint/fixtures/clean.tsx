// THE FALSE-POSITIVE GUARD. Everything here is allowed and none of the sahra
// or Tailwind rules may fire on it. A rule that fires on already-correct code
// teaches people to silence it (ENGINEERING-STANDARDS, the docblockCallerClaims
// lesson), so this file is the other half of the self-test.

type Copy = { headline: string; logoAlt: string };

export function Clean({ copy }: { copy: Copy }) {
  const wide = true;
  return (
    <section className="bg-surface-page text-body ps-4 pe-4 ms-2 me-2 text-start rounded-lg shadow-1 font-latin text-h1 leading-tight">
      <h1 className={wide ? 'md:ps-4' : 'ps-2'}>{copy.headline}</h1>
      <img src="/brand/logo.png" alt={copy.logoAlt} className="rounded-s-md border-s" />
      {/* an anchor is not a hex colour; a number is not copy; a single letter is not copy */}
      <a href="#partner" className="text-accent" style={{ insetInlineStart: 0, textAlign: 'start' }}>
        2026 · ★
      </a>
    </section>
  );
}
