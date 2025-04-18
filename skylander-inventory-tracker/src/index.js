// index.js - Main entry point for the app
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { SkylanderProvider } from './context/SkylanderContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <SkylanderProvider>
        <App />
      </SkylanderProvider>
    </BrowserRouter>
  </React.StrictMode>
);
