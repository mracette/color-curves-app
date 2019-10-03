// libs
import React, { useEffect, useRef } from 'react';
//import { cartToPolar, polarToCart, degToRad } from '../lib/utils/math';

function CartesianChart(props) {

    const canvasRef = useRef(null);

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

        {props.controls}

        </div>
    
    );

}

export default CartesianChart