<p align="center">
<img src="https://github.com/mracette/color-curves-app/blob/master/src/img/logo192.png" align="center" width="64px" height="64px">
<p>

# Color Curves

Color Curves is an app for making unique color palettes that can enhance data visualization and generative art projects. It provides a UI wrapper around the [color-curves](https://github.com/mracette/color-curves) library, which can be imported into your JS project and used programmatically.

Because of the highly visual nature of the Color Curves methodology, it may be easier to design palettes using the app and then import your finished palettes into your projects. 

The Color Curves editor is hosted at [colorcurves.app](https://colorcurves.app)

### Examples of palettes created with Color Curves

<img src="https://github.com/mracette/color-curves-app/blob/master/assets/beyond-belief-continuous.png" width="100%" height="40px"><img src="https://github.com/mracette/color-curves-app/blob/master/assets/goldfish-deluxe-continuous.png" width="100%" height="40px"><img src="https://github.com/mracette/color-curves-app/blob/master/assets/trix-sky-continuous.png" width="100%" height="40px"><img src="https://github.com/mracette/color-curves-app/blob/master/assets/warm-magma-continuous.png" width="100%" height="40px">

## Methodology

### The HSL Color Space

HSL (hue, saturation, lightness) is an alternative representation of the RGB color model. It was designed to more closely align with the way human vision perceives color-making attributes.

The 3 values that make up an HSL color can be visualized by a color wheel:
1. **Hue** - Rotation around the color wheel, in radians
2. **Saturation** - Distance from the center of the color wheel, usually normalized to [0, 1] or [0%, 100%]
3. **Lightness** - Distance along a secondary axis, usually normalized to [0, 1] or [0%, 100%]

<img src="https://github.com/mracette/color-curves-app/blob/master/assets/hsl-diagram.png" width="320px" height="240px">

### Plotting Curves

Color Curves separtes the HSL schema into two distinct parts: Hue-Saturation (HS) and Lightness (L).

#### Hue-Saturation (HS)

All possible hue and saturation values are projected onto a **unit circle**, upon which a curve is drawn that traces out the specific HS values for the palette. The length of the curve will always be normalized to 1, such that the starting point of the curve (represented by a green dot) will map to the starting point of the palette. The end of the curve (red dot) will map to the end of the palette. Values in between are given based on the location of the curve at that point.

<img src="https://github.com/mracette/color-curves-app/blob/master/assets/hs-chart.png">  

An exponential curve mapped onto the HS space

#### Lightness (L)

All possible lightness values are projected onto a **unit square**, upon which a curve is drawn that traces out the specific lightness values for the palette. This works in much the same way as the HS chart, with the exception that it only maps one value to the palette, which is represented by Y value (height) of the curve. For this reason, the only consideration for the lightness chart is how quickly the curve moves up. Translating the curve along the X-Axis only affects the palette if doing so clips a portion of the curve.

<img src="https://github.com/mracette/color-curves-app/blob/master/assets/l-chart.png">

A linear curve mapped onto the L space

#### The Resulting Palette

The palette produced by the editor combines the input from the HS and L editors. The curves in the examples above would produce the following palette:

<img src="https://github.com/mracette/color-curves-app/blob/master/assets/example-palette.png" width="100%" height="40px">

Notice how both the HS curve and the resulting palette start with a saturated blue, and move across the purple continuum, finally reaching a saturated orange color. Furthermore, notices how the lightness maps to the L chart. The darkest shade is on the left, and the palette gradually increases in lightness as it moves to the right. 
