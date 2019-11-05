import { nxCircle, nyCircle, nxSquare, nySquare } from '../drawing/normalize';

export const drawHsCurve = (curve, canvas, padding) => {

    const lineSegments = 128;

    const ctx = canvas.getContext('2d', {alpha: false});
    ctx.lineWidth = canvas.width / 120;

    // get functions to normalize coordinate systems
    const nx = nxCircle(canvas, padding);
    const ny = nyCircle(canvas, padding);

    // set clamp bounds if necessary
    curve.overflow === 'clamp' && curve.setClampBounds();

    let prevCoords;

    const start = curve.overflow === 'clamp' ? 
        curve.clampStart : 0;

    const end = curve.overflow === 'clamp' ? 
        curve.clampEnd : 1

    for(let i = 0; i <= lineSegments; i++) {

        ctx.beginPath();
        
        const coords = curve.getCurveCoordsAt(start + (i / lineSegments) * (end - start));

        ctx.strokeStyle = 'black';

            if(i === 0) {
                ctx.moveTo(nx(coords.x), ny(coords.y));
            } else {
                ctx.moveTo(nx(prevCoords.x), ny(prevCoords.y));
                ctx.lineTo(nx(coords.x), ny(coords.y));
            }

        ctx.stroke();

        prevCoords = coords;

    }

}

export const drawLCurve = (curve, canvas, padding) => {

    const lineSegments = 128;

    const ctx = canvas.getContext('2d', {alpha: false});
    ctx.lineWidth = canvas.width / 120;

    // get functions to normalize coordinate systems
    const nx = nxSquare(canvas, padding);
    const ny = nySquare(canvas, padding);

    // set clamp bounds if necessary
    curve.overflow === 'clamp' && curve.setClampBounds();

    let prevCoords;

    for(let i = 0; i <= lineSegments; i++) {

        ctx.beginPath();

        const coords = curve.getCurveCoordsAt(i / lineSegments);
    
        ctx.strokeStyle = 'black';

        if(curve.overflow === 'project' || !coords.clamped) {

            if(i === 0) {
                ctx.moveTo(nx(coords.x), ny(coords.y));
            } else {
                ctx.moveTo(nx(prevCoords.x), ny(prevCoords.y));
                ctx.lineTo(nx(coords.x), ny(coords.y));
            }

            ctx.stroke();

        }

        prevCoords = coords;

    }

}