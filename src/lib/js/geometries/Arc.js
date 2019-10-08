import { cartToPolar, polarToCart } from '../../utils/math';
import Relation from '../Relation';

export class Arc extends Relation {

    constructor(cx, cy, r, angleStart, angleEnd, angleOffset) {

        super();

        this.cx = cx;
        this.cy = cy;
        this.r = r;

        this.angleStart = typeof angleStart === 'number' ? angleStart : 0;
        this.angleEnd = typeof angleEnd === 'number' ? angleEnd : Math.PI * 2;
        this.angleOffset = typeof angleOffset === 'number' ? angleOffset : 0;

    }

    getCartesianCoordsAt(n) {

        if(n < 0 || n > 1) {
            console.error('n must be a number in the range [0, 1]');
            return null;
        }

        if(this._reverse) n = (1 - n);

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