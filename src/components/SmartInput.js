// libs
import React, { useRef, useState } from 'react';

function FunctionParams(props) {

    const numberRegex = /^\s*[+-]?(\d+|\.\d+|\d+\.\d+|\d+\.)(e[+-]?\d+)?\s*$/
    const defaultInput = useRef(props.defaultValue);

    const inputRef = useRef(null);
    const [inputValue, setInputValue] = useState(defaultInput.current)
    const [prevInputValue, setPrevInputValue] = useState(defaultInput.current)

    const applyMaxDecimals = (num, decimals) => {
        if (typeof decimals === 'number' && typeof num === 'number') {
            return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
        } else {
            return num;
        }
    }

    const handleClick = (e) => {
        e.preventDefault();
        const value = inputRef.current.value;
        inputRef.current.setSelectionRange(0, value.length);
    }

    const handleUserInput = (newValue) => {

        // clamp if necessary
        if (props.min !== undefined) newValue = Math.max(props.min, newValue);
        if (props.max !== undefined) newValue = Math.min(props.max, newValue);

        // truncate if necessary
        applyMaxDecimals(newValue, props.maxDecimals);

        // send truncated version to state
        setInputValue(newValue);

        // send the raw value to the handler if it is valid
        if (newValue.toString().match(numberRegex)) {

            props.handleChange && props.handleChange(parseFloat(newValue));

            // store this value as the last valid value
            setPrevInputValue(newValue);

        }

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
            let newValue = startValue + stepDelta;

            handleUserInput(newValue);

        }

        // remove listeners
        document.onmouseup = () => {
            document.onselectstart = null;
            document.onmousemove = null;
        }
    }

    return (
        <div
            className='smart-input border'
            style={
                (props.defaultStyles !== false) && {
                    display: 'flex',
                    flexFlow: 'row nowrap',
                    alignItems: 'center',
                    height: '2rem',
                    width: '100%',
                    color: '#555',
                    border: '1px solid #CCC',
                    border: 'none',
                    borderRadius: '4px'
                }}
        >
            <div
                className='smart-input-label'
                onMouseDown={(e) => {
                    const startPosition = parseFloat(e.clientX);
                    const startValue = parseFloat(inputRef.current.value);
                    if (props.conversion !== undefined) {
                        handleMouseDown(startPosition, startValue * props.conversion);
                    } else {
                        handleMouseDown(startPosition, startValue);
                    }
                }}
                style={
                    (props.defaultStyles !== false) && {
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexGrow: '0',
                        flexShrink: '0',
                        flexBasis: typeof props.labelWidth === 'number' ?
                            props.labelWidth * 100 + '%' :
                            props.labelWidth,
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
                className='smart-input-text'
                ref={inputRef}
                onClick={handleClick}
                onBlur={() => {
                    if (inputValue.toString().match(numberRegex)) {
                        props.handleChange && props.handleChange(applyMaxDecimals(parseFloat(inputValue)));
                    } else {
                        props.handleChange && props.handleChange(applyMaxDecimals(parseFloat(prevInputValue)));
                        setInputValue(applyMaxDecimals(prevInputValue));
                    }
                }}
                onChange={(e) => {
                    const value = e.target.value;
                    if (props.conversion !== undefined) {
                        handleUserInput(value * props.conversion);
                    } else {
                        handleUserInput(value);
                    }
                }}
                value={props.conversion ?
                    applyMaxDecimals(inputValue / props.conversion, props.maxDecimals) :
                    applyMaxDecimals(inputValue, props.maxDecimals)
                }
                type='text'
                style={
                    (props.defaultStyles !== false) && {
                        flex: '0 1 auto',
                        width: '100%',
                        height: '100%',
                        fontSize: '0.875rem',
                        padding: '0px 12px',
                        margin: '0',
                        border: 'none',
                        // backgroundColor: 'hsl(0, 0%, 97%)',
                        borderRadius: '4px'
                    }}
            >
            </input>
            {props.resetButton &&
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        props.resetAction && props.resetAction();
                        setInputValue(defaultInput.current);
                        setPrevInputValue(defaultInput.current);
                    }}
                    style={
                        (props.defaultStyles !== false) && {
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexGrow: '0',
                            flexShrink: '0',
                            flexBasis: '2rem',
                            height: '100%',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            padding: '0px 12px',
                            margin: '0',
                            border: 'none',
                            backgroundColor: '#EEE',
                            borderTopRightRadius: '4px',
                            borderBottomRightRadius: '4px'
                        }}
                >
                    {String.fromCharCode(0x21ba)}
                </button>
            }
        </div>
    )

}

export default FunctionParams;