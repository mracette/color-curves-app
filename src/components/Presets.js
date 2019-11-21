// libs
import React, { useState, useEffect } from 'react';
import 'bootstrap';

// components
import Canvas from './Canvas';
import ExportModal from './ExportModal';

// palettes
import {
    WarmMagma,
    AllAround,
    BeyondBelief,
    UnAmerican,
    CandyPaint,
    GoldfishDeluxe,
    PhytoPlankton,
    TrixSky,
    PowerWashed,
    CoralScrub,
    PolarBeyond,
    // OnVacation,
    StockImage
} from 'color-curves';

function Presets(props) {

    const [showModal, setShowModal] = useState(false);
    const [selectedPalette, setSelectedPalette] = useState(null);

    const presets = [
        new WarmMagma(),
        new AllAround(),
        // new OnVacation(),
        new UnAmerican(),
        new BeyondBelief(),
        new PowerWashed(),
        new CandyPaint(),
        new StockImage(),
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
                    className='material palette-wrapper'>
                    <h4>{preset.name}</h4>
                    <h6>by {preset.author}</h6>
                    <Canvas
                        className='palette preset'
                        callback={(canvas) => preset.drawContinuousPalette(canvas, 128)}
                        onResize={(canvas) => preset.drawContinuousPalette(canvas, 128)}
                    />
                    <Canvas
                        className='palette preset'
                        callback={(canvas) => preset.drawDiscretePalette(canvas, 6)}
                        onResize={(canvas) => preset.drawDiscretePalette(canvas, 6)}
                    />
                </div>
            )
        })}
        <ExportModal
            setNav={props.setNav}
            show={showModal}
            setShow={setShowModal}
            palette={selectedPalette}
            setPalette={props.setPalette}
        /></>
    );

}

export default Presets;
