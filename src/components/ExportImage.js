// libs
import React, { useState, useEffect, useRef } from 'react';
import { downloadCanvas } from '../lib/utils/canvas'

// components
import SmartInput from './smart-input/SmartInput';

function ExportImage(props) {

    const [imgName, setImgName] = useState('');
    const [imgWidth, setImgWidth] = useState(500);
    const [imgHeight, setImgHeight] = useState(500);

    console.log(props.exportCanvas);

    useEffect(() => {
        setImgName('colorcurve');
    }, []);

    const exportImage = (canvas, imgName) => {

        // resize for export
        canvas.style.width = imgWidth + 'px';
        canvas.style.height = imgHeight + 'px';
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;

        props.updatePalettes();

        downloadCanvas(canvas, imgName, {
            width: imgWidth + 'px',
            height: imgHeight + 'px'
        }).then(() => {
            canvas.style.removeProperty('width');
            canvas.style.removeProperty('height');
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
                    defaultValue={props.paletteType}
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
                        defaultValue={props.numStops}
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
                    defaultValue={imgWidth}
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
                    defaultValue={imgHeight}
                    handleChange={(value) => setImgHeight(parseInt(value))}
                />
            </div>

        </div>

        <div className='row mt-3'>
            <div className='col-lg-5 d-flex'>
                <button
                    onClick={() => exportImage(props.exportCanvas.current, imgName)}
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