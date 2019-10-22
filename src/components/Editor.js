// libs
import React, { useState, useRef } from 'react';

// components
import Chart from './Chart';
import SmartInput from './SmartInput';
import ExportModal from './ExportModal';

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

  const [paletteType, setPaletteType] = useState('continuous');
  const [numStops, setNumStops] = useState(12);
  const [paletteRange, setPaletteRange] = useState([0,1]);
  const [showModal, setShowModal] = useState(false);
  const [paletteParams, setPaletteParams] = useState(null);

  // initialize palette
// const defaultPalette = new ColorPalette({type: "linear",variation: "in", translation: {x: -0.9238795325112868, y: -0.38268343236508967}, scale: {x: 1.8477590650225737, y: 1.8477590650225737}, rotation: 0}, {type: "linear", translation: {x: 0, y: 0.25}, scale: {x: 1, y: 1}, rotation: 0}, {
//     paletteStart: 0,
//     paletteEnd: 1
// });

const defaultPalette = new ColorPalette();

  defaultPalette.hsCurve.setClampBounds();
  defaultPalette.lCurve.setClampBounds();

  // initialize default color palette state
  const [palette] = useState(defaultPalette);

  // initialize refs
  const paletteCanvas = useRef(null);
  const paletteWrapper = useRef(null);

  const updatePalettes = () => {

    if(paletteType === 'continuous') {
      palette.drawContinuousPalette(paletteCanvas.current);
    } else if(paletteType === 'discrete') {
      palette.drawDiscretePalette(paletteCanvas.current, numStops);
    }

  }

  return (

    <>

        <div ref = {paletteWrapper} className = 'palette-wrapper sticky-top border'>

          <div className = 'row border-bottom'>
            <div className = 'col-auto align-items-center'>
              <h2>Palette</h2>
            </div>
            <div className = 'col-auto ml-auto d-flex align-items-center'>
              <form>
              <div className="custom-control custom-switch">
                <input 
                  type="checkbox" 
                  id='pinned-switch'
                  className="custom-control-input" 
                  defaultChecked = {true} 
                  onChange = {(e) => {
                    const sticky = e.target.checked;
                    if(sticky) {
                      paletteWrapper.current.classList.add('sticky-top');
                    } else {
                      paletteWrapper.current.classList.remove('sticky-top');
                    }
                  }}
                />
                <label className="custom-control-label" htmlFor="pinned-switch">Pinned</label>
              </div>
              </form>
            </div>
          </div>

          <form>

          {/* PALETTE OPTIONS LINE 1 */}
          <div className = 'row'>

              {/* PALETTE TYPE */}
              <label className = 'col-lg-1 col-form-label-sm' htmlFor = 'type-select'>Type</label>
              <div className = 'col-lg-2'>
                  <select
                      id = 'type-select'
                      className = 'form-control form-control-sm'
                      defaultValue = {paletteType}
                      onChange = {(e) => {
                          const newPaletteType = e.target.value;
                          setPaletteType(newPaletteType);
                  }}>
                    <option value = 'continuous'>Continuous</option>
                    <option value = 'discrete'>Discrete</option>
                  </select>
              </div>

              {/* NUM STOPS */}
              {paletteType === 'discrete' &&
              <div className = 'col-lg-2'>
                <SmartInput
                  labelWidth = {.33}
                  label = 'Num'
                  step = {1}
                  min = {1}
                  max = {32}
                  fixedDecimals = {0}
                  defaultValue = {numStops}
                  handleChange = {(value) => setNumStops(parseInt(value))}
                />
              </div>
              }

          </div>

          {/* PALETTE OPTIONS LINE 2 */}
          <div className = 'row'>

              {/* PALETTE TYPE */}
              <label className = 'col-lg-1 col-form-label-sm' htmlFor = 'type-select'>Range</label>

              <div className = 'col-lg-2'>
                <SmartInput
                  labelWidth = {.33}
                  label = 'Start'
                  step = {.01}
                  min = {0}
                  max = {paletteRange[1]}
                  fixedDecimals = {2}
                  defaultValue = {paletteRange[0]}
                  handleChange = {(value) => {
                    palette.setPaletteStart(parseFloat(value));
                    setPaletteRange([parseFloat(value), paletteRange[1]]);
                  }}
                />
              </div>

              <div className = 'col-lg-2'>
                <SmartInput
                  labelWidth = {.33}
                  label = 'End'
                  step = {.01}
                  min = {paletteRange[0]}
                  max = {1}
                  fixedDecimals = {2}
                  defaultValue = {paletteRange[1]}
                  handleChange = {(value) => {
                    palette.setPaletteEnd(parseFloat(value));
                    setPaletteRange([paletteRange[0], parseFloat(value)]);
                  }}
                />
              </div>

          </div>

          </form>
          
          <div className = 'row'>
            <div className = 'col-md-12'>
              <canvas
                  className = 'palette'
                  ref = { paletteCanvas } 
              />
            </div>
          </div>

          <button 
            onClick = {() => {
              setPaletteParams(palette.exportPaletteParams());
              setShowModal(!showModal);
            }}
            type="button" 
            className="btn btn-primary"
          >
              Export Palette
          </button>

          <ExportModal 
            show = {showModal}
            setShow = {setShowModal}
            paletteParams = {paletteParams}
          />

        </div>

        <div className = 'row' id = 'charts'>

            <Chart 
              title = 'Hue + Saturation'
              chartType = 'polar'
              config = { config }
              palette = { palette }
              updatePalettes = { updatePalettes }
            />

            <Chart 
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