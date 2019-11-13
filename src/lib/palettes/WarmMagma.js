import ColorPalette from '../js/ColorPalette'

export default class WarmMagma extends ColorPalette {

    constructor() {
        super('{"type":"exponential","overflow":"clamp","reverse":false,"translation":{"x":-0.66,"y":-0.58},"scale":{"x":1.61,"y":0.76},"rotation":0.84,"variation":"in"}', '{"type":"sinusoidal","overflow":"clamp","reverse":false,"translation":{"x":0,"y":0.37},"scale":{"x":1,"y":0.24},"rotation":0,"variation":"out"}', '{"start":0.05,"end":1,"name":"Warm Magma","author":"Color Curves"}');
    }

}