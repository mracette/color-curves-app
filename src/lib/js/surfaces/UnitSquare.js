/**
 * A square with sides of length 1 and a center point at (0.5, 0.5)
 */

export default class UnitSquare {

    constructor() {
        this.type = 'unitSquare';
        this.cx = 0.5;
        this.cy = 0.5;
        this.x0 = 0;
        this.x1 = 1;
        this.y0 = 0;
        this.y1 = 1;
    }

    static outOfBounds(x, y) {
        return x < 0 || x > 1 || y < 0 || y > 1;
    }

}
