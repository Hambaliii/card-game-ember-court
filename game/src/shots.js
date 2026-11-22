// Deterministic screenshot setups (?shot=title|table|win|loss&seed=N).
// Uses the seeded RNG so the same seed always renders the same frame.
import { buildDeck } from './cards.js';
import { mulberry32, shuffle } from './random.js';
import { createGame } from './state.js';

export function applyShot(state, shot, seed = 1) {
  const rng = mulberry32(seed * 7919 + 13);
  const deck = buildDeck();
  // A fixed, readable mid-game hand: one card of each suit + a finisher.
  const tableHand = [
    deck[4],  // Ember Knight 3 / 7
    deck[12], // Wave Crash 3 / 7
    deck[19], // Thorn Healer 3 / heal 8
    deck[26], // Storm Rider 3 / 7
    deck[6],  // Inferno 5 / 12
  ];
  const aiHand = [
    deck[2], deck[13], deck[21], deck[28], deck[5],
  ];
  const shuffled = shuffle(buildDeck(), rng);

  if (shot === 'title') {
    state.phase = 'title';
    return state;
  }
  if (shot === 'table') {
    state.phase = 'play';
    state.playerLife = 30;
    state.aiLife = 24;
    state.maxMana = 5;
    state.mana = 5;
    state.turnsTaken = 4;
    state.playerBlock = 3;
    state.aiBlock = 0;
    state.playerHand = tableHand.slice();
    state.aiHand = aiHand.slice();
    state.playerDeck = shuffled.slice(0, 18);
    state.aiDeck = shuffled.slice(0, 20);
    state.playerDiscard = shuffled.slice(18, 21);
    state.aiDiscard = shuffled.slice(20, 22);
    state.damageDealt = 27;
    state.log = [
      'You play Flame Lash (Ember) — deals 5 damage.',
      'Ashen Magistrate plays Tide Serpent — deals 4 damage.',
      'You play Thorn Guard — deals 4 damage, gains 4 block.',
      'Your turn 4. Mana 5.',
      'Play a card! SPACE ends your turn.',
    ];
    return state;
  }
  if (shot === 'win') {
    state.phase = 'win';
    state.playerLife = 17;
    state.aiLife = 0;
    state.turnsTaken = 7;
    state.damageDealt = 42;
    state.maxMana = 7; state.mana = 2;
    state.playerHand = tableHand.slice();
    state.aiHand = aiHand.slice();
    state.playerDeck = shuffled.slice(0, 14);
    state.aiDeck = shuffled.slice(0, 16);
    state.playerDiscard = shuffled.slice(14, 18);
    state.log = ['You play Inferno (Ember) — deals 12 damage.', 'VICTORY! The Ashen Magistrate falls.'];
    return state;
  }
  if (shot === 'loss') {
    state.phase = 'loss';
    state.playerLife = 0;
    state.aiLife = 19;
    state.turnsTaken = 6;
    state.damageDealt = 31;
    state.maxMana = 6; state.mana = 1;
    state.playerHand = tableHand.slice();
    state.aiHand = aiHand.slice();
    state.playerDeck = shuffled.slice(0, 15);
    state.aiDeck = shuffled.slice(0, 17);
    state.playerDiscard = shuffled.slice(15, 19);
    state.log = ['Ashen Magistrate plays Tempest — deals 10 damage.', 'DEFEAT. Your embers fade.'];
    return state;
  }
  return state;
}

export function createShotGame(shot, seed = 1) {
  const s = createGame(seed);
  return applyShot(s, shot, seed);
}
