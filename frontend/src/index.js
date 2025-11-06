import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css'; // Global styles (we will edit this next)
import App from './App';

/**
 * @description The main entry point for the React application.
 * It renders the App component inside the 'root' div.
 * BrowserRouter is wrapped around the entire App to enable routing.
 */
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);