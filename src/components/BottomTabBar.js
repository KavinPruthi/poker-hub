import { Platform, Text, TouchableOpacity, View } from 'react-native';
import { getTheme } from '../theme/colors';

const TABS = [
  { id: 'home', icon: '🏠', label: 'Home' },
  { id: 'grind', icon: '📊', label: 'Grind' },
  { id: 'train', icon: '🧠', label: 'Train' },
  { id: 'coach', icon: '🤖', label: 'AI Coach' },
  { id: 'settings', icon: '⚙️', label: 'More' },
];

export default function BottomTabBar({ tab, onNavigate, dark }) {
  const C = getTheme(dark);
  return (
    <View style={{ flexDirection: 'row', backgroundColor: C.card, borderTopWidth: 1, borderTopColor: C.cardBorder, paddingBottom: Platform.OS === 'ios' ? 24 : 8, paddingTop: 8, paddingHorizontal: 8 }}>
      {TABS.map((t) => {
        const isActive = tab === t.id;
        return (
          <TouchableOpacity key={t.id} onPress={() => onNavigate(t.id)} style={{ flex: 1, alignItems: 'center', paddingVertical: 4 }}>
            <View style={{ paddingHorizontal: 8, paddingVertical: 5, borderRadius: 14, backgroundColor: isActive ? C.accentSoft : 'transparent', alignItems: 'center', minWidth: 48 }}>
              <Text style={{ fontSize: 20, marginBottom: 2 }}>{t.icon}</Text>
              <Text style={{ fontSize: 10, fontWeight: isActive ? '700' : '500', color: isActive ? C.accent : C.subtext }}>{t.label}</Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
