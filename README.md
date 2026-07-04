<p align="center">
<img src="https://github.com/mracette/color-curves-app/blob/master/packages/app/public/logo192.png" align="center" width="64px" height="64px">
<p>

# Color Curves

Color Curves builds color palettes from curves drawn through color space. One spline travels across a hue–chroma wheel, another shapes lightness, and sampling both from start to end yields a continuous palette — or any number of discrete stops. Palettes are made for data visualization and generative art.

The editor is hosted at [colorcurves.app](https://colorcurves.app).

This repository is a monorepo:

| package | what it is |
| --- | --- |
| [`packages/color-curves`](packages/color-curves) | The engine — a zero-dependency TypeScript library: splines, OKLCH/HSL color pipeline with sRGB gamut mapping, palette sampling, serialization, contrast + color-vision analysis, and a legacy-format importer. |
| [`packages/app`](packages/app) | The editor — a Vite + React app around the library: direct-manipulation spline editing, live previews, accessibility checks, a dozen export formats, shareable URLs. |

## How it works

A palette is two curves:

1. **The wheel curve** — a 2D spline on a polar surface where angle is **hue** and radius is **chroma** (OKLCH) or **saturation** (HSL). Center is gray; the rim is maximum color.
2. **The lightness curve** — a function `y = f(t)` shaping **lightness** across the palette.

Sampling `t ∈ [0, 1]` along both curves produces a color at every point. Palettes default to **OKLCH**, a perceptually uniform space: equal distances along the curve read as equal visual steps, which keeps ramps smooth and data visualizations honest. The dashed contour on the wheel marks the sRGB gamut boundary; out-of-gamut colors are pulled back inside by CSS Color 4 style chroma reduction. Classic HSL is available per palette.

## The editor

- **Direct manipulation** — drag points, drag the curve body to move it, double-click the curve to add a point, double-click a point to remove it, alt-drag to pull out tangent handles, and toggle smooth/corner/auto tangents per point. Starting shapes (arc, circle, wave, spiral, …) bake into editable points.
- **Live previews** — the palette applied to line/bar/scatter/heatmap charts and a UI mockup, updating as you drag.
- **Accessibility** — WCAG and APCA contrast matrices, color-vision-deficiency simulation, and ΔE warnings for indistinguishable stops.
- **Exports** — hex/RGB/OKLCH lists, CSS custom properties and gradients, design tokens, Tailwind config, JS/TS snippets, a d3-style interpolator, SVG swatches, and PNG.
- **Share links** — one click packs the whole palette into a compact URL; opening it restores the exact curves. The editor itself is a scratchpad: refresh for a fresh slate, save to the library to keep something.

## Using the library

```bash
npm install color-curves
```

```ts
import { createPalette, shapes, hexAt, stops, cssGradient, interpolator } from 'color-curves';

const palette = createPalette({
  wheel: shapes.spiral({ turns: 1.25 }),
  light: shapes.ease(0.2, 0.9),
});

hexAt(palette, 0.5);                    // '#8a5cc7'
stops(palette, 8).map((c) => c.rgb);    // 8 discrete colors
cssGradient(palette);                   // 'linear-gradient(90deg, …)'
const f = interpolator(palette);        // d3-style: t → hex
```

Palettes designed in the editor export as code that reconstructs them exactly (`parsePalette` + the palette's JSON), and palettes from the original 2019 app can be imported with `importLegacy`.

## Development

```bash
npm install
npm run dev        # editor at http://localhost:5173
npm test           # library + app unit tests
npm run build      # production build in packages/app/dist
```

The app compiles the library from source (no build step needed during development). Deploys run from GitHub Actions to GitHub Pages on pushes to `master`.

## License

GPL-3.0 — see [LICENSE](LICENSE).
