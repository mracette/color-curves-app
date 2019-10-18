// libs
import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';

function ExportModal(props) {

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
            <h3>JS Import</h3>
                <p>
                    <code>
                    {"import ColorPalette from 'colorcurves'"} <br/><br/>
                    {"const palette = new ColorPalette(" + props.paletteParams + ");"} <br/><br/>
                    {"// palette.hslValueAt(n);"}<br/> 
                    {"// palette.hexValueAt(n);"}<br/> 
                    {"// palette.rgbValueAt(n);"}<br/> 
                    </code>
                </p>
            </Modal.Body>
    
        </Modal>
    )

}

export default ExportModal;