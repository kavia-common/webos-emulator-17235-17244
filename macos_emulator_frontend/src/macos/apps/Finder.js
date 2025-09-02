import React from 'react';
import './finder.css';

// PUBLIC_INTERFACE
export function FinderApp() {
  /** Minimal Finder UI mock: sidebar + list */
  const items = [
    { id: '1', name: 'Documents', icon: '📄', updated: 'Today' },
    { id: '2', name: 'Pictures', icon: '🖼️', updated: 'Yesterday' },
    { id: '3', name: 'Music', icon: '🎵', updated: 'Last week' },
    { id: '4', name: 'Downloads', icon: '⬇️', updated: '2 weeks ago' },
  ];

  return (
    <div className="finder">
      <aside className="finder-sidebar surface-glass">
        <div className="finder-section">
          <div className="finder-section-title">Favorites</div>
          <button className="finder-link">AirDrop</button>
          <button className="finder-link">Applications</button>
          <button className="finder-link">Desktop</button>
          <button className="finder-link">Documents</button>
        </div>
        <div className="finder-section">
          <div className="finder-section-title">Locations</div>
          <button className="finder-link">Macintosh HD</button>
        </div>
      </aside>
      <main className="finder-main">
        <header className="finder-toolbar surface-glass">
          <input className="finder-search" placeholder="Search" aria-label="Search" />
        </header>
        <div className="finder-list">
          {items.map(it => (
            <div key={it.id} className="finder-row">
              <div className="c1">{it.icon}</div>
              <div className="c2">{it.name}</div>
              <div className="c3">{it.updated}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
