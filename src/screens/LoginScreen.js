import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';
import { getTheme } from '../theme/colors';

// Email/password auth handled entirely by Supabase. Sign-up sends a confirmation
// email; sign-in resolves the session, which the root App listens for.
export default function LoginScreen({ dark }) {
  const C = getTheme(dark);
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter email and password.');
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
      else setSuccess('Check your email to confirm your account, then sign in.');
    }
    setLoading(false);
  };

  const inp = { backgroundColor: C.input, borderWidth: 1, borderColor: C.inputBorder, borderRadius: 14, padding: 16, fontSize: 16, color: C.text, marginBottom: 12 };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: C.bg }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 28 }}>
        <View style={{ marginBottom: 40 }}>
          <Text style={{ fontSize: 36, fontWeight: '800', color: C.text, letterSpacing: -1 }}>Poker Hub 🃏</Text>
          <Text style={{ fontSize: 15, color: C.subtext, marginTop: 6 }}>Track. Train. Dominate.</Text>
        </View>

        <View style={{ flexDirection: 'row', backgroundColor: C.card, borderRadius: 14, padding: 4, marginBottom: 24, borderWidth: 1, borderColor: C.cardBorder }}>
          <TouchableOpacity onPress={() => { setMode('signin'); setError(''); setSuccess(''); }} style={{ flex: 1, paddingVertical: 11, borderRadius: 10, backgroundColor: mode === 'signin' ? C.accent : 'transparent', alignItems: 'center' }}>
            <Text style={{ color: mode === 'signin' ? '#fff' : C.subtext, fontWeight: '700', fontSize: 15 }}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setMode('signup'); setError(''); setSuccess(''); }} style={{ flex: 1, paddingVertical: 11, borderRadius: 10, backgroundColor: mode === 'signup' ? C.accent : 'transparent', alignItems: 'center' }}>
            <Text style={{ color: mode === 'signup' ? '#fff' : C.subtext, fontWeight: '700', fontSize: 15 }}>Sign Up</Text>
          </TouchableOpacity>
        </View>

        <TextInput style={inp} placeholder="Email" placeholderTextColor={C.subtext} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <TextInput style={[inp, { marginBottom: 20 }]} placeholder="Password (min 6 chars)" placeholderTextColor={C.subtext} value={password} onChangeText={setPassword} secureTextEntry />

        {error ? <Text style={{ color: C.red, fontSize: 13, marginBottom: 14, lineHeight: 18 }}>{error}</Text> : null}
        {success ? <Text style={{ color: C.green, fontSize: 13, marginBottom: 14, lineHeight: 18 }}>{success}</Text> : null}

        <TouchableOpacity onPress={handleAuth} disabled={loading} style={{ backgroundColor: loading ? C.subtext : C.accent, borderRadius: 14, padding: 17, alignItems: 'center' }}>
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>
            {loading ? 'Loading...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
