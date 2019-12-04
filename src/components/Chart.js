// libs
import React, { useEffect, useRef, useState } from 'react';

// components
import ChartControls from './ChartControls';
import Canvas from './Canvas';

// other
import { HSLChart } from '../drawing/HSLChart';

function Chart(props) {

    const [chartCanvas, setChartCanvas] = useState(null);
    const [hslChart, setHslChart] = useState(null);

    // always update palette with chart
    const updateCurve = () => {
        hslChart && hslChart.update()
        props.updatePalettes && props.updatePalettes();
    }

    const updateMousePos = (e, startX, startY) => {

        if (hslChart) {
            const event = e;
            const rect = chartCanvas.getBoundingClientRect();
            const canvasX = (event.clientX - rect.left) * window.devicePixelRatio || 1;
            const canvasY = (event.clientY - rect.top) * window.devicePixelRatio || 1;

            if (startX && startY) {
                startX = (startX - rect.left) * window.devicePixelRatio || 1;
                startY = (startY - rect.top) * window.devicePixelRatio || 1;
            }

            hslChart.updateMousePos(canvasX, canvasY, startX, startY);
        }
    }

    const onMouseOrTouchDown = (startX, startY) => {

        // disable selections while the mouse is down
        document.onselectstart = () => false;

        const listener = (e) => {
            updateMousePos(e, startX, startY);
        }

        document.addEventListener('mousemove', listener);
        document.addEventListener('touchmove', listener);

        document.addEventListener('mouseup', () => {
            document.onselectstart = null;
            document.removeEventListener('mousemove', listener);
        })

        document.addEventListener('touchend', () => {
            document.onselectstart = null;
            document.removeEventListener('touchmove', listener);
        })

    }

    const onParamChange = (param, value) => {

        switch (param) {
            case 'angleStart': props.curve.setAngleStart(value); break;
            case 'angleEnd': props.curve.setAngleEnd(value); break;
            case 'angleOffset': props.curve.setAngleOffset(value); break;
            case 'variation': props.curve.setVariation(value); break;
            case 'translateX': props.curve.setTranslateX(value); break;
            case 'translateY': props.curve.setTranslateY(value); break;
            case 'scaleX': props.curve.setScaleX(value); break;
            case 'scaleY': props.curve.setScaleY(value); break;
            case 'rotate': props.curve.setRotation(value); break;
            case 'reverse': props.curve.setReverse(value); break;
            case 'radius': props.curve.setRadius(value); break;
            case 'overflow': props.curve.setOverflow(value); break;
            case 'exponent': props.curve.setExponent(value); break;
            case 'overshoot': props.curve.setOvershoot(value); break;
            case 'amplitude': props.curve.setAmplitude(value); break;
            case 'period': props.curve.setPeriod(value); break;
            default: break;
        }

        // update clamping bounds
        if (props.curve.overflow === 'clamp') props.curve.setClampBounds();

        updateCurve();

    };

    // create a new chart class for each canvas/curve combination
    useEffect(() => {
        chartCanvas && setHslChart(new HSLChart(chartCanvas, props.curve, props.curve.surface.type, onParamChange));
    }, [chartCanvas, props.curve]);

    // update the chart class and palettes when dependencies change
    useEffect(() => {
        updateCurve();
    }, [updateCurve])


    useEffect(() => {

        document.addEventListener('mousemove', updateMousePos);

        document.addEventListener('mousedown', (e) => {
            document.removeEventListener('mousemove', updateMousePos);
            const startX = parseFloat(e.clientX);
            const startY = parseFloat(e.clientY);
            onMouseOrTouchDown(startX, startY);
        })

        document.addEventListener('mouseup', (e) => {
            document.addEventListener('mousemove', updateMousePos);
        })

    }, [chartCanvas, updateMousePos])

    return (

        <div className='chart col-md-6'>

            <div className='material-static chart-wrapper'>

                <div className='row border-bottom'>

                    <div className='col-md-12'>

                        <h2>{props.title}</h2>

                    </div>

                </div>

                <div className='row'>

                    <div className='col-md-12'>

                        <Canvas
                            className='chart'
                            onLoad={canvas => setChartCanvas(canvas)}
                            onResize={() => updateCurve()}
                            makeSquare={true}
                        />

                    </div>

                </div>

                <ChartControls
                    chartType={props.chartType}
                    config={props.config}
                    curve={props.curve}
                    setCurve={props.setCurve}
                    updateCurve={updateCurve}
                    onParamChange={onParamChange}
                />

            </div>

        </div>

    );

}

export default Chart;