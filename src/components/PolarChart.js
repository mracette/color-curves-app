// libs
import React, { useEffect, useRef } from 'react';

// components
import ChartControls from './ChartControls';

function PolarChart(props) {

    const canvasRef = useRef(null);

    // for each chart type, the following must be defined
    let nx, ny, drawBlankChart, drawCurve

    switch(props.chartType) {

        case 'polar': {

            // Normalize x such that: nx(0) = width / 2 && nx(1) = width && nx(-1) = 0
            nx = (x) => {
                return canvasRef.current.width / 2 + x * canvasRef.current.width / 2;
            }

            // Normalize y such that: ny(0) = height / 2 && ny(1) = 0 && ny(-1) = height
            ny = (y) => {
                return canvasRef.current.height / 2 - y * canvasRef.current.height / 2;
            }

            drawBlankChart = () => {

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

            drawCurve = () => {

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

            break;

        }

        case 'cartesian': {

            // Normalize x such that: nx(0) = 0 && nx(1) = width
            nx = (x) => {
                return x * canvasRef.current.width;
            }

            // Normalize y such that: ny(0) = height && ny(1) = 0
            ny = (y) => {
                return canvasRef.current.height - y * canvasRef.current.height;
            }

            drawBlankChart = () => {

                const canvas = canvasRef.current;
                const ctx = canvas.getContext('2d', {alpha: false});
        
                // larger coordinate systems seem to result in sharper renders
                canvas.height = canvas.clientHeight * 4;
                canvas.width = canvas.clientWidth * 4;
        
                // get key dimensions
                ctx.lineWidth = canvas.width / 100;
        
                // fill rect
                const fillRectGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
                fillRectGradient.addColorStop(0, 'hsl(0, 0%, 100%');
                fillRectGradient.addColorStop(1, 'hsl(0, 0%, 0%');
                ctx.fillStyle = fillRectGradient;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
        
                // draw x and y axis
                ctx.strokeStyle = 'black';
                ctx.moveTo(0, 0);
                ctx.lineTo(0, canvas.height);
                ctx.lineTo(canvas.width, canvas.height);
                ctx.stroke();
        
                // create labels
                const padding = .075;
                ctx.font = '64px Arial';
                
                // white labels
                ctx.fillStyle = 'white';
                    ctx.textAlign = 'left';
                    ctx.fillText('(0,0)', nx(0 + padding), ny(0 + padding));
                    ctx.textAlign = 'right';
                    ctx.fillText('(1,0)', nx(1 - padding), ny(0 + padding));
        
                    // black labels
                ctx.fillStyle = 'black';
                    ctx.textAlign = 'left';
                    ctx.fillText('(0,1)', nx(0 + padding), ny(1 - padding));
                    ctx.textAlign = 'right';
                    ctx.fillText('(1,1)', nx(1 - padding), ny(1 - padding));
        
            }

            drawCurve = () => {

                // get canvas and context
                const canvas = canvasRef.current;
                const ctx = canvas.getContext('2d', {alpha: false});
        
                const lineSegments = 128;
        
                let prevCoords;
        
                for(let i = 0; i <= lineSegments; i++) {
        
                    ctx.beginPath();
        
                    const coords = props.palette.lCurve.getCartesianCoordsAt(i / lineSegments);
                
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

            break;

        }

    }

    const updateCurve = () => { 
        if(
            props.chartType === 'polar' && props.palette.hsCurve ||
            props.chartType === 'cartesian' && props.palette.lCurve
        ) {
            drawBlankChart();
            drawCurve();
        }
    }

    useEffect(() => {updateCurve();});

    return (
    
        <div className = 'chart col-md-6'>

            <div className = 'chart-wrapper border'>

                <div className = 'row'>

                    <div className = 'col-md-12'>

                        <h2>{props.title}</h2>

                    </div>

                </div>

                <div className = 'row'>

                    <div className = 'col-md-12'>

                        <canvas
                            className = 'chart'
                            ref = {canvasRef}
                        />

                    </div>

                </div>

                <ChartControls 
                    chartType = { props.chartType }
                    config = { props.config }
                    palette = { props.palette }
                    updateCurve = { updateCurve }
                />

            </div>
        
        </div>
    
    );

}

export default PolarChart;