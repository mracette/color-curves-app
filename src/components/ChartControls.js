// libs
import React, { useState, useEffect } from 'react';

// components
import ArcParams from './params/ArcParams';
import FunctionParams from './params/FunctionParams';

// bootstrap
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';

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

        <Col sm = {12}>

            <Row>

                <Col sm = {12}>
                    <h3>Parameters</h3>
                </Col>

            </Row>

            <Row>

                <Col sm = {2}>
                    <Form.Label>
                        <h4>Type</h4>
                    </Form.Label>
                </Col>

                <Col sm = {4}>

                    <Form.Control 
                        as='select' 
                        id='curve-select'
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
                    >
                    
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
                    
                    </Form.Control>

                </Col>

            </Row>

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

        </Col>

    );

}

export default ChartControls;