// libs
import React, { useState, useEffect, useRef } from 'react';
import Modal from 'react-bootstrap/Modal';

// components
import SmartInput from '../components/SmartInput';

function ExportModal(props) {

    const [nav, setNav] = useState('image');
    const [imgWidth, setImgWidth] = useState(500);
    const [imgHeight, setImgHeight] = useState(500);
    const paletteCanvas = useRef(document.getElementById('export-canvas'));

    const updatePalettes = () => {

        if(props.paletteType === 'continuous') {
            props.palette.drawContinuousPalette(paletteCanvas.current);
        } else if(props.paletteType === 'discrete') {
            props.palette.drawDiscretePalette(paletteCanvas.current, props.numStops);
        }
    
    }

    useEffect(() => {
        paletteCanvas.current && (nav === 'image') && updatePalettes();
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

            <h2>Export Image</h2>

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
                <div className = 'col-lg-12'>
                    <canvas classNames = 'center-block' id = 'export-canvas' ref = {paletteCanvas}/>
                </div>
            </div>

            </div>}

            {nav === 'hex' && <div>
                <p>
                    <code>
                    {"import ColorPalette from 'colorcurves'"} <br/><br/>
                    {"const palette = new ColorPalette(" + props.paletteParams + ");"} <br/><br/>
                    {"// palette.hslValueAt(n);"}<br/> 
                    {"// palette.hexValueAt(n);"}<br/> 
                    {"// palette.rgbValueAt(n);"}<br/> 
                    </code>
                </p>
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