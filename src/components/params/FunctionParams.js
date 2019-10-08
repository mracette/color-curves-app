// libs
import React, { useState, useEffect } from 'react';
import Linear from '../../lib/js/functions/Linear';
import Polynomial from '../../lib/js/functions/Polynomial';

function FunctionParams(props) {

    const {
        handleDrawCurve,
        handleUpdateCurve
        } = props;

    const [params, setParams] = useState({
        rotation: 0,
        translation: {x: 0, y:0.25},
        scale: {x: 1, y: 0.5},
        reverse: false
    })

    const classConstructors = {
        linear: Linear,
        polynomial: Polynomial
    };

    const classType = classConstructors[props.curveType];

    const [fn, setFn] = useState(
        new classType(
            params.rotation, 
            params.translation, 
            params.scale
        )
    );

    useEffect(() => {

        const newCurve = new classType(
            params.rotation, 
            params.translation, 
            params.scale
        );

        setFn(newCurve);
        handleUpdateCurve(fn);

    }, [props.curveType])

    // update the 
    // useEffect(() => {

    //     if(handleUpdateCurve) {
    //         handleUpdateCurve(fn);
    //     }

    // }, [handleUpdateCurve]);

    // draw curve when params change
    useEffect(() => {

        if(handleDrawCurve) {
            handleDrawCurve(true);
        }

    }, [params, handleDrawCurve]);

    const onParamChange = (param, value) => {

        switch(param) {
            case 'translateY': fn.setTranslateY(value); break;
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

            <div className = 'flex-row'>

                <div className = 'param'>
                    <p>Scale Y: {params.scale.y.toPrecision(2)}</p>
                    <input
                        type = "range"
                        min = {-1}
                        max = {1}
                        step = {0.01}
                        value = {params.scale.y}
                        onChange = {(e) => {
                            const value = parseFloat(e.target.value);
                            onParamChange('scaleY', value);
                        }}>   
                    </input>
                </div>

            </div>
            
        </div>
    );

}

export default FunctionParams;