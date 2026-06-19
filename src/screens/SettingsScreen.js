import { Alert, ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';
import { getTheme } from '../theme/colors';

// Account + preferences. Dark mode preference is persisted to the user's
// Supabase metadata (handled by the root App), so it follows them across devices.
export default function SettingsScreen({ dark, setDark, user }) {
  const C = getTheme(dark);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => supabase.auth.signOut() },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView contentContainerStyle={{ padding: 28, paddingTop: 64, paddingBottom: 100 }}>
        <Text style={{ fontSize: 24, fontWeight: '800', color: C.text, marginBottom: 32 }}>⚙️ Settings</Text>

        <View style={{ backgroundColor: C.card, borderRadius: 20, borderWidth: 1, borderColor: C.cardBorder, overflow: 'hidden', marginBottom: 16 }}>
          <View style={{ padding: 20, borderBottomWidth: 1, borderBottomColor: C.cardBorder }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: C.subtext, marginBottom: 4 }}>SIGNED IN AS</Text>
            <Text style={{ fontSize: 15, fontWeight: '600', color: C.text }}>{user?.email}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: C.cardBorder }}>
            <View><Text style={{ fontSize: 16, fontWeight: '600', color: C.text }}>Dark Mode</Text><Text style={{ fontSize: 13, color: C.subtext, marginTop: 2 }}>Easy on the eyes at the table</Text></View>
            <Switch value={dark} onValueChange={setDark} trackColor={{ false: '#ccc', true: C.accent }} thumbColor="#fff" />
          </View>
          <View style={{ padding: 20, borderBottomWidth: 1, borderBottomColor: C.cardBorder }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: C.text }}>Version</Text>
            <Text style={{ fontSize: 13, color: C.subtext, marginTop: 2 }}>Poker Hub v2.0.0 — AI Edition</Text>
          </View>
          <View style={{ padding: 20 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: C.text }}>Stack</Text>
            <Text style={{ fontSize: 13, color: C.subtext, marginTop: 2 }}>React Native · Expo · Supabase · Groq AI</Text>
          </View>
        </View>

        <TouchableOpacity onPress={handleLogout} style={{ backgroundColor: C.redSoft, borderRadius: 16, padding: 18, alignItems: 'center', borderWidth: 1, borderColor: C.red }}>
          <Text style={{ color: C.red, fontWeight: '700', fontSize: 16 }}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
