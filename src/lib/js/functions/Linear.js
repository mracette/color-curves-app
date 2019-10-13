import Function from './Function';
import UnitCircle from '../surfaces/UnitCircle';
import UnitSquare from '../surfaces/UnitSquare';
import * as d3 from 'd3-ease';

/**
 * Creates a linear curve.
 * @param {Object|string} [surface = 'unitSquare'] The surface on which to draw the curve
 */
export default class Linear extends Function {

    constructor(surface) {
        
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

        // initialize parent class
        super(surface, d3.easeLinear);

        // set initial tranformations according to the surface type
        this.setDefaultRotation();
        this.setDefaultTranslation();
        this.setDefaultScale();

    }

}