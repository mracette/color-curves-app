// libs
import React, { useState, useRef } from 'react';

// components
import PolarChart from './PolarChart';
import CartesianChart from './CartesianChart';

// curves 
import ColorPalette from '../lib/js/ColorPalette';

function Editor() {

  // the config defines all options for curve types and their corresponding
  // display names and constructors
  const config = [
    {
      name: 'geometries',
      options: [
        {
          id: 'arc',
          display: 'Geometry: Arc'
        }
      ]
    },
    {
      name: 'functions',
      options: [
        {
          id: 'linear',
          display: 'Function: Linear'
        },
        {
          id: 'polynomial',
          display: 'Function: Polynomial'
        },
        {
          id: 'sinusoidal',
          display: 'Function: Sinusoidal'
        },
        {
          id: 'exponential',
          display: 'Function: Exponential'
        },
        {
          id: 'elastic',
          display: 'Function: Elastic'
        },
        {
          id: 'back',
          display: 'Function: EaseBack'
        },
        {
          id: 'bounce',
          display: 'Function: Bounce'
        }
      ]
    }
  ];

  // initialize palette
  const defaultPalette = new ColorPalette();

  // set default curve types
  defaultPalette.setHsCurve('linear');
  defaultPalette.setLCurve('linear');

  // initialize default color palette state
  const [palette, setPalette] = useState(defaultPalette);

  // initialize canvas refs
  const continuousPaletteCanvas = useRef(null);
  const discretePaletteCanvas = useRef(null);

  const drawContinuousPalette = () => {

    const canvas = continuousPaletteCanvas.current;
    const ctx = canvas.getContext('2d');

    canvas.height = canvas.clientHeight * 4;
    canvas.width = canvas.clientWidth * 4;

    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    const numStops = 32;

    for(let i = 0; i <= numStops; i++) {

        // get hsl values
        const hsl = palette.hslValueAt(i / numStops);

        // add a gradient stop
        gradient.addColorStop(i / numStops, hsl);

    }

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

  }

  const drawDiscretePalette = () => {

    const canvas = discretePaletteCanvas.current;
    const ctx = canvas.getContext('2d');

    canvas.height = canvas.clientHeight * 4;
    canvas.width = canvas.clientWidth * 4;

    const numStops = 12;

    for(let i = 0; i < numStops; i++) {

        // get hsl values
        const hsl = palette.hslValueAt(i / numStops);

        ctx.fillStyle = hsl;
        ctx.fillRect(i * canvas.width / numStops, 0, canvas.width / numStops, canvas.height);

    }

  }

  const updatePalettes = () => {
    drawContinuousPalette();
    drawDiscretePalette();
  }

  return (

    <>

        <div className = 'row' id = 'header'>

          <div className = 'col-sm-12'>
            <h1>Color Curves</h1>
          </div>

          <div className = 'col-sm-12'>
            <p className = 'lead'>
              Create unique color palettes by overlaying curves onto the HSL color space.
            </p>
          </div>

        </div>

        <div className = 'row' id = 'palettes'>

          <div className = 'col-sm-12'>
            <canvas
                className = 'palette'
                ref = { continuousPaletteCanvas } 
            />
          </div>

          <div className = 'col-sm-12'>
            <canvas
                className = 'palette'
                ref = { discretePaletteCanvas } 
            />
          </div>

        </div>

        <div className = 'row' id = 'charts'>

            <PolarChart 
              title = 'Hue + Saturation'
              config = { config }
              palette = { palette }
              updatePalettes = { updatePalettes }
            />

            <CartesianChart 
              title = 'Lightness'
              config = { config }
              palette = { palette }
              updatePalettes = { updatePalettes }
            />
            
        </div>

      </>
    
  );

}

export default Editor;