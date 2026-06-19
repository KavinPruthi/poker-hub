import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { supabase } from './src/lib/supabase';
import { getTheme } from './src/theme/colors';
import BottomTabBar from './src/components/BottomTabBar';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import GrindScreen from './src/screens/GrindScreen';
import TrainScreen from './src/screens/TrainScreen';
import AIChatScreen from './src/screens/AIChatScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// Root of the app. Owns auth state, the active tab, the user's session list, and
// the dark-mode preference, then renders the matching screen. A tiny hand-rolled
// tab router keeps the dependency footprint small.
export default function App() {
  const [tab, setTab] = useState('home');
  const [dark, setDark] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Restore the existing session on launch and keep `user` in sync with any
  // sign-in / sign-out events. Dark-mode preference rides along in user metadata.
  useEffect(() => {
    const applySession = (session) => {
      setUser(session?.user ?? null);
      if (session?.user?.user_metadata?.dark_mode !== undefined) {
        setDark(session.user.user_metadata.dark_mode);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      applySession(session);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => applySession(session));
    return () => subscription.unsubscribe();
  }, []);

  // Refresh the session list whenever the user changes or switches tabs, so
  // stats stay current across the Home, Grind, and Coach screens.
  useEffect(() => {
    if (!user) return;
    supabase
      .from('sessions')
      .select('*')
      .eq('user_id', user.id)
      .then(({ data }) => {
        if (data) setSessions(data);
      });
  }, [tab, user]);

  const handleSetDark = async (value) => {
    setDark(value);
    if (user) await supabase.auth.updateUser({ data: { dark_mode: value } });
  };

  const C = getTheme(dark);
  const totalProfit = sessions.reduce((sum, s) => sum + s.profit, 0);
  const totalHours = sessions.reduce((sum, s) => sum + s.hours, 0);
  const winRate = totalHours > 0 ? (totalProfit / totalHours).toFixed(2) : 0;
  const statusBarStyle = dark ? 'light' : 'dark';

  if (authLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 32 }}>🃏</Text>
        <Text style={{ color: C.subtext, marginTop: 12, fontSize: 15 }}>Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <>
        <LoginScreen dark={dark} />
        <StatusBar style={statusBarStyle} />
      </>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar style={statusBarStyle} />
      {tab === 'home' && <HomeScreen onNavigate={setTab} dark={dark} totalProfit={totalProfit} winRate={winRate} sessionCount={sessions.length} user={user} />}
      {tab === 'grind' && <GrindScreen dark={dark} user={user} />}
      {tab === 'train' && <TrainScreen dark={dark} />}
      {tab === 'coach' && <AIChatScreen dark={dark} sessions={sessions} />}
      {tab === 'settings' && <SettingsScreen dark={dark} setDark={handleSetDark} user={user} />}
      <BottomTabBar tab={tab} onNavigate={setTab} dark={dark} />
    </View>
  );
}
