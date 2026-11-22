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
let hoverIndex = -1;
let selectedIndex = -1;
// Displayed life totals ease toward the real ones so hits tick down.
let displayLife = { player: state.playerLife, ai: state.aiLife };

// Sound: WebAudio oscillator beeps only — no audio files.
let audioCtx = null;
function tone(freq, delay = 0, dur = 0.12, type = 'sine', vol = 0.08) {
  if (!soundOn) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const t0 = audioCtx.currentTime + delay;
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.value = vol;
    o.connect(g); g.connect(audioCtx.destination);
    o.start(t0); o.stop(t0 + dur);
  } catch (e) { /* audio unavailable — game continues silently */ }
}
function beep(freq, dur = 0.12, type = 'sine', vol = 0.08) {
  tone(freq, 0, dur, type, vol);
}
function winJingle() {
  [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.13, 0.22, 'triangle', 0.09));
}
function lossJingle() {
  [330, 262, 196, 131].forEach((f, i) => tone(f, i * 0.16, 0.26, 'sine', 0.09));
}

function showAnim(card, fromRect, float) {
  anim = {
    card, t: 1,
    fromX: fromRect ? fromRect.x : undefined,
    fromY: fromRect ? fromRect.y : undefined,
    float: float || null,
  };
}

function playPlayerCard(i) {
  if (state.phase !== 'play') return;
  const card = state.playerHand[i];
  if (!card || card.cost > state.mana) { beep(140, 0.08, 'square', 0.05); return; }
  const rects = cardRects(state);
  const fromRect = rects[i] || null;
  const aiLifeBefore = state.aiLife;
  const played = playCard(state, i, 'player');
  if (played) {
    selectedIndex = -1;
    const dealt = Math.max(0, aiLifeBefore - state.aiLife);
    // Damage floats over the Magistrate's life; healing over yours.
    const float = dealt > 0
      ? { text: '-' + dealt, color: '#ff5a4d', x: 1102 }
      : played.heal > 0
        ? { text: '+' + played.heal, color: '#4ade80', x: 178 }
        : null;
    showAnim(played, fromRect, float);
    beep(520, 0.12, 'triangle');
    if (dealt > 0) tone(190, 0.05, 0.16, 'sawtooth', 0.07);
    if (state.phase === 'win') winJingle();
    else if (state.phase === 'loss') lossJingle();
  }
  checkEnd(state);
}

function endTurn() {
  if (state.phase !== 'play') return;
  selectedIndex = -1;
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
  // AI cards fly from the Magistrate's hand (top-centre row).
  const fromRect = { x: 380 + idx * 110, y: 30 };
  const pLifeBefore = state.playerLife;
  const played = playCard(state, idx, 'ai');
  if (played) {
    const dealt = Math.max(0, pLifeBefore - state.playerLife);
    const float = dealt > 0
      ? { text: '-' + dealt, color: '#ff5a4d', x: 178 }
      : played.heal > 0
        ? { text: '+' + played.heal, color: '#4ade80', x: 1102 }
        : null;
    showAnim(played, fromRect, float);
    beep(220, 0.12, 'sawtooth', 0.05);
    if (dealt > 0) tone(150, 0.05, 0.16, 'sawtooth', 0.07);
    if (state.phase === 'win') winJingle();
    else if (state.phase === 'loss') lossJingle();
  }
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
// Hit-test a hand card, accounting for the hover/selection lift.
function hitCard(x, y) {
  const rects = cardRects(state);
  for (let i = rects.length - 1; i >= 0; i--) {
    const r = rects[i];
    const lift = selectedIndex === r.index ? 30 : hoverIndex === r.index ? 20 : 0;
    if (x >= r.x && x <= r.x + r.w && y >= r.y - lift && y <= r.y - lift + r.h) return r.index;
  }
  return -1;
}

canvas.addEventListener('mousemove', (e) => {
  const r = canvas.getBoundingClientRect();
  const x = (e.clientX - r.left) * (canvas.width / r.width);
  const y = (e.clientY - r.top) * (canvas.height / r.height);
  hoverIndex = state.phase === 'play' ? hitCard(x, y) : -1;
});
canvas.addEventListener('mouseleave', () => { hoverIndex = -1; });

canvas.addEventListener('click', (e) => {
  const r = canvas.getBoundingClientRect();
  const x = (e.clientX - r.left) * (canvas.width / r.width);
  const y = (e.clientY - r.top) * (canvas.height / r.height);
  if (state.phase === 'title') { beginGame(); return; }
  if (state.phase === 'win' || state.phase === 'loss') {
    // Click anywhere to duel again.
    clearTimeout(aiTimer);
    state = restart(state, seed);
    if (shot) applyShot(state, shot, seed);
    displayLife = { player: state.playerLife, ai: state.aiLife };
    selectedIndex = -1;
    startTime = performance.now();
    return;
  }
  // END TURN button.
  if (x >= 1060 && x <= 1250 && y >= 400 && y <= 456) { endTurn(); return; }
  const idx = hitCard(x, y);
  if (idx >= 0) {
    // First click selects, second click on the same card plays it.
    if (selectedIndex === idx) playPlayerCard(idx);
    else { selectedIndex = idx; beep(660, 0.06, 'sine', 0.04); }
    return;
  }
  selectedIndex = -1;
});

window.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && state.phase === 'title') { beginGame(); return; }
  if (e.key === 'Enter' && state.phase === 'play' && selectedIndex >= 0) {
    playPlayerCard(selectedIndex);
    return;
  }
  if (e.key === 'Escape') { selectedIndex = -1; return; }
  if (e.key === 'r' || e.key === 'R') {
    if (state.phase === 'win' || state.phase === 'loss' || state.phase === 'title') {
      clearTimeout(aiTimer);
      state = restart(state, seed);
      if (shot) applyShot(state, shot, seed);
      displayLife = { player: state.playerLife, ai: state.aiLife };
      selectedIndex = -1;
      startTime = performance.now();
    }
    return;
  }
  if (e.key === 'm' || e.key === 'M') { soundOn = !soundOn; return; }
  if (state.phase !== 'play') return;
  if (e.key === ' ') { e.preventDefault(); endTurn(); return; }
  const n = parseInt(e.key, 10);
  if (n >= 1 && n <= 5) { selectedIndex = -1; playPlayerCard(n - 1); }
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
  // Life totals tick toward their real values; frozen in shot mode so
  // screenshots are deterministic.
  if (shot) {
    displayLife = { player: state.playerLife, ai: state.aiLife };
  } else {
    for (const k of ['player', 'ai']) {
      const target = k === 'player' ? state.playerLife : state.aiLife;
      const d = target - displayLife[k];
      displayLife[k] = Math.abs(d) < 0.6 ? target : displayLife[k] + d * 0.2;
    }
  }
  draw(ctx, state, {
    time: t, anim, showAiHand: false,
    hoverIndex, selectedIndex, soundOn, displayLife,
  });
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// Expose for headless playtesting / debugging.
window.__emberCourt = { getState: () => state, playCard: playPlayerCard, endTurn };
