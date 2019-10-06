import { cartToPolar } from '../../utils/math';
import Relation from '../Relation';

export default class Function extends Relation {
    
    constructor(fn, rotation, translation, scale) {

        super(rotation, translation, scale);
        this.fn = fn;

    }

    getPolarCoordsAt(n) {

        const cartCoords = this.getCartesianValueAt(n);
        return cartToPolar(cartCoords.x, cartCoords.y);

    }
    
    getCartesianCoordsAt(n) {

        const x = n * this.scale.x + this.translation.x;
        const y = this.fn(n) * this.scale.y + this.translation.y;

        const sin = Math.sin(this.rotation);
        const cos = Math.cos(this.rotation);

        const xRot = x * cos - y * sin;
        const yRot = x * sin + y * cos;
    
        return {
            x: xRot, 
            y: yRot
        };
        
    }

}