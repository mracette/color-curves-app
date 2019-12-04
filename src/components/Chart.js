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
    const [mousePos, setMousePos] = useState([null, null]);

    // always update palette with chart
    const updateCurve = () => {
        hslChart && hslChart.update()
        props.updatePalettes && props.updatePalettes();
    }

    const updateMousePos = (e) => {
        const event = e;
        const rect = chartCanvas.getBoundingClientRect();
        const canvasX = event.clientX - rect.left;
        const canvasY = event.clientY - rect.top;
        hslChart.updateMousePos(canvasX, canvasY);
    }

    // create a new chart class for each canvas/curve combination
    useEffect(() => {
        chartCanvas && setHslChart(new HSLChart(chartCanvas, props.curve, props.curve.surface.type));
    }, [chartCanvas, props.curve]);

    // update the chart class and palettes when dependencies change
    useEffect(() => {
        updateCurve();
    }, [updateCurve])


    useEffect(() => {

        const addMouseMove = () => {
            window.addEventListener('mousemove', updateMousePos);
        }

        const removeMouseMove = () => {
            window.removeEventListener('mousemove', updateMousePos);
        }

        // require named functions to be removed later
        chartCanvas && chartCanvas.addEventListener('mouseenter', addMouseMove)
        chartCanvas && chartCanvas.addEventListener('mouseleave', removeMouseMove);

        // cleanup
        return (() => {
            chartCanvas && chartCanvas.removeEventListener('mouseenter', addMouseMove);
            chartCanvas && chartCanvas.removeEventListener('mouseleave', removeMouseMove);
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
                />

            </div>

        </div>

    );

}

export default Chart;