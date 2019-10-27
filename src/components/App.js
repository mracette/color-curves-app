// libs
import React, { useState, useRef, useEffect } from 'react';
import ColorPalette from '../lib/js/ColorPalette';
import 'bootstrap';

// components
import Editor from './Editor'
import Presets from './Presets';

// styles
import '../styles/app.scss';

function App() {

  const canvasBanner = useRef(null);
  const bannerPalette = new ColorPalette({type: "arc", radius: 0.50000, angleStart: 0.00000, angleEnd: 6.28319, angleOffset: 0.00000, translation: {x: 0.00000, y: 0.00000}, }, {type: "arc", radius: 0.25000, angleStart: 0.00000, angleEnd: 6.28319, angleOffset: 0.00000, translation: {x: 0.50000, y: 0.50000}, }, { paletteStart: 0, paletteEnd: 1 });

  useEffect(() => {
    canvasBanner.current && bannerPalette.drawDiscretePalette(canvasBanner.current, 24);
  }, [canvasBanner])

  // const [theme, setTheme] = useState('light');
  const [nav, setNav] = useState('editor');

  // Listen to tab events to enable outlines (accessibility improvement)
  // See: https://jmperezperez.com/outline-focus-ring-a11y/
  // Let me know if you have a better solution!

  document.body.addEventListener('keyup', function(e) {
    if (e.which === 9) /* tab */ {
      document.getElementById('app').classNameList.remove('no-focus-outline');
    }
  })

  document.body.classList.add('bg-light');

  return (<>

    <canvas id = 'canvas-banner' ref = {canvasBanner}/>

    <div className = 'container' id = 'app'>

      <div className = 'row' id = 'header'>

        <div className = 'col-md-12'>
          <h1>Color Curves</h1>
        </div>

      </div>
      
      <ul className="nav nav-pills">
        <li className="nav-item">
          <button className={`nav-link ${nav === 'editor' ? 'active' : ''}`} onClick = {() => setNav('editor')}>Editor</button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${nav === 'presets' ? 'active' : ''}`} onClick = {() => setNav('presets')}>Presets</button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${nav === 'about' ? 'active' : ''}`} onClick = {() => setNav('about')}>About</button>
        </li>
      </ul>

      <div className="tab-content">
        <div className={`tab-pane fade ${nav === 'editor' ? 'show active' : ''}`} id="home" role="tabpanel" aria-labelledby="home-tab">
          <Editor/>
        </div>
        <div className={`tab-pane fade ${nav === 'presets' ? 'show active' : ''}`} id="presets" role="tabpanel" aria-labelledby="home-tab">
          <Presets/>
        </div>
        <div className={`tab-pane fade ${nav === 'about' ? 'show active' : ''}`} id="about" role="tabpanel" aria-labelledby="home-tab">
          about
        </div>
      </div>

    </div>

  </>);

}

export default App;
