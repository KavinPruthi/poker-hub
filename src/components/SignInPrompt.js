import { Text, View } from 'react-native';
import { getTheme } from '../theme/colors';
import { Button, TYPE } from './ui';

// Shown in place of any feature that needs somewhere to store data.
//
// The rule for guest mode: anything worked out on the device stays open, and
// only the parts that have to persist ask you to sign in. The trainer, the
// range charts and the odds calculator are all fully usable, so this appears on
// exactly one screen.
//
// It says what an account would get you rather than only what it blocks. "Sign
// in to continue", with no reason attached, is what makes people close the app.
export default function SignInPrompt({ dark, onSignIn, title, reason, bullets = [] }) {
  const C = getTheme(dark);

  return (
    <View style={{ flex: 1, justifyContent: 'center', paddingBottom: 60 }}>
      <Text style={{ ...TYPE.title, color: C.text }}>{title}</Text>
      <Text style={{ ...TYPE.body, color: C.subtext, marginTop: 8 }}>{reason}</Text>

      {bullets.length > 0 && (
        <View style={{ marginTop: 20, marginBottom: 4 }}>
          {bullets.map((b) => (
            <View key={b} style={{ flexDirection: 'row', marginBottom: 10 }}>
              <Text style={{ color: C.accent, fontSize: 14, width: 18 }}>♦</Text>
              <Text style={{ ...TYPE.body, color: C.subtext, flex: 1 }}>{b}</Text>
            </View>
          ))}
        </View>
      )}

      <Button dark={dark} onPress={onSignIn} label="Sign in" style={{ marginTop: 18 }} />
      <Text style={{ ...TYPE.small, color: C.subtext2, textAlign: 'center', marginTop: 12 }}>
        Everything else stays open without one.
      </Text>
    </View>
  );
}
