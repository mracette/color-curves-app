// libs
import React, { useState, useRef, useEffect } from 'react';
import { cartToPolar, radToDeg } from '../lib/utils/math';

function ContinuousPalette(props) {

    const canvasRef = useRef(null);

    useEffect(() => {

        if(props.polarCurve) {

            props.setDrawContinuous(() => {
        
                const canvas = canvasRef.current;
                const ctx = canvas.getContext('2d');
            
                canvas.height = canvas.clientHeight * 4;
                canvas.width = canvas.clientWidth * 4;
            
                const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
                const numStops = 32;
            
                for(let i = 0; i < numStops; i++) {
                    const cartCoords = props.polarCurve.getCartesianCoordsAt(i / numStops);
                    const polarCoords = cartToPolar(cartCoords.x, cartCoords.y);
                    const hue = radToDeg(polarCoords.theta);
                    const sat = polarCoords.r * 100 + '%';
                    gradient.addColorStop(i / numStops, `hsl(${hue}, ${sat}, 50%)`);
                }
            
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            });

        }

    }, [props.polarCurve])

    return (
        <div>

            <canvas
                className = 'canvas-scheme'
                ref = { canvasRef } 
            />

        </div>
    );

}

export default ContinuousPalette;