// libs
import React, { useEffect, useRef, useState, useCallback } from 'react';

// components
import ChartControls from './ChartControls';
import Canvas from './Canvas';

// other
import { HSLChart } from '../drawing/HSLChart';

function Chart(props) {

    const [paletteNeedsUpdate, setPaletteNeedsUpdate] = useState(false);
    const [chartCanvas, setChartCanvas] = useState(null);
    const [hslChart, setHslChart] = useState(null);

    // painful but necessary due to shallow compare of props.curve
    const [translateX, setTranslateX] = useState(props.curve.translation.x);
    const [translateY, setTranslateY] = useState(props.curve.translation.y);
    const [scaleX, setScaleX] = useState(props.curve.scale.x);
    const [scaleY, setScaleY] = useState(props.curve.scale.y);
    const [rotation, setRotation] = useState(props.curve.rotation);

    const updateCurve = () => {
        hslChart && hslChart.update();
    }

    const onParamChange = useCallback((param, value) => {

        switch (param) {
            case 'angleStart': props.curve.setAngleStart(value); break;
            case 'angleEnd': props.curve.setAngleEnd(value); break;
            case 'angleOffset': props.curve.setAngleOffset(value); break;
            case 'variation': props.curve.setVariation(value); break;
            case 'translateX': props.curve.setTranslateX(value); setTranslateX(props.curve.translation.x); break;
            case 'translateY': props.curve.setTranslateY(value); setTranslateY(props.curve.translation.y); break;
            case 'scaleX': props.curve.setScaleX(value); setScaleX(props.curve.scale.x); break;
            case 'scaleY': props.curve.setScaleY(value); setScaleY(props.curve.scale.y); break;
            case 'rotate': props.curve.setRotation(value); setRotation(props.curve.rotation); break;
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
        props.updatePalettes();

    }, [props.updatePalettes, props.curve]);

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

                    // add new
                    chartCanvas.addEventListener('mousemove', mouseMoveUp);
                }

                // add new 
                document.addEventListener('mousemove', mouseMoveDown);
                document.addEventListener('mouseup', mouseUp);
            }

            chartCanvas.removeEventListener('mousemove', mouseMoveUp);
            mouseMoveDownClosure();

        }

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

    }, [chartCanvas, onParamChange]);

    useEffect(() => {
        if (paletteNeedsUpdate) {
            props.updatePalettes(props.paletteType);
            setPaletteNeedsUpdate(false);
        }
    }, [paletteNeedsUpdate, props.paletteType, props.updatePalettes])

    return (

        <div className='chart col-md-6'>

            <div className='material-static chart-wrapper'>

                <div className='row border-bottom'>

                    <div className='col-md-12'>

                        <h2>{props.title}</h2>

                    </div>

                </div>

                <ChartControls
                    section="top"
                    chartType={props.chartType}
                    config={props.config}
                    curve={props.curve}
                    setCurve={props.setCurve}
                    onParamChange={onParamChange}
                />

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
                    section="bottom"
                    chartType={props.chartType}
                    config={props.config}
                    curve={props.curve}
                    setCurve={props.setCurve}
                    onParamChange={onParamChange}
                    translateX={translateX}
                    translateY={translateY}
                    scaleX={scaleX}
                    scaleY={scaleY}
                    rotation={rotation}
                />

            </div>

        </div>

    );

}

export default Chart;