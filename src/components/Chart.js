// libs
import React, { useEffect, useRef } from 'react';

// components
import ChartControls from './ChartControls';

// other
import drawEndPoints from '../drawing/drawEndPoints';
import { drawHsOrientation, drawLOrientation } from '../drawing/drawOrientation';
import { drawHsCurve, drawLCurve } from '../drawing/drawCurve';
import { drawHsChart, drawLChart } from '../drawing/drawBlankChart';

function Chart(props) {

    const canvasRef = useRef(null);

    const padding = .07;

    const updateCurve = () => {

        switch (props.curve.surface.type) {

            case 'unitCircle':
                drawHsChart(props.curve, canvasRef.current, padding);
                drawHsCurve(props.curve, canvasRef.current, padding);
                drawHsOrientation(props.curve, canvasRef.current, padding);
                drawEndPoints(props.curve, canvasRef.current, padding);
                break;

            case 'unitSquare':
                drawLChart(props.curve, canvasRef.current, padding);
                drawLCurve(props.curve, canvasRef.current, padding);
                drawLOrientation(props.curve, canvasRef.current, padding);
                drawEndPoints(props.curve, canvasRef.current, padding);
                break;

        }

        props.updatePalettes();

    }

    useEffect(() => {
        canvasRef.current.width = canvasRef.current.clientWidth;
        canvasRef.current.height = canvasRef.current.width;
        updateCurve();

        const listen = window.addEventListener('resize', () => {
            canvasRef.current.width = canvasRef.current.clientWidth;
            canvasRef.current.height = canvasRef.current.width;
            updateCurve();
        })

        return () => {
            window.removeEventListener('resize', listen);
        }

    }, [])

    useEffect(() => {

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