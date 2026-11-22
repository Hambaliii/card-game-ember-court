// Card definitions for EMBER COURT — 30 cards, 4 suits.
// Suits are told apart by BOTH colour and shape (never text alone).
export const SUITS = {
  Ember: { color: '#ff5a2a', dark: '#c22e08', label: 'Ember' },
  Tide:  { color: '#2aa8ff', dark: '#0b5fa8', label: 'Tide' },
  Thorn: { color: '#3ddc5a', dark: '#1a7a2e', label: 'Thorn' },
  Gale:  { color: '#ffc93a', dark: '#a67c00', label: 'Gale' },
};

function c(id, name, suit, cost, attack, heal, block, text) {
  return { id, name, suit, cost, attack, heal, block, text };
}

export function buildDeck() {
  return [
    c(1, 'Ember Spark', 'Ember', 1, 3, 0, 0, 'Deal 3 damage.'),
    c(2, 'Ember Imp', 'Ember', 1, 2, 0, 0, 'Deal 2 damage.'),
    c(3, 'Flame Lash', 'Ember', 2, 5, 0, 0, 'Deal 5 damage.'),
    c(4, 'Cinder Wolf', 'Ember', 2, 4, 0, 0, 'Deal 4 damage.'),
    c(5, 'Ember Knight', 'Ember', 3, 7, 0, 0, 'Deal 7 damage.'),
    c(6, 'Pyre Drake', 'Ember', 4, 9, 0, 0, 'Deal 9 damage.'),
    c(7, 'Inferno', 'Ember', 5, 12, 0, 0, 'Deal 12 damage.'),
    c(8, 'Ember Mend', 'Ember', 2, 0, 6, 0, 'Heal 6 life.'),
    c(9, 'Tide Splash', 'Tide', 1, 2, 0, 0, 'Deal 2 damage.'),
    c(10, 'Tide Serpent', 'Tide', 2, 4, 0, 0, 'Deal 4 damage.'),
    c(11, 'Deep Current', 'Tide', 3, 6, 2, 0, 'Deal 6. Heal 2.'),
    c(12, 'Tide Healer', 'Tide', 2, 0, 7, 0, 'Heal 7 life.'),
    c(13, 'Wave Crash', 'Tide', 3, 7, 0, 0, 'Deal 7 damage.'),
    c(14, 'Frost Tide', 'Tide', 4, 8, 0, 4, 'Deal 8. Gain 4 block.'),
    c(15, 'Tide Guardian', 'Tide', 3, 5, 0, 5, 'Deal 5. Gain 5 block.'),
    c(16, 'Ocean Surge', 'Tide', 5, 11, 0, 0, 'Deal 11 damage.'),
    c(17, 'Thorn Vine', 'Thorn', 1, 3, 0, 0, 'Deal 3 damage.'),
    c(18, 'Thorn Guard', 'Thorn', 2, 4, 0, 4, 'Deal 4. Gain 4 block.'),
    c(19, 'Briar Wolf', 'Thorn', 2, 5, 0, 0, 'Deal 5 damage.'),
    c(20, 'Thorn Healer', 'Thorn', 3, 0, 8, 0, 'Heal 8 life.'),
    c(21, 'Vine Whip', 'Thorn', 1, 2, 0, 3, 'Deal 2. Gain 3 block.'),
    c(22, 'Thorn Titan', 'Thorn', 4, 9, 0, 0, 'Deal 9 damage.'),
    c(23, 'Forest Warden', 'Thorn', 3, 6, 0, 6, 'Deal 6. Gain 6 block.'),
    c(24, 'Thorn Bloom', 'Thorn', 2, 2, 5, 0, 'Deal 2. Heal 5.'),
    c(25, 'Gale Gust', 'Gale', 1, 2, 0, 0, 'Deal 2 damage.'),
    c(26, 'Gale Falcon', 'Gale', 2, 5, 0, 0, 'Deal 5 damage.'),
    c(27, 'Storm Rider', 'Gale', 3, 7, 0, 0, 'Deal 7 damage.'),
    c(28, 'Gale Shield', 'Gale', 2, 0, 0, 8, 'Gain 8 block.'),
    c(29, 'Tempest', 'Gale', 4, 10, 0, 0, 'Deal 10 damage.'),
    c(30, 'Sky Sovereign', 'Gale', 5, 12, 3, 0, 'Deal 12. Heal 3.'),
  ];
}
