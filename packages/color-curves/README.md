# color-curves

Design color palettes by drawing curves through color space. A palette is two splines: one travels across a hue–chroma wheel, another shapes lightness, and sampling both from start to end yields a continuous palette — or any number of discrete stops. Made for data visualization and generative art.

This is the engine behind the [Color Curves editor](https://colorcurves.app) — a zero-dependency TypeScript library: splines, OKLCH/HSL color pipeline with sRGB gamut mapping, palette sampling, serialization, contrast + color-vision analysis, and a legacy-format importer.

## Install

```bash
npm install color-curves
```

## Usage

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

Palettes default to **OKLCH**, a perceptually uniform space: equal distances along the curve read as equal visual steps. Out-of-gamut colors are pulled back into sRGB with CSS Color 4 style chroma reduction. Classic HSL is available per palette.

The easiest way to design a palette is the [editor](https://colorcurves.app) — it exports code that reconstructs the palette exactly (`parsePalette` + the palette's JSON). Palettes from the original 2019 app can be imported with `importLegacy`.

## Note on versions

Versions `0.0.x` are the original 2019 library and are unrelated to this API. Start at `1.0.0-beta.0`.

## License

GPL-3.0 — see [LICENSE](LICENSE). Source lives in the [color-curves-app monorepo](https://github.com/mracette/color-curves-app).
