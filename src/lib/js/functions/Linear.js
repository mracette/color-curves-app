import Function from './Function';

/**
 * Creates a linear curve.
 * @extends Function
 * @param {object} [options] Optional properties of the function
 */

export default class Linear extends Function {

    constructor(options) {
        
        super({...options});

        this.type = 'linear';

    }

}