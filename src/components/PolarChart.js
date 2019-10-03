// libs
import React, { useEffect, useRef } from 'react';
import { cartToPolar, polarToCart, degToRad } from '../lib/utils/math';
import { Arc } from '../lib/js/Arc';

function PolarChart() {

    const canvasRef = useRef(null);

    const nx = (x) => {
        return canvasRef.current.width / 2 + x * canvasRef.current.width / 2;
    }

    const ny = (y) => {
        return canvasRef.current.height / 2 - y * canvasRef.current.height / 2;
    }

    useEffect(() => {

        // canvas init
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', {alpha: false});

        // larger coordinate systems seem to result in sharper renders
        canvas.height = canvas.clientHeight * 4;
        canvas.width = canvas.clientWidth * 4;

        // get key dimensions
        const cx = nx(0);
        const cy = ny(0);
        const r = canvas.width / 2;
        const outline = r / 100;

        // color wheel parameters
        const arcCount = 256;
        const arcWidth = - Math.PI * 2 / arcCount;
        const arcPadding = arcWidth;

        // fill rect
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // outline
        ctx.strokeStyle = 'black';
        ctx.lineWidth = canvas.width / 100;
        ctx.arc(cx, cy, r - outline, 0, Math.PI * 2);
        ctx.stroke();


        for(let i = 0; i < arcCount; i++) {

            const radiusStart = 0;
            const radiusEnd = r - outline;

            const angleStart = i * arcWidth;
            const angleEnd = i * arcWidth + arcWidth;

            const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, r - outline);
            gradient.addColorStop(0, `hsl(${360 * i / arcCount}, 0%, 50%)`);
            gradient.addColorStop(1, `hsl(${360 * i / arcCount}, 100%, 50%)`);
            ctx.fillStyle = gradient;

            ctx.beginPath();
            ctx.arc(cx, cy, radiusStart, angleStart, angleEnd + arcPadding, true);
            ctx.arc(cx, cy, radiusEnd, angleEnd + arcPadding, angleStart, false);
            ctx.fill();

        }


        const arc = new Arc(nx(.6), ny(0), r / 2, 0, Math.PI * 2, 0, false);
        const arcSegments = 128;
        let prevCoords;
        
        for(let i = 0; i < arcSegments; i++) {

            ctx.beginPath();
            
            const coords = arc.getCartesianValueAt(i / arcSegments);

            if(arc.outOfRadialBounds(i / arcSegments, nx(0), ny(0), r)) {
                ctx.strokeStyle = 'red';
            } else {
                ctx.strokeStyle = 'black';
            }

            if(i === 0) {
                ctx.moveTo(coords.x, coords.y);
                prevCoords = coords;
            } else {
                ctx.moveTo(prevCoords.x, prevCoords.y);
                ctx.lineTo(coords.x, coords.y);
                prevCoords = coords;
            }

            ctx.closePath();
            ctx.stroke();

        }



    }, [canvasRef]);

    return (

        <div className = 'chart polar-chart'>

        <canvas 
            className = 'chart'
            ref = {canvasRef}
        />

        </div>
    
    );

}

export default PolarChart;