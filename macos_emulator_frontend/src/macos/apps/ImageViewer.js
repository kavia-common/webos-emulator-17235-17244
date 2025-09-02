import React, { useEffect, useRef, useState } from 'react';
import './imageviewer.css';

// We use gradient demo images generated with CSS in boxes.
// In a full app, images would be real assets. Here we simulate gallery.

// PUBLIC_INTERFACE
export function ImageViewerApp() {
  /** Simple image viewer with zoom and pan for demo images. */
  const images = [
    { id: 'im1', name: 'Aurora', className: 'img-demo aurora' },
    { id: 'im2', name: 'Sunset', className: 'img-demo sunset' },
    { id: 'im3', name: 'Ocean', className: 'img-demo ocean' },
  ];
  const [active, setActive] = useState(images[0].id);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragRef = useRef({ dragging: false, startX: 0, startY: 0, baseX: 0, baseY: 0 });

  useEffect(() => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }, [active]);

  const onWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(z => Math.min(3, Math.max(0.5, +(z + delta).toFixed(2))));
  };

  const startDrag = (e) => {
    dragRef.current = {
      dragging: true,
      startX: e.clientX,
      startY: e.clientY,
      baseX: offset.x,
      baseY: offset.y,
    };
  };
  const onMove = (e) => {
    if (!dragRef.current.dragging) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setOffset({ x: dragRef.current.baseX + dx, y: dragRef.current.baseY + dy });
  };
  const stopDrag = () => {
    dragRef.current.dragging = false;
  };
  useEffect(() => {
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', stopDrag);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', stopDrag);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onMove]);

  return (
    <div className="iv-root">
      <aside className="iv-sidebar surface-glass">
        <div className="iv-list">
          {images.map(img => (
            <button
              key={img.id}
              className={`iv-item ${active === img.id ? 'active' : ''}`}
              onClick={() => setActive(img.id)}
            >
              <div className={`iv-thumb ${img.className}`} />
              <div className="iv-name">{img.name}</div>
            </button>
          ))}
        </div>
        <div className="iv-controls">
          <button className="iv-btn" onClick={() => setZoom(z => Math.max(0.5, +(z - 0.1).toFixed(2)))}>-</button>
          <div className="iv-zoom">{Math.round(zoom * 100)}%</div>
          <button className="iv-btn" onClick={() => setZoom(z => Math.min(3, +(z + 0.1).toFixed(2)))}>+</button>
          <button className="iv-btn" onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }); }}>Reset</button>
        </div>
      </aside>
      <main className="iv-canvas" onWheel={onWheel} onMouseDown={startDrag}>
        <div className="iv-inner" style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})` }}>
          <div className={images.find(i => i.id === active)?.className} />
        </div>
      </main>
    </div>
  );
}
