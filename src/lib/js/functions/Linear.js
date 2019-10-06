import Function from './Function';
import * as d3 from 'd3-ease';

export default class Linear extends Function {

    constructor(rotation, translation, scale) {

        super(d3.easeLinear, rotation, translation, scale);

    }

}