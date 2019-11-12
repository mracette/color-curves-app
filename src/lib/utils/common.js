export const validJson = (x) => {
    try {
        const o = JSON.parse(x);
        if (o && typeof o === "object") {
            return o;
        }
    }
    catch (e) { }
    return false;
};