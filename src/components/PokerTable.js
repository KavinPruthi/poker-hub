import { Text, View } from 'react-native';
import { getTheme } from '../theme/colors';

// Visual of a 9-handed table used in training scenarios. The hero seat is
// highlighted and shows the dealt hand; the hole cards are also rendered larger
// at the bottom so they're easy to read.
const SEATS = [
  { label: 'UTG', x: '28%', y: '76%' }, { label: 'UTG+1', x: '8%', y: '58%' },
  { label: 'MP', x: '8%', y: '34%' }, { label: 'HJ', x: '28%', y: '14%' },
  { label: 'CO', x: '58%', y: '14%' }, { label: 'BTN', x: '78%', y: '34%' },
  { label: 'SB', x: '78%', y: '58%' }, { label: 'BB', x: '58%', y: '76%' },
];

export default function PokerTable({ hand, position, dark }) {
  const C = getTheme(dark);
  return (
    <View style={{ height: 220, backgroundColor: dark ? '#0A1A0A' : '#1a4a1a', borderRadius: 20, marginBottom: 16, overflow: 'hidden', borderWidth: 4, borderColor: dark ? '#1C3A1C' : '#2d6a2d' }}>
      <View style={{ position: 'absolute', top: '15%', left: '10%', right: '10%', bottom: '15%', backgroundColor: dark ? '#0D2210' : '#1e5c1e', borderRadius: 100, borderWidth: 2, borderColor: dark ? '#1a3a1a' : '#267326' }} />
      <View style={{ position: 'absolute', top: '43%', left: '46%', width: 30, height: 30, borderRadius: 15, backgroundColor: '#FFD700', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 10, fontWeight: '800', color: '#000' }}>D</Text>
      </View>
      {SEATS.map((p) => {
        const isHero = p.label === position;
        return (
          <View key={p.label} style={{ position: 'absolute', left: p.x, top: p.y, alignItems: 'center', transform: [{ translateX: -20 }, { translateY: -16 }] }}>
            <View style={{ width: 40, height: 32, borderRadius: 8, backgroundColor: isHero ? C.accent : (dark ? '#1E2230' : '#fff'), borderWidth: isHero ? 2 : 1, borderColor: isHero ? C.accent : (dark ? '#2E3345' : '#ccc'), alignItems: 'center', justifyContent: 'center' }}>
              {isHero ? (
                <Text style={{ fontSize: 8, fontWeight: '800', color: '#fff' }}>{hand[0]}{hand[1]}</Text>
              ) : (
                <View style={{ flexDirection: 'row', gap: 1 }}>
                  <View style={{ width: 8, height: 12, backgroundColor: dark ? '#2E3345' : '#ddd', borderRadius: 2 }} />
                  <View style={{ width: 8, height: 12, backgroundColor: dark ? '#2E3345' : '#ddd', borderRadius: 2 }} />
                </View>
              )}
            </View>
            <Text style={{ fontSize: 8, color: isHero ? C.accent : (dark ? '#6B7280' : '#999'), fontWeight: isHero ? '800' : '400', marginTop: 2 }}>{p.label}</Text>
          </View>
        );
      })}
      <View style={{ position: 'absolute', bottom: 8, left: 0, right: 0, alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {hand.map((card, i) => {
            const isRed = card.includes('♥') || card.includes('♦');
            return (
              <View key={i} style={{ width: 36, height: 48, backgroundColor: '#fff', borderRadius: 6, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 4, elevation: 4 }}>
                <Text style={{ fontSize: 15, fontWeight: '800', color: isRed ? '#e74c3c' : '#000' }}>{card}</Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}
