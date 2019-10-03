export class Arc {

    constructor(cx, cy, r, angleStart, angleEnd, offset, reverse) {
        this.cx = cx;
        this.cy = cy;
        this.r = r;
        this.angleStart = angleStart || 0;
        this.angleEnd = angleEnd || Math.PI * 2;
        this.offset = offset || 0;
        this.reverse = reverse !== undefined || false;
    }

    getPolarValueAt(n) {

        const arcAngle = n * (this.angleEnd - this.angleStart);
        const r = this.r;
        const theta = this.reverse ? this.offset + this.arcEnd - arcAngle : this.offset + this.arcStart + arcAngle;

        return {r, theta};

    }

    getCartesianValueAt(n) {

        const arcAngle = n * (this.angleEnd - this.angleStart);
        const theta = this.reverse ? this.offset + this.angleEnd - arcAngle : this.offset + this.angleStart + arcAngle;

        const x = this.cx + this.r * Math.cos(theta);
        const y = this.cy + this.r * Math.sin(theta);

        return {x, y};

    }

    outOfRadialBounds(n, cx, cy, r) {

        const coords = this.getCartesianValueAt(n);
        const distanceSquared = (cx - coords.x) * (cx - coords.x) + (cy - coords.y) * (cy - coords.y);
        
        console.log(distanceSquared, r * r);

        return distanceSquared > r * r;

    }

    outOfCartesianBounds(n, x0, y0, x1, y1) {

        const coords = this.getCartesianValueAt(n);        
        return coords.x < x0 || coords.x > x1 || coords.y < y0 || coords.y > y1;

    }

    rotate(radians) {
        this.offset += radians;
    }

    translateX(amount) {
        this.cx += amount;
    }

    translateY(amount) {
        this.cy += amount;
    }

    scale(amount) {
        this.r *= amount;
    }

    reverse() {
        this.reverse = !this.reverse;
    }

    adjustAngleStart(radians) {

        // cap the degrees of rotation to 2 * PI
        if(Math.abs(this.angleEnd - (this.angleStart + radians)) > Math.PI * 2) {

            // find the adjustment that creates 2 * PI degrees of rotation
            const adjRadians = Math.PI * 2 - Math.abs(this.angleEnd - this.angleStart);

            // add it back to the angle
            if(radians < 0) {
                this.angleStart -= adjRadians;
            } else {
                this.angleState += adjRadians;
            }

        } else {

            this.angleStart += radians;

        }

    }

    adjustAngleEnd(radians) {

        // cap the degrees of rotation to 2 * PI
        if(Math.abs(this.angleEnd - (this.angleStart + radians)) > Math.PI * 2) {

            // find the adjustment that creates 2 * PI degrees of rotation
            const adjRadians = Math.PI * 2 - Math.abs(this.angleEnd - this.angleStart);

            // add it back to the angle
            if(radians < 0) {
                this.angleEnd -= adjRadians;
            } else {
                this.angleEnd += adjRadians;
            }

        } else {

            this.angleEnd += radians;

        }

    }

}