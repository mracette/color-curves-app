import Function from './Function';
import UnitCircle from '../surfaces/UnitCircle';
import UnitSquare from '../surfaces/UnitSquare';
import * as d3 from 'd3-ease';

/** 
 * An exponential curve normalized to the range x:[0,1], y:[0,1] 
 * @extends Function
 */
export default class Exponential extends Function {

    /**
     * Creates an exponential curve.
     * @param {Object|string} [surface = 'unitSquare'] The surface on which to draw the curve
     */
    constructor(surface, params) {

        // initialize a new surface class if an instance isn't passed in
        if(surface.type === undefined) {
            if(surface === 'unitSquare') {
                surface = new UnitSquare();
            } else if(surface === 'unitCircle') {
                surface = new UnitCircle();
            } else {
                console.warning(
                    "Invalid surface type. Options are 'unitCircle' (for H/S components) or 'unitSquare' (for L component). ",
                    "Using unitSquare instead."
                );
                surface = new UnitSquare();
            }
        }

        // initialize parent class with default function
        super(surface, d3.easeExpIn);

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

    setVariation(variation) {

        if(variation === 'in' || variation === 'out' || variation === 'in-out'){

            switch(variation) {
                case 'in': this.setFn(d3.easeExpIn); break;
                case 'out': this.setFn(d3.easeExpOut); break;
                case 'in-out': this.setFn(d3.easeExpInOut); break;
                default: break;
            }
    
            this.variation = variation;

        } else {

            console.warn("Variation must be 'in', 'out', or 'in-out'.");

        }

    }

}