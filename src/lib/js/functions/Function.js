
export default class Function {
    
    constructor(fn) {
        this._fn = fn;
    }

    getPolarValueAt(n) {

        const cartCoords = this.getCartesianValueAt(n);
        return cartToPolar(cartCoords.x, cartCoords.y);

    }
    
    getCartesianValueAt(n) {

        const x = n * this._scale.x + this._translation.x;
        const y = this._fn(n) * this._scale.y + this._translation.y;

        const sin = Math.sin(this._rotation);
        const cos = Math.cos(this._rotation);

        const xRot = x * cos - y * sin;
        const yRot = x * sin + y * cos;
    
        return {
            x: xRot, 
            y: yRot
        };
        
    }

}