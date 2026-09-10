// SAHRA custom icon set — ported from docs/design/components/core/Icon.jsx.
// One uniform 1.6px line hand drawn from Cairo dining culture (tea glass,
// mezze plate, lantern, shisha) alongside matching UI glyphs, so the whole
// site shares one voice instead of a generic icon library.
//
// Two deliberate differences from the reference:
//   - `name` is a union type, so an icon that does not exist is a COMPILE
//     error. The reference fell back to Lucide from a CDN; a marketing page
//     must not make a third-party request for a glyph, and a fallback that
//     looks almost right is how the set stops growing.
//   - Path data is rendered as real SVG children, not `dangerouslySetInnerHTML`.
//
// The drawings are NOT typed here. icon-paths.ts is generated from Icon.jsx by
// tools/generate-tokens.ts and drift-checked with the tokens, so the design
// package stays the one owner (an earlier version of this file retyped them
// "kept in step by eye", and drifted within a day).
import type { CSSProperties } from 'react';
import { ICON_PATHS as PATHS } from './icon-paths';

export type IconName = keyof typeof PATHS;
export const iconNames = Object.keys(PATHS) as IconName[];

// The reference stores markup strings; here they are parsed once into element
// descriptions so React renders real nodes. Attributes in the source use
// single quotes and a fixed vocabulary (d, cx, cy, r, x, y, width, height, rx,
// stroke-dasharray) — anything else is a hard error at module load, which is
// where a bad drawing should fail.
type Shape = { tag: string; attrs: Record<string, string> };
const ATTR = /([a-z-]+)='([^']*)'/g;
const ELEMENT = /<(path|circle|rect)\s+([^>]*?)\/>/g;
const ALLOWED = new Set(['d', 'cx', 'cy', 'r', 'x', 'y', 'width', 'height', 'rx', 'stroke-dasharray']);

function parse(markup: string): Shape[] {
  const shapes: Shape[] = [];
  for (const el of markup.matchAll(ELEMENT)) {
    const attrs: Record<string, string> = {};
    for (const a of el[2].matchAll(ATTR)) {
      if (!ALLOWED.has(a[1])) throw new Error(`Icon: unsupported attribute ${a[1]}`);
      attrs[a[1] === 'stroke-dasharray' ? 'strokeDasharray' : a[1]] = a[2];
    }
    shapes.push({ tag: el[1], attrs });
  }
  if (shapes.length === 0) throw new Error('Icon: empty drawing');
  return shapes;
}

const SHAPES: Record<IconName, Shape[]> = Object.fromEntries(
  iconNames.map((n) => [n, parse(PATHS[n])]),
) as Record<IconName, Shape[]>;

export interface IconProps {
  name: IconName;
  /** In CSS px; the reference default. */
  size?: number;
  className?: string;
  style?: CSSProperties;
  /** Decorative by default, exactly like the reference (`aria-hidden`). Pass a label to make it meaningful. */
  label?: string;
}

export function Icon({ name, size = 20, className, style, label }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={label ? undefined : true}
      role={label ? 'img' : undefined}
      aria-label={label}
      className={className}
      style={{ flexShrink: 0, display: 'inline-block', ...style }}
    >
      {SHAPES[name].map((s, i) => {
        const Tag = s.tag as 'path' | 'circle' | 'rect';
        return <Tag key={i} {...s.attrs} />;
      })}
    </svg>
  );
}
