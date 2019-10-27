// libs
import React, { useRef } from 'react';

function FunctionParams(props) {

    const inputRef = useRef(null);

    const applyMaxDecimals = (num, decimals) => {
        return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
    }

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

            // truncate if necessary. this solution will use 
            typeof props.maxDecimals === 'number' && (newValue = applyMaxDecimals(newValue, props.maxDecimals));

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
                    backgroundColor: 'hsl(0, 0%, 97%)',
                    // border: '1px solid #CCC',
                    border: 'none',
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
                className = 'smart-input-text'
                ref = {inputRef}
                onClick={handleClick}
                onChange = {(e) => {
                    let value = e.target.value;

                    // if the input isn't a number, skip the handler
                    if(props.conversion !== undefined) {
                        props.handleChange(value * props.conversion);
                    } else {
                        props.handleChange(value);
                    }

                }}
                value = {
                    props.unitSymbol ? (
                        props.maxDecimals ? 
                            applyMaxDecimals(props.defaultValue, props.maxDecimals) + props.unitSymbol :
                            props.defaultValue + props.unitSymbol
                            ) : (
                        props.maxDecimals ? 
                            applyMaxDecimals(props.defaultValue, props.maxDecimals) :
                            props.defaultValue
                            )
                }
                type = 'text'
                style = {
                    (props.defaultStyles !== false) && {
                        flex: '0 1 auto',
                        width: '100%',
                        fontSize: '0.875rem',
                        padding: '0px 12px',
                        margin: '0',
                        border: 'none',
                        backgroundColor: 'hsl(0, 0%, 97%)',
                        borderRadius: '4px'
                }}
            >
            </input>
            {props.resetButton && 
                <button
                    onClick = {(e) => {
                        e.preventDefault();
                        props.resetAction && props.resetAction();
                    }}
                    style = {
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