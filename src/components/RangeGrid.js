import { Text, View } from 'react-native';
import { getTheme } from '../theme/colors';
import { RANKS, GTO_RANGES } from '../constants/ranges';

// The 13x13 hand matrix. Pairs run down the diagonal, suited hands sit above it,
// offsuit below, and a filled cell is in that position's open-raise range.
//
// Filled cells are gold, not green. Green is reserved for money everywhere else
// in the app, and a green chart here would quietly suggest these hands are
// profit rather than a range.
//
// Cells flex to the width they are given instead of a hardcoded 22px, so the
// grid fits a small phone without the last column falling off. The labels used
// to be set at 5px, which is below the point at which any of this is readable.
export default function RangeGrid({ position, dark }) {
  const C = getTheme(dark);
  const range = GTO_RANGES[position] || {};

  const handAt = (i, j) => {
    if (i === j) return `${RANKS[i]}${RANKS[i]}`;
    if (i < j) return `${RANKS[i]}${RANKS[j]}s`;
    return `${RANKS[j]}${RANKS[i]}o`;
  };

  const inRange = Object.keys(range).filter((h) => range[h]).length;

  return (
    <View>
      <View style={{ gap: 2 }}>
        {RANKS.map((_, i) => (
          <View key={i} style={{ flexDirection: 'row', gap: 2 }}>
            {RANKS.map((__, j) => {
              const hand = handAt(i, j);
              const raise = !!range[hand];
              const pair = i === j;
              return (
                <View
                  key={j}
                  style={{
                    flex: 1,
                    aspectRatio: 1,
                    borderRadius: 2,
                    backgroundColor: raise ? C.accent : C.card2,
                    // The diagonal gets an outline so the pairs read as a spine
                    // through the matrix without needing a second colour.
                    borderWidth: pair ? 1 : 0,
                    borderColor: raise ? C.text : C.borderStrong,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 8.5,
                      fontWeight: raise ? '700' : '500',
                      color: raise ? C.accentText : C.subtext2,
                    }}
                  >
                    {hand.replace(/[so]$/, '')}
                  </Text>
                </View>
              );
            })}
          </View>
        ))}
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 12 }}>
        {[
          ['Open', C.accent, C.accent],
          ['Fold', C.card2, C.borderStrong],
        ].map(([label, fill, border]) => (
          <View key={label} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                backgroundColor: fill,
                borderWidth: 1,
                borderColor: border,
              }}
            />
            <Text style={{ color: C.subtext, fontSize: 12 }}>{label}</Text>
          </View>
        ))}
        <Text style={{ color: C.subtext2, fontSize: 12, marginLeft: 'auto' }}>
          {inRange} of 169 hands
        </Text>
      </View>
    </View>
  );
}
