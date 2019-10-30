// libs
import React from 'react';

function ExportJS(props) {

    return (<>

            <div className = 'row mt-3'>

                <div className = 'col-12 code-block p-2'>

                    <code>
                        {"import ColorPalette from 'colorcurves'"}
                    </code>

                </div>

            </div>

            <div className = 'row mt-1'>

                <div className = 'col-12 code-block p-2'>

                    <code>
                        {"const palette = new ColorPalette(" + props.palette.exportPaletteParams() + ");"}
                    </code>

                </div>

            </div>

            <div className = 'row mt-3 p-2'>

                <div className = 'col-12'>

                    For additional information on importing Color Curves, see documentation.

                </div>

            </div>

    </>)

}

export default ExportJS;