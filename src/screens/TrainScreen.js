import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { getTheme } from '../theme/colors';
import { POSITIONS } from '../constants/ranges';
import { SCENARIOS, FLASHCARDS } from '../constants/training';
import PokerTable from '../components/PokerTable';
import RangeGrid from '../components/RangeGrid';
import OddsCalculator from './OddsCalculator';
import PositionsGuide from './PositionsGuide';
import { Button, Card, Header, Screen, SectionLabel, TYPE, nums } from '../components/ui';

const SUB_TABS = [
  ['scenarios', 'Spots'],
  ['charts', 'Ranges'],
  ['flashcards', 'Cards'],
  ['odds', 'Odds'],
  ['positions', 'Seats'],
];

const RANGE_NOTE = {
  UTG: 'First to act with eight players behind. Tightest range at the table.',
  BTN: 'Last to act on every street after the flop. Widest range you will play.',
};

// The training hub. Five study tools behind a sub-tab row: hand decisions, the
// range charts, flashcards, the equity calculator and the positions guide.
export default function TrainScreen({ dark }) {
  const C = getTheme(dark);
  const [tab, setTab] = useState('scenarios');
  const [position, setPosition] = useState('BTN');
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [answer, setAnswer] = useState(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const current = SCENARIOS[scenarioIndex];
  const card = FLASHCARDS[cardIndex];

  // Grading against the scenario's own answer, rather than asking the player to
  // mark their own work. The old screen revealed the answer and then offered
  // "Got it" and "Missed it", which measures honesty rather than skill.
  //
  // Two things the answers do that a plain string compare gets wrong. A 3-bet is
  // a raise -- there are three buttons, and raising is the one it lives under --
  // so anything with "bet" in it counts as Raise. And "Call or 3-Bet" means the
  // scenario considers both fine, so both are accepted.
  const accepted = String(current.correctAction)
    .toLowerCase()
    .split(/\s+or\s+|\//)
    .map((s) => s.trim())
    .map((s) => (s.includes('bet') || s.includes('raise') ? 'raise' : s));

  const choose = (action) => setAnswer(action);
  const wasRight = answer ? accepted.includes(answer.toLowerCase()) : false;

  const advance = () => {
    if (answer) setScore((s) => ({ correct: s.correct + (wasRight ? 1 : 0), total: s.total + 1 }));
    setAnswer(null);
    setScenarioIndex((i) => (i + 1) % SCENARIOS.length);
  };

  const ACTIONS = [
    ['Fold', C.red],
    ['Call', C.steel],
    ['Raise', C.green],
  ];

  return (
    <Screen dark={dark}>
      <Header
        dark={dark}
        title="Train"
        right={
          tab === 'scenarios' && score.total > 0 ? (
            <Text style={{ ...nums, ...TYPE.small, color: C.subtext, marginTop: 6 }}>
              {score.correct}/{score.total}
            </Text>
          ) : null
        }
      />

      {/* Sub-tabs as a rule with a moving gold underline. A row of filled pills
          at this width ends up looking like a toolbar from another app. */}
      <View style={{ marginBottom: 22 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', gap: 20 }}>
            {SUB_TABS.map(([id, label]) => (
              <TouchableOpacity key={id} onPress={() => setTab(id)}>
                <Text
                  style={{
                    fontSize: 14.5,
                    fontWeight: '650',
                    color: tab === id ? C.text : C.subtext2,
                    paddingBottom: 8,
                  }}
                >
                  {label}
                </Text>
                <View
                  style={{
                    height: 2,
                    borderRadius: 1,
                    backgroundColor: tab === id ? C.accent : 'transparent',
                  }}
                />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        <View style={{ height: 1, backgroundColor: C.cardBorder, marginTop: -1 }} />
      </View>

      {tab === 'scenarios' && (
        <View>
          <PokerTable hand={current.hand} position={current.position} dark={dark} />

          <Card dark={dark}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
              <Text style={{ ...TYPE.label, color: C.accent }}>{current.position}</Text>
              {/* Labelled, because "1 / 2" on its own reads as a progress
                  counter next to a scenario that also has one. */}
              <Text style={{ ...TYPE.label, color: C.subtext2 }}>
                {current.blinds} BLINDS
              </Text>
            </View>
            <Text style={{ ...TYPE.body, color: C.text }}>{current.situation}</Text>

            {!answer ? (
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 18 }}>
                {ACTIONS.map(([label, color]) => (
                  <TouchableOpacity
                    key={label}
                    onPress={() => choose(label)}
                    activeOpacity={0.75}
                    style={{
                      flex: 1,
                      height: 46,
                      borderRadius: 11,
                      borderWidth: 1,
                      borderColor: color,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ color, fontSize: 14.5, fontWeight: '650' }}>{label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={{ marginTop: 18 }}>
                <View
                  style={{
                    borderLeftWidth: 2,
                    borderLeftColor: wasRight ? C.green : C.red,
                    paddingLeft: 12,
                  }}
                >
                  {/* The correct action is the heading either way. Naming it
                      even when they got it right is what teaches the label --
                      "Raise" and "3-Bet" are not interchangeable at the table. */}
                  <Text style={{ ...TYPE.heading, color: wasRight ? C.green : C.red }}>
                    {current.correctAction}
                  </Text>
                  <Text style={{ ...TYPE.small, color: C.subtext2, marginTop: 2, marginBottom: 8 }}>
                    {wasRight ? 'You had it.' : `You said ${answer}.`}
                  </Text>
                  <Text style={{ ...TYPE.body, color: C.subtext }}>{current.explanation}</Text>
                </View>
                <Button dark={dark} label="Next spot" onPress={advance} style={{ marginTop: 18 }} />
              </View>
            )}
          </Card>

          <Text style={{ ...TYPE.small, color: C.subtext2, textAlign: 'center', marginTop: 14 }}>
            {scenarioIndex + 1} of {SCENARIOS.length}
          </Text>
        </View>
      )}

      {tab === 'charts' && (
        <View>
          {/* Wrapped, not a horizontal scroller. Eight seats do not fit across a
              phone, and scrolled sideways the selected one starts off-screen --
              the chart would say BTN while the row appeared to have nothing
              chosen. */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginBottom: 18 }}>
            {POSITIONS.map((p) => {
              const active = position === p;
              return (
                <TouchableOpacity
                  key={p}
                  onPress={() => setPosition(p)}
                  activeOpacity={0.75}
                  style={{
                    paddingHorizontal: 14,
                    height: 34,
                    justifyContent: 'center',
                    borderRadius: 9,
                    borderWidth: 1,
                    borderColor: active ? C.accent : C.cardBorder,
                    backgroundColor: active ? C.accent : 'transparent',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13.5,
                      fontWeight: '650',
                      color: active ? C.accentText : C.subtext,
                    }}
                  >
                    {p}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <SectionLabel dark={dark}>{position} opening range</SectionLabel>
          <Card dark={dark} style={{ marginBottom: 18 }}>
            <RangeGrid position={position} dark={dark} />
          </Card>

          <Text style={{ ...TYPE.body, color: C.subtext }}>
            {RANGE_NOTE[position] ?? 'Every seat later than this one can open wider than it.'}
          </Text>
        </View>
      )}

      {tab === 'odds' && <OddsCalculator dark={dark} />}
      {tab === 'positions' && <PositionsGuide dark={dark} />}

      {tab === 'flashcards' && (
        <View>
          <Card dark={dark} style={{ minHeight: 190, justifyContent: 'center', padding: 22 }}>
            <Text style={{ ...TYPE.label, color: C.subtext2, marginBottom: 14 }}>
              {flipped ? 'ANSWER' : 'QUESTION'} · {cardIndex + 1}/{FLASHCARDS.length}
            </Text>
            <Text
              style={
                flipped
                  ? { ...TYPE.body, color: C.text, fontSize: 15, lineHeight: 23 }
                  : { fontSize: 18, fontWeight: '650', color: C.text, lineHeight: 26 }
              }
            >
              {flipped ? card.a : card.q}
            </Text>
          </Card>

          <Button
            dark={dark}
            tone={flipped ? 'secondary' : 'primary'}
            label={flipped ? 'Next card' : 'Show answer'}
            onPress={() => {
              if (flipped) {
                setFlipped(false);
                setCardIndex((i) => (i + 1) % FLASHCARDS.length);
              } else {
                setFlipped(true);
              }
            }}
            style={{ marginTop: 14 }}
          />

          <View style={{ flexDirection: 'row', gap: 4, marginTop: 18, justifyContent: 'center' }}>
            {FLASHCARDS.map((_, i) => (
              <View
                key={i}
                style={{
                  width: i === cardIndex ? 14 : 5,
                  height: 5,
                  borderRadius: 2.5,
                  backgroundColor: i === cardIndex ? C.accent : C.cardBorder,
                }}
              />
            ))}
          </View>
        </View>
      )}
    </Screen>
  );
}
