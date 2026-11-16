/* App engine: Python runner, charts, map, level player, flashcards, playground. */
const FLAT = [];
CHAPTERS.forEach((c, ci) => c.levels.forEach((l, li) => { l.id = 'c' + ci + 'l' + li; l.ch = ci; l.li = li; l.idx = FLAT.length; FLAT.push(l); }));

/* ============================== HELPERS ============================== */
const $ = (s, r = document) => r.querySelector(s);
function el(tag, attrs, ...kids){
  const n = document.createElement(tag);
  for(const k in (attrs || {})){
    const v = attrs[k];
    if(k === 'html') n.innerHTML = v; else if(k === 'text') n.textContent = v;
    else if(k.startsWith('on')) n.addEventListener(k.slice(2), v);
    else if(v === true) n.setAttribute(k, ''); else if(v !== false && v != null) n.setAttribute(k, v);
  }
  kids.flat().forEach(c => { if(c != null && c !== false) n.append(c); });
  return n;
}
const shuffle = a => { a = a.slice(); for(let i = a.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const ymd = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const today = () => ymd(new Date());
const dayBefore = s => { const [y, m, d] = s.split('-').map(Number); return ymd(new Date(y, m - 1, d - 1)); };

/* ============================== SAVE ============================== */
const KEY = 'understanding-data-v1';
let S = {xp: 0, done: {}, streak: {last: '', n: 0}, unlockAll: false};
try{ const r = localStorage.getItem(KEY); if(r) S = Object.assign(S, JSON.parse(r)); }catch(_){}
const save = () => { try{ localStorage.setItem(KEY, JSON.stringify(S)); }catch(_){} };
function touchStreak(){
  const t = today(); if(S.streak.last === t) return;
  S.streak.n = S.streak.last === dayBefore(t) ? S.streak.n + 1 : 1; S.streak.last = t;
}
function liveStreak(){ const t = today(); return (S.streak.last === t || S.streak.last === dayBefore(t)) ? S.streak.n : 0; }
function rankInfo(){
  let i = 0; RANKS.forEach((r, k) => { if(S.xp >= r[0]) i = k; });
  const next = RANKS[i + 1], base = RANKS[i][0];
  return {name: RANKS[i][1], next: next ? next[1] : null, pct: next ? Math.round((S.xp - base) / (next[0] - base) * 100) : 100, toGo: next ? next[0] - S.xp : 0};
}
function header(){ $('#hXp').textContent = S.xp; $('#hStreak').textContent = liveStreak(); }
const unlocked = l => S.unlockAll || l.li === 0 || !!S.done[FLAT[l.idx - 1].id];

/* ============================== PYTHON ENGINE ============================== */
let worker = null, pyReady = null, pyResolve = null, pending = new Map(), msgId = 0, pyFailed = false;
function setPy(state, txt){ $('#pyDot').className = 'dot ' + state; $('#pyTxt').textContent = txt; }
function startWorker(){
  pyReady = new Promise(r => pyResolve = r);
  try{
    // Served over http(s): use the Python runtime bundled in ./pyodide. Opened as a plain file: fall back to the CDN.
    const cfg = {base: location.protocol !== 'file:' ? new URL('pyodide/', location.href).href : 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/', sklearn: window.SKLEARN_LITE || ''};
    const url = URL.createObjectURL(new Blob(['const CFG = ' + JSON.stringify(cfg) + ';\n' + $('#workerSrc').textContent], {type: 'text/javascript'}));
    worker = new Worker(url);
  }catch(e){ pyFailed = true; setPy('fail', 'Python unavailable'); pyResolve(false); return; }
  setPy('', 'Loading Python…');
  worker.onmessage = e => {
    const d = e.data;
    if(d.ready){ pyFailed = false; setPy('ready', 'Python ready'); pyResolve(true); return; }
    if(d.fatal){ pyFailed = true; setPy('fail', 'Python failed to load'); pyResolve(false); return; }
    const p = pending.get(d.id); if(!p) return;
    if(d.phase === 'load'){ setPy('', 'Loading libraries…'); return; }
    if(d.phase === 'run'){ setPy('ready', 'Python ready'); p.arm(); return; }
    pending.delete(d.id); clearTimeout(p.timer); setPy('ready', 'Python ready'); p.resolve(d);
  };
  worker.onerror = () => { pyFailed = true; setPy('fail', 'Python failed to load'); pyResolve(false); };
}
async function runPy(code, tests, pre){
  if(pyFailed) startWorker();
  const ok = await pyReady;
  if(!ok) return {fatal: true};
  return new Promise(resolve => {
    const id = ++msgId;
    const entry = {resolve, timer: null, arm(){
      entry.timer = setTimeout(() => { pending.delete(id); worker.terminate(); startWorker(); resolve({timeout: true}); }, 8000);
    }};
    pending.set(id, entry);
    worker.postMessage({id, code, tests: tests || null, pre: pre || null});
  });
}
const ERR_HELP = [
 [/^NameError/, 'Python doesn\'t know that name. Check the spelling — and remember that text needs quotes.'],
 [/^IndentationError|^TabError/, 'Check the indentation: lines inside an if, loop or function need 4 spaces, and lines that belong together must line up.'],
 [/^SyntaxError/, 'Python couldn\'t read that line. Look for a missing quote, bracket or colon.'],
 [/^TypeError/, 'Two types don\'t fit together here — for example text + number. str() or int() may help.'],
 [/^ZeroDivisionError/, 'You can\'t divide by zero.'],
 [/^IndexError/, 'That position doesn\'t exist. Remember positions start at 0.'],
 [/^KeyError/, 'That key or column name doesn\'t exist. Check the spelling and the capital letters.'],
 [/^ValueError/, 'The value has the right type but can\'t be used that way. With pandas or NumPy: combine conditions with & and | (and brackets), not "and" / "or".'],
 [/^AttributeError/, 'That tool (method) doesn\'t exist for this kind of value. Check the spelling.'],
 [/^ModuleNotFoundError/, 'That library isn\'t available here. numpy, pandas and sklearn are.'],
 [/^ImportError/, 'This app has a small built-in sklearn with: LinearRegression, LogisticRegression, DecisionTreeClassifier, export_text, MultinomialNB, CountVectorizer and train_test_split.'],
];
function explain(err){
  const h = ERR_HELP.find(x => x[0].test(err.last));
  return (err.line ? 'Line ' + err.line + ' — ' : '') + err.last + (h ? '\n\n💡 ' + h[1] : '');
}
function resultText(r){
  if(r.fatal) return ['', 'Python could not be loaded. Check your internet connection and try again.'];
  if(r.timeout) return ['', 'Your code ran for too long and was stopped. Is there a loop that never ends?'];
  return [r.stdout, r.err ? explain(r.err) : ''];
}
/* Grades a code step. Returns null when it passes, otherwise {msg, pre}. */
function grade(step, code, r){
  if(r.err) return {msg: 'Your code has an error — read the red message in the output.'};
  const c = step.check, bare = code.replace(/#.*$/gm, '');
  if(c.need){
    const has = alt => /^\w+$/.test(alt) ? new RegExp('\\b' + alt + '\\b').test(bare) : bare.includes(alt);
    const miss = c.need.find(n => !n.split('|').some(has));
    if(miss) return {msg: 'It runs, but this challenge asks you to use:  ' + miss.replace(/\|/g, ' or ')};
  }
  if(c.out){
    const clean = r.stdout.split('\n').map(x => x.replace(/\s+$/, '')).join('\n').replace(/\n+$/, '');
    if(clean !== c.out.join('\n')) return {msg: 'The output doesn\'t match the goal yet.', pre: 'Expected:\n' + c.out.join('\n') + '\n\nYours:\n' + (clean || '(nothing)')};
  }
  if(r.testErr){
    const m = r.testErr.last;
    if(/^AssertionError/.test(m)) return {msg: m.replace(/^AssertionError:?\s*/, '') || 'Not quite right yet.'};
    if(/^NameError/.test(m)) return {msg: 'I couldn\'t find something I was looking for: ' + m.replace(/^NameError:\s*/, '') + '. Check that you used exactly the name from the task.'};
    return {msg: 'Your code broke when I tested it: ' + m};
  }
  return null;
}

/* ============================== CHARTS ============================== */
function drawChart(c){
  const NS = 'http://www.w3.org/2000/svg', W = 520, H = 250, m = {l: 46, r: 14, t: c.title ? 28 : 12, b: 30};
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.setAttribute('width', W); svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', (c.title || c.k) + ' chart');
  const add = (tag, a, txt) => { const n = document.createElementNS(NS, tag); for(const k in a) n.setAttribute(k, a[k]); if(txt != null) n.textContent = txt; svg.append(n); return n; };
  const num = v => Math.abs(v) >= 100 ? String(Math.round(v)) : String(Math.round(v * 100) / 100);
  const ink = '#22262E', dim = '#6B7280', blue = '#2B5F8A', gold = '#E2A91B';
  const pw = W - m.l - m.r, ph = H - m.t - m.b, x0 = m.l, y0 = m.t + ph;
  const text = (x, y, s, anchor, fill) => add('text', {x, y, 'text-anchor': anchor || 'middle', 'font-size': 11, 'font-family': 'system-ui,sans-serif', fill: fill || dim}, s);
  if(c.title) add('text', {x: W / 2, y: 17, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, 'font-family': 'system-ui,sans-serif', fill: ink}, c.title);
  const axes = () => { add('line', {x1: x0, y1: m.t, x2: x0, y2: y0, stroke: dim}); add('line', {x1: x0, y1: y0, x2: x0 + pw, y2: y0, stroke: dim}); };
  if(c.k === 'bar' || c.k === 'hist'){
    let labels, vals;
    if(c.k === 'hist'){
      const v = c.values.filter(Number.isFinite); let lo = Math.min(...v), hi = Math.max(...v); if(!(hi > lo)) hi = lo + 1;
      const nb = Math.max(1, Math.min(60, c.bins)); vals = new Array(nb).fill(0);
      v.forEach(x => { vals[Math.min(nb - 1, Math.floor((x - lo) / (hi - lo) * nb))]++; });
      labels = vals.map(() => ''); text(x0, H - 10, num(lo), 'start'); text(x0 + pw / 2, H - 10, num((lo + hi) / 2)); text(x0 + pw, H - 10, num(hi), 'end');
    }else{ labels = c.labels; vals = c.values; }
    const n = vals.length || 1, top = Math.max(0, ...vals) || 1, bot = Math.min(0, ...vals);
    const ys = v => y0 - (v - bot) / (top - bot) * ph, bw = pw / n, gap = c.k === 'hist' ? 1 : bw * 0.18;
    vals.forEach((v, i) => {
      const ya = ys(Math.max(v, 0)), yb = ys(Math.min(v, 0));
      add('rect', {x: x0 + i * bw + gap, y: ya, width: Math.max(1, bw - 2 * gap), height: Math.max(0, yb - ya), fill: blue, rx: c.k === 'hist' ? 0 : 3});
      if(c.k === 'bar'){
        if(n <= 14) text(x0 + i * bw + bw / 2, ya - 4, num(v), 'middle', ink);
        if(n <= 16 || i % Math.ceil(n / 12) === 0) text(x0 + i * bw + bw / 2, H - 10, String(labels[i]).slice(0, Math.max(3, Math.floor(bw / 6.5))));
      }
    });
    axes(); text(x0 - 6, m.t + 9, num(top), 'end'); text(x0 - 6, ys(0) + 3, '0', 'end');
  }else{
    const xs = c.x, ysv = c.y; let xa = Math.min(...xs), xb = Math.max(...xs), ya = Math.min(...ysv), yb = Math.max(...ysv);
    if(!(xb > xa)) xb = xa + 1;
    if(c.line){ [xa, xb].forEach(x => { const y = c.line[0] * x + c.line[1]; ya = Math.min(ya, y); yb = Math.max(yb, y); }); }
    if(!(yb > ya)) yb = ya + 1;
    const padx = (xb - xa) * 0.05, pady = (yb - ya) * 0.08; const X = v => x0 + (v - (xa - padx)) / (xb - xa + 2 * padx) * pw, Y = v => y0 - (v - (ya - pady)) / (yb - ya + 2 * pady) * ph;
    axes();
    text(X(xa), H - 10, num(xa)); text(X(xb), H - 10, num(xb)); text(x0 - 6, Y(ya) + 3, num(ya), 'end'); text(x0 - 6, Y(yb) + 3, num(yb), 'end');
    if(c.k === 'line') add('polyline', {points: xs.map((x, i) => X(x) + ',' + Y(ysv[i])).join(' '), fill: 'none', stroke: blue, 'stroke-width': 2});
    else xs.forEach((x, i) => add('circle', {cx: X(x), cy: Y(ysv[i]), r: xs.length > 300 ? 2 : 4, fill: blue, 'fill-opacity': .8}));
    if(c.line) add('line', {x1: X(xa), y1: Y(c.line[0] * xa + c.line[1]), x2: X(xb), y2: Y(c.line[0] * xb + c.line[1]), stroke: gold, 'stroke-width': 2.5});
  }
  return svg;
}

/* ============================== EDITOR ============================== */
function editor(value, rows){
  const ta = el('textarea', {class: 'ed', spellcheck: 'false', autocapitalize: 'off', autocomplete: 'off', autocorrect: 'off', rows: rows || 8, 'aria-label': 'Code editor'});
  ta.value = value || '';
  ta.addEventListener('keydown', e => {
    const s = ta.selectionStart, en = ta.selectionEnd, v = ta.value;
    const put = (txt, from, to) => { ta.setRangeText(txt, from, to, 'end'); ta.dispatchEvent(new Event('input')); };
    if(e.key === 'Tab' && !e.shiftKey){ e.preventDefault(); put('    ', s, en); }
    else if(e.key === 'Enter' && !e.metaKey && !e.ctrlKey){
      e.preventDefault();
      const line = v.slice(v.lastIndexOf('\n', s - 1) + 1, s);
      let ind = line.match(/^ */)[0]; if(/:\s*$/.test(line)) ind += '    ';
      put('\n' + ind, s, en);
    }else if(e.key === 'Backspace' && s === en){
      const line = v.slice(v.lastIndexOf('\n', s - 1) + 1, s);
      if(line.length && /^ +$/.test(line) && line.length % 4 === 0){ e.preventDefault(); put('', s - 4, s); }
    }
  });
  return ta;
}
function outBox(){
  const box = el('div', {class: 'out', 'aria-live': 'polite'}, el('span', {class: 'lab', text: 'Output'}));
  box.show = (text, err, charts) => {
    box.replaceChildren(el('span', {class: 'lab', text: 'Output'}));
    if(text) box.append(document.createTextNode(text));
    (charts || []).forEach(c => { try{ box.append(drawChart(c)); }catch(_){} });
    if(err) box.append(el('div', {class: 'err', text: (text ? '\n' : '') + err}));
    if(!text && !err && !(charts || []).length) box.append(el('span', {class: 'lab', text: '(nothing was printed)'}));
  };
  box.result = r => { const [t, e] = resultText(r); box.show(t, e, r.charts); };
  return box;
}
const preBlock = step => step.pre ? el('details', {class: 'pre'}, el('summary', {text: '📦 Data already loaded for you (tap to see how)'}), el('pre', {class: 'code', text: step.pre})) : null;

/* ============================== MAP ============================== */
function renderMap(){
  const q = $('#quest'); q.replaceChildren();
  const r = rankInfo(), doneN = FLAT.filter(l => S.done[l.id]).length;
  const next = FLAT.find(l => !S.done[l.id] && unlocked(l) && (l.li > 0 || l.ch === 0 || CHAPTERS[l.ch - 1].levels.every(x => S.done[x.id]))) || FLAT.find(l => !S.done[l.id]);
  q.append(el('div', {class: 'card'},
    el('div', {class: 'hero'},
      el('div', {style: 'flex:1;min-width:220px'},
        el('h1', {text: doneN ? 'Welcome back, analyst' : 'Learn to make data talk'}),
        el('p', {class: 'muted', text: doneN ? doneN + ' of ' + FLAT.length + ' cases closed.' : 'Warm up with Python, then join the Bean & Byte café as its first data analyst: clean real tables, test hunches with statistics, build four prediction models by hand, and learn to read results without fooling yourself. Every chapter\'s first level is open — start wherever you like.'}),
        el('div', {class: 'row', style: 'margin:8px 0 6px'}, el('span', {class: 'rank', text: r.name}), el('span', {class: 'muted', text: r.next ? r.toGo + ' XP to ' + r.next : 'Top rank reached!'})),
        el('div', {class: 'bar'}, el('i', {style: 'width:' + r.pct + '%'}))),
      next ? el('button', {class: 'btn gold', onclick: () => startLevel(next), text: (doneN ? 'Continue: ' : 'Start: ') + next.name}) : el('span', {class: 'rank', text: '🏆 All cases closed!'})
    )));
  let part = '';
  CHAPTERS.forEach((c, ci) => {
    if(c.part !== part){ part = c.part; q.append(el('div', {class: 'part', text: part})); }
    const grid = el('div', {class: 'levels'});
    c.levels.forEach(l => {
      const open = unlocked(l), d = S.done[l.id];
      const stars = d ? '★'.repeat(d.stars) + '☆'.repeat(3 - d.stars) : (open ? 'Ready' : '🔒 Locked');
      grid.append(el('button', {class: 'lvl' + (next && next.id === l.id ? ' next' : ''), disabled: !open, onclick: () => startLevel(l), 'aria-label': l.name + (d ? ', ' + d.stars + ' stars' : open ? '' : ', locked')},
        el('b', {text: l.name}),
        el('span', {class: 'st' + (d ? '' : ' none'), text: stars}),
        el('span', {class: 'muted', style: 'font-size:13px', text: l.steps.length + ' steps'})));
    });
    const keys = c.terms && c.terms.length ? el('details', {class: 'keys'}, el('summary', {text: 'Key ideas'}), el('dl', {}, c.terms.map(t => [el('dt', {text: t[0]}), el('dd', {text: t[1]})]))) : null;
    q.append(el('div', {class: 'card'},
      el('div', {class: 'world-head'}, el('div', {class: 'world-num', text: ci + 1}),
        el('div', {}, el('h2', {text: c.name}), el('div', {class: 'muted', text: c.blurb}))),
      keys, grid));
  });
  header();
}

/* ============================== LEVEL PLAYER ============================== */
let G = null;
function startLevel(level){
  G = {level, queue: level.steps.map((s, i) => i), cleared: new Set(), failed: new Set(), mistakes: 0, combo: 0, gained: 0};
  show('player'); renderStep();
}
function quitLevel(){ G = null; show('quest'); }
function award(i, step, clean){
  const pts = Math.round(XP[step.t] * (CHAPTERS[G.level.ch].boss ? 1.6 : 1) * (clean ? 1 : .5));
  G.gained += pts; S.xp += pts; touchStreak(); save(); header(); return pts;
}
function markWrong(i){ G.mistakes++; G.combo = 0; G.failed.add(i); }
function nextStep(requeue){
  const i = G.queue.shift();
  if(requeue) G.queue.push(i); else G.cleared.add(i);
  G.queue.length ? renderStep() : finishLevel();
}
function renderStep(){
  const P = $('#player'); P.replaceChildren();
  const i = G.queue[0], step = G.level.steps[i], total = G.level.steps.length, boss = CHAPTERS[G.level.ch].boss;
  P.append(el('div', {class: 'phead'},
    el('button', {class: 'x', 'aria-label': 'Leave level', title: 'Leave level', onclick: quitLevel, text: '✕'}),
    el('div', {class: 'bar'}, el('i', {style: 'width:' + Math.round(G.cleared.size / total * 100) + '%'})),
    el('div', {class: 'combo', text: G.combo >= 2 ? '🔥 ' + G.combo : ''})));
  const card = el('div', {class: 'card'}); P.append(card);
  const foot = el('div', {class: 'foot'}), fbSlot = el('div', {});
  const cont = (requeue, label) => {
    const b = el('button', {class: 'btn', text: label || 'Continue', onclick: () => nextStep(requeue)});
    foot.replaceChildren(el('span', {class: 'spacer'}), b); b.focus();
  };
  const feedback = (ok, title, body, pre) => {
    fbSlot.replaceChildren(el('div', {class: 'fb ' + (ok === true ? 'ok' : ok === false ? 'no' : 'tip')}, el('b', {text: title}), body ? el('span', {text: body}) : null, pre ? el('pre', {text: pre}) : null));
  };
  const right = body => { G.combo++; const pts = award(i, step, !G.failed.has(i)); feedback(true, 'Correct!  +' + pts + ' XP', body); cont(false); };
  const again = ' You\'ll see this one again at the end.';
  const KIND = {learn: 'Learn', mc: 'Quick question', fill: 'Fill the gap', order: 'Put in order', bug: 'Spot the bug', code: boss ? 'Boss challenge' : 'Code challenge'};
  card.append(el('div', {class: 'kind', text: KIND[step.t]}));

  if(step.t === 'learn'){
    card.append(el('h2', {text: step.title, style: 'font-size:22px;margin:4px 0 10px'}), el('div', {html: step.body}));
    if(step.code){
      card.append(preBlock(step) || '', el('pre', {class: 'code', text: step.code}));
      const ob = outBox(); ob.classList.add('hidden');
      const tryBtn = el('button', {class: 'btn ghost small', text: '▶ Run this example', onclick: async () => {
        tryBtn.disabled = true; ob.classList.remove('hidden'); ob.show('Running…');
        const r = await runPy(step.code, null, step.pre); tryBtn.disabled = false; ob.result(r);
      }});
      card.append(tryBtn, ob);
    }
    card.append(foot); cont(false, 'Got it');
  }

  else if(step.t === 'mc'){
    card.append(el('div', {class: 'q', html: step.q}));
    if(step.code) card.append(preBlock(step) || '', el('pre', {class: 'code', text: step.code}));
    const correct = step.opts[0], btns = [];
    shuffle(step.opts).forEach(o => {
      const b = el('button', {class: 'opt', text: o, onclick: () => {
        btns.forEach(x => { x.disabled = true; if(x.textContent === correct) x.classList.add('right'); });
        if(o === correct) right(step.why);
        else{ b.classList.add('wrong'); markWrong(i); feedback(false, 'Not quite.', step.why + again); cont(true); }
      }});
      btns.push(b); card.append(b);
    });
    card.append(fbSlot, foot);
  }

  else if(step.t === 'bug'){
    card.append(el('div', {class: 'q', html: step.q}), el('div', {class: 'muted', style: 'font-size:14px', text: 'Tap the line that contains the bug.'}));
    const box = el('div', {class: 'buglines'}), btns = [];
    step.lines.forEach((ln, k) => {
      const b = el('button', {class: 'bugline', text: ln, onclick: () => {
        btns.forEach((x, j) => { x.disabled = true; if(j === step.bad) x.classList.add('right'); });
        if(k === step.bad) right(step.why);
        else{ b.classList.add('wrong'); markWrong(i); feedback(false, 'Not that line.', step.why + again); cont(true); }
      }});
      btns.push(b); box.append(b);
    });
    card.append(box, fbSlot, foot);
  }

  else if(step.t === 'fill'){
    card.append(el('div', {class: 'q', html: step.q}));
    const box = el('div', {class: 'fillbox'}), parts = step.code.split('___');
    const inp = el('input', {type: 'text', spellcheck: 'false', autocapitalize: 'off', autocomplete: 'off', autocorrect: 'off', 'aria-label': 'Missing code'});
    box.append(document.createTextNode(parts[0]), inp, document.createTextNode(parts[1] || ''));
    card.append(box, fbSlot, foot);
    const norm = s => s.replace(/\s+/g, '').replace(/'/g, '"');
    let tries = 0;
    const check = () => {
      if(!inp.value.trim()) return;
      if(step.answers.some(a => norm(a) === norm(inp.value))){ inp.disabled = true; right(step.why); }
      else{
        tries++;
        if(tries === 1){ markWrong(i); feedback(false, 'Not quite — try once more.'); inp.select(); }
        else{ inp.disabled = true; feedback(false, 'The answer is:  ' + step.answers[0], step.why + again); cont(true); }
      }
    };
    foot.append(el('span', {class: 'spacer'}), el('button', {class: 'btn', text: 'Check', onclick: check}));
    inp.addEventListener('keydown', e => { if(e.key === 'Enter'){ e.preventDefault(); if(!inp.disabled) check(); } });
    setTimeout(() => inp.focus(), 0);
  }

  else if(step.t === 'order'){
    card.append(el('div', {class: 'q', html: step.q}));
    let pool = shuffle(step.lines), guard = 0;
    while(pool.join('\n') === step.lines.join('\n') && guard++ < 10) pool = shuffle(step.lines);
    const ans = el('div', {class: 'zone', 'data-empty': 'Tap the lines below in the right order…', 'aria-label': 'Your program'});
    const src = el('div', {class: 'zone pool', 'data-empty': 'All lines used.', 'aria-label': 'Available lines'});
    let locked = false, tries = 0;
    const cb = el('button', {class: 'btn', text: 'Check', disabled: true, onclick: () => {
      const got = [...ans.children].map(c => c.textContent).join('\n');
      if(got === step.lines.join('\n')){ locked = true; cb.disabled = true; right(step.why); }
      else{
        tries++;
        if(tries === 1){ markWrong(i); feedback(false, 'Not in the right order yet — tap a line to send it back and try again.'); }
        else{ locked = true; feedback(false, 'Here is the right order:', step.why + again, step.lines.join('\n')); cont(true); }
      }
    }});
    pool.forEach(t => { const c = el('button', {class: 'chip', text: t, onclick: () => { if(locked) return; (c.parentNode === src ? ans : src).append(c); cb.disabled = src.children.length > 0; }}); src.append(c); });
    card.append(el('div', {class: 'muted', style: 'font-size:13px', text: 'Your program'}), ans, el('div', {class: 'muted', style: 'font-size:13px', text: 'Lines'}), src, fbSlot, foot);
    foot.append(el('span', {class: 'spacer'}), cb);
  }

  else if(step.t === 'code'){
    card.append(el('div', {class: 'q', html: step.q}));
    if(step.check.out) card.append(el('div', {class: 'goal'}, el('b', {text: 'Goal output'}), el('pre', {text: step.check.out.join('\n')})));
    card.append(preBlock(step) || '');
    const ed = editor(step.starter, Math.max(7, (step.starter || '').split('\n').length + 5));
    const ob = outBox(); let fails = 0, solved = false, usedSolution = false, busy = false;
    const runBtn = el('button', {class: 'btn ghost', text: '▶ Run'}), checkBtn = el('button', {class: 'btn', text: '✓ Check'});
    const hintBtn = el('button', {class: 'btn ghost small', text: '💡 Hint', onclick: () => feedback(null, 'Hint', step.hint)});
    const solBtn = el('button', {class: 'btn ghost small hidden', text: 'Show solution', onclick: () => { usedSolution = true; if(!G.failed.has(i)) markWrong(i); feedback(null, 'One way to solve it — type it in yourself, then press Check:', '', step.sol); }});
    const bad = (msg, pre) => { fails++; if(fails === 3) markWrong(i); G.combo = 0; feedback(false, 'Not yet.', msg, pre); if(fails >= 3) solBtn.classList.remove('hidden'); };
    const go = async doCheck => {
      if(busy || solved) return; busy = true; runBtn.disabled = checkBtn.disabled = true;
      ob.show('Running…'); const code = ed.value;
      const r = await runPy(code, doCheck ? (step.check.tests || null) : null, step.pre);
      busy = false; runBtn.disabled = checkBtn.disabled = false;
      ob.result(r);
      if(r.fatal || !doCheck) return;
      if(r.timeout){ bad('Stopped: the program never finished.'); return; }
      if(!code.trim()){ feedback(false, 'Write some code first.'); return; }
      const g = grade(step, code, r);
      if(g){ bad(g.msg, g.pre); return; }
      solved = true; ed.readOnly = true; G.combo++;
      const pts = award(i, step, !G.failed.has(i) && !usedSolution);
      feedback(true, 'It works!  +' + pts + ' XP', fails === 0 ? 'First try. Nice.' : 'Persistence pays off.');
      cont(false);
    };
    runBtn.onclick = () => go(false); checkBtn.onclick = () => go(true);
    ed.addEventListener('keydown', e => { if(e.key === 'Enter' && (e.metaKey || e.ctrlKey)){ e.preventDefault(); go(true); } });
    foot.append(hintBtn, solBtn, el('span', {class: 'spacer'}), runBtn, checkBtn);
    card.append(ed, ob, fbSlot, foot, el('div', {class: 'muted', style: 'font-size:13px;margin-top:8px', text: 'Run shows what your code prints. Check tests it. Shortcut: Ctrl/⌘ + Enter.'}));
    setTimeout(() => { ed.focus(); ed.setSelectionRange(ed.value.length, ed.value.length); }, 0);
  }
  window.scrollTo(0, 0);
}
function finishLevel(){
  const level = G.level, stars = G.mistakes === 0 ? 3 : G.mistakes <= 2 ? 2 : 1;
  const prev = S.done[level.id], first = !prev, bonus = first ? 20 : 0; S.xp += bonus;
  S.done[level.id] = {stars: Math.max(stars, prev ? prev.stars : 0)}; touchStreak(); save(); header();
  const nxt = FLAT[level.idx + 1], all = FLAT.every(l => S.done[l.id]);
  const P = $('#player'); P.replaceChildren();
  const st = el('div', {class: 'bigstars', 'aria-label': stars + ' of 3 stars'});
  for(let k = 0; k < 3; k++) st.append(el('span', {class: k < stars ? '' : 'off', text: '★'}));
  P.append(el('div', {class: 'card finish'}, st,
    el('h1', {text: stars === 3 ? 'Flawless!' : stars === 2 ? 'Great work!' : 'Level cleared!'}),
    el('p', {class: 'muted', text: level.name + ' complete  ·  +' + (G.gained + bonus) + ' XP' + (bonus ? ' (includes +20 first-clear bonus)' : '')}),
    level.finding ? el('div', {class: 'case', style: 'text-align:left;max-width:560px;margin:14px auto'}, el('b', {text: '📁 Case closed: '}), level.finding) : null,
    el('p', {text: all && first ? '🏆 Every case is closed. You can clean data, test a hunch and build a model.' : stars < 3 ? 'Replay any time to go for 3 stars.' : 'Rank: ' + rankInfo().name}),
    el('div', {class: 'row', style: 'justify-content:center;margin-top:14px'},
      el('button', {class: 'btn ghost', text: 'Back to cases', onclick: quitLevel}),
      stars < 3 ? el('button', {class: 'btn ghost', text: 'Replay', onclick: () => startLevel(level)}) : null,
      nxt ? el('button', {class: 'btn gold', text: 'Next: ' + nxt.name, onclick: () => startLevel(nxt)}) : null)));
  confetti(stars);
  const b = P.querySelector('.btn.gold') || P.querySelector('.btn'); if(b) b.focus();
}
function confetti(stars){
  const cols = ['#E2A91B', '#2B5F8A', '#2C7A4B', '#D9584F', '#8A5FBF'];
  for(let k = 0; k < stars * 16; k++){
    const c = el('i', {class: 'conf', style: 'left:' + Math.random() * 100 + 'vw;background:' + cols[k % cols.length] + ';animation-duration:' + (1.6 + Math.random() * 1.8) + 's;animation-delay:' + Math.random() * .5 + 's'});
    document.body.append(c); setTimeout(() => c.remove(), 4200);
  }
}

/* ============================== FLASHCARDS ============================== */
let F = {deck: [], i: 0, flip: false, ch: 'all'};
function renderFlash(){
  const s = $('#flash'); s.replaceChildren();
  const sel = el('select', {'aria-label': 'Chapter'}, el('option', {value: 'all', text: 'All chapters'}), CHAPTERS.map((c, ci) => c.terms && c.terms.length ? el('option', {value: ci, text: (ci + 1) + '. ' + c.name}) : null));
  sel.value = F.ch;
  const build = () => { F.deck = []; CHAPTERS.forEach((c, ci) => { if(F.ch === 'all' || String(ci) === String(F.ch)) (c.terms || []).forEach(t => F.deck.push([t[0], t[1], c.name])); }); F.i = 0; F.flip = false; };
  if(!F.deck.length) build();
  const card = el('div', {class: 'card flash', tabindex: 0, role: 'button', 'aria-label': 'Flashcard, press to flip'}), count = el('span', {class: 'muted'});
  const draw = () => {
    const [t, d, ch] = F.deck[F.i];
    card.replaceChildren(F.flip ? el('div', {class: 'back', text: d}) : el('div', {class: 'front', text: t}), el('div', {class: 'muted', style: 'font-size:13px', text: F.flip ? ch : 'Tap or press Space to flip'}));
    count.textContent = 'Card ' + (F.i + 1) + ' of ' + F.deck.length;
  };
  const turn = () => { F.flip = !F.flip; draw(); }, move = d => { F.i = (F.i + d + F.deck.length) % F.deck.length; F.flip = false; draw(); };
  card.addEventListener('click', turn);
  card.addEventListener('keydown', e => { if(e.key === ' ' || e.key === 'Enter'){ e.preventDefault(); turn(); } if(e.key === 'ArrowRight') move(1); if(e.key === 'ArrowLeft') move(-1); });
  sel.addEventListener('change', () => { F.ch = sel.value; build(); draw(); });
  s.append(el('div', {class: 'card'}, el('h2', {text: 'Flashcards'}), el('p', {class: 'muted', text: 'The key ideas from every chapter. Say the meaning out loud before you flip.'}), el('div', {class: 'row'}, sel, count)),
    card,
    el('div', {class: 'row', style: 'justify-content:center'}, el('button', {class: 'btn ghost', text: '← Previous', onclick: () => move(-1)}), el('button', {class: 'btn ghost', text: 'Shuffle', onclick: () => { F.deck = shuffle(F.deck); F.i = 0; F.flip = false; draw(); }}), el('button', {class: 'btn', text: 'Next →', onclick: () => move(1)})));
  draw();
}

/* ============================== PLAYGROUND ============================== */
function renderPlay(){
  const p = $('#play'); if(p.dataset.built) return; p.dataset.built = '1';
  let saved = ''; try{ saved = localStorage.getItem(KEY + '-play') || ''; }catch(_){}
  const ed = editor(saved || '# Try anything here. numpy, pandas and sklearn all work,\n# and chart.bar / chart.hist / chart.scatter / chart.line draw pictures.\nimport pandas as pd\n\nsales = pd.DataFrame({\n    "day": ["Mon", "Tue", "Wed", "Thu", "Fri"],\n    "cups": [120, 135, 128, 160, 210],\n})\nprint(sales.describe())\nchart.bar(sales["day"], sales["cups"], title="Cups sold")\n', 16);
  ed.addEventListener('input', () => { try{ localStorage.setItem(KEY + '-play', ed.value); }catch(_){} });
  const ob = outBox();
  const run = async () => { btn.disabled = true; ob.show('Running… (the first time a library is used it has to download)'); const r = await runPy(ed.value); btn.disabled = false; ob.result(r); };
  const btn = el('button', {class: 'btn', text: '▶ Run', onclick: run});
  ed.addEventListener('keydown', e => { if(e.key === 'Enter' && (e.metaKey || e.ctrlKey)){ e.preventDefault(); run(); } });
  p.append(el('div', {class: 'card'}, el('h2', {text: 'Playground'}),
    el('p', {class: 'muted', text: 'A free space to experiment. Nothing here is graded.'}),
    ed, el('div', {class: 'foot'}, el('span', {class: 'muted', style: 'font-size:13px', text: 'Ctrl/⌘ + Enter runs your code'}), el('span', {class: 'spacer'}),
      el('button', {class: 'btn ghost', text: 'Clear', onclick: () => { ed.value = ''; ed.dispatchEvent(new Event('input')); ed.focus(); }}), btn), ob));
}

/* ============================== CHEAT SHEET ============================== */
function renderSheet(){
  const s = $('#sheet'); s.replaceChildren();
  s.append(el('div', {class: 'card'}, el('h2', {text: 'Cheat sheet'}), el('p', {class: 'muted', text: 'Every lesson card in one place. A level\'s cards appear once that level is unlocked.'})));
  CHAPTERS.forEach((c, ci) => {
    if(!c.levels.some(l => l.steps.some(x => x.t === 'learn'))) return;
    const card = el('div', {class: 'card sheet'}, el('div', {class: 'world-head'}, el('div', {class: 'world-num', text: ci + 1}), el('h2', {text: c.name})));
    c.levels.forEach(l => {
      const lessons = l.steps.filter(x => x.t === 'learn'); if(!lessons.length) return;
      if(!unlocked(l)){ card.append(el('h3', {class: 'muted', text: '🔒 ' + l.name})); return; }
      lessons.forEach(st => { card.append(el('h3', {text: st.title}), el('div', {html: st.body})); if(st.code) card.append(el('pre', {class: 'code', text: st.code})); });
    });
    s.append(card);
  });
}

/* ============================== PROGRESS ============================== */
function renderSettings(){
  const s = $('#settings'); s.replaceChildren();
  const r = rankInfo(), stars = FLAT.reduce((a, l) => a + (S.done[l.id] ? S.done[l.id].stars : 0), 0);
  const row = (a, b) => el('tr', {}, el('td', {text: a, style: 'padding:6px 16px 6px 0;color:var(--muted)'}), el('td', {text: b, style: 'font-weight:700'}));
  const unlock = el('input', {type: 'checkbox', id: 'ua'}); unlock.checked = S.unlockAll;
  unlock.addEventListener('change', () => { S.unlockAll = unlock.checked; save(); });
  s.append(el('div', {class: 'card'}, el('h2', {text: 'Your progress'}),
    el('table', {}, row('Rank', r.name), row('XP', String(S.xp)), row('Cases closed', FLAT.filter(l => S.done[l.id]).length + ' / ' + FLAT.length), row('Stars', stars + ' / ' + FLAT.length * 3), row('Day streak', String(liveStreak())),
      CHAPTERS.map((c, ci) => row((ci + 1) + '. ' + c.name, c.levels.filter(l => S.done[l.id]).length + ' / ' + c.levels.length)))),
   el('div', {class: 'card'}, el('h2', {text: 'Options'}),
    el('label', {for: 'ua', class: 'row', style: 'cursor:pointer;margin:8px 0 14px'}, unlock, el('span', {text: 'Unlock every level'})),
    OFFLINE_FILES && 'caches' in window && location.protocol.startsWith('http') ? el('div', {style: 'margin:0 0 14px'}, offlineBtn(), el('div', {class: 'muted', style: 'font-size:13px;margin-top:6px', text: 'Downloads Python, NumPy and pandas (about 50 MB) so every level works with no connection.'})) : null,
    el('button', {class: 'btn ghost', text: 'Reset all progress', onclick: () => {
      if(confirm('Erase all XP, stars and your streak? This cannot be undone.')){ S = {xp: 0, done: {}, streak: {last: '', n: 0}, unlockAll: false}; save(); header(); renderSettings(); }
    }})));
}

/* ============================== OFFLINE ============================== */
const OFFLINE_FILES = ['pyodide.js', 'pyodide.asm.js', 'pyodide.asm.wasm', 'python_stdlib.zip', 'pyodide-lock.json',
  'numpy-1.26.4-cp312-cp312-pyodide_2024_0_wasm32.whl', 'pandas-2.2.0-cp312-cp312-pyodide_2024_0_wasm32.whl',
  'python_dateutil-2.9.0.post0-py2.py3-none-any.whl', 'pytz-2024.1-py2.py3-none-any.whl', 'six-1.16.0-py2.py3-none-any.whl'];
function offlineBtn(){
  const b = el('button', {class: 'btn', text: 'Make available offline'});
  let done = false; try{ done = localStorage.getItem(KEY + '-offline') === '1'; }catch(_){}
  if(done){ b.textContent = '✓ Available offline'; b.disabled = true; }
  b.addEventListener('click', async () => {
    b.disabled = true;
    try{
      for(const [i, f] of OFFLINE_FILES.entries()){
        b.textContent = 'Downloading ' + (i + 1) + ' of ' + OFFLINE_FILES.length + '…';
        const r = await fetch('pyodide/' + f); if(!r.ok) throw new Error(f); await r.arrayBuffer();   // the service worker stores it
      }
      try{ localStorage.setItem(KEY + '-offline', '1'); }catch(_){}
      b.textContent = '✓ Available offline';
    }catch(e){ b.textContent = 'Download failed — tap to retry'; b.disabled = false; }
  });
  return b;
}
if('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});

/* ============================== NAV ============================== */
const VIEWS = ['quest', 'player', 'flash', 'play', 'sheet', 'settings'];
function show(v){
  VIEWS.forEach(x => $('#' + x).classList.toggle('hidden', x !== v));
  const tab = v === 'player' ? 'quest' : v;
  document.querySelectorAll('#tabs button').forEach(b => b.setAttribute('aria-selected', String(b.dataset.t === tab)));
  if(v === 'quest') renderMap(); if(v === 'flash') renderFlash(); if(v === 'play') renderPlay(); if(v === 'sheet') renderSheet(); if(v === 'settings') renderSettings();
  window.scrollTo(0, 0);
}
$('#tabs').addEventListener('click', e => {
  const b = e.target.closest('button'); if(!b) return;
  if(G && b.dataset.t === 'quest'){ show('player'); return; }
  show(b.dataset.t);
});

/* ============================== SELF-TEST (for authors) ==============================
   Run  await __selftest()  in the browser console: it runs every reference solution through
   the real grader and every example through Python, and returns a list of problems. */
window.__selftest = async function(chapterFilter){
  const problems = [], squash = s => String(s).replace(/\s+/g, ' ').trim();
  for(const [ci, c] of CHAPTERS.entries()){
    if(chapterFilter != null && ![].concat(chapterFilter).includes(ci)) continue;
    for(const l of c.levels) for(const [si, st] of l.steps.entries()){
      const where = (ci + 1) + ' ' + l.name + ' #' + (si + 1) + ' ' + st.t;
      if(st.t === 'code'){
        const r = await runPy(st.sol, st.check.tests || null, st.pre);
        const g = r.timeout ? {msg: 'timeout'} : grade(st, st.sol, r);
        if(g) problems.push(where + ': ' + g.msg + (r.err ? ' | ' + r.err.last : '') + (g.pre ? ' | ' + g.pre : ''));
        const e = await runPy(st.starter || 'pass', st.check.tests || null, st.pre);
        if(!e.timeout && !grade(st, st.starter || '', e)) problems.push(where + ': starter code already passes');
      }else if((st.t === 'learn' || st.t === 'mc') && st.code){
        const r = await runPy(st.code, null, st.pre);
        if(r.timeout || r.err) problems.push(where + ': ' + (r.timeout ? 'timeout' : r.err.last));
        else if(st.t === 'mc' && squash(r.stdout) !== squash(st.opts[0])) problems.push(where + ': prints «' + squash(r.stdout) + '» but answer is «' + st.opts[0] + '»');
      }else if(st.t === 'order'){
        const r = await runPy(st.lines.join('\n'), null, st.pre);
        if(r.timeout || r.err) problems.push(where + ': ' + (r.timeout ? 'timeout' : r.err.last));
      }
    }
  }
  return problems;
};

startWorker(); show('quest');

/* Open the page with ?selftest (or ?selftest=4,8 for chosen chapters) to run the self-test and show the result on screen. */
(function(){
  const m = /[?&]selftest(?:=([\d,]*))?/.exec(location.search); if(!m) return;
  const box = el('div', {class: 'card', id: 'selftestBox'}, el('b', {text: 'Self-test running…'})); $('main').prepend(box);
  const t0 = Date.now();
  __selftest(m[1] ? m[1].split(',').map(Number) : null).then(p => {
    box.replaceChildren(el('b', {text: 'Self-test finished in ' + Math.round((Date.now() - t0) / 1000) + ' s — ' + p.length + ' flagged'}), el('pre', {style: 'white-space:pre-wrap;font-size:12px', text: p.join('\n')}));
  }, e => box.replaceChildren(el('b', {text: 'Self-test crashed: ' + e})));
})();
