// libs
import React, { useState, useEffect } from 'react';
import { downloadCanvas } from '../utils/canvas'

// components
import SmartInput from './smart-input/SmartInput';

function ExportImage(props) {

    const [imgName, setImgName] = useState('');
    const [imgWidth, setImgWidth] = useState(500);
    const [imgHeight, setImgHeight] = useState(500);

    useEffect(() => {
        setImgName('colorcurve');
    }, []);

    const exportImage = (name, w, h) => {

        const canvas = document.createElement('canvas');
        canvas.id = 'export-canvas';
        document.body.appendChild(canvas);
        canvas.width = w;
        canvas.height = h;
        canvas.style.width = w;
        canvas.style.height = h;

        if (props.paletteType === 'continuous') {
            props.palette.drawContinuousPalette(canvas, 128);
        } else if (props.paletteType === 'discrete') {
            props.palette.drawDiscretePalette(canvas, props.numStops);
        }

        downloadCanvas(canvas, name).then(() => {
            console.log('downloading', canvas);
            document.body.removeChild(document.getElementById('export-canvas'));
        });

    }
    return (<>

        <div className='row mt-3'>
            <label className='col-lg-1 col-form-label-sm' htmlFor='type-select'>Name</label>
            <div className='col-lg-4'>
                <input
                    id='export-image-name'
                    className='form-control form-control-sm'
                    placeholder='colorcurve.png'
                    onChange={(e) => {
                        const value = e.target.value;
                        setImgName(value);
                    }} />
            </div>
        </div>

        <div className='row'>
            <label className='col-lg-1 col-form-label-sm' htmlFor='type-select'>Type</label>
            <div className='col-lg-2'>
                <select
                    id='type-select'
                    className='form-control form-control-sm'
                    value={props.paletteType}
                    onChange={(e) => {
                        const newPaletteType = e.target.value;
                        props.setPaletteType(newPaletteType);
                    }}>
                    <option value='continuous'>Continuous</option>
                    <option value='discrete'>Discrete</option>
                </select>
            </div>
            {props.paletteType === 'discrete' &&
                <div className='col-lg-2'>
                    <SmartInput
                        labelWidth={.33}
                        label='Num'
                        step={1}
                        min={1}
                        max={32}
                        maxDecimals={0}
                        value={props.numStops}
                        handleChange={(value) => props.setNumStops(parseInt(value))}
                    />
                </div>}
        </div>


        <div className='row'>

            <label className='col-lg-1 col-form-label-sm' htmlFor='type-select'>Size</label>
            <div className='col-lg-2'>
                <SmartInput
                    labelWidth={.33}
                    label='W'
                    step={1}
                    min={1}
                    max={1080}
                    maxDecimals={0}
                    unitSymbol={'px'}
                    value={imgWidth}
                    handleChange={(value) => setImgWidth(parseInt(value))}
                />
            </div>

            <div className='col-lg-2'>
                <SmartInput
                    labelWidth={.33}
                    label='H'
                    step={1}
                    min={1}
                    max={1080}
                    maxDecimals={0}
                    unitSymbol={'px'}
                    value={imgHeight}
                    handleChange={(value) => setImgHeight(parseInt(value))}
                />
            </div>

        </div>

        <div className='row mt-3'>
            <div className='col-lg-5 d-flex'>
                <button
                    onClick={() => exportImage(imgName, imgWidth, imgHeight)}
                    type="button"
                    className="btn btn-primary flex-grow-1"
                >
                    Download Image
            </button>
            </div>
        </div>

    </>)

}

export default ExportImage;