// libs
import React from 'react';

// components
import PolarChart from './PolarChart';
import CartesianChart from './CartesianChart';

function Editor() {

  return (

    <div id = 'editor'>

        <h2>Editor</h2>

            <div id = 'charts'>

                <PolarChart />

                <CartesianChart />

            </div>

    </div>
    
  );

}

export default Editor;