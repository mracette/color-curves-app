import ColorPalette from '../js/ColorPalette'

export default class PhytoPlankton extends ColorPalette {

    constructor() {
        super('{"type":"exponential","overflow":"clamp","reverse":false,"translation":{"x":-1.12,"y":0.5},"scale":{"x":2.17,"y":0.765},"rotation":0.691,"variation":"in"}', '{"type":"polynomial","overflow":"clamp","reverse":false,"translation":{"x":0,"y":0.44},"scale":{"x":1,"y":0.41},"rotation":6.974,"variation":"in","exponent":3}', '{"name": "Phyto Plankton", "author": "Color Curves", "start":0,"end":0.72}');
    }

}