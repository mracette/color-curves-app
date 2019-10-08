import Arc from '../js/geometries/Arc';
import Linear from '../js/functions/Linear';
import { cartToPolar, radToDeg } from '../utils/math';
import { hslToRgb, rgbToHex, printRgb, printHsl } from '../utils/color';

class ColorPalette {

    constructor(hueSatCurve, lightCurve) {

        this.hsCurve = this.initializeCurve(hueSatCurve.type, hueSatCurve.params);
        this.lightCurve = this.initializeCurve(lightCurve.type, lightCurve.params);

    }

    initializeCurve(curveType, params) {

        switch(curveType) {

            case 'arc': 
                return new Arc();
            case 'linear':
                return new Linear();
                
        }

    }

    getCurveValues(n) {

        // get hue and saturation values from the hsCurve
        const hsCartCoords = this.hsCurve.getCartesianCoordsAt(n);
        const hsPolarCoords = cartToPolar(hsCartCoords.x, hsCartCoords.y);
        const hue = radToDeg(hsPolarCoords.theta) % 360;
        const sat = Math.max(0, Math.min(1, hsPolarCoords.r * 100));

        // get lightness values from the lightCurve
        const lCartCoords = cartesianCurve.getCartesianCoordsAt(n);
        const lightness = Math.max(0, Math.min(1, lCartCoords.y));

        return {
            h: hue,
            s: sat,
            l: lightness
        };

    }

    hslValueAt(n) {

        printHsl(...this.getCurveValues(n));

    }

    rgbValueAt(n) {

        hslValues = this.getCurveValues(n);
        rgbValues = hslToRgb(...hslValues);
        return printRgb(rgbValues);

    }

    hexValueAt(n) {

        hslValues = this.getCurveValues(n);
        rgbValues = hslToRgb(...hslValues);
        return rgbToHex(...rgbValues);
        

    }

}