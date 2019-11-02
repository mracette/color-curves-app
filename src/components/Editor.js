// libs
import React, { useState, useRef } from 'react';

// components
import Chart from './Chart';
import SmartInput from './SmartInput';
import ExportModal from './ExportModal';

// curves 
import ColorPalette from '../lib/js/ColorPalette';

function Editor() {

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

  // use default color palette and curve
  const [palette] = useState(new ColorPalette());
  const [hsCurve, setHsCurve] = useState(palette.hsCurve);
  const [lCurve, setLCurve] = useState(palette.lCurve);

  // initialize refs
  const paletteCanvas = useRef(null);
  const paletteWrapper = useRef(null);

  const updateCurveType = (curve, newType) => {

    if(curve === 'hsCurve') {

      palette.setHsCurve(newType);

      setHsCurve(palette.hsCurve);

    } else if(curve === 'lCurve') {

      palette.setLCurve(newType);

      setLCurve(palette.lCurve);

    }

  }

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
                  maxDecimals = {0}
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
                  maxDecimals = {2}
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
                  maxDecimals = {2}
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
            palette = {palette}
            numStops = {numStops}
            setNumStops = {setNumStops}
            paletteType = {paletteType}
            setPaletteType = {setPaletteType}
          />

        </div>

        <div className = 'row' id = 'charts'>

            <Chart 
              title = 'Hue + Saturation'
              setCurve = { (type) => updateCurveType('hsCurve', type) }
              curve = { palette.hsCurve }
              config = { config }
              updatePalettes = { updatePalettes }
            />

            <Chart 
              title = 'Lightness'
              setCurve = { (type) => updateCurveType('lCurve', type) } 
              curve = { palette.lCurve }
              config = { config }
              updatePalettes = { updatePalettes }
            />
            
        </div>

      </>
    
  );

}

export default Editor;