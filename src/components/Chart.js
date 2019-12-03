// libs
import React, { useEffect, useRef, useState } from 'react';

// components
import ChartControls from './ChartControls';

// other
import { HSLChart } from '../drawing/HSLChart';
import drawEndPoints from '../drawing/drawEndPoints';
import { drawHsOrientation, drawLOrientation } from '../drawing/drawOrientation';
import { drawHsCurve, drawLCurve } from '../drawing/drawCurve';
import { drawHsChart, drawLChart } from '../drawing/drawBlankChart';

function Chart(props) {

    const padding = .07;
    const canvasRef = useRef(null);

    const [chartClass, setChartClass] = useState(
        new HSLChart(canvasRef.current, props.curve, props.curve.surface.type, padding)
    );
    const [canvasCoords, setCanvasCoords] = useState({ x: null, y: null });


    const updateCurve = () => {

        switch (props.curve.surface.type) {

            case 'unitCircle':
                chartClass.drawBlankChart();
                // drawHsChart(props.curve, canvasRef.current, padding);
                drawHsCurve(props.curve, canvasRef.current, padding);
                // drawHsOrientation(props.curve, canvasRef.current, padding);
                // drawEndPoints(props.curve, canvasRef.current, padding);
                break;

            case 'unitSquare':
                drawLChart(props.curve, canvasRef.current, padding);
                drawLCurve(props.curve, canvasRef.current, padding);
                // drawLOrientation(props.curve, canvasRef.current, padding);
                // drawEndPoints(props.curve, canvasRef.current, padding);
                break;

        }

        props.updatePalettes();

    }

    const getChartCoords = (e) => {

        const clientX = e.clientX;
        const clientY = e.clientY;

        const chartWidth = canvasRef.current.clientWidth * (1 - padding * 2);
        const chartHeight = canvasRef.current.clientHeight * (1 - padding * 2);

        const chartPaddingX = canvasRef.current.clientWidth * padding;
        const chartPaddingY = canvasRef.current.clientHeight * padding;

        console.log(clientX, clientY, canvasRef.current.width, chartPaddingY);

        // const rect = canvasRef.current.getBoundingClientRect();
        // const canvasX = clientX - rect.left - chartPaddingX;
        // const canvasY = clientY - rect.top - chartPaddingY;

        // setCanvasCoords({ x: canvasX / chartWidth, y: canvasY / chartHeight });

    }

    useEffect(() => {

        canvasRef.current.width = canvasRef.current.clientWidth;
        canvasRef.current.height = canvasRef.current.width;

        const listen = window.addEventListener('resize', () => {
            canvasRef.current.width = canvasRef.current.clientWidth;
            canvasRef.current.height = canvasRef.current.width;
            updateCurve();
        })


        const mouseEnter = canvasRef.current.addEventListener('mouseenter', () => {
            window.addEventListener('mousemove', getChartCoords);
        })

        const mouseLeave = canvasRef.current.addEventListener('mouseleave', () => {
            window.removeEventListener('mousemove', getChartCoords);
        })

    }, [])

    useEffect(() => {

        setChartClass(new HSLChart(canvasRef.current, props.curve, props.curve.surface.type, padding));
        updateCurve();

    }, [props.curve]);

    return (

        <div className='chart col-md-6'>

            <div className='material-static chart-wrapper'>

                <div className='row border-bottom'>

                    <div className='col-md-12'>

                        <h2>{props.title}</h2>

                    </div>

                </div>

                <ChartControls
                    chartType={props.chartType}
                    config={props.config}
                    curve={props.curve}
                    setCurve={props.setCurve}
                    updateCurve={updateCurve}
                    canvasCoords={canvasCoords}
                />

                <div className='row'>

                    <div className='col-md-12'>

                        <canvas
                            className='chart'
                            ref={canvasRef}
                        />

                    </div>

                </div>

            </div>

        </div>

    );

}

export default Chart;