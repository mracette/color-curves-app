import Curve from '../Curve';
import * as d3 from 'd3-ease';

export class LinearCurve extends Curve {

    constructor() {

        console.log(d3.easeLinear(.1));

        super(d3.easeLinear);

    }

}