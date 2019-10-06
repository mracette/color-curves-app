// libs
import React, { useState, useEffect } from 'react';
import Linear from '../../lib/js/functions/Linear';

function LinearParams(props) {

    const {
        handleDrawCurve,
        handleUpdateCurve
        } = props;

    const [params, setParams] = useState({
        rotation: 0,
        translation: {x: 0, y:0},
        scale: {x: 1, y:1},
        reverse: false
    })

    const [fn] = useState(new Linear(
        params.rotation, 
        params.translation, 
        params.scale
    ));

    useEffect(() => {

        if(handleUpdateCurve) {
            handleUpdateCurve(fn);
        }

    }, [fn, handleUpdateCurve]);

    useEffect(() => {

        if(handleDrawCurve) {
            handleDrawCurve(true);
        }

    }, [params, handleDrawCurve]);

    const onParamChange = (param, value) => {

        switch(param) {
            case 'translateX': fn.setTranslateX(value); break;
            case 'translateY': fn.setTranslateY(value); break;
            case 'scaleX': fn.setScaleX(value); break;
            case 'scaleY': fn.setScaleY(value); break;
            case 'reverse': fn.reverse(); break;
            default: break;
        }

        const newParams = {...params};
        newParams[param] = value;

        setParams(newParams);

    };

    return (
        <div 
            id = 'linear-params'
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
                    <p>Translate X: {params.translation.x.toPrecision(2)}</p>
                    <input
                        type = "range"
                        min = {-1}
                        max = {1}
                        step = {0.01}
                        value = {params.cx}
                        onChange = {(e) => {
                            const value = parseFloat(e.target.value);
                            onParamChange('translateX', value);
                        }}>   
                    </input>
                </div>

                <div className = 'param'>
                    <p>Translate Y: {params.translation.y.toPrecision(2)}</p>
                    <input
                        type = "range"
                        min = {-1}
                        max = {1}
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

export default LinearParams;