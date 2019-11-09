import Function from './Function';
import * as d3 from 'd3-ease';

/**
 * Creates an "elastic" function.
 * @extends Function
 * @param {object} [options] Optional properties of the function
 * @param {string} [options.amplitude] The amplitude of the function
 * @param {number} [options.period] The period of the function
 */

export default class Elastic extends Function {

    constructor(options) {

        const {
            variation,
            amplitude,
            period
        } = options;
        
        super({...options});

        this.type = 'elastic';
        this.fn = null;

        this.setAmplitude(amplitude);
        this.setPeriod(period);
        this.setVariation(variation);

    }

    setAmplitude(a = 1) {

        if(a >= 1) {

            this.amplitude = a;
            this.setFunction();

        } else {

            console.error('Amplitude must be a number greater than 1');

        }

    }

    setPeriod(p = 0.3) {

        if(p > 0) {

            this.period = p;
            this.setFunction();
            
        } else {

            console.error('Period must be a number greater than 0.');

        }
    }

    /**
     * Sets the easing variation. See https://easings.net/
     * @param {string} variation The curve variation ('in', 'out', or 'in-out')
     */

    setVariation(variation = 'in') {

        if(variation === 'in' || variation === 'out' || variation === 'in-out'){

            this.variation = variation;
            this.setFunction();

        } else {

            console.warn("variation must be 'in', 'out', or 'in-out'");

        }

    }

    /**
     * Assigns a function to this class that maps input to output
     */

    setFunction() {

        switch(this.variation) {
            case 'in': this.fn = d3.easeElasticIn.amplitude(this.amplitude).period(this.period); break;
            case 'out': this.fn = d3.easeElasticOut.amplitude(this.amplitude).period(this.period); break;
            case 'in-out': this.fn = d3.easeElasticInOut.amplitude(this.amplitude).period(this.period); break;
            default: break;
        }
        
    }

}