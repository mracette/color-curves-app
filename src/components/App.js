// libs
import React, { useState, useRef, useEffect } from 'react';
import ColorPalette from '../lib/js/ColorPalette';
import 'bootstrap';

// components
import Editor from './Editor'
import Presets from './Presets';

// styles
import 'typeface-poppins';
import '../styles/app.scss';

// other
import logo from '../img/logo192.png';
// import { logoGen, downloadCanvas } from '../lib/utils/canvas'

function App() {

  const [darkMode, setDarkMode] = useState(false);
  const [nav, setNav] = useState('editor');
  const [appPalette, setAppPalette] = useState(null);

  return (<>

    <nav
      className={`navbar navbar-expand-lg navbar-dark ${nav !== "editor" ? "sticky-top" : ""}`}
      style={{ backgroundColor: '#232F34' }}
    >
      <img src={logo} className="logo"></img>

      <div className="collapse navbar-collapse" id="navbarSupportedContent">
        <ul className="navbar-nav mr-auto">
          <li className={`nav-item ${nav === 'editor' ? "active" : ""}`}>
            <a className="nav-link" onClick={() => setNav('editor')} href="JavaScript:Void(0);">Editor <span className="sr-only">(current)</span></a>
          </li>
          <li className={`nav-item ${nav === 'presets' ? "active" : ""}`}>
            <a className="nav-link" onClick={() => setNav('presets')} href="JavaScript:Void(0);">Presets</a>
          </li>
          <li className={`nav-item ${nav === 'about' ? "active" : ""}`}>
            <a className="nav-link" onClick={() => setNav('about')} href="JavaScript:Void(0);">About</a>
          </li>
          <li className="nav-item dropdown">
            <a className="nav-link dropdown-toggle" href="JavaScript:Void(0);" id="theme-dropdown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              Theme
            </a>
            <div className="dropdown-menu" aria-labelledby="theme-dropdown">
              <a className="dropdown-item active" href="JavaScript:Void(0);">Light</a>
              <a className="dropdown-item" href="JavaScript:Void(0);">Dark</a>
            </div>
          </li>
        </ul>
      </div>
    </nav>

    <div className='container' id='app'>
      <div className="tab-content">
        <div className={`tab-pane fade ${nav === 'editor' ? 'show active' : ''}`} id="home" role="tabpanel" aria-labelledby="editor-button">
          <Editor
            setAppPalette={setAppPalette}
          />
        </div>
        <div className={`tab-pane fade ${nav === 'presets' ? 'show active' : ''}`} id="presets" role="tabpanel" aria-labelledby="presets-button">
          <Presets
            setAppPalette={setAppPalette}
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
