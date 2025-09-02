import React, { useMemo, useState } from 'react';
import './texteditor.css';

// Simple in-memory document store shared per component instance
// Each window holds its own docs; multi-window acts like multi-instance editor.

// PUBLIC_INTERFACE
export function TextEditorApp() {
  /** A simple multi-document text editor with open/save (in-memory). */
  const [docs, setDocs] = useState(() => ([
    { id: 'doc-' + Date.now(), name: 'Untitled.txt', body: '' }
  ]));
  const [activeId, setActiveId] = useState(docs[0].id);
  const [status, setStatus] = useState('');

  const activeDoc = useMemo(() => docs.find(d => d.id === activeId), [docs, activeId]);

  const newFile = () => {
    const id = `doc-${Date.now()}`;
    const d = { id, name: 'Untitled.txt', body: '' };
    setDocs(prev => [d, ...prev]);
    setActiveId(id);
    setStatus('Created new file');
  };

  const saveFile = () => {
    setStatus('Saved.');
    setTimeout(() => setStatus(''), 600);
  };

  const renameFile = () => {
    const name = prompt('Rename file to:', activeDoc?.name || '');
    if (!name) return;
    setDocs(prev => prev.map(d => d.id === activeId ? { ...d, name } : d));
  };

  const deleteFile = () => {
    if (!activeDoc) return;
    if (!window.confirm(`Delete ${activeDoc.name}?`)) return;
    setDocs(prev => prev.filter(d => d.id !== activeId));
    setStatus('Deleted.');
    setTimeout(() => setStatus(''), 600);
    // switch to another
    setActiveId(prev => {
      const remained = docs.filter(d => d.id !== prev);
      return remained[0]?.id || null;
    });
  };

  const onChangeBody = (e) => {
    const body = e.target.value;
    setDocs(prev => prev.map(d => d.id === activeId ? { ...d, body } : d));
  };

  return (
    <div className="te-root">
      <div className="te-sidebar surface-glass">
        <div className="te-actions">
          <button className="te-btn" onClick={newFile}>＋ New</button>
          <button className="te-btn" onClick={saveFile}>⭳ Save</button>
        </div>
        <div className="te-list">
          {docs.map(d => (
            <button
              key={d.id}
              className={`te-item ${d.id === activeId ? 'active' : ''}`}
              onClick={() => setActiveId(d.id)}
            >
              <div className="name">{d.name}</div>
              <div className="preview">{(d.body || '').slice(0, 28)}</div>
            </button>
          ))}
        </div>
      </div>
      <div className="te-main">
        {activeDoc ? (
          <>
            <div className="te-toolbar surface-glass">
              <div className="te-title">{activeDoc.name}</div>
              <div className="te-toolbar-actions">
                <button className="te-btn" onClick={renameFile}>Rename</button>
                <button className="te-btn danger" onClick={deleteFile}>Delete</button>
              </div>
            </div>
            <textarea
              className="te-textarea"
              value={activeDoc.body}
              onChange={onChangeBody}
              placeholder="Start typing..."
            />
            {status && <div className="te-status">{status}</div>}
          </>
        ) : (
          <div className="te-empty">No file open</div>
        )}
      </div>
    </div>
  );
}
