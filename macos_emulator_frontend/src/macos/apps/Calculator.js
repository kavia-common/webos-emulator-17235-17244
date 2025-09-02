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
   * - lastOperator/lastOperand: to support repeated '=' presses
   */
  const [display, setDisplay] = useState('0');
  const [accumulator, setAccumulator] = useState(null);
  const [operator, setOperator] = useState(null);
  const [overwrite, setOverwrite] = useState(true);
  const [hasTyped, setHasTyped] = useState(false);
  const [lastOperator, setLastOperator] = useState(null);
  const [lastOperand, setLastOperand] = useState(null);

  // Track long-press to force All Clear
  const clearPressTimer = useRef(null);

  const clearLabel = hasTyped ? 'C' : 'AC';

  const resetLongPressTimer = () => {
    if (clearPressTimer.current) {
      window.clearTimeout(clearPressTimer.current);
      clearPressTimer.current = null;
    }
  };

  useEffect(() => {
    // Safety: clear any pending timer if component unmounts
    return () => resetLongPressTimer();
  }, []);

  const inputDigit = useCallback((d) => {
    if (display === 'Error') {
      // Start fresh after an error when typing a digit
      setDisplay(d);
      setAccumulator(null);
      setOperator(null);
      setOverwrite(false);
      setHasTyped(true);
      setLastOperator(null);
      setLastOperand(null);
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
      setLastOperator(null);
      setLastOperand(null);
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
      setLastOperator(null);
      setLastOperand(null);
      return;
    }

    setHasTyped(false);
    setAccumulator((prevAcc) => {
      const currVal = Number(display);
      if (operator && prevAcc != null && !overwrite) {
        // Resolve chain: prevAcc (op) currVal
        const result = compute(prevAcc, currVal, operator);
        const out = formatNumber(result);
        setDisplay(out);
        setOperator(nextOp);
        setOverwrite(true);
        // prepare for repeat '=' after a subsequent equal
        setLastOperator(nextOp); // last op becomes the newly selected pending op
        setLastOperand(null); // clear last operand until '=' pressed
        return out === 'Error' ? null : Number(result);
      } else if (prevAcc == null) {
        // First operator press: move current display into accumulator
        setOperator(nextOp);
        setOverwrite(true);
        setLastOperator(nextOp);
        setLastOperand(null);
        return Number(currVal);
      } else {
        // Changing operator without a new number
        setOperator(nextOp);
        setOverwrite(true);
        setLastOperator(nextOp);
        setLastOperand(null);
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
      setLastOperator(null);
      setLastOperand(null);
      return;
    }

    const currVal = Number(display);

    setAccumulator((prevAcc) => {
      if (operator != null && prevAcc != null) {
        // Standard case: we have a pending operator and accumulator
        const result = compute(prevAcc, currVal, operator);
        const out = formatNumber(result);
        setDisplay(out);
        setOverwrite(true);
        setHasTyped(false);
        // Store last op/operand for repeat '='
        setLastOperator(operator);
        setLastOperand(currVal);
        setOperator(null);
        return null;
      }

      // Repeat '=' behavior: no operator pending, but we have lastOperator and lastOperand
      if (lastOperator != null && lastOperand != null) {
        const base = Number(display);
        const result = compute(base, lastOperand, lastOperator);
        const out = formatNumber(result);
        setDisplay(out);
        setOverwrite(true);
        setHasTyped(false);
        // keep lastOperator/lastOperand for further repeats
        return null;
      }

      // Nothing to do
      return prevAcc;
    });
  }, [compute, display, operator, lastOperator, lastOperand]);

  const doClear = useCallback((forceAll = false) => {
    // If forceAll is true, behave as AC regardless of hasTyped
    if (forceAll || !hasTyped) {
      // All clear
      setDisplay('0');
      setAccumulator(null);
      setOperator(null);
      setOverwrite(true);
      setHasTyped(false);
      setLastOperator(null);
      setLastOperand(null);
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

  // Button layout: standard 4x5 with wide zero and right column operators
  const keys = [
    clearLabel, '÷', '×', '-',
    '7','8','9','+',
    '4','5','6','=',
    '1','2','3','.',
    '0' // will span two columns via CSS class
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
            className={`key ${k === '0' ? 'key-zero' : ''}`}
            onClick={() => press(k)}
            onMouseDown={() => {
              if (k === 'AC' || k === 'C') {
                // Long press to force AC
                resetLongPressTimer();
                clearPressTimer.current = window.setTimeout(() => {
                  doClear(true);
                }, 600);
              }
            }}
            onMouseUp={resetLongPressTimer}
            onMouseLeave={resetLongPressTimer}
            aria-label={`Key ${k}`}
          >
            {k}
          </button>
        ))}
      </div>
    </div>
  );
}
