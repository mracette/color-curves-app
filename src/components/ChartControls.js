// libs
import React from 'react';

// components
import SmartInput from './smart-input/SmartInput';

function ChartControls(props) {

    const onCurveChange = (newCurveType) => {

        props.setCurve(newCurveType);

    }

    return (

        <div id='chart-controls' className='col-12'>

            {/* FORM */}
            {props.section === 'top' && (<form>

                <div className='form-group'>

                    {/* CURVE OPTIONS LINE 1 */}
                    <div className='row'>

                        {/* CURVE TYPE */}
                        <label className='col-lg-2 col-3 col-form-label-sm' htmlFor='type-select'>Curve</label>
                        <div className='col-lg-5 col-9'>
                            <select
                                id='type-select'
                                className='form-control form-control-sm'
                                value={props.curve.type}
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
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        props.onParamChange('variation', value);
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
                                    value={props.curve.exponent}
                                    resetButton={true}
                                    resetAction={() => props.onParamChange('exponent')}
                                    handleChange={(value) => props.onParamChange('exponent', value)}
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
                                    value={props.curve.overshoot}
                                    resetButton={true}
                                    resetAction={() => { props.onParamChange('overshoot') }}
                                    handleChange={(value) => props.onParamChange('overshoot', value)}
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
                                    value={props.curve.amplitude}
                                    resetButton={true}
                                    resetAction={() => { props.onParamChange('amplitude') }}
                                    handleChange={(value) => props.onParamChange('amplitude', value)}
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
                                    value={props.curve.period}
                                    resetButton={true}
                                    resetAction={() => { props.onParamChange('period') }}
                                    handleChange={(value) => props.onParamChange('period', value)}
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
                                onChange={(e) => {
                                    const value = e.target.value === 'reverse';
                                    props.onParamChange('reverse', value);
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
                                onChange={(e) => {
                                    const value = e.target.value;
                                    props.onParamChange('overflow', value);
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
                                value={props.curve.radius}
                                resetButton={true}
                                resetAction={() => { props.onParamChange('radius', props.curve.radius) }}
                                handleChange={(value) => props.onParamChange('radius', value)}
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
                                value={props.curve.angleStart / Math.PI}
                                resetButton={true}
                                resetAction={() => { props.onParamChange('angleStart') }}
                                handleChange={(value) => props.onParamChange('angleStart', value)}
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
                                value={props.curve.angleEnd / Math.PI}
                                resetButton={true}
                                resetAction={() => { props.onParamChange('angleEnd') }}
                                handleChange={(value) => props.onParamChange('angleEnd', value)}
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
                                value={props.curve.angleOffset / Math.PI}
                                resetButton={true}
                                resetAction={() => { props.onParamChange('angleOffset') }}
                                handleChange={(value) => props.onParamChange('angleOffset', value)}
                            />
                        </div>

                    </div>

                </div>}

            </form>)}


            {props.section === 'bottom' && (<form>
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
                                value={props.translateX}
                                resetButton={true}
                                updateAfterReset={false}
                                resetAction={() => { props.onParamChange('translateX') }}
                                handleChange={(value) => props.onParamChange('translateX', value)}
                            />
                        </div>

                        <div className='col-lg-5 col-6'>
                            <SmartInput
                                labelWidth={.2}
                                label='Y'
                                step={0.01}
                                maxDecimals={2}
                                value={props.translateY}
                                resetButton={true}
                                updateAfterReset={false}
                                resetAction={() => { props.onParamChange('translateY') }}
                                handleChange={(value) => props.onParamChange('translateY', value)}
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
                                value={props.scaleX}
                                resetButton={true}
                                updateAfterReset={false}
                                resetAction={() => { props.onParamChange('scaleX') }}
                                handleChange={(value) => props.onParamChange('scaleX', value)}
                            />
                        </div>

                        <div className='col-lg-5 col-6'>
                            <SmartInput
                                labelWidth={.2}
                                label='Y'
                                step={0.01}
                                maxDecimals={2}
                                value={props.scaleY}
                                resetButton={true}
                                updateAfterReset={false}
                                resetAction={() => { props.onParamChange('scaleY') }}
                                handleChange={(value) => props.onParamChange('scaleY', value)}
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
                                value={props.rotation / Math.PI}
                                resetButton={true}
                                updateAfterReset={false}
                                resetAction={() => { props.onParamChange('rotate') }}
                                handleChange={(value) => props.onParamChange('rotate', value)}
                            />
                        </div>
                    </div>

                </div>

            </form>)}

        </div >

    );

}

export default ChartControls;