import React, { useEffect, useState } from 'react';
import './settings.css';

// PUBLIC_INTERFACE
export function SettingsApp() {
  /**
   * Preferences: theme (dark/light tokens), accent color, wallpaper style.
   * Applies changes via CSS variables on :root to keep code decoupled.
   */
  const [accent, setAccent] = useState(getComputedStyle(document.documentElement).getPropertyValue('--mac-accent').trim() || '#007AFF');
  const [theme, setTheme] = useState('dark');
  const [wallpaper, setWallpaper] = useState('default');

  useEffect(() => {
    // Apply accent
    document.documentElement.style.setProperty('--mac-accent', accent);
  }, [accent]);

  useEffect(() => {
    const isDark = theme === 'dark';
    document.body.style.background = isDark
      ? 'linear-gradient(180deg, #101014 0%, #0b0b0e 100%)'
      : 'linear-gradient(180deg, #f5f7fb 0%, #dde3f0 100%)';
    document.documentElement.style.setProperty('--mac-fg', isDark ? '#f5f5f7' : '#0b0b0e');
    document.documentElement.style.setProperty('--glass-bg', isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)');
    document.documentElement.style.setProperty('--glass-border', isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.12)');
  }, [theme]);

  useEffect(() => {
    // Communicate wallpaper via CSS variable read by wallpaper.css
    document.documentElement.style.setProperty('--wallpaper-style', wallpaper);
  }, [wallpaper]);

  return (
    <div className="set-root">
      <section className="set-section surface-glass round-12">
        <h2>Appearance</h2>
        <div className="row">
          <label>Theme</label>
          <div className="choices">
            <button className={`chip ${theme === 'dark' ? 'active' : ''}`} onClick={() => setTheme('dark')}>Dark</button>
            <button className={`chip ${theme === 'light' ? 'active' : ''}`} onClick={() => setTheme('light')}>Light</button>
          </div>
        </div>
        <div className="row">
          <label>Accent</label>
          <input
            type="color"
            value={accent}
            onChange={(e) => setAccent(e.target.value)}
            aria-label="Accent color"
          />
        </div>
      </section>

      <section className="set-section surface-glass round-12">
        <h2>Wallpaper</h2>
        <div className="wall-grid">
          {['default','aurora','sunset','ocean'].map(w => (
            <button
              key={w}
              className={`wall ${w} ${wallpaper === w ? 'active' : ''}`}
              onClick={() => setWallpaper(w)}
              aria-label={`Set wallpaper ${w}`}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
