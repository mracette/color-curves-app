import { cssGradient, toJSON, type Palette } from 'color-curves';
import type { PaletteSample } from '../state/selectors';

export interface ExportFormat {
  id: string;
  label: string;
  group: 'Values' | 'CSS' | 'Code' | 'Image';
  /** 'text' formats are copied; 'svg'/'png' are downloaded (svg also copyable). */
  kind: 'text' | 'svg' | 'png';
  ext?: string;
  generate(samples: PaletteSample[], doc: Palette): string;
}

function rgb255(sample: PaletteSample): string {
  const { r, g, b } = sample.rgb;
  return `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`;
}

function slug(doc: Palette): string {
  return (doc.name ?? 'palette')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'palette';
}

export function buildSwatchSvg(samples: PaletteSample[]): string {
  const sw = 72;
  const sh = 72;
  const label = 16;
  const w = sw * samples.length;
  const rects = samples
    .map(
      (s, i) =>
        `  <rect x="${i * sw}" y="0" width="${sw}" height="${sh}" fill="${s.hex}"/>\n` +
        `  <text x="${i * sw + sw / 2}" y="${sh + 12}" font-family="monospace" font-size="10" fill="#555" text-anchor="middle">${s.hex}</text>`,
    )
    .join('\n');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${sh + label}" viewBox="0 0 ${w} ${sh + label}">\n${rects}\n</svg>\n`;
}

export const FORMATS: ExportFormat[] = [
  {
    id: 'hex',
    label: 'Hex list',
    group: 'Values',
    kind: 'text',
    generate: (samples) => samples.map((s) => s.hex).join('\n'),
  },
  {
    id: 'rgb',
    label: 'RGB list',
    group: 'Values',
    kind: 'text',
    generate: (samples) => samples.map(rgb255).join('\n'),
  },
  {
    id: 'native',
    label: 'OKLCH / HSL list',
    group: 'Values',
    kind: 'text',
    generate: (samples) => samples.map((s) => s.css).join('\n'),
  },
  {
    id: 'css-props',
    label: 'Custom properties',
    group: 'CSS',
    kind: 'text',
    generate: (samples, doc) => {
      const name = slug(doc);
      const lines = samples.map((s, i) => `  --${name}-${i + 1}: ${s.hex};`);
      return `:root {\n${lines.join('\n')}\n}`;
    },
  },
  {
    id: 'css-gradient',
    label: 'Gradient',
    group: 'CSS',
    kind: 'text',
    generate: (_samples, doc) =>
      `background: ${cssGradient(doc, { stops: 16 })};\n\n/* conic */\nbackground: ${cssGradient(doc, { kind: 'conic', stops: 16 })};`,
  },
  {
    id: 'js-array',
    label: 'JS / TS array',
    group: 'Code',
    kind: 'text',
    generate: (samples, doc) =>
      `export const ${slug(doc).replace(/-([a-z0-9])/g, (_, c: string) => c.toUpperCase())} = [\n${samples
        .map((s) => `  '${s.hex}',`)
        .join('\n')}\n];`,
  },
  {
    id: 'interpolator',
    label: 'Interpolator (color-curves)',
    group: 'Code',
    kind: 'text',
    generate: (_samples, doc) =>
      `import { parsePalette, interpolator, stops } from 'color-curves';\n\nconst palette = parsePalette(${JSON.stringify(JSON.stringify(toJSON(doc)))});\n\n// d3-style continuous interpolator: t in [0, 1] → hex\nconst interpolate = interpolator(palette);\ninterpolate(0.5); // ${'=>'} a hex color\n\n// or discrete stops\nconst colors = stops(palette, 8).map((c) => c.rgb);`,
  },
  {
    id: 'svg',
    label: 'SVG swatches',
    group: 'Image',
    kind: 'svg',
    ext: 'svg',
    generate: (samples) => buildSwatchSvg(samples),
  },
  {
    id: 'png',
    label: 'PNG',
    group: 'Image',
    kind: 'png',
    ext: 'png',
    generate: () => '',
  },
];
