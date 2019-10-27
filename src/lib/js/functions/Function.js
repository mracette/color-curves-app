import { polarToCart, cartToPolar } from '../../utils/math';
import Curve from '../Curve';

export default class Function extends Curve {
    
    constructor(surface, fn) {

        super(surface);
        this.setFn(fn);
        this.curveCategory = 'function';

    }

    setFn(fn) {
        this.fn = fn;
    }

    setDefaultRotation() {

        this.setRotation(0);

    }

    setDefaultTranslation() {
        
        this.setDefaultTranslateX();
        this.setDefaultTranslateY();

    }

    setDefaultScale() {
        
        this.setDefaultScaleX();
        this.setDefaultScaleY();

    }

    setDefaultTranslateX() {

        if(this.surface.type === 'unitSquare') {
            this.setTranslateX(0);
        } else if (this.surface.type === 'unitCircle') {
            this.setTranslateX(Math.cos(Math.PI * (9/8)));
        }

    }

    setDefaultTranslateY() {

        if(this.surface.type === 'unitSquare') {
            this.setTranslateY(0.25);
        } else if (this.surface.type === 'unitCircle') {
            this.setTranslateY(Math.sin(Math.PI * (9/8)));
        }

    }

    setDefaultScaleX() {

        if(this.surface.type === 'unitSquare') {
            this.setScaleX(1);
        } else if (this.surface.type === 'unitCircle') {
            this.setScaleX(Math.cos(Math.PI * (9/8)) * -2);
        }

    }

    setDefaultScaleY() {

        if(this.surface.type === 'unitSquare') {
            this.setScaleY(0.5);
        } else if (this.surface.type === 'unitCircle') {
            this.setScaleY(Math.sin(Math.PI * (9/8)) * -2);
        }

    }

    getPolarCoordsAt(n) {

        const cartCoords = this.getCartesianValueAt(n);
        return cartToPolar(cartCoords.x, cartCoords.y);

    }
    
    getCartesianCoordsAt(n) {

        if(this.reverse) {
            n = 1 - n;
        }

        const x = n * this.scale.x + this.translation.x;
        const y = this.fn(n) * this.scale.y + this.translation.y;

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

}