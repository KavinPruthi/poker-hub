import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { getTheme } from '../theme/colors';

// Landing screen: a quick all-time stats summary plus shortcuts into the three
// main areas of the app.
export default function HomeScreen({ onNavigate, dark, totalProfit, winRate, sessionCount, user }) {
  const C = getTheme(dark);
  const email = user?.email || '';

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView contentContainerStyle={{ padding: 28, paddingTop: 64, paddingBottom: 100 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <View>
            <Text style={{ fontSize: 28, fontWeight: '800', color: C.text, letterSpacing: -0.5 }}>Poker Hub 🃏</Text>
            <Text style={{ fontSize: 13, color: C.subtext, marginTop: 2 }}>{email}</Text>
          </View>
          <TouchableOpacity onPress={() => onNavigate('settings')} style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: C.card, borderWidth: 1, borderColor: C.cardBorder, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 20 }}>⚙️</Text>
          </TouchableOpacity>
        </View>

        <View style={{ backgroundColor: C.accent, borderRadius: 20, padding: 24, marginBottom: 24 }}>
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '600', marginBottom: 12 }}>ALL TIME STATS</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View><Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>PROFIT</Text><Text style={{ color: '#fff', fontSize: 26, fontWeight: '800' }}>{totalProfit >= 0 ? '+' : ''}${totalProfit.toFixed(0)}</Text></View>
            <View style={{ alignItems: 'center' }}><Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>WIN RATE</Text><Text style={{ color: '#fff', fontSize: 26, fontWeight: '800' }}>${winRate}/hr</Text></View>
            <View style={{ alignItems: 'flex-end' }}><Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>SESSIONS</Text><Text style={{ color: '#fff', fontSize: 26, fontWeight: '800' }}>{sessionCount}</Text></View>
          </View>
        </View>

        <TouchableOpacity onPress={() => onNavigate('grind')} style={{ backgroundColor: C.card, borderRadius: 20, padding: 24, marginBottom: 14, borderWidth: 1, borderColor: C.cardBorder, flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: C.accentSoft, alignItems: 'center', justifyContent: 'center', marginRight: 16 }}><Text style={{ fontSize: 26 }}>📊</Text></View>
          <View style={{ flex: 1 }}><Text style={{ fontSize: 18, fontWeight: '700', color: C.text, marginBottom: 2 }}>Grind</Text><Text style={{ fontSize: 13, color: C.subtext }}>Log sessions, track bankroll & labels</Text></View>
          <Text style={{ color: C.subtext, fontSize: 20 }}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onNavigate('train')} style={{ backgroundColor: C.card, borderRadius: 20, padding: 24, marginBottom: 14, borderWidth: 1, borderColor: C.cardBorder, flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: C.greenSoft, alignItems: 'center', justifyContent: 'center', marginRight: 16 }}><Text style={{ fontSize: 26 }}>🧠</Text></View>
          <View style={{ flex: 1 }}><Text style={{ fontSize: 18, fontWeight: '700', color: C.text, marginBottom: 2 }}>Train</Text><Text style={{ fontSize: 13, color: C.subtext }}>GTO charts, scenarios & flashcards</Text></View>
          <Text style={{ color: C.subtext, fontSize: 20 }}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onNavigate('coach')} style={{ backgroundColor: C.card, borderRadius: 20, padding: 24, marginBottom: 14, borderWidth: 1, borderColor: C.cardBorder, flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: C.accentSoft, alignItems: 'center', justifyContent: 'center', marginRight: 16 }}><Text style={{ fontSize: 26 }}>🤖</Text></View>
          <View style={{ flex: 1 }}><Text style={{ fontSize: 18, fontWeight: '700', color: C.text, marginBottom: 2 }}>AI Coach</Text><Text style={{ fontSize: 13, color: C.subtext }}>Get real-time GTO advice & hand analysis</Text></View>
          <Text style={{ color: C.subtext, fontSize: 20 }}>›</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
