import React from 'react';
import { useEmulator } from '../context/EmulatorContext';
import { DesktopIcon } from './DesktopIcon';
import './desktop.css';

// PUBLIC_INTERFACE
export function Desktop() {
  /** The desktop canvas containing icons. */
  const { desktopIcons } = useEmulator();

  return (
    <div className="desktop" aria-label="Desktop">
      <div className="icons-grid">
        {desktopIcons.map((ic) => (
          <DesktopIcon key={ic.id} icon={ic.icon} name={ic.name} appId={ic.appId} />
        ))}
      </div>
    </div>
  );
}
