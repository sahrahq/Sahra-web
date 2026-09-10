// SAHRA lint rules for apps/web — the two sahra_lints rules ported from Dart
// (packages/sahra_lints/lib/sahra_lints.dart: `_rtlRules`, `_stringRules`) plus
// the colour-literal half of `_designRules`, as ESLint rules so they run under
// the same `pnpm lint` as everything else.
//
// Every rule here has a planted violation in ./fixtures/violations.tsx and a
// clean twin in ./fixtures/clean.tsx; `node tools/eslint/selftest.mjs` fails if
// any rule stops firing on its fixture or starts firing on the clean file. A
// guard nobody has seen fail is decoration (ENGINEERING-STANDARDS).
//
// Escape hatch, deliberately loud: `// eslint-disable-next-line sahra/<rule> -- <reason>`.
// The reason is required by `reportUnusedDisableDirectives` + review, not by code.

const LETTERS = /[A-Za-z؀-ۿ]/g;

/** Attributes whose value a person READS. A literal in one is copy nobody will translate. */
const COPY_ATTRIBUTES = new Set([
  'alt',
  'title',
  'placeholder',
  'aria-label',
  'aria-description',
  'aria-placeholder',
  'aria-roledescription',
  'aria-valuetext',
  'label',
  'content',
]);

function hasCopy(text) {
  const letters = text.match(LETTERS);
  return letters !== null && letters.length >= 2;
}

/**
 * Physical-direction Tailwind utilities. In Arabic the leading edge is on the
 * right; a hardcoded `pl-4` mirrors wrongly and never fails — it just looks
 * subtly broken to half the users. Logical utilities (`ps-`, `pe-`, `ms-`,
 * `me-`, `start-`, `end-`, `text-start`, `text-end`, `rounded-s-`, `rounded-e-`,
 * `border-s`, `border-e`) are the only ones allowed.
 */
const PHYSICAL_CLASS =
  /^(?:[a-z0-9@:_.\[\]-]*:)?-?(?:pl|pr|ml|mr|left|right|inset-l|inset-r|scroll-pl|scroll-pr|scroll-ml|scroll-mr|rounded-tl|rounded-tr|rounded-bl|rounded-br|rounded-l|rounded-r|border-l|border-r|float-left|float-right|clear-left|clear-right|text-left|text-right|origin-left|origin-right|origin-top-left|origin-top-right|origin-bottom-left|origin-bottom-right)(?:-[^\s]+)?$/;

const PHYSICAL_STYLE_KEY =
  /^(?:left|right|padding(?:Left|Right)|margin(?:Left|Right)|border(?:Left|Right)(?:Width|Color|Style)?|border(?:Top|Bottom)(?:Left|Right)Radius|inset(?:Inline)?(?:Left|Right)|scrollPadding(?:Left|Right)|scrollMargin(?:Left|Right))$/;

/** A hex colour, or a colour function. `#partner` (an anchor) is not hex. */
const COLOR_LITERAL =
  /(?:^|[^&\w-])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})(?![\w-])|\b(?:rgba?|hsla?|oklch|oklab|color-mix)\(/;

function stringsIn(node) {
  // Every string literal and template quasi under a node, with the node to report on.
  if (!node) return [];
  if (node.type === 'Literal' && typeof node.value === 'string') return [{ node, text: node.value }];
  if (node.type === 'TemplateLiteral')
    return node.quasis.map((q) => ({ node: q, text: q.value.cooked ?? '' }));
  if (node.type === 'JSXExpressionContainer') return stringsIn(node.expression);
  if (node.type === 'ConditionalExpression')
    return [...stringsIn(node.consequent), ...stringsIn(node.alternate)];
  if (node.type === 'LogicalExpression') return [...stringsIn(node.left), ...stringsIn(node.right)];
  if (node.type === 'ArrayExpression') return node.elements.flatMap(stringsIn);
  if (node.type === 'CallExpression') return node.arguments.flatMap(stringsIn);
  if (node.type === 'ObjectExpression')
    return node.properties.flatMap((p) => (p.type === 'Property' ? stringsIn(p.key) : []));
  return [];
}

const noHardcodedCopy = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'User-facing text must come from the locale message files, never from a literal in a component.',
    },
    schema: [],
    messages: {
      jsxText:
        'Hardcoded copy "{{text}}" — put it in messages/<locale>.json and read it through the i18n layer.',
      attribute: 'Hardcoded copy in {{name}}="{{text}}" — put it in messages/<locale>.json.',
    },
  },
  create(context) {
    return {
      JSXText(node) {
        const text = node.value.trim();
        if (hasCopy(text)) context.report({ node, messageId: 'jsxText', data: { text: text.slice(0, 40) } });
      },
      JSXAttribute(node) {
        const name = node.name && node.name.name;
        if (typeof name !== 'string' || !COPY_ATTRIBUTES.has(name)) return;
        for (const { node: n, text } of stringsIn(node.value)) {
          if (hasCopy(text))
            context.report({ node: n, messageId: 'attribute', data: { name, text: text.slice(0, 40) } });
        }
      },
    };
  },
};

const noPhysicalDirection = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'No left/right in classes or styles — logical properties only, so Arabic mirrors correctly.',
    },
    schema: [],
    messages: {
      className:
        'Physical direction "{{token}}" — use the logical utility (ps/pe, ms/me, start/end, text-start/end, rounded-s/e, border-s/e).',
      styleKey:
        'Physical style property "{{key}}" — use the logical property (insetInlineStart, paddingInlineEnd, marginInlineStart…).',
      textAlign: 'textAlign "{{value}}" — use "start" or "end".',
    },
  },
  create(context) {
    function checkString(node, text) {
      for (const token of text.split(/\s+/)) {
        if (token && PHYSICAL_CLASS.test(token))
          context.report({ node, messageId: 'className', data: { token } });
      }
    }
    return {
      JSXAttribute(node) {
        const name = node.name && node.name.name;
        if (name !== 'className' && name !== 'class') return;
        for (const { node: n, text } of stringsIn(node.value)) checkString(n, text);
      },
      // `cn('pl-4', …)`, `clsx(...)`, `twMerge(...)` — class strings that never sit in an attribute.
      CallExpression(node) {
        const callee = node.callee;
        const fn = callee.type === 'Identifier' ? callee.name : null;
        if (fn !== 'cn' && fn !== 'clsx' && fn !== 'cx' && fn !== 'twMerge') return;
        for (const { node: n, text } of stringsIn(node)) checkString(n, text);
      },
      Property(node) {
        const key =
          node.key.type === 'Identifier'
            ? node.key.name
            : node.key.type === 'Literal'
              ? String(node.key.value)
              : null;
        if (!key) return;
        if (PHYSICAL_STYLE_KEY.test(key))
          context.report({ node: node.key, messageId: 'styleKey', data: { key } });
        if (
          key === 'textAlign' &&
          node.value.type === 'Literal' &&
          (node.value.value === 'left' || node.value.value === 'right')
        ) {
          context.report({ node: node.value, messageId: 'textAlign', data: { value: node.value.value } });
        }
      },
    };
  },
};

const noColorLiteral = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'No colour literals in source — colours come from tokens (Tailwind utilities or cssVar()).',
    },
    schema: [],
    messages: {
      literal: 'Colour literal in "{{text}}" — use a token utility, or cssVar() from src/styles/tokens.ts.',
    },
  },
  create(context) {
    function check(node, text) {
      if (COLOR_LITERAL.test(text))
        context.report({ node, messageId: 'literal', data: { text: text.slice(0, 40) } });
    }
    return {
      Literal(node) {
        if (typeof node.value === 'string') check(node, node.value);
      },
      TemplateElement(node) {
        check(node, node.value.cooked ?? '');
      },
    };
  },
};

const plugin = {
  meta: { name: 'eslint-plugin-sahra', version: '1.0.0' },
  rules: {
    'no-hardcoded-copy': noHardcodedCopy,
    'no-physical-direction': noPhysicalDirection,
    'no-color-literal': noColorLiteral,
  },
};

export default plugin;
