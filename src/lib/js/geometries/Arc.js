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
        this.setDefaultRotation();
        this.setDefaultRadius();
        this.setDefaultScale();
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

    setDefaultScale() {
        
        this.setDefaultScaleX();
        this.setDefaultScaleY();

    }

    setDefaultScaleX() {

        this.setScaleX(1);

    }

    setDefaultScaleY() {

        this.setScaleY(1);

    }

    setDefaultTranslation() {

        if(this.surface.type === 'unitSquare') {

            this.setTranslation({x: 0.5, y: 0.5});

        } else if (this.surface.type === 'unitCircle') {

            this.setTranslation({x: 0, y: 0});
            
        }

    }

    setDefaultTranslateX() {

        if(this.surface.type === 'unitSquare') {

            this.setTranslateX(0.5);

        } else if (this.surface.type === 'unitCircle') {

            this.setTranslateX(0);
            
        }

    }

    setDefaultTranslateY() {

        if(this.surface.type === 'unitSquare') {

            this.setTranslateY(0.5);

        } else if (this.surface.type === 'unitCircle') {

            this.setTranslateY(0);
            
        }
        
    }

    setDefaultRotation() {

        this.setRotation(0);

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
        const x = this.scale.x * (this.cx + this.translation.x + this.r * Math.cos(theta));
        const y = this.scale.y * (this.cy + this.translation.y + this.r * Math.sin(theta));

        const sin = Math.sin(this.rotation);
        const cos = Math.cos(this.rotation);

        // rotation is along the surface's center point
        const xRot = (x - this.surface.cx) * cos - (y - this.surface.cy) * sin + this.surface.cx;
        const yRot = (x - this.surface.cx) * sin + (y - this.surface.cy) * cos + this.surface.cy;

        // clamp methodology depends on the surface type
        if(this.surface.type === 'unitSquare') {

            const clamped = (xRot < 0 || xRot > 1 || yRot < 0 || yRot > 1);
            const xClamp = Math.min(1, Math.max(0, xRot));
            const yClamp = Math.min(1, Math.max(0, yRot));

            return {
                x: xClamp,
                y: yClamp,
                clamped
            };

        } else if(this.surface.type === 'unitCircle') {

            // convert to polar in order to clamp the radius
            const polarCoords = cartToPolar(xRot, yRot);
            const clamped = polarCoords.r > 1 || polarCoords.r < -1;
            const cartCoordsClamped = polarToCart(Math.max(-1, Math.min(1, polarCoords.r)), polarCoords.theta);

            return {
                x: cartCoordsClamped.x,
                y: cartCoordsClamped.y,
                clamped
            };

        }

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