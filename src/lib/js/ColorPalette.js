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

    constructor(hsCurve, lCurve, palette = {}) {

        this.setHsCurve(hsCurve);
        this.setLCurve(lCurve);

        const {
            start,
            end
        } = palette;

        this.setPaletteStart(start);
        this.setPaletteEnd(end);

    }

    setHsCurve(hsCurve) {

        if(hsCurve && hsCurve.isCurve) {

            this.hsCurve = hsCurve;

        } else if(typeof hsCurve === 'object') {

            this.hsCurve = this.initializeCurve(hsCurve.type, {...hsCurve});

        } else if(typeof hsCurve === 'string') {

            this.hsCurve = this.initializeCurve(hsCurve);

        } else {

            this.hsCurve = this.initializeCurve('exponential');

        }

    }

    setLCurve(lCurve) {

        if(lCurve && lCurve.isCurve) {

            this.lCurve = lCurve;

        } else if(typeof lCurve === 'object') {

            this.lCurve = this.initializeCurve(lCurve.type, {...lCurve});

        } else if(typeof lCurve === 'string') {

            this.lCurve = this.initializeCurve(lCurve);

        } else {

            this.lCurve = this.initializeCurve('exponential');

        }

    }

    exportPaletteParams(precision) {

        const p = precision || 5;

        // initiatialize string representation of HS curve
        let hsParams = "{";

            // all curves have a type
            hsParams += `type: "${this.hsCurveType}", `;

            // some curves have variation
            if(this.hsCurve.category === 'function' && this.hsCurveType !== 'linear') {
                hsParams += `variation: "${this.hsCurve.variation}", `;
            }

            // polynomial curves have exponent
            if(this.hsCurve.type === 'polynomial') {
                hsParams += `exponent: "${this.hsCurve.exponent}`
            }

            // curves have exponent
            if(this.hsCurve.type === 'polynomial') {
                hsParams += `exponent: "${this.hsCurve.exponent}`
            }

            // arcs have angle parameters
            if(this.hsCurve.type === 'arc') {
                hsParams += `radius: ${this.hsCurve.r.toFixed(p)}, `;
                hsParams += `angleStart: ${this.hsCurve.angleStart.toFixed(p)}, `;
                hsParams += `angleEnd: ${this.hsCurve.angleEnd.toFixed(p)}, `;
                hsParams += `angleOffset: ${this.hsCurve.angleOffset.toFixed(p)}, `;
            }

            // all curve have translation, scale, and rotation
            hsParams += `translation: {x: ${this.hsCurve.translation.x.toFixed(p)}, y: ${this.hsCurve.translation.y.toFixed(p)}}, `;
            hsParams += `scale: {x: ${this.hsCurve.scale.x.toFixed(p)}, y: ${this.hsCurve.scale.y.toFixed(p)}}, `
            hsParams += `rotation: ${this.hsCurve.rotation.toFixed(p)}`;

            // close
            hsParams += `}`;

        // initiatialize string representation of L curve
        let lParams = "{";

            // all curves have a type
            lParams += `type: "${this.lCurve.type}", `;

            // some curves have variation
            if(this.lCurve.category === 'function' && this.lCurve.type !== 'linear') {
                lParams += `variation: "${this.lCurve.variation}", `;
            }

            // arcs have angle parameters and radius
            if(this.lCurve.type === 'arc') {
                lParams += `radius: ${this.lCurve.r.toFixed(p)}, `;
                lParams += `angleStart: ${this.lCurve.angleStart.toFixed(p)}, `;
                lParams += `angleEnd: ${this.lCurve.angleEnd.toFixed(p)}, `;
                lParams += `angleOffset: ${this.lCurve.angleOffset.toFixed(p)}, `;
            }

            // some curves have translation, scale and rotation
            lParams += `translation: {x: ${this.lCurve.translation.x.toFixed(p)}, y: ${this.lCurve.translation.y.toFixed(p)}}, `;
            lParams += `scale: {x: ${this.lCurve.scale.x.toFixed(p)}, y: ${this.lCurve.scale.y.toFixed(p)}}, `
            lParams += `rotation: ${this.lCurve.rotation.toFixed(p)}`;

            // close
            lParams += `}`;

        // construct representation of palette
        const paletteParams = `{
            paletteStart: ${this.paletteStart},
            paletteEnd: ${this.paletteEnd}
        }`;

        return `${hsParams}, ${lParams}, ${paletteParams}`;

    }

    setPaletteStart(start) {

        if(start === undefined) {

            this.paletteStart = 0;

        } else if(start > this.paletteEnd) {

            console.warn('Palette start cannot be greater than palette end. Setting palette start to palette end.');

            this.paletteStart = this.paletteEnd;

        } else {

            this.paletteStart = start;

        }

    }

    setPaletteEnd(end) {

        if(end === undefined) {

            this.paletteEnd = 1;

        } else if(end < this.paletteStart) {

            console.warn('Palette end cannot be less than than palette start. Setting palette end to palette start.');

            this.paletteEnd = this.paletteStart;

        } else {

            this.paletteEnd = end;

        }

    }

    drawDiscretePalette(canvas, numStops) {

        this.updateCurveClampBound();

        canvas.width = canvas.clientWidth * 4;
        canvas.height = canvas.clientHeight * 4;
        const ctx = canvas.getContext('2d');
        const stops = numStops || 12;

        for(let i = 0; i < stops; i++) {
    
            // get hsl values
            const hsl = this.hslValueAt((i + 0.5) / stops);
    
            ctx.fillStyle = hsl;
            ctx.fillRect(i * canvas.width / stops, 0, canvas.width * 1.1 / stops, canvas.height);
    
        }

    }

    drawContinuousPalette(canvas, resolution) {

        this.updateCurveClampBound();

        const ctx = canvas.getContext('2d');
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        const stops = resolution || 32;

        // draw continuous palette
        for(let i = 0; i <= stops; i++) {
    
            // get hsl values
            const hsl = this.hslValueAt(i / stops);
    
            // add a gradient stop
            gradient.addColorStop(i / stops, hsl);
    
        }
    
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

    }

    initializeCurve(curveType, options) {

        switch(curveType) {

            case 'arc': return new Arc({...options});
            case 'linear': return new Linear({...options});
            case 'polynomial': return new Polynomial({...options});
            case 'sinusoidal': return new Sinusoidal({...options});
            case 'exponential': return new Exponential({...options});
            case 'elastic': return new Elastic({...options});
            case 'back': return new Back({...options});
            case 'bounce': return new Bounce({...options});
            default: 
                console.warn('Specified curve type is not supported. Using default (linear) instead.');
                return new Linear({...options});

        }

    }

    updateCurveClampBound() {

        /* 
        If overflow === 'clamp', the palette should only sample the first continuous segment of non-clamped values.
        Update the clamp values here to ensure that they are adjusted to the curves current transformations.
        */

        this.hsCurve.overflow === 'clamp' && this.hsCurve.setClampBounds();
        this.lCurve.overflow === 'clamp' && this.lCurve.setClampBounds();

    }

    getColorValues(n) {

        const hsStart = this.hsCurve.overflow === 'clamp' ? Math.max(this.paletteStart, this.hsCurve.clampStart) : this.paletteStart;
        const hsEnd = this.hsCurve.overflow === 'clamp' ? Math.min(this.paletteEnd, this.hsCurve.clampEnd) : this.paletteEnd;
        const lStart = this.lCurve.overflow === 'clamp' ? Math.max(this.paletteStart, this.lCurve.clampStart) : this.paletteStart;
        const lEnd = this.lCurve.overflow === 'clamp' ? Math.min(this.paletteEnd, this.lCurve.clampEnd) : this.paletteEnd;

        // get hue and saturation values from the hsCurve
        const hsCartCoords = this.hsCurve.getCurveCoordsAt(hsStart + n * (hsEnd - hsStart));
        const hsPolarCoords = cartToPolar(hsCartCoords.x, hsCartCoords.y);
        const hue = radToDeg(hsPolarCoords.theta) % 360;
        const sat = Math.max(0, Math.min(1, hsPolarCoords.r));

        // get lightness values from the lightCurve
        const lCartCoords = this.lCurve.getCurveCoordsAt(lStart + n * (lEnd - lStart));
        const lightness = Math.max(0, Math.min(1, lCartCoords.y));

        return {
            h: hue,
            s: sat,
            l: lightness
        };

    }

    hslValueAt(n) {

        const {h, s, l} = this.getColorValues(n);
        return printHsl(h, s, l);

    }

    rgbValueAt(n) {

        const {h, s, l} = this.getColorValues(n);
        const {r, g, b} = hslToRgb(h, s, l);
        return printRgb(r, g, b);

    }

    hexValueAt(n) {

        const {h, s, l} = this.getColorValues(n);
        const {r, g, b} = hslToRgb(h, s, l);
        return rgbToHex(r, g, b);
        

    }

}