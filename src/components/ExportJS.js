// libs
import React from 'react';

function ExportJS(props) {

    return (<>

        <div className='row mt-3'>

            <div className='col-12'>
                Import module
                </div>
            <div className='col-12 code-block p-2'>

                <code>

                    {"import { ColorPalette } from 'color-curves'"}<br /><br />
                    {"const palette = new ColorPalette(" + props.palette.exportPaletteParams() + ");"}

                </code>

            </div>

        </div>

        <div className='row mt-1'>

            <div className='col-12'>
                CommonJS
            </div>
            <div className='col-12 code-block p-2'>

                <code>
                    {`const ColorCurves = require('color-curves')`}<br /><br />
                    {"const palette = new ColorCurves.ColorPalette(" + props.palette.exportPaletteParams() + ");"}
                </code>

            </div>

        </div>

        <div className='row mt-1'>

            <div className='col-12'>
                HTML
                </div>
            <div className='col-12 code-block p-2'>

                <code>
                    {`<script src="http://unpkg.com/color-curves"></script>`}<br /><br />
                    {"const palette = new ColorCurves.ColorPalette(" + props.palette.exportPaletteParams() + ");"}
                </code>

            </div>

        </div>

        <div className='row mt-3 p-2'>

            <div className='col-12'>

                For additional information on importing Color Curves, see the <a href="https://github.com/mracette/color-curves-app">documentation</a>.

                </div>

        </div>

    </>)

}

export default ExportJS;