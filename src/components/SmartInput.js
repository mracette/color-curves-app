// libs
import React, { useRef } from 'react';

function FunctionParams(props) {

    const inputRef = useRef(null);

    const handleClick = (e) => {
        e.preventDefault();
        const value = inputRef.current.value;
        inputRef.current.setSelectionRange(0, value.length);
    }

    const handleMouseDown = (startPosition, startValue) => {

        // disable selections while the mouse is down
        document.onselectstart = () => false;

        document.onmousemove = (e) => {

            // convert the value to float
            startValue = parseFloat(startValue);

            // capture the movement and compare to startPosition
            const delta = parseFloat(e.clientX - startPosition);

            // multiply the delta by the step
            const stepDelta = delta * (props.step || 1);

            // get new value
            let newValue = startValue + stepDelta;

            // clamp if necessary
            if(props.min !== undefined) newValue = Math.max(props.min, newValue);
            if(props.max !== undefined) newValue = Math.min(props.max, newValue);

            // send the value to the handler
            props.handleChange && props.handleChange(newValue);

            // replace the current value with the new raw or converted version
            if(props.conversion !== undefined) {
                newValue /= props.conversion;
            }

            // truncate if necessary
            props.fixedDecimals !== undefined && (newValue = newValue.toFixed(props.fixedDecimals));

            // send to input
            inputRef.current.value = newValue + (props.unitSymbol || "");

        }
            
        // remove listeners
        document.onmouseup = () => {
            document.onselectstart = null;
            document.onmousemove = null;
        }
    }

    return (    
        <div 
            className = 'smart-input'
            style = {
                (props.defaultStyles !== false) && {
                    display: 'flex',
                    flexFlow: 'row nowrap',
                    alignItems: 'center',
                    height: '2rem',
                    width: '100%',
                    color: '#555',
                    backgroundColor: '#FFF',
                    border: '1px solid #CCC',
                    borderRadius: '4px'
            }}
        >
            <div
                className = 'smart-input-label'
                onMouseDown = {(e) => {
                    const startPosition = e.clientX;
                    const startValue = parseFloat(inputRef.current.value);
                    if(props.conversion !== undefined) {
                        handleMouseDown(startPosition, startValue * props.conversion);
                    } else {
                        handleMouseDown(startPosition, startValue);
                    }
                }}
                style = {
                    (props.defaultStyles !== false) && {
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        flex: '0 1 auto',
                        height: '100%',
                        cursor: 'ew-resize',
                        fontSize: '0.875rem',
                        padding: '0px 12px',
                        margin: '0',
                        backgroundColor: '#EEE',
                        borderTopLeftRadius: '4px',
                        borderBottomLeftRadius: '4px'
                }}
            >
                <span>
                    {props.label}
                </span>
            </div>
            <input
                className = 'smart-input-text'
                ref = {inputRef}
                onClick={handleClick}
                onChange = {(e) => {
                    let value = e.target.value;
                    if(props.conversion !== undefined) {
                        props.handleChange(value * props.conversion);
                    } else {
                        props.handleChange(value);
                    }
                }}
                defaultValue = {props.unitSymbol ? props.defaultValue + props.unitSymbol : (props.defaultValue || 0)}
                type = 'text'
                style = {
                    (props.defaultStyles !== false) && {
                        flex: '1 1 auto',
                        width: '100%',
                        height: '100%',
                        fontSize: '0.875rem',
                        padding: '0px 12px',
                        margin: '0',
                        border: 'none',
                        borderRadius: '4px'
                }}
            >
            </input>
        </div>
    )

}

export default FunctionParams;