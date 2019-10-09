// libs
import React, { useState, useRef } from 'react';

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

            // capture the movement and compare to startPosition
            const delta = parseFloat(e.clientX - startPosition);

            // multiply the delta by the step
            const stepDelta = delta * (props.step || 1);

            // get new value
            let newValue = props.fixedDecimals !== null ? 
                parseFloat((startValue + stepDelta).toFixed(props.fixedDecimals)) :
                parseFloat((startValue + stepDelta));

            // clamp if necessary
            if(props.min) newValue = Math.max(props.min, newValue);
            if(props.max) newValue = Math.min(props.max, newValue);

            // replace the current value
            inputRef.current.value = newValue;
            
            // send new value to the handler
            props.handleChange && props.handleChange(newValue);

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
                    display: 'table',
                    width: '100%',
                    height: '34px',
                    fontSize: '14px',
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
                    handleMouseDown(startPosition, startValue);
                }}
                style = {
                    (props.defaultStyles !== false) && {
                        cursor: 'ew-resize',
                        display: 'table-cell',
                        whiteSpace: 'nowrap',
                        width: '1px',
                        height: '100%',
                        padding: '6px 12px',
                        margin: '0',
                        backgroundColor: '#EEE',
                        borderTopLeftRadius: '4px',
                        borderBottomLeftRadius: '4px'
                }}
            >
                {props.label}
            </div>
            <div 
                style = {
                    (props.defaultStyles !== false) && {
                        display: 'table-cell',
                        padding: '0',
                        margin: '0',
                        border: 'none',
                        borderRadius: '4px'
                }}
            >
                <input 
                    ref = {inputRef}
                    onClick={handleClick}
                    onChange = {(e) => {
                        const value = parseFloat(e.target.value);
                        props.handleChange(value);
                    }}
                    defaultValue = {props.defaultValue || 0}
                    type = 'text'
                    style = {
                        (props.defaultStyles !== false) && {
                            display: 'inline-block',
                            padding: '6px 12px',
                            border: 'none',
                            borderRadius: '4px',
                            width: '100%',
                            height: '100%'
                    }}
                >
                </input>
            </div>
        </div>
    )

}

export default FunctionParams;