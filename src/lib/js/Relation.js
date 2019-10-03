import { cartToPolar } from '../utils/math';

/**
 * Class representing a relationship between inputs and outputs and a set of 
 * transformations. Not to be invoked directly
 */
export default class Relation {

    constructor(rotation, translation, scale) {

        this.reverse = false;
        this.rotation = typeof rotation === 'number' ? rotation : 0;
        this.translation = typeof translation === 'object' ? translation : {x: 0, y: 0};
        this.scale = typeof scale === 'object' ? scale : {x: 1, y: 1};

    }

    reverse() {
        this.reverse = !this.reverse;
    }

    setTranslateX(value) {
        this.translation.x = value;
    }

    setTranslateY(value) {
        this.translation.y = value;
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