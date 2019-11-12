// libs
import React, { useState, useEffect } from 'react';
import 'bootstrap';

// components
import ExportModal from './ExportModal';

// palettes
import {
    warmMagma,
    allAround,
    unAmerican,
    candyPaint,
    goldfishDeluxe,
    trixSky,
    coralScrub,
    polarBeyond
} from '../lib/palettes/palettes';

function Presets() {

    const [showModal, setShowModal] = useState(false);
    const [selectedPalette, setSelectedPalette] = useState(null);

    const presets = [
        warmMagma(),
        allAround(),
        unAmerican(),
        candyPaint(),
        goldfishDeluxe(),
        trixSky(),
        coralScrub(),
        polarBeyond()
    ];

    useEffect(() => {
        presets.forEach((preset) => {
            preset.drawContinuousPalette(document.getElementById(preset.name + '-continuous'), 128);
            preset.drawDiscretePalette(document.getElementById(preset.name + '-discrete'), 12);
        });
    }, [presets]);

    return (<>
        {presets.map((preset, i) => {
            return (
                <div
                    onClick={(e) => {
                        setSelectedPalette(preset);
                        setShowModal(true);
                    }}
                    className='preset palette-wrapper border'>
                    <h4>{preset.name}</h4>
                    <h6>by {preset.author}</h6>
                    <canvas className='preset-canvas' id={`${preset.name}-continuous`} />
                    <canvas className='preset-canvas' id={`${preset.name}-discrete`} />
                </div>
            )
        })}
        <ExportModal
            show={showModal}
            setShow={setShowModal}
            palette={selectedPalette}
        /></>
    );

}

export default Presets;
