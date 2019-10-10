// libs
import React, { useEffect, useRef } from 'react';

// components
import ChartControls from './ChartControls';

function PolarChart(props) {

    const canvasRef = useRef(null);

    const nx = (x) => {
        /* 
        Normalize x such that:
            nx(0) = width / 2;
            nx(1) = width
            nx(-1) = 0
        */
        return canvasRef.current.width / 2 + x * canvasRef.current.width / 2;
    }

    const ny = (y) => {
        /* 
        Normalize y such that:
            ny(0) = height / 2;
            ny(1) = 0
            ny(-1) = height
        */
        return canvasRef.current.height / 2 - y * canvasRef.current.height / 2;
    }

    const drawBlankChart = () => {

        // get canvas and context
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
    }

    const drawCurve = () => {

        // get canvas and context
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', {alpha: false});

        const lineSegments = 128;

        let prevCoords;

        for(let i = 0; i <= lineSegments; i++) {

            ctx.beginPath();
            
            const coords = props.palette.hsCurve.getCartesianCoordsAt(i / lineSegments);

            ctx.strokeStyle = 'black';

            if(i === 0) {
                ctx.moveTo(nx(coords.x), ny(coords.y));
                prevCoords = coords;
            } else {
                ctx.moveTo(nx(prevCoords.x), ny(prevCoords.y));
                ctx.lineTo(nx(coords.x), ny(coords.y));
                prevCoords = coords;
            }

            ctx.closePath();
            ctx.stroke();

        }

        // if curve is redrawn, also update the palettes
        props.updatePalettes();
                
    }

    const updateCurve = () => { 
        if(props.palette.hsCurve) {
            drawBlankChart();
            drawCurve();
        }
    }

    useEffect(() => {updateCurve();});

    return (
    
        <div className = 'chart col-sm-6'>

            <div className = 'chart-border border'>

                <div className = 'row'>

                    <div className = 'col-sm-12'>

                        <h2>{props.title}</h2>

                    </div>

                </div>

                <div className = 'row'>

                    <div className = 'col-sm-12'>

                        <canvas
                            className = 'chart'
                            ref = {canvasRef}
                        />

                    </div>

                </div>

                <ChartControls 
                    chartType = 'hs'
                    config = { props.config }
                    palette = { props.palette }
                    updateCurve = { updateCurve }
                />

            </div>
        
        </div>
    
    );

}

export default PolarChart;