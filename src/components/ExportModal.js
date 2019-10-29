// libs
import React, { useState, useEffect, useRef } from 'react';
import Modal from 'react-bootstrap/Modal';
import { downloadCanvas } from '../lib/utils/canvas';

// components
import SmartInput from '../components/SmartInput';

function ExportModal(props) {

    const [nav, setNav] = useState('image');
    const [imgName, setImgName] = useState('colorcurve');
    const [imgWidth, setImgWidth] = useState(500);
    const [imgHeight, setImgHeight] = useState(500);
    const paletteCanvas = useRef(document.getElementById('export-canvas'));
    const hexCanvas = useRef(document.getElementById('hex-canvas'));

    const exportImg = () => {

        const canvas = paletteCanvas.current;

        // resize for export
        canvas.style.width = imgWidth + 'px';
        canvas.style.height = imgHeight + 'px';
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;

        updatePalettes();

        downloadCanvas(paletteCanvas.current, imgName, {
            width: imgWidth + 'px',
            height: imgHeight + 'px'
        }).then(() => {
            canvas.style.removeProperty('width');
            canvas.style.removeProperty('height');
        });

    }

    const updatePalettes = () => {

        if(nav === 'image') {

            if(props.paletteType === 'continuous') {
                props.palette.drawContinuousPalette(paletteCanvas.current);
            } else if(props.paletteType === 'discrete') {
                props.palette.drawDiscretePalette(paletteCanvas.current, props.numStops);
            }

        } else if (nav === 'hex') {

            props.palette.drawDiscretePalette(hexCanvas.current, props.numStops);

        }
    
    }

    useEffect(() => {
        (paletteCanvas.current || hexCanvas.current) && (nav === 'image' || nav === 'hex') && updatePalettes();
    })

    return (
        <Modal
            size = 'lg'
            show = {props.show}
            onHide = {() => props.setShow(false)}
        >

            <Modal.Header closeButton>
                <Modal.Title id="example-modal-sizes-title-lg">Export Palette</Modal.Title>
            </Modal.Header>
            <Modal.Body>

            <nav>
                <div className="nav nav-tabs" id="nav-tab" role="tablist">
                    <a className={`nav-item nav-link ${nav === 'image' && 'active'}`} onClick = {() => setNav('image')} id="export-nav-image" data-toggle="tab" role="tab" aria-controls="nav-home" aria-selected={`${nav === 'image'}`}>Image</a>
                    <a className={`nav-item nav-link ${nav === 'hex' && 'active'}`} onClick = {() => setNav('hex')} id="export-nav-hex" data-toggle="tab" role="tab" aria-controls="nav-profile" aria-selected={`${nav === 'image'}`}>Hex</a>
                    <a className={`nav-item nav-link ${nav === 'js' && 'active'}`} onClick = {() => setNav('js')} id="export-nav-js" data-toggle="tab" role="tab" aria-controls="nav-contact" aria-selected={`${nav === 'image'}`}>JS</a>
                </div>
            </nav>

            {nav === 'image' && <div>

            <div className = 'form-group'>

                <div className = 'row'>

                {/* PALETTE TYPE */}
                <label className = 'col-lg-1 col-form-label-sm' htmlFor = 'type-select'>Name</label>
                    <div className = 'col-lg-4'>
                        <input
                            id = 'export-image-name'
                            className = 'form-control form-control-sm'
                            placeholder = 'colorcurve.png'
                            onChange = {(e) => {
                                const value = e.target.value;
                                setImgName(value);
                        }}/>
                    </div>
                </div>

                <div className = 'row'>

                    {/* PALETTE TYPE */}
                    <label className = 'col-lg-1 col-form-label-sm' htmlFor = 'type-select'>Type</label>
                    <div className = 'col-lg-2'>
                        <select
                            id = 'type-select'
                            className = 'form-control form-control-sm'
                            defaultValue = {props.paletteType}
                            onChange = {(e) => {
                                const newPaletteType = e.target.value;
                                props.setPaletteType(newPaletteType);
                        }}>
                        <option value = 'continuous'>Continuous</option>
                        <option value = 'discrete'>Discrete</option>
                        </select>
                    </div>

                    {/* NUM STOPS */}
                    {props.paletteType === 'discrete' &&
                    <div className = 'col-lg-2'>
                    <SmartInput
                        labelWidth = {.33}
                        label = 'Num'
                        step = {1}
                        min = {1}
                        max = {32}
                        maxDecimals = {0}
                        defaultValue = {props.numStops}
                        handleChange = {(value) => props.setNumStops(parseInt(value))}
                    />
                    </div>
                    }
                
                </div>

                <div className = 'row'>

                    <label className = 'col-lg-1 col-form-label-sm' htmlFor = 'type-select'>Size</label>

                    {/* EXPORT WIDTH */}
                    <div className = 'col-lg-2'>
                    <SmartInput
                        labelWidth = {.33}
                        label = 'W'
                        step = {1}
                        min = {1}
                        max = {1080}
                        maxDecimals = {0}
                        unitSymbol = {'px'}
                        defaultValue = {imgWidth}
                        handleChange = {(value) => setImgWidth(parseInt(value))}
                    />
                    </div>

                    {/* EXPORT HEIGHT */}
                    <div className = 'col-lg-2'>
                    <SmartInput
                        labelWidth = {.33}
                        label = 'H'
                        step = {1}
                        min = {1}
                        max = {1080}
                        maxDecimals = {0}
                        unitSymbol = {'px'}
                        defaultValue = {imgHeight}
                        handleChange = {(value) => setImgHeight(parseInt(value))}
                    />
                    </div>
                
                </div>

                <div className = 'row'>
                <div className = 'col-lg-5 d-flex justify-content-center'>
                <button 
                    onClick = {exportImg}
                    type="button" 
                    className="btn btn-primary flex-grow-1"
                >
                    Download Image
                </button>
                </div>
            </div>

            </div>

            <div className = 'row'>
                <div className = 'col-lg-12'>
                    <canvas classNames = 'center-block' id = 'export-canvas' ref = {paletteCanvas}/>
                </div>
            </div>

            </div>}

            {nav === 'hex' && <div>
                <div className = 'form-group'>
                    <div className = 'row'>
                        <div className = 'col-lg-2'>
                        <SmartInput
                            labelWidth = {.33}
                            label = 'Num'
                            step = {1}
                            min = {1}
                            max = {32}
                            maxDecimals = {0}
                            defaultValue = {props.numStops}
                            handleChange = {(value) => props.setNumStops(parseInt(value))}
                        />
                        </div>
                    </div>
                </div>
                <div className = 'row'>
                    <div className = 'col-lg-12'>
                        <canvas classNames = 'center-block' id = 'hex-canvas' ref = {hexCanvas}/>
                    </div>
                </div>
                <div className = 'row'>
                    <p>List of Hex Values:</p>
                    <code>
                        {   
                            new Array(props.numStops).fill(null).map((d,i) => {
                                return props.palette.hexValueAt( (i + 0.5) / props.numStops );
                            }).join(', ')
                        }
                    </code>
                </div>
            </div>}

            {nav === 'js' && <div>
                <p>
                    <code>
                    {"import ColorPalette from 'colorcurves'"} <br/><br/>
                    {"const palette = new ColorPalette(" + props.palette.exportPaletteParams() + ");"} <br/><br/>
                    {"// palette.hslValueAt(n);"}<br/> 
                    {"// palette.hexValueAt(n);"}<br/> 
                    {"// palette.rgbValueAt(n);"}<br/> 
                    </code>
                </p>
            </div>}

            </Modal.Body>
    
        </Modal>
    )

}

export default ExportModal;