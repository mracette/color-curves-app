// libs
import React, { useRef, useEffect } from 'react';

function Canvas(props) {

    const canvasRef = useRef(null);

    useEffect(() => {

        canvasRef.current.clientWidth !== 0 && (canvasRef.current.width = canvasRef.current.clientWidth);
        canvasRef.current.clientHeight !== 0 && (canvasRef.current.height = canvasRef.current.clientHeight);

        const listen = window.addEventListener('resize', () => {
            canvasRef.current.clientWidth !== 0 && (canvasRef.current.width = canvasRef.current.clientWidth);
            canvasRef.current.clientHeight !== 0 && (canvasRef.current.height = canvasRef.current.width);
            props.onResize !== undefined && props.onResize(canvasRef.current);
        })

        props.callback !== undefined && props.callback(canvasRef.current);

        return () => {
            window.removeEventListener('resize', listen);
        }

    }, [props.onResize, props.callback, canvasRef])

    return (
        <canvas
            id={props.id}
            className={props.className}
            ref={canvasRef}
        />
    );

}

export default Canvas;