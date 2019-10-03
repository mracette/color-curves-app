// libs
import React, { useState } from 'react';
import ArcParams from '../components/ArcParams';

function ChartControls(props) {

    const [curveType, setCurveType] = useState('arc');

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
                    handleUpdateActiveCurve = { props.handleUpdateActiveCurve }
                    handleDrawCurve = { props.handleDrawCurve }
                />
            }

        </div>
    );

}

export default ChartControls;