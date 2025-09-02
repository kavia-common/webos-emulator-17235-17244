import React from 'react';
import { useEmulator } from '../context/EmulatorContext';
import './desktop-icon.css';

// PUBLIC_INTERFACE
export function DesktopIcon({ icon, name, appId }) {
  /** Icon on the desktop to open an app. */
  const { actions } = useEmulator();

  return (
    <button
      className="desktop-icon"
      onDoubleClick={() => actions.openApp(appId)}
      onClick={(e) => e.currentTarget.classList.add('active')}
      onBlur={(e) => e.currentTarget.classList.remove('active')}
    >
      <div className="icon-emoji">{icon}</div>
      <div className="icon-label">{name}</div>
    </button>
  );
}
