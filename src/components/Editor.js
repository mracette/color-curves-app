// libs
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ColorPalette } from 'color-curves';

// components
import Canvas from './Canvas';
import Chart from './Chart';
import SmartInput from './smart-input/SmartInput';
import ExportModal from './ExportModal';

function Editor(props) {

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
  const [numStops, setNumStops] = useState(6);
  const [paletteRange, setPaletteRange] = useState([0, 1]);
  const [showModal, setShowModal] = useState(false);

  // use default color palette and curve
  const [hsCurve, setHsCurve] = useState(props.palette.hsCurve);
  const [lCurve, setLCurve] = useState(props.palette.lCurve);
  const [paletteCanvas, setPaletteCanvas] = useState(null);

  // initialize refs
  const paletteWrapper = useRef(null);

  const updateCurveType = ((curve, newType) => {

    let defaults = false;

    if (curve === 'hsCurve') {

      if (newType === 'arc' || hsCurve.type === 'arc') {
        defaults = true
      }

      props.palette.setHsCurve(newType, defaults);

      setHsCurve(props.palette.hsCurve);

    } else if (curve === 'lCurve') {

      if (newType === 'arc' || lCurve.type === 'arc') {
        defaults = true
      }

      props.palette.setLCurve(newType, defaults);

      setLCurve(props.palette.lCurve);

    }

  })

  const updatePalettes = useCallback(() => {

    if (paletteType === 'continuous' && paletteCanvas !== null) {

      props.palette.drawContinuousPalette(paletteCanvas);

    } else if (paletteType === 'discrete' && paletteCanvas !== null) {

      props.palette.drawDiscretePalette(paletteCanvas, numStops);

    }

  }, [paletteType, paletteCanvas, props.palette, numStops])

  useEffect(() => {
    updatePalettes(paletteType);
  }, [paletteType, updatePalettes])

  useEffect(() => {
    setPaletteRange([props.palette.start, props.palette.end])
    setHsCurve(props.palette.hsCurve);
    setLCurve(props.palette.lCurve);
  }, [props.palette])

  return (

    <>

      <div ref={paletteWrapper} className='material-static palette-wrapper sticky-top'>

        <div className='row border-bottom'>
          <div className='col-auto align-items-center d-flex align-items-center'>
            <h2>Palette</h2>
            <button type="button"
              class="btn mb-8 btn-light btn-sm"
              style={{
                "margin-bottom": "8px",
                "margin-left": "8px"
              }}
              onClick={() => {
                setShowModal(!showModal);
              }}
              type="button"
            >
              Export
          </button>
          </div>
          <div className='col-auto ml-auto d-flex'>
            <form className='m-auto'>
              <div className="custom-control custom-switch">
                <input
                  type="checkbox"
                  id='pinned-switch'
                  className="custom-control-input"
                  defaultChecked={true}
                  onChange={(e) => {
                    const sticky = e.target.checked;
                    if (sticky) {
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
          <div className='row'>

            {/* PALETTE TYPE */}
            <label className='col-lg-1 col-2 col-form-label-sm' htmlFor='type-select'>Type</label>
            <div className='col-lg-2 col-5'>
              <select
                id='type-select'
                className='form-control form-control-sm'
                defaultValue={paletteType}
                onChange={(e) => {
                  const newPaletteType = e.target.value;
                  setPaletteType(newPaletteType);
                }}>
                <option value='continuous'>Continuous</option>
                <option value='discrete'>Discrete</option>
              </select>
            </div>

            {/* NUM STOPS */}
            {paletteType === 'discrete' &&
              <div className='col-lg-2 col-5'>
                <SmartInput
                  labelWidth={.33}
                  label='Num'
                  step={1}
                  min={1}
                  max={256}
                  maxDecimals={0}
                  value={numStops}
                  handleChange={(value) => setNumStops(parseInt(value))}
                />
              </div>
            }

          </div>

          {/* PALETTE OPTIONS LINE 2 */}
          <div className='row'>

            {/* PALETTE TYPE */}
            <label className='col-lg-1 col-2 col-form-label-sm' htmlFor='type-select'>Range</label>

            <div className='col-lg-2 col-5'>
              <SmartInput
                labelWidth={.33}
                label='Start'
                step={.01}
                min={0}
                max={paletteRange[1]}
                maxDecimals={2}
                value={paletteRange[0]}
                handleChange={(value) => {
                  props.palette.setStart(parseFloat(value));
                  setPaletteRange([parseFloat(value), paletteRange[1]]);
                }}
              />
            </div>

            <div className='col-lg-2 col-5'>
              <SmartInput
                labelWidth={.33}
                label='End'
                step={.01}
                min={paletteRange[0]}
                max={1}
                maxDecimals={2}
                value={paletteRange[1]}
                handleChange={(value) => {
                  props.palette.setEnd(parseFloat(value));
                  setPaletteRange([paletteRange[0], parseFloat(value)]);
                }}
              />
            </div>

          </div>

        </form>

        <div className='row'>
          <div className='col-12'>
            <Canvas
              onLoad={(canvasRef) => setPaletteCanvas(canvasRef)}
              onResize={updatePalettes}
              className='palette editor-palette'
            />
          </div>
        </div>

        <ExportModal
          show={showModal}
          setShow={setShowModal}
          palette={props.palette}
          numStops={numStops}
          setNumStops={setNumStops}
          paletteType={paletteType}
          setPaletteType={setPaletteType}
        />

      </div>

      <div className='row' id='charts'>

        <Chart
          title='Hue + Saturation'
          setCurve={(type) => updateCurveType('hsCurve', type)}
          curve={hsCurve}
          config={config}
          updatePalettes={updatePalettes}
        />

        <Chart
          title='Lightness'
          setCurve={(type) => updateCurveType('lCurve', type)}
          curve={lCurve}
          config={config}
          updatePalettes={updatePalettes}
        />

      </div>

    </>

  );

}

export default Editor;