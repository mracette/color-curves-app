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

    constructor(hsCurve, lCurve, palette) {

        if(typeof hsCurve === 'string') {

            this.setHsCurve(hsCurve);

            // where defaults for the curve exist, set them
            this.hsCurve.setDefaultRotation && this.hsCurve.setDefaultRotation();
            this.hsCurve.setDefaultTranslation && this.hsCurve.setDefaultTranslation();
            this.hsCurve.setDefaultScale && this.hsCurve.setDefaultScale();
            this.hsCurve.setDefaultRadius && this.hsCurve.setDefaultRadius();
            this.hsCurve.setDefaultAngleStart && this.hsCurve.setDefaultAngleStart();
            this.hsCurve.setDefaultAngleEnd && this.hsCurve.setDefaultAngleEnd();
            this.hsCurve.setDefaultAngleOffset && this.hsCurve.setDefaultAngleOffset();

        } else if(typeof hsCurve === 'object') {

            this.setHsCurve(hsCurve.type);

            // where params are specified, use them, but fall back to defaults (that exist)
            hsCurve.variation && this.hsCurve.setVariation && this.hsCurve.setVariation(hsCurve.variation);
            hsCurve.translation ? 
                this.hsCurve.setTranslation(hsCurve.translation): 
                this.hsCurve.setDefaultTranslation && this.hsCurve.setDefaultTranslation();
            hsCurve.scale ? 
                this.hsCurve.setScale(hsCurve.scale): 
                this.hsCurve.setDefaultScale && this.hsCurve.setDefaultScale();
            hsCurve.rotation ? 
                this.hsCurve.setRotation(hsCurve.rotation):
                this.hsCurve.setDefaultRotation && this.hsCurve.setDefaultRotation();
            hsCurve.radius ? 
                this.hsCurve.setRadius(hsCurve.radius):
                this.hsCurve.setDefaultRadius && this.hsCurve.setDefaultRadius();
            hsCurve.angleStart ? 
                this.hsCurve.setAngleStart(hsCurve.angleStart): 
                this.hsCurve.setDefaultAngleStart && this.hsCurve.setDefaultAngleStart();
            hsCurve.angleEnd ? 
                this.hsCurve.setAngleEnd(hsCurve.angleEnd): 
                this.hsCurve.setDefaultAngleEnd && this.hsCurve.setDefaultAngleEnd();
            hsCurve.angleOffset ? 
                this.hsCurve.setAngleOffset(hsCurve.angleOffset): 
                this.hsCurve.setDefaultAngleOffset && this.hsCurve.setDefaultAngleOffset();
            hsCurve.overflow ? 
                this.hsCurve.setOverflow(hsCurve.overflow): 
                this.hsCurve.setOverflow('clamp');
            hsCurve.overflow === 'clamp' && this.hsCurve.setClampBounds();

        } else {

            this.setHsCurve('exponential');
            this.hsCurve.setDefaultRotation();
            this.hsCurve.setDefaultTranslation();
            this.hsCurve.setDefaultScale();

        }

        if(typeof lCurve === 'string') {

            this.setLCurve(lCurve);

            // where defaults for the curve exist, set them
            this.lCurve.setDefaultRotation && this.lCurve.setDefaultRotation();
            this.lCurve.setDefaultTranslation && this.lCurve.setDefaultTranslation();
            this.lCurve.setDefaultScale && this.lCurve.setDefaultScale();
            this.lCurve.setDefaultRadius && this.lCurve.setDefaultRadius();
            this.lCurve.setDefaultAngleStart && this.lCurve.setDefaultAngleStart();
            this.lCurve.setDefaultAngleEnd && this.lCurve.setDefaultAngleEnd();
            this.lCurve.setDefaultAngleOffset && this.lCurve.setDefaultAngleOffset();

        } else if(typeof lCurve === 'object') {

            this.setLCurve(lCurve.type);

            // where params are specified, use them, but fall back to defaults (that exist)
            lCurve.variation && this.lCurve.setVariation && this.lCurve.setVariation(lCurve.variation);
            lCurve.translation ? 
                this.lCurve.setTranslation(lCurve.translation): 
                this.lCurve.setDefaultTranslation && this.lCurve.setDefaultTranslation();
            lCurve.scale ? 
                this.lCurve.setScale(lCurve.scale): 
                this.lCurve.setDefaultScale && this.lCurve.setDefaultScale();
            lCurve.rotation ? 
                this.lCurve.setRotation(lCurve.rotation):
                this.lCurve.setDefaultRotation && this.lCurve.setDefaultRotation();
            lCurve.radius ? 
                this.lCurve.setRadius(lCurve.radius):
                this.lCurve.setDefaultRadius && this.lCurve.setDefaultRadius();
            lCurve.angleStart ? 
                this.lCurve.setAngleStart(lCurve.angleStart): 
                this.lCurve.setDefaultAngleStart && this.lCurve.setDefaultAngleStart();
            lCurve.angleEnd ? 
                this.lCurve.setAngleEnd(lCurve.angleEnd): 
                this.lCurve.setDefaultAngleEnd && this.lCurve.setDefaultAngleEnd();
            lCurve.angleOffset ? 
                this.lCurve.setAngleOffset(lCurve.angleOffset): 
                this.lCurve.setDefaultAngleOffset && this.lCurve.setDefaultAngleOffset();
            lCurve.overflow ? 
                this.lCurve.setOverflow(lCurve.overflow): 
                this.lCurve.setOverflow('clamp');
            lCurve.overflow === 'clamp' && this.lCurve.setClampBounds();


        } else {

            this.setLCurve('linear');
            this.lCurve.setDefaultRotation();
            this.lCurve.setDefaultTranslation();
            this.lCurve.setDefaultScale();

        }

        if(typeof palette === 'object') {

            palette.paletteStart ? 
                this.paletteStart = palette.paletteStart :
                this.paletteStart = 0;

            palette.paletteEnd ? 
                this.paletteEnd = palette.paletteEnd : 
                this.paletteEnd = 1;

        } else {

            this.paletteStart = 0;
            this.paletteEnd = 1;

        }

    }

    exportPaletteParams(precision) {

        const p = precision || 5;

        // initiatialize string representation of HS curve
        let hsParams = "{";

            // all curves have a type
            hsParams += `type: "${this.hsCurveType}", `;

            // some curves have variation
            if(this.getHsCurveCategory() === 'function' && this.hsCurveType !== 'linear') {
                hsParams += `variation: "${this.hsCurve.variation}", `;
            }

            // arcs have angle parameters
            if(this.getHsCurveType() === 'arc') {
                hsParams += `radius: ${this.hsCurve.r.toFixed(p)}, `;
                hsParams += `angleStart: ${this.hsCurve.angleStart.toFixed(p)}, `;
                hsParams += `angleEnd: ${this.hsCurve.angleEnd.toFixed(p)}, `;
                hsParams += `angleOffset: ${this.hsCurve.angleOffset.toFixed(p)}, `;
            }

            // all curve have translation
            hsParams += `translation: {x: ${this.hsCurve.translation.x.toFixed(p)}, y: ${this.hsCurve.translation.y.toFixed(p)}}, `;

            // some curves have scale and rotation
            if(this.getHsCurveType() !== 'arc') {
                hsParams += `scale: {x: ${this.hsCurve.scale.x.toFixed(p)}, y: ${this.hsCurve.scale.y.toFixed(p)}}, `
                hsParams += `rotation: ${this.hsCurve.rotation.toFixed(p)}`;
            }

            // close
            hsParams += `}`;

        // initiatialize string representation of L curve
        let lParams = "{";

            // all curves have a type
            lParams += `type: "${this.lCurveType}", `;

            // some curves have variation
            if(this.getLCurveCategory() === 'function' && this.lCurveType !== 'linear') {
                lParams += `variation: "${this.lCurve.variation}", `;
            }

            // arcs have angle parameters and radius
            if(this.getLCurveType() === 'arc') {
                lParams += `radius: ${this.lCurve.r.toFixed(p)}, `;
                lParams += `angleStart: ${this.lCurve.angleStart.toFixed(p)}, `;
                lParams += `angleEnd: ${this.lCurve.angleEnd.toFixed(p)}, `;
                lParams += `angleOffset: ${this.lCurve.angleOffset.toFixed(p)}, `;
            }

            // all curve have translation
            lParams += `translation: {x: ${this.lCurve.translation.x.toFixed(p)}, y: ${this.lCurve.translation.y.toFixed(p)}}, `;

            // some curves have scale and rotation
            if(this.getLCurveType() !== 'arc') {
                lParams += `scale: {x: ${this.lCurve.scale.x.toFixed(p)}, y: ${this.lCurve.scale.y.toFixed(p)}}, `
                lParams += `rotation: ${this.lCurve.rotation.toFixed(p)}`;
            }

            // close
            lParams += `}`;

        // construct representation of palette
        const paletteParams = `{
            paletteStart: ${this.paletteStart},
            paletteEnd: ${this.paletteEnd}
        }`;

        return `${hsParams}, ${lParams}, ${paletteParams}`;

    }

/*     runAnalysis(resolution) {

        const res = resolution || 128;


        let hsCount = 0, lCount = 0;
        let hTotal = 0, sTotal = 0, lTotal = 0;
        let hVarTotal = 0, sVarTotal = 0, lVarTotal = 0;
        let hPrev, sPrev, lPrev;


        let hsClampedPrev = null;
        let lClampedPrev = null;
        let hsClampStart = null;
        let hsClampEnd = null;
        let lClampStart = null;
        let lClampEnd = null;

        const range = this.drawEnd - this.drawStart;
        const start = this.drawStart;

        for(let i = 0; i <= res; i++) {

            const n = start + range * i / res;


            // get hs and l curve values
            const hsCartCoords = this.hsCurve.getCartesianCoordsAt(n);
            const hsPolarCoords = cartToPolar(hsCartCoords.x, hsCartCoords.y);
            const lCartCoords = this.lCurve.getCartesianCoordsAt(n);

            const hueDeg = radToDeg(hsPolarCoords.theta);
            const huePos = hueDeg < 0 ? 360 + hueDeg % 360 : hueDeg % 360;
            const hue = huePos;
            hTotal += hue;
            if(i !== 0) hVarTotal += Math.abs(hPrev - hue);

            const sat = Math.max(0, Math.min(1, hsPolarCoords.r));
            sTotal += sat;
            if(i !== 0) sVarTotal += Math.abs(sPrev - sat);

            const lightness = Math.max(0, Math.min(1, lCartCoords.y));
            lTotal += lightness;
            if(i !== 0) lVarTotal += Math.abs(lPrev - lightness);


            if(i === 0) {

                // if the starting point is inside the surface, then the clamp start is the same as the start
                if(!hsCartCoords.clamped) hsClampStart = n;
                if(!lCartCoords.clamped) lClampStart = n;

            } else {

                // set start clamp if the prev point is outside the surface, but the current point is inside

                if(hsClampStart === null && hsClampedPrev && !hsCartCoords.clamped) {
                    hsClampStart = n;
                }

                if(lClampStart === null && lClampedPrev && !lCartCoords.clamped) {
                    lClampStart = n;
                }

                // set end clamp if the prev point is inside the surface, but the current point is outside

                if(hsClampEnd === null && !hsClampedPrev && hsCartCoords.clamped) {
                    hsClampEnd = n;
                }

                if(lClampEnd === null && !lClampedPrev && lCartCoords.clamped) {
                    lClampEnd = n;
                }

            }

            // only increment if the curve isn't clamped based on its position and settings

            if(this.hsCurve.overflow === 'project' ||
                (this.hsCurve.overflow === 'clamp' && !hsCartCoords.clamped)
            ) {
                hsCount++;
            }

            if(this.lCurve.overflow === 'project' ||
            (this.lCurve.overflow === 'clamp' && !hsCartCoords.clamped)
            ) {
                lCount++;
            }

            hPrev = hue;
            sPrev = sat;
            lPrev = lightness;

            hsClampedPrev = hsCartCoords.clamped;
            lClampedPrev = lCartCoords.clamped;

        }

        return {
            hAvg: hTotal / hsCount,
            sAvg: sTotal / hsCount,
            lAvg: lTotal / lCount,
            hVar: hVarTotal / hsCount,
            sVar: sVarTotal / hsCount,
            lVar: lVarTotal / lCount,
            hsClampStart,
            hsClampEnd,
            lClampStart,
            lClampEnd
        };

    } */

    setPaletteStart(start) {

        if(start > this.paletteEnd) {
            console.warn('Palette start cannot be greater than palette end.');
            console.log('Setting palette start to palette end.')
            this.paletteStart = this.paletteEnd;
        } else {
            this.paletteStart = start;
        }

    }

    setPaletteEnd(end) {

        if(end < this.paletteStart) {
            console.warn('Palette end cannot be less than than palette start.');
            console.log('Setting palette end to palette start.');
            this.paletteEnd = this.paletteStart;
        } else {
            this.paletteEnd = end;
        }

    }

    drawDiscretePalette(canvas, numStops) {

        canvas.width = canvas.clientWidth * 4;
        canvas.height = canvas.clientHeight * 4;
        const ctx = canvas.getContext('2d');
        const stops = numStops || 12;

        for(let i = 0; i < stops; i++) {
    
            // get hsl values
            const hsl = this.hslValueAt(i / stops);
    
            ctx.fillStyle = hsl;
            ctx.fillRect(i * canvas.width / stops, 0, canvas.width * 1.1 / stops, canvas.height);
    
        }

    }

    drawContinuousPalette(canvas, resolution) {

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

    setHsCurve(curveType, params) {
        this.hsCurve = this.initializeCurve(curveType, 'unitCircle', params);
        this.hsCurveType = curveType;
    }

    setLCurve(curveType, params) {
        this.lCurve = this.initializeCurve(curveType, 'unitSquare', params);
        this.lCurveType = curveType;
    }

    getHsCurveCategory() {
        return this.hsCurve.curveCategory;
    }

    getLCurveCategory() {
        return this.lCurve.curveCategory;
    }

    getHsCurveType() {
        return this.hsCurveType;
    }

    getLCurveType() {
        return this.lCurveType;
    }

    initializeCurve(curveType, surface) {

        switch(curveType) {

            case 'arc': 
                return new Arc(surface);
            case 'linear': 
                return new Linear(surface);
            case 'polynomial': 
                return new Polynomial(surface);
            case 'sinusoidal':
                return new Sinusoidal(surface);
            case 'exponential':
                return new Exponential(surface);
            case 'elastic':
                return new Elastic(surface);
            case 'back':
                return new Back(surface);
            case 'bounce':
                return new Bounce(surface);
            default: 
                console.warn('Specified curve type is not supported. Using default instead.');
                return new Linear(surface);

        }

    }

    getCurveValues(n) {

        let hsStart = this.hsCurve.overflow === 'clamp' ? 
            Math.max(this.paletteStart, this.hsCurve.clampStart) :
            this.paletteStart;

        let hsEnd = this.hsCurve.overflow === 'clamp' ? 
            Math.min(this.paletteEnd, this.hsCurve.clampEnd) :
            this.paletteEnd;

        let lStart = this.lCurve.overflow === 'clamp' ? 
            Math.max(this.paletteStart, this.lCurve.clampStart) :
            this.paletteStart;

        let lEnd = this.lCurve.overflow === 'clamp' ? 
            Math.min(this.paletteEnd, this.lCurve.clampEnd) : 
            this.paletteEnd;

        // get hue and saturation values from the hsCurve
        const hsCartCoords = this.hsCurve.getCartesianCoordsAt(hsStart + n * (hsEnd - hsStart));
        const hsPolarCoords = cartToPolar(hsCartCoords.x, hsCartCoords.y);
        const hue = radToDeg(hsPolarCoords.theta) % 360;
        const sat = Math.max(0, Math.min(1, hsPolarCoords.r));

        // get lightness values from the lightCurve
        const lCartCoords = this.lCurve.getCartesianCoordsAt(lStart + n * (lEnd - lStart));
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