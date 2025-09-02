import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { EmulatorApp } from './macos/EmulatorApp';
import { EmulatorProvider } from './macos/context/EmulatorContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <EmulatorProvider>
      <EmulatorApp />
    </EmulatorProvider>
  </React.StrictMode>
);
