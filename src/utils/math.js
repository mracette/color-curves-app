export const clamp = (n, min, max) => {
    return Math.min(max, Math.max(min, n));
}

export const cartToPolar = (x, y) => {
    return {
        r: Math.sqrt(x * x + y * y),
        theta: Math.atan2(y, x)
    };
}