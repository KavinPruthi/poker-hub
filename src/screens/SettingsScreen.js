import { useState } from 'react';
import { Switch, Text, View } from 'react-native';
import { supabase } from '../lib/supabase';
import { getTheme } from '../theme/colors';
import { Button, Card, ConfirmSheet, Divider, Header, Screen, SectionLabel, TYPE } from '../components/ui';

// Account and preferences. The theme choice is written to the user's Supabase
// metadata by the root App, so it follows them to any device they sign in on.
export default function SettingsScreen({ dark, setDark, user, guest, onSignIn }) {
  const C = getTheme(dark);
  const [confirming, setConfirming] = useState(false);

  const Row = ({ label, value, children }) => (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 15, color: C.text }}>{label}</Text>
        {value ? (
          <Text style={{ ...TYPE.small, color: C.subtext, marginTop: 2 }}>{value}</Text>
        ) : null}
      </View>
      {children}
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <Screen dark={dark}>
        <Header dark={dark} title="More" />

        <SectionLabel dark={dark}>Account</SectionLabel>
        <Card dark={dark} padded={false} style={{ marginBottom: 26 }}>
          {guest ? (
            <View style={{ padding: 16 }}>
              <Text style={{ fontSize: 15, color: C.text }}>Not signed in</Text>
              <Text style={{ ...TYPE.small, color: C.subtext, marginTop: 4 }}>
                Nothing you do right now is being saved.
              </Text>
              <Button dark={dark} label="Sign in" onPress={onSignIn} style={{ marginTop: 14 }} />
            </View>
          ) : (
            <Row label={user?.email} value="Signed in" />
          )}
        </Card>

        <SectionLabel dark={dark}>Display</SectionLabel>
        <Card dark={dark} padded={false} style={{ marginBottom: 26 }}>
          <Row label="Dark" value="Easier on the eyes at a table">
            <Switch
              value={dark}
              onValueChange={setDark}
              trackColor={{ false: C.cardBorder, true: C.accent }}
              thumbColor={dark ? C.accentText : '#FFFFFF'}
            />
          </Row>
        </Card>

        <SectionLabel dark={dark}>About</SectionLabel>
        <Card dark={dark} padded={false} style={{ marginBottom: 26 }}>
          <Row label="Version" value="2.0" />
          <Divider dark={dark} />
          <Row label="Built with" value="React Native, Expo, Supabase" />
          <Divider dark={dark} />
          <Row
            label="Equity"
            value="Monte Carlo, 5,000 hands per matchup, run on the device"
          />
        </Card>

        {!guest && (
          <Button dark={dark} tone="danger" label="Sign out" onPress={() => setConfirming(true)} />
        )}
      </Screen>

      <ConfirmSheet
        dark={dark}
        visible={confirming}
        onClose={() => setConfirming(false)}
        title="Sign out?"
        body="Your sessions stay where they are. You can sign back in any time."
        confirmLabel="Sign out"
        onConfirm={() => supabase.auth.signOut()}
      />
    </View>
  );
}
