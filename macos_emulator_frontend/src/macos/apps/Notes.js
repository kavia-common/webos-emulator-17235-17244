import React, { useState } from 'react';
import './notes.css';

// PUBLIC_INTERFACE
export function NotesApp() {
  /** Simple notes editor with list on the left and textarea on the right. */
  const [notes, setNotes] = useState([
    { id: 'n1', title: 'Welcome', body: 'This is a demo Notes app.' },
    { id: 'n2', title: 'Todo', body: '1) Try drag & resize\n2) Open apps from Dock\n3) Toggle Launchpad (Cmd+Space)' },
  ]);
  const [selected, setSelected] = useState('n1');

  const sel = notes.find(n => n.id === selected);

  const onChange = (e) => {
    const body = e.target.value;
    setNotes(prev => prev.map(n => n.id === selected ? { ...n, body } : n));
  };

  return (
    <div className="notes">
      <aside className="notes-list surface-glass">
        <button className="notes-new" onClick={() => {
          const id = `n${Date.now()}`;
          setNotes([{ id, title: 'Untitled', body: '' }, ...notes]);
          setSelected(id);
        }}>＋ New Note</button>
        <div className="notes-items">
          {notes.map(n => (
            <button
              key={n.id}
              className={`notes-item ${selected === n.id ? 'active' : ''}`}
              onClick={() => setSelected(n.id)}
            >
              <div className="title">{n.title}</div>
              <div className="preview">{(n.body || '').slice(0, 40)}</div>
            </button>
          ))}
        </div>
      </aside>
      <main className="notes-editor">
        {sel ? (
          <textarea className="notes-textarea" value={sel.body} onChange={onChange} />
        ) : (
          <div className="notes-empty">Select or create a note</div>
        )}
      </main>
    </div>
  );
}
