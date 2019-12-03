import { clamp } from '../utils/math';

export class CoordinateSystem {

    /**
     * Creates a canvas coordinate system.
     * @param {object} canvas The canvas to map the coordinate system to
     * @param {object} [options] Optional properties of the system
     * @param {object} [options.nxRange = [-1, 1]] An array that represents the bounds of the normalized x axis
     * @param {object} [options.nyRange = [-1, 1]] An array that represents the bounds of the normalized y axis
     * @param {boolean} [options.clamp = false] Whether or not to clamp coordinate that are outside of the bounds
     * @param {number} [options.padding = 0] Defines padding as a proportion of the canvas width
     * @param {number} [options.paddingX] Defines X padding as a proportion of the canvas width (if defined, overrides options.padding)
     * @param {number} [options.paddingY] Defines Y padding as a proportion of the canvas height (if defined, overrides options.padding)
     * @param {number} [options.orientationY = 'up'] Defines the direction of positive Y (either 'up' or 'down').
     */

    constructor(canvas, options) {

        this.canvas = canvas;

        const defaults = {
            nxRange: [-1, 1],
            nyRange: [-1, 1],
            padding: 0,
            paddingX: undefined,
            paddingY: undefined,
            orientationY: 'down'
        };

        Object.assign(this, { ...defaults, ...options });

    }

    /**
     * Maps a normalized x-value to a canvas x-value
     * @param {object} n A normalized x-value i]n the range [0, 1]
     * @param {number} [options.padding] Defines padding as a proportion of the canvas width (if defined, overrides padding settings for the system)
     */

    nx(n, options = {}) {

        let padding;

        this.clamp && (n = clamp(n, this.nxRange[0], this.nxRange[1]));

        if (typeof options.padding === 'number') {
            padding = options.padding * this.canvas.width;
        } else {
            padding = (this.paddingX || this.padding) * this.canvas.width;
        }

        return padding + ((n - this.nxRange[0]) / (this.nxRange[1] - this.nxRange[0])) * (this.canvas.width - 2 * padding);

    }

    /**
     * Maps a normalized y-value to a canvas y-value
     * @param {object} n A normalized y-value in the range [0, 1]
     * @param {number} [options.padding] Defines padding as a proportion of the canvas width (if defined, overrides padding settings for the system)
     * @param {number} [options.paddingY] Defines padding as a proportion of the canvas height (if defined, overrides padding settings for the system)
     */

    ny(n, options = {}) {

        let padding;

        this.clamp && (n = clamp(n, this.nyRange[0], this.nyRange[1]));

        if (typeof options.paddingY === 'number') {
            padding = options.paddingY * this.canvas.height;
        } else if (typeof options.padding === 'number') {
            padding = options.padding * this.canvas.width;
        } else {
            padding = (typeof this.paddingY === 'number') ?
                (this.paddingY * this.canvas.height) :
                (this.padding * this.canvas.width);
        }

        if (this.orientationY === 'down') {
            return padding + ((n - this.nyRange[0]) / (this.nyRange[1] - this.nyRange[0])) * (this.canvas.height - 2 * padding);
        } else if (this.orientationY === 'up') {
            return this.canvas.height - padding - ((n - this.nyRange[0]) / (this.nyRange[1] - this.nyRange[0])) * (this.canvas.height - 2 * padding);
        }

    }

    getWidth() {
        return this.nx(this.nxRange[1]) - this.nx(this.nxRange[0]);
    }

    getHeight() {
        if (this.orientationY === 'down') {
            return this.ny(this.nyRange[1]) - this.ny(this.nyRange[0]);
        } else if (this.orientationY === 'up') {
            return this.ny(this.nyRange[0]) - this.ny(this.nyRange[1]);
        } else {
            return undefined;
        }
    }

}