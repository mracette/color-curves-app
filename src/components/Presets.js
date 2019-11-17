// libs
import React, { useState, useEffect } from 'react';
import 'bootstrap';

// components
import Canvas from './Canvas';
import ExportModal from './ExportModal';

// palettes
import WarmMagma from '../lib/palettes/WarmMagma';
import AllAround from '../lib/palettes/AllAround';
import BeyondBelief from '../lib/palettes/BeyondBelief';
import UnAmerican from '../lib/palettes/UnAmerican';
import CandyPaint from '../lib/palettes/CandyPaint';
import GoldfishDeluxe from '../lib/palettes/GoldfishDeluxe';
import PhytoPlankton from '../lib/palettes/PhytoPlankton';
import TrixSky from '../lib/palettes/TrixSky';
import PowerWashed from '../lib/palettes/PowerWashed';
import CoralScrub from '../lib/palettes/CoralScrub';
import PolarBeyond from '../lib/palettes/PolarBeyond';

function Presets() {

    const [showModal, setShowModal] = useState(false);
    const [selectedPalette, setSelectedPalette] = useState(null);

    const presets = [
        new WarmMagma(),
        new AllAround(),
        new UnAmerican(),
        new BeyondBelief(),
        new PowerWashed(),
        new CandyPaint(),
        new GoldfishDeluxe(),
        new PhytoPlankton(),
        new TrixSky(),
        new CoralScrub(),
        new PolarBeyond()
    ];

    return (<>
        {presets.map((preset, i) => {
            return (
                <div
                    onClick={(e) => {
                        setSelectedPalette(preset);
                        setShowModal(true);
                    }}
                    className='preset material palette-wrapper'>
                    <h4>{preset.name}</h4>
                    <h6>by {preset.author}</h6>
                    <Canvas
                        className='preset-canvas'
                        id={`${preset.name}-continuous`}
                        callback={(canvas) => preset.drawContinuousPalette(canvas, 128)}
                        onResize={(canvas) => preset.drawContinuousPalette(canvas, 128)}
                    />
                    <Canvas
                        className='preset-canvas'
                        id={`${preset.name}-discrete`}
                        callback={(canvas) => preset.drawDiscretePalette(canvas, 6)}
                        onResize={(canvas) => preset.drawDiscretePalette(canvas, 6)}
                    />
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
