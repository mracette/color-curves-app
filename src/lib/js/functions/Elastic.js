import Function from './Function';
import UnitCircle from '../surfaces/UnitCircle';
import UnitSquare from '../surfaces/UnitSquare';
import * as d3 from 'd3-ease';

/**
 * Creates an elastic curve.
 * @param {Object|string} [surface = 'unitSquare'] The surface on which to draw the curve
 */
export default class Elastic extends Function {

    constructor(surface, params) {

        // initialize a new surface class if an instance isn't passed in
        if(surface.type === undefined) {
            if(surface === 'unitSquare') {
                surface = new UnitSquare();
            } else if(surface === 'unitCircle') {
                surface = new UnitCircle();
            } else {
                console.warn(
                    "Invalid surface type. Options are 'unitCircle' (for H/S components) or 'unitSquare' (for L component). ",
                    "Using unitSquare instead."
                );
                surface = new UnitSquare();
            }
        }

        // initialize parent class with default function
        super(surface, d3.easeElasticIn);

        // additional parameters for this curve
        this.setDefaultAmplitude();
        this.setDefaultPeriod();

        // override function if a variation is specified
        if(params && params.variation) {
            this.setVariation(params.variation);
        } else {
            this.variation = 'in';
        }

        // set initial tranformations according to the surface type
        this.setDefaultRotation();
        this.setDefaultTranslation();
        this.setDefaultScale();

    }

    setDefaultAmplitude() {
        this.amplitude = 1;
        this.setVariation(this.variation);
    }

    setDefaultPeriod() {
        this.period = 0.3;
        this.setVariation(this.variation);
    }

    setVariation(variation) {

        if(variation === 'in' || variation === 'out' || variation === 'in-out'){

            switch(variation) {
                case 'in': this.setFn(d3.easeElasticIn.amplitude(this.amplitude).period(this.period)); break;
                case 'out': this.setFn(d3.easeElasticOut.amplitude(this.amplitude).period(this.period)); break;
                case 'in-out': this.setFn(d3.easeElasticInOut.amplitude(this.amplitude).period(this.period)); break;
                default: break;
            }
    
            this.variation = variation;

        } else {

            console.warn("variation must be 'in', 'out', or 'in-out'");

        }

    }

    setAmplitude(a) {
        if(typeof a === 'number' && a > 1) {
            this.amplitude = a;
            this.setVariation(this.variation);
        } else {
            console.warn('amplitude must be a number greater than 1');
        }
    }

    setPeriod(p) {
        if(typeof p === 'number' && p > 0) {
            this.period = p;
            this.setVariation(this.variation);
        } else {
            console.warn('period must be a number greater than 0');
        }
    }

}