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