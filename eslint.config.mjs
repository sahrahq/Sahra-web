import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import betterTailwindcss from 'eslint-plugin-better-tailwindcss';
import sahra from './tools/eslint/sahra-rules.mjs';

// Next's rules, the Tailwind plugin and ours (tools/eslint/sahra-rules.mjs) under one `pnpm lint`.
// tools/eslint/selftest.mjs fails if a rule in its EXPECTED list stops firing.
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // The fixtures are listed so the self-test lints them under this rule set;
    // globalIgnores below keeps them out of `pnpm lint`.
    files: ['src/**/*.{ts,tsx}', 'tools/**/*.{ts,mjs}', 'tools/eslint/fixtures/*.tsx'],
    plugins: { 'better-tailwindcss': betterTailwindcss, sahra },
    settings: {
      'better-tailwindcss': {
        // The CSS entry imports tokens.css, which resets Tailwind's default palette,
        // so the plugin's known classes are the token list.
        entryPoint: 'src/app/globals.css',
        // Classes declared in globals.css (@layer components) count as known.
        detectComponentClasses: true,
      },
    },
    rules: {
      // `theme-night` is declared in the generated tokens.css, which the plugin cannot
      // see: it reads the entry file but not its @import.
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
    // tokens.ts and its generator are the one place every colour is spelled.
    files: ['src/styles/tokens.ts', 'tools/generate-tokens.ts'],
    rules: { 'sahra/no-color-literal': 'off' },
  },
  {
    // The message loader and the check scripts handle copy as data.
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
