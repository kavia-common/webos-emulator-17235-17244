import React from 'react';
import { useEmulator } from '../context/EmulatorContext';
import './dock.css';

// PUBLIC_INTERFACE
export function Dock() {
  /** MacOS-like dock with app shortcuts and bouncing hover. */
  const { apps, actions, windows } = useEmulator();

  const appList = Object.values(apps);

  const minimizedByApp = windows.reduce((acc, w) => {
    if (w.minimized) acc[w.appId] = true;
    return acc;
  }, {});

  return (
    <div className="dock-wrap">
      <div className="dock surface-glass round-16">
        {appList.map(app => (
          <button
            key={app.id}
            className="dock-item"
            onClick={() => actions.openApp(app.id)}
            aria-label={`Open ${app.name}`}
          >
            <span className="dock-emoji" aria-hidden>{app.icon}</span>
            {minimizedByApp[app.id] && <span className="dot" />}
            <span className="visually-hidden">{app.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
