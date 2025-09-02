import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { FinderApp } from '../apps/Finder';
import { NotesApp } from '../apps/Notes';
import { CalculatorApp } from '../apps/Calculator';

/**
 * Window and App types
 */
const initialApps = {
  finder: {
    id: 'finder',
    name: 'Finder',
    icon: '📁',
    component: FinderApp,
    singleInstance: true,
    defaultSize: { width: 720, height: 480 },
  },
  notes: {
    id: 'notes',
    name: 'Notes',
    icon: '📝',
    component: NotesApp,
    singleInstance: false,
    defaultSize: { width: 560, height: 420 },
  },
  calculator: {
    id: 'calculator',
    name: 'Calculator',
    icon: '🧮',
    component: CalculatorApp,
    singleInstance: true,
    defaultSize: { width: 320, height: 420 },
  },
};

const EmulatorContext = createContext(null);

// PUBLIC_INTERFACE
export function useEmulator() {
  /** Access the emulator state and actions. */
  return useContext(EmulatorContext);
}

// Utility for simple id generation
let seq = 1;
const nextId = () => `win_${Date.now().toString(36)}_${seq++}`;

// PUBLIC_INTERFACE
export function EmulatorProvider({ children }) {
  /**
   * Provides global state for apps, windows, menu, dock, and overlays.
   */
  const [apps] = useState(initialApps);
  const [windows, setWindows] = useState([]); // array of window objects
  const [activeWindowId, setActiveWindowId] = useState(null);
  const [showLaunchpad, setShowLaunchpad] = useState(false);
  const [desktopIcons] = useState([
    { id: 'ic-docs', name: 'Documents', icon: '📄', appId: 'finder' },
    { id: 'ic-notes', name: 'Notes', icon: '📝', appId: 'notes' },
    { id: 'ic-calc', name: 'Calculator', icon: '🧮', appId: 'calculator' },
  ]);

  const zCounter = useRef(10);

  const bringToFront = useCallback((id) => {
    setWindows((prev) => {
      const maxZ = Math.max(10, ...prev.map(w => w.zIndex || 10));
      return prev.map(w => w.id === id ? { ...w, zIndex: maxZ + 1 } : w);
    });
    setActiveWindowId(id);
  }, []);

  const openApp = useCallback((appId, payload = {}) => {
    const app = apps[appId];
    if (!app) return null;

    setShowLaunchpad(false);

    setWindows(prev => {
      // First try: if any window of this app is minimized, restore the most recently created one
      const minimizedWins = prev.filter(w => w.appId === appId && w.minimized);
      if (minimizedWins.length > 0) {
        // choose the most recent by zIndex
        const toRestore = minimizedWins.reduce((a, b) => (a.zIndex > b.zIndex ? a : b));
        bringToFront(toRestore.id);
        return prev.map(w => w.id === toRestore.id ? { ...w, minimized: false } : w);
      }

      // If single instance and exists, just focus it
      if (app.singleInstance) {
        const existing = prev.find(w => w.appId === appId);
        if (existing) {
          bringToFront(existing.id);
          return prev.map(w => w.id === existing.id ? { ...w, minimized: false } : w);
        }
      }

      const id = nextId();
      const areaW = window.innerWidth;
      const areaH = window.innerHeight;
      const width = app.defaultSize?.width || 640;
      const height = app.defaultSize?.height || 480;

      const newWin = {
        id,
        appId,
        title: app.name,
        x: Math.round((areaW - width) / 2 + Math.random() * 40 - 20),
        y: Math.round((areaH - height) / 3 + Math.random() * 40 - 20),
        width,
        height,
        zIndex: (zCounter.current += 1),
        minimized: false,
        maximized: false,
        payload,
        prevBounds: null,
      };
      setActiveWindowId(id);
      return [...prev, newWin];
    });
  }, [apps, bringToFront]);

  const closeWindow = useCallback((id) => {
    setWindows(prev => prev.filter(w => w.id !== id));
    setActiveWindowId(prev => (prev === id ? null : prev));
  }, []);

  const minimizeWindow = useCallback((id) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, minimized: true } : w));
    setActiveWindowId(prev => (prev === id ? null : prev));
  }, []);

  const maximizeWindow = useCallback((id) => {
    setWindows(prev => prev.map(w => {
      if (w.id !== id) return w;
      if (w.maximized) {
        // restore to previous bounds if available
        if (w.prevBounds) {
          const { x, y, width, height } = w.prevBounds;
          return { ...w, maximized: false, x, y, width, height, prevBounds: null };
        }
        return { ...w, maximized: false };
      }
      // store current bounds then maximize
      const prevBounds = { x: w.x, y: w.y, width: w.width, height: w.height };
      return { ...w, maximized: true, minimized: false, prevBounds };
    }));
    bringToFront(id);
  }, [bringToFront]);

  const moveWindow = useCallback((id, x, y) => {
    setWindows(prev => prev.map(w => (w.id === id ? { ...w, x, y } : w)));
  }, []);

  const resizeWindow = useCallback((id, width, height) => {
    setWindows(prev => prev.map(w => (w.id === id ? { ...w, width, height } : w)));
  }, []);

  const focusWindow = useCallback((id) => {
    bringToFront(id);
  }, [bringToFront]);

  const toggleLaunchpad = useCallback(() => {
    setShowLaunchpad(v => !v);
  }, []);

  const value = useMemo(() => ({
    apps,
    windows,
    desktopIcons,
    activeWindowId,
    showLaunchpad,
    actions: {
      openApp,
      closeWindow,
      minimizeWindow,
      maximizeWindow,
      moveWindow,
      resizeWindow,
      focusWindow,
      toggleLaunchpad,
      bringToFront,
    }
  }), [apps, windows, desktopIcons, activeWindowId, showLaunchpad, openApp, closeWindow, minimizeWindow, maximizeWindow, moveWindow, resizeWindow, focusWindow, toggleLaunchpad, bringToFront]);

  return (
    <EmulatorContext.Provider value={value}>
      {children}
    </EmulatorContext.Provider>
  );
}
