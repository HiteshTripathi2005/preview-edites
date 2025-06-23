import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import ElementInspector from './ElementInspector.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode id="StrictMode-1" data-component="main" data-file="src/main.jsx">
    <div id="div-1" data-component="main" data-file="src/main.jsx">
      <App id="App-2" data-component="main" data-file="src/main.jsx" />
      <ElementInspector />
    </div>
  </StrictMode>
);