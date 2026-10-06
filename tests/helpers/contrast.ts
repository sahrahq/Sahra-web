// WCAG contrast of an element's colour against what is painted behind it, read in paint order with
// `elementsFromPoint`: a caption's shade is a sibling, which no ancestor walk sees. Computed
// gradients keep `color-mix()` unflattened, so colours resolve through a canvas `fillStyle`.
import type { Locator } from '@playwright/test';

export async function contrast(el: Locator): Promise<number> {
  return el.evaluate((node) => {
    const parseColor = (c: string): [number, number, number, number] | null => {
      const m = c.match(/[\d.]+/g);
      if (!m) return null;
      const [r, g, b, a = '1'] = m;
      return [Number(r), Number(g), Number(b), Number(a)];
    };
    // A canvas 2D context normalises any valid CSS colour function
    // (rgb/hsl/color-mix/oklch…) to `#rrggbb` or `rgba(...)` on readback.
    const ctx = document.createElement('canvas').getContext('2d')!;
    const normalise = (token: string): [number, number, number, number] | null => {
      try {
        ctx.fillStyle = '#000';
        ctx.fillStyle = token;
        return parseColor(ctx.fillStyle);
      } catch {
        return null;
      }
    };
    // Pull out each top-level `name(...)` colour function in a gradient
    // string, respecting nesting (`color-mix(in srgb, rgb(1,2,3) 78%, …)`),
    // which `[^)]*` regexes cannot do.
    const colorFunctions = (text: string): string[] => {
      const out: string[] = [];
      const re = /(rgba?|hsla?|hwb|lab|lch|oklab|oklch|color-mix|color)\(/gi;
      let m: RegExpExecArray | null;
      while ((m = re.exec(text))) {
        let depth = 1;
        let i = m.index + m[0].length;
        for (; i < text.length && depth > 0; i++) {
          if (text[i] === '(') depth++;
          else if (text[i] === ')') depth--;
        }
        out.push(text.slice(m.index, i));
      }
      return out;
    };
    const darkestGradientStop = (image: string): [number, number, number, number] | null => {
      if (!image.includes('gradient')) return null;
      const stops = colorFunctions(image)
        .map(normalise)
        .filter((c): c is [number, number, number, number] => c !== null);
      if (stops.length === 0) return null;
      return stops.reduce((a, b) => (a[3] >= b[3] ? a : b));
    };
    const lin = (v: number) => {
      const c = v / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    };
    const lum = ([r, g, b]: number[]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
    const over = (
      top: [number, number, number, number],
      base: [number, number, number],
    ): [number, number, number] => {
      const [r, g, b, a] = top;
      return [r * a + base[0] * (1 - a), g * a + base[1] * (1 - a), b * a + base[2] * (1 - a)];
    };

    const fg = parseColor(getComputedStyle(node).color)!;
    const rect = node.getBoundingClientRect();
    const x = Math.min(Math.max(rect.left + rect.width / 2, 0), window.innerWidth - 1);
    const y = Math.min(Math.max(rect.top + rect.height / 2, 0), window.innerHeight - 1);
    const stack = document.elementsFromPoint(x, y);
    const start = stack.indexOf(node as Element);
    const layers = (start >= 0 ? stack.slice(start + 1) : stack) as HTMLElement[];

    // Walk outward from the layer nearest the text, collecting translucent layers (solid or
    // gradient) until an opaque solid: the base everything above it is painted onto.
    const translucent: [number, number, number, number][] = [];
    let base: [number, number, number] | null = null;
    for (const layer of layers) {
      const cs = getComputedStyle(layer);
      const grad = darkestGradientStop(cs.backgroundImage);
      if (grad) translucent.push(grad);
      const solid = parseColor(cs.backgroundColor);
      if (solid && solid[3] > 0) {
        if (solid[3] >= 0.999) {
          base = [solid[0], solid[1], solid[2]];
          break;
        }
        translucent.push(solid);
      }
    }
    if (!base) throw new Error('no painted background found');
    // Composite nearest-to-text last, so its effect is the one that shows.
    let bg: [number, number, number] = base;
    for (const layer of translucent.reverse()) bg = over(layer, bg);

    const [hi, lo] = [lum(fg), lum(bg)].sort((a, b) => b - a);
    return (hi + 0.05) / (lo + 0.05);
  });
}
