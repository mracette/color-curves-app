/**
 * The 13 preset palettes from the legacy color-curves library (v0.0.7),
 * copied verbatim from src/palettes/*.js: the three JSON strings each class
 * passed to the ColorPalette constructor (hsCurve, lCurve, palette params).
 * Alphabetical by palette name.
 */

export interface LegacyPreset {
  hs: string;
  l: string;
  palette: string;
}

export const legacyPresets: readonly LegacyPreset[] = [
  {
    // AllAround
    hs: '{"type":"arc","overflow":"clamp","reverse":false,"translation":{"x":0,"y":0},"scale":{"x":1,"y":1},"rotation":0,"angleStart":0,"angleEnd":6.283,"angleOffset":0,"radius":0.5}',
    l: '{"type":"arc","overflow":"clamp","reverse":false,"translation":{"x":0.5,"y":0.5},"scale":{"x":1,"y":1},"rotation":0,"angleStart":0,"angleEnd":6.283,"angleOffset":0,"radius":0.25}',
    palette: '{"start":0,"end":1,"name":"All Around","author":"Color Curves"}',
  },
  {
    // BeyondBelief
    hs: '{"type":"exponential","overflow":"clamp","reverse":false,"translation":{"x":-0.88,"y":-0.84},"scale":{"x":1.848,"y":0.765},"rotation":10.556,"variation":"in"}',
    l: '{"type":"sinusoidal","overflow":"clamp","reverse":false,"translation":{"x":-0.1,"y":0.25},"scale":{"x":1.02,"y":0.29},"rotation":-1.257,"variation":"in"}',
    palette: '{"start":0.23,"end":1,"name":"Beyond Belief","author":"Color Curves"}',
  },
  {
    // CandyPaint
    hs: '{"type":"exponential","overflow":"clamp","reverse":false,"translation":{"x":-0.924,"y":-0.45},"scale":{"x":1.848,"y":0.77},"rotation":0,"variation":"in"}',
    l: '{"type":"linear","overflow":"clamp","reverse":false,"translation":{"x":0,"y":0.25},"scale":{"x":1,"y":0.5},"rotation":4.541}',
    palette: '{"start":0.02,"end":1,"name":"Candy Paint","author":"Color Curves"}',
  },
  {
    // CoralScrub
    hs: '{"type":"linear","overflow":"clamp","reverse":false,"translation":{"x":-0.97,"y":0.11},"scale":{"x":1.8,"y":0.52},"rotation":0}',
    l: '{"type":"linear","overflow":"clamp","reverse":false,"translation":{"x":0,"y":0.39},"scale":{"x":0.93,"y":0.27},"rotation":0}',
    palette: '{"start":0,"end":1,"name":"Coral Scrub","author":"Color Curves"}',
  },
  {
    // GoldfishDeluxe
    hs: '{"type":"exponential","overflow":"clamp","reverse":false,"translation":{"x":-0.924,"y":-0.383},"scale":{"x":1.848,"y":0.765},"rotation":3.171,"variation":"in"}',
    l: '{"type":"linear","overflow":"clamp","reverse":false,"translation":{"x":0,"y":0.05},"scale":{"x":1,"y":0.44},"rotation":2.69}',
    palette: '{"start":0,"end":1,"name":"Goldfish Deluxe","author":"Color Curves"}',
  },
  {
    // OnVacation
    hs: '{"type":"exponential","overflow":"clamp","reverse":false,"translation":{"x":-0.94,"y":-0.383},"scale":{"x":1.94,"y":0.765},"rotation":-0.534,"variation":"in"}',
    l: '{"type":"back","overflow":"clamp","reverse":false,"translation":{"x":0,"y":0.48},"scale":{"x":1,"y":0.43},"rotation":-0.346,"variation":"in","overshoot":1.702}',
    palette: '{"start":0,"end":1,"name":"On Vacation","author":"Color Curves"}',
  },
  {
    // PhytoPlankton
    hs: '{"type":"exponential","overflow":"clamp","reverse":false,"translation":{"x":-1.12,"y":0.5},"scale":{"x":2.17,"y":0.765},"rotation":0.691,"variation":"in"}',
    l: '{"type":"polynomial","overflow":"clamp","reverse":false,"translation":{"x":0,"y":0.44},"scale":{"x":1,"y":0.41},"rotation":6.974,"variation":"in","exponent":3}',
    palette: '{"name": "Phyto Plankton", "author": "Color Curves", "start":0,"end":0.72}',
  },
  {
    // PolarBeyond
    hs: '{"type":"bounce","overflow":"clamp","reverse":false,"translation":{"x":-0.924,"y":-0.92},"scale":{"x":1.848,"y":0.45},"rotation":4.3,"variation":"in"}',
    l: '{"type":"exponential","overflow":"clamp","reverse":false,"translation":{"x":0,"y":0.43},"scale":{"x":1,"y":0.19},"rotation":0,"variation":"in-out"}',
    palette: '{"start":0.53,"end":0.87,"name":"Polar Beyond","author":"Color Curves"}',
  },
  {
    // PowerWashed
    hs: '{"type":"polynomial","overflow":"clamp","reverse":true,"translation":{"x":-0.68,"y":-0.09},"scale":{"x":1.21,"y":0.25},"rotation":2.827,"variation":"in","exponent":1.74}',
    l: '{"type":"sinusoidal","overflow":"clamp","reverse":true,"translation":{"x":0,"y":0.73},"scale":{"x":1,"y":-0.07},"rotation":0,"variation":"in"}',
    palette: '{"name":"Power Washed","author":"Color Curves","start":0,"end":0.86}',
  },
  {
    // StockImage
    hs: '{"type":"elastic","overflow":"clamp","reverse":false,"translation":{"x":-2.49,"y":-0.383},"scale":{"x":1.848,"y":0.765},"rotation":0,"variation":"in","amplitude":1,"period":0.3}',
    l: '{"type":"arc","overflow":"clamp","reverse":false,"translation":{"x":0.5,"y":-0.71},"scale":{"x":1,"y":5.66},"rotation":0,"angleStart":0,"angleEnd":1.319,"angleOffset":0.942,"radius":0.25}',
    palette: '{"name": "Stock Image", "author": "Color Curves", "start":0,"end":1}',
  },
  {
    // TrixSky
    hs: '{"type":"exponential","overflow":"clamp","reverse":false,"translation":{"x":-1.31,"y":-0.383},"scale":{"x":1.848,"y":0.765},"rotation":5.81,"variation":"in"}',
    l: '{"type":"linear","overflow":"clamp","reverse":false,"translation":{"x":0,"y":0.34},"scale":{"x":1,"y":0.5},"rotation":0}',
    palette: '{"start":0,"end":1,"name":"Trix Sky","author":"Color Curves"}',
  },
  {
    // UnAmerican
    hs: '{"type":"polynomial","overflow":"clamp","reverse":false,"translation":{"x":-0.924,"y":-0.383},"scale":{"x":1.848,"y":0.765},"rotation":2.75,"variation":"out","exponent":3}',
    l: '{"type":"linear","overflow":"clamp","reverse":false,"translation":{"x":0,"y":0.25},"scale":{"x":1,"y":0.74},"rotation":0}',
    palette: '{"start":0,"end":1,"name":"Un-American","author":"Color Curves"}',
  },
  {
    // WarmMagma
    hs: '{"type":"exponential","overflow":"clamp","reverse":false,"translation":{"x":-0.66,"y":-0.58},"scale":{"x":1.61,"y":0.76},"rotation":0.84,"variation":"in"}',
    l: '{"type":"sinusoidal","overflow":"clamp","reverse":false,"translation":{"x":0,"y":0.37},"scale":{"x":1,"y":0.24},"rotation":0,"variation":"out"}',
    palette: '{"start":0.05,"end":1,"name":"Warm Magma","author":"Color Curves"}',
  },
];
