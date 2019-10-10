// libs
import React, { useState, useEffect } from 'react';

// components
import ArcParams from './params/ArcParams';
import FunctionParams from './params/FunctionParams';

function ChartControls(props) {

    const getCurveType = (chartType) => {
        if(chartType === 'hs') {
            return props.palette.getHsCurveType();
        } else {
            return props.palette.getLCurveType();
        }
    }

    const getCurve = (chartType) => {
        if(chartType === 'hs') {
            return props.palette.hsCurve;
        } else {
            return props.palette.lCurve;
        }
    }
    
    const [curveType, setCurveType] = useState(
        getCurveType(props.chartType)
    );

    const [curve, setCurve] = useState(
        getCurve(props.chartType)
    )

    return (

        <div className = 'chart-control row'>

            <div className = 'col-sm-12'>

                <div className = 'row'>
                    <div className = 'col-sm-2'/>
                    <div className = 'col-sm-10'>
                        <h3>Curve</h3>
                    </div>
                </div>


                <div className = 'row'>

                    <div className = 'col-sm-2'>
                        <h4>
                            <label for = 'type-select'>
                                Type
                            </label>
                        </h4> 
                    </div>

                    <div className = 'col-sm-10'>

                        <select
                            id = {'variation-select'}
                            className = {'form-control'}
                            defaultValue = {curveType}
                            onChange = {(e) => {

                                const value = e.target.value;

                                // update the palette with the new curve
                                if(props.chartType === 'hs') {
                                    props.palette.setHsCurve(value);
                                } else if (props.chartType === 'l') {
                                    props.palette.setLCurve(value);
                                }

                                // update curve type
                                setCurveType(value);

                                // update curve
                                setCurve(getCurve(props.chartType));

                                // redraw the curve
                                props.updateCurve();

                            }}>
                        
                        
                            (<> 
                            {props.config.map((group, i) => {
                                return group.options.map((option, j) => {
                                    if(j === 0) {
                                        return (<>
                                            <option key = {`${i}${j}`} disabled>──────────</option>
                                            <option key = {option.id} value = {option.id}>{option.display}</option>
                                        </>);
                                    } else {
                                        return (
                                            <option key = {option.id} value = {option.id}>{option.display}</option>
                                        );
                                    }
                                })
                            })} 
                            <option disabled>──────────</option>
                            </>)
            
                        </select>

                    </div>

                </div>

                {
                    curveType === 'arc' 
                    && 
                    <ArcParams
                        chartType = {props.chartType}
                        curveType = {curveType}
                        curve = {curve}
                        updateCurve = { props.updateCurve }
                    />
                }
                {
                    (
                    curveType === 'linear' ||
                    curveType === 'polynomial' ||
                    curveType === 'sinusoidal' ||
                    curveType === 'exponential' ||
                    curveType === 'elastic' ||
                    curveType === 'back' ||
                    curveType === 'bounce'
                    ) &&
                    <FunctionParams
                        chartType = {props.chartType}
                        curveType = {curveType}
                        curve = {curve}
                        updateCurve = { props.updateCurve }
                    />
                }

            </div>

        </div>

    );

}

export default ChartControls;