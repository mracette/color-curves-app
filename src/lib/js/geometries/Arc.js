import { cartToPolar, polarToCart } from '../../utils/math';
import UnitCircle from '../surfaces/UnitCircle';
import UnitSquare from '../surfaces/UnitSquare';
import Curve from '../Curve';

export default class Arc extends Curve {

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

        super(surface);

        this.cx = 0;
        this.cy = 0;

        this.curveCategory = 'geometry';

        // set initial tranformations according to the surface type
        this.setDefaultTranslation();
        this.setDefaultRadius();
        this.setDefaultAngleStart();
        this.setDefaultAngleEnd();
        this.setDefaultAngleOffset();

    }

    setDefaultAngleStart() {
        this.angleStart = 0;
    }

    setDefaultAngleEnd() {
        this.angleEnd = Math.PI * 2;
    }

    setDefaultAngleOffset() {
        this.angleOffset = 0;
    }

    setDefaultTranslation() {

        if(this.surface.type === 'unitSquare') {

            this.setTranslation({x: 0.5, y: 0.5});

        } else if (this.surface.type === 'unitCircle') {

            this.setTranslation({x: 0, y: 0});
            
        }

    }

    setDefaultRadius() {

        if(this.surface.type === 'unitSquare') {

            this.setRadius(0.25);

        } else if (this.surface.type === 'unitCircle') {

            this.setRadius(0.5);
            
        }

    }

    getCartesianCoordsAt(n) {

        if(n < 0 || n > 1) {
            console.error('n must be a number in the range [0, 1]');
            return null;
        }

        if(this.reverse) n = (1 - n);

        const arcAngle = n * (this.angleEnd - this.angleStart);
        const theta = this.angleOffset + this.angleStart + arcAngle;

        // these coordinates could be outside of the unit circle 
        const x = this.cx + this.translation.x + this.r * Math.cos(theta);
        const y = this.cy + this.translation.y + this.r * Math.sin(theta);

        // convert to polar in order to clamp the radius
        const polarCoords = cartToPolar(x, y);

        // assign clamped flag
        const clamped = polarCoords.r > 1 || polarCoords.r < -1;

        // convert clamped polar coordinates back to cartesian x and y
        const cartCoordsClamped = polarToCart(Math.max(0, Math.min(1, polarCoords.r)), polarCoords.theta);

        return {
            x: cartCoordsClamped.x, 
            y: cartCoordsClamped.y,
            clamped
        };

    }

    setRadius(value) {
        this.r = value;
    }

    setAngleStart(value) {
        this.angleStart = value;
    }

    setAngleEnd(value) {
        this.angleEnd = value;
    }

    setAngleOffset(value) {
        this.angleOffset = value;
    }

}