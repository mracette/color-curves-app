// libs
import React, { useState, useEffect, useRef } from 'react';
import { cartToPolar, radToDeg } from '../lib/utils/math';

// components
import PolarChart from './PolarChart';
import CartesianChart from './CartesianChart';

function Editor() {

  const [polarCurve, setPolarCurve] = useState(null);
  const [cartesianCurve, setCartesianCurve] = useState(null);

  const canvasRef = useRef(null);

  const drawContinuousScheme = () => {

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.height = canvas.clientHeight * 4;
    canvas.width = canvas.clientWidth * 4;

    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    const numStops = 32;

    for(let i = 0; i < numStops; i++) {
        const cartCoords = polarCurve.getCartesianCoordsAt(i / numStops);
        const polarCoords = cartToPolar(cartCoords.x, cartCoords.y);
        const hue = radToDeg(polarCoords.theta);
        const sat = polarCoords.r * 100 + '%';
        gradient.addColorStop(i / numStops, `hsl(${hue}, ${sat}, 50%)`);
    }

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

  }

  return (

    <div id = 'editor'>

        <h2>Editor</h2>

            <canvas
                className = 'canvas-scheme'
                ref = { canvasRef } 
            />

            <div id = 'charts'>

                <PolarChart 
                  activeCurve = {polarCurve}
                  handleUpdateCurve = {setPolarCurve}
                  drawContinuousScheme = {drawContinuousScheme}
                />
                <CartesianChart />

            </div>

    </div>
    
  );

}

export default Editor;