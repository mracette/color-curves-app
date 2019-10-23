// libs
import React, { useState, useEffect } from 'react';
import 'bootstrap';

// components
import ExportModal from './ExportModal';

// curves 
import ColorPalette from '../lib/js/ColorPalette';

function Presets() {

    const [showModal, setShowModal] = useState(false);
    const [paletteParams, setPaletteParams] = useState(null);

    const presets = [
        {
            name: 'Warm Magma',
            author: 'Color Curves',
            palette: new ColorPalette({type: "exponential", variation: "in", translation: {x: -0.66000, y: -0.58000}, scale: {x: 1.61000, y: 0.76000}, rotation: 0.84000}, {type: "sinusoidal", variation: "out", translation: {x: 0.00000, y: 0.37000}, scale: {x: 1.00000, y: 0.24000}, rotation: 0.00000}, { paletteStart: 0.05, paletteEnd: 1 })
        },
        {
            name: 'All Around',
            author: 'Color Curves',
            palette: new ColorPalette({type: "arc", radius: 0.50000, angleStart: 0.00000, angleEnd: 6.28319, angleOffset: 0.00000, translation: {x: 0.00000, y: 0.00000}, }, {type: "arc", radius: 0.25000, angleStart: 0.00000, angleEnd: 6.28319, angleOffset: 0.00000, translation: {x: 0.50000, y: 0.50000}, }, { paletteStart: 0, paletteEnd: 1 })
        },
        {
            name: 'Candy Paint',
            author: 'Color Curves',
            palette: new ColorPalette({type: "exponential", variation: "in", translation: {x: -0.92388, y: -0.45000}, scale: {x: 1.84776, y: 0.77000}, rotation: 0.00000}, {type: "linear", translation: {x: 0.00000, y: 0.25000}, scale: {x: 1.00000, y: 0.50000}, rotation: 4.54142}, { paletteStart: 0.02, paletteEnd: 1 })
        },
        {
            name: 'Goldfish Deluxe',
            author: 'Color Curves',
            palette: new ColorPalette({type: "exponential", variation: "in", translation: {x: -0.92388, y: -0.38268}, scale: {x: 1.84776, y: 0.76537}, rotation: 3.17142}, {type: "linear", translation: {x: 0.00000, y: 0.05000}, scale: {x: 1.00000, y: 0.44000}, rotation: 2.69000}, { paletteStart: 0, paletteEnd: 1 })
        },
        {
            name: 'Trix Sky',
            author: 'Color Curves',
            palette: new ColorPalette({type: "exponential", variation: "in", translation: {x: -1.31000, y: -0.38268}, scale: {x: 1.84776, y: 0.76537}, rotation: 5.81000}, {type: "linear", translation: {x: 0.00000, y: 0.34000}, scale: {x: 1.00000, y: 0.50000}, rotation: 0.00000}, { paletteStart: 0, paletteEnd: 1 })
        },
        {
            name: 'Coral Scrub',
            author: 'Color Curves',
            palette: new ColorPalette({type: "linear", translation: {x: -0.97000, y: 0.11000}, scale: {x: 1.80000, y: 0.52000}, rotation: 0.00000}, {type: "linear", translation: {x: 0.00000, y: 0.39000}, scale: {x: 0.93000, y: 0.27000}, rotation: 0.00000}, { paletteStart: 0, paletteEnd: 1 })
        },
        {
            name: 'Polar Beyond',
            author: 'Color Curves',
            palette: new ColorPalette({type: "bounce", variation: "in", translation: {x: -0.92388, y: -0.92000}, scale: {x: 1.84776, y: 0.45000}, rotation: 4.30000}, {type: "exponential", variation: "in-out", translation: {x: 0.00000, y: 0.43000}, scale: {x: 1.00000, y: 0.19000}, rotation: 0.00000}, { paletteStart: 0.53, paletteEnd: 0.87 })
        },
        {
            name: 'test4',
            author: 'Color Curves',
            palette: new ColorPalette({type: "exponential", variation: "in", translation: {x: -0.92388, y: -0.38268}, scale: {x: 1.84776, y: 1.84776}, rotation: 0.00000}, {type: "linear", translation: {x: 0.00000, y: 0.25000}, scale: {x: 1.00000, y: 1.00000}, rotation: 0.00000}, { paletteStart: 0, paletteEnd: 1 })
        },
        {
            name: 'test5',
            author: 'Color Curves',
            palette: new ColorPalette({type: "exponential", variation: "in", translation: {x: -0.92388, y: -0.38268}, scale: {x: 1.84776, y: 1.84776}, rotation: 0.00000}, {type: "linear", translation: {x: 0.00000, y: 0.25000}, scale: {x: 1.00000, y: 1.00000}, rotation: 0.00000}, { paletteStart: 0, paletteEnd: 1 })
        }
    ];

    useEffect(() => {
        presets.forEach((preset) => {
            const canvas = document.getElementById(preset.name);
            preset.palette.drawContinuousPalette(canvas, 128);
        });
    }, [presets]);

    return (
        presets.map((preset, i) => {
            return (<>
            <div
                onClick = {(e) => {
                    setPaletteParams(preset.palette.exportPaletteParams());
                    setShowModal(true);
                }}
                className = 'preset palette-wrapper border'>
                <h4>{preset.name}</h4>
                <canvas id = {preset.name} height={50} width = {500}></canvas>
            </div>
            {i === presets.length - 1 &&
            <ExportModal 
                show = {showModal}
                setShow = {setShowModal}
                paletteParams = {paletteParams}
            />}
            </>)
        })
    );

}

export default Presets;