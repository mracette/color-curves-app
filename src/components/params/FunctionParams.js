// libs
import React, { useState, useEffect } from 'react';

// components
import SmartInput from '../SmartInput';

function FunctionParams(props) {

    const [params, setParams] = useState({
        curveType: props.curveType,
        translateY: props.curve.translation.y,
        translateX: props.curve.translation.x,
        scaleX: props.curve.scale.x,
        scaleY: props.curve.scale.y,
        variation: props.curve.variation,
        reverse: props.curve.reverse,
    });

    const onParamChange = (param, value) => {

        switch(param) {
            case 'variation': props.curve.setVariation(value); break;
            case 'translateX': props.curve.setTranslateX(value); break;
            case 'translateY': props.curve.setTranslateY(value); break;
            case 'scaleX': props.curve.setScaleX(value); break;
            case 'scaleY': props.curve.setScaleY(value); break;
            case 'rotate': props.curve.setRotation(value); break;
            case 'reverse': props.curve.setReverse(value); break;
            default: break;
        }

        props.updateCurve();

        const newParams = {...params};
        newParams[param] = value;
        setParams(newParams);

    };

    // if the curve type changes, reset the params state
    useEffect(() => {

        setParams({
            curveType: props.curveType,
            translateY: props.curve.translation.y,
            translateX: props.curve.translation.x,
            scaleX: props.curve.scale.x,
            scaleY: props.curve.scale.y,
            variation: props.curve.variation,
            reverse: props.curve.reverse,
        });

    }, [props.curveType])

    return (<>

        <div className = 'row'>

            <div className = 'col-sm-2'>
                <h4>
                    <label for = 'variation-select'>Variation</label>
                </h4>
            </div>

            <div className = 'col-sm-4'>
                <select 
                    id = {'variation-select'}
                    className = {'form-control'}
                    defaultValue = {
                        props.curveType === 'linear' ? 'na' : params.variation
                    }
                    onChange = {(e) => {
                        const value = e.target.value;
                        onParamChange('variation', value);
                }}>
                    {props.curveType === 'linear' && <option disabled = {true} value = 'na'>N/A</option>}
                    {props.curveType !== 'linear' && <option value = 'in'>In</option>}
                    {props.curveType !== 'linear' && <option value = 'out'>Out</option>}
                    {props.curveType !== 'linear' && <option value = 'in-out'>In-Out</option>}
                </select>
            </div>

            <div className = 'col-sm-2'>
                <h4>
                    <label for = 'reverse-select'>Reverse</label>
                </h4>
            </div>

            <div className = 'col-sm-4'>
                <select 
                    id = {'reverse-select'}
                    className = {'form-control'}
                    defaultValue = {params.reverse.toString()}
                    onChange = {(e) => {
                        const value = e.target.value === 'true';
                        onParamChange('reverse', value);
                    }}>
                    <option value = 'true'>True</option>
                    <option value = 'false'>False</option>
                </select>
            </div>
        
        </div>

        <div className = 'row'>
            <div className = 'col-sm-2'/>
            <div className = 'col-sm-10'>
                <h3>Transform</h3>
            </div>
        </div>

        <div className = 'row'>

            <div className = 'col-sm-2'>
                <h4>Translation</h4>
            </div>
            
            <div className = 'col-sm-5'>
                <SmartInput
                    label = 'X'
                    step = {0.01}
                    fixedDecimals = {2}
                    defaultValue = {props.curve.translation.x.toPrecision(2)}
                    handleChange = {(value) => onParamChange('translateX', value)}
                />
            </div>

            <div className = 'col-sm-5'>
                <SmartInput
                    label = 'Y'
                    step = {0.01}
                    fixedDecimals = {2}
                    defaultValue = {props.curve.translation.y.toPrecision(2)}
                    handleChange = {(value) => onParamChange('translateY', value)}
                />
            </div>

        </div>

        <div className = 'row'>

            <div className = 'col-sm-2'>
                <h4>Scale</h4>
            </div>
            
            <div className = 'col-sm-5'>
                <SmartInput
                    label = 'X'
                    step = {0.01}
                    fixedDecimals = {2}
                    defaultValue = {props.curve.scale.x.toPrecision(2)}
                    handleChange = {(value) => onParamChange('scaleX', value)}
                />
            </div>

            <div className = 'col-sm-5'>
                <SmartInput
                    label = 'Y'
                    step = {0.01}
                    fixedDecimals = {2}
                    defaultValue = {props.curve.scale.y.toPrecision(2)}
                    handleChange = {(value) => onParamChange('scaleY', value)}
                />
            </div>

        </div>

        <div className = 'row'>

            <div className = 'col-sm-2'>
                <h4>Rotate</h4>
            </div>
            
            <div className = 'col-sm-5'>
                <SmartInput
                    label = {String.fromCharCode(0xfeff0398)}
                    step = {0.01}
                    fixedDecimals = {2}
                    defaultValue = {props.curve.rotation.toPrecision(2)}
                    handleChange = {(value) => onParamChange('rotate', value)}
                />
            </div>

        </div>          

    </>);

}

export default FunctionParams;