// EMBER COURT — entry point. Canvas loop, input, sound, AI pacing.
import { createGame, playCard, startPlayerTurn, startAiTurn, restart, checkEnd } from './state.js';
import { aiChooseIndex } from './ai.js';
import { draw, cardRects } from './render.js';
import { applyShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const params = new URLSearchParams(location.search);
const seed = parseInt(params.get('seed') || '1', 10) || 1;
const shot = params.get('shot');

let state = createGame(seed);
let soundOn = true;
let anim = null;
let aiTimer = null;
let startTime = performance.now();

// Sound: WebAudio oscillator beeps only.
let audioCtx = null;
function beep(freq, dur = 0.12, type = 'sine', vol = 0.08) {
  if (!soundOn) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.value = vol;
    o.connect(g); g.connect(audioCtx.destination);
    o.start(); o.stop(audioCtx.currentTime + dur);
  } catch (e) { /* audio unavailable — game continues silently */ }
}

function showAnim(card) {
  anim = { card, t: 1 };
}

function playPlayerCard(i) {
  if (state.phase !== 'play') return;
  const card = state.playerHand[i];
  if (!card || card.cost > state.mana) { beep(140, 0.08, 'square', 0.05); return; }
  const played = playCard(state, i, 'player');
  if (played) { showAnim(played); beep(520, 0.12, 'triangle'); }
  checkEnd(state);
}

function endTurn() {
  if (state.phase !== 'play') return;
  state.phase = 'ai';
  startAiTurn(state);
  beep(300, 0.1, 'sine');
  runAiStep();
}

function runAiStep() {
  if (state.phase !== 'ai') return;
  if (state.phase === 'win' || state.phase === 'loss') return;
  const idx = aiChooseIndex(state);
  if (idx < 0) {
    // AI done — back to the player.
    aiTimer = setTimeout(() => {
      if (state.phase === 'win' || state.phase === 'loss') return;
      startPlayerTurn(state);
    }, 600);
    return;
  }
  const played = playCard(state, idx, 'ai');
  if (played) { showAnim(played); beep(220, 0.12, 'sawtooth', 0.05); }
  if (state.phase === 'win' || state.phase === 'loss') return;
  aiTimer = setTimeout(runAiStep, 750);
}

function beginGame() {
  if (state.phase !== 'title') return;
  state.phase = 'play';
  state.turnsTaken = 1;
  beep(440, 0.15, 'triangle');
}

// Input.
canvas.addEventListener('click', (e) => {
  const r = canvas.getBoundingClientRect();
  const x = (e.clientX - r.left) * (canvas.width / r.width);
  const y = (e.clientY - r.top) * (canvas.height / r.height);
  if (state.phase === 'title') { beginGame(); return; }
  if (state.phase === 'win' || state.phase === 'loss') return;
  // END TURN button.
  if (x >= 1060 && x <= 1250 && y >= 400 && y <= 456) { endTurn(); return; }
  const rects = cardRects(state);
  for (const rect of rects) {
    if (x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h) {
      playPlayerCard(rect.index);
      return;
    }
  }
});

window.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && state.phase === 'title') { beginGame(); return; }
  if (e.key === 'r' || e.key === 'R') {
    if (state.phase === 'win' || state.phase === 'loss' || state.phase === 'title') {
      clearTimeout(aiTimer);
      state = restart(state, seed);
      if (shot) applyShot(state, shot, seed);
      startTime = performance.now();
    }
    return;
  }
  if (e.key === 'm' || e.key === 'M') { soundOn = !soundOn; return; }
  if (state.phase !== 'play') return;
  if (e.key === ' ') { e.preventDefault(); endTurn(); return; }
  const n = parseInt(e.key, 10);
  if (n >= 1 && n <= 5) playPlayerCard(n - 1);
});

// Deterministic shot modes.
if (shot) {
  applyShot(state, shot, seed);
  if (shot === 'table') state.phase = 'play';
} else {
  state.phase = 'title';
}

// Render loop. In shot mode time is frozen at 0 so frames are identical.
function frame(now) {
  const t = shot ? 0 : (now - startTime) / 1000;
  if (anim) {
    anim.t -= 0.02;
    if (anim.t <= 0) anim = null;
  }
  draw(ctx, state, { time: t, anim, showAiHand: shot === 'table' });
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// Expose for headless playtesting / debugging.
window.__emberCourt = { getState: () => state, playCard: playPlayerCard, endTurn };
