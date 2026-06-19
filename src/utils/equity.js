// A lightweight Monte Carlo equity estimator for heads-up Texas Hold'em.
// Given two hole-card hands (and an optional partial board) it deals out the
// remaining cards thousands of times and reports how often each player wins.
//
// It's an approximation, not a solver — 800 trials is plenty for a quick "am I
// ahead?" read while keeping it fast enough to run on-device.

const RANK_VALUES = { A: 14, K: 13, Q: 12, J: 11, T: 10, 9: 9, 8: 8, 7: 7, 6: 6, 5: 5, 4: 4, 3: 3, 2: 2 };
const SUITS = ['♠', '♥', '♦', '♣'];
const RANK_ORDER = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];

export function getHandRank(card) {
  return RANK_VALUES[card[0]] || 0;
}

// Scores a set of cards so two hands can be compared with a single number.
// Higher category (flush, straight, etc.) dominates; the high card breaks ties
// within a category. Not a full kicker-accurate evaluator, but good enough to
// rank the vast majority of showdowns correctly.
function handValue(cards) {
  const all = cards.slice(0, 7);
  const ranks = all.map(getHandRank).sort((a, b) => b - a);
  const suits = all.map((c) => c.slice(-1));

  const rankCounts = {};
  ranks.forEach((r) => (rankCounts[r] = (rankCounts[r] || 0) + 1));
  const counts = Object.values(rankCounts).sort((a, b) => b - a);

  const suitCounts = {};
  suits.forEach((s) => (suitCounts[s] = (suitCounts[s] || 0) + 1));
  const hasFlush = Object.values(suitCounts).some((c) => c >= 5);

  const sortedRanks = [...new Set(ranks)].sort((a, b) => b - a);
  let straight = false;
  for (let i = 0; i <= sortedRanks.length - 5; i++) {
    if (sortedRanks[i] - sortedRanks[i + 4] === 4 && new Set(sortedRanks.slice(i, i + 5)).size === 5) {
      straight = true;
      break;
    }
  }
  // Wheel straight (A-2-3-4-5).
  if (sortedRanks.includes(14) && sortedRanks.includes(2) && sortedRanks.includes(3) && sortedRanks.includes(4) && sortedRanks.includes(5)) {
    straight = true;
  }

  if (hasFlush && straight) return 8000 + ranks[0];
  if (counts[0] === 4) return 7000 + ranks[0];
  if (counts[0] === 3 && counts[1] >= 2) return 6000 + ranks[0];
  if (hasFlush) return 5000 + ranks[0];
  if (straight) return 4000 + ranks[0];
  if (counts[0] === 3) return 3000 + ranks[0];
  if (counts[0] === 2 && counts[1] === 2) return 2000 + ranks[0];
  if (counts[0] === 2) return 1000 + ranks[0];
  return ranks[0];
}

const SIMS = 800;

export function estimateEquity(heroCards, villainCards, boardCards) {
  const known = [...heroCards, ...villainCards, ...boardCards];
  const deck = [];
  for (const r of RANK_ORDER) {
    for (const s of SUITS) {
      const card = r + s;
      if (!known.includes(card)) deck.push(card);
    }
  }

  let heroWins = 0;
  let ties = 0;
  for (let i = 0; i < SIMS; i++) {
    const shuffled = [...deck].sort(() => Math.random() - 0.5);
    const needed = 5 - boardCards.length;
    const board = [...boardCards, ...shuffled.slice(0, needed)];
    const heroVal = handValue([...heroCards, ...board]);
    const villainVal = handValue([...villainCards, ...board]);
    if (heroVal > villainVal) heroWins++;
    else if (heroVal === villainVal) ties++;
  }

  return {
    hero: Math.round((heroWins / SIMS) * 100),
    villain: Math.round(((SIMS - heroWins - ties) / SIMS) * 100),
    tie: Math.round((ties / SIMS) * 100),
  };
}
