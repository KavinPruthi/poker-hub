import { Platform, Text, TouchableOpacity, View } from 'react-native';
import { getTheme } from '../theme/colors';

// Icons are drawn from plain Views rather than an emoji or an icon font. Five
// shapes at this size do not justify a dependency, and emoji arrive in whatever
// style the platform feels like, which is the fastest way to make an app look
// like it was assembled rather than designed.
function Icon({ id, color }) {
  const bar = (h) => (
    <View key={h} style={{ width: 3, height: h, borderRadius: 1.5, backgroundColor: color }} />
  );

  if (id === 'home') {
    return (
      <View style={{ width: 16, height: 16, alignItems: 'center', justifyContent: 'center' }}>
        <View
          style={{
            width: 13,
            height: 13,
            borderRadius: 3.5,
            borderWidth: 1.6,
            borderColor: color,
            transform: [{ rotate: '45deg' }],
          }}
        />
      </View>
    );
  }
  if (id === 'grind') {
    // Ascending bars: the bankroll curve, abbreviated.
    return (
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 2.5, height: 16 }}>
        {[6, 10, 14].map(bar)}
      </View>
    );
  }
  if (id === 'train') {
    return (
      <View
        style={{ width: 15, height: 15, borderRadius: 7.5, borderWidth: 1.6, borderColor: color }}
      >
        <View
          style={{
            width: 5,
            height: 5,
            borderRadius: 2.5,
            backgroundColor: color,
            margin: 3,
          }}
        />
      </View>
    );
  }
  if (id === 'coach') {
    // Speech bubble: a rounded box with one squared-off corner.
    return (
      <View
        style={{
          width: 16,
          height: 13,
          borderWidth: 1.6,
          borderColor: color,
          borderRadius: 4,
          borderBottomLeftRadius: 0,
        }}
      />
    );
  }
  return (
    <View style={{ flexDirection: 'row', gap: 3, height: 16, alignItems: 'center' }}>
      {[0, 1, 2].map((i) => (
        <View key={i} style={{ width: 3, height: 3, borderRadius: 1.5, backgroundColor: color }} />
      ))}
    </View>
  );
}

const TABS = [
  ['home', 'Home'],
  ['grind', 'Grind'],
  ['train', 'Train'],
  ['coach', 'Coach'],
  ['settings', 'More'],
];

export default function BottomTabBar({ tab, onNavigate, dark }) {
  const C = getTheme(dark);

  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: C.bg,
        borderTopWidth: 1,
        borderTopColor: C.cardBorder,
        paddingBottom: Platform.OS === 'ios' ? 26 : 10,
        paddingTop: 10,
      }}
    >
      {TABS.map(([id, label]) => {
        const active = tab === id;
        const color = active ? C.accent : C.subtext2;
        return (
          <TouchableOpacity
            key={id}
            onPress={() => onNavigate(id)}
            activeOpacity={0.7}
            style={{ flex: 1, alignItems: 'center', gap: 6 }}
          >
            <Icon id={id} color={color} />
            <Text style={{ fontSize: 10.5, fontWeight: active ? '700' : '500', color }}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
