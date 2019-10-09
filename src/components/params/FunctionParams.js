// libs
import React, { useState, useEffect } from 'react';

// components
import SmartInput from '../SmartInput';

// bootstrap
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';

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

        <Row className = 'params'>

            <Col sm={2}>
                <Form.Label><h4>Variation</h4></Form.Label>
            </Col>

            <Col sm={4}>
                <Form.Control 
                    as='select' 
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
                </Form.Control>
            </Col>

            <Col sm={2}>
                <Form.Label><h4>Reverse</h4></Form.Label>
            </Col>

            <Col sm={4}>
                <Form.Control 
                    as='select' 
                    defaultValue = {params.reverse.toString()}
                    onChange = {(e) => {
                        const value = e.target.value === 'true';
                        onParamChange('reverse', value);
                    }}>
                    <option value = 'true'>True</option>
                    <option value = 'false'>False</option>
                </Form.Control>
            </Col>
        
        </Row>

        <Row classname = 'params'>

            <Col sm={2}>
                <Form.Label><h4>Translation</h4></Form.Label>
            </Col>
            
            <Col sm={5}>
                <SmartInput
                    label = 'X'
                    step = {0.01}
                    fixedDecimals = {2}
                    defaultValue = {props.curve.translation.x.toPrecision(2)}
                    handleChange = {(value) => onParamChange('translateX', value)}
                />
            </Col>

            <Col sm={5}>
                <SmartInput
                    label = 'Y'
                    step = {0.01}
                    fixedDecimals = {2}
                    defaultValue = {props.curve.translation.y.toPrecision(2)}
                    handleChange = {(value) => onParamChange('translateY', value)}
                />
            </Col>

        </Row>

        <Row classname = 'params'>

            <Col sm={2}>
                <Form.Label><h4>Scale</h4></Form.Label>
            </Col>
            
            <Col sm={5}>
                <SmartInput
                    label = 'X'
                    step = {0.01}
                    fixedDecimals = {2}
                    defaultValue = {props.curve.scale.x.toPrecision(2)}
                    handleChange = {(value) => onParamChange('scaleX', value)}
                />
            </Col>

            <Col sm={5}>
                <SmartInput
                    label = 'Y'
                    step = {0.01}
                    fixedDecimals = {2}
                    defaultValue = {props.curve.scale.y.toPrecision(2)}
                    handleChange = {(value) => onParamChange('scaleY', value)}
                />
            </Col>

        </Row>            

    </>);

}

export default FunctionParams;