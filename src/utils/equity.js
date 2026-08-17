// Monte Carlo equity for heads-up Texas Hold'em. Given two hole-card hands and
// an optional partial board, it deals the rest out many times and reports how
// often each side wins.
//
// The evaluator underneath is exact: it finds the best five-card hand out of
// seven and compares it the way a dealer would, kickers included. Only the
// sampling of the remaining board is approximate.

const RANK_VALUES = { A: 14, K: 13, Q: 12, J: 11, T: 10, 9: 9, 8: 8, 7: 7, 6: 6, 5: 5, 4: 4, 3: 3, 2: 2 };
const SUITS = ['♠', '♥', '♦', '♣'];
const RANK_ORDER = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];

export function getHandRank(card) {
  return RANK_VALUES[card[0]] || 0;
}

// Hand categories, worst to best.
const HIGH_CARD = 0;
const PAIR = 1;
const TWO_PAIR = 2;
const TRIPS = 3;
const STRAIGHT = 4;
const FLUSH = 5;
const FULL_HOUSE = 6;
const QUADS = 7;
const STRAIGHT_FLUSH = 8;

// A hand becomes one number: the category, then up to five tiebreakers, packed
// in base 15 (ranks only go to 14). Comparing two hands is then just `>`, and
// two hands are equal only when they genuinely chop.
function encode(category, tiebreakers) {
  let v = category;
  for (let i = 0; i < 5; i++) v = v * 15 + (tiebreakers[i] || 0);
  return v;
}

/**
 * Highest card of the best straight in `desc` (unique ranks, descending), or 0.
 * An ace is appended as a 1 so the wheel, A-2-3-4-5, is found by the same scan.
 */
function straightHigh(desc) {
  const r = desc[0] === 14 ? [...desc, 1] : desc;
  let run = 1;
  for (let i = 1; i < r.length; i++) {
    if (r[i] === r[i - 1] - 1) {
      if (++run >= 5) return r[i] + 4;
    } else {
      run = 1;
    }
  }
  return 0;
}

/**
 * Score the best five-card hand inside seven cards.
 *
 * The version this replaces scored every hand as `category * 1000 + the highest
 * of all seven cards`. That meant the board's top card stood in for the hand's
 * own rank, so a pair of aces and a pair of queens came out equal whenever an
 * ace was on the board, and roughly one showdown in seven was reported as a
 * chop. It also called any flush plus any unrelated straight a straight flush,
 * and never compared kickers at all.
 */
function handValue(cards) {
  const ranks = cards.map(getHandRank);

  const rankCount = new Map();
  const suitOf = new Map();
  for (let i = 0; i < cards.length; i++) {
    const r = ranks[i];
    rankCount.set(r, (rankCount.get(r) || 0) + 1);
    const s = cards[i].slice(-1);
    if (!suitOf.has(s)) suitOf.set(s, []);
    suitOf.get(s).push(r);
  }

  const unique = [...rankCount.keys()].sort((a, b) => b - a);

  // A flush needs five of one suit, and with seven cards only one suit can have
  // them, so the first match is the only one.
  let flushRanks = null;
  for (const rs of suitOf.values()) {
    if (rs.length >= 5) {
      flushRanks = rs.sort((a, b) => b - a);
      break;
    }
  }

  if (flushRanks) {
    // The straight has to be inside the flush suit to be a straight flush.
    const sf = straightHigh([...new Set(flushRanks)]);
    if (sf) return encode(STRAIGHT_FLUSH, [sf]);
  }

  const quads = unique.filter((r) => rankCount.get(r) === 4);
  const trips = unique.filter((r) => rankCount.get(r) === 3);
  const pairs = unique.filter((r) => rankCount.get(r) === 2);

  if (quads.length) {
    const kicker = unique.find((r) => r !== quads[0]);
    return encode(QUADS, [quads[0], kicker]);
  }

  // Two sets of trips play as a full house, the lower set filling the pair.
  if (trips.length && (pairs.length || trips.length > 1)) {
    const pairPart = Math.max(pairs[0] || 0, trips[1] || 0);
    return encode(FULL_HOUSE, [trips[0], pairPart]);
  }

  if (flushRanks) return encode(FLUSH, flushRanks.slice(0, 5));

  const s = straightHigh(unique);
  if (s) return encode(STRAIGHT, [s]);

  if (trips.length) {
    const kickers = unique.filter((r) => r !== trips[0]).slice(0, 2);
    return encode(TRIPS, [trips[0], ...kickers]);
  }

  if (pairs.length >= 2) {
    const kicker = unique.find((r) => r !== pairs[0] && r !== pairs[1]);
    return encode(TWO_PAIR, [pairs[0], pairs[1], kicker]);
  }

  if (pairs.length === 1) {
    const kickers = unique.filter((r) => r !== pairs[0]).slice(0, 3);
    return encode(PAIR, [pairs[0], ...kickers]);
  }

  return encode(HIGH_CARD, unique.slice(0, 5));
}

// At 5,000 hands the sampling error on a 50/50 spot is about 0.7 points, so the
// figure is steady to the nearest percent between runs. Each trial is two
// evaluations of a seven-card hand, which is cheap enough to stay instant.
const SIMS = 5000;

// Draws `count` cards uniformly at random using a partial Fisher-Yates shuffle:
// walk forward, swapping each slot with a random slot at or after it, and stop
// once we have enough cards. Every card is equally likely to land in every slot.
//
// The obvious-looking `deck.sort(() => Math.random() - 0.5)` is NOT a fair
// shuffle. Array.sort assumes a consistent comparator (if a > b, that must stay
// true), and a random one breaks that assumption, so elements drift toward
// their original positions. Measured over 200k shuffles, the first card of the
// deck came out on top about 3x more often than it should have, which skewed
// the board cards and therefore the equity numbers.
function drawCards(deck, count) {
  const remaining = [...deck];
  const drawn = [];
  for (let i = 0; i < count; i++) {
    const j = i + Math.floor(Math.random() * (remaining.length - i));
    [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
    drawn.push(remaining[i]);
  }
  return drawn;
}

export function estimateEquity(heroCards, villainCards, boardCards) {
  const known = [...heroCards, ...villainCards, ...boardCards];
  const deck = [];
  for (const r of RANK_ORDER) {
    for (const s of SUITS) {
      const card = r + s;
      if (!known.includes(card)) deck.push(card);
    }
  }

  const needed = 5 - boardCards.length;
  let heroWins = 0;
  let ties = 0;
  for (let i = 0; i < SIMS; i++) {
    const board = [...boardCards, ...drawCards(deck, needed)];
    const heroVal = handValue([...heroCards, ...board]);
    const villainVal = handValue([...villainCards, ...board]);
    if (heroVal > villainVal) heroWins++;
    else if (heroVal === villainVal) ties++;
  }

  // Rounded so the three always add to 100, rather than each being rounded on
  // its own and the row reading 34 / 1 / 66.
  const hero = Math.round((heroWins / SIMS) * 100);
  const tie = Math.round((ties / SIMS) * 100);
  return { hero, tie, villain: 100 - hero - tie };
}
