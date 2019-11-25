// libs
import React, { useState, useEffect, useRef } from 'react';

// components
import SmartInput from './smart-input/SmartInput';

function ExportHex(props) {

    const [hexArray, setHexArray] = useState([]);

    useEffect(() => {

        if (props.palette) {
            const hexArray = new Array(props.numStops).fill(null).map((d, i) => {
                return props.palette.hexValueAt((i + 0.5) / props.numStops);
            });
            setHexArray(hexArray);
        }

    }, [props.palette])

    return (<>

        <div className='row mt-3'>
            <div className='col-lg-4'>
                <SmartInput
                    labelWidth={.33}
                    label='Num'
                    step={1}
                    min={1}
                    max={256}
                    maxDecimals={0}
                    value={props.numStops}
                    handleChange={(value) => {
                        value = parseInt(value);
                        props.setNumStops(parseInt(value))
                        const hexArray = new Array(value).fill(null).map((d, i) => {
                            return props.palette.hexValueAt((i + 0.5) / value);
                        });
                        setHexArray(hexArray);
                    }}
                />
            </div>
        </div>

        <div className='row mt-3'>
            <div className='col-lg-12'>
                <p>All Hex Values:</p>
                <div className='code-block p-2'>
                    <code>{hexArray.join(', ')}</code>
                </div>
            </div>
        </div>

        <div className='row mt-3'>
            <div className='col-lg-12'>
                <p>
                    Single Hex Values:
                </p>
                <div className='col-lg-12'>
                    {hexArray && hexArray.map((d) => {
                        return (
                            <div className='row p-1'>
                                <div
                                    className='hex-square col-lg-1 col-6'
                                    style={{
                                        backgroundColor: d
                                    }}
                                />
                                <div className='col-lg-2 col-6'>
                                    {d}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>

    </>)

}

export default ExportHex;