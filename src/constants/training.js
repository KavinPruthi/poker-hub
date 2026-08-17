// Static content for the Train tab: practice scenarios, flashcards, position
// explainers, and the suggested prompts shown in the AI coach chat.

export const SCENARIOS = [
  { id: 1, hand: ['A♠', 'K♥'], position: 'UTG', blinds: '1/2', stack: 200, situation: '9-handed, first to act preflop', correctAction: 'Raise', explanation: 'AKo is a premium hand. Always open raise from any position. Standard sizing: 3x = $6.' },
  { id: 2, hand: ['7♦', '2♣'], position: 'BTN', blinds: '1/2', stack: 200, situation: 'Folded to you on the BTN', correctAction: 'Fold', explanation: '72o is the worst hand in poker. Even with position, the equity is too low to profitably open.' },
  { id: 3, hand: ['Q♥', 'Q♦'], position: 'BB', blinds: '1/2', stack: 200, situation: 'UTG opens to $6, folds to you in BB', correctAction: '3-Bet', explanation: 'QQ is a strong premium hand. 3-bet to ~$20 for value. Only KK/AA should make you consider folding.' },
  { id: 4, hand: ['J♠', 'T♠'], position: 'CO', blinds: '1/2', stack: 200, situation: 'Folded to you in CO, 6-handed', correctAction: 'Raise', explanation: 'JTs is a strong suited connector. Has great equity and playability post-flop. Open to 2.5x.' },
  { id: 5, hand: ['9♣', '9♦'], position: 'SB', blinds: '1/2', stack: 200, situation: 'BTN opens to $6, BB folds', correctAction: 'Call or 3-Bet', explanation: '99 is strong enough to mix 3-bets and calls vs BTN. Both are GTO. Calling keeps their range wide.' },
  { id: 6, hand: ['A♣', '2♦'], position: 'MP', blinds: '1/2', stack: 200, situation: 'Folded to you in MP', correctAction: 'Fold', explanation: 'A2o has poor playability from early position. Kicker is too weak and you are out of position.' },
  { id: 7, hand: ['K♠', 'Q♠'], position: 'HJ', blinds: '1/2', stack: 200, situation: 'Folded to you in HJ', correctAction: 'Raise', explanation: 'KQs is a strong hand with great playability. Open raise from HJ is standard GTO play.' },
  { id: 8, hand: ['5♥', '5♦'], position: 'BTN', blinds: '1/2', stack: 200, situation: 'MP opens to $6, CO calls, you are on BTN', correctAction: 'Call', explanation: '55 has good set mining value. Call and look for a set on the flop. 3-betting is too risky vs 2 players.' },
];

export const FLASHCARDS = [
  { q: 'What does GTO stand for?', a: 'Game Theory Optimal. A strategy where you cannot be exploited regardless of what your opponent does.' },
  { q: 'What is pot odds?', a: 'The ratio of the pot size to the cost of calling. If pot is $100 and call is $25, you are getting 4:1 (need 20% equity to break even).' },
  { q: 'What is position and why does it matter?', a: 'Position = acting last post-flop. Late position (BTN/CO) gives you more info about opponents before acting, which is a large edge.' },
  { q: 'What is a 3-bet?', a: 'The third bet in a sequence. Open raise = 1st bet, re-raise = 2-bet, re-re-raise = 3-bet. Shows a strong linear or polarized range.' },
  { q: 'What are suited connectors?', a: 'Cards of the same suit in consecutive order (e.g. 7♠8♠). Valued for making straights and flushes, so the implied odds are good.' },
  { q: 'What is SPR?', a: 'Stack-to-Pot Ratio. SPR = effective stack / pot size. Low SPR (<4) = commit with top pair. High SPR = need stronger hands.' },
  { q: 'What is a c-bet?', a: 'Betting on the flop after being the preflop aggressor. A standard play to represent your range and take down the pot.' },
  { q: 'What is range advantage?', a: 'When your range hits the board texture better than your opponent. E.g. as a UTG raiser, you have range advantage on A-K-Q boards.' },
  { q: 'What are blockers?', a: "Holding a card that reduces the combinations in your opponent's range. E.g. holding A♠ blocks A♠A♥ combos from your opponent." },
  { q: 'What is equity?', a: 'Your probability of winning the hand at any given point. E.g. AK vs QQ preflop = ~46% equity for AK.' },
];

export const POSITION_INFO = [
  { label: 'UTG', full: 'Under the Gun', desc: 'First to act preflop, with eight players still to speak. Open premium hands only.' },
  { label: 'UTG+1', full: 'Under the Gun +1', desc: 'Second to act, still early. Barely wider than UTG. Think the top 15% of hands.' },
  { label: 'MP', full: 'Middle Position', desc: 'You have read the early players, but the cutoff, button and blinds are all still behind you.' },
  { label: 'HJ', full: 'Hijack', desc: 'Late position starts here. Around 25% of hands, and a good seat to steal from with suited connectors.' },
  { label: 'CO', full: 'Cutoff', desc: 'Second best seat at the table. Only the button acts after you once the flop is out. Open wide.' },
  { label: 'BTN', full: 'Button', desc: 'The best seat in poker. You act last on every street after the flop, so up to 45% of hands are playable.' },
  { label: 'SB', full: 'Small Blind', desc: 'The worst seat after the flop, because you always act first. The preflop discount does not make up for it.' },
  { label: 'BB', full: 'Big Blind', desc: 'Last action preflop and a discount to call, then first to act on every street after. Defend wide, play carefully.' },
];

export const QUICK_PROMPTS = [
  'How do I play AKo UTG?',
  'Best 3-bet strategy from BTN?',
  'Analyze my session stats',
  'When should I bluff?',
  'How to play pocket pairs?',
  'What is a good c-bet size?',
];
