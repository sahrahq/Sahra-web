import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import betterTailwindcss from 'eslint-plugin-better-tailwindcss';
import sahra from './tools/eslint/sahra-rules.mjs';

// Three sources of rules, one command. See tools/eslint/sahra-rules.mjs for
// what the sahra rules are and why; tools/eslint/selftest.mjs proves every
// rule below can fail.
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // The fixtures are listed so the self-test lints them under the SAME rule set;
    // globalIgnores below keeps them out of `pnpm lint`.
    files: ['src/**/*.{ts,tsx}', 'tools/**/*.{ts,mjs}', 'tools/eslint/fixtures/*.tsx'],
    plugins: { 'better-tailwindcss': betterTailwindcss, sahra },
    settings: {
      'better-tailwindcss': {
        // Tailwind 4: the CSS entry. It imports the generated tokens.css, which
        // is what makes "bg-purple-500 is unknown" true — the default palette is
        // reset there, so the plugin's list of known classes is the token list.
        entryPoint: 'src/app/globals.css',
        // Component classes declared in globals.css (@layer components) are
        // registered classes, not typos: .how-steps, .how-sticky, .how-step-visual, .is-motion.
        detectComponentClasses: true,
      },
    },
    rules: {
      // `theme-night` is a real class, declared in the GENERATED src/styles/tokens.css
      // (it redefines the --sahra-* variables for a night section). The plugin reads
      // the entry file and does not follow its @import, so it cannot see the
      // declaration — this is the plugin's reach, not an unknown class. Any other
      // unknown class still fails.
      'better-tailwindcss/no-unknown-classes': ['error', { ignore: ['^theme-night$'] }],
      'better-tailwindcss/no-conflicting-classes': 'error',
      'better-tailwindcss/no-duplicate-classes': 'error',
      'better-tailwindcss/no-restricted-classes': [
        'error',
        {
          restrict: [
            {
              pattern: '^(?:[a-zA-Z0-9:/_@.-]*:)?!?-?[a-z][a-z0-9-]*\\[.*\\](?:/[0-9]{1,3})?$',
              message:
                'Arbitrary value "$0" — a value that is not a token is not a design decision anyone made.',
            },
          ],
        },
      ],
      'sahra/no-hardcoded-copy': 'error',
      'sahra/no-physical-direction': 'error',
      'sahra/no-color-literal': 'error',
    },
  },
  {
    // Generated, and the generator that writes it: tokens.ts spells every
    // colour once, on purpose.
    files: ['src/styles/tokens.ts', 'tools/generate-tokens.ts'],
    rules: { 'sahra/no-color-literal': 'off' },
  },
  {
    // The message loader and the check scripts handle copy as DATA.
    files: ['src/i18n/**', 'tools/**'],
    // …but not the fixtures, whose planted copy the self-test must see reported.
    ignores: ['tools/eslint/fixtures/**'],
    rules: { 'sahra/no-hardcoded-copy': 'off' },
  },
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    // Read only by tools/eslint/selftest.mjs.
    'tools/eslint/fixtures/**',
    'playwright-report/**',
    'test-results/**',
  ]),
]);

export default eslintConfig;
