import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
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

// Root of the app. Owns auth, the active tab, the session list and the theme,
// then renders the matching screen. A small hand-rolled router; the app has five
// destinations and no deep links, so a navigation library would be dead weight.
export default function App() {
  const [tab, setTab] = useState('home');
  const [dark, setDark] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Guest mode. An account is only needed to *save* things, so everything the
  // app works out on the device -- the trainer, the range charts, the equity
  // calculator -- is reachable without one. This flag says "they chose to look
  // around", and the only screen that checks it is the bankroll tracker.
  const [guest, setGuest] = useState(false);

  useEffect(() => {
    const applySession = (session) => {
      setUser(session?.user ?? null);
      // Signing in supersedes looking around.
      if (session?.user) setGuest(false);
      if (session?.user?.user_metadata?.dark_mode !== undefined) {
        setDark(session.user.user_metadata.dark_mode);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      applySession(session);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => applySession(session));
    return () => subscription.unsubscribe();
  }, []);

  // Refresh stats when the user changes or they switch tabs, so Home and Coach
  // agree with what the Grind screen last wrote.
  useEffect(() => {
    if (!user) {
      setSessions([]);
      return;
    }
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

  // Leaving guest mode drops you back on the sign-in screen.
  const exitGuest = () => {
    setGuest(false);
    setTab('home');
  };

  const C = getTheme(dark);
  const totalProfit = sessions.reduce((sum, s) => sum + s.profit, 0);
  const totalHours = sessions.reduce((sum, s) => sum + s.hours, 0);
  const winRate = totalHours > 0 ? totalProfit / totalHours : 0;
  const statusBarStyle = dark ? 'light' : 'dark';

  if (authLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={C.subtext} />
        <StatusBar style={statusBarStyle} />
      </View>
    );
  }

  if (!user && !guest) {
    return (
      <>
        <LoginScreen dark={dark} onGuest={() => setGuest(true)} />
        <StatusBar style={statusBarStyle} />
      </>
    );
  }

  const shared = { dark, user, guest, onSignIn: exitGuest };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar style={statusBarStyle} />
      {tab === 'home' && (
        <HomeScreen
          {...shared}
          onNavigate={setTab}
          totalProfit={totalProfit}
          winRate={winRate}
          totalHours={totalHours}
          sessionCount={sessions.length}
        />
      )}
      {tab === 'grind' && <GrindScreen {...shared} />}
      {tab === 'train' && <TrainScreen dark={dark} />}
      {tab === 'coach' && <AIChatScreen {...shared} sessions={sessions} />}
      {tab === 'settings' && <SettingsScreen {...shared} setDark={handleSetDark} />}
      <BottomTabBar tab={tab} onNavigate={setTab} dark={dark} />
    </View>
  );
}
