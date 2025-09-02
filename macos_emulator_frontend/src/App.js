import React from 'react';
import './App.css';

// PUBLIC_INTERFACE
function App() {
  /** This component is intentionally minimal. The emulator mounts from src/macos/EmulatorApp. */
  return (
    <div className="App" role="main" aria-label="MacOS Emulator">
      {/* The actual UI is rendered by EmulatorApp via index.js */}
    </div>
  );
}

export default App;
