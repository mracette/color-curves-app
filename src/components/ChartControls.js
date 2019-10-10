// libs
import React, { useState, useEffect } from 'react';

// components
import SmartInput from '../components/SmartInput';


function ChartControls(props) {

    const getCurve = () => {
        if(props.chartType === 'polar') {
            return props.palette.hsCurve;
        } else {
            return props.palette.lCurve;
        }
    }

    const getCurveType = () => {
        if(props.chartType === 'polar') {
            return props.palette.getHsCurveType();
        } else {
            return props.palette.getLCurveType();
        }
    }

    const getCurveCategory = (curveType) => {
        if(props.chartType === 'polar') {
            return props.palette.getHsCurveCategory();
        } else {
            return props.palette.getLCurveCategory();
        }
    }

    const getParams = () => {

        const params = {};
        const curve = getCurve();

        if(curve.translation.y) params['translateY'] = curve.translation.y;
        if(curve.translation.x) params['translateX'] = curve.translation.x;
        if(curve.scale.y) params['scaleY'] = curve.scale.y;
        if(curve.scale.x) params['scaleX'] = curve.scale.x;
        if(curve.rotation) params['rotation'] = curve.rotation;
        if(curve.variation) params['variation'] = curve.variation;
        if(curve.reverse) params['reverse'] = curve.reverse;

        return params;
     
    }

    const onCurveChange = (newCurveType) => {

        // update the palette with the new curve
        if(props.chartType === 'polar') {
            props.palette.setHsCurve(newCurveType);
        } else {
            props.palette.setLCurve(newCurveType);
        }

        // update curve
        setCurve(getCurve());

        // redraw the curve
        props.updateCurve();

    }
    
    const onParamChange = (param, value) => {

        switch(param) {
            case 'variation': curve.setVariation(value); break;
            case 'translateX': curve.setTranslateX(value); break;
            case 'translateY': curve.setTranslateY(value); break;
            case 'scaleX': curve.setScaleX(value); break;
            case 'scaleY': curve.setScaleY(value); break;
            case 'rotate': curve.setRotation(value); break;
            case 'reverse': curve.setReverse(value); break;
            default: break;
        }

        props.updateCurve();

        const newParams = {...params};
        newParams[param] = value;
        setParams(newParams);

    };

    const [curve, setCurve] = useState(
        getCurve()
    )
    
    const [curveType, setCurveType] = useState(
        getCurveType()
    );

    const [curveCategory, setCurveCategory] = useState(
        getCurveCategory()
    )

    const [params, setParams] = useState(
        getParams()
    );

    useEffect(() => {
        // reset state when curve changes
        setCurveType(getCurveType());
        setCurveCategory(getCurveCategory());
        setParams(getParams());
    }, [curve])

    return (

        <div id = 'chart-controls' className = 'col-lg-12'>

            {/* FORM */}
            <form>
                    
                <div className = 'form-group'>
                
                    {/* HEADER */}
                    <div className = 'row'>                    
                        <div className = 'col-lg-12'>
                            <h3 className = 'text-muted'>Curve</h3>
                        </div>
                    </div>

                    {/* CURVE OPTIONS LINE 1 */}
                    <div className = 'row'>

                        {/* CURVE TYPE */}
                        <label className = 'col-lg-2 col-form-label-sm' for = 'type-select'>Type</label>
                        <div className = 'col-lg-4'>
                            <select
                                id = 'type-select'
                                className = 'form-control form-control-sm'
                                defaultValue = {curveType}
                                onChange = {(e) => {
                                    const newCurveType = e.target.value;
                                    onCurveChange(newCurveType);
                            }}>
                            {props.config.map((option) => {
                                return <option key = {option.id} value = {option.id}> {option.display} </option>
                            })}
                            </select>
                        </div>

                        {/* CURVE VARIATION */}
                        {curveCategory === 'function' && curveType !== 'linear' && (<>
                            <label className = 'col-lg-2 col-form-label-sm'  for = 'variation-select'>Variation</label>
                            <div className = 'col-lg-4'>
                                <select 
                                    id = 'variation-select'
                                    className = 'form-control form-control-sm'
                                    defaultValue = 'in'
                                    onChange = {(e) => {
                                        const value = e.target.value;
                                        onParamChange('variation', value);
                                }}>
                                <option value = 'in'>In</option>
                                <option value = 'out'>Out</option>
                                <option value = 'in-out'>In-Out</option>
                                </select>
                            </div>
                        </>)}
                    
                    </div>

                    {/* CURVE OPTIONS LINE 2 */}
                    <div className = 'row'>

                    {/* CURVE DIRECTION */}
                    <label className = 'col-lg-2 col-form-label-sm' for = 'direction-select'>Direction</label>
                    <div className = 'col-lg-4'>
                        <select 
                            id = 'direction-select'
                            className = 'form-control form-control-sm'
                            defaultValue = 'normal'
                            onChange = {(e) => {
                                const value = e.target.value !== 'normal';
                                onParamChange('reverse', value);
                        }}>
                            <option value = 'normal'>Normal</option>
                            <option value = 'reverse'>Reverse</option>
                        </select>
                    </div>

                    {/* CURVE OVERFLOW */}
                    <label className = 'col-lg-2 col-form-label-sm' for = 'off-grid-select'>Overflow</label>
                    <div className = 'col-lg-4'>
                        <select 
                            id = 'overflow-select'
                            className = 'form-control form-control-sm'
                            defaultValue = 'clip'
                            onChange = {(e) => {
                                const value = e.target.value;
                                onParamChange('overflow', value);
                        }}>
                            <option value = 'clip'>Clip Curve</option>
                            <option value = 'project'>Surface Project</option>
                        </select>
                    </div>

                </div>

                </div>

                <div className = 'form-group'>

                    {/* HEADER */}
                    <div className = 'row'>                    
                        <div className = 'col-lg-12'>
                            <h3 className = 'text-muted'>Transforms</h3>
                        </div>
                    </div>

                    {/* TRANSLATION */}
                    <div className = 'row'>

                        {/* CURVE TYPE */}
                        <label className = 'col-lg-2 col-form-label-sm' for = 'type-select'>Translation</label>
                        <div className = 'col-sm-5'>
                            <SmartInput
                                label = 'X'
                                step = {0.01}
                                fixedDecimals = {2}
                                defaultValue = {curve.translation.x.toPrecision(2)}
                                handleChange = {(value) => onParamChange('translateX', value)}
                            />
                        </div>

                        <div className = 'col-sm-5'>
                            <SmartInput
                                label = 'Y'
                                step = {0.01}
                                fixedDecimals = {2}
                                defaultValue = {curve.translation.y.toPrecision(2)}
                                handleChange = {(value) => onParamChange('translateY', value)}
                            />
                        </div>

                    </div>

                    {/* SCALE */}
                    <div className = 'row'>

                        {/* CURVE TYPE */}
                        <label className = 'col-lg-2 col-form-label-sm' for = 'type-select'>Scale</label>
                        <div className = 'col-sm-5'>
                            <SmartInput
                                label = 'X'
                                step = {0.01}
                                fixedDecimals = {2}
                                defaultValue = {curve.scale.x.toPrecision(2)}
                                handleChange = {(value) => onParamChange('scaleX', value)}
                            />
                        </div>

                        <div className = 'col-sm-5'>
                            <SmartInput
                                label = 'Y'
                                step = {0.01}
                                fixedDecimals = {2}
                                defaultValue = {curve.scale.y.toPrecision(2)}
                                handleChange = {(value) => onParamChange('scaleY', value)}
                            />
                        </div>

                    </div>

                    {/* ROTATION */}
                    <div className = 'row'>
                        <label className = 'col-lg-2 col-form-label-sm' for = 'type-select'>Rotation</label>
                        <div className = 'col-sm-5'>
                            <SmartInput
                                label = {String.fromCharCode(0xfeff0398)}
                                step = {0.01}
                                fixedDecimals = {2}
                                defaultValue = {curve.rotation.toPrecision(2)}
                                handleChange = {(value) => onParamChange('rotate', value)}
                            />
                        </div>
                    </div>

                </div>

            </form>

        </div>

    );  

}

export default ChartControls;