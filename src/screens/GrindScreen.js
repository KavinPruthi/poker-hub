import { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';
import { getTheme } from '../theme/colors';
import { DEFAULT_LABELS } from '../constants/ranges';
import BankrollChart from '../components/BankrollChart';

// Bankroll tracker. Sessions live in Supabase (scoped to the signed-in user via
// row-level security) and can be filtered/grouped by a free-form label such as
// a casino name or game type.
export default function GrindScreen({ dark, user }) {
  const C = getTheme(dark);
  const [sessions, setSessions] = useState([]);
  const [buyin, setBuyin] = useState('');
  const [cashout, setCashout] = useState('');
  const [hours, setHours] = useState('');
  const [stakes, setStakes] = useState('');
  const [note, setNote] = useState('');
  const [selectedLabel, setSelectedLabel] = useState('All Time');
  const [filterLabel, setFilterLabel] = useState('All Time');
  const [labelModalVisible, setLabelModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [customLabel, setCustomLabel] = useState('');
  const [labels, setLabels] = useState(DEFAULT_LABELS);

  const [editingSession, setEditingSession] = useState(null);
  const [editBuyin, setEditBuyin] = useState('');
  const [editCashout, setEditCashout] = useState('');
  const [editHours, setEditHours] = useState('');
  const [editNote, setEditNote] = useState('');

  useEffect(() => {
    fetchSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSessions = async () => {
    const { data } = await supabase.from('sessions').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    if (data) {
      setSessions(data);
      const dbLabels = [...new Set(data.map((s) => s.label).filter(Boolean))];
      setLabels((prev) => [...new Set([...prev, ...dbLabels])]);
    }
  };

  const addSession = async () => {
    if (!buyin || !cashout || !hours) {
      Alert.alert('Missing fields', 'Please fill in buy-in, cash-out, and hours.');
      return;
    }
    const insertData = {
      user_id: user.id,
      buyin: parseFloat(buyin),
      cashout: parseFloat(cashout),
      hours: parseFloat(hours),
      profit: parseFloat(cashout) - parseFloat(buyin),
    };
    if (stakes) insertData.stakes = stakes;
    if (note) insertData.note = note;
    if (selectedLabel) insertData.label = selectedLabel;
    const { error } = await supabase.from('sessions').insert([insertData]).select();
    if (error) {
      Alert.alert('Error', error.message);
      return;
    }
    fetchSessions();
    setBuyin('');
    setCashout('');
    setHours('');
    setStakes('');
    setNote('');
  };

  const deleteSession = (id) => {
    Alert.alert('Delete Session', 'Remove this session?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await supabase.from('sessions').delete().eq('id', id).eq('user_id', user.id);
          fetchSessions();
        },
      },
    ]);
  };

  const openEdit = (s) => {
    setEditingSession(s);
    setEditBuyin(String(s.buyin));
    setEditCashout(String(s.cashout));
    setEditHours(String(s.hours));
    setEditNote(s.note || '');
  };

  const saveEdit = async () => {
    if (!editingSession) return;
    await supabase
      .from('sessions')
      .update({
        buyin: parseFloat(editBuyin),
        cashout: parseFloat(editCashout),
        hours: parseFloat(editHours),
        profit: parseFloat(editCashout) - parseFloat(editBuyin),
        note: editNote,
      })
      .eq('id', editingSession.id)
      .eq('user_id', user.id);
    setEditingSession(null);
    fetchSessions();
  };

  const clearSessions = () => {
    Alert.alert('Clear Sessions', `Delete all "${filterLabel}" sessions?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (filterLabel === 'All Time') await supabase.from('sessions').delete().eq('user_id', user.id);
          else await supabase.from('sessions').delete().eq('label', filterLabel).eq('user_id', user.id);
          fetchSessions();
        },
      },
    ]);
  };

  const filtered = filterLabel === 'All Time' ? sessions : sessions.filter((s) => s.label === filterLabel);
  const totalProfit = filtered.reduce((sum, s) => sum + s.profit, 0);
  const totalHours = filtered.reduce((sum, s) => sum + s.hours, 0);
  const winRate = totalHours > 0 ? (totalProfit / totalHours).toFixed(2) : 0;
  const bestSession = filtered.length ? Math.max(...filtered.map((s) => s.profit)) : 0;
  const worstSession = filtered.length ? Math.min(...filtered.map((s) => s.profit)) : 0;
  const inp = { backgroundColor: C.input, borderWidth: 1, borderColor: C.inputBorder, borderRadius: 12, padding: 14, fontSize: 16, color: C.text, marginBottom: 10 };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 64, paddingBottom: 100 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          <Text style={{ fontSize: 24, fontWeight: '800', color: C.text }}>📊 Grind</Text>
        </View>

        <TouchableOpacity onPress={() => setFilterModalVisible(true)} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.accentSoft, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 20, alignSelf: 'flex-start' }}>
          <Text style={{ color: C.accent, fontWeight: '700', fontSize: 14 }}>🏷 {filterLabel}</Text>
          <Text style={{ color: C.accent, marginLeft: 6 }}>▾</Text>
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
          <View style={{ flex: 1, backgroundColor: totalProfit >= 0 ? C.greenSoft : C.redSoft, borderRadius: 16, padding: 14, alignItems: 'center' }}>
            <Text style={{ fontSize: 10, fontWeight: '700', color: totalProfit >= 0 ? C.green : C.red, marginBottom: 4 }}>PROFIT</Text>
            <Text style={{ fontSize: 18, fontWeight: '800', color: totalProfit >= 0 ? C.green : C.red }}>{totalProfit >= 0 ? '+' : ''}${totalProfit.toFixed(0)}</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: C.accentSoft, borderRadius: 16, padding: 14, alignItems: 'center' }}>
            <Text style={{ fontSize: 10, fontWeight: '700', color: C.accent, marginBottom: 4 }}>WIN RATE</Text>
            <Text style={{ fontSize: 18, fontWeight: '800', color: C.accent }}>${winRate}/hr</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: C.card, borderRadius: 16, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: C.cardBorder }}>
            <Text style={{ fontSize: 10, fontWeight: '700', color: C.subtext, marginBottom: 4 }}>SESSIONS</Text>
            <Text style={{ fontSize: 18, fontWeight: '800', color: C.text }}>{filtered.length}</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
          <View style={{ flex: 1, backgroundColor: C.greenSoft, borderRadius: 16, padding: 14, alignItems: 'center' }}>
            <Text style={{ fontSize: 10, fontWeight: '700', color: C.green, marginBottom: 4 }}>BEST</Text>
            <Text style={{ fontSize: 16, fontWeight: '800', color: C.green }}>+${bestSession.toFixed(0)}</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: C.redSoft, borderRadius: 16, padding: 14, alignItems: 'center' }}>
            <Text style={{ fontSize: 10, fontWeight: '700', color: C.red, marginBottom: 4 }}>WORST</Text>
            <Text style={{ fontSize: 16, fontWeight: '800', color: C.red }}>${worstSession.toFixed(0)}</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: C.card, borderRadius: 16, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: C.cardBorder }}>
            <Text style={{ fontSize: 10, fontWeight: '700', color: C.subtext, marginBottom: 4 }}>HOURS</Text>
            <Text style={{ fontSize: 16, fontWeight: '800', color: C.text }}>{totalHours.toFixed(1)}h</Text>
          </View>
        </View>

        <BankrollChart sessions={filtered} dark={dark} />

        <View style={{ backgroundColor: C.card, borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: C.cardBorder }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: C.text, marginBottom: 14 }}>Log New Session</Text>
          <TouchableOpacity onPress={() => setLabelModalVisible(true)} style={{ backgroundColor: C.accentSoft, borderRadius: 12, padding: 14, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: C.accent, fontWeight: '600' }}>🏷 {selectedLabel}</Text>
            <Text style={{ color: C.accent }}>▾</Text>
          </TouchableOpacity>
          <TextInput style={inp} placeholder="Buy-in ($)" placeholderTextColor={C.subtext} keyboardType="numeric" value={buyin} onChangeText={setBuyin} />
          <TextInput style={inp} placeholder="Cash-out ($)" placeholderTextColor={C.subtext} keyboardType="numeric" value={cashout} onChangeText={setCashout} />
          <TextInput style={inp} placeholder="Hours played" placeholderTextColor={C.subtext} keyboardType="numeric" value={hours} onChangeText={setHours} />
          <TextInput style={inp} placeholder="Stakes e.g. 1/2 (optional)" placeholderTextColor={C.subtext} value={stakes} onChangeText={setStakes} />
          <TextInput style={[inp, { marginBottom: 14 }]} placeholder="Note (optional)" placeholderTextColor={C.subtext} value={note} onChangeText={setNote} />
          <TouchableOpacity onPress={addSession} style={{ backgroundColor: C.accent, borderRadius: 14, padding: 16, alignItems: 'center' }}>
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>Log Session</Text>
          </TouchableOpacity>
        </View>

        <Text style={{ color: C.subtext, fontSize: 12, fontWeight: '700', marginBottom: 10 }}>RECENT SESSIONS</Text>
        {filtered.length === 0 && (
          <View style={{ backgroundColor: C.card, borderRadius: 16, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: C.cardBorder, marginBottom: 16 }}>
            <Text style={{ color: C.subtext, fontSize: 14 }}>No sessions yet. Log your first one!</Text>
          </View>
        )}
        {filtered.map((s) => (
          <View key={s.id} style={{ backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: C.cardBorder }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                  <Text style={{ color: C.subtext, fontSize: 12 }}>{s.stakes ? s.stakes + ' · ' : ''}{s.hours}h</Text>
                  {s.label && s.label !== 'All Time' && (
                    <View style={{ backgroundColor: C.accentSoft, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
                      <Text style={{ color: C.accent, fontSize: 10, fontWeight: '600' }}>{s.label}</Text>
                    </View>
                  )}
                </View>
                <Text style={{ color: s.profit >= 0 ? C.green : C.red, fontSize: 20, fontWeight: '800' }}>{s.profit >= 0 ? '+' : ''}${s.profit}</Text>
                {s.note ? <Text style={{ color: C.subtext, fontSize: 12, marginTop: 4 }}>{s.note}</Text> : null}
              </View>
              <View style={{ alignItems: 'flex-end', gap: 8 }}>
                <View style={{ backgroundColor: s.profit >= 0 ? C.greenSoft : C.redSoft, borderRadius: 10, padding: 8 }}>
                  <Text style={{ fontSize: 20 }}>{s.profit >= 0 ? '📈' : '📉'}</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  <TouchableOpacity onPress={() => openEdit(s)} style={{ backgroundColor: C.accentSoft, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 }}>
                    <Text style={{ color: C.accent, fontSize: 12, fontWeight: '700' }}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteSession(s.id)} style={{ backgroundColor: C.redSoft, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 }}>
                    <Text style={{ color: C.red, fontSize: 12, fontWeight: '700' }}>Del</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        ))}
        {filtered.length > 0 && (
          <TouchableOpacity onPress={clearSessions} style={{ borderWidth: 1, borderColor: C.red, borderRadius: 14, padding: 14, alignItems: 'center', marginTop: 8, marginBottom: 32 }}>
            <Text style={{ color: C.red, fontWeight: '700', fontSize: 15 }}>Clear {filterLabel} Sessions</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <Modal visible={!!editingSession} transparent animationType="slide">
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ backgroundColor: C.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}>
            <Text style={{ color: C.text, fontWeight: '800', fontSize: 18, marginBottom: 16 }}>Edit Session</Text>
            <TextInput style={{ backgroundColor: C.input, borderRadius: 12, padding: 14, fontSize: 16, color: C.text, marginBottom: 10, borderWidth: 1, borderColor: C.inputBorder }} placeholder="Buy-in ($)" placeholderTextColor={C.subtext} keyboardType="numeric" value={editBuyin} onChangeText={setEditBuyin} />
            <TextInput style={{ backgroundColor: C.input, borderRadius: 12, padding: 14, fontSize: 16, color: C.text, marginBottom: 10, borderWidth: 1, borderColor: C.inputBorder }} placeholder="Cash-out ($)" placeholderTextColor={C.subtext} keyboardType="numeric" value={editCashout} onChangeText={setEditCashout} />
            <TextInput style={{ backgroundColor: C.input, borderRadius: 12, padding: 14, fontSize: 16, color: C.text, marginBottom: 10, borderWidth: 1, borderColor: C.inputBorder }} placeholder="Hours" placeholderTextColor={C.subtext} keyboardType="numeric" value={editHours} onChangeText={setEditHours} />
            <TextInput style={{ backgroundColor: C.input, borderRadius: 12, padding: 14, fontSize: 16, color: C.text, marginBottom: 16, borderWidth: 1, borderColor: C.inputBorder }} placeholder="Note (optional)" placeholderTextColor={C.subtext} value={editNote} onChangeText={setEditNote} />
            <TouchableOpacity onPress={saveEdit} style={{ backgroundColor: C.accent, borderRadius: 14, padding: 16, alignItems: 'center', marginBottom: 10 }}>
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>Save Changes</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setEditingSession(null)} style={{ padding: 14, alignItems: 'center' }}>
              <Text style={{ color: C.subtext }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={labelModalVisible} transparent animationType="slide">
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ backgroundColor: C.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}>
            <Text style={{ color: C.text, fontWeight: '800', fontSize: 18, marginBottom: 16 }}>Choose Label</Text>
            {labels.map((l) => (
              <TouchableOpacity key={l} onPress={() => { setSelectedLabel(l); setLabelModalVisible(false); }} style={{ padding: 14, borderRadius: 12, marginBottom: 8, backgroundColor: selectedLabel === l ? C.accentSoft : C.input }}>
                <Text style={{ color: selectedLabel === l ? C.accent : C.text, fontWeight: '600', fontSize: 15 }}>🏷 {l}</Text>
              </TouchableOpacity>
            ))}
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
              <TextInput style={{ flex: 1, backgroundColor: C.input, borderRadius: 12, padding: 12, color: C.text, fontSize: 14 }} placeholder="Custom label..." placeholderTextColor={C.subtext} value={customLabel} onChangeText={setCustomLabel} />
              <TouchableOpacity
                onPress={() => {
                  if (customLabel.trim()) {
                    const n = customLabel.trim();
                    setLabels((prev) => [...new Set([...prev, n])]);
                    setSelectedLabel(n);
                    setCustomLabel('');
                    setLabelModalVisible(false);
                  }
                }}
                style={{ backgroundColor: C.accent, borderRadius: 12, padding: 12, justifyContent: 'center' }}
              >
                <Text style={{ color: '#fff', fontWeight: '700' }}>Add</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => setLabelModalVisible(false)} style={{ marginTop: 16, padding: 14, alignItems: 'center' }}>
              <Text style={{ color: C.subtext }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={filterModalVisible} transparent animationType="slide">
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ backgroundColor: C.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}>
            <Text style={{ color: C.text, fontWeight: '800', fontSize: 18, marginBottom: 16 }}>Filter by Label</Text>
            {labels.map((l) => (
              <TouchableOpacity key={l} onPress={() => { setFilterLabel(l); setFilterModalVisible(false); }} style={{ padding: 14, borderRadius: 12, marginBottom: 8, backgroundColor: filterLabel === l ? C.accentSoft : C.input }}>
                <Text style={{ color: filterLabel === l ? C.accent : C.text, fontWeight: '600', fontSize: 15 }}>🏷 {l}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => setFilterModalVisible(false)} style={{ marginTop: 8, padding: 14, alignItems: 'center' }}>
              <Text style={{ color: C.subtext }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
