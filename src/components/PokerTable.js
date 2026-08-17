import { Text, View } from 'react-native';
import { getTheme } from '../theme/colors';

// A nine-handed table for the training scenarios.
//
// The hole cards sit below the felt, not on it. Drawn inside the table they
// landed on top of the UTG and BB seats, which is exactly where the hero is
// most often sitting, so the seat you were being asked about was the one hidden
// behind the cards.
//
// Wood rail, green felt, gold button. The colours are fixed rather than themed:
// a real table does not turn pale when the lights come on, and the light-mode
// version of this looked like a snooker table.
// Exported so the positions guide draws the same table. Two copies of these
// values is how one screen ends up with a wood rail and the other a green one.
export const TABLE = {
  RAIL: '#241C14',
  FELT: '#14291F',
  EDGE: '#0C1A13',
  SEAT_BG: 'rgba(255,255,255,0.07)',
  SEAT_LINE: 'rgba(255,255,255,0.15)',
  SEAT_TEXT: 'rgba(255,255,255,0.5)',
};

const { RAIL, FELT, EDGE: FELT_EDGE, SEAT_BG, SEAT_LINE, SEAT_TEXT } = TABLE;

const TABLE_H = 176;

const SEATS = [
  { label: 'UTG', x: '30%', y: '78%' },
  { label: 'UTG+1', x: '9%', y: '58%' },
  { label: 'MP', x: '9%', y: '30%' },
  { label: 'HJ', x: '30%', y: '11%' },
  { label: 'CO', x: '57%', y: '11%' },
  { label: 'BTN', x: '78%', y: '30%' },
  { label: 'SB', x: '78%', y: '58%' },
  { label: 'BB', x: '57%', y: '78%' },
];

function Card({ card, size = 'lg' }) {
  const red = card.includes('♥') || card.includes('♦');
  const lg = size === 'lg';
  return (
    <View
      style={{
        width: lg ? 40 : 30,
        height: lg ? 54 : 40,
        backgroundColor: '#FAFAF8',
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ fontSize: lg ? 17 : 13, fontWeight: '700', color: red ? '#B3231B' : '#16181C' }}>
        {card}
      </Text>
    </View>
  );
}

export default function PokerTable({ hand, position, dark }) {
  const C = getTheme(dark);

  return (
    <View style={{ marginBottom: 16 }}>
      <View
        style={{
          height: TABLE_H,
          backgroundColor: RAIL,
          borderRadius: 14,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: C.cardBorder,
        }}
      >
        <View
          style={{
            position: 'absolute',
            top: 22,
            left: 34,
            right: 34,
            bottom: 22,
            backgroundColor: FELT,
            borderRadius: 70,
            borderWidth: 1.5,
            borderColor: FELT_EDGE,
          }}
        />

        <View
          style={{
            position: 'absolute',
            top: '43%',
            left: '47%',
            width: 22,
            height: 22,
            borderRadius: 11,
            backgroundColor: C.accent,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 9.5, fontWeight: '800', color: C.accentText }}>D</Text>
        </View>

        {SEATS.map((p) => {
          const hero = p.label === position;
          return (
            <View
              key={p.label}
              style={{
                position: 'absolute',
                left: p.x,
                top: p.y,
                alignItems: 'center',
                transform: [{ translateX: -19 }, { translateY: -14 }],
              }}
            >
              <View
                style={{
                  width: 36,
                  height: 24,
                  borderRadius: 5,
                  backgroundColor: hero ? C.accent : SEAT_BG,
                  borderWidth: 1,
                  borderColor: hero ? C.accent : SEAT_LINE,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'row',
                  gap: 2,
                }}
              >
                {hero ? (
                  <Text style={{ fontSize: 9, fontWeight: '800', color: C.accentText }}>YOU</Text>
                ) : (
                  <>
                    <View style={{ width: 6, height: 10, backgroundColor: SEAT_LINE, borderRadius: 1.5 }} />
                    <View style={{ width: 6, height: 10, backgroundColor: SEAT_LINE, borderRadius: 1.5 }} />
                  </>
                )}
              </View>
              <Text
                style={{
                  fontSize: 8.5,
                  marginTop: 3,
                  fontWeight: hero ? '800' : '500',
                  color: hero ? C.accent : SEAT_TEXT,
                }}
              >
                {p.label}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Your hand, out from under the seats and big enough to read. */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 }}>
        {hand.map((c, i) => (
          <Card key={i} card={c} />
        ))}
        <Text style={{ fontSize: 12.5, color: C.subtext, marginLeft: 4 }}>
          your hand, {position}
        </Text>
      </View>
    </View>
  );
}
