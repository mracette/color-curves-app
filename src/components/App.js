// libs
import React from 'react';
import 'bootstrap';

// components
import Editor from './Editor'

// styles
import '../styles/app.scss';

function App() {

  // Listen to tab events to enable outlines (accessibility improvement)
  // See: https://jmperezperez.com/outline-focus-ring-a11y/
  // Let me know if you have a better solution!

  document.body.addEventListener('keyup', function(e) {
    if (e.which === 9) /* tab */ {
      document.getElementById('app').classList.remove('no-focus-outline');
    }
  })

  return (

    <div className = 'container no-focus-outline' id = 'app' fluid = {true}>
      
      <Editor />

    </div>

  );

}

export default App;
