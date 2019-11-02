import Curve from '../Curve';

/**
 * Represents a segment of a circle
 * @extends Curve
 */

export default class Arc extends Curve {

    /**
     * Creates a new Arc.
     * @param {object} [options] Optional properties of the arc
     * @param {number} [options.radius] Radius of the arc
     * @param {number} [options.angleStart = 0] The angle in radians of the segment start
     * @param {number} [options.angleEnd = 2PI] The angle in radians of the segment end
     * @param {number} [options.angleOffset = 0] The degrees in radians by which the angleStart and angleEnd are offset
     * @param {...*} [curveOptions] See {@link Curve}
     */

    constructor(options) {

        const {
            radius,
            angleStart = 0,
            angleEnd = Math.PI * 2,
            angleOffset = 0
        } = options

        super({...options});;

        this.type = 'arc';
        this.category = 'geometry';
        this.fn = null;

        this.setRadius(radius);
        this.setAngleStart(angleStart);
        this.setAngleEnd(angleEnd);
        this.setAngleOffset(angleOffset);

        this.setFunction();

    }

    setFunction() {

        this.fn = (n) => {

            const arcAngle = n * (this.angleEnd - this.angleStart);
            const theta = this.angleOffset + this.angleStart + arcAngle;

            return {
                x: this.radius * Math.cos(theta),
                y: this.radius * Math.sin(theta)
            };

        }

    }

    /**
     * Sets the radius of the arc. If no value is passed a default is set based on the surface type.
     * @param {object} [radius] Radius of the arc
     */

    setRadius(radius) {

        if(typeof radius === 'number') {

            this.radius = radius;

        } else if(this.surface.type === 'unitSquare') {

            this.setRadius(0.25);

        } else if (this.surface.type === 'unitCircle') {

            this.setRadius(0.5);
            
        }

    }

    /**
     * Sets the angle in radians of the ending point of the segment.
     * @param {object} [angleStart = 0] The angle in radians
     */

    setAngleStart(angleStart = 0) {

        this.angleStart = angleStart;

    }

    /**
     * Sets the angle in radians of the starting point of the segment.
     * @param {object} [angleEnd = 0] The angle in radians
     */

    setAngleEnd(angleEnd = 0) {

        this.angleEnd = angleEnd;

    }

    /**
     * Sets the degrees in radians by which the angleStart and angleEnd are offset
     * @param {object} [angleOffset = 0] The degrees in radians
     */

    setAngleOffset(angleOffset = 0) {

        this.angleOffset = angleOffset;

    }

}