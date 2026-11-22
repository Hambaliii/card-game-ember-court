// AI for the Ashen Magistrate: greedy, deterministic, beatable.
// Picks the affordable card with the best value (attack + heal + block),
// preferring healing when hurt and block when low on life.
export function aiChooseIndex(s) {
  const mana = s.aiMana || 0;
  let best = -1;
  let bestScore = -1;
  for (let i = 0; i < s.aiHand.length; i++) {
    const card = s.aiHand[i];
    if (card.cost > mana) continue;
    let score = card.attack * 2 + card.heal + card.block;
    if (s.aiLife <= 12 && card.heal > 0) score += 6;
    if (s.aiLife <= 10 && card.block > 0) score += 4;
    // Prefer spending mana efficiently, not hoarding it.
    score += card.cost * 0.5;
    if (score > bestScore) { bestScore = score; best = i; }
  }
  return best;
}
