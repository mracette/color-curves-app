/**
 * Converts x coordinates on a unit circle to x coordinate on a canvas
 * @param {number} canvas A canvas that represents a unit circle
 * @param {number} padding The proportion of the canvas to reserve for padding on either side
 * @returns {object} Returns a function that converts a unit circle coordinate to one on the canvas
 */

export const nxCircle = (canvas, padding) => (x) => {

    const width = canvas.width * (1 - 2 * padding);
    const offset = canvas.width * padding;

    return offset + width / 2 + x * width / 2;

    }

/**
 * Converts x coordinates on a unit square to x coordinate on a canvas
 * @param {number} canvas A canvas that represents a unit square
 * @param {number} padding The proportion of the canvas to reserve for padding on either side
 * @returns {object} Returns a function that converts a unit square coordinate to one on the canvas
 */

export const nxSquare = (canvas, padding) => (x) => {

    const offset = canvas.width * padding;
    const width = canvas.width * (1 - 2 * padding);

    return offset + x * width;

}

/**
 * Converts y coordinates on a unit square to y coordinate on a canvas
 * @param {number} canvas A canvas that represents a unit square
 * @param {number} padding The proportion of the canvas to reserve for padding on either side
 * @returns {object} Returns a function that converts a unit square coordinate to one on the canvas
 */

export const nyCircle = (canvas, padding) => (y) => {

    const height = canvas.height * (1 - 2 * padding);
    const offset = canvas.height * padding;

    return offset + height / 2 - y * height / 2;

    }

/**
 * Converts y coordinates on a unit square to y coordinate on a canvas
 * @param {number} canvas A canvas that represents a unit square
 * @param {number} padding The proportion of the canvas to reserve for padding on either side
 * @returns {object} Returns a function that converts a unit square coordinate to one on the canvas
 */

export const nySquare = (canvas, padding) => (y) => {

    const offset = canvas.height * padding;
    const height = canvas.height * (1 - 2 * padding);

    return offset + height - y * height;

}