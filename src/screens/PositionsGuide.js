import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { getTheme } from '../theme/colors';
import { POSITION_INFO } from '../constants/training';

// Interactive seating chart. Tap any seat to read what that position means and
// how wide you should be playing from it, plus a power ranking of all positions.
const SEATS = [
  { label: 'UTG', x: 0.28, y: 0.76 }, { label: 'UTG+1', x: 0.08, y: 0.58 },
  { label: 'MP', x: 0.08, y: 0.34 }, { label: 'HJ', x: 0.28, y: 0.14 },
  { label: 'CO', x: 0.58, y: 0.14 }, { label: 'BTN', x: 0.78, y: 0.34 },
  { label: 'SB', x: 0.78, y: 0.58 }, { label: 'BB', x: 0.58, y: 0.76 },
];
const POWER_RANKING = ['BTN 👑', 'CO ✂️', 'HJ 🚀', 'MP ⚖️', 'UTG+1 ⚠️', 'UTG 🔫', 'BB 🛡️', 'SB 💀'];
const TABLE_W = 320;
const TABLE_H = 220;

export default function PositionsGuide({ dark }) {
  const C = getTheme(dark);
  const [selected, setSelected] = useState('BTN');
  const info = POSITION_INFO.find((p) => p.label === selected);

  return (
    <View>
      <View style={{ backgroundColor: C.card, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: C.cardBorder, marginBottom: 16, alignItems: 'center' }}>
        <Text style={{ color: C.subtext, fontSize: 12, marginBottom: 12 }}>Tap a position to learn about it</Text>
        <View style={{ width: TABLE_W, height: TABLE_H, backgroundColor: dark ? '#0A1A0A' : '#1a4a1a', borderRadius: 20, overflow: 'hidden', borderWidth: 3, borderColor: dark ? '#1C3A1C' : '#2d6a2d' }}>
          <View style={{ position: 'absolute', top: '15%', left: '10%', right: '10%', bottom: '15%', backgroundColor: dark ? '#0D2210' : '#1e5c1e', borderRadius: 100, borderWidth: 2, borderColor: dark ? '#1a3a1a' : '#267326' }} />
          <View style={{ position: 'absolute', top: '43%', left: '46%', width: 28, height: 28, borderRadius: 14, backgroundColor: '#FFD700', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 9, fontWeight: '800', color: '#000' }}>D</Text>
          </View>
          {SEATS.map((seat) => {
            const posInfo = POSITION_INFO.find((p) => p.label === seat.label);
            const isSelected = selected === seat.label;
            return (
              <TouchableOpacity key={seat.label} onPress={() => setSelected(seat.label)} style={{ position: 'absolute', left: seat.x * TABLE_W - 22, top: seat.y * TABLE_H - 18, width: 44, height: 36, borderRadius: 8, backgroundColor: isSelected ? posInfo.color : (dark ? '#1E2230' : '#fff'), borderWidth: 2, borderColor: isSelected ? posInfo.color : (dark ? '#2E3345' : '#ddd'), alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 8, fontWeight: '800', color: isSelected ? '#fff' : (dark ? '#6B7280' : '#555') }}>{seat.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
      {info && (
        <View style={{ backgroundColor: C.card, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: C.cardBorder, marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: info.color + '22', alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
              <Text style={{ fontSize: 24 }}>{info.emoji}</Text>
            </View>
            <View>
              <Text style={{ color: C.text, fontWeight: '800', fontSize: 18 }}>{info.label}</Text>
              <Text style={{ color: C.subtext, fontSize: 13 }}>{info.full}</Text>
            </View>
          </View>
          <Text style={{ color: C.text, fontSize: 14, lineHeight: 22 }}>{info.desc}</Text>
        </View>
      )}
      <View style={{ backgroundColor: C.accentSoft, borderRadius: 16, padding: 16, marginBottom: 16 }}>
        <Text style={{ color: C.accent, fontWeight: '700', fontSize: 14, marginBottom: 10 }}>📊 Position Power Ranking</Text>
        {POWER_RANKING.map((p, i) => (
          <View key={p} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
            <Text style={{ color: C.subtext, fontSize: 11, width: 20 }}>#{i + 1}</Text>
            <View style={{ flex: 1, height: 6, backgroundColor: dark ? '#1E2230' : '#E0E2EA', borderRadius: 3, marginHorizontal: 8, overflow: 'hidden' }}>
              <View style={{ width: `${100 - i * 12}%`, height: 6, backgroundColor: C.accent, borderRadius: 3 }} />
            </View>
            <Text style={{ color: C.text, fontSize: 12, fontWeight: '600', width: 80 }}>{p}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
