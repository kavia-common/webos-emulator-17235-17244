import React from 'react';
import { useEmulator } from '../context/EmulatorContext';
import './launchpad.css';

// PUBLIC_INTERFACE
export function Launchpad() {
  /** Fullscreen overlay listing available apps. */
  const { apps, actions } = useEmulator();
  const appList = Object.values(apps);

  return (
    <div className="launchpad fade-in" role="dialog" aria-label="Launchpad">
      <div className="launchpad-inner surface-glass round-16">
        {appList.map(app => (
          <button
            key={app.id}
            className="lp-item"
            onClick={() => actions.openApp(app.id)}
            aria-label={`Open ${app.name}`}
            title={app.name}
          >
            <div className="lp-emoji">{app.icon}</div>
            <div className="lp-name">{app.name}</div>
          </button>
        ))}
      </div>
      <button className="launchpad-dismiss" onClick={actions.toggleLaunchpad}>Close</button>
    </div>
  );
}
