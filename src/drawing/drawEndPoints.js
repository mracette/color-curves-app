import { nxCircle, nyCircle, nxSquare, nySquare } from '../drawing/normalize';

const drawEndPoints = (curve, canvas, padding) => {

    let nx, ny;

    switch(curve.surface.type) {
        case 'unitCircle': 
            nx = nxCircle(canvas, padding);
            ny = nyCircle(canvas, padding);
            break;
        case 'unitSquare':
            nx = nxSquare(canvas, padding);
            ny = nySquare(canvas, padding);
            break;
        default: 
            console.error('Invalid surface type. Must be "unitCircle" or "unitSquare"');
            return;
    }

    const ctx = canvas.getContext('2d');
    let s, e;

    if(curve.overflow === 'clamp') {

        // use clamp start/end
        s = curve.getCurveCoordsAt(curve.clampStart);
        e = curve.getCurveCoordsAt(curve.clampEnd);

    } else {

        // use 0 and 1
        s = curve.getCurveCoordsAt(0);
        e = curve.getCurveCoordsAt(1);
        
    }

    ctx.lineWidth = canvas.width / 50;

    ctx.beginPath();
    ctx.fillStyle = "lightgreen";
    ctx.arc(nx(s.x), ny(s.y), canvas.width/100, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = "palevioletred";
    ctx.moveTo(nx(e.x), ny(e.y));
    ctx.arc(nx(e.x), ny(e.y), canvas.width/100, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fill();

}

export default drawEndPoints;