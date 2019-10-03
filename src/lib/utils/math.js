export const cartToPolar = (x, y) => {
    return {
        r: Math.sqrt(x * x + y * y),
        theta: Math.atan2(y, x)
    };
}

export const polarToCart = (r, theta) => {
    return {
        x: r * Math.cos(theta),
        y: r * Math.sin(theta)
    };
}

export const degToRad = (deg) => {
    return deg * Math.PI / 180;
}

export const radToDeg = (rad) => {
    return rad * 180 / Math.PI;
}