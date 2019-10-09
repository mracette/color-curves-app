// libs
import React from 'react';

// components
import Editor from './Editor'
import Container from 'react-bootstrap/Container';

// styles
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/app.css';

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

    <Container className = 'no-focus-outline' id = 'app' fluid = {true}>
      
      <Editor />

    </Container>

  );

}

export default App;
