// libs
import React, { useState } from 'react';
import ArcParams from './params/ArcParams';
import LinearParams from './params/LinearParams';

function ChartControls(props) {

    const [curveType, setCurveType] = useState(props.default);

    return (
        <div className = 'chart-controls'>

            <p>Curve Type</p>

            <select
                value = {curveType}
                onChange = {(e) => {
                    const value = e.target.value;
                    setCurveType(value);
                }}>
                <option value = 'arc'>Arc</option>
                <option value = 'linear-curve'>Curve: Linear</option>
            </select>

            {
                curveType === 'arc' && 
                <ArcParams
                    handleUpdateCurve = { props.handleUpdateCurve }
                    handleDrawCurve = { props.handleDrawCurve }
                />
            }
            {
                curveType === 'linear' && 
                <LinearParams
                    handleUpdateCurve = { props.handleUpdateCurve }
                    handleDrawCurve = { props.handleDrawCurve }
                />
            }

        </div>
    );

}

export default ChartControls;