// libs
import React, { useEffect, useRef } from 'react';

// components
import ChartControls from './ChartControls';

function CartesianChart(props) {

    const canvasRef = useRef(null);

    /**
     * Normalize x such that:
     *  nx(0) = 0;
     *  nx(1) = width
     */
    const nx = (x) => {
        return x * canvasRef.current.width;
    }

    /**
     * Normalize y such that:
     *  ny(0) = height
     *  ny(1) = 0
     */
    const ny = (y) => {
        return canvasRef.current.height - y * canvasRef.current.height;
    }

    const drawBlankChart = () => {

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

    const drawCurve = () => {

        // get canvas and context
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', {alpha: false});

        const lineSegments = 128;

        let prevCoords;

        for(let i = 0; i <= lineSegments; i++) {

            ctx.beginPath();

            const coords = props.palette.lCurve.getCartesianCoordsAt(i / lineSegments);

            console.log(coords);

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
        if(props.palette.lCurve) {
            drawBlankChart();
            drawCurve();
        }
    }

    useEffect(() => {updateCurve();});

    return (

        <div className = 'chart col-sm-6'>

            <div className = 'chart-wrapper border'>

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
                    chartType = 'l'
                    config = { props.config }
                    palette = { props.palette }
                    updateCurve = { updateCurve }
                />

            </div>

        </div>
    
    );

}

export default CartesianChart