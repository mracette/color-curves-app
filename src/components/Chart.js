// libs
import React, { useEffect, useRef } from 'react';

// components
import ChartControls from './ChartControls';

function Chart(props) {

    const canvasRef = useRef(null);

    const drawEndPoints = (curve, canvas) => {

        const ctx = canvas.getContext('2d');
        let s, e;

        if(curve.overflow === 'clamp') {

            // use clamp start/end
            s = curve.getCartesianCoordsAt(curve.clampStart);
            e = curve.getCartesianCoordsAt(curve.clampEnd);

        } else {

            // use 0 and 1
            s = curve.getCartesianCoordsAt(0);
            e = curve.getCartesianCoordsAt(1);
            
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

    // for each chart type, the following must be defined
    let nx, ny, drawBlankChart, drawCurve

    switch(props.chartType) {

        case 'polar': {

            // expressed as a percentage of the chart size
            const chartPadding = .01;

            // Normalize x such that: nx(0) = width / 2 && nx(1) = width && nx(-1) = 0
            nx = (x) => {

                const width = canvasRef.current.width * (1 - 2 * chartPadding);
                const offset = canvasRef.current.width * chartPadding;

                return offset + width / 2 + x * width / 2;

            }

            // Normalize y such that: ny(0) = height / 2 && ny(1) = 0 && ny(-1) = height
            ny = (y) => {

                const height = canvasRef.current.height * (1 - 2 * chartPadding);
                const offset = canvasRef.current.height * chartPadding;

                return offset + height / 2 - y * height / 2;

            }

            drawBlankChart = () => {

                // get canvas and context
                const canvas = canvasRef.current;
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
                const r = nx(0) - chartPadding * nx(0) * 2;
        
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

            drawCurve = () => {

                // get canvas and context
                const canvas = canvasRef.current;
                const ctx = canvas.getContext('2d', {alpha: false});
                ctx.lineWidth = canvas.width / 120;
        
                const lineSegments = 128;
        
                let prevCoords;

                const start = props.palette.hsCurve.overflow === 'clamp' ? 
                    props.palette.hsCurve.clampStart : 0;

                const end = props.palette.hsCurve.overflow === 'clamp' ? 
                    props.palette.hsCurve.clampEnd : 1
        
                for(let i = 0; i <= lineSegments; i++) {
        
                    ctx.beginPath();
                    
                    const coords = props.palette.hsCurve.getCartesianCoordsAt(start + (i / lineSegments) * (end - start));
        
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

                drawEndPoints(props.palette.hsCurve, canvas);
        
                // if curve is redrawn, also update the palettes
                props.updatePalettes();
                        
            }

            break;

        }

        case 'cartesian': {

            // expressed as a percentage of the chart size
            const chartPadding = 0.02;

            // Normalize x such that: nx(0) = 0 && nx(1) = width
            nx = (x) => {

                const offset = canvasRef.current.width * chartPadding;
                const width = canvasRef.current.width * (1 - 2 * chartPadding);

                return offset + x * width;

            }

            // Normalize y such that: ny(0) = height && ny(1) = 0
            ny = (y) => {

                const offset = canvasRef.current.height * chartPadding;
                const height = canvasRef.current.height * (1 - 2 * chartPadding);

                return offset + height - y * height;

            }

            drawBlankChart = () => {

                const canvas = canvasRef.current;
                const ctx = canvas.getContext('2d', {alpha: false});

                // larger coordinate systems seem to result in sharper renders
                canvas.height = canvas.clientHeight * 4;
                canvas.width = canvas.clientWidth * 4;
        
                // fill background
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvas.height, canvas.width);
        
                // fill chart gradient
                const fillRectGradient = ctx.createLinearGradient(nx(0), ny(1), nx(0), ny(0));
                fillRectGradient.addColorStop(0, 'hsl(0, 0%, 100%');
                fillRectGradient.addColorStop(1, 'hsl(0, 0%, 0%');
                ctx.fillStyle = fillRectGradient;
                ctx.fillRect(nx(0), ny(1), nx(1) - chartPadding * nx(1), ny(0) - chartPadding * ny(0));
        
            }

            drawCurve = () => {

                // get canvas and context
                const canvas = canvasRef.current;
                const ctx = canvas.getContext('2d', {alpha: false});
                ctx.lineWidth = canvas.width / 120;
        
                const lineSegments = 128;
        
                let prevCoords;
        
                for(let i = 0; i <= lineSegments; i++) {
        
                    ctx.beginPath();
        
                    const coords = props.palette.lCurve.getCartesianCoordsAt(i / lineSegments);
                
                    ctx.strokeStyle = 'black';

                    if(props.palette.lCurve.overflow === 'project' || !coords.clamped) {
        
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
        
                drawEndPoints(props.palette.lCurve, canvas);

                // if curve is redrawn, also update the palettes
                props.updatePalettes();
                        
            }

            break;

        }

        default: 
            console.warn("Chart component must include a chartType prop with a value of 'polar' or 'cartesian'"); 
            break;

    }

    const updateCurve = () => { 
        if(
            (props.chartType === 'polar' && props.palette.hsCurve) ||
            (props.chartType === 'cartesian' && props.palette.lCurve)
        ) {
            drawBlankChart();
            drawCurve();
        }
    }

    useEffect(() => {updateCurve();});

    return (
    
        <div className = 'chart col-md-6'>

            <div className = 'chart-wrapper border'>

                <div className = 'row border-bottom'>

                    <div className = 'col-md-12'>

                        <h2>{props.title}</h2>

                    </div>

                </div>  

                <ChartControls 
                    chartType = { props.chartType }
                    config = { props.config }
                    palette = { props.palette }
                    updateCurve = { updateCurve }
                />
        
                <div className = 'row'>

                    <div className = 'col-md-12'>

                        <canvas
                            className = 'chart'
                            ref = {canvasRef}
                        />

                    </div>

                </div>

            </div>

        </div>
    
    );

}

export default Chart;