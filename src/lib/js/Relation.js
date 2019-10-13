/**
 * Class representing a relationship between inputs and outputs and a set of 
 * transformations. Not to be invoked directly
 */
export default class Relation {

    constructor(surface) {

        this.surface = surface;
        this.reverse = false;
        this.rotation = 0;
        this.translation = {x: 0, y: 0};
        this.scale = {x: 1, y: 1};
        this.minValue = 0;
        this.maxValue = 1;
        this.overflow = 'clamp';
        this.clampStart = 0;
        this.clampEnd = 1;

    }

    setClampBounds(resolution) {

        const res = typeof resolution === 'number' ? resolution : 128;

        let prevCoords;
        let clampStart = null;
        let clampEnd = null;
        let i = 0;

        while(i <= res && (clampStart === null || clampEnd === null)) {

            const coords = this.getCartesianCoordsAt(i / res);

            if(i === 0) {

                // if the starting point is inside the surface, then the clamp start is the same as the start
                if(!coords.clamped) clampStart = i / res;

            } else {

                // set start clamp if the prev point is outside the surface, but the current point is inside
                if(clampStart === null && prevCoords.clamped && !coords.clamped) {
                    clampStart = i / res;
                }

                // set end clamp if the prev point is inside the surface, but the current point is outside
                if(clampEnd === null && !prevCoords.clamped && coords.clamped) {
                    clampEnd = i / res;
                }

            }

            if(i === res && coords.clamped && clampStart === null && clampEnd === null) {
                clampEnd = 0;
            }

            prevCoords = coords
            i++;


        }

        this.clampStart = clampStart === null ? 0 : clampStart;
        this.clampEnd = clampEnd === null ? 1 : clampEnd;

    }

    setOverflow(value) {

        if(!(value === 'clamp' || value === 'project')) {

            console.warn("Overflow value must be either 'clamp' or 'project'");

        } else {

            this.overflow = value;

        }

    }

    setReverse(bool) {
        this.reverse = bool;
    }

    setminValue(n) {
        this.minValue = Math.max(0, Math.min(this.maxValue, Math.min(1, n)));
    }

    setmaxValue(n) {
        this.maxValue = Math.max(0, Math.max(this.minValue, Math.min(1, n)));
    }

    setTranslateX(value) {
        this.translation.x = value;
    }

    setTranslateY(value) {
        this.translation.y = value;
    }

    setTranslation(translation) {
        this.setTranslateX(translation.x);
        this.setTranslateY(translation.y);
    }

    translateX(amount) {
        this.translation.x += amount;
    }

    translateY(amount) {
        this.translation.y += amount;
    }

    setScaleX(value) {
        this.scale.x = value;
    }

    setScaleY(value) {
        this.scale.y = value;
    }

    setScale(scale) {
        this.setScaleX(scale.x);
        this.setScaleY(scale.y);
    }

    scaleX(amount) {
        this.scale.x += amount;
    }

    scaleY(amount) {
        this.scale.y += amount;
    }

    setRotation(value) {
        this.rotation = value;
    }

    rotate(amount) {
        this.rotation += amount;
    }

}