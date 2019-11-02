import Function from './Function';
import * as d3 from 'd3-ease';

/**
 * Creates an ease "back" curve.
 * @param {object} [options] Optional properties of the function
 * @param {string} [options.variation] The contour of the function (see https://easings.net)
 * @param {number} [options.overshoot] The degree to which the function "overshoots"
 */

export default class Back extends Function {

    constructor(options) {

        const {
            variation,
            overshoot
        } = options;
        
        super({...options});

        this.type = 'back';
        this.fn = null;

        this.setOvershoot(overshoot);
        this.setVariation(variation);

    }

    setOvershoot(s = 1.70158) {

        this.overshoot = s;
        this.setFunction();

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
            case 'in': this.fn = d3.easeBackIn.overshoot(this.overshoot); break;
            case 'out': this.fn = d3.easeBackOut.overshoot(this.overshoot); break;
            case 'in-out': this.fn = d3.easeBackInOut.overshoot(this.overshoot); break;
            default: break;
        }

    }

}