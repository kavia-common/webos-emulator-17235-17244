import React, { useEffect, useState } from 'react';
import { useEmulator } from '../context/EmulatorContext';
import './menubar.css';

// PUBLIC_INTERFACE
export function MenuBar() {
  /** Simple macOS-like menu bar with time and basic menus. */
  const { actions } = useEmulator();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    const onToggle = () => actions.toggleLaunchpad();
    window.addEventListener('emu.toggleLaunchpad', onToggle);
    return () => {
      clearInterval(t);
      window.removeEventListener('emu.toggleLaunchpad', onToggle);
    };
  }, [actions]);

  const clock = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="menubar surface-glass">
      <div className="menu-left">
        <span className="apple"></span>
        <button className="menu-item" onClick={() => actions.openApp('finder')}>Finder</button>
        <button className="menu-item" onClick={actions.toggleLaunchpad}>Launchpad</button>
      </div>
      <div className="menu-right">
        <span className="menu-item">{clock}</span>
      </div>
    </div>
  );
}
