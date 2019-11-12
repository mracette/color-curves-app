import Curve from '../Curve';

/**
 * Represents a generic function that can be further extended by a child class that specified a 1:1 relationship between a 
 * single input and single output
 * @extends Curve
 * @param {object} [options] Optional properties of the function
 */

export default class Function extends Curve {

    constructor(options = {}) {

        super({ ...options });

        const {
            scale,
            translation
        } = options;

        this.category = 'function';

        this.fn = (n) => n;

        // override parents default settings
        this.setTranslation(translation);
        this.setScale(scale);

    }

    setScaleY(y) {

        if (typeof y === 'number') {

            this.scale.y = y;

        } else if (this.surface.type === 'unitSquare') {

            this.scale.y = 0.5;

        } else if (this.surface.type === 'unitCircle') {

            this.scale.y = Math.sin(Math.PI * (9 / 8)) * -2;

        }

    }

    setScaleX(x) {

        if (typeof x === 'number') {

            this.scale.x = x;

        } else if (this.surface.type === 'unitSquare') {

            this.scale.x = 1;

        } else if (this.surface.type === 'unitCircle') {

            this.scale.x = Math.cos(Math.PI * (9 / 8)) * -2;

        }

    }

    setTranslateX(x) {

        if (typeof x === 'number') {

            this.translation.x = x;

        } else if (this.surface.type === 'unitSquare') {

            this.translation.x = 0;

        } else if (this.surface.type === 'unitCircle') {

            this.translation.x = Math.cos(Math.PI * (9 / 8));

        }

    }

    setTranslateY(y) {

        if (typeof y === 'number') {

            this.translation.y = y;

        } else if (this.surface.type === 'unitSquare') {

            this.translation.y = 0.25;

        } else if (this.surface.type === 'unitCircle') {

            this.translation.y = Math.sin(Math.PI * (9 / 8));

        }

    }

}