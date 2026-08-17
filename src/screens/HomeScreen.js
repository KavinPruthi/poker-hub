import { Text, TouchableOpacity, View } from 'react-native';
import { getTheme } from '../theme/colors';
import { Button, Card, Divider, Header, Screen, SectionLabel, TYPE, money, nums } from '../components/ui';
import Wordmark from '../components/Wordmark';

const DESTINATIONS = [
  { id: 'grind', name: 'Grind', blurb: 'Sessions and the bankroll curve', pip: '♦' },
  { id: 'train', name: 'Train', blurb: 'Preflop ranges, drills, pot odds', pip: '♣' },
  { id: 'coach', name: 'Coach', blurb: 'Ask about a hand you played', pip: '♥' },
];

// Landing screen. One figure that matters, then the way into everything else.
export default function HomeScreen({
  onNavigate,
  dark,
  totalProfit,
  winRate,
  totalHours,
  sessionCount,
  user,
  guest,
  onSignIn,
}) {
  const C = getTheme(dark);
  const up = totalProfit >= 0;

  return (
    <Screen dark={dark}>
      <Header
        dark={dark}
        title={<Wordmark dark={dark} size={21} />}
        right={
          <TouchableOpacity
            onPress={() => onNavigate('settings')}
            hitSlop={10}
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: C.cardBorder,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Three bars, drawn rather than an emoji cog. */}
            <View style={{ gap: 3 }}>
              {[10, 14, 8].map((w, i) => (
                <View key={i} style={{ width: w, height: 1.5, backgroundColor: C.subtext }} />
              ))}
            </View>
          </TouchableOpacity>
        }
      />

      {guest ? (
        <Card dark={dark} style={{ marginBottom: 26 }}>
          <Text style={{ ...TYPE.heading, color: C.text }}>You're just looking around</Text>
          <Text style={{ ...TYPE.body, color: C.subtext, marginTop: 6 }}>
            The trainer and the calculators work as they always do. Sessions need an account,
            because they have to live somewhere.
          </Text>
          <Button dark={dark} onPress={onSignIn} label="Sign in" style={{ marginTop: 14 }} />
        </Card>
      ) : (
        // The hero is the number itself, not a coloured box around it. Money is
        // the only thing on this screen allowed to be green or red.
        <View style={{ marginBottom: 28 }}>
          <SectionLabel dark={dark}>All time</SectionLabel>
          <Text
            style={{
              ...nums,
              fontSize: 46,
              fontWeight: '700',
              letterSpacing: -2,
              color: sessionCount === 0 ? C.subtext2 : up ? C.green : C.red,
            }}
          >
            {money(totalProfit)}
          </Text>

          <View style={{ flexDirection: 'row', marginTop: 20, gap: 14 }}>
            {[
              ['Per hour', totalHours > 0 ? money(winRate) : '—'],
              ['Hours', totalHours > 0 ? totalHours.toFixed(0) : '—'],
              ['Sessions', String(sessionCount)],
            ].map(([label, value]) => (
              <View key={label} style={{ flex: 1 }}>
                <Text style={{ ...nums, fontSize: 17, fontWeight: '650', color: C.text }}>
                  {value}
                </Text>
                <Text style={{ ...TYPE.label, color: C.subtext2, marginTop: 4 }}>
                  {label.toUpperCase()}
                </Text>
              </View>
            ))}
          </View>

          {sessionCount === 0 && (
            <Text style={{ ...TYPE.small, color: C.subtext, marginTop: 16 }}>
              Nothing logged yet. The first session takes about ten seconds.
            </Text>
          )}
        </View>
      )}

      <Card dark={dark} padded={false}>
        {DESTINATIONS.map((d, i) => (
          <View key={d.id}>
            {i > 0 && <Divider dark={dark} style={{ marginLeft: 52 }} />}
            <TouchableOpacity
              onPress={() => onNavigate(d.id)}
              activeOpacity={0.65}
              style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}
            >
              <Text style={{ color: C.accent, fontSize: 17, width: 36 }}>{d.pip}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ ...TYPE.heading, color: C.text }}>{d.name}</Text>
                <Text style={{ ...TYPE.small, color: C.subtext, marginTop: 2 }}>{d.blurb}</Text>
              </View>
              <Text style={{ color: C.subtext2, fontSize: 18 }}>›</Text>
            </TouchableOpacity>
          </View>
        ))}
      </Card>

      {!guest && user?.email ? (
        <Text style={{ ...TYPE.small, color: C.subtext2, marginTop: 20 }}>{user.email}</Text>
      ) : null}
    </Screen>
  );
}
