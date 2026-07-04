/// <reference types="node" />
/**
 * Generates src/presets.ts from the legacy preset palettes.
 * Run with: npx tsx scripts/generate-presets.ts
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { importLegacy } from '../src/migrate';
import { toJSON, type PaletteJSON, type PointJSON } from '../src/serialize';
import { legacyPresets } from './legacy-palettes';

function formatPoints(points: PointJSON[], indent: string): string {
  return points.map((pt) => `${indent}${JSON.stringify(pt)},`).join('\n');
}

function formatPalette(p: PaletteJSON): string {
  const lines = [
    '  {',
    '    v: 1,',
    `    space: ${JSON.stringify(p.space)},`,
  ];
  if (p.name !== undefined) lines.push(`    name: ${JSON.stringify(p.name)},`);
  if (p.author !== undefined) lines.push(`    author: ${JSON.stringify(p.author)},`);
  lines.push('    wheel: { points: [');
  lines.push(formatPoints(p.wheel.points, '      '));
  lines.push('    ] },');
  lines.push('    light: { points: [');
  lines.push(formatPoints(p.light.points, '      '));
  lines.push('    ] },');
  lines.push('  },');
  return lines.join('\n');
}

const palettes = legacyPresets.map((preset) =>
  toJSON(importLegacy(preset.hs, preset.l, preset.palette)),
);

const file = `// GENERATED FILE — do not edit by hand.
// Regenerate with: npx tsx scripts/generate-presets.ts
import { parsePalette } from './serialize';
import type { Palette } from './types';

const data: unknown[] = [
${palettes.map(formatPalette).join('\n')}
];

/** The 13 legacy color-curves presets, imported via importLegacy. */
export const presets: readonly Palette[] = data.map((d) => parsePalette(d));
`;

const outPath = join(dirname(fileURLToPath(import.meta.url)), '../src/presets.ts');
writeFileSync(outPath, file);
console.log(`Wrote ${outPath} (${palettes.length} presets)`);
for (const p of palettes) {
  console.log(
    `  ${String(p.name).padEnd(16)} wheel knots: ${String(p.wheel.points.length).padStart(3)}  light knots: ${String(p.light.points.length).padStart(3)}`,
  );
}
