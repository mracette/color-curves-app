import Arc from '../js/geometries/Arc';
import Linear from '../js/functions/Linear';
import Polynomial from '../js/functions/Polynomial';
import Sinusoidal from '../js/functions/Sinusoidal';
import Exponential from '../js/functions/Exponential';
import Elastic from '../js/functions/Elastic';
import Back from '../js/functions/Back';
import Bounce from '../js/functions/Bounce';

import { cartToPolar, radToDeg } from '../utils/math';
import { hslToRgb, rgbToHex, printRgb, printHsl } from '../utils/color';

export default class ColorPalette {

    constructor() {

    }

    setHsCurve(curveType, params) {
        this.hsCurve = this.initializeCurve(curveType, 'unitCircle', params);
        this.hsCurveType = curveType;
    }

    setLCurve(curveType, params) {
        this.lCurve = this.initializeCurve(curveType, 'unitSquare', params);
        this.lCurveType = curveType;
    }

    getHsCurveType() {
        return this.hsCurveType;
    }

    getLCurveType() {
        return this.lCurveType;
    }

    initializeCurve(curveType, surface, params) {

        let rotation, translation, scale;

        switch(curveType) {

            case 'arc': 
                return new Arc(
                    surface,
                    surface.type === 'unitSquare' ? surface.x1 / 2 : 0,
                    surface.type === 'unitSquare' ? surface.y1 / 2 : 0,
                    0.5,
                    0,
                    Math.PI * 2,
                    0
                );
            case 'linear': 
                return new Linear(surface, params);
            case 'polynomial': 
                return new Polynomial(surface, rotation, translation, scale);
            case 'sinusoidal':
                return new Sinusoidal(surface, rotation, translation, scale);
            case 'exponential':
                return new Exponential(surface, rotation, translation, scale);
            case 'elastic':
                return new Elastic(surface, rotation, translation, scale);
            case 'back':
                return new Back(surface, rotation, translation, scale);
            case 'bounce':
                return new Bounce(surface, rotation, translation, scale);

        }

    }

    getCurveValues(n) {

        // get hue and saturation values from the hsCurve
        const hsCartCoords = this.hsCurve.getCartesianCoordsAt(n);
        const hsPolarCoords = cartToPolar(hsCartCoords.x, hsCartCoords.y);
        const hue = radToDeg(hsPolarCoords.theta) % 360;
        const sat = Math.max(0, Math.min(1, hsPolarCoords.r * 100));

        // get lightness values from the lightCurve
        const lCartCoords = this.lCurve.getCartesianCoordsAt(n);
        const lightness = Math.max(0, Math.min(1, lCartCoords.y));

        return {
            h: hue,
            s: sat,
            l: lightness
        };

    }

    hslValueAt(n) {

        const {h, s, l} = this.getCurveValues(n);
        return printHsl(h, s, l);

    }

    rgbValueAt(n) {

        const {h, s, l} = this.getCurveValues(n);
        const {r, g, b} = hslToRgb(h, s, l);
        return printRgb(r, g, b);

    }

    hexValueAt(n) {

        const {h, s, l} = this.getCurveValues(n);
        const {r, g, b} = hslToRgb(h, s, l);
        return rgbToHex(r, g, b);
        

    }

}