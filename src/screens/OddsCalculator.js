import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { getTheme } from '../theme/colors';
import { estimateEquity } from '../utils/equity';
import { Button, Card, SectionLabel, Sheet, TYPE, nums } from '../components/ui';

const SUITS = ['♠', '♥', '♦', '♣'];
const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];

const FACE = '#FAFAF8';
const INK = '#16181C';
const ROUGE = '#B3231B';

// Heads-up equity. Pick two cards each, optionally a flop, then run the Monte
// Carlo in utils/equity.js. The picker is a sheet rather than a panel that
// shoves the board down the screen every time you tap a slot.
export default function OddsCalculator({ dark }) {
  const C = getTheme(dark);
  const [slot, setSlot] = useState(null);
  const [hero, setHero] = useState([null, null]);
  const [villain, setVillain] = useState([null, null]);
  const [board, setBoard] = useState([null, null, null]);
  const [result, setResult] = useState(null);

  const used = [...hero, ...villain, ...board].filter(Boolean);
  const ready = hero.every(Boolean) && villain.every(Boolean);

  const put = (card) => {
    const [which, i] = slot;
    const setter = { hero: setHero, villain: setVillain, board: setBoard }[which];
    setter((prev) => prev.map((c, k) => (k === i ? card : c)));
    setSlot(null);
    setResult(null);
  };

  const clear = () => {
    setHero([null, null]);
    setVillain([null, null]);
    setBoard([null, null, null]);
    setResult(null);
  };

  const Slot = ({ card, which, i }) => {
    const active = slot && slot[0] === which && slot[1] === i;
    const red = card && (card.includes('♥') || card.includes('♦'));
    return (
      <TouchableOpacity
        onPress={() => setSlot([which, i])}
        activeOpacity={0.75}
        style={{
          width: 42,
          height: 58,
          borderRadius: 7,
          backgroundColor: card ? FACE : 'transparent',
          borderWidth: active ? 1.5 : 1,
          borderColor: active ? C.accent : card ? 'transparent' : C.inputBorder,
          // A dashed edge reads as "nothing here yet" without needing a label.
          borderStyle: card || active ? 'solid' : 'dashed',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text
          style={{
            fontSize: card ? 15 : 18,
            fontWeight: '700',
            color: card ? (red ? ROUGE : INK) : C.subtext2,
          }}
        >
          {card ?? '+'}
        </Text>
      </TouchableOpacity>
    );
  };

  const Row = ({ label, cards, which, note }) => (
    <View style={{ marginBottom: 18 }}>
      <SectionLabel dark={dark}>{label}</SectionLabel>
      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
        {cards.map((c, i) => (
          <Slot key={i} card={c} which={which} i={i} />
        ))}
        {note ? (
          <Text style={{ ...TYPE.small, color: C.subtext2, marginLeft: 6, flex: 1 }}>{note}</Text>
        ) : null}
      </View>
    </View>
  );

  return (
    <View>
      <Row label="You" cards={hero} which="hero" />
      <Row label="Them" cards={villain} which="villain" />
      <Row label="Flop" cards={board} which="board" note="Optional" />

      {result && (
        <Card dark={dark} style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ ...nums, fontSize: 34, fontWeight: '700', color: C.green, letterSpacing: -1.4 }}>
                {result.hero}%
              </Text>
              <Text style={{ ...TYPE.label, color: C.subtext2, marginTop: 4 }}>YOU</Text>
            </View>
            <View style={{ alignItems: 'center', flex: 1 }}>
              <Text style={{ ...nums, fontSize: 18, fontWeight: '650', color: C.subtext }}>
                {result.tie}%
              </Text>
              <Text style={{ ...TYPE.label, color: C.subtext2, marginTop: 4 }}>TIE</Text>
            </View>
            <View style={{ alignItems: 'flex-end', flex: 1 }}>
              <Text style={{ ...nums, fontSize: 34, fontWeight: '700', color: C.red, letterSpacing: -1.4 }}>
                {result.villain}%
              </Text>
              <Text style={{ ...TYPE.label, color: C.subtext2, marginTop: 4 }}>THEM</Text>
            </View>
          </View>

          <View style={{ height: 6, borderRadius: 3, overflow: 'hidden', flexDirection: 'row', marginTop: 16, gap: 1 }}>
            <View style={{ flex: Math.max(result.hero, 0.01), backgroundColor: C.green }} />
            <View style={{ flex: Math.max(result.tie, 0.01), backgroundColor: C.subtext2 }} />
            <View style={{ flex: Math.max(result.villain, 0.01), backgroundColor: C.red }} />
          </View>

          {/* Saying how it was worked out matters: these are sampled numbers,
              not exact ones, and they move a little between runs. */}
          <Text style={{ ...TYPE.small, color: C.subtext2, marginTop: 12 }}>
            5,000 simulated hands. Steady to about a point between runs.
          </Text>
        </Card>
      )}

      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
        <Button
          dark={dark}
          label="Run it"
          disabled={!ready}
          onPress={() => setResult(estimateEquity(hero, villain, board.filter(Boolean)))}
          style={{ flex: 2 }}
        />
        <Button
          dark={dark}
          tone="secondary"
          label="Clear"
          onPress={clear}
          disabled={used.length === 0}
          style={{ flex: 1 }}
        />
      </View>
      {!ready && (
        <Text style={{ ...TYPE.small, color: C.subtext2 }}>
          Both hands need two cards before this can run.
        </Text>
      )}

      <Sheet dark={dark} visible={!!slot} onClose={() => setSlot(null)} title="Pick a card">
        <View style={{ gap: 5 }}>
          {RANKS.map((r) => (
            <View key={r} style={{ flexDirection: 'row', gap: 5 }}>
              {SUITS.map((s) => {
                const card = r + s;
                const taken = used.includes(card);
                const red = s === '♥' || s === '♦';
                return (
                  <TouchableOpacity
                    key={s}
                    onPress={() => !taken && put(card)}
                    disabled={taken}
                    activeOpacity={0.7}
                    style={{
                      flex: 1,
                      height: 34,
                      borderRadius: 5,
                      backgroundColor: taken ? C.card2 : FACE,
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: taken ? 0.35 : 1,
                    }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: '700', color: red ? ROUGE : INK }}>
                      {card}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      </Sheet>
    </View>
  );
}
