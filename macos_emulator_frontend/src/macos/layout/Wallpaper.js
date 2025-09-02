import React, { useEffect, useState } from 'react';
import './wallpaper.css';

// PUBLIC_INTERFACE
export function Wallpaper() {
  /** Renders the desktop wallpaper background, following Settings via CSS variable. */
  const [styleKey, setStyleKey] = useState('default');

  useEffect(() => {
    const obs = new MutationObserver(() => {
      const val = getComputedStyle(document.documentElement).getPropertyValue('--wallpaper-style').trim();
      if (val) setStyleKey(val);
    });
    // Observe root style changes
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });
    // Initial read
    const val = getComputedStyle(document.documentElement).getPropertyValue('--wallpaper-style').trim();
    if (val) setStyleKey(val);
    return () => obs.disconnect();
  }, []);

  return <div className="wallpaper" data-style={styleKey} aria-hidden="true" />;
}
