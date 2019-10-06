// libs
import React, { useState, useEffect, useRef } from 'react';
import { cartToPolar, radToDeg } from '../lib/utils/math';

// components
import PolarChart from './PolarChart';
import CartesianChart from './CartesianChart';

function Editor() {

  const [polarCurve, setPolarCurve] = useState(null);
  const [cartesianCurve, setCartesianCurve] = useState(null);

  const continuousPalette = useRef(null);
  const discretePalette = useRef(null);

  const drawContinuousPalette = () => {

    const canvas = continuousPalette.current;
    const ctx = canvas.getContext('2d');

    canvas.height = canvas.clientHeight * 4;
    canvas.width = canvas.clientWidth * 4;

    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    const numStops = 32;

    for(let i = 0; i < numStops; i++) {

        // get hue and saturation values from the polar chart curve
        const hsCartCoords = polarCurve.getCartesianCoordsAt(i / numStops);
        const hsPolarCoords = cartToPolar(hsCartCoords.x, hsCartCoords.y);
        const hue = radToDeg(hsPolarCoords.theta);
        const sat = hsPolarCoords.r * 100 + '%';

        // get lightness values from the cartesian chart curve
        const lCartCoords = cartesianCurve.getCartesianCoordsAt(i / numStops);
        const lightness = Math.max(0, Math.min(1, lCartCoords.y)) * 100 + '%';

        // add a gradient stop
        gradient.addColorStop(i / numStops, `hsl(${hue}, ${sat}, ${lightness})`);

    }

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

  }

  const drawDiscretePalette = () => {

    const canvas = discretePalette.current;
    const ctx = canvas.getContext('2d');

    canvas.height = canvas.clientHeight * 4;
    canvas.width = canvas.clientWidth * 4;

    const numStops = 12;

    for(let i = 0; i < numStops; i++) {

        // get hue and saturation values from the polar chart curve
        const hsCartCoords = polarCurve.getCartesianCoordsAt(i / numStops);
        const hsPolarCoords = cartToPolar(hsCartCoords.x, hsCartCoords.y);
        const hue = radToDeg(hsPolarCoords.theta);
        const sat = hsPolarCoords.r * 100 + '%';

        // get lightness values from the cartesian chart curve
        const lCartCoords = cartesianCurve.getCartesianCoordsAt(i / numStops);
        const lightness = Math.max(0, Math.min(1, lCartCoords.y)) * 100 + '%';

        ctx.fillStyle = `hsl(${hue}, ${sat}, ${lightness})`;
        ctx.fillRect(i * canvas.width / numStops, 0, canvas.width / numStops, canvas.height);
    }

  }

  return (

    <div id = 'editor'>

        <h2>Editor</h2>

            <div id = 'palettes'>

              <canvas
                  className = 'palette'
                  ref = { continuousPalette } 
              />
              <canvas
                  className = 'palette'
                  ref = { discretePalette } 
              />
            
            </div>

            <div id = 'charts'>

                <PolarChart 
                  activeCurve = {polarCurve}
                  handleUpdateCurve = {setPolarCurve}
                  drawContinuousPalette = {drawContinuousPalette}
                  drawDiscretePalette = {drawDiscretePalette}
                />
                <CartesianChart 
                  activeCurve = {cartesianCurve}
                  handleUpdateCurve = {setCartesianCurve}
                  drawContinuousPalette = {drawContinuousPalette}
                  drawDiscretePalette = {drawDiscretePalette}
                />

            </div>


    </div>
    
  );

}

export default Editor;