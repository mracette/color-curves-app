import ColorPalette from '../js/ColorPalette'

export const warmMagma = () => {
    return new ColorPalette('{"type":"exponential","overflow":"clamp","reverse":false,"translation":{"x":-0.66,"y":-0.58},"scale":{"x":1.61,"y":0.76},"rotation":0.84,"variation":"in"}', '{"type":"sinusoidal","overflow":"clamp","reverse":false,"translation":{"x":0,"y":0.37},"scale":{"x":1,"y":0.24},"rotation":0,"variation":"out"}', '{"start":0.05,"end":1,"name":"Warm Magma","author":"Color Curves"}');
}

export const allAround = () => {
    return new ColorPalette('{"type":"arc","overflow":"clamp","reverse":false,"translation":{"x":0,"y":0},"scale":{"x":1,"y":1},"rotation":0,"angleStart":0,"angleEnd":6.283,"angleOffset":0,"radius":0.5}', '{"type":"arc","overflow":"clamp","reverse":false,"translation":{"x":0.5,"y":0.5},"scale":{"x":1,"y":1},"rotation":0,"angleStart":0,"angleEnd":6.283,"angleOffset":0,"radius":0.25}', '{"start":0,"end":1,"name":"All Around","author":"Color Curves"}');
}

export const unAmerican = () => {
    return new ColorPalette('{"type":"polynomial","overflow":"clamp","reverse":false,"translation":{"x":-0.924,"y":-0.383},"scale":{"x":1.848,"y":0.765},"rotation":2.75,"variation":"out","exponent":3}', '{"type":"linear","overflow":"clamp","reverse":false,"translation":{"x":0,"y":0.25},"scale":{"x":1,"y":0.74},"rotation":0}', '{"start":0,"end":1,"name":"Un-American","author":"Color Curves"}');
}

export const candyPaint = () => {
    return new ColorPalette('{"type":"exponential","overflow":"clamp","reverse":false,"translation":{"x":-0.924,"y":-0.45},"scale":{"x":1.848,"y":0.77},"rotation":0,"variation":"in"}', '{"type":"linear","overflow":"clamp","reverse":false,"translation":{"x":0,"y":0.25},"scale":{"x":1,"y":0.5},"rotation":4.541}', '{"start":0.02,"end":1,"name":"Candy Paint","author":"Color Curves"}');
}

export const goldfishDeluxe = () => {
    return new ColorPalette('{"type":"exponential","overflow":"clamp","reverse":false,"translation":{"x":-0.924,"y":-0.383},"scale":{"x":1.848,"y":0.765},"rotation":3.171,"variation":"in"}', '{"type":"linear","overflow":"clamp","reverse":false,"translation":{"x":0,"y":0.05},"scale":{"x":1,"y":0.44},"rotation":2.69}', '{"start":0,"end":1,"name":"Goldfish Deluxe","author":"Color Curves"}');
}

export const trixSky = () => {
    return new ColorPalette('{"type":"exponential","overflow":"clamp","reverse":false,"translation":{"x":-1.31,"y":-0.383},"scale":{"x":1.848,"y":0.765},"rotation":5.81,"variation":"in"}', '{"type":"linear","overflow":"clamp","reverse":false,"translation":{"x":0,"y":0.34},"scale":{"x":1,"y":0.5},"rotation":0}', '{"start":0,"end":1,"name":"Trix Sky","author":"Color Curves"}');
}

export const coralScrub = () => {
    return new ColorPalette('{"type":"linear","overflow":"clamp","reverse":false,"translation":{"x":-0.97,"y":0.11},"scale":{"x":1.8,"y":0.52},"rotation":0}', '{"type":"linear","overflow":"clamp","reverse":false,"translation":{"x":0,"y":0.39},"scale":{"x":0.93,"y":0.27},"rotation":0}', '{"start":0,"end":1,"name":"Coral Scrub","author":"Color Curves"}');
}

export const polarBeyond = () => {
    return new ColorPalette('{"type":"bounce","overflow":"clamp","reverse":false,"translation":{"x":-0.924,"y":-0.92},"scale":{"x":1.848,"y":0.45},"rotation":4.3,"variation":"in"}', '{"type":"exponential","overflow":"clamp","reverse":false,"translation":{"x":0,"y":0.43},"scale":{"x":1,"y":0.19},"rotation":0,"variation":"in-out"}', '{"start":0.53,"end":0.87,"name":"Polar Beyond","author":"Color Curves"}');
}