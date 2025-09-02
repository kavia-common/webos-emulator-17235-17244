import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './calculator.css';

// Light utility to format numbers and clamp display length
const MAX_LEN = 16;
function formatNumber(n) {
  // Normalize error conditions (NaN, Infinity) into "Error"
  if (!Number.isFinite(Number(n))) return 'Error';
  const str = String(n);
  if (str.length <= MAX_LEN) return str;
  // Use exponential for very long strings
  const num = Number(n);
  return Number.isFinite(num) ? num.toExponential(8) : 'Error';
}

function isDigit(val) {
  return /^[0-9]$/.test(val);
}

function mapOpToSymbol(op) {
  // Normalize keyboard to our symbols
  if (op === '*') return '×';
  if (op === '/') return '÷';
  return op;
}

// PUBLIC_INTERFACE
export function CalculatorApp() {
  /**
   * A four-function calculator with clear (C/AC), decimals, keyboard support, and basic error handling.
   * State machine approach:
   * - display: string shown on the screen
   * - accumulator: number for previous value
   * - operator: '+', '-', '×', '÷' | null
   * - overwrite: if next digit should start a new entry
   * - hasTyped: tracks whether user typed since last clear to toggle C/AC label
   */
  const [display, setDisplay] = useState('0');
  const [accumulator, setAccumulator] = useState(null);
  const [operator, setOperator] = useState(null);
  const [overwrite, setOverwrite] = useState(true);
  const [hasTyped, setHasTyped] = useState(false);

  // Track long-press to force All Clear
  const clearPressTimer = useRef(null);

  const clearLabel = hasTyped ? 'C' : 'AC';

  const inputDigit = useCallback((d) => {
    if (display === 'Error') {
      // Start fresh after an error when typing a digit
      setDisplay(d);
      setAccumulator(null);
      setOperator(null);
      setOverwrite(false);
      setHasTyped(true);
      return;
    }
    setHasTyped(true);
    setDisplay((curr) => {
      if (overwrite || curr === '0') {
        setOverwrite(false);
        return d;
      }
      const next = curr + d;
      return next.length > MAX_LEN ? curr : next;
    });
  }, [display, overwrite]);

  const inputDot = useCallback(() => {
    if (display === 'Error') {
      setDisplay('0.');
      setAccumulator(null);
      setOperator(null);
      setOverwrite(false);
      setHasTyped(true);
      return;
    }
    setHasTyped(true);
    setDisplay((curr) => {
      if (overwrite) {
        setOverwrite(false);
        return '0.';
      }
      if (curr.includes('.')) return curr;
      return curr + '.';
    });
  }, [display, overwrite]);

  const compute = useCallback((a, b, op) => {
    if (a == null || b == null || op == null) return b ?? a ?? 0;
    try {
      if (op === '+') return a + b;
      if (op === '-') return a - b;
      if (op === '×') return a * b;
      if (op === '÷') return b === 0 ? Infinity : a / b;
      return b;
    } catch {
      return Infinity;
    }
  }, []);

  const setOp = useCallback((nextOp) => {
    if (display === 'Error') {
      // After error, setting an operator should reset to 0 then set operator
      setDisplay('0');
      setAccumulator(0);
      setOperator(nextOp);
      setOverwrite(true);
      setHasTyped(false);
      return;
    }

    setHasTyped(false);
    setAccumulator((prevAcc) => {
      const currVal = Number(display);
      if (operator && prevAcc != null && !overwrite) {
        // If there is an existing operator and user has just entered a number, resolve first
        const result = compute(prevAcc, currVal, operator);
        const out = formatNumber(result);
        setDisplay(out);
        setOperator(nextOp);
        setOverwrite(true);
        return out === 'Error' ? null : Number(result);
      } else if (prevAcc == null) {
        // First operator press: move current display into accumulator
        setOperator(nextOp);
        setOverwrite(true);
        return Number(currVal);
      } else {
        // Changing operator without entering a new number
        setOperator(nextOp);
        setOverwrite(true);
        return prevAcc;
      }
    });
  }, [compute, display, operator, overwrite]);

  const doEqual = useCallback(() => {
    if (display === 'Error') {
      // reset on equal after error
      setDisplay('0');
      setAccumulator(null);
      setOperator(null);
      setOverwrite(true);
      setHasTyped(false);
      return;
    }
    setAccumulator((prevAcc) => {
      if (operator == null || prevAcc == null) return prevAcc;
      const currVal = Number(display);
      const result = compute(prevAcc, currVal, operator);
      const out = formatNumber(result);
      setDisplay(out);
      setOperator(null);
      setOverwrite(true);
      setHasTyped(false);
      return null;
    });
  }, [compute, display, operator]);

  const doClear = useCallback((forceAll = false) => {
    // If forceAll is true, behave as AC regardless of hasTyped
    if (forceAll || !hasTyped) {
      // All clear
      setDisplay('0');
      setAccumulator(null);
      setOperator(null);
      setOverwrite(true);
      setHasTyped(false);
    } else {
      // Clear entry
      setDisplay('0');
      setOverwrite(true);
      setHasTyped(false);
    }
  }, [hasTyped]);

  const press = useCallback((val) => {
    // Mouse/touch button handler
    if (val === 'AC' || val === 'C') return doClear();
    if (isDigit(val)) return inputDigit(val);
    if (val === '.') return inputDot();
    if (['+','-','×','÷'].includes(val)) return setOp(val);
    if (val === '=') return doEqual();
  }, [doClear, doEqual, inputDigit, inputDot, setOp]);

  // Keyboard support
  useEffect(() => {
    const onKey = (e) => {
      const { key } = e;
      if (isDigit(key)) {
        e.preventDefault();
        inputDigit(key);
        return;
      }
      if (key === '.' || key === ',') {
        e.preventDefault();
        inputDot();
        return;
      }
      if (['+','-','*','/'].includes(key)) {
        e.preventDefault();
        setOp(mapOpToSymbol(key));
        return;
      }
      if (key === 'Enter' || key === '=') {
        e.preventDefault();
        doEqual();
        return;
      }
      if (key === 'Backspace') {
        e.preventDefault();
        // Backspace should function as CE (clear entry character)
        if (display === 'Error') {
          doClear(true);
          return;
        }
        setHasTyped(true);
        setDisplay((curr) => {
          if (overwrite) return '0';
          if (curr.length <= 1) {
            setOverwrite(true);
            return '0';
          }
          return curr.slice(0, -1);
        });
        return;
      }
      if (key.toLowerCase() === 'c' || key === 'Escape') {
        e.preventDefault();
        doClear(key === 'Escape'); // Esc forces AC
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [doEqual, doClear, inputDigit, inputDot, setOp, overwrite, display]);

  const shownDisplay = useMemo(() => display, [display]);

  // Button layout similar to iOS calculator feel
  const keys = [
    clearLabel,'÷','×','-',
    '7','8','9','+',
    '4','5','6','=',
    '1','2','3','.',
    '0'
  ];

  // Render
  return (
    <div className="calc" aria-label="Calculator">
      <div className="display" role="region" aria-live="polite" aria-atomic="true">
        {shownDisplay}
      </div>
      <div className="keys">
        {keys.map((k) => (
          <button
            key={k}
            className="key"
            onClick={() => press(k)}
            onMouseDown={(e) => {
              if (k === 'AC' || k === 'C') {
                // Long press to force AC
                clearPressTimer.current = window.setTimeout(() => {
                  doClear(true);
                }, 600);
              }
            }}
            onMouseUp={() => {
              if (clearPressTimer.current) {
                window.clearTimeout(clearPressTimer.current);
                clearPressTimer.current = null;
              }
            }}
            onMouseLeave={() => {
              if (clearPressTimer.current) {
                window.clearTimeout(clearPressTimer.current);
                clearPressTimer.current = null;
              }
            }}
            aria-label={`Key ${k}`}
          >
            {k}
          </button>
        ))}
      </div>
    </div>
  );
}
