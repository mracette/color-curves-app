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
        id: 'arc',
        category: 'geometry',
        display: 'Geometry: Arc'
      },
      {
        id: 'linear',
        category: 'function',
        display: 'Function: Linear'
      },
      {
        id: 'polynomial',
        category: 'function',
        display: 'Function: Polynomial'
      },
      {
        id: 'sinusoidal',
        category: 'function',
        display: 'Function: Sinusoidal'
      },
      {
        id: 'exponential',
        category: 'function',
        display: 'Function: Exponential'
      },
      {
        id: 'elastic',
        category: 'function',
        display: 'Function: Elastic'
      },
      {
        id: 'back',
        category: 'function',
        display: 'Function: EaseBack'
      },
      {
        id: 'bounce',
        category: 'function',
        display: 'Function: Bounce'
      }
  ];

  const [flagPalettePinned, setFlagPalettePinned] = useState(true);

  // initialize palette
  const defaultPalette = new ColorPalette();

  // set default curve types
  defaultPalette.setHsCurve('linear');
  defaultPalette.setLCurve('linear');

  // initialize default color palette state
  const [palette, setPalette] = useState(defaultPalette);

  // initialize refs
  const continuousPaletteCanvas = useRef(null);
  const discretePaletteCanvas = useRef(null);
  const paletteWrapper = useRef(null);

  // set a listener to handle scrolling and pinning behavior
  // When the user scrolls the page, execute myFunction  
  // const handleSticky = () => {

  //     const pos = paletteWrapper.current.offsetTop;

  //     console.log(pos, window.pageYOffset);

  //     if (window.pageYOffset > pos && (!paletteWrapper.current.classList.contains('sticky-top'))) {

  //       paletteWrapper.current.classList.add('sticky-top');

  //     } else if (window.pageYOffset <= pos) {

  //       paletteWrapper.current.classList.remove('sticky-top');

  //     }

  // };

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

        <div ref = {paletteWrapper} className = 'palette-wrapper sticky-top border'>

          {/* <div className = 'row'>
          </div> */}

          <div className = 'row'>
            <div className = 'col-auto align-items-center'>
              <h2>Palette</h2>
            </div>
            <div className = 'col-auto ml-auto d-flex align-items-center'>
              <form>
              <div class="custom-control custom-switch">
                <input 
                  type="checkbox" 
                  id='pinned-switch'
                  class="custom-control-input" 
                  defaultChecked = {flagPalettePinned} 
                  onClick = {(e) => console.log(e)}
                  onChange = {(e) => {
                    const sticky = e.target.checked;
                    if(sticky) {
                      paletteWrapper.current.classList.add('sticky-top');
                    } else {
                      paletteWrapper.current.classList.remove('sticky-top');
                    }
                  }}
                />
                <label class="custom-control-label" for="pinned-switch">Pinned</label>
              </div>
              </form>
            </div>
          </div>

          <div className = 'row'>
            <div className = 'col-md-12'>
              <canvas
                  className = 'palette'
                  ref = { continuousPaletteCanvas } 
              />
            </div>
          </div>

          <div className = 'row'>

            <div className = 'col-md-12'>
              <canvas
                  className = 'palette'
                  ref = { discretePaletteCanvas } 
              />
            </div>

          </div>

        </div>

        <div className = 'row' id = 'charts'>

            <PolarChart 
              title = 'Hue + Saturation'
              chartType = 'polar'
              config = { config }
              palette = { palette }
              updatePalettes = { updatePalettes }
            />

            <PolarChart 
              title = 'Lightness'
              chartType = 'cartesian'
              config = { config }
              palette = { palette }
              updatePalettes = { updatePalettes }
            />
            
        </div>

      </>
    
  );

}

export default Editor;