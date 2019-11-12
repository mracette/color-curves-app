
import UnitSquare from '../js/surfaces/UnitSquare';
import UnitCircle from '../js/surfaces/UnitCircle';
import { cartToPolar, polarToCart } from '../utils/math';

/**
 * Represents a relationship between a 1-dimensional input bounded by [0, 1] and a 2-dimensional
 * output bounded by the perimeter of the surface on which the curve lies.
 * 
 * The surface must be either a unit circle (to represent the Hue-Saturation space) or a 
 * unit square (to represent the lightness space).
 * 
 * Curves are not instantiated directly.
 */

export default class Curve {

    /**
     * Creates a new Curve.
     * @param {object} [options] Optional properties of the curve
     * @param {object} [options.overflow] Defines how to adjust output that extends past the surface perimeter
     * @param {boolean} [options.reverse] Whether to reverse the direction of the curve
     * @param {number} [options.rotation] Z-axis rotation of the curve in radians
     * @param {object} [options.scale] 2-dimensional scale of the curve
     * @param {number} [options.scale.x] Translation along the local X axis
     * @param {number} [options.scale.y] Translation along the local Y axis
     * @param {string} [options.surface] The surface on which to draw the curve
     * @param {object} [options.translation] 2-dimensional translation of the curve
     * @param {number} [options.translation.x] Translation along the local X axis
     * @param {number} [options.translation.y] Translation along the local Y axis
     */

    constructor(options) {

        const {
            overflow,
            reverse,
            rotation,
            scale,
            surface,
            translation
        } = options;

        this.isCurve = true;
        this.surface = {};
        this.scale = {};
        this.translation = {};

        this.setOverflow(overflow);
        this.setReverse(reverse);
        this.setRotation(rotation);
        this.setScale(scale);
        this.setSurface(surface);
        this.setTranslation(translation);

    }

    static getParamSet() {

        const paramsList = [
            'type', 'overflow', 'reverse', // curve
            'translation', 'translateX', 'translateY', 'scale', 'scaleX', 'scaleY', 'rotation', // tranformations
            'angleStart', 'angleEnd', 'angleOffset', 'radius', // arc
            'variation', // function
            'exponent', // poly
            'amplitude', 'period', // elastic
            'overshoot' // back
        ];

        return paramsList

    }

    /**
     * Set the curve's surface.
     * @param {object|string} surface The surface on which to draw the curve
     */

    setSurface(surface = 'unitSquare') {

        if (surface === 'unitSquare') {

            this.surface = new UnitSquare();

        } else if (surface === 'unitCircle') {

            this.surface = new UnitCircle();

        } else {

            console.warn(
                "Invalid surface type. Options are 'unitCircle' (for H/S components) or 'unitSquare' (for L component). ",
                "Using unitSquare instead."
            );

            surface = new UnitSquare();

        }

    }

    /**
     * Samples the curve and sets clampStart and clampEnd to the input values where the curve intersects the perimeter. If the 
     * outputs at 0 or 1 are inside of the surface then the clampStart and clampEnd are set to 0 and 1, respectively.
     * @param {number} [resolution = 128] Number of samples used to determine the clamp bounds
     */

    setClampBounds(resolution = 128) {

        let prevCoords;
        let clampStart = null;
        let clampEnd = null;
        let i = 0;

        while (i <= resolution && (clampStart === null || clampEnd === null)) {

            const coords = this.getCurveCoordsAt(i / resolution);

            if (i === 0) {

                // if the starting point is inside the surface, then the clamp start is the same as the start
                if (!coords.clamped) clampStart = i / resolution;

            } else {

                // set start clamp if the prev point is outside the surface, but the current point is inside
                if (clampStart === null && prevCoords.clamped && !coords.clamped) {
                    clampStart = i / resolution;
                }

                // set end clamp if the prev point is inside the surface, but the current point is outside
                if (clampEnd === null && !prevCoords.clamped && coords.clamped) {
                    clampEnd = i / resolution;
                }

            }

            // if the entire curve is outside of the surface, set the clampEnd to 0
            if (i === resolution && coords.clamped && clampStart === null && clampEnd === null) {
                clampEnd = 0;
            }

            prevCoords = coords
            i++;

        }

        this.clampStart = clampStart === null ? 0 : clampStart;
        this.clampEnd = clampEnd === null ? 1 : clampEnd;

    }

    /**
     * Sets the overflow behavior.
     * @param {string} [overflow = 'clamp'] Method for adjusting output that extends past the surface perimeter
     */

    setOverflow(overflow = 'clamp') {

        if (overflow === 'clamp' || overflow === 'project') {

            this.overflow = overflow;

        } else {

            console.warn("Overflow value must be either 'clamp' or 'project'. Using clamp.");
            this.overflow = 'clamp';

        }

    }

    /**
     * Sets the reverse flag.
     * @param {boolean} [reverse = false] Whether to reverse the direction of the curve
     */

    setReverse(reverse = false) {

        this.reverse = reverse;

    }

    /**
     * Sets the rotation of the curve
     * @param {boolean} [rotation = 0] Z-Axis rotation of the curve in radians
     */

    setRotation(rotation = 0) {

        this.rotation = rotation;

    }

    /**
     * Sets the scale of the curve
     * @param {object} [options.scale] 2-dimensional scale of the curve
     * @param {number} [options.scale.x] Scale along the local X axis
     * @param {number} [options.scale.y] Scale along the local Y axis
     */

    setScale(scale) {

        if (typeof scale === 'object' && typeof scale.x === 'number') {

            this.setScaleX(scale.x);

        } else {

            this.setScaleX();

        }

        if (typeof scale === 'object' && typeof scale.y === 'number') {

            this.setScaleY(scale.y);

        } else {

            this.setScaleY();

        }

    }

    /**
     * Sets the X scale of the curve. Default depends on the surface type.
     * @param {number} [x] Scale along the local X axis
     */

    setScaleX(x) {

        if (typeof x === 'number') {

            this.scale.x = x;

        } else {

            this.scale.x = 1;

        }

    }

    /**
     * Sets the Y scale of the curve. Default depends on the surface type.
     * @param {number} [y] Scale along the local Y axis
     */

    setScaleY(y) {

        if (typeof y === 'number') {

            this.scale.y = y;

        } else {

            this.scale.y = 1;

        }

    }

    /**
     * Sets the translation of the curve
     * @param {object} [options.translation] 2-dimensional translation of the curve
     * @param {number} [options.translation.x] Translation along the local X axis
     * @param {number} [options.translation.y] Translation along the local Y axis
     */

    setTranslation(translation) {

        if (typeof translation === 'object' && typeof translation.x === 'number') {

            this.setTranslateX(translation.x);

        } else {

            this.setTranslateX();

        }

        if (typeof translation === 'object' && typeof translation.y === 'number') {

            this.setTranslateY(translation.y);

        } else {

            this.setTranslateY();

        }

    }

    /**
     * Sets the translation of the curve along the local X axis. The default values depends on the surface type.
     * @param {number} [x] Translation along the local X axis
     */

    setTranslateX(x) {

        if (typeof x === 'number') {

            this.translation.x = x;

        } else if (this.surface.type === 'unitSquare') {

            this.translation.x = 0.5;

        } else if (this.surface.type === 'unitCircle') {

            this.translation.x = 0;

        }

    }

    /**
     * Sets the translation of the curve along the local Y axis. The default values depends on the surface type.
     * @param {number} [y] Translation along the local Y axis
     */

    setTranslateY(y) {

        if (typeof y === 'number') {

            this.translation.y = y;

        } else if (this.surface.type === 'unitSquare') {

            this.translation.y = 0.5;

        } else if (this.surface.type === 'unitCircle') {

            this.translation.y = 0;

        }

    }

    /**
     * Returns the x and y coordinates associated with a number n in the range [0, 1].
     * @param {object} n A number between 0 and 1 representing the proportion of the curve to traverse
     * @returns {object.<string, number>} The x and y coordinates of the function at a point n
     */

    getFnCoordsAt(n) {

        if (this.category === 'geometry') {

            return this.fn(n);

        } else if (this.category === 'function') {

            return { x: n, y: this.fn(n) }

        }

    }


    /**
     * Applies transformation to the coordinates of the underlying function for the curve. Returns an object containing
     * the new x and y coordinates and well as a 'clamped' flag that is true for coordinates outside of the surface perimeter.
     * @param {object} n A number between 0 and 1 representing the proportion of the curve to traverse
     * @returns {object.<string, number|boolean>} The x and y coordinates of the curve at a point n
     */

    getCurveCoordsAt(n) {

        if (n < 0 || n > 1) {
            console.error('n must be a number in the range [0, 1]');
            return null;
        }

        // take mirror of n if reversed
        if (this.reverse) n = (1 - n);

        // get x and y from the curve's function
        let { x, y } = this.getFnCoordsAt(n);

        // scale each point
        x *= this.scale.x;
        y *= this.scale.y;

        // translate each point
        x += this.translation.x;
        y += this.translation.y;

        // rotate around surface center
        const sin = Math.sin(this.rotation);
        const cos = Math.cos(this.rotation);
        const xRot = ((x - this.surface.cx) * cos - (y - this.surface.cy) * sin + this.surface.cx);
        const yRot = ((x - this.surface.cy) * sin + (y - this.surface.cy) * cos + this.surface.cy);

        // clamp methodology depends on the surface type
        if (this.surface.type === 'unitSquare') {

            const clamped = UnitSquare.outOfBounds(xRot, yRot);
            const xClamp = Math.min(1, Math.max(0, xRot));
            const yClamp = Math.min(1, Math.max(0, yRot));

            return {
                x: xClamp,
                y: yClamp,
                clamped
            };

        } else if (this.surface.type === 'unitCircle') {

            // convert to polar in order to clamp the radius
            const clamped = UnitCircle.outOfBounds(xRot, yRot);
            const polarCoords = cartToPolar(xRot, yRot);
            const cartCoordsClamped = polarToCart(Math.max(-1, Math.min(1, polarCoords.r)), polarCoords.theta);

            return {
                x: cartCoordsClamped.x,
                y: cartCoordsClamped.y,
                clamped
            };

        }

    }

}