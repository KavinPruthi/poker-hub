import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { getTheme } from '../theme/colors';
import { POSITIONS } from '../constants/ranges';
import { SCENARIOS, FLASHCARDS } from '../constants/training';
import PokerTable from '../components/PokerTable';
import RangeGrid from '../components/RangeGrid';
import OddsCalculator from './OddsCalculator';
import PositionsGuide from './PositionsGuide';

const SUB_TABS = [
  ['scenarios', '🎯 Scenarios'],
  ['charts', '📋 GTO Charts'],
  ['flashcards', '⚡ Cards'],
  ['odds', '🎲 Odds Calc'],
  ['positions', '📍 Positions'],
];

// The training hub. A horizontal sub-tab switcher swaps between five study
// tools: hand-decision scenarios, GTO range charts, flashcards, the equity
// calculator, and the positions guide.
export default function TrainScreen({ dark }) {
  const C = getTheme(dark);
  const [tab, setTab] = useState('scenarios');
  const [selectedPosition, setSelectedPosition] = useState('BTN');
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const current = SCENARIOS[scenarioIndex];
  const currentCard = FLASHCARDS[cardIndex];

  const nextScenario = (correct) => {
    setScore((s) => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
    setRevealed(false);
    setScenarioIndex((i) => (i + 1) % SCENARIOS.length);
  };

  const tabStyle = (t) => ({ flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: tab === t ? C.accent : 'transparent', alignItems: 'center' });

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 64, paddingBottom: 100 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          <Text style={{ fontSize: 24, fontWeight: '800', color: C.text }}>🧠 Train</Text>
          {tab === 'scenarios' && (
            <View style={{ marginLeft: 'auto', backgroundColor: C.accentSoft, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 }}>
              <Text style={{ color: C.accent, fontWeight: '700', fontSize: 13 }}>{score.correct}/{score.total}</Text>
            </View>
          )}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', backgroundColor: C.card, borderRadius: 14, padding: 4, borderWidth: 1, borderColor: C.cardBorder, gap: 4 }}>
            {SUB_TABS.map(([t, label]) => (
              <TouchableOpacity key={t} style={[tabStyle(t), { paddingHorizontal: 14 }]} onPress={() => setTab(t)}>
                <Text style={{ color: tab === t ? '#fff' : C.subtext, fontWeight: '700', fontSize: 12 }}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {tab === 'scenarios' && (
          <View>
            <PokerTable hand={current.hand} position={current.position} dark={dark} />
            <View style={{ backgroundColor: C.card, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: C.cardBorder, marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                <View style={{ backgroundColor: C.accentSoft, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 }}><Text style={{ color: C.accent, fontWeight: '700', fontSize: 13 }}>📍 {current.position}</Text></View>
                <View style={{ backgroundColor: C.card, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: C.cardBorder }}><Text style={{ color: C.subtext, fontSize: 12 }}>Blinds: {current.blinds}</Text></View>
              </View>
              <Text style={{ color: C.subtext, fontSize: 13, marginBottom: 16, lineHeight: 18 }}>{current.situation}</Text>
              {!revealed ? (
                <View>
                  <Text style={{ color: C.text, fontWeight: '700', fontSize: 15, marginBottom: 12 }}>What's your action?</Text>
                  <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
                    <TouchableOpacity onPress={() => setRevealed(true)} style={{ flex: 1, backgroundColor: C.redSoft, borderRadius: 12, padding: 14, alignItems: 'center' }}><Text style={{ color: C.red, fontWeight: '700', fontSize: 16 }}>✗ Fold</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => setRevealed(true)} style={{ flex: 1, backgroundColor: C.yellowSoft, borderRadius: 12, padding: 14, alignItems: 'center' }}><Text style={{ color: C.yellow, fontWeight: '700', fontSize: 16 }}>= Call</Text></TouchableOpacity>
                  </View>
                  <TouchableOpacity onPress={() => setRevealed(true)} style={{ backgroundColor: C.greenSoft, borderRadius: 12, padding: 14, alignItems: 'center' }}><Text style={{ color: C.green, fontWeight: '700', fontSize: 16 }}>↑ Raise</Text></TouchableOpacity>
                </View>
              ) : (
                <View>
                  <View style={{ backgroundColor: C.greenSoft, borderRadius: 14, padding: 16, marginBottom: 12 }}>
                    <Text style={{ color: C.green, fontWeight: '800', fontSize: 16, marginBottom: 6 }}>✓ {current.correctAction}</Text>
                    <Text style={{ color: C.text, fontSize: 14, lineHeight: 20 }}>{current.explanation}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TouchableOpacity onPress={() => nextScenario(true)} style={{ flex: 1, backgroundColor: C.greenSoft, borderRadius: 12, padding: 14, alignItems: 'center' }}><Text style={{ color: C.green, fontWeight: '700' }}>Got it ✓</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => nextScenario(false)} style={{ flex: 1, backgroundColor: C.redSoft, borderRadius: 12, padding: 14, alignItems: 'center' }}><Text style={{ color: C.red, fontWeight: '700' }}>Missed it ✗</Text></TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
            <Text style={{ color: C.subtext, fontSize: 13, textAlign: 'center', marginBottom: 16 }}>Scenario {scenarioIndex + 1} of {SCENARIOS.length}</Text>
          </View>
        )}

        {tab === 'charts' && (
          <View>
            <Text style={{ color: C.subtext, fontSize: 13, marginBottom: 14 }}>Select a position to see the GTO open-raise range:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {POSITIONS.map((p) => (
                  <TouchableOpacity key={p} onPress={() => setSelectedPosition(p)} style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: selectedPosition === p ? C.accent : C.card, borderWidth: 1, borderColor: selectedPosition === p ? C.accent : C.cardBorder }}>
                    <Text style={{ color: selectedPosition === p ? '#fff' : C.text, fontWeight: '700', fontSize: 14 }}>{p}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            <View style={{ backgroundColor: C.card, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: C.cardBorder, marginBottom: 16 }}>
              <Text style={{ color: C.text, fontWeight: '800', fontSize: 16, marginBottom: 4 }}>{selectedPosition} Open-Raise Range</Text>
              <Text style={{ color: C.subtext, fontSize: 12, marginBottom: 16 }}>{selectedPosition === 'UTG' ? 'Tightest range — ~15% of hands' : selectedPosition === 'BTN' ? 'Widest range — up to ~45% of hands' : 'Opens up as position improves'}</Text>
              <RangeGrid position={selectedPosition} dark={dark} />
            </View>
            <View style={{ backgroundColor: C.accentSoft, borderRadius: 16, padding: 16, marginBottom: 16 }}>
              <Text style={{ color: C.accent, fontWeight: '700', fontSize: 14, marginBottom: 8 }}>💡 Key Principle</Text>
              <Text style={{ color: C.text, fontSize: 13, lineHeight: 20 }}>The later your position, the wider you can open. BTN is the most profitable position — you act last every post-flop street.</Text>
            </View>
          </View>
        )}

        {tab === 'odds' && <OddsCalculator dark={dark} />}
        {tab === 'positions' && <PositionsGuide dark={dark} />}

        {tab === 'flashcards' && (
          <View>
            <View style={{ backgroundColor: C.card, borderRadius: 24, padding: 28, borderWidth: 1, borderColor: C.cardBorder, marginBottom: 16, minHeight: 200, justifyContent: 'center' }}>
              <View style={{ backgroundColor: C.accentSoft, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, alignSelf: 'flex-start', marginBottom: 20 }}>
                <Text style={{ color: C.accent, fontWeight: '700', fontSize: 12 }}>{flipped ? '✓ ANSWER' : '❓ QUESTION'} · {cardIndex + 1}/{FLASHCARDS.length}</Text>
              </View>
              {!flipped ? <Text style={{ color: C.text, fontSize: 18, fontWeight: '700', lineHeight: 26 }}>{currentCard.q}</Text> : <Text style={{ color: C.text, fontSize: 15, lineHeight: 24 }}>{currentCard.a}</Text>}
            </View>
            {!flipped ? (
              <TouchableOpacity onPress={() => setFlipped(true)} style={{ backgroundColor: C.accent, borderRadius: 14, padding: 16, alignItems: 'center', marginBottom: 12 }}>
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>Flip Card</Text>
              </TouchableOpacity>
            ) : (
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
                <TouchableOpacity onPress={() => { setFlipped(false); setCardIndex((i) => (i + 1) % FLASHCARDS.length); }} style={{ flex: 1, backgroundColor: C.greenSoft, borderRadius: 12, padding: 14, alignItems: 'center' }}><Text style={{ color: C.green, fontWeight: '700' }}>Got it ✓</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => { setFlipped(false); setCardIndex((i) => (i + 1) % FLASHCARDS.length); }} style={{ flex: 1, backgroundColor: C.redSoft, borderRadius: 12, padding: 14, alignItems: 'center' }}><Text style={{ color: C.red, fontWeight: '700' }}>Review again ✗</Text></TouchableOpacity>
              </View>
            )}
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 4 }}>
              {FLASHCARDS.map((_, i) => (
                <View key={i} style={{ width: i === cardIndex ? 16 : 6, height: 6, borderRadius: 3, backgroundColor: i === cardIndex ? C.accent : C.cardBorder }} />
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
