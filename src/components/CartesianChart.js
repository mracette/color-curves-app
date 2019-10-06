// libs
import React, { useEffect, useRef, useState } from 'react';

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

        // color wheel parameters
        // const tickCount = 16;
        // const tickColor = 'hsl(0, 0%, 30%)';

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

    }

    const drawCurve = () => {

        // get canvas and context
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', {alpha: false});

        const lineSegments = 128;

        let prevCoords;

        for(let i = 0; i <= lineSegments; i++) {

            ctx.beginPath();
            
            const coords = props.activeCurve.getCartesianCoordsAt(i / lineSegments);

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

        // if curve is redrawn, also redraw the palettes
        props.drawContinuousPalette();
        props.drawDiscretePalette();
                
    }

    const handleDrawCurve = () => {
        
        if(canvasRef.current && props.activeCurve) {
            drawBlankChart();
            drawCurve();
        }

    }

    useEffect(() => {
        if(canvasRef.current) drawBlankChart();
        if(props.activeCurve) drawCurve(); 
    });

    useEffect(() => {

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', {alpha: false});

        // larger coordinate systems seem to result in sharper renders
        canvas.height = canvas.clientHeight * 4;
        canvas.width = canvas.clientWidth * 4;

        // get key dimensions
        ctx.lineWidth = canvas.width / 100;

        // color wheel parameters
        // const tickCount = 16;
        // const tickColor = 'hsl(0, 0%, 30%)';

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

    }, [canvasRef]);

    return (

        <div className = 'chart cartesian-chart'>

        <canvas 
            className = 'chart'
            ref = {canvasRef}
        />

        <ChartControls 
            handleUpdateCurve = {props.handleUpdateCurve}
            handleDrawCurve = {handleDrawCurve}
            default = 'linear'
        />

        {props.controls}

        </div>
    
    );

}

export default CartesianChart