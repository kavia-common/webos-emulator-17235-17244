import React, { useEffect, useMemo, useRef, useState } from 'react';
import './webbrowser.css';

/**
 * Simple static web browser simulator.
 * - Address bar with history, back/forward/reload
 * - Loads built-in demo "sites" by URL key
 * - Multi-tab capable via multi-window through emulator
 */

// PUBLIC_INTERFACE
export function WebBrowserApp({ windowId }) {
  /** A minimal static web browser mock. */
  const [history, setHistory] = useState(['welcome']);
  const [index, setIndex] = useState(0);
  const [address, setAddress] = useState('welcome');

  const sites = useMemo(() => ({
    welcome: {
      title: 'Welcome',
      content: (
        <div className="wb-page">
          <h1>Welcome to WebOS Browser</h1>
          <p>This is a static demo browser. Try these:</p>
          <ul>
            <li><button className="wb-link" onClick={() => navigate('news:home')}>news:home</button></li>
            <li><button className="wb-link" onClick={() => navigate('docs:getting-started')}>docs:getting-started</button></li>
            <li><button className="wb-link" onClick={() => navigate('about')}>about</button></li>
          </ul>
          <p>Tip: use Back, Forward, Reload. Address accepts keys like "welcome", "about", "news:home".</p>
        </div>
      )
    },
    'news:home': {
      title: 'News',
      content: (
        <div className="wb-page">
          <h1>Top Stories</h1>
          <article className="card">
            <h2>Emulator gets more apps</h2>
            <p>The macOS-like emulator now features a browser, terminal, text editor, images and settings.</p>
          </article>
          <article className="card">
            <h2>Design Tokens Updated</h2>
            <p>Glassmorphism and shadows refined for immersive UI.</p>
          </article>
        </div>
      )
    },
    'docs:getting-started': {
      title: 'Docs',
      content: (
        <div className="wb-page">
          <h1>Getting Started</h1>
          <ol>
            <li>Open apps from Dock or Launchpad</li>
            <li>Move/resize windows</li>
            <li>Try Terminal: ls, cd, echo, help</li>
            <li>Open Text Editor to write notes and save in-memory</li>
          </ol>
        </div>
      )
    },
    about: {
      title: 'About',
      content: (
        <div className="wb-page">
          <h1>About this Browser</h1>
          <p>Static client-side sites, no external fetch. Great for demos!</p>
        </div>
      )
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), []);

  const currentKey = history[index];
  const currentSite = sites[currentKey] || {
    title: 'Not found',
    content: <div className="wb-page"><h1>404</h1><p>Page "{currentKey}" not found.</p></div>
  };

  useEffect(() => {
    setAddress(currentKey);
  }, [currentKey]);

  const navigate = (key) => {
    // push new entry and truncate forward history
    setHistory(prev => {
      const next = prev.slice(0, index + 1).concat([key]);
      setIndex(next.length - 1);
      return next;
    });
  };

  const goBack = () => {
    setIndex(i => Math.max(0, i - 1));
  };
  const goForward = () => {
    setIndex(i => Math.min(history.length - 1, i + 1));
  };
  const reload = () => {
    // no network, no-op but we can flash a subtle animation
    const el = document.getElementById(`wb-content-${windowId}`);
    if (el) {
      el.classList.remove('wb-reload');
      // force reflow
      void el.offsetWidth;
      el.classList.add('wb-reload');
      setTimeout(() => el.classList.remove('wb-reload'), 250);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const key = address.trim();
    if (key) navigate(key);
  };

  return (
    <div className="wb-root">
      <div className="wb-toolbar surface-glass">
        <div className="wb-nav">
          <button className="wb-btn" onClick={goBack} disabled={index <= 0} aria-label="Back">←</button>
          <button className="wb-btn" onClick={goForward} disabled={index >= history.length - 1} aria-label="Forward">→</button>
          <button className="wb-btn" onClick={reload} aria-label="Reload">⟳</button>
        </div>
        <form className="wb-address" onSubmit={onSubmit}>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            aria-label="Address bar"
            placeholder="Type a demo URL key e.g. welcome"
          />
        </form>
        <div className="wb-tab">
          <span className="wb-title">{currentSite.title}</span>
        </div>
      </div>
      <div id={`wb-content-${windowId}`} className="wb-content">
        {currentSite.content}
      </div>
    </div>
  );
}
