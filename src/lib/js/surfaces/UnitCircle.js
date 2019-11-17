/**
 * A circle with a radius of 1 and a center point at (0, 0)
 */

export default class UnitCircle {

    constructor() {
        this.type = 'unitCircle';
        this.cx = 0;
        this.cy = 0;
        this.r = 1;
    }

    static outOfBounds(x, y) {
        return x * x + y * y > 1;
    }

}
