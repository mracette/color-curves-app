import Function from './Function';
import * as d3 from 'd3-ease';

/**
 * Creates an ease "elastic" curve.
 * @param {object} [options] Optional properties of the function
 * @param {string} [options.exponent] The exponent of the function
 */

export default class Polynomial extends Function {

    constructor(options) {

        const {
            variation,
            exponent
        } = options;
        
        super({...options});

        this.type = 'polynomial';
        this.fn = null;


        this.setExponent(exponent);
        this.setVariation(variation);

    }

    setExponent(e = 3) {

        if(e > 0) {

            this.exponent = e;
            this.setFunction();

        } else {

            console.error('Exponent must be a number greater than 0');

        }

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
            case 'in': this.fn = d3.easePolyIn.exponent(this.exponent); break;
            case 'out': this.fn = d3.easePolyOut.exponent(this.exponent); break;
            case 'in-out': this.fn = d3.easePolyInOut.exponent(this.exponent); break;
            default: break;
        }
        
    }

}