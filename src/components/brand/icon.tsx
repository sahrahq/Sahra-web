// Port of docs/design/components/core/Icon.jsx; the drawings are icon-paths.ts, generated from it
// by tools/generate-tokens.ts. An unknown `name` is a type error, not the reference's Lucide
// fallback from a CDN: the site makes no third-party request for a glyph.
import type { CSSProperties } from 'react';
import { ICON_PATHS as PATHS } from './icon-paths';

export type IconName = keyof typeof PATHS;
export const iconNames = Object.keys(PATHS) as IconName[];

// The markup strings are parsed once into shapes, so React renders real nodes rather than
// `dangerouslySetInnerHTML`. An attribute outside ALLOWED throws at module load.
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
  /** Decorative (`aria-hidden`), as in the reference, unless a label is passed. */
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
