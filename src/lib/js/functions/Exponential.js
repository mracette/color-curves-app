import Function from './Function';
import * as d3 from 'd3-ease';

/**
 * Creates an ease "exponential" curve.
 * @param {object} [options] Optional properties of the function
 * @param {string} [options.variation] The contour of the function (see https://easings.net)
 */

export default class Exponential extends Function {

    constructor(options) {

        const {
            variation
        } = options;
        
        super({...options});

        this.type = 'exponential';
        this._fn = null;

        this.setVariation(variation);

    }

    setVariation(variation = 'in') {

        if(variation === 'in' || variation === 'out' || variation === 'in-out'){

            this.variation = variation;
            this.setFunction();

        } else {

            console.warn("variation must be 'in', 'out', or 'in-out'");

        }

    }

    setFunction() {

        switch(this.variation) {
            case 'in': this._fn = (n) => ({x: n, y: d3.easeExpIn(n)}); break;
            case 'out': this._fn = (n) => ({x: n, y: d3.easeExpOut(n)}); break;
            case 'in-out': this._fn = (n) => ({x: n, y: d3.easeExpInOut(n)}); break;
            default: break;
        }

    }

}