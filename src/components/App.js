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

  const [darkMode, setDarkMode] = useState(false);
  const [nav, setNav] = useState('editor');
  const [appPalette, setAppPalette] = useState(null);

  return (<>

    <div className = 'container' id = 'app'>

      <div className = 'row' id = 'header'>

        <div className = 'col-md-12'>
          <h1>Color Curves</h1>
        </div>

      </div>
      
      <ul className="nav nav-pills">

        <li className="nav-item">
          <button id = "editor-button" className={`nav-link ${nav === 'editor' ? 'active' : ''}`} onClick = {() => setNav('editor')}>Editor</button>
        </li>

        <li className="nav-item">
          <button id="presets-button" className={`nav-link ${nav === 'presets' ? 'active' : ''}`} onClick = {() => setNav('presets')}>Presets</button>
        </li>

        <li className="nav-item">
          <button id="about-button" className={`nav-link ${nav === 'about' ? 'active' : ''}`} onClick = {() => setNav('about')}>About</button>
        </li>

        <li className="d-flex align-items-middle  ">
          <form className = 'm-auto'>
          <div className="custom-control custom-switch">
            <input 
              type="checkbox" 
              id='dark-mode-switch'
              className="custom-control-input" 
              defaultChecked = {darkMode} 
              onChange = {(e) => {
                const value = e.target.checked;
                setDarkMode(value)
              }}
            />
            <label className="custom-control-label" htmlFor="dark-mode-switch">Dark Mode</label>
          </div>
          </form>
        </li>

      </ul>

      <div className="tab-content">

        <div className={`tab-pane fade ${nav === 'editor' ? 'show active' : ''}`} id="home" role="tabpanel" aria-labelledby="editor-button">
          <Editor
            setAppPalette = {setAppPalette}
          />
        </div>

        <div className={`tab-pane fade ${nav === 'presets' ? 'show active' : ''}`} id="presets" role="tabpanel" aria-labelledby="presets-button">
          <Presets
            setAppPalette = {setAppPalette}
          />
        </div>

        <div className={`tab-pane fade ${nav === 'about' ? 'show active' : ''}`} id="about" role="tabpanel" aria-labelledby="about-button">
          about
        </div>

      </div>

    </div>

  </>);

}

export default App;
