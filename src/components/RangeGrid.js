import { Text, View } from 'react-native';
import { getTheme } from '../theme/colors';
import { RANKS, GTO_RANGES } from '../constants/ranges';

// Renders the classic 13x13 hand matrix for a given position. Pairs sit on the
// diagonal, suited hands above it, offsuit below — and each cell is colored by
// whether it's part of that position's open-raise range.
export default function RangeGrid({ position, dark }) {
  const C = getTheme(dark);
  const range = GTO_RANGES[position] || {};

  return (
    <View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 2 }}>
        {RANKS.map((r1, i) =>
          RANKS.map((r2, j) => {
            let hand;
            if (i === j) hand = `${r1}${r1}`;
            else if (i < j) hand = `${r1}${r2}s`;
            else hand = `${r2}${r1}o`;
            const isRaise = range[hand];
            const isPair = i === j;
            return (
              <View key={`${i}-${j}`} style={{ width: 22, height: 22, borderRadius: 3, backgroundColor: isRaise ? (isPair ? C.accent : C.green) : (dark ? '#1E2230' : '#F2F3F7'), alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 5, color: isRaise ? '#fff' : C.subtext, fontWeight: '600' }}>{hand.replace('s', '').replace('o', '')}</Text>
              </View>
            );
          })
        )}
      </View>
      <View style={{ flexDirection: 'row', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: C.accent }} />
          <Text style={{ color: C.subtext, fontSize: 11 }}>Pair (raise)</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: C.green }} />
          <Text style={{ color: C.subtext, fontSize: 11 }}>Raise</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: dark ? '#1E2230' : '#F2F3F7', borderWidth: 1, borderColor: dark ? '#2E3345' : '#E0E2EA' }} />
          <Text style={{ color: C.subtext, fontSize: 11 }}>Fold</Text>
        </View>
      </View>
    </View>
  );
}
