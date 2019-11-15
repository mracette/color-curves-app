// libs
import React, { useState, useEffect } from 'react';
import 'bootstrap';

// components
import ExportModal from './ExportModal';

// palettes
import WarmMagma from '../lib/palettes/WarmMagma';
import AllAround from '../lib/palettes/AllAround';
import UnAmerican from '../lib/palettes/UnAmerican';
import CandyPaint from '../lib/palettes/CandyPaint';
import GoldfishDeluxe from '../lib/palettes/GoldfishDeluxe';
import TrixSky from '../lib/palettes/TrixSky';
import CoralScrub from '../lib/palettes/CoralScrub';
import PolarBeyond from '../lib/palettes/PolarBeyond';

function Presets() {

    const [showModal, setShowModal] = useState(false);
    const [selectedPalette, setSelectedPalette] = useState(null);

    const presets = [
        new WarmMagma(),
        new AllAround(),
        new UnAmerican(),
        new CandyPaint(),
        new GoldfishDeluxe(),
        new TrixSky(),
        new CoralScrub(),
        new PolarBeyond()
    ];

    useEffect(() => {
        presets.forEach((preset) => {
            preset.drawContinuousPalette(document.getElementById(preset.name + '-continuous'), 128);
            preset.drawDiscretePalette(document.getElementById(preset.name + '-discrete'), 6);
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
                    className='preset material palette-wrapper border'>
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
