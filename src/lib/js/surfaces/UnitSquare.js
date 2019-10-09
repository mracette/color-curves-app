export default class UnitSquare {

    constructor() {
        this.type = 'unitSquare';
        this.x0 = 0;
        this.x1 = 1;
        this.y0 = 0;
        this.y1 = 1;
    }

    static outOfBounds(x, y) {
        return x < this.x0 || x > this.x1 || y < this.y0 || y > this.y1;
    }

}
