// Canvas rendering for EMBER COURT. All art is drawn in code —
// no images, no external assets. 1280x720.
import { SUITS } from './cards.js';
import { mulberry32 } from './random.js';

const W = 1280, H = 720;

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function drawSuitIcon(ctx, suit, cx, cy, size, color) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = color || SUITS[suit].color;
  ctx.strokeStyle = color || SUITS[suit].color;
  ctx.lineWidth = Math.max(2, size * 0.08);
  const s = size;
  if (suit === 'Ember') {
    // Flame: teardrop with an inner flick.
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.5);
    ctx.bezierCurveTo(s * 0.45, -s * 0.1, s * 0.4, s * 0.35, 0, s * 0.5);
    ctx.bezierCurveTo(-s * 0.4, s * 0.35, -s * 0.45, -s * 0.1, 0, -s * 0.5);
    ctx.fill();
    ctx.fillStyle = '#ffd23a';
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.1);
    ctx.bezierCurveTo(s * 0.2, s * 0.1, s * 0.15, s * 0.3, 0, s * 0.35);
    ctx.bezierCurveTo(-s * 0.15, s * 0.3, -s * 0.2, s * 0.1, 0, -s * 0.1);
    ctx.fill();
  } else if (suit === 'Tide') {
    // Droplet.
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.55);
    ctx.bezierCurveTo(s * 0.42, -s * 0.05, s * 0.38, s * 0.5, 0, s * 0.5);
    ctx.bezierCurveTo(-s * 0.38, s * 0.5, -s * 0.42, -s * 0.05, 0, -s * 0.55);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.beginPath(); ctx.arc(-s * 0.12, s * 0.08, s * 0.09, 0, Math.PI * 2); ctx.fill();
  } else if (suit === 'Thorn') {
    // Leaf: two arcs + stem.
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.5);
    ctx.quadraticCurveTo(s * 0.55, -s * 0.1, 0, s * 0.5);
    ctx.quadraticCurveTo(-s * 0.55, -s * 0.1, 0, -s * 0.5);
    ctx.fill();
    ctx.strokeStyle = '#0d4d1a'; ctx.lineWidth = Math.max(2, s * 0.06);
    ctx.beginPath(); ctx.moveTo(0, -s * 0.45); ctx.lineTo(0, s * 0.55); ctx.stroke();
  } else {
    // Gale: swirl — three arcs.
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(0, 0, s * (0.5 - i * 0.13), i * 1.1, i * 1.1 + Math.PI * 1.35);
      ctx.stroke();
    }
    ctx.beginPath(); ctx.arc(0, 0, s * 0.08, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

// Small drawn sword (attack icon). The ⚔ glyph falls back to a confusing
// cross on systems without an emoji font, so the icon is drawn in code.
function drawSwordIcon(ctx, cx, cy, size, color) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-0.6);
  ctx.fillStyle = color;
  const s = size;
  ctx.beginPath();
  ctx.moveTo(0, -s * 0.5);
  ctx.lineTo(s * 0.09, -s * 0.08);
  ctx.lineTo(-s * 0.09, -s * 0.08);
  ctx.closePath();
  ctx.fill();
  ctx.fillRect(-s * 0.17, -s * 0.06, s * 0.34, s * 0.07);
  ctx.fillRect(-s * 0.05, s * 0.01, s * 0.1, s * 0.2);
  ctx.beginPath(); ctx.arc(0, s * 0.26, s * 0.07, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawCard(ctx, card, x, y, w, h, opts = {}) {
  // Draw at base size 158x216, scaled — so small AI-hand cards stay proportional.
  const suit = SUITS[card.suit];
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(w / 158, h / 216);
  x = 0; y = 0; w = 158; h = 216;
  if (opts.glow) {
    ctx.shadowColor = suit.color; ctx.shadowBlur = 22;
  }
  rr(ctx, x, y, w, h, 14);
  ctx.fillStyle = opts.faceDown ? '#3a1c5e' : '#f7efe0';
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.lineWidth = 4;
  ctx.strokeStyle = opts.faceDown ? '#8a6fd6' : suit.color;
  ctx.stroke();
  if (opts.selected) {
    ctx.lineWidth = 7;
    ctx.strokeStyle = '#ffd23a';
    ctx.stroke();
  }
  if (opts.dim) {
    rr(ctx, x, y, w, h, 14);
    ctx.fillStyle = 'rgba(0,0,0,0.38)';
    ctx.fill();
  }
  if (opts.faceDown) {
    // Card backs never reveal the card's suit — always the Ember flame.
    drawSuitIcon(ctx, 'Ember', x + w / 2, y + h / 2, 64, '#8a6fd6');
    ctx.fillStyle = '#cbb8f5';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('EMBER', x + w / 2, y + h - 26);
    ctx.restore();
    return;
  }
  // Cost circle, top-left.
  ctx.beginPath(); ctx.arc(x + 28, y + 28, 22, 0, Math.PI * 2);
  ctx.fillStyle = '#1d4ed8'; ctx.fill();
  ctx.lineWidth = 3; ctx.strokeStyle = '#fff'; ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.font = 'bold 34px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText(String(card.cost), x + 28, y + 40);
  // Suit banner.
  rr(ctx, x + 10, y + 58, w - 20, 62, 8);
  ctx.fillStyle = suit.color; ctx.fill();
  drawSuitIcon(ctx, card.suit, x + w / 2, y + 89, 48, '#ffffff');
  // Name.
  ctx.fillStyle = '#1a1208'; ctx.font = 'bold 22px sans-serif';
  ctx.fillText(card.name, x + w / 2, y + 148, w - 16);
  // Attack / heal / block — big numerals, icon + number centred as a pair.
  ctx.font = 'bold 44px sans-serif';
  ctx.textAlign = 'center';
  if (card.attack > 0) {
    const num = String(card.attack);
    const tw = ctx.measureText(num).width;
    const sx = x + w / 2 - (34 + 10 + tw) / 2;
    drawSwordIcon(ctx, sx + 15, y + 172, 32, '#b91c1c');
    ctx.fillStyle = '#b91c1c';
    ctx.textAlign = 'left';
    ctx.fillText(num, sx + 44, y + 186);
    ctx.textAlign = 'center';
  } else if (card.heal > 0) {
    ctx.fillStyle = '#15803d';
    ctx.fillText('✚ ' + card.heal, x + w / 2, y + 186);
  } else if (card.block > 0) {
    ctx.fillStyle = '#1d4ed8';
    ctx.fillText('⛨ ' + card.block, x + w / 2, y + 186);
  }
  // One line of rules text.
  ctx.fillStyle = '#3d3222'; ctx.font = '14px sans-serif';
  ctx.fillText(card.text, x + w / 2, y + 208, w - 12);
  ctx.restore();
}

function drawLifePanel(ctx, x, y, label, life, block, alignRight) {
  ctx.save();
  ctx.textAlign = alignRight ? 'right' : 'left';
  const tx = alignRight ? x + 300 : x;
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  rr(ctx, x, y, 300, 92, 12); ctx.fill();
  ctx.strokeStyle = '#d4af37'; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = '#ffd23a'; ctx.font = 'bold 17px sans-serif';
  ctx.fillText(label, tx + (alignRight ? -14 : 14), y + 24);
  ctx.fillStyle = '#ff4d6d'; ctx.font = 'bold 44px sans-serif';
  ctx.fillText('♥ ' + life, tx + (alignRight ? -14 : 14), y + 68);
  if (block > 0) {
    ctx.fillStyle = '#7dd3fc'; ctx.font = 'bold 22px sans-serif';
    ctx.fillText('⛨ ' + block, tx + (alignRight ? -120 : 120), y + 68);
  }
  ctx.restore();
}

function drawLog(ctx, state) {
  // Right-middle, clear of the player hand below and END TURN under it.
  ctx.save();
  rr(ctx, 880, 210, 380, 180, 12);
  ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fill();
  ctx.strokeStyle = '#d4af37'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = '#ffd23a'; ctx.font = 'bold 18px sans-serif'; ctx.textAlign = 'left';
  ctx.fillText('COMBAT LOG', 898, 236);
  ctx.fillStyle = '#fff7e0'; ctx.font = '16px sans-serif';
  // Word-wrap each entry (continuations indented), then show the last
  // whole entries that fit — never cut an entry in half.
  const perEntry = [];
  for (const line of state.log.slice(-4)) {
    const words = line.split(' ');
    const entryLines = [];
    let cur = '';
    for (const w of words) {
      const test = cur ? cur + ' ' + w : w;
      if (ctx.measureText(test).width > 344 && cur) { entryLines.push(cur); cur = '  ' + w; }
      else cur = test;
    }
    if (cur) entryLines.push(cur);
    perEntry.push(entryLines);
  }
  const lines = [];
  for (let i = perEntry.length - 1; i >= 0; i--) {
    if (lines.length + perEntry[i].length > 5) break;
    lines.unshift(...perEntry[i]);
  }
  lines.forEach((line, i) => {
    ctx.fillText(line, 898, 264 + i * 26, 344);
  });
  ctx.restore();
}

function drawEmbers(ctx, time, seed) {
  const rng = mulberry32(seed);
  ctx.save();
  for (let i = 0; i < 42; i++) {
    const bx = rng() * W, by = rng() * H, sp = 0.15 + rng() * 0.5, sz = 1.5 + rng() * 3;
    const x = (bx + time * sp * 12) % W;
    const y = by - ((time * sp * 8 + i * 37) % 40);
    ctx.fillStyle = i % 3 === 0 ? 'rgba(255,180,60,0.8)' : 'rgba(255,90,40,0.55)';
    ctx.beginPath(); ctx.arc(x, y < 0 ? y + H : y, sz, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function drawTable(ctx, state, time) {
  // Felt table.
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#0b3d24'); g.addColorStop(1, '#062a17');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // Gold trim.
  ctx.strokeStyle = '#d4af37'; ctx.lineWidth = 6;
  ctx.strokeRect(8, 8, W - 16, H - 16);
  ctx.lineWidth = 2; ctx.strokeRect(20, 20, W - 40, H - 40);
  // Felt speckle + soft vignette + arena ring (deterministic per seed).
  const frng = mulberry32((state.seed || 1) * 31 + 7);
  ctx.save();
  for (let i = 0; i < 260; i++) {
    ctx.fillStyle = frng() < 0.5 ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.05)';
    ctx.beginPath(); ctx.arc(30 + frng() * (W - 60), 30 + frng() * (H - 60), 1 + frng() * 2.2, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
  const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.42, W / 2, H / 2, H * 0.95);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(0,0,0,0.38)');
  ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  ctx.save();
  ctx.strokeStyle = 'rgba(212,175,55,0.35)'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.ellipse(W / 2, 330, 430, 150, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
  // Banners (bottom corners, clear of panels and hands).
  ctx.fillStyle = '#7f1d1d';
  ctx.fillRect(60, 610, 70, 110); ctx.fillRect(1150, 610, 70, 110);
  drawSuitIcon(ctx, 'Ember', 95, 662, 44, '#ffd23a');
  drawSuitIcon(ctx, 'Gale', 1185, 662, 44, '#ffd23a');
  // Centre emblem.
  ctx.save();
  ctx.globalAlpha = 0.16;
  drawSuitIcon(ctx, 'Ember', W / 2, 330, 260, '#ff8c42');
  ctx.restore();
  drawEmbers(ctx, time, state.seed || 1);
}

function drawCountBadge(ctx, cx, cy, n) {
  ctx.save();
  ctx.beginPath(); ctx.arc(cx, cy, 17, 0, Math.PI * 2);
  ctx.fillStyle = '#d4af37'; ctx.fill();
  ctx.lineWidth = 2; ctx.strokeStyle = '#fff'; ctx.stroke();
  ctx.fillStyle = '#1a1208'; ctx.font = 'bold 18px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText(String(n), cx, cy + 6);
  ctx.restore();
}

function drawPiles(ctx, state) {
  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd23a'; ctx.font = 'bold 17px sans-serif';
  ctx.fillText('DECK', 71, 468);
  ctx.fillText('DISCARD', 163, 468);
  // Deck pile: stacked card backs.
  for (let i = 0; i < 3; i++) {
    rr(ctx, 30 + i * 5, 478 + i * 4, 78, 108, 8);
    ctx.fillStyle = '#3a1c5e'; ctx.fill();
    ctx.strokeStyle = '#8a6fd6'; ctx.lineWidth = 2; ctx.stroke();
  }
  drawSuitIcon(ctx, 'Ember', 69, 532, 34, '#8a6fd6');
  drawCountBadge(ctx, 102, 484, state.playerDeck.length);
  // Discard pile: top card face-up, or an empty slot.
  if (state.playerDiscard.length > 0) {
    const top = state.playerDiscard[state.playerDiscard.length - 1];
    drawCard(ctx, top, 122, 478, 82, 112);
  } else {
    rr(ctx, 122, 478, 82, 112, 8);
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fill();
    ctx.strokeStyle = 'rgba(212,175,55,0.6)'; ctx.setLineDash([6, 5]); ctx.lineWidth = 2; ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#d8cdb4'; ctx.font = 'bold 14px sans-serif';
    ctx.fillText('EMPTY', 163, 538);
  }
  drawCountBadge(ctx, 196, 484, state.playerDiscard.length);
  ctx.restore();
}

function drawTurnBanner(ctx, state) {
  if (state.phase !== 'play' && state.phase !== 'ai') return;
  const isPlayer = state.phase === 'play';
  ctx.save();
  ctx.textAlign = 'center';
  rr(ctx, 460, 178, 360, 40, 20);
  ctx.fillStyle = isPlayer ? '#7f1d1d' : '#334155'; ctx.fill();
  ctx.strokeStyle = isPlayer ? '#ffd23a' : '#94a3b8'; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = isPlayer ? '#ffd23a' : '#e2e8f0';
  ctx.font = 'bold 25px sans-serif';
  ctx.fillText(isPlayer ? '★ YOUR TURN ★' : "MAGISTRATE'S TURN", 640, 206);
  ctx.restore();
}

function drawSoundChip(ctx, soundOn) {
  ctx.save();
  ctx.textAlign = 'left';
  ctx.fillStyle = soundOn ? '#d8cdb4' : '#f87171';
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText(soundOn ? 'SOUND: ON  (M to mute)' : 'SOUND: OFF  (M to unmute)', 28, 242);
  ctx.restore();
}

function drawEndScreen(ctx, state, win) {
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.72)'; ctx.fillRect(0, 0, W, H);
  ctx.textAlign = 'center';
  ctx.fillStyle = win ? '#ffd23a' : '#94a3b8';
  ctx.font = 'bold 110px sans-serif';
  ctx.shadowColor = win ? '#ff5a2a' : '#475569';
  ctx.shadowBlur = 26;
  ctx.fillText(win ? 'VICTORY' : 'DEFEAT', W / 2, 235);
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#f3e9d2'; ctx.font = 'bold 30px sans-serif';
  ctx.fillText(win ? 'The Ashen Magistrate falls. The court is yours.' : 'Your embers fade. The Magistrate endures.', W / 2, 300);
  ctx.font = 'bold 30px sans-serif';
  ctx.fillStyle = '#ffd23a';
  ctx.fillText(`LIFE REMAINING  ${state.playerLife}`, W / 2, 365);
  ctx.fillText(`TURNS  ${state.turnsTaken}`, W / 2, 405);
  ctx.fillText(`DAMAGE DEALT  ${state.damageDealt}`, W / 2, 445);
  ctx.fillStyle = '#f3e9d2'; ctx.font = 'bold 26px sans-serif';
  ctx.fillText('Press R or click to duel again', W / 2, 520);
  ctx.restore();
}

export function cardRects(state) {
  // Player hand layout — shared by renderer and click handling.
  const rects = [];
  const w = 158, h = 216, gap = 14;
  const total = state.playerHand.length * (w + gap) - gap;
  const x0 = (W - total) / 2;
  state.playerHand.forEach((card, i) => {
    rects.push({ x: x0 + i * (w + gap), y: 478, w, h, card, index: i });
  });
  return rects;
}

export function draw(ctx, state, opts = {}) {
  const time = opts.time || 0;
  const anim = opts.anim || null;
  ctx.clearRect(0, 0, W, H);
  drawTable(ctx, state, time);

  if (state.phase === 'title') {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffd23a'; ctx.font = 'bold 104px sans-serif';
    ctx.shadowColor = '#ff5a2a'; ctx.shadowBlur = 30;
    ctx.fillText('EMBER COURT', W / 2, 250);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#f3e9d2'; ctx.font = 'italic 34px sans-serif';
    ctx.fillText('A duel of ember spirits', W / 2, 310);
    ctx.font = 'bold 30px sans-serif'; ctx.fillStyle = '#ffffff';
    ctx.fillText('Press ENTER or click to begin', W / 2, 420);
    ctx.font = '22px sans-serif'; ctx.fillStyle = '#d8cdb4';
    ctx.fillText('Click a card to select, click again to play  •  1-5 play instantly  •  SPACE end turn  •  R restart  •  M sound', W / 2, 480);
    // Decorative cards fanned on the title.
    const demo = state.playerHand.slice(0, 3);
    demo.forEach((card, i) => {
      ctx.save();
      ctx.translate(490 + i * 150, 560);
      ctx.rotate((i - 1) * 0.08);
      drawCard(ctx, card, -70, -40, 140, 190);
      ctx.restore();
    });
    ctx.restore();
    return;
  }

  // Life totals — large, top corners. displayLife lets the numbers tick
  // down smoothly after a hit instead of jumping.
  const dl = opts.displayLife || { player: state.playerLife, ai: state.aiLife };
  drawLifePanel(ctx, 28, 28, 'YOU', Math.round(dl.player), state.playerBlock, false);
  drawLifePanel(ctx, 952, 28, 'ASHEN MAGISTRATE', Math.round(dl.ai), state.aiBlock, true);

  // Mana pips — bigger, filled when available.
  ctx.save();
  ctx.fillStyle = '#ffd23a'; ctx.font = 'bold 24px sans-serif'; ctx.textAlign = 'left';
  ctx.fillText(`MANA ${state.mana}/${state.maxMana}`, 28, 170);
  for (let i = 0; i < state.maxMana; i++) {
    ctx.beginPath(); ctx.arc(182 + i * 30, 162, 12, 0, Math.PI * 2);
    ctx.fillStyle = i < state.mana ? '#2aa8ff' : 'rgba(255,255,255,0.25)';
    ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
  }
  ctx.fillStyle = '#f3e9d2'; ctx.font = 'bold 22px sans-serif';
  ctx.fillText(`Turn ${Math.max(1, state.turnsTaken)}`, 28, 208);
  ctx.restore();
  drawSoundChip(ctx, opts.soundOn !== false);

  // AI hand (face-down in live play and in the table shot; revealed when
  // the duel ends). Count shown beside the row.
  const showAi = opts.showAiHand || state.phase === 'win' || state.phase === 'loss';
  state.aiHand.forEach((card, i) => {
    const x = 380 + i * 110, y = 30;
    drawCard(ctx, card, x, y, 102, 140, { faceDown: !showAi });
  });
  if (state.phase === 'play' || state.phase === 'ai') {
    ctx.fillStyle = '#d8cdb4'; ctx.font = 'bold 19px sans-serif'; ctx.textAlign = 'left';
    ctx.fillText(`AI hand: ${state.aiHand.length}`, 858, 200);
  }
  drawTurnBanner(ctx, state);

  // Deck and discard piles (left column).
  drawPiles(ctx, state);

  // Player hand — hovered card lifts, selected card lifts higher with a
  // gold ring, unaffordable cards dim.
  const rects = cardRects(state);
  rects.forEach((r) => {
    const affordable = state.phase === 'play' && r.card.cost <= state.mana;
    const isHover = opts.hoverIndex === r.index;
    const isSelected = opts.selectedIndex === r.index;
    const lift = isSelected ? 30 : isHover ? 20 : 0;
    drawCard(ctx, r.card, r.x, r.y - lift, r.w, r.h, {
      glow: affordable || isHover || isSelected,
      selected: isSelected,
      dim: state.phase === 'play' && !affordable,
    });
  });
  // Hand key hints.
  ctx.fillStyle = '#d8cdb4'; ctx.font = '18px sans-serif'; ctx.textAlign = 'center';
  rects.forEach((r, i) => ctx.fillText(String(i + 1), r.x + r.w / 2, r.y + r.h + 20));

  // END TURN button + combat log — hidden once the duel is decided, so
  // they never fight the end-screen text.
  if (state.phase === 'play' || state.phase === 'ai') {
    ctx.save();
    const canEnd = state.phase === 'play';
    rr(ctx, 1060, 400, 190, 56, 12);
    ctx.fillStyle = canEnd ? '#b91c1c' : '#555'; ctx.fill();
    ctx.strokeStyle = '#ffd23a'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 24px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('END TURN', 1155, 437);
    ctx.restore();

    drawLog(ctx, state);
  }

  // Played-card animation: the card flies from the hand to the centre,
  // then a damage/heal number floats up from the target's life total.
  if (anim && anim.t > 0) {
    const p = 1 - anim.t;
    const e = 1 - Math.pow(1 - Math.min(1, p * 1.8), 3);
    const fromX = anim.fromX !== undefined ? anim.fromX : W / 2 - 79;
    const fromY = anim.fromY !== undefined ? anim.fromY : 240;
    const cx = fromX + (W / 2 - 79 - fromX) * e;
    const cy = fromY + (240 - fromY) * e;
    const alpha = p < 0.6 ? 1 : Math.max(0, 1 - (p - 0.6) / 0.4);
    ctx.save();
    ctx.globalAlpha = alpha;
    drawCard(ctx, anim.card, cx, cy, 158, 216, { glow: true });
    ctx.restore();
    if (anim.float && p > 0.4) {
      const q = (p - 0.4) / 0.6;
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - q);
      ctx.font = 'bold 54px sans-serif';
      ctx.textAlign = 'center';
      ctx.lineWidth = 7;
      ctx.strokeStyle = 'rgba(0,0,0,0.85)';
      ctx.strokeText(anim.float.text, anim.float.x, 112 - q * 52);
      ctx.fillStyle = anim.float.color;
      ctx.fillText(anim.float.text, anim.float.x, 112 - q * 52);
      ctx.restore();
    }
  }

  if (state.phase === 'win') drawEndScreen(ctx, state, true);
  if (state.phase === 'loss') drawEndScreen(ctx, state, false);
}
