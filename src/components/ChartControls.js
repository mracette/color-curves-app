// libs
import React, { useState } from 'react';
import ArcParams from './params/ArcParams';
import FunctionParams from './params/FunctionParams';

function ChartControls(props) {

    const [curveType, setCurveType] = useState(props.default);

    const options = { 
        geometries: [
            'arc'
        ],
        functions: [
            'linear',
            'polynomial',
            'quadratic',
            'cubic',
            'sinusoidal',
            'quadratic',
            'exponential',
            'circular',
            'elastic',
            'bounce'
        ]
    };

    return (
        <div className = 'chart-controls'>

            <p>Curve Type</p>

            <select
                value = {curveType}
                onChange = {(e) => {
                    const value = e.target.value;
                    setCurveType(value);
                }}>
                {<option disabled>──────────</option>}
                {
                    options.geometries.map((option) => {
                        return <option value = {option}>
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                        </option>;
                    })
                    
                }
                {<option disabled>──────────</option>}
                {
                    options.functions.map((option) => {
                        return <option value = {option}>
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                        </option>;
                    })
                }
                {<option disabled>──────────</option>}
            </select>

            {
                curveType === 'arc' 
                && 
                <ArcParams
                    handleUpdateCurve = { props.handleUpdateCurve }
                    handleDrawCurve = { props.handleDrawCurve }
                    curveType = { curveType }
                />
            }
            {
                options.functions.indexOf(curveType) !== -1 
                &&
                <FunctionParams
                    handleUpdateCurve = { props.handleUpdateCurve }
                    handleDrawCurve = { props.handleDrawCurve }
                    curveType = { curveType }
                />
            }

        </div>
    );

}

export default ChartControls;