// PLANTED VIOLATIONS. Every rule in tools/eslint/sahra-rules.mjs and the two
// Tailwind rules in eslint.config.mjs must fire on this file, or
// tools/eslint/selftest.mjs fails. This file is excluded from `pnpm lint`.
//
// The comment above each line names the rule expected to fire on it.

export function Violations() {
  return (
    <section>
      {/* sahra/no-hardcoded-copy: JSX text */}
      <h1>Find the vibe for tonight</h1>
      {/* sahra/no-hardcoded-copy: an attribute a person reads */}
      <img src="/brand/logo.png" alt="SAHRA logo" />
      {/* sahra/no-physical-direction: a physical utility, with a variant */}
      <div className="md:pl-4 text-left" />
      {/* sahra/no-physical-direction: a physical style key, and textAlign */}
      <div style={{ paddingLeft: 8, textAlign: 'right' }} />
      {/* sahra/no-color-literal: a hex, and a colour function */}
      <div style={{ background: '#C64A2B', color: 'rgba(0,0,0,.5)' }} />
      {/* better-tailwindcss/no-unknown-classes: not a token */}
      <div className="bg-purple-500" />
      {/* better-tailwindcss/no-restricted-classes: an arbitrary value */}
      <div className="p-[13px]" />
    </section>
  );
}
