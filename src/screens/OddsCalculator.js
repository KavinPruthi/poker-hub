import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { getTheme } from '../theme/colors';
import { estimateEquity } from '../utils/equity';

const SUITS_DISPLAY = ['♠', '♥', '♦', '♣'];
const RANKS_DISPLAY = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];

// Heads-up equity calculator. Pick your two cards, the opponent's two cards, and
// optionally a flop, then run a Monte Carlo simulation (see utils/equity.js) to
// see win/tie/lose percentages.
export default function OddsCalculator({ dark }) {
  const C = getTheme(dark);
  const [selecting, setSelecting] = useState(null);
  const [heroCards, setHeroCards] = useState([null, null]);
  const [villainCards, setVillainCards] = useState([null, null]);
  const [boardCards, setBoardCards] = useState([null, null, null]);
  const [result, setResult] = useState(null);
  const [showBoard, setShowBoard] = useState(false);
  const allSelected = [...heroCards, ...villainCards, ...boardCards].filter(Boolean);

  const selectCard = (card) => {
    if (allSelected.includes(card)) return;
    if (selecting === 'hero0') setHeroCards([card, heroCards[1]]);
    else if (selecting === 'hero1') setHeroCards([heroCards[0], card]);
    else if (selecting === 'villain0') setVillainCards([card, villainCards[1]]);
    else if (selecting === 'villain1') setVillainCards([villainCards[0], card]);
    else if (selecting === 'board0') setBoardCards([card, boardCards[1], boardCards[2]]);
    else if (selecting === 'board1') setBoardCards([boardCards[0], card, boardCards[2]]);
    else if (selecting === 'board2') setBoardCards([boardCards[0], boardCards[1], card]);
    setSelecting(null);
    setResult(null);
  };

  const calculate = () => {
    if (!heroCards[0] || !heroCards[1] || !villainCards[0] || !villainCards[1]) return;
    setResult(estimateEquity(heroCards, villainCards, boardCards.filter(Boolean)));
  };

  const reset = () => {
    setHeroCards([null, null]);
    setVillainCards([null, null]);
    setBoardCards([null, null, null]);
    setResult(null);
    setSelecting(null);
  };

  const CardSlot = ({ card, onPress, label }) => (
    <TouchableOpacity onPress={onPress} style={{ width: 44, height: 60, borderRadius: 8, backgroundColor: card ? '#fff' : (dark ? '#1E2230' : '#F2F3F7'), borderWidth: selecting === label ? 2 : 1, borderColor: selecting === label ? C.accent : (card ? '#ddd' : C.inputBorder), alignItems: 'center', justifyContent: 'center', shadowColor: card ? '#000' : 'transparent', shadowOpacity: 0.15, shadowRadius: 3, elevation: 2 }}>
      {card ? <Text style={{ fontSize: 13, fontWeight: '800', color: card.includes('♥') || card.includes('♦') ? '#e74c3c' : '#000' }}>{card}</Text> : <Text style={{ fontSize: 20, color: C.inputBorder }}>+</Text>}
    </TouchableOpacity>
  );

  return (
    <View>
      {selecting && (
        <View style={{ backgroundColor: C.card, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: C.cardBorder, marginBottom: 16 }}>
          <Text style={{ color: C.text, fontWeight: '700', fontSize: 14, marginBottom: 12 }}>Pick a card:</Text>
          {RANKS_DISPLAY.map((r) => (
            <View key={r} style={{ flexDirection: 'row', gap: 6, marginBottom: 6 }}>
              {SUITS_DISPLAY.map((s) => {
                const card = r + s;
                const taken = allSelected.includes(card);
                const isRed = s === '♥' || s === '♦';
                return (
                  <TouchableOpacity key={s} onPress={() => !taken && selectCard(card)} style={{ width: 38, height: 48, borderRadius: 6, backgroundColor: taken ? (dark ? '#1E2230' : '#eee') : '#fff', borderWidth: 1, borderColor: taken ? C.inputBorder : '#ddd', alignItems: 'center', justifyContent: 'center', opacity: taken ? 0.3 : 1 }}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: isRed ? '#e74c3c' : '#000' }}>{card}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
          <TouchableOpacity onPress={() => setSelecting(null)} style={{ marginTop: 8, padding: 10, alignItems: 'center' }}>
            <Text style={{ color: C.subtext }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
      <View style={{ backgroundColor: C.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.cardBorder, marginBottom: 12 }}>
        <Text style={{ color: C.subtext, fontSize: 11, fontWeight: '700', marginBottom: 10 }}>YOUR HAND</Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <CardSlot card={heroCards[0]} label="hero0" onPress={() => setSelecting('hero0')} />
          <CardSlot card={heroCards[1]} label="hero1" onPress={() => setSelecting('hero1')} />
        </View>
      </View>
      <View style={{ backgroundColor: C.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.cardBorder, marginBottom: 12 }}>
        <Text style={{ color: C.subtext, fontSize: 11, fontWeight: '700', marginBottom: 10 }}>OPPONENT'S HAND</Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <CardSlot card={villainCards[0]} label="villain0" onPress={() => setSelecting('villain0')} />
          <CardSlot card={villainCards[1]} label="villain1" onPress={() => setSelecting('villain1')} />
        </View>
      </View>
      <View style={{ backgroundColor: C.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.cardBorder, marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <Text style={{ color: C.subtext, fontSize: 11, fontWeight: '700' }}>FLOP (optional)</Text>
          <TouchableOpacity onPress={() => setShowBoard(!showBoard)}>
            <Text style={{ color: C.accent, fontSize: 12, fontWeight: '700' }}>{showBoard ? 'Hide' : 'Add Flop'}</Text>
          </TouchableOpacity>
        </View>
        {showBoard && (
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <CardSlot card={boardCards[0]} label="board0" onPress={() => setSelecting('board0')} />
            <CardSlot card={boardCards[1]} label="board1" onPress={() => setSelecting('board1')} />
            <CardSlot card={boardCards[2]} label="board2" onPress={() => setSelecting('board2')} />
          </View>
        )}
      </View>
      {result && (
        <View style={{ backgroundColor: C.accentSoft, borderRadius: 16, padding: 20, marginBottom: 12 }}>
          <Text style={{ color: C.accent, fontWeight: '800', fontSize: 15, marginBottom: 14, textAlign: 'center' }}>Equity Breakdown</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
            <View style={{ alignItems: 'center' }}><Text style={{ color: C.green, fontSize: 32, fontWeight: '800' }}>{result.hero}%</Text><Text style={{ color: C.subtext, fontSize: 12 }}>You win</Text></View>
            <View style={{ alignItems: 'center' }}><Text style={{ color: C.subtext, fontSize: 24, fontWeight: '800' }}>{result.tie}%</Text><Text style={{ color: C.subtext, fontSize: 12 }}>Tie</Text></View>
            <View style={{ alignItems: 'center' }}><Text style={{ color: C.red, fontSize: 32, fontWeight: '800' }}>{result.villain}%</Text><Text style={{ color: C.subtext, fontSize: 12 }}>They win</Text></View>
          </View>
          <View style={{ height: 10, borderRadius: 5, overflow: 'hidden', flexDirection: 'row', marginTop: 16 }}>
            <View style={{ flex: result.hero, backgroundColor: C.green }} />
            <View style={{ flex: result.tie, backgroundColor: C.subtext }} />
            <View style={{ flex: result.villain, backgroundColor: C.red }} />
          </View>
        </View>
      )}
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
        <TouchableOpacity onPress={calculate} style={{ flex: 1, backgroundColor: C.accent, borderRadius: 14, padding: 16, alignItems: 'center' }}>
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>Calculate Odds</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={reset} style={{ backgroundColor: C.card, borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: C.cardBorder }}>
          <Text style={{ color: C.subtext, fontWeight: '700' }}>Reset</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
