import { nxCircle, nyCircle, nxSquare, nySquare } from '../drawing/normalize';

export const drawHsChart = (curve, canvas, padding) => {

    const nx = nxCircle(canvas, padding);
    const ny = nyCircle(canvas, padding);

    const ctx = canvas.getContext('2d', {alpha: false});

    // larger coordinate systems seem to result in sharper renders
    canvas.height = canvas.clientHeight * 4;
    canvas.width = canvas.clientWidth * 4;

    // fill background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);        

    // color wheel parameters
    const arcCount = 256;
    const arcWidth = - Math.PI * 2 / arcCount;
    const arcPadding = arcWidth;

    // other parameters
    const cx = nx(0);
    const cy = ny(0);
    const r = nx(0) - padding * nx(0) * 2;

    // fill chart gradient
    for(let i = 0; i < arcCount; i++) {

        const radiusStart = 0;
        const radiusEnd = r;

        const angleStart = i * arcWidth;
        const angleEnd = i * arcWidth + arcWidth;

        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        gradient.addColorStop(0, `hsl(${360 * i / arcCount}, 0%, 50%)`);
        gradient.addColorStop(1, `hsl(${360 * i / arcCount}, 100%, 50%)`);
        ctx.fillStyle = gradient;

        ctx.beginPath();
        ctx.arc(cx, cy, radiusStart, angleStart, angleEnd + arcPadding, true);
        ctx.arc(cx, cy, radiusEnd, angleEnd + arcPadding, angleStart, false);
        ctx.fill();

    }

}

export const drawLChart = (curve, canvas, padding) => {

    const nx = nxSquare(canvas, padding);
    const ny = nySquare(canvas, padding);

    const ctx = canvas.getContext('2d', {alpha: false});

    // larger coordinate systems seem to result in sharper renders
    canvas.height = canvas.clientHeight * 4;
    canvas.width = canvas.clientWidth * 4;

    // fill background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.height, canvas.width);

    // fill chart gradient
    const fillRectGradient = ctx.createLinearGradient(
        nx(0), 
        ny(1), 
        nx(0), 
        ny(0)
    );
    fillRectGradient.addColorStop(0, 'hsl(0, 0%, 100%');
    fillRectGradient.addColorStop(1, 'hsl(0, 0%, 0%');
    ctx.fillStyle = fillRectGradient;
    ctx.fillRect(
        nx(0), 
        ny(1), 
        nx(1) - padding * nx(1), 
        ny(0) - padding * ny(0));

}