import { Text, View } from 'react-native';
import { getTheme } from '../theme/colors';

const CHART_HEIGHT = 180;

// A simple cumulative bankroll bar chart. Each bar is the running profit total
// after a given session, so the rightmost bar is the player's all-time result.
export default function BankrollChart({ sessions, dark }) {
  const C = getTheme(dark);

  if (sessions.length < 2) {
    return (
      <View style={{ height: 120, alignItems: 'center', justifyContent: 'center', backgroundColor: C.card, borderRadius: 16, borderWidth: 1, borderColor: C.cardBorder, marginBottom: 20 }}>
        <Text style={{ color: C.subtext, fontSize: 13 }}>Log at least 2 sessions to see chart</Text>
      </View>
    );
  }

  const sorted = [...sessions].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  let running = 0;
  const points = sorted.map((s) => {
    running += s.profit;
    return running;
  });
  const minVal = Math.min(0, ...points);
  const maxVal = Math.max(0, ...points);
  const range = maxVal - minVal || 1;
  const isProfit = points[points.length - 1] >= 0;

  return (
    <View style={{ backgroundColor: C.card, borderRadius: 20, borderWidth: 1, borderColor: C.cardBorder, padding: 16, marginBottom: 20 }}>
      <Text style={{ color: C.text, fontWeight: '700', fontSize: 15, marginBottom: 12 }}>Bankroll Over Time</Text>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: CHART_HEIGHT - 40, gap: 3 }}>
        {points.map((v, i) => {
          const barH = Math.max(3, (Math.abs(v) / range) * (CHART_HEIGHT - 60));
          const isPos = v >= 0;
          return (
            <View key={i} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: CHART_HEIGHT - 40 }}>
              <View style={{ width: '80%', height: barH, backgroundColor: isPos ? C.green : C.red, borderRadius: 4, opacity: i === points.length - 1 ? 1 : 0.55 }} />
            </View>
          );
        })}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
        <Text style={{ color: C.subtext, fontSize: 10 }}>Session 1</Text>
        <Text style={{ color: isProfit ? C.green : C.red, fontSize: 13, fontWeight: '700' }}>
          {isProfit ? '+' : ''}${points[points.length - 1].toFixed(0)} total
        </Text>
        <Text style={{ color: C.subtext, fontSize: 10 }}>Latest</Text>
      </View>
    </View>
  );
}
