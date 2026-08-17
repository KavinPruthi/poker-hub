import { Text, View } from 'react-native';
import { getTheme } from '../theme/colors';
import { TYPE, money, nums } from './ui';

const H = 128;

// Cumulative bankroll. Each column is the running total after that session, so
// the last one is the all-time figure.
//
// The bars hang off a real zero line. The previous version measured every bar
// from the bottom of the box, which drew a $500 hole and a $500 profit as the
// same upward bar -- the sign only survived in the colour. Below zero now goes
// below the line, which is the whole point of looking at the curve.
export default function BankrollChart({ sessions, dark }) {
  const C = getTheme(dark);

  if (sessions.length < 2) return null;

  const sorted = [...sessions].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  let running = 0;
  const points = sorted.map((s) => (running += s.profit));

  const top = Math.max(0, ...points);
  const bottom = Math.min(0, ...points);
  const range = top - bottom || 1;

  // Where zero sits inside the plot, measured from the top.
  const above = (top / range) * H;
  const below = H - above;
  const last = points[points.length - 1];

  return (
    <View style={{ marginBottom: 24 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
        <Text style={{ ...TYPE.label, color: C.subtext2 }}>BANKROLL</Text>
        <Text style={{ ...TYPE.label, ...nums, color: C.subtext2 }}>
          {money(bottom)} to {money(top)}
        </Text>
      </View>

      <View style={{ height: H, flexDirection: 'row', alignItems: 'stretch', gap: 2 }}>
        {points.map((v, i) => {
          const latest = i === points.length - 1;
          const up = v >= 0;
          const h = Math.max(2, (Math.abs(v) / range) * (up ? above : below));
          return (
            <View key={i} style={{ flex: 1, minWidth: 2 }}>
              <View style={{ height: above, justifyContent: 'flex-end' }}>
                {up && (
                  <View
                    style={{
                      height: h,
                      backgroundColor: C.green,
                      borderTopLeftRadius: 2,
                      borderTopRightRadius: 2,
                      // The latest column is the one you came here to read.
                      opacity: latest ? 1 : 0.45,
                    }}
                  />
                )}
              </View>
              <View style={{ height: below }}>
                {!up && (
                  <View
                    style={{
                      height: h,
                      backgroundColor: C.red,
                      borderBottomLeftRadius: 2,
                      borderBottomRightRadius: 2,
                      opacity: latest ? 1 : 0.45,
                    }}
                  />
                )}
              </View>
            </View>
          );
        })}
      </View>

      {/* The zero line, drawn over the plot at the height the bars agree on. */}
      <View
        style={{
          height: 1,
          backgroundColor: C.borderStrong,
          marginTop: -below - 1,
          marginBottom: below,
        }}
      />

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
        <Text style={{ ...TYPE.small, color: C.subtext2 }}>{points.length} sessions</Text>
        <Text style={{ ...TYPE.small, ...nums, color: last >= 0 ? C.green : C.red, fontWeight: '650' }}>
          {money(last)}
        </Text>
      </View>
    </View>
  );
}
