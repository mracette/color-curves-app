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

    const getCurveCategory = () => {
        if(props.chartType === 'polar') {
            return props.palette.getHsCurveCategory();
        } else {
            return props.palette.getLCurveCategory();
        }
    }

    const getParams = () => {

        const params = {};
        const curve = getCurve();

        if(curve.angleStart) params['angleStart'] = curve.angleStart;
        if(curve.angleEnd) params['angleEnd'] = curve.angleEnd;
        if(curve.angleOffset) params['angleOffset'] = curve.angleOffset;
        if(curve.translation.y) params['translateY'] = curve.translation.y;
        if(curve.translation.x) params['translateX'] = curve.translation.x;
        if(curve.scale.y) params['scaleY'] = curve.scale.y;
        if(curve.scale.x) params['scaleX'] = curve.scale.x;
        if(curve.radius) params['radius'] = curve.radius;
        if(curve.rotation) params['rotation'] = curve.rotation;
        if(curve.variation) params['variation'] = curve.variation;
        if(curve.reverse) params['reverse'] = curve.reverse;
        if(curve.exponent) params['exponent'] = curve.exponent;
        if(curve.overshoot) params['overshoot'] = curve.overshoot;
        if(curve.amplitude) params['amplitude'] = curve.amplitude;
        if(curve.period) params['period'] = curve.period;
        return params;
     
    }

    const onCurveChange = (newCurveType) => {

        // update the palette with the new curve
        if(props.chartType === 'polar') {

            props.palette.setHsCurve(newCurveType);
            
            if(props.palette.hsCurve.overflow === 'clamp') {
                curve.setClampBounds();
            }

        } else {

            props.palette.setLCurve(newCurveType);

            if(props.palette.lCurve.overflow === 'clamp') {
                curve.setClampBounds();
            }

        }

        // update curve
        setCurve(getCurve());

        // redraw the curve
        props.updateCurve();

    }
    
    const onParamChange = (param, value) => {

        switch(param) {
            case 'angleStart': curve.setAngleStart(value); break;
            case 'angleEnd': curve.setAngleEnd(value); break;
            case 'angleOffset': curve.setAngleOffset(value); break;
            case 'variation': curve.setVariation(value); break;
            case 'translateX': curve.setTranslateX(value); break;
            case 'translateY': curve.setTranslateY(value); break;
            case 'scaleX': curve.setScaleX(value); break;
            case 'scaleY': curve.setScaleY(value); break;
            case 'rotate': curve.setRotation(value); break;
            case 'reverse': curve.setReverse(value); break;
            case 'radius': curve.setRadius(value); break;
            case 'overflow': curve.setOverflow(value); break;
            case 'exponent': curve.setExponent(value); break;
            case 'overshoot': curve.setOvershoot(value); break;
            case 'amplitude': curve.setAmplitude(value); break;
            case 'period': curve.setPeriod(value); break;
            default: break;
        }

        // update clamping bounds
        if(curve.overflow === 'clamp') curve.setClampBounds();

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
        
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [curve])

    return (

        <div id = 'chart-controls' className = 'col-lg-12'>

            {/* FORM */}
            <form>
                    
                <div className = 'form-group'>

                    {/* CURVE OPTIONS LINE 1 */}
                    <div className = 'row'>

                        {/* CURVE TYPE */}
                        <label className = 'col-lg-2 col-form-label-sm' htmlFor = 'type-select'>Curve</label>
                        <div className = 'col-lg-5'>
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
                            <label className = 'col-lg-2 col-form-label-sm' htmlFor = 'variation-select'>Variation</label>
                            <div className = 'col-lg-3'>
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

                    {/* CONDITIONAL CURVE PARAMS */}
                    {curveType === 'polynomial' &&
                    <div className = 'row justify-content-end'>

                            <label className = 'col-lg-2 col-form-label-sm' htmlFor = 'variation-select'>Exponent</label>
                            <div className = 'col-lg-3'>
                                <SmartInput 
                                    labelWidth = {.2} 
                                    label = {"e"}
                                    step = {0.01}
                                    maxDecimals = {2}
                                    min = {0.01}
                                    defaultValue = {curve.exponent}
                                    resetButton = {true}
                                    resetAction = {() => {
                                        curve.setDefaultExponent();
                                        onParamChange('exponent', curve.exponent);
                                    }}
                                    handleChange = {(value) => onParamChange('exponent', value)}
                                />
                            </div>
                    </div>}

                    {/* CONDITIONAL CURVE PARAMS */}
                    {curveType === 'back' &&
                    <div className = 'row justify-content-end'>
                            <label className = 'col-lg-2 col-form-label-sm' htmlFor = 'variation-select'>Overshoot</label>
                            <div className = 'col-lg-3'>
                                <SmartInput 
                                    labelWidth = {.2} 
                                    label = {"s"}
                                    step = {0.01}
                                    maxDecimals = {2}
                                    defaultValue = {curve.overshoot}
                                    resetButton = {true}
                                    resetAction = {() => {
                                        curve.setDefaultOvershoot();
                                        onParamChange('overshoot', curve.overshoot);
                                    }}
                                    handleChange = {(value) => onParamChange('overshoot', value)}
                                />
                            </div>
                    </div>}

                    {/* CONDITIONAL CURVE PARAMS */}
                    {curveType === 'elastic' && <>
                    <div className = 'row justify-content-end'>
                            <label className = 'col-lg-2 col-form-label-sm' htmlFor = 'variation-select'>Amplitude</label>
                            <div className = 'col-lg-3'>
                                <SmartInput 
                                    labelWidth = {.2} 
                                    label = {"a"}
                                    step = {0.01}
                                    maxDecimals = {2}
                                    min = {1}
                                    defaultValue = {curve.amplitude}
                                    resetButton = {true}
                                    resetAction = {() => {
                                        curve.setDefaultAmplitude();
                                        onParamChange('amplitude', curve.amplitude);
                                    }}
                                    handleChange = {(value) => onParamChange('amplitude', value)}
                                />
                            </div>
                    </div>
                    <div className = 'row justify-content-end'>
                        <label className = 'col-lg-2 col-form-label-sm' htmlFor = 'variation-select'>Period</label>
                        <div className = 'col-lg-3'>
                            <SmartInput 
                                labelWidth = {.2} 
                                label = {"p"}
                                step = {0.01}
                                maxDecimals = {2}
                                min = {0.01}
                                defaultValue = {curve.period}
                                resetButton = {true}
                                resetAction = {() => {
                                    curve.setDefaultPeriod();
                                    onParamChange('period', curve.period);
                                }}
                                handleChange = {(value) => onParamChange('period', value)}
                            />
                        </div>
                    </div>
                    </>}


                    {/* CURVE OPTIONS LINE 2 */}
                    <div className = 'row'>

                        {/* CURVE DIRECTION */}
                        <label className = 'col-lg-2 col-form-label-sm' htmlFor = 'direction-select'>Direction</label>
                        <div className = 'col-lg-5'>
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
                        <label className = 'col-lg-2 col-form-label-sm' htmlFor = 'off-grid-select'>Overflow</label>
                        <div className = 'col-lg-3'>
                        <select 
                            id = 'overflow-select'
                            className = 'form-control form-control-sm'
                            defaultValue = 'clamp'
                            onChange = {(e) => {
                                const value = e.target.value;
                                onParamChange('overflow', value);
                        }}>
                            <option value = 'clamp'>Clamp</option>
                            <option value = 'project'>Project</option>
                        </select>
                    </div>

                    </div>

                </div>

                {/* CONDITIONAL ARC PARAMETERS */}
                {curveType === 'arc' && <div className = 'form-group'>

                    {/* RADIUS */}
                    <div className = 'row'>

                        {/* RADIUS */}
                        <label className = 'col-lg-2 col-form-label-sm' htmlFor = 'type-select'>Radius</label>
                        <div className = 'col-sm-5'>
                            <SmartInput
                                labelWidth = {.2}
                                label = 'r'
                                step = {0.01}
                                maxDecimals = {2}
                                defaultValue = {curve.r}
                                resetButton = {true}
                                resetAction = {() => {
                                    curve.setDefaultRadius();
                                    onParamChange('radius', curve.r);
                                }}
                                handleChange = {(value) => onParamChange('radius', value)}
                            />
                        </div>

                    </div>

                    {/* BOUNDS */}
                    <div className = 'row'>

                        {/* ANGLE START */}
                        <label className = 'col-lg-2 col-form-label-sm' htmlFor = 'type-select'>Range</label>
                        <div className = 'col-sm-5'>
                            <SmartInput
                                labelWidth = {.2}
                                label = {<>{String.fromCharCode(0xfeff0398)}<sub>0</sub></>}
                                step = {0.01}
                                maxDecimals = {2}
                                unitSymbol = {String.fromCharCode(0x3c0)}
                                conversion = {Math.PI}
                                defaultValue = {curve.angleStart / Math.PI}
                                resetButton = {true}
                                resetAction = {() => {
                                    curve.setDefaultAngleStart();
                                    onParamChange('angleStart', curve.angleStart);
                                }}
                                handleChange = {(value) => onParamChange('angleStart', value)}
                            />
                        </div>

                        {/* ANGLE END */}
                        <div className = 'col-sm-5'>
                            <SmartInput
                                labelWidth = {.2}
                                label = {<>{String.fromCharCode(0xfeff0398)}<sub>1</sub></>}
                                step = {0.01}
                                maxDecimals = {2}
                                unitSymbol = {String.fromCharCode(0x3c0)}
                                conversion = {Math.PI}
                                defaultValue = {curve.angleEnd / Math.PI}
                                resetButton = {true}
                                resetAction = {() => {
                                    curve.setDefaultAngleEnd();
                                    onParamChange('angleEnd', curve.angleEnd);
                                }}
                                handleChange = {(value) => onParamChange('angleEnd', value)}
                            />
                        </div>

                    </div>

                    {/* ANGLE OFFSET */}
                    <div className = 'row'>

                        {/* ANGLE START */}
                        <label className = 'col-lg-2 col-form-label-sm' htmlFor = 'type-select'>Offset</label>
                        <div className = 'col-sm-5'>
                            <SmartInput
                                labelWidth = {.2}
                                label = {String.fromCharCode(0xfeff0398)}
                                step = {0.01}
                                maxDecimals = {2}
                                unitSymbol = {String.fromCharCode(0x3c0)}
                                conversion = {Math.PI}
                                defaultValue = {curve.angleOffset / Math.PI}
                                resetButton = {true}
                                resetAction = {() => {
                                    curve.setDefaultAngleOffset();
                                    onParamChange('angleOffset', curve.angleOffset);
                                }}
                                handleChange = {(value) => onParamChange('angleOffset', value)}
                            />
                        </div>

                    </div>

                </div>}

                <div className = 'form-group'>

                    {/* TRANSLATION */}
                    <div className = 'row'>

                        {/* CURVE TYPE */}
                        <label className = 'col-lg-2 col-form-label-sm' htmlFor = 'type-select'>Translation</label>
                        <div className = 'col-sm-5'>
                            <SmartInput
                                labelWidth = {.2}
                                label = 'X'
                                step = {0.01}
                                maxDecimals = {2}
                                defaultValue = {curve.translation.x}
                                resetButton = {true}
                                resetAction = {() => {
                                    curve.setDefaultTranslateX();
                                    onParamChange('translateX', curve.translation.x);
                                }}
                                handleChange = {(value) => onParamChange('translateX', value)}
                            />
                        </div>

                        <div className = 'col-sm-5'>
                            <SmartInput
                                labelWidth = {.2}
                                label = 'Y'
                                step = {0.01}
                                maxDecimals = {2}
                                defaultValue = {curve.translation.y}
                                resetButton = {true}
                                resetAction = {() => {
                                    curve.setDefaultTranslateY();
                                    onParamChange('translateY', curve.translation.y);
                                }}
                                handleChange = {(value) => onParamChange('translateY', value)}
                            />
                        </div>

                    </div>

                    {/* SCALE */}
                    <div className = 'row'>

                        {/* CURVE TYPE */}
                        <label className = 'col-lg-2 col-form-label-sm' htmlFor = 'type-select'>Scale</label>
                        <div className = 'col-sm-5'>
                            <SmartInput
                                labelWidth = {.2}
                                label = 'X'
                                step = {0.01}
                                maxDecimals = {2}
                                defaultValue = {curve.scale.x}
                                resetButton = {true}
                                resetAction = {() => {
                                    curve.setDefaultScaleX();
                                    onParamChange('scaleX', curve.scale.x);
                                }}
                                handleChange = {(value) => onParamChange('scaleX', value)}
                            />
                        </div>

                        <div className = 'col-sm-5'>
                            <SmartInput
                                labelWidth = {.2}
                                label = 'Y'
                                step = {0.01}
                                maxDecimals = {2}
                                defaultValue = {curve.scale.y}
                                resetButton = {true}
                                resetAction = {() => {
                                    curve.setDefaultScaleY();
                                    onParamChange('scaleY', curve.scale.y);
                                }}
                                handleChange = {(value) => onParamChange('scaleY', value)}
                            />
                        </div>

                    </div>

                    {/* ROTATION */}
                    <div className = 'row'>
                        <label className = 'col-lg-2 col-form-label-sm' htmlFor = 'type-select'>Rotation</label>
                        <div className = 'col-sm-5'>
                            <SmartInput
                                labelWidth = {.2} 
                                label = {String.fromCharCode(0xfeff0398)}
                                step = {0.01}
                                maxDecimals = {2}
                                unitSymbol = {String.fromCharCode(0x3c0)}
                                conversion = {Math.PI}
                                defaultValue = {curve.rotation / Math.PI}
                                resetButton = {true}
                                resetAction = {() => {
                                    curve.setDefaultRotation();
                                    onParamChange('rotate', curve.rotation);
                                }}
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