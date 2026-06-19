// Preflop reference data: card ranks, table positions, and GTO open-raise ranges.
// Ranges are keyed by position and built up incrementally — each later position
// inherits the previous one's hands and adds a few more, which mirrors how an
// opening range actually widens as you move closer to the button.

export const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];

export const POSITIONS = ['UTG', 'UTG+1', 'MP', 'HJ', 'CO', 'BTN', 'SB'];

export const DEFAULT_LABELS = ['All Time'];

export const GTO_RANGES = {
  UTG: {
    'AA': 1, 'KK': 1, 'QQ': 1, 'JJ': 1, 'TT': 1, '99': 1, '88': 1,
    'AKs': 1, 'AQs': 1, 'AJs': 1, 'ATs': 1, 'A9s': 1, 'A8s': 1, 'A7s': 1, 'A6s': 1, 'A5s': 1, 'A4s': 1, 'A3s': 1, 'A2s': 1,
    'KQs': 1, 'KJs': 1, 'KTs': 1, 'K9s': 1, 'QJs': 1, 'QTs': 1, 'Q9s': 1, 'JTs': 1, 'J9s': 1,
    'T9s': 1, 'T8s': 1, '98s': 1, '97s': 1, '87s': 1, '86s': 1, '76s': 1, '75s': 1, '65s': 1, '64s': 1, '54s': 1,
    'AKo': 1, 'AQo': 1, 'AJo': 1, 'ATo': 1, 'KQo': 1, 'KJo': 1, 'QJo': 1,
  },
};

GTO_RANGES['UTG+1'] = { ...GTO_RANGES.UTG, '77': 1, '66': 1, 'A5s': 1, 'A4s': 1, 'A3s': 1, 'A2s': 1, 'KQo': 1, 'KJo': 1, 'QJo': 1 };
GTO_RANGES['MP'] = { ...GTO_RANGES['UTG+1'], '55': 1, '44': 1, '33': 1, '22': 1, 'K8s': 1, 'Q8s': 1 };
GTO_RANGES['HJ'] = { ...GTO_RANGES['MP'], 'K7s': 1, 'K6s': 1, 'J8s': 1, 'T7s': 1 };
GTO_RANGES['CO'] = { ...GTO_RANGES['HJ'], 'K5s': 1, 'K4s': 1, 'Q7s': 1, '96s': 1, '85s': 1, 'KTo': 1, 'QTo': 1 };
GTO_RANGES['BTN'] = {
  'AA': 1, 'KK': 1, 'QQ': 1, 'JJ': 1, 'TT': 1, '99': 1, '88': 1, '77': 1, '66': 1, '55': 1, '44': 1, '33': 1, '22': 1,
  'AKs': 1, 'AQs': 1, 'AJs': 1, 'ATs': 1, 'A9s': 1, 'A8s': 1, 'A7s': 1, 'A6s': 1, 'A5s': 1, 'A4s': 1, 'A3s': 1, 'A2s': 1,
  'KQs': 1, 'KJs': 1, 'KTs': 1, 'K9s': 1, 'K8s': 1, 'K7s': 1, 'K6s': 1, 'K5s': 1, 'K4s': 1, 'K3s': 1, 'K2s': 1,
  'QJs': 1, 'QTs': 1, 'Q9s': 1, 'Q8s': 1, 'Q7s': 1, 'Q6s': 1, 'JTs': 1, 'J9s': 1, 'J8s': 1, 'J7s': 1,
  'T9s': 1, 'T8s': 1, 'T7s': 1, 'T6s': 1, '98s': 1, '97s': 1, '96s': 1, '87s': 1, '86s': 1, '85s': 1,
  '76s': 1, '75s': 1, '74s': 1, '65s': 1, '64s': 1, '54s': 1, '53s': 1, '43s': 1,
  'AKo': 1, 'AQo': 1, 'AJo': 1, 'ATo': 1, 'A9o': 1, 'A8o': 1, 'A7o': 1, 'A6o': 1, 'A5o': 1, 'A4o': 1, 'A3o': 1, 'A2o': 1,
  'KQo': 1, 'KJo': 1, 'KTo': 1, 'K9o': 1, 'K8o': 1, 'QJo': 1, 'QTo': 1, 'Q9o': 1, 'JTo': 1, 'J9o': 1,
  'T9o': 1, 'T8o': 1, '98o': 1, '97o': 1, '87o': 1, '86o': 1, '76o': 1,
};
GTO_RANGES['SB'] = { ...GTO_RANGES['BTN'] };
