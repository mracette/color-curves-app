import { nxCircle, nyCircle, nxSquare, nySquare } from '../drawing/normalize';

export const drawHsOrientation = (curve, canvas, padding) => {

    const nx = nxCircle(canvas, padding);
    const ny = nyCircle(canvas, padding);

    const rotatePoint = (x, y) => {

        const sin = Math.sin(curve.rotation);
        const cos = Math.cos(curve.rotation);

        const xRot = (x - curve.surface.cx) * cos - (y - curve.surface.cy) * sin + curve.surface.cx;
        const yRot = (x - curve.surface.cx) * sin + (y - curve.surface.cy) * cos + curve.surface.cy;

        return {
            x: xRot,
            y: yRot
        };

    }

    const tickLength = 0.03 // proportion of canvas
    const fontSize = 14;
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = canvas.width / 200;

    ctx.beginPath();
    ctx.fillStyle = 'black';
    ctx.font = `${fontSize}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // +X
    let width = ctx.measureText("+X").width;
    let p0 = rotatePoint(1 - tickLength, 0);
    let p1 = rotatePoint(1 + tickLength, 0);
    let p2 = rotatePoint(1 + tickLength + 2 * width / canvas.width, 0);
    ctx.moveTo(nx(p0.x), ny(p0.y));
    ctx.lineTo(nx(p1.x), ny(p1.y));
    ctx.fillText("+X", nx(p2.x), ny(p2.y));

    // +Y
    width = ctx.measureText("+Y").width;
    p0 = rotatePoint(0, 1 - tickLength);
    p1 = rotatePoint(0, 1 + tickLength);
    p2 = rotatePoint(0, 1 + tickLength + 2 * width / canvas.width);
    ctx.moveTo(nx(p0.x), ny(p0.y));
    ctx.lineTo(nx(p1.x), ny(p1.y));
    ctx.fillText("+Y", nx(p2.x), ny(p2.y));

    // -X
    width = ctx.measureText("-X").width;
    p0 = rotatePoint(-1 - tickLength, 0);
    p1 = rotatePoint(-1 + tickLength, 0);
    p2 = rotatePoint(-1 - tickLength - 2 * width / canvas.width, 0);
    ctx.moveTo(nx(p0.x), ny(p0.y));
    ctx.lineTo(nx(p1.x), ny(p1.y));
    ctx.fillText("-X", nx(p2.x), ny(p2.y));

    // -Y
    width = ctx.measureText("-Y").width;
    p0 = rotatePoint(0, -1 - tickLength);
    p1 = rotatePoint(0, -1 + tickLength);
    p2 = rotatePoint(0, -1 - tickLength - 2 * width / canvas.width);
    ctx.moveTo(nx(p0.x), ny(p0.y));
    ctx.lineTo(nx(p1.x), ny(p1.y));
    ctx.fillText("-Y", nx(p2.x), ny(p2.y));

    ctx.stroke();

}

export const drawLOrientation = (curve, canvas, padding) => {

    const nx = nxSquare(canvas, padding);
    const ny = nySquare(canvas, padding);

    const rotatePoint = (x, y) => {

        const sin = Math.sin(curve.rotation);
        const cos = Math.cos(curve.rotation);

        const xRot = (x - curve.surface.cx) * cos - (y - curve.surface.cy) * sin + curve.surface.cx;
        const yRot = (x - curve.surface.cx) * sin + (y - curve.surface.cy) * cos + curve.surface.cy;

        return {
            x: xRot,
            y: yRot
        };

    }

    const tickLength = 0.03 // proportion of canvas
    const fontSize = 14;
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = canvas.width / 200;

    ctx.beginPath();
    ctx.fillStyle = 'black';
    ctx.font = `${fontSize}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // +X
    let width = ctx.measureText("+X").width;
    let p0 = rotatePoint(1 - tickLength / 2, 0.5);
    let p1 = rotatePoint(1 + tickLength / 2, 0.5);
    let p2 = rotatePoint(1 + tickLength / 2 + width / canvas.width, 0.5);
    ctx.moveTo(nx(p0.x), ny(p0.y));
    ctx.lineTo(nx(p1.x), ny(p1.y));
    ctx.fillText("+X", nx(p2.x), ny(p2.y));

    // +Y
    width = ctx.measureText("+Y").width;
    p0 = rotatePoint(0.5, 1 - tickLength / 2);
    p1 = rotatePoint(0.5, 1 + tickLength / 2);
    p2 = rotatePoint(0.5, 1 + tickLength / 2 + width / canvas.width);
    ctx.moveTo(nx(p0.x), ny(p0.y));
    ctx.lineTo(nx(p1.x), ny(p1.y));
    ctx.fillText("+Y", nx(p2.x), ny(p2.y));

    // -X
    width = ctx.measureText("-X").width;
    p0 = rotatePoint(0 - tickLength / 2, 0.5);
    p1 = rotatePoint(0 + tickLength / 2, 0.5);
    p2 = rotatePoint(0 - tickLength / 2 - width / canvas.width, 0.5);
    ctx.moveTo(nx(p0.x), ny(p0.y));
    ctx.lineTo(nx(p1.x), ny(p1.y));
    ctx.fillText("-X", nx(p2.x), ny(p2.y));

    // -Y
    width = ctx.measureText("-Y").width;
    p0 = rotatePoint(0.5, 0 - tickLength / 2);
    p1 = rotatePoint(0.5, 0 + tickLength / 2);
    p2 = rotatePoint(0.5, 0 - tickLength / 2 - width / canvas.width);
    ctx.moveTo(nx(p0.x), ny(p0.y));
    ctx.lineTo(nx(p1.x), ny(p1.y));
    ctx.fillText("-Y", nx(p2.x), ny(p2.y));

}