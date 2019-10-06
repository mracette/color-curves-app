// libs
import React, { useState, useEffect } from 'react';
import { Arc } from '../../lib/js/geometries/Arc';

function ArcParams(props) {

    const {
        handleDrawCurve,
        handleUpdateCurve
        } = props;

    const [params, setParams] = useState({
        r: 0.5,
        angleStart: 0,
        angleEnd: Math.PI * 2,
        angleOffset: 0,
        translateX: 0,
        translateY: 0,
        reverse: false,
    })

    const [arc] = useState(new Arc(
        0, 0,
        params.r,
        params.angleStart,
        params.angleEnd,
        params.angleOffset
    ));

    useEffect(() => {

        if(handleUpdateCurve) {
            handleUpdateCurve(arc);
        }

    }, [arc, handleUpdateCurve]);

    useEffect(() => {

        if(handleDrawCurve) {
            handleDrawCurve(true);
        }

    }, [params, handleDrawCurve]);

    const onParamChange = (param, value) => {

        switch(param) {
            case 'angleStart': arc.setAngleStart(value); break;
            case 'angleEnd': arc.setAngleEnd(value); break;
            case 'angleOffset': arc.setAngleOffset(value); break;
            case 'r': arc.setRadius(value); break;
            case 'translateX': arc.setTranslateX(value); break;
            case 'translateY': arc.setTranslateY(value); break;
            case 'reverse': arc.reverse(); break;
            default: break;
        }

        const newParams = {...params};
        newParams[param] = value;

        setParams(newParams);

    };

    return (
        <div 
            id = 'arc-params'
            className = 'params'
        >

            <div className = 'flex-row'>

                <div className = 'param'>
                    <p>Off Grid Behavior:</p>
                    <select
                        value = {params.outOfBounds}
                        onChange = {(e) => {
                            const value = parseFloat(e.target.value);
                            onParamChange('outOfBounds', value);
                        }}>
                        <option value = 'clip'>Clip</option>
                        <option value = 'project'>Project</option>
                    </select>
                </div>

            </div>

            <div className = 'flex-row'>

                <div className = 'param'>
                    <p>Radius: {params.r.toPrecision(2)}</p>
                    <input
                        type = "range"
                        min = {0}
                        max = {1}
                        step = {0.01}
                        value = {params.r}
                        onChange = {(e) => {
                            const value = parseFloat(e.target.value);
                            onParamChange('r', value);
                        }}>   
                    </input>
                </div>

            </div>

            <div className = 'flex-row'>

                <div className = 'param'>
                    <p>Angle Start: {(params.angleStart / Math.PI).toPrecision(2)} &pi;</p>
                    <input
                        type = "range"
                        min = {0}
                        max = {Math.PI * 2}
                        step = {Math.PI * 2 / 64}
                        value = {params.angleStart}
                        onChange = {(e) => {
                            const value = parseFloat(e.target.value);
                            onParamChange('angleStart', value);
                        }}>
                    </input>
                </div>

                <div className = 'param'>
                    <p>Angle End: {(params.angleEnd / Math.PI).toPrecision(2)} &pi;</p>
                    <input
                        type = "range"
                        min = {0}
                        max = {Math.PI * 2}
                        step = {Math.PI * 2 / 64}
                        value = {params.angleEnd}
                        onChange = {(e) => {
                            const value = parseFloat(e.target.value);
                            onParamChange('angleEnd', value);
                        }}>   
                    </input>
                </div>

            </div>

            <div className = 'flex-row'>

                <div className = 'param'>
                    <p>Angle Offset: {(params.angleOffset / Math.PI).toPrecision(2)} &pi;</p>
                    <input
                        type = "range"
                        min = {-Math.PI * 2}
                        max = {Math.PI * 2}
                        step = {Math.PI * 2 / 64}
                        value = {params.angleOffset}
                        onChange = {(e) => {
                            const value = parseFloat(e.target.value);
                            onParamChange('angleOffset', value);
                        }}>   
                    </input>
                </div>

            </div>

            <div className = 'flex-row'>

                <div className = 'param'>
                    <p>Translate X: {params.translateX.toPrecision(2)}</p>
                    <input
                        type = "range"
                        min = {-params.r - 1}
                        max = {1 + params.r}
                        step = {0.01}
                        value = {params.cx}
                        onChange = {(e) => {
                            const value = parseFloat(e.target.value);
                            onParamChange('translateX', value);
                        }}>   
                    </input>
                </div>

                <div className = 'param'>
                    <p>Translate Y: {params.translateY.toPrecision(2)}</p>
                    <input
                        type = "range"
                        min = {-params.r - 1}
                        max = {1 + params.r}
                        step = {0.01}
                        value = {params.cy}
                        onChange = {(e) => {
                            const value = parseFloat(e.target.value);
                            onParamChange('translateY', value);
                        }}>   
                    </input>
                </div>

            </div>
            
        </div>
    );

}

export default ArcParams;