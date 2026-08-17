import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { getTheme } from '../theme/colors';
import { POSITION_INFO } from '../constants/training';
import { Card, SectionLabel, TYPE } from '../components/ui';
import { TABLE } from '../components/PokerTable';

// Tap a seat to read what it means and how wide to play from it, with the seats
// ranked underneath by how much you would rather be sitting there.
const SEATS = [
  { label: 'UTG', x: 0.28, y: 0.76 },
  { label: 'UTG+1', x: 0.08, y: 0.58 },
  { label: 'MP', x: 0.08, y: 0.34 },
  { label: 'HJ', x: 0.28, y: 0.14 },
  { label: 'CO', x: 0.58, y: 0.14 },
  { label: 'BTN', x: 0.78, y: 0.34 },
  { label: 'SB', x: 0.78, y: 0.58 },
  { label: 'BB', x: 0.58, y: 0.76 },
];

// Ordered best to worst, with the reason rather than an emoji. The bars below
// are drawn from these, so the order here is the only thing to keep in step.
const RANKING = [
  ['BTN', 'Acts last after the flop'],
  ['CO', 'Last to act unless the button plays'],
  ['HJ', 'Two seats of fold equity ahead'],
  ['MP', 'Half the table still behind you'],
  ['UTG+1', 'Almost everyone acts after you'],
  ['UTG', 'First in, eight left to wake up'],
  ['BB', 'Already invested, out of position'],
  ['SB', 'Worst seat: pays to act first all night'],
];

const TABLE_W = 320;
const TABLE_H = 190;

export default function PositionsGuide({ dark }) {
  const C = getTheme(dark);
  const [selected, setSelected] = useState('BTN');
  const info = POSITION_INFO.find((p) => p.label === selected);

  return (
    <View>
      <View
        style={{
          width: TABLE_W,
          height: TABLE_H,
          alignSelf: 'center',
          backgroundColor: TABLE.RAIL,
          borderRadius: 16,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: C.cardBorder,
          marginBottom: 18,
        }}
      >
        <View
          style={{
            position: 'absolute',
            top: '14%',
            left: '9%',
            right: '9%',
            bottom: '14%',
            backgroundColor: TABLE.FELT,
            borderRadius: 90,
            borderWidth: 1.5,
            borderColor: TABLE.EDGE,
          }}
        />
        <View
          style={{
            position: 'absolute',
            top: '44%',
            left: '47%',
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: C.accent,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 10, fontWeight: '800', color: C.accentText }}>D</Text>
        </View>

        {SEATS.map((seat) => {
          const active = selected === seat.label;
          return (
            <TouchableOpacity
              key={seat.label}
              onPress={() => setSelected(seat.label)}
              activeOpacity={0.8}
              style={{
                position: 'absolute',
                left: seat.x * TABLE_W - 21,
                top: seat.y * TABLE_H - 16,
                width: 42,
                height: 30,
                borderRadius: 7,
                backgroundColor: active ? C.accent : TABLE.SEAT_BG,
                borderWidth: 1,
                borderColor: active ? C.accent : TABLE.SEAT_LINE,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: 9,
                  fontWeight: '800',
                  color: active ? C.accentText : TABLE.SEAT_TEXT,
                }}
              >
                {seat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {info && (
        <Card dark={dark} style={{ marginBottom: 22 }}>
          <Text style={{ ...TYPE.heading, color: C.text }}>{info.full}</Text>
          <Text style={{ ...TYPE.small, color: C.subtext2, marginTop: 2, marginBottom: 10 }}>
            {info.label}
          </Text>
          <Text style={{ ...TYPE.body, color: C.subtext }}>{info.desc}</Text>
        </Card>
      )}

      <SectionLabel dark={dark}>Best seat to worst</SectionLabel>
      {RANKING.map(([label, why], i) => {
        const active = selected === label;
        return (
          <TouchableOpacity
            key={label}
            onPress={() => setSelected(label)}
            activeOpacity={0.7}
            style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 7 }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: '700',
                color: active ? C.accent : C.text,
                width: 46,
              }}
            >
              {label}
            </Text>
            <View
              style={{
                width: 54,
                height: 4,
                borderRadius: 2,
                backgroundColor: C.card2,
                overflow: 'hidden',
                marginRight: 12,
              }}
            >
              <View
                style={{
                  width: `${100 - i * 11}%`,
                  height: 4,
                  backgroundColor: active ? C.accent : C.borderStrong,
                }}
              />
            </View>
            <Text style={{ ...TYPE.small, color: C.subtext, flex: 1 }}>{why}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
