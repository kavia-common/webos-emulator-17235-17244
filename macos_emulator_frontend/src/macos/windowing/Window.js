import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useEmulator } from '../context/EmulatorContext';
import './window.css';

const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

// PUBLIC_INTERFACE
export function Window({ win, children }) {
  /**
   * A single window with draggable titlebar, resizable edges, and traffic-light controls.
   */
  const { actions, activeWindowId } = useEmulator();
  const isActive = activeWindowId === win.id;

  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(null); // 'right','bottom','corner'
  const dragOffset = useRef({ x: 0, y: 0 });
  const sizeStart = useRef({ w: win.width, h: win.height, x: win.x, y: win.y });

  const style = useMemo(() => {
    const bounds = {
      top: win.maximized ? 'var(--menubar-height)' : `${win.y}px`,
      left: win.maximized ? '0px' : `${win.x}px`,
      width: win.maximized ? '100vw' : `${win.width}px`,
      height: win.maximized ? `calc(100vh - var(--menubar-height) - var(--dock-height))` : `${win.height}px`,
    };
    return {
      ...bounds,
      zIndex: win.zIndex,
    };
  }, [win]);

  const onPointerDownTitle = (e) => {
    if (win.maximized) return;
    setDragging(true);
    actions.focusWindow(win.id);
    dragOffset.current = { x: e.clientX - win.x, y: e.clientY - win.y };
  };

  const onPointerMove = useCallback((e) => {
    if (dragging && !win.maximized) {
      const nx = clamp(e.clientX - dragOffset.current.x, 0, window.innerWidth - 120);
      const ny = clamp(e.clientY - dragOffset.current.y, 28, window.innerHeight - 120);
      actions.moveWindow(win.id, nx, ny);
    }
    if (resizing) {
      const minW = 280;
      const minH = 180;
      const dx = e.clientX - sizeStart.current.x;
      const dy = e.clientY - sizeStart.current.y;
      let nw = sizeStart.current.w;
      let nh = sizeStart.current.h;
      if (resizing === 'right' || resizing === 'corner') {
        nw = clamp(sizeStart.current.w + dx, minW, window.innerWidth);
      }
      if (resizing === 'bottom' || resizing === 'corner') {
        nh = clamp(sizeStart.current.h + dy, minH, window.innerHeight);
      }
      actions.resizeWindow(win.id, nw, nh);
    }
  }, [actions, dragging, resizing, win.id, win.maximized]);

  const onPointerUp = useCallback(() => {
    setDragging(false);
    setResizing(null);
  }, []);

  useEffect(() => {
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [onPointerMove, onPointerUp]);

  const startResize = (mode) => (e) => {
    if (win.maximized) return;
    e.stopPropagation();
    setResizing(mode);
    sizeStart.current = { w: win.width, h: win.height, x: e.clientX, y: e.clientY };
    actions.focusWindow(win.id);
  };

  if (win.minimized) return null;

  return (
    <section
      className={`window ${isActive ? 'active' : ''} surface-opaque round-12`}
      style={style}
      onMouseDown={() => actions.focusWindow(win.id)}
      role="dialog"
      aria-label={win.title}
    >
      <div className="titlebar" onPointerDown={onPointerDownTitle}>
        <div className="traffic">
          <button className="btn close" aria-label="Close" onClick={(e) => { e.stopPropagation(); actions.closeWindow(win.id); }} />
          <button className="btn min" aria-label="Minimize" onClick={(e) => { e.stopPropagation(); actions.minimizeWindow(win.id); }} />
          <button className="btn max" aria-label="Maximize" onClick={(e) => { e.stopPropagation(); actions.maximizeWindow(win.id); }} />
        </div>
        <div className="title">{win.title}</div>
        <div className="title-actions" />
      </div>
      <div className="content">
        {children}
      </div>
      {!win.maximized && (
        <>
          <div className="resize-handle right" onMouseDown={startResize('right')} />
          <div className="resize-handle bottom" onMouseDown={startResize('bottom')} />
          <div className="resize-handle corner" onMouseDown={startResize('corner')} />
        </>
      )}
    </section>
  );
}
