import React, { useEffect, useRef, useState } from 'react';
import './terminal.css';

// In-memory mock filesystem tree
const initialFS = {
  '/': { type: 'dir', children: ['home', 'apps'] },
  '/home': { type: 'dir', children: ['user'] },
  '/home/user': { type: 'dir', children: ['readme.txt'] },
  '/home/user/readme.txt': { type: 'file', content: 'Welcome to the demo terminal.\nTry: ls, cd, echo, pwd, help' },
  '/apps': { type: 'dir', children: [] },
};

function pathJoin(base, next) {
  if (next.startsWith('/')) return next;
  if (base === '/') return `/${next}`;
  return `${base}/${next}`;
}
function normalize(path) {
  const parts = path.split('/').filter(Boolean);
  const stack = [];
  for (const p of parts) {
    if (p === '.') continue;
    if (p === '..') stack.pop();
    else stack.push(p);
  }
  return '/' + stack.join('/');
}

// PUBLIC_INTERFACE
export function TerminalApp() {
  /** A minimal shell prompt simulator. */
  const [fs, setFs] = useState(initialFS);
  const [cwd, setCwd] = useState('/home/user');
  const [lines, setLines] = useState([
    'WebOS Terminal - type "help" for commands.'
  ]);
  const [input, setInput] = useState('');
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  const append = (text) => setLines(prev => prev.concat(text));

  const cmd_ls = (args) => {
    const target = normalize(args[0] ? pathJoin(cwd, args[0]) : cwd);
    const node = fs[target];
    if (!node || node.type !== 'dir') {
      append(`ls: cannot access '${args[0] || ''}': No such directory`);
      return;
    }
    const out = (node.children || []).join('  ');
    append(out);
  };
  const cmd_cd = (args) => {
    const target = normalize(args[0] ? pathJoin(cwd, args[0]) : '/home/user');
    const node = fs[target];
    if (!node || node.type !== 'dir') {
      append(`cd: ${args[0] || ''}: Not a directory`);
      return;
    }
    setCwd(target || '/');
  };
  const cmd_pwd = () => append(cwd);
  const cmd_echo = (args) => append(args.join(' '));
  const cmd_cat = (args) => {
    const target = normalize(args[0] ? pathJoin(cwd, args[0]) : '');
    const node = fs[target];
    if (!node || node.type !== 'file') {
      append(`cat: ${args[0] || ''}: No such file`);
      return;
    }
    append(node.content || '');
  };
  const cmd_help = () => {
    append('Commands:');
    append('  ls [dir]       List directory');
    append('  cd [dir]       Change directory');
    append('  pwd            Print working directory');
    append('  echo [text]    Print text');
    append('  cat [file]     Show file contents');
    append('  clear          Clear screen');
    append('  help           Show help');
  };

  const onEnter = () => {
    const raw = input.trim();
    const prompt = `webos:${cwd}$ ${raw}`;
    append(prompt);
    if (!raw) {
      setInput('');
      return;
    }
    const [cmd, ...args] = raw.split(/\s+/);
    switch (cmd) {
      case 'ls': cmd_ls(args); break;
      case 'cd': cmd_cd(args); break;
      case 'pwd': cmd_pwd(); break;
      case 'echo': cmd_echo(args); break;
      case 'cat': cmd_cat(args); break;
      case 'help': cmd_help(); break;
      case 'clear': setLines([]); break;
      default: append(`${cmd}: command not found`);
    }
    setInput('');
  };

  return (
    <div className="term-root" onClick={() => document.getElementById('term-input')?.focus()}>
      <div className="term-screen" aria-live="polite">
        {lines.map((l, i) => <div className="term-line" key={i}>{l}</div>)}
        <div ref={endRef} />
      </div>
      <div className="term-input-row">
        <span className="term-prompt">webos:{cwd}$</span>
        <input
          id="term-input"
          className="term-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') onEnter(); }}
          autoFocus
          aria-label="Terminal input"
        />
      </div>
    </div>
  );
}
