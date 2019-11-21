// libs
import React, { useState, useEffect, useRef } from 'react';
import Modal from 'react-bootstrap/Modal';

// components
import ExportImage from '../components/ExportImage';
import ExportHex from '../components/ExportHex';
import ExportJS from '../components/ExportJS';

function ExportModal(props) {

    // component versions of numstops and palettetype
    // do not affect the editor/global values
    const [numStops, setNumStops] = useState(12);
    const [paletteType, setPaletteType] = useState('continuous');

    const [nav, setNav] = useState('image');

    const exportCanvas = useRef(null);

    const updatePalettes = (canvas, paletteType, stops) => {

        if (nav !== 'hex') {

            if (paletteType === 'continuous') {
                props.palette.drawContinuousPalette(canvas);
            } else if (paletteType === 'discrete') {
                props.palette.drawDiscretePalette(canvas, stops);
            }

        } else if (nav === 'hex') {

            props.palette.drawDiscretePalette(canvas, stops);

        }

    }

    useEffect(() => {
        if (exportCanvas.current) {

            const numStopsVar = props.numStops || numStops;
            const paletteTypeVar = props.paletteType || paletteType;
            updatePalettes(exportCanvas.current, paletteTypeVar, numStopsVar);

        }
    }, [exportCanvas.current, props.palette, props.numStops, numStops, props.paletteType, paletteType, nav, updatePalettes])

    useEffect(() => {

        if (exportCanvas.current) {

            exportCanvas.current.clientWidth !== 0 && (exportCanvas.current.width = exportCanvas.current.clientWidth);
            exportCanvas.current.clientHeight !== 0 && (exportCanvas.current.height = exportCanvas.current.clientHeight);

            const listen = window.addEventListener('resize', () => {
                exportCanvas.current.clientWidth !== 0 && (exportCanvas.current.width = exportCanvas.current.clientWidth);
                exportCanvas.current.clientHeight !== 0 && (exportCanvas.current.height = exportCanvas.current.width);
            });

            return () => {
                window.removeEventListener('resize', listen);
            }

        }

    }, [exportCanvas])

    return (
        <Modal
            size='lg'
            show={props.show}
            onHide={() => props.setShow(false)}
        >

            <Modal.Header closeButton>
                <Modal.Title id="example-modal-sizes-title-lg">Export Palette</Modal.Title>
            </Modal.Header>
            <Modal.Body>

                <div className='row'>
                    <div className='col-12'>
                        <canvas className='palette preset' ref={exportCanvas} />
                    </div>
                </div>

                <div className='row'>
                    <div className='col-12'>
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => {
                                props.setPalette(props.palette);
                                props.setNav('editor');
                                props.setShow(false);
                            }}
                        >
                            Open in editor
                        </button>
                    </div>
                </div>

                <nav className='mt-3'>
                    <div className="nav nav-tabs" id="nav-tab" role="tablist">
                        <a className={`nav-item nav-link ${nav === 'image' && 'active'}`} onClick={() => setNav('image')} id="export-nav-image" data-toggle="tab" role="tab" aria-controls="nav-home" aria-selected={`${nav === 'image'}`}>Image</a>
                        <a className={`nav-item nav-link ${nav === 'hex' && 'active'}`} onClick={() => setNav('hex')} id="export-nav-hex" data-toggle="tab" role="tab" aria-controls="nav-profile" aria-selected={`${nav === 'image'}`}>Hex</a>
                        <a className={`nav-item nav-link ${nav === 'js' && 'active'}`} onClick={() => setNav('js')} id="export-nav-js" data-toggle="tab" role="tab" aria-controls="nav-contact" aria-selected={`${nav === 'image'}`}>JS</a>
                    </div>
                </nav>

                <div className='row'>

                    <div className='col-lg-12'>

                        {nav === 'image' &&
                            <ExportImage
                                updatePalettes={() => updatePalettes(exportCanvas.current, props.paletteType, props.numStops)}
                                palette={props.palette}
                                paletteType={props.paletteType || paletteType}
                                setPaletteType={props.setPaletteType || setPaletteType}
                                numStops={props.numStops || numStops}
                                setNumStops={props.setNumStops || setNumStops}
                            />}

                        {nav === 'hex' &&
                            <ExportHex
                                palette={props.palette}
                                numStops={props.numStops || numStops}
                                setNumStops={props.setNumStops || setNumStops}
                            />}

                        {nav === 'js' &&
                            <ExportJS
                                palette={props.palette}
                            />}

                    </div></div>

            </Modal.Body>

        </Modal>
    )

}

export default ExportModal;