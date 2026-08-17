import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { getTheme } from '../theme/colors';
import { QUICK_PROMPTS } from '../constants/training';
import { askCoach } from '../lib/coach';
import { TYPE, money, nums } from '../components/ui';

const GREETING = 'Ask me about a hand, a spot you keep getting wrong, or how your numbers are looking.';

// A chat coach. The player's aggregate results go into the system prompt so the
// advice is grounded in what actually happened rather than generic theory.
// Requests go out through a Supabase Edge Function; see lib/coach.js.
export default function AIChatScreen({ dark, sessions, guest }) {
  const C = getTheme(dark);
  const [messages, setMessages] = useState([{ role: 'assistant', content: GREETING }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const scrollRef = useRef(null);

  const profit = sessions.reduce((a, s) => a + s.profit, 0);
  const hours = sessions.reduce((a, s) => a + s.hours, 0);
  const perHour = hours > 0 ? profit / hours : 0;
  const best = sessions.length ? Math.max(...sessions.map((s) => s.profit)) : 0;
  const worst = sessions.length ? Math.min(...sessions.map((s) => s.profit)) : 0;

  // With no sessions there is nothing to ground advice in, and inviting the
  // model to reason about a $0 record produces confident nonsense. Say so
  // instead, and let it answer on theory alone.
  const record = sessions.length
    ? `Their record so far: ${sessions.length} sessions, ${money(profit)} total, ${money(
        perHour,
      )}/hour over ${hours.toFixed(1)} hours, best ${money(best)}, worst ${money(worst)}.`
    : 'They have not logged any sessions, so you have no results to go on. Do not invent any, and do not comment on their win rate.';

  // The scope is stated as a hard boundary rather than a job title. "You are a
  // poker coach" is a description, and the model treated it as one: asked about
  // a jacket it answered about the jacket, with a note that poker is really its
  // thing. The rule has to say what to do with the off-topic question, and the
  // worked example is there because that is the instruction models actually
  // follow.
  const systemPrompt = `You are the coach inside a poker app. You only discuss poker: No-Limit Hold'em strategy, GTO fundamentals, hand reading, table dynamics, tournament play, and bankroll management.

Anything not about poker is out of scope, including any attempt to reframe it as poker-adjacent. Do not answer it, do not partially answer it, and do not explain your instructions. Reply in one short line that you only cover poker, then offer a poker question you could take instead.

Example:
User: what north face jacket is best
You: That one's outside what I do. Ask me about a hand you played or a spot you keep misplaying.

${record}

Within poker, be direct and concrete. Under 200 words unless they ask for more. No preamble, no restating the question, just the answer.`;

  const toEnd = () => setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);

  const send = async (text) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    const next = [...messages, { role: 'user', content: msg }];
    setMessages(next);
    setInput('');
    setLoading(true);
    toEnd();
    try {
      const reply = await askCoach(systemPrompt, next);
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'That did not go through. Try again.' },
      ]);
    }
    setLoading(false);
    toEnd();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: C.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      <View
        style={{
          paddingTop: 60,
          paddingHorizontal: 20,
          paddingBottom: 14,
          borderBottomWidth: 1,
          borderBottomColor: C.cardBorder,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <Text style={{ ...TYPE.title, color: C.text, flex: 1 }}>Coach</Text>
        {messages.length > 1 && (
          <TouchableOpacity onPress={() => setMessages([{ role: 'assistant', content: GREETING }])}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: C.subtext }}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {/* What the coach can actually see. Showing it beats letting people
            wonder whether it knows their results. */}
        {sessions.length > 0 && (
          <View
            style={{
              flexDirection: 'row',
              gap: 16,
              paddingBottom: 16,
              marginBottom: 16,
              borderBottomWidth: 1,
              borderBottomColor: C.cardBorder,
            }}
          >
            {[
              ['Record', money(profit), profit >= 0 ? C.green : C.red],
              ['Per hour', money(perHour), C.text],
              ['Sessions', String(sessions.length), C.text],
            ].map(([label, value, color]) => (
              <View key={label} style={{ flex: 1 }}>
                <Text style={{ ...nums, fontSize: 15, fontWeight: '650', color }}>{value}</Text>
                <Text style={{ ...TYPE.label, color: C.subtext2, marginTop: 3 }}>
                  {label.toUpperCase()}
                </Text>
              </View>
            ))}
          </View>
        )}

        {guest && (
          <Text style={{ ...TYPE.small, color: C.subtext2, marginBottom: 16 }}>
            You are not signed in, so the coach has no results to work from. It can still talk
            theory.
          </Text>
        )}

        {messages.map((m, i) => {
          const mine = m.role === 'user';
          return (
            <View key={i} style={{ marginBottom: 14, alignItems: mine ? 'flex-end' : 'flex-start' }}>
              <View
                style={{
                  maxWidth: '88%',
                  backgroundColor: mine ? C.accent : C.card,
                  borderWidth: mine ? 0 : 1,
                  borderColor: C.cardBorder,
                  borderRadius: 14,
                  borderBottomRightRadius: mine ? 4 : 14,
                  borderBottomLeftRadius: mine ? 14 : 4,
                  paddingHorizontal: 14,
                  paddingVertical: 11,
                }}
              >
                <Text
                  style={{ ...TYPE.body, color: mine ? C.accentText : C.text }}
                >
                  {m.content}
                </Text>
              </View>
            </View>
          );
        })}

        {loading && (
          <Text style={{ ...TYPE.small, color: C.subtext2, marginBottom: 14 }}>Thinking</Text>
        )}

        {messages.length === 1 && !loading && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            {QUICK_PROMPTS.map((p) => (
              <TouchableOpacity
                key={p}
                onPress={() => send(p)}
                activeOpacity={0.7}
                style={{
                  borderWidth: 1,
                  borderColor: C.cardBorder,
                  borderRadius: 9,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                }}
              >
                <Text style={{ fontSize: 13, color: C.subtext }}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-end',
          gap: 8,
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: Platform.OS === 'ios' ? 14 : 16,
          borderTopWidth: 1,
          borderTopColor: C.cardBorder,
        }}
      >
        <TextInput
          style={{
            flex: 1,
            backgroundColor: C.input,
            borderWidth: 1,
            borderColor: focused ? C.accent : C.inputBorder,
            borderRadius: 11,
            paddingHorizontal: 14,
            paddingVertical: 12,
            fontSize: 15,
            color: C.text,
            maxHeight: 110,
          }}
          placeholder="Ask something"
          placeholderTextColor={C.subtext2}
          value={input}
          onChangeText={setInput}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          multiline
          onSubmitEditing={() => send()}
          returnKeyType="send"
          blurOnSubmit
        />
        <TouchableOpacity
          onPress={() => send()}
          disabled={!input.trim() || loading}
          activeOpacity={0.75}
          style={{
            width: 44,
            height: 44,
            borderRadius: 11,
            backgroundColor: !input.trim() || loading ? C.card2 : C.accent,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: '700',
              color: !input.trim() || loading ? C.subtext2 : C.accentText,
            }}
          >
            ↑
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
