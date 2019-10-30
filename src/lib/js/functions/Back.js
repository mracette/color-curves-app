import Function from './Function';
import UnitCircle from '../surfaces/UnitCircle';
import UnitSquare from '../surfaces/UnitSquare';
import * as d3 from 'd3-ease';

/**
 * Creates an 'ease-back' curve.
 * @param {Object|string} [surface = 'unitSquare'] The surface on which to draw the curve
 */
export default class Back extends Function {

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
        super(surface, d3.easeBackIn);

        // additional parameters for this curve
        this.setDefaultOvershoot();

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

    setDefaultOvershoot() {
        this.overshoot = 1.70158;
        this.setVariation(this.overshoot);
    }

    setVariation(variation) {

        if(variation === 'in' || variation === 'out' || variation === 'in-out'){

            switch(variation) {
                case 'in': this.setFn(d3.easeBackIn.overshoot(this.overshoot)); break;
                case 'out': this.setFn(d3.easeBackOut.overshoot(this.overshoot)); break;
                case 'in-out': this.setFn(d3.easeBackInOut.overshoot(this.overshoot)); break;
                default: break;
            }
    
            this.variation = variation;

        } else {

            console.warn("variation must be 'in', 'out', or 'in-out'");

        }

    }

    setOvershoot(s) {
        if(typeof s === 'number') {
            this.overshoot = s;
            this.setVariation(this.variation);
        } else {
            
        }
    }

}