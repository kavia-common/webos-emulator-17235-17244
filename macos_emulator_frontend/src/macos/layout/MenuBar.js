import React, { useEffect, useState } from 'react';
import { useEmulator } from '../context/EmulatorContext';
import './menubar.css';

// Small inline SVG component for the Apple logo to ensure consistent rendering.
// PUBLIC_INTERFACE
export function AppleLogo({ title = 'Apple menu' }) {
  /** Accessible inline SVG Apple logo sized for the menu bar. */
  return (
    <svg
      className="apple-logo"
      width="16"
      height="16"
      viewBox="0 0 256 256"
      role="img"
      aria-label={title}
      focusable="false"
    >
      <title>{title}</title>
      <path
        d="M213.9 190.5c-4.1 9.4-9 18-14.9 25.9-7.8 10.4-14.2 17.6-19.2 21.5-7.6 6.9-15.8 10.5-24.6 10.8-6.3 0-14-1.8-23-5.5-9.1-3.6-17.5-5.4-25.1-5.4-7.9 0-16.6 1.8-26.1 5.4-9.5 3.7-16.9 5.6-22.3 5.7-8.6.4-17.1-3.3-25.5-11.1-5.4-4.6-12.2-12.2-20.3-22.7C3.1 200.7-1 184.3.2 167.7 1.3 152 7 138.4 17.2 127c10.5-11.8 23.4-17.8 38.8-17.9 7.6 0 17.5 2.1 29.9 6.3 12.3 4.2 20.2 6.3 23.8 6.3 2.7 0 11-2.1 25-6.4 13.4-4.1 24.7-5.8 33.9-5.1 25.1 2 43.9 12.2 56.3 30.5-22.3 13.5-33.3 32.4-33 56.8ZM176.5 4.4c0 11.9-4.3 23-12.8 33.2-10.3 12.1-22.8 19.1-36.4 18.1-.1-1.4-.2-2.9-.2-4.5 0-11.6 5-24 13.9-34.9 4.4-5.5 10-10.1 16.8-13.8C165.2-1.2 171.4-1 176.5 4.4Z"
        fill="currentColor"
      />
    </svg>
  );
}

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
        <button
          className="menu-item apple-button"
          aria-label="Open Apple menu"
          title="Apple menu"
        >
          <AppleLogo />
          <span className="visually-hidden">Apple</span>
        </button>
        <button className="menu-item" onClick={() => actions.openApp('finder')}>Finder</button>
        <button className="menu-item" onClick={actions.toggleLaunchpad}>Launchpad</button>
      </div>
      <div className="menu-right">
        <span className="menu-item">{clock}</span>
      </div>
    </div>
  );
}
