// libs
import React, { useState, useEffect } from 'react';
import Curve from '../lib/js/Curve';

// components
import SmartInput from './smart-input/SmartInput';


function ChartControls(props) {

    const getParams = () => {

        const params = {};

        const paramsList = Curve.getParamSet();

        paramsList.forEach((param) => {
            props.curve[param] && (params[param] = props.curve[param]);
        })

        return params;

    }

    const onCurveChange = (newCurveType) => {

        props.setCurve(newCurveType);

    }

    const onParamChange = (param, value) => {

        switch (param) {
            case 'angleStart': props.curve.setAngleStart(value); break;
            case 'angleEnd': props.curve.setAngleEnd(value); break;
            case 'angleOffset': props.curve.setAngleOffset(value); break;
            case 'variation': props.curve.setVariation(value); break;
            case 'translateX': props.curve.setTranslateX(value); break;
            case 'translateY': props.curve.setTranslateY(value); break;
            case 'scaleX': props.curve.setScaleX(value); break;
            case 'scaleY': props.curve.setScaleY(value); break;
            case 'rotate': props.curve.setRotation(value); break;
            case 'reverse': props.curve.setReverse(value); break;
            case 'radius': props.curve.setRadius(value); break;
            case 'overflow': props.curve.setOverflow(value); break;
            case 'exponent': props.curve.setExponent(value); break;
            case 'overshoot': props.curve.setOvershoot(value); break;
            case 'amplitude': props.curve.setAmplitude(value); break;
            case 'period': props.curve.setPeriod(value); break;
            default: break;
        }

        // update clamping bounds
        if (props.curve.overflow === 'clamp') props.curve.setClampBounds();

        props.updateCurve();

        const newParams = { ...params };
        newParams[param] = value;
        setParams(newParams);

    };

    const [params, setParams] = useState(
        getParams()
    );

    useEffect(() => {

        props.curve && setParams(getParams());

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.curve])

    return (

        <div id='chart-controls' className='col-12'>

            {/* FORM */}
            <form>

                <div className='form-group'>

                    {/* CURVE OPTIONS LINE 1 */}
                    <div className='row'>

                        {/* CURVE TYPE */}
                        <label className='col-lg-2 col-3 col-form-label-sm' htmlFor='type-select'>Curve</label>
                        <div className='col-lg-5 col-9'>
                            <select
                                id='type-select'
                                className='form-control form-control-sm'
                                defaultValue={props.curve.type}
                                onChange={(e) => {
                                    const newCurveType = e.target.value;
                                    onCurveChange(newCurveType);
                                }}>
                                {props.config.map((option) => {
                                    return <option key={option.id} value={option.id}> {option.display} </option>
                                })}
                            </select>
                        </div>

                        {/* CURVE VARIATION */}
                        {props.curve.category === 'function' && props.curve.type !== 'linear' && (<>
                            <label className='col-lg-2 col-3 col-form-label-sm' htmlFor='variation-select'>Variation</label>
                            <div className='col-lg-3 col-9'>
                                <select
                                    id='variation-select'
                                    className='form-control form-control-sm'
                                    defaultValue='in'
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        onParamChange('variation', value);
                                    }}>
                                    <option value='in'>In</option>
                                    <option value='out'>Out</option>
                                    <option value='in-out'>In-Out</option>
                                </select>
                            </div>
                        </>)}

                    </div>

                    {/* CONDITIONAL CURVE PARAMS */}
                    {props.curve.type === 'polynomial' &&
                        <div className='row justify-content-end'>

                            <label className='col-lg-2 col-3 col-form-label-sm' htmlFor='variation-select'>Exponent</label>
                            <div className='col-lg-3 col-9'>
                                <SmartInput
                                    labelWidth={.2}
                                    label={"e"}
                                    step={0.01}
                                    maxDecimals={2}
                                    min={0.01}
                                    defaultValue={props.curve.exponent}
                                    resetButton={true}
                                    resetAction={() => {
                                        props.curve.setExponent();
                                        onParamChange('exponent', props.curve.exponent);
                                    }}
                                    handleChange={(value) => onParamChange('exponent', value)}
                                />
                            </div>
                        </div>}

                    {/* CONDITIONAL CURVE PARAMS */}
                    {props.curve.type === 'back' &&
                        <div className='row justify-content-end'>
                            <label className='col-lg-2 col-3 col-form-label-sm' htmlFor='variation-select'>Overshoot</label>
                            <div className='col-lg-3 col-9'>
                                <SmartInput
                                    labelWidth={.2}
                                    label={"s"}
                                    step={0.01}
                                    maxDecimals={2}
                                    defaultValue={props.curve.overshoot}
                                    resetButton={true}
                                    resetAction={() => {
                                        props.curve.setOvershoot();
                                        onParamChange('overshoot', props.curve.overshoot);
                                    }}
                                    handleChange={(value) => onParamChange('overshoot', value)}
                                />
                            </div>
                        </div>}

                    {/* CONDITIONAL CURVE PARAMS */}
                    {props.curve.type === 'elastic' && <>
                        <div className='row justify-content-end'>
                            <label className='col-lg-2 col-3 col-form-label-sm' htmlFor='variation-select'>Amplitude</label>
                            <div className='col-lg-3 col-9'>
                                <SmartInput
                                    labelWidth={.2}
                                    label={"a"}
                                    step={0.01}
                                    maxDecimals={2}
                                    min={1}
                                    defaultValue={props.curve.amplitude}
                                    resetButton={true}
                                    resetAction={() => {
                                        props.curve.setAmplitude();
                                        onParamChange('amplitude', props.curve.amplitude);
                                    }}
                                    handleChange={(value) => onParamChange('amplitude', value)}
                                />
                            </div>
                        </div>
                        <div className='row justify-content-end'>
                            <label className='col-lg-2 col-3 col-form-label-sm' htmlFor='variation-select'>Period</label>
                            <div className='col-lg-3 col-9'>
                                <SmartInput
                                    labelWidth={.2}
                                    label={"p"}
                                    step={0.01}
                                    maxDecimals={2}
                                    min={0.01}
                                    defaultValue={props.curve.period}
                                    resetButton={true}
                                    resetAction={() => {
                                        props.curve.setPeriod();
                                        onParamChange('period', props.curve.period);
                                    }}
                                    handleChange={(value) => onParamChange('period', value)}
                                />
                            </div>
                        </div>
                    </>}


                    {/* CURVE OPTIONS LINE 2 */}
                    <div className='row'>

                        {/* CURVE DIRECTION */}
                        <label className='col-lg-2 col-3 col-form-label-sm' htmlFor='direction-select'>Direction</label>
                        <div className='col-lg-5 col-9'>
                            <select
                                id='direction-select'
                                className='form-control form-control-sm'
                                defaultValue='normal'
                                onChange={(e) => {
                                    const value = e.target.value !== 'normal';
                                    onParamChange('reverse', value);
                                }}>
                                <option value='normal'>Normal</option>
                                <option value='reverse'>Reverse</option>
                            </select>
                        </div>

                        {/* CURVE OVERFLOW */}
                        <label className='col-lg-2 col-3 col-form-label-sm' htmlFor='off-grid-select'>Overflow</label>
                        <div className='col-lg-3 col-9'>
                            <select
                                id='overflow-select'
                                className='form-control form-control-sm'
                                defaultValue='clamp'
                                onChange={(e) => {
                                    const value = e.target.value;
                                    onParamChange('overflow', value);
                                }}>
                                <option value='clamp'>Clamp</option>
                                <option value='project'>Project</option>
                            </select>
                        </div>

                    </div>

                </div>

                {/* CONDITIONAL ARC PARAMETERS */}
                {props.curve.type === 'arc' && <div className='form-group'>

                    {/* RADIUS */}
                    <div className='row'>

                        {/* RADIUS */}
                        <label className='col-lg-2 col-3 col-form-label-sm' htmlFor='type-select'>Radius</label>
                        <div className='col-lg-5 col-9'>
                            <SmartInput
                                labelWidth={.2}
                                label='r'
                                step={0.01}
                                maxDecimals={2}
                                defaultValue={props.curve.radius}
                                resetButton={true}
                                resetAction={() => {
                                    props.curve.setRadius();
                                    onParamChange('radius', props.curve.radius);
                                }}
                                handleChange={(value) => onParamChange('radius', value)}
                            />
                        </div>

                    </div>

                    {/* BOUNDS */}
                    <div className='row'>

                        {/* ANGLE START */}
                        <label className='col-lg-2 col-3 col-form-label-sm' htmlFor='type-select'>Range</label>
                        <div className='col-lg-5 col-9'>
                            <SmartInput
                                labelWidth={.2}
                                label={<>{String.fromCharCode(0xfeff0398)}<sub>0</sub></>}
                                step={0.01}
                                maxDecimals={2}
                                unitSymbol={String.fromCharCode(0x3c0)}
                                conversion={Math.PI}
                                defaultValue={props.curve.angleStart / Math.PI}
                                resetButton={true}
                                resetAction={() => {
                                    props.curve.setAngleStart();
                                    onParamChange('angleStart', props.curve.angleStart);
                                }}
                                handleChange={(value) => onParamChange('angleStart', value)}
                            />
                        </div>

                        {/* ANGLE END */}
                        <div className='col-lg-5 col-9 ml-auto'>
                            <SmartInput
                                labelWidth={.2}
                                label={<>{String.fromCharCode(0xfeff0398)}<sub>1</sub></>}
                                step={0.01}
                                maxDecimals={2}
                                unitSymbol={String.fromCharCode(0x3c0)}
                                conversion={Math.PI}
                                defaultValue={props.curve.angleEnd / Math.PI}
                                resetButton={true}
                                resetAction={() => {
                                    props.curve.setAngleEnd();
                                    onParamChange('angleEnd', props.curve.angleEnd);
                                }}
                                handleChange={(value) => onParamChange('angleEnd', value)}
                            />
                        </div>

                    </div>

                    {/* ANGLE OFFSET */}
                    <div className='row'>

                        {/* ANGLE START */}
                        <label className='col-lg-2 col-3 col-form-label-sm' htmlFor='type-select'>Offset</label>
                        <div className='col-lg-5 col-9'>
                            <SmartInput
                                labelWidth={.2}
                                label={String.fromCharCode(0xfeff0398)}
                                step={0.01}
                                maxDecimals={2}
                                unitSymbol={String.fromCharCode(0x3c0)}
                                conversion={Math.PI}
                                defaultValue={props.curve.angleOffset / Math.PI}
                                resetButton={true}
                                resetAction={() => {
                                    props.curve.setAngleOffset();
                                    onParamChange('angleOffset', props.curve.angleOffset);
                                }}
                                handleChange={(value) => onParamChange('angleOffset', value)}
                            />
                        </div>

                    </div>

                </div>}

                <div className='form-group'>

                    {/* TRANSLATION */}
                    <div className='row'>

                        {/* CURVE TYPE */}
                        <label className='col-lg-2 col-form-label-sm' htmlFor='type-select'>Translate</label>
                        <div className='col-lg-5 col-6'>
                            <SmartInput
                                labelWidth={.2}
                                label='X'
                                step={0.01}
                                maxDecimals={2}
                                defaultValue={props.curve.translation.x}
                                resetButton={true}
                                resetAction={() => {
                                    props.curve.setTranslateX();
                                    onParamChange('translateX', props.curve.translation.x);
                                }}
                                handleChange={(value) => onParamChange('translateX', value)}
                            />
                        </div>

                        <div className='col-lg-5 col-6'>
                            <SmartInput
                                labelWidth={.2}
                                label='Y'
                                step={0.01}
                                maxDecimals={2}
                                defaultValue={props.curve.translation.y}
                                resetButton={true}
                                resetAction={() => {
                                    props.curve.setTranslateY();
                                    onParamChange('translateY', props.curve.translation.y);
                                }}
                                handleChange={(value) => onParamChange('translateY', value)}
                            />
                        </div>

                    </div>

                    {/* SCALE */}
                    <div className='row'>

                        {/* CURVE TYPE */}
                        <label className='col-lg-2 col-form-label-sm' htmlFor='type-select'>Scale</label>
                        <div className='col-lg-5 col-6'>
                            <SmartInput
                                labelWidth={.2}
                                label='X'
                                step={0.01}
                                maxDecimals={2}
                                defaultValue={props.curve.scale.x}
                                resetButton={true}
                                resetAction={() => {
                                    props.curve.setScaleX();
                                    onParamChange('scaleX', props.curve.scale.x);
                                }}
                                handleChange={(value) => onParamChange('scaleX', value)}
                            />
                        </div>

                        <div className='col-lg-5 col-6'>
                            <SmartInput
                                labelWidth={.2}
                                label='Y'
                                step={0.01}
                                maxDecimals={2}
                                defaultValue={props.curve.scale.y}
                                resetButton={true}
                                resetAction={() => {
                                    props.curve.setScaleY();
                                    onParamChange('scaleY', props.curve.scale.y);
                                }}
                                handleChange={(value) => onParamChange('scaleY', value)}
                            />
                        </div>

                    </div>

                    {/* ROTATION */}
                    <div className='row'>
                        <label className='col-lg-2 col-form-label-sm' htmlFor='type-select'>Rotate</label>
                        <div className='col-lg-5 col-6'>
                            <SmartInput
                                labelWidth={.2}
                                label={String.fromCharCode(0xfeff0398)}
                                step={0.01}
                                maxDecimals={2}
                                unitSymbol={String.fromCharCode(0x3c0)}
                                conversion={Math.PI}
                                defaultValue={props.curve.rotation / Math.PI}
                                resetButton={true}
                                resetAction={() => {
                                    props.curve.setRotation();
                                    onParamChange('rotate', props.curve.rotation);
                                }}
                                handleChange={(value) => onParamChange('rotate', value)}
                            />
                        </div>
                    </div>

                </div>

            </form>

        </div>

    );

}

export default ChartControls;