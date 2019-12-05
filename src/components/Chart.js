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

    const onParamChange = (param, value) => {

        console.log('param change', props.curve.type)

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

    const setupListeners = (chart) => {

        const mouseMoveUp = (e) => {
            const rect = chartCanvas.getBoundingClientRect();
            const x = (e.clientX - rect.left) * window.devicePixelRatio || 1;
            const y = (e.clientY - rect.top) * window.devicePixelRatio || 1;
            chart.updateMousePos(x, y);
        }

        const mouseDown = (e) => {
            const mouseMoveDownClosure = () => {

                const rect = chartCanvas.getBoundingClientRect();
                const sx = (e.clientX - rect.left) * window.devicePixelRatio || 1;
                const sy = (e.clientY - rect.top) * window.devicePixelRatio || 1;

                const mouseMoveDown = (e) => {
                    const x = (e.clientX - rect.left) * window.devicePixelRatio || 1;
                    const y = (e.clientY - rect.top) * window.devicePixelRatio || 1;
                    chart.updateMousePos(x, y, sx, sy);
                }

                const mouseUp = (e) => {
                    document.removeEventListener('mousemove', mouseMoveDown);

                    // cleanup previous
                    // chartCanvas.removeEventListener('mousemove', mouseMoveUp);

                    // add new
                    chartCanvas.addEventListener('mousemove', mouseMoveUp);
                }

                // cleanup previous
                // document.removeEventListener('mousemove', mouseMoveDown);
                // document.removeEventListener('mousemove', mouseUp);

                // add new 
                document.addEventListener('mousemove', mouseMoveDown);
                document.addEventListener('mouseup', mouseUp);
            }

            chartCanvas.removeEventListener('mousemove', mouseMoveUp);
            mouseMoveDownClosure();

        }

        // cleanup previous
        // chartCanvas.removeEventListener('mousemove', mouseMoveUp);
        // chartCanvas.removeEventListener('mousedown', mouseDown);

        // add new
        chartCanvas.addEventListener('mousemove', mouseMoveUp);
        chartCanvas.addEventListener('mousedown', mouseDown);

    }

    // create a new chart class for each canvas/curve combination
    useEffect(() => {

        if (chartCanvas) {
            if (!hslChart) {
                const chart = new HSLChart(chartCanvas, props.curve, props.curve.surface.type, onParamChange)
                setHslChart(chart);
                setupListeners(chart);
                chart.update();
            } else {
                hslChart.setCurve(props.curve);
                hslChart.onParamChange = onParamChange;
                hslChart.update();
            }

        }

    }, [chartCanvas, props.curve, onParamChange]);

    // update the chart class and palettes when dependencies change
    useEffect(() => {
        updateCurve();
    }, [updateCurve])


    // useEffect(() => {

    //     document.addEventListener('mousemove', updateMousePos);

    //     document.addEventListener('mousedown', (e) => {
    //         document.removeEventListener('mousemove', updateMousePos);
    //         const startX = parseFloat(e.clientX);
    //         const startY = parseFloat(e.clientY);
    //         onMouseOrTouchDown(startX, startY);
    //     })

    //     document.addEventListener('mouseup', (e) => {
    //         document.addEventListener('mousemove', updateMousePos);
    //     })

    // }, [chartCanvas, updateMousePos])

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