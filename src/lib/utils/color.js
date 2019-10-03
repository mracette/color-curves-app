/* 
    This code is based on https://en.wikipedia.org/wiki/HSL_and_HSV
    Free to use for any purpose. No attribution needed.
    For a helpful explanation on HSL and RGB conversion, see:
    https://stackoverflow.com/a/39147465/3064334
*/

export const rgbToHsl = (r, g, b) => {

    /**
     * Converts an RGB color value to HSL.
     * Returns h value in the set [0, 359].
     * Returns s and l values in the set [0, 1].
     *
     * @param   {number}  r       The red color value in the range [0, 255]
     * @param   {number}  g       The green color value in the range [0, 255]
     * @param   {number}  b       The blue color value in the range [0, 255]
     * @return  {Object}          The HSL representation
     */

    r /= 255; g /= 255; b /= 255;
    let max = Math.max(r, g, b);
    let min = Math.min(r, g, b);
    let d = max - min;
    let h;
    if (d === 0) h = 0;
    else if (max === r) h = (g - b) / d % 6;
    else if (max === g) h = (b - r) / d + 2;
    else if (max === b) h = (r - g) / d + 4;
    let l = (min + max) / 2;
    let s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
    return {h: h * 60, s, l};

}
  
export const hslToRgb = (h, s, l) => {

    /**
     * Converts an HSL color value to RGB.
     * Returns r, g, and b values in the set [0, 255].
     *
     * @param   {number}  h       The hue value as a degree
     * @param   {number}  s       The saturation value in the range [0, 1]
     * @param   {number}  l       The lightness color value in the range [0, 1]
     * @return  {Object}          The RGB representation
     */

    if(h < 0) h = (h % 360) + 360;
    else h = (h % 360);
    let c = (1 - Math.abs(2 * l - 1)) * s;
    let hp = h / 60.0;
    let x = c * (1 - Math.abs((hp % 2) - 1));
    let rgb1;
    if (isNaN(h)) rgb1 = [0, 0, 0];
    else if (hp <= 1) rgb1 = [c, x, 0];
    else if (hp <= 2) rgb1 = [x, c, 0];
    else if (hp <= 3) rgb1 = [0, c, x];
    else if (hp <= 4) rgb1 = [0, x, c];
    else if (hp <= 5) rgb1 = [x, 0, c];
    else if (hp <= 6) rgb1 = [c, 0, x];
    let m = l - c * 0.5;
    return {
        r: Math.round(255 * (rgb1[0] + m)),
        g: Math.round(255 * (rgb1[1] + m)),
        b: Math.round(255 * (rgb1[2] + m))
    };
}

export const rgbToHex = (r, g, b) => {

    /**
     * Converts an RGB color value to a hexadecimal string.
     * Returns hex value in the range [#000000, #FFFFFF].
     * See: https://stackoverflow.com/a/5624139/3064334
     *
     * @param   {number}  r       The red color value in the range [0, 255]
     * @param   {number}  g       The green color value in the range [0, 255]
     * @param   {number}  b       The blue color value in the range [0, 255]
     * @return  {String}          The hex representation
     */

    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);

}

export const hexToRgb = (hex) => {

    /**
     * Converts a hexadecimal string to an RGB color value.
     * Returns r, g, and b values in the set [0, 255].
     * See: https://stackoverflow.com/a/5624139/3064334
     *
     * @param   {String}  hex     The hex value in the range [#000000, #FFFFFF]
     * @return  {Object}          The rgb representation
     */

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
    
}
    
export const printHsl = (h, s, l) => {

/**
 * Prints an HSL color in standard CSS format
 * See: https://drafts.csswg.org/css-color/#the-hsl-notation
 *
 * @param   {number}  h       The hue value as a number
 * @param   {number}  s       The saturation value in the range [0, 1]
 * @param   {number}  l       The lightness color value in the range [0, 1]
 * @return  {String}          The HSL color string
 */

 return `hsl(${h}, ${s*100}%, ${l*100}%)`;

}

export const printRgb = (r, g, b) => {

    /**
     * Prints an RGB color in standard CSS format
     * See: https://drafts.csswg.org/css-color/#the-hsl-notation
     *
     * @param   {number}  r       The red color value in the range [0, 255]
     * @param   {number}  g       The green color value in the range [0, 255]
     * @param   {number}  b       The blue color value in the range [0, 255]
     * @return  {String}          The RGB color string
     */
    
     return `rgb(${r}, ${g}, ${b})`;
    
    }