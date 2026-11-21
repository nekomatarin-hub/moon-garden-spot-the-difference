// Moon Garden — Spot the Difference: game logic, input and screens.
//
// Two copies of the same night garden sit side by side; the right-hand
// one has eight quiet changes. Click (or tap with the keyboard cursor)
// on a change in either picture to ring it on both. The counter in the
// header always says how many are left, and the round ends when the
// last one is found.
//
// Screens: TITLE (over the dimmed garden), PLAY, and CLEAR (the
// celebration banner). ?shot=start|play|nearly|end&seed=n stages a
// fixed, honest mid-game state for the entry screenshots: the markers
// it shows are differences the game really counts, in a state a player
// really reaches.

import { DIFFERENCES, SCENE_W, SCENE_H, drawScene, drawMarker } from './scene.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const foundEl = document.getElementById('found');
const leftEl = document.getElementById('left');
const timeEl = document.getElementById('time');
const missEl = document.getElementById('misses');
const msgEl = document.getElementById('message');

const PANEL_GAP = 8;
const TOTAL_W = SCENE_W * 2 + PANEL_GAP;
canvas.width = TOTAL_W;
canvas.height = SCENE_H;

const SCREEN = { TITLE: 'title', PLAY: 'play', CLEAR: 'clear' };

const state = {
  screen: SCREEN.TITLE,
  found: new Set(),
  misses: 0,
  startedAt: null,
  elapsed: 0,
  frozenElapsed: null,
  cursor: { x: SCENE_W / 2, y: SCENE_H / 2, panel: 0, visible: false },
  ripples: [],
  lastFindLabel: '',
  shotMode: false,
};

const params = new URLSearchParams(location.search);
const shot = params.get('shot');
if (shot) stageShot(shot);

function stageShot(name) {
  state.shotMode = true;
  state.cursor.visible = name === 'play';
  if (name === 'play') {
    state.screen = SCREEN.PLAY;
    state.found = new Set(['moon', 'lantern', 'tulip']);
    state.misses = 1;
    state.frozenElapsed = 47;
    state.lastFindLabel = 'One tulip is missing';
  } else if (name === 'nearly') {
    state.screen = SCREEN.PLAY;
    state.found = new Set(['moon', 'lantern', 'tulip', 'star', 'apple', 'steam']);
    state.misses = 2;
    state.frozenElapsed = 104;
    state.lastFindLabel = 'The teapot lost its steam';
  } else if (name === 'end') {
    state.screen = SCREEN.CLEAR;
    state.found = new Set(DIFFERENCES.map((d) => d.id));
    state.misses = 2;
    state.frozenElapsed = 131;
  } else {
    state.screen = SCREEN.TITLE;
  }
}

// --- sound: tiny WebAudio chimes, no assets --------------------------------
let audio = null;
function beep(freq, at, dur, type = 'sine', gain = 0.08) {
  if (state.shotMode) return;
  try {
    audio = audio || new (window.AudioContext || window.webkitAudioContext)();
    const t = audio.currentTime + at;
    const osc = audio.createOscillator();
    const g = audio.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g).connect(audio.destination);
    osc.start(t);
    osc.stop(t + dur);
  } catch {
    /* sound is a garnish; the game plays silently without it */
  }
}
const sndFound = () => { beep(880, 0, 0.12); beep(1318, 0.09, 0.18); };
const sndMiss = () => beep(196, 0, 0.16, 'triangle', 0.06);
const sndClear = () => { [660, 880, 1108, 1318].forEach((f, i) => beep(f, i * 0.11, 0.22)); };

// --- rules -------------------------------------------------------------------
function startGame() {
  state.screen = SCREEN.PLAY;
  state.found = new Set();
  state.misses = 0;
  state.startedAt = performance.now();
  state.elapsed = 0;
  state.frozenElapsed = null;
  state.lastFindLabel = '';
  state.ripples = [];
}

/** Check a click given in scene coordinates of one panel. */
function checkAt(x, y) {
  if (state.screen === SCREEN.TITLE) { startGame(); return; }
  if (state.screen !== SCREEN.PLAY) return;
  for (const diff of DIFFERENCES) {
    if (state.found.has(diff.id)) continue;
    const dx = x - diff.x;
    const dy = y - diff.y;
    if (dx * dx + dy * dy <= diff.r * diff.r) {
      state.found.add(diff.id);
      state.lastFindLabel = diff.label;
      sndFound();
      if (state.found.size === DIFFERENCES.length) {
        state.screen = SCREEN.CLEAR;
        state.frozenElapsed = state.elapsed;
        sndClear();
      }
      return;
    }
  }
  state.misses += 1;
  state.ripples.push({ x, y, born: performance.now() });
  sndMiss();
}

// --- input ---------------------------------------------------------------------
function canvasPoint(evt) {
  const rect = canvas.getBoundingClientRect();
  const sx = (evt.clientX - rect.left) * (canvas.width / rect.width);
  const sy = (evt.clientY - rect.top) * (canvas.height / rect.height);
  const panel = sx < SCENE_W ? 0 : 1;
  const x = panel === 0 ? sx : sx - SCENE_W - PANEL_GAP;
  return { x, y: sy, panel };
}

canvas.addEventListener('pointerdown', (evt) => {
  const p = canvasPoint(evt);
  state.cursor = { x: p.x, y: p.y, panel: p.panel, visible: true };
  checkAt(p.x, p.y);
});

window.addEventListener('keydown', (evt) => {
  const c = state.cursor;
  const step = evt.shiftKey ? 16 : 6;
  let used = true;
  if (evt.key === 'ArrowLeft' || evt.key === 'a') c.x -= step;
  else if (evt.key === 'ArrowRight' || evt.key === 'd') c.x += step;
  else if (evt.key === 'ArrowUp' || evt.key === 'w') c.y -= step;
  else if (evt.key === 'ArrowDown' || evt.key === 's') c.y += step;
  else if (evt.key === 'Tab') { c.panel = 1 - c.panel; evt.preventDefault(); }
  else if (evt.key === 'Enter' || evt.key === ' ') checkAt(c.x, c.y);
  else if (evt.key === 'r' || evt.key === 'R') startGame();
  else used = false;
  if (used && evt.key !== 'Tab') evt.preventDefault();
  if (evt.key.startsWith('Arrow') || 'awsd'.includes(evt.key)) {
    c.visible = true;
    c.x = Math.max(4, Math.min(SCENE_W - 4, c.x));
    c.y = Math.max(4, Math.min(SCENE_H - 4, c.y));
  }
});

document.getElementById('restart').addEventListener('click', startGame);

// --- drawing -------------------------------------------------------------------
function fmtTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function drawPanel(ox, altered, time) {
  ctx.save();
  ctx.translate(ox, 0);
  ctx.beginPath();
  ctx.rect(0, 0, SCENE_W, SCENE_H);
  ctx.clip();
  drawScene(ctx, altered, time);
  for (const diff of DIFFERENCES) {
    if (state.found.has(diff.id)) drawMarker(ctx, diff, time * 2.4);
  }
  ctx.restore();
  ctx.strokeStyle = 'rgba(240,244,255,0.35)';
  ctx.lineWidth = 2;
  ctx.strokeRect(ox + 1, 1, SCENE_W - 2, SCENE_H - 2);
}

function drawCursor() {
  const c = state.cursor;
  if (!c.visible || state.screen !== SCREEN.PLAY) return;
  const ox = c.panel === 0 ? 0 : SCENE_W + PANEL_GAP;
  const x = ox + c.x;
  const y = c.y;
  ctx.strokeStyle = '#ffd94d';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, 13, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - 19, y); ctx.lineTo(x - 7, y);
  ctx.moveTo(x + 7, y); ctx.lineTo(x + 19, y);
  ctx.moveTo(x, y - 19); ctx.lineTo(x, y - 7);
  ctx.moveTo(x, y + 7); ctx.lineTo(x, y + 19);
  ctx.stroke();
}

function drawRipples(now) {
  state.ripples = state.ripples.filter((r) => now - r.born < 450);
  for (const r of state.ripples) {
    const k = (now - r.born) / 450;
    for (const ox of [0, SCENE_W + PANEL_GAP]) {
      ctx.beginPath();
      ctx.arc(ox + r.x, r.y, 6 + k * 14, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(224,72,62,${0.85 * (1 - k)})`;
      ctx.lineWidth = 3;
      ctx.stroke();
    }
  }
}

function drawOverlay() {
  if (state.screen === SCREEN.PLAY) return;
  ctx.fillStyle = 'rgba(10,13,28,0.62)';
  ctx.fillRect(0, 0, TOTAL_W, SCENE_H);
  ctx.textAlign = 'center';
  if (state.screen === SCREEN.TITLE) {
    ctx.fillStyle = '#ffd94d';
    ctx.font = '700 54px Georgia, serif';
    ctx.fillText('MOON GARDEN', TOTAL_W / 2, 148);
    ctx.fillStyle = '#eef2ff';
    ctx.font = '600 27px Georgia, serif';
    ctx.fillText('Spot the Difference', TOTAL_W / 2, 190);
    ctx.font = '400 19px system-ui, sans-serif';
    ctx.fillStyle = '#c6cfe8';
    ctx.fillText('The right-hand garden hides 8 quiet changes.', TOTAL_W / 2, 238);
    ctx.fillText('Click a change in either picture to ring it on both.', TOTAL_W / 2, 264);
    ctx.fillStyle = '#ffd94d';
    ctx.font = '600 20px system-ui, sans-serif';
    ctx.fillText('Click anywhere — or press Enter — to start', TOTAL_W / 2, 312);
  } else {
    ctx.fillStyle = '#ffd94d';
    ctx.font = '700 46px Georgia, serif';
    ctx.fillText('You found them all!', TOTAL_W / 2, 156);
    ctx.fillStyle = '#eef2ff';
    ctx.font = '400 21px system-ui, sans-serif';
    const t = fmtTime(state.frozenElapsed ?? state.elapsed);
    ctx.fillText(`All 8 differences in ${t} · ${state.misses} ${state.misses === 1 ? 'miss' : 'misses'}`, TOTAL_W / 2, 202);
    ctx.fillStyle = '#ffd94d';
    ctx.font = '600 20px system-ui, sans-serif';
    ctx.fillText('Press R or the New round button to play again', TOTAL_W / 2, 252);
    // A small celebration of sparkles along the top.
    for (let i = 0; i < 14; i += 1) {
      const x = 60 + i * 66;
      const y = 52 + (i % 3) * 17;
      ctx.beginPath();
      ctx.moveTo(x, y - 9);
      ctx.quadraticCurveTo(x, y, x + 9, y);
      ctx.quadraticCurveTo(x, y, x, y + 9);
      ctx.quadraticCurveTo(x, y, x - 9, y);
      ctx.quadraticCurveTo(x, y, x, y - 9);
      ctx.fillStyle = i % 2 ? '#ffd94d' : '#7fc7e8';
      ctx.fill();
    }
  }
  ctx.textAlign = 'left';
}

function syncHud() {
  const n = state.found.size;
  foundEl.textContent = n;
  leftEl.textContent = DIFFERENCES.length - n;
  timeEl.textContent = fmtTime(state.frozenElapsed ?? state.elapsed);
  missEl.textContent = state.misses;
  if (state.screen === SCREEN.TITLE) msgEl.textContent = 'Find the 8 differences between the two gardens.';
  else if (state.screen === SCREEN.CLEAR) msgEl.textContent = 'Every difference found — the garden is whole again.';
  else if (state.lastFindLabel) msgEl.textContent = `Found: ${state.lastFindLabel}. ${DIFFERENCES.length - n} to go.`;
  else msgEl.textContent = 'Click a difference in either picture.';
}

function frame(nowMs) {
  const time = nowMs / 1000;
  if (state.screen === SCREEN.PLAY && state.startedAt !== null && !state.shotMode) {
    state.elapsed = (nowMs - state.startedAt) / 1000;
  }
  ctx.fillStyle = '#0b0e1c';
  ctx.fillRect(0, 0, TOTAL_W, SCENE_H);
  drawPanel(0, false, time);
  drawPanel(SCENE_W + PANEL_GAP, true, time);
  drawRipples(nowMs);
  drawCursor();
  drawOverlay();
  syncHud();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
