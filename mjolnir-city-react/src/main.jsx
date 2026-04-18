import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { SensorsProvider } from './context/SensorsContext.jsx';
import './styles/variables.css';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SensorsProvider>
      <App />
    </SensorsProvider>
  </React.StrictMode>
);
