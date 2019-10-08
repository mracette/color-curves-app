import Function from './Function';
import * as d3 from 'd3-ease';

export default class Polynomial extends Function {

    constructor(rotation, translation, scale) {

        super((n) => d3.easePoly(n), rotation, translation, scale);

    }

    setExponent(e) {

        this.fn = (n) => d3.easePoly(n, e);

    }

}