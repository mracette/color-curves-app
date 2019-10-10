// libs
import React, { useState } from 'react';
import 'bootstrap';

// components
import Editor from './Editor'

// styles
import '../styles/app.scss';

function App() {

  const [theme, setTheme] = useState('light');
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

  return (

    <div className = 'container-fluid no-focus-outline' id = 'app' fluid = {true}>

      <div className = 'row' id = 'header'>

      <div className = 'col-md-12'>
        <h1>Color Curves</h1>
      </div>

      <div className = 'col-md-12'>
        <p className = 'lead'>
          Create unique color palettes by overlaying curves onto the HSL color space.
        </p>
      </div>

      </div>
      
      <ul className="nav nav-pills">
        <li className="nav-item">
          <a className={`nav-link ${nav === 'editor' ? 'active' : ''}`} onClick = {() => setNav('editor')}>Editor</a>
        </li>
        <li className="nav-item">
          <a className={`nav-link ${nav === 'presets' ? 'active' : ''}`} onClick = {() => setNav('presets')}>Presets</a>
        </li>
        <li className="nav-item">
          <a className={`nav-link ${nav === 'about' ? 'active' : ''}`} onClick = {() => setNav('about')}>About</a>
        </li>
      </ul>

      <div className="tab-content">
        <div className={`tab-pane fade ${nav === 'editor' ? 'show active' : ''}`} id="home" role="tabpanel" aria-labelledby="home-tab">
          <Editor/>
        </div>
        <div className={`tab-pane fade ${nav === 'presets' ? 'show active' : ''}`} id="home" role="tabpanel" aria-labelledby="home-tab">
          presets
        </div>
        <div className={`tab-pane fade ${nav === 'about' ? 'show active' : ''}`} id="home" role="tabpanel" aria-labelledby="home-tab">
          about
        </div>
      </div>

    </div>

  );

}

export default App;
