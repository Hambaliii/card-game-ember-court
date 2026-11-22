// Pure game state + rules for EMBER COURT. No DOM, no canvas here,
// so a node harness can import this module and play full games.
import { buildDeck } from './cards.js';
import { mulberry32, shuffle } from './random.js';

export function createGame(seed = 1) {
  const rng = mulberry32(seed);
  const pDeck = shuffle(buildDeck(), rng);
  const aDeck = shuffle(buildDeck(), rng);
  const s = {
    seed,
    phase: 'title', // title | play | ai | win | loss
    turn: 1,
    maxMana: 1,
    mana: 1,
    playerLife: 30,
    aiLife: 30,
    playerBlock: 0,
    aiBlock: 0,
    playerDeck: pDeck,
    aiDeck: aDeck,
    playerHand: [],
    aiHand: [],
    playerDiscard: [],
    aiDiscard: [],
    log: [],
    damageDealt: 0,
    turnsTaken: 0,
    winner: null,
  };
  drawToHand(s, 'player');
  drawToHand(s, 'ai');
  s.log.push('The duel begins. You go first.');
  s.log.push('Mana 1. Draw 5 cards. Play a card!');
  return s;
}

export function drawToHand(s, who) {
  const hand = who === 'player' ? s.playerHand : s.aiHand;
  const deck = who === 'player' ? s.playerDeck : s.aiDeck;
  const discard = who === 'player' ? s.playerDiscard : s.aiDiscard;
  while (hand.length < 5) {
    if (deck.length === 0) {
      if (discard.length === 0) break;
      // Reshuffle discard into deck (deterministic-ish order kept simple).
      const rng = mulberry32(s.seed + s.turn * 97 + hand.length);
      const resh = shuffle(discard.splice(0), rng);
      deck.push(...resh);
    }
    hand.push(deck.pop());
  }
}

function dealDamage(s, target, amount) {
  if (amount <= 0) return 0;
  if (target === 'ai') {
    const absorbed = Math.min(s.aiBlock, amount);
    s.aiBlock -= absorbed;
    const real = amount - absorbed;
    s.aiLife = Math.max(0, s.aiLife - real);
    return real;
  }
  const absorbed = Math.min(s.playerBlock, amount);
  s.playerBlock -= absorbed;
  const real = amount - absorbed;
  s.playerLife = Math.max(0, s.playerLife - real);
  return real;
}

function heal(s, who, amount) {
  if (amount <= 0) return;
  if (who === 'player') s.playerLife = Math.min(30, s.playerLife + amount);
  else s.aiLife = Math.min(30, s.aiLife + amount);
}

// Play hand[index] for who ('player' | 'ai'). Returns the card or null.
export function playCard(s, index, who = 'player') {
  const hand = who === 'player' ? s.playerHand : s.aiHand;
  const discard = who === 'player' ? s.playerDiscard : s.aiDiscard;
  if (index < 0 || index >= hand.length) return null;
  const card = hand[index];
  if (who === 'player') {
    if (card.cost > s.mana) return null;
    s.mana -= card.cost;
  } else {
    // AI mana is tracked on s.aiMana (set by startAiTurn).
    if (card.cost > (s.aiMana || 0)) return null;
    s.aiMana -= card.cost;
  }
  hand.splice(index, 1);
  discard.push(card);
  const foe = who === 'player' ? 'ai' : 'player';
  const me = who === 'player' ? 'You' : 'Ashen Magistrate';
  let dealt = 0;
  if (card.attack > 0) {
    dealt = dealDamage(s, foe, card.attack);
    if (who === 'player') s.damageDealt += dealt;
  }
  if (card.heal > 0) heal(s, who, card.heal);
  if (card.block > 0) {
    if (who === 'player') s.playerBlock += card.block;
    else s.aiBlock += card.block;
  }
  const parts = [];
  if (card.attack > 0) parts.push(`deals ${dealt} damage`);
  if (card.heal > 0) parts.push(`heals ${card.heal}`);
  if (card.block > 0) parts.push(`gains ${card.block} block`);
  s.log.push(`${me} play ${card.name} (${card.suit}) — ${parts.join(', ') || 'nothing'}.`);
  if (s.log.length > 40) s.log = s.log.slice(-40);
  checkEnd(s);
  return card;
}

export function checkEnd(s) {
  if (s.phase === 'win' || s.phase === 'loss') return;
  if (s.aiLife <= 0) {
    s.phase = 'win'; s.winner = 'player';
    s.log.push('VICTORY! The Ashen Magistrate falls.');
  } else if (s.playerLife <= 0) {
    s.phase = 'loss'; s.winner = 'ai';
    s.log.push('DEFEAT. Your embers fade.');
  }
}

// Start a new player turn: mana grows, block resets, draw to 5.
export function startPlayerTurn(s) {
  s.turnsTaken += 1;
  s.turn += 0; // turn counter shown is turnsTaken
  s.maxMana = Math.min(10, s.maxMana + (s.turnsTaken > 1 ? 1 : 0));
  s.mana = s.maxMana;
  s.playerBlock = 0;
  drawToHand(s, 'player');
  s.log.push(`Your turn ${s.turnsTaken}. Mana ${s.mana}.`);
  s.phase = 'play';
  checkEnd(s);
}

export function startAiTurn(s) {
  s.aiMana = Math.min(10, s.turnsTaken);
  s.aiBlock = 0;
  drawToHand(s, 'ai');
  s.log.push('Ashen Magistrate takes a turn...');
  s.phase = 'ai';
}

export function restart(s, seed = 1) {
  const fresh = createGame(seed);
  // Keep the same object identity for the renderer.
  for (const k of Object.keys(s)) delete s[k];
  Object.assign(s, fresh);
  return s;
}
