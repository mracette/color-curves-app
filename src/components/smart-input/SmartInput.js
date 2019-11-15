// libs
import React, { useRef, useState } from 'react';

function FunctionParams(props) {

    const numberRegex = /^\s*[+-]?(\d+|\.\d+|\d+\.\d+|\d+\.)(e[+-]?\d+)?\s*$/
    const defaultInput = useRef(props.defaultValue);

    const inputRef = useRef(null);
    const [inputValue, setInputValue] = useState(defaultInput.current)
    const [prevInputValue, setPrevInputValue] = useState(defaultInput.current)

    const isValidInput = (value) => value.toString().match(numberRegex);

    const applyMaxDecimals = (num) => {
        if (typeof num === 'number' && typeof props.maxDecimals === 'number') {
            return Math.round(num * Math.pow(10, props.maxDecimals)) / Math.pow(10, props.maxDecimals);
        } else {
            return num;
        }
    }

    const sendValueToHandler = (value) => {
        // ensure handler exists
        if (props.handleChange) {
            // convert if necessary
            if (props.conversion) {
                props.handleChange(parseFloat(value * props.conversion));
            } else {
                props.handleChange(parseFloat(value));
            }
        }
    }

    const cleanInput = (value) => {
        if (isValidInput(value)) {
            return applyMaxDecimals(value);
        } else {
            return value;
        }
    }

    const handleClick = (e) => {
        e.preventDefault();
        const value = inputRef.current.value;
        inputRef.current.setSelectionRange(0, value.length);
    }

    const handleOnBlur = (currentValue) => {
        if (isValidInput(currentValue)) {
            sendValueToHandler(currentValue);
        } else {
            sendValueToHandler(prevInputValue);
            setInputValue(prevInputValue);
        }
    }

    const handleUserInput = (newValue) => {

        if (isValidInput(newValue)) {

            // send to change handler
            sendValueToHandler(newValue);

            // store this value as the last valid value
            setPrevInputValue(newValue);

            // always send to local state
            setInputValue(newValue);

        } else {

            // always send to local state
            setInputValue(newValue);

        }


    }

    const handleMouseOrTouchDown = (startPosition, startValue) => {

        // disable selections while the mouse is down
        document.onselectstart = () => false;

        const onMouseOrTouchMove = (e) => {

            const x = e.clientX || e.touches[0].clientX;

            // capture the movement and compare to startPosition
            const delta = parseFloat(x - startPosition);

            // multiply the delta by the step
            const stepDelta = delta * (props.step || 1);

            // get new value
            let newValue = startValue + stepDelta;

            handleUserInput(newValue);

        }

        document.onmousemove = (e) => onMouseOrTouchMove(e);
        document.ontouchmove = (e) => {
            console.log(e);
            console.log(startPosition);
            onMouseOrTouchMove(e)
        };

        // remove listeners
        document.onmouseup = () => {
            document.onselectstart = null;
            document.onmousemove = null;
        }

        document.ontouchend = () => {
            console.log('touchend');
            document.onselectstart = null;
            document.ontouchmove = null;
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
                    height: '1.9rem',
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
                    e.preventDefault();
                    const startPosition = parseFloat(e.clientX);
                    const startValue = parseFloat(inputRef.current.value);
                    handleMouseOrTouchDown(startPosition, startValue);
                }}
                onTouchStart={(e) => {
                    e.preventDefault();
                    const startPosition = parseFloat(e.touches[0].clientX);
                    const startValue = parseFloat(inputRef.current.value);
                    handleMouseOrTouchDown(startPosition, startValue);
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
                onBlur={(e) => {
                    const value = inputRef.current.value;
                    handleOnBlur(value);
                }}
                onChange={(e) => {
                    const value = e.target.value;
                    handleUserInput(value);
                }}
                value={cleanInput(inputValue)}
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
                    type="button"
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