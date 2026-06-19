import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { getTheme } from '../theme/colors';
import { QUICK_PROMPTS } from '../constants/training';
import { askCoach } from '../lib/coach';

const GREETING = "Hey! I'm your personal poker coach. I can help with GTO strategy, hand analysis, bankroll management, and review your session stats. What do you want to work on?";

// Chat with an LLM poker coach. The player's aggregate stats are injected into
// the system prompt so the coach can give advice grounded in their actual
// results. Requests go through a Supabase Edge Function (see lib/coach.js).
export default function AIChatScreen({ dark, sessions }) {
  const C = getTheme(dark);
  const [messages, setMessages] = useState([{ role: 'assistant', content: GREETING }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  const totalProfit = sessions.reduce((sum, s) => sum + s.profit, 0);
  const totalHours = sessions.reduce((sum, s) => sum + s.hours, 0);
  const winRate = totalHours > 0 ? (totalProfit / totalHours).toFixed(2) : 0;
  const bestSession = sessions.length ? Math.max(...sessions.map((s) => s.profit)) : 0;
  const worstSession = sessions.length ? Math.min(...sessions.map((s) => s.profit)) : 0;

  const systemPrompt = `You are an elite poker coach specializing in GTO strategy, No-Limit Hold'em, hand analysis, and bankroll management. Be concise, practical, and direct.

Player stats:
- Total sessions: ${sessions.length}
- Total profit: $${totalProfit.toFixed(0)}
- Win rate: $${winRate}/hour
- Total hours: ${totalHours.toFixed(1)}h
- Best session: +$${bestSession.toFixed(0)}
- Worst session: $${worstSession.toFixed(0)}

Keep responses under 200 words unless the player explicitly asks for detail. Use bullet points when listing multiple points. Reference their stats when relevant.`;

  const scrollToEnd = () => setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

  const sendMessage = async (text) => {
    const userMsg = (text || input).trim();
    if (!userMsg || loading) return;
    const newMessages = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    scrollToEnd();
    try {
      const reply = await askCoach(systemPrompt, newMessages);
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (e) {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Connection error. Please try again.' }]);
    }
    setLoading(false);
    scrollToEnd();
  };

  const clearChat = () => setMessages([{ role: 'assistant', content: GREETING }]);

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: C.bg }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
      <View style={{ paddingTop: 60, paddingHorizontal: 24, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: C.cardBorder, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: C.accentSoft, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: 22 }}>🤖</Text></View>
          <View><Text style={{ fontSize: 18, fontWeight: '800', color: C.text }}>AI Coach</Text><Text style={{ fontSize: 12, color: C.green }}>● Online</Text></View>
        </View>
        <TouchableOpacity onPress={clearChat} style={{ backgroundColor: C.card, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1, borderColor: C.cardBorder }}>
          <Text style={{ color: C.subtext, fontSize: 12, fontWeight: '600' }}>Clear</Text>
        </TouchableOpacity>
      </View>
      <ScrollView ref={scrollRef} style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 8 }} onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}>
        {sessions.length > 0 && (
          <View style={{ backgroundColor: C.accentSoft, borderRadius: 16, padding: 14, marginBottom: 16, flexDirection: 'row', justifyContent: 'space-around' }}>
            <View style={{ alignItems: 'center' }}><Text style={{ color: totalProfit >= 0 ? C.green : C.red, fontSize: 16, fontWeight: '800' }}>{totalProfit >= 0 ? '+' : ''}${totalProfit.toFixed(0)}</Text><Text style={{ color: C.subtext, fontSize: 10 }}>Total P&L</Text></View>
            <View style={{ alignItems: 'center' }}><Text style={{ color: C.accent, fontSize: 16, fontWeight: '800' }}>${winRate}/hr</Text><Text style={{ color: C.subtext, fontSize: 10 }}>Win Rate</Text></View>
            <View style={{ alignItems: 'center' }}><Text style={{ color: C.text, fontSize: 16, fontWeight: '800' }}>{sessions.length}</Text><Text style={{ color: C.subtext, fontSize: 10 }}>Sessions</Text></View>
          </View>
        )}
        {messages.map((msg, i) => (
          <View key={i} style={{ marginBottom: 12, alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            {msg.role === 'assistant' && <Text style={{ fontSize: 10, color: C.subtext, marginBottom: 4, marginLeft: 4 }}>AI Coach</Text>}
            <View style={{ maxWidth: '85%', backgroundColor: msg.role === 'user' ? C.accent : C.card, borderRadius: 20, borderBottomRightRadius: msg.role === 'user' ? 4 : 20, borderBottomLeftRadius: msg.role === 'user' ? 20 : 4, padding: 14, borderWidth: msg.role === 'assistant' ? 1 : 0, borderColor: C.cardBorder }}>
              <Text style={{ color: msg.role === 'user' ? '#fff' : C.text, fontSize: 14, lineHeight: 21 }}>{msg.content}</Text>
            </View>
          </View>
        ))}
        {loading && (
          <View style={{ alignItems: 'flex-start', marginBottom: 12 }}>
            <Text style={{ fontSize: 10, color: C.subtext, marginBottom: 4, marginLeft: 4 }}>AI Coach</Text>
            <View style={{ backgroundColor: C.card, borderRadius: 20, borderBottomLeftRadius: 4, padding: 14, borderWidth: 1, borderColor: C.cardBorder }}><Text style={{ color: C.subtext, fontSize: 14 }}>Thinking...</Text></View>
          </View>
        )}
        {messages.length === 1 && !loading && (
          <View style={{ marginTop: 8 }}>
            <Text style={{ color: C.subtext, fontSize: 12, fontWeight: '600', marginBottom: 10, textAlign: 'center' }}>QUICK QUESTIONS</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
              {QUICK_PROMPTS.map((p, i) => (
                <TouchableOpacity key={i} onPress={() => sendMessage(p)} style={{ backgroundColor: C.card, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: C.cardBorder }}>
                  <Text style={{ color: C.accent, fontSize: 13, fontWeight: '600' }}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16, paddingVertical: 12, paddingBottom: Platform.OS === 'ios' ? 12 : 16, borderTopWidth: 1, borderTopColor: C.cardBorder, backgroundColor: C.bg, gap: 10 }}>
        <TextInput style={{ flex: 1, backgroundColor: C.input, borderRadius: 24, paddingHorizontal: 18, paddingVertical: 12, fontSize: 15, color: C.text, borderWidth: 1, borderColor: C.inputBorder, maxHeight: 100 }} placeholder="Ask your coach anything..." placeholderTextColor={C.subtext} value={input} onChangeText={setInput} multiline onSubmitEditing={() => sendMessage()} returnKeyType="send" blurOnSubmit />
        <TouchableOpacity onPress={() => sendMessage()} disabled={!input.trim() || loading} style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: !input.trim() || loading ? C.inputBorder : C.accent, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 20 }}>↑</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
