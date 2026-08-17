import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';
import { getTheme } from '../theme/colors';
import { Button, TYPE } from '../components/ui';
import Wordmark from '../components/Wordmark';

// Email and password, handled by Supabase. Sign-up sends a confirmation mail;
// sign-in resolves a session, which the root App is listening for.
export default function LoginScreen({ dark, onGuest }) {
  const C = getTheme(dark);
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [focused, setFocused] = useState(null);

  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Enter an email and password.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    if (mode === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) setError(error.message);
    } else {
      const { error } = await supabase.auth.signUp({ email: email.trim(), password });
      if (error) setError(error.message);
      else setSuccess('Check your email to confirm, then sign in.');
    }
    setLoading(false);
  };

  const field = (name) => ({
    backgroundColor: C.input,
    borderWidth: 1,
    // The focus ring is the one place gold earns its keep on this screen.
    borderColor: focused === name ? C.accent : C.inputBorder,
    borderRadius: 11,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 15.5,
    color: C.text,
    marginBottom: 10,
  });

  const switchTo = (m) => {
    setMode(m);
    setError('');
    setSuccess('');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: C.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 26 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ marginBottom: 34 }}>
          <Wordmark dark={dark} size={30} />
          <Text style={{ ...TYPE.body, color: C.subtext, marginTop: 10 }}>
            A bankroll ledger and a preflop trainer.
          </Text>
        </View>

        {/* Segmented control. The gold underline moves rather than a filled
            pill sliding around, which stays quiet next to the input stack. */}
        <View style={{ flexDirection: 'row', marginBottom: 22 }}>
          {[['signin', 'Sign in'], ['signup', 'Create account']].map(([m, label]) => (
            <TouchableOpacity key={m} onPress={() => switchTo(m)} style={{ marginRight: 22 }}>
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: '650',
                  color: mode === m ? C.text : C.subtext,
                  paddingBottom: 7,
                }}
              >
                {label}
              </Text>
              <View
                style={{
                  height: 2,
                  borderRadius: 1,
                  backgroundColor: mode === m ? C.accent : 'transparent',
                }}
              />
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          style={field('email')}
          placeholder="Email"
          placeholderTextColor={C.subtext2}
          value={email}
          onChangeText={setEmail}
          onFocus={() => setFocused('email')}
          onBlur={() => setFocused(null)}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
        />
        <TextInput
          style={[field('password'), { marginBottom: 18 }]}
          placeholder={mode === 'signup' ? 'Password, 6 characters or more' : 'Password'}
          placeholderTextColor={C.subtext2}
          value={password}
          onChangeText={setPassword}
          onFocus={() => setFocused('password')}
          onBlur={() => setFocused(null)}
          secureTextEntry
        />

        {error ? (
          <Text style={{ ...TYPE.small, color: C.red, marginBottom: 14 }}>{error}</Text>
        ) : null}
        {success ? (
          <Text style={{ ...TYPE.small, color: C.green, marginBottom: 14 }}>{success}</Text>
        ) : null}

        <Button
          dark={dark}
          onPress={handleAuth}
          disabled={loading}
          label={loading ? 'One moment' : mode === 'signin' ? 'Sign in' : 'Create account'}
        />

        {/* An account is only needed to SAVE things. Everything the app works
            out on the device works without one, so there is no reason to put a
            wall in front of it. */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 22 }}>
          <View style={{ flex: 1, height: 1, backgroundColor: C.cardBorder }} />
          <Text style={{ color: C.subtext2, fontSize: 11.5, marginHorizontal: 12 }}>or</Text>
          <View style={{ flex: 1, height: 1, backgroundColor: C.cardBorder }} />
        </View>

        <Button dark={dark} tone="secondary" onPress={onGuest} label="Look around first" />
        <Text
          style={{ ...TYPE.small, color: C.subtext, textAlign: 'center', marginTop: 12 }}
        >
          The trainer, the charts and the odds calculator all work without an account.
          Only saved sessions need one.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
