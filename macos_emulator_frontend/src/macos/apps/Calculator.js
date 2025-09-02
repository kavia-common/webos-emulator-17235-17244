import React, { useState } from 'react';
import './calculator.css';

// PUBLIC_INTERFACE
export function CalculatorApp() {
  /** Minimal calculator with basic operations. */
  const [display, setDisplay] = useState('0');
  const [stored, setStored] = useState(null);
  const [op, setOp] = useState(null);
  const [overwrite, setOverwrite] = useState(true);

  const press = (val) => {
    if (val === 'C') { setDisplay('0'); setStored(null); setOp(null); setOverwrite(true); return; }
    if (!isNaN(Number(val))) {
      setDisplay(d => overwrite || d === '0' ? String(val) : d + String(val));
      setOverwrite(false);
      return;
    }
    if (val === '.') {
      setDisplay(d => (d.includes('.') ? d : d + '.'));
      setOverwrite(false);
      return;
    }
    if (['+','-','×','÷'].includes(val)) {
      setStored(Number(display));
      setOp(val);
      setOverwrite(true);
      return;
    }
    if (val === '=') {
      if (op && stored != null) {
        const a = stored;
        const b = Number(display);
        let r = 0;
        if (op === '+') r = a + b;
        if (op === '-') r = a - b;
        if (op === '×') r = a * b;
        if (op === '÷') r = b === 0 ? 0 : a / b;
        setDisplay(String(r));
        setStored(null);
        setOp(null);
        setOverwrite(true);
      }
      return;
    }
  };

  const keys = [
    'C','÷','×','-',
    '7','8','9','+',
    '4','5','6','=',
    '1','2','3','0','.'
  ];

  return (
    <div className="calc">
      <div className="display">{display}</div>
      <div className="keys">
        {keys.map(k => (
          <button key={k} className="key" onClick={() => press(k)}>{k}</button>
        ))}
      </div>
    </div>
  );
}
