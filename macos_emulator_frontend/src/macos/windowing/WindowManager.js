import React from 'react';
import { useEmulator } from '../context/EmulatorContext';
import { Window } from './Window';

// PUBLIC_INTERFACE
export function WindowManager() {
  /** Renders all windows and routes to app components. */
  const { windows, apps } = useEmulator();

  return (
    <>
      {windows.map(win => {
        const AppComp = apps[win.appId]?.component;
        if (!AppComp) return null;
        return (
          <Window key={win.id} win={win}>
            <AppComp windowId={win.id} />
          </Window>
        );
      })}
    </>
  );
}
