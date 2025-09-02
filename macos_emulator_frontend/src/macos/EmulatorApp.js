import React, { useEffect } from 'react';
import { MenuBar } from './layout/MenuBar';
import { Desktop } from './layout/Desktop';
import { Dock } from './layout/Dock';
import { Launchpad } from './layout/Launchpad';
import { WindowManager } from './windowing/WindowManager';
import { Wallpaper } from './layout/Wallpaper';
import { useEmulator } from './context/EmulatorContext';
import './layout/index.css';
import './windowing/window.css';

// PUBLIC_INTERFACE
export function EmulatorApp() {
  /**
   * High-level composition of the MacOS emulator surfaces.
   * Renders wallpaper, menubar, desktop icons, windows, dock, and launchpad overlay.
   */
  const { showLaunchpad } = useEmulator();

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e) => {
      // Cmd+Space toggles launchpad
      if ((e.metaKey || e.ctrlKey) && e.code === 'Space') {
        e.preventDefault();
        const evt = new CustomEvent('emu.toggleLaunchpad');
        window.dispatchEvent(evt);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="emulator-root" style={{ height: '100%', width: '100%', position: 'relative' }}>
      <Wallpaper />
      <MenuBar />
      <Desktop />
      <WindowManager />
      <Dock />
      {showLaunchpad && <Launchpad />}
    </div>
  );
}
