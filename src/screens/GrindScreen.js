import { useCallback, useEffect, useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';
import { getTheme } from '../theme/colors';
import { DEFAULT_LABELS } from '../constants/ranges';
import BankrollChart from '../components/BankrollChart';
import SignInPrompt from '../components/SignInPrompt';
import {
  Button,
  Card,
  ConfirmSheet,
  Divider,
  Header,
  Screen,
  SectionLabel,
  Sheet,
  TYPE,
  money,
  nums,
} from '../components/ui';

const ALL = 'All Time';

// Bankroll tracker. Sessions live in Supabase, scoped to the signed-in user by
// row-level security, and can be grouped by a free-form label such as a venue
// or a game type.
export default function GrindScreen({ dark, user, guest, onSignIn }) {
  const C = getTheme(dark);

  const [sessions, setSessions] = useState([]);
  const [labels, setLabels] = useState(DEFAULT_LABELS);
  const [error, setError] = useState('');

  const [form, setForm] = useState({ buyin: '', cashout: '', hours: '', stakes: '', note: '' });
  const [selectedLabel, setSelectedLabel] = useState(ALL);
  const [filterLabel, setFilterLabel] = useState(ALL);

  const [sheet, setSheet] = useState(null); // 'label' | 'filter' | 'edit' | 'clear' | 'delete'
  const [customLabel, setCustomLabel] = useState('');
  const [editing, setEditing] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [focused, setFocused] = useState(null);

  const fetchSessions = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) {
      setError(error.message);
      return;
    }
    if (data) {
      setSessions(data);
      const seen = [...new Set(data.map((s) => s.label).filter(Boolean))];
      setLabels((prev) => [...new Set([...prev, ...seen])]);
    }
  }, [user]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Guests get the explanation, not a dead screen. Nothing below this runs for
  // them, so no query is ever made without a user id.
  if (guest) {
    return (
      <Screen dark={dark} scroll={false}>
        <SignInPrompt
          dark={dark}
          onSignIn={onSignIn}
          title="Sessions need an account"
          reason="Buy-ins and results have to be stored somewhere, and there is nowhere to put them until you have an account."
          bullets={[
            'Your results follow you to any device you sign in on',
            'The coach can read your actual numbers instead of guessing',
            'It stays private to you',
          ]}
        />
      </Screen>
    );
  }

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const addSession = async () => {
    const buyin = parseFloat(form.buyin);
    const cashout = parseFloat(form.cashout);
    const hours = parseFloat(form.hours);
    if ([buyin, cashout, hours].some(Number.isNaN)) {
      setError('Buy-in, cash-out and hours are all needed.');
      return;
    }
    setError('');
    const row = { user_id: user.id, buyin, cashout, hours, profit: cashout - buyin };
    if (form.stakes) row.stakes = form.stakes;
    if (form.note) row.note = form.note;
    if (selectedLabel) row.label = selectedLabel;

    const { error } = await supabase.from('sessions').insert([row]);
    if (error) {
      setError(error.message);
      return;
    }
    setForm({ buyin: '', cashout: '', hours: '', stakes: '', note: '' });
    fetchSessions();
  };

  const saveEdit = async () => {
    if (!editing) return;
    const buyin = parseFloat(editing.buyin);
    const cashout = parseFloat(editing.cashout);
    const hours = parseFloat(editing.hours);
    if ([buyin, cashout, hours].some(Number.isNaN)) return;
    await supabase
      .from('sessions')
      .update({ buyin, cashout, hours, profit: cashout - buyin, note: editing.note })
      .eq('id', editing.id)
      .eq('user_id', user.id);
    setEditing(null);
    setSheet(null);
    fetchSessions();
  };

  const doDelete = async () => {
    await supabase.from('sessions').delete().eq('id', pendingDelete).eq('user_id', user.id);
    setPendingDelete(null);
    fetchSessions();
  };

  const doClear = async () => {
    let q = supabase.from('sessions').delete().eq('user_id', user.id);
    if (filterLabel !== ALL) q = q.eq('label', filterLabel);
    await q;
    fetchSessions();
  };

  const shown = filterLabel === ALL ? sessions : sessions.filter((s) => s.label === filterLabel);
  const profit = shown.reduce((a, s) => a + s.profit, 0);
  const hours = shown.reduce((a, s) => a + s.hours, 0);
  const perHour = hours > 0 ? profit / hours : 0;
  const wins = shown.filter((s) => s.profit > 0).length;
  const best = shown.length ? Math.max(...shown.map((s) => s.profit)) : 0;
  const worst = shown.length ? Math.min(...shown.map((s) => s.profit)) : 0;

  const field = (name, extra) => ({
    backgroundColor: C.input,
    borderWidth: 1,
    borderColor: focused === name ? C.accent : C.inputBorder,
    borderRadius: 10,
    paddingHorizontal: 13,
    height: 44,
    fontSize: 15,
    color: C.text,
    marginBottom: 8,
    ...extra,
  });

  const bind = (name) => ({
    onFocus: () => setFocused(name),
    onBlur: () => setFocused(null),
    placeholderTextColor: C.subtext2,
  });

  return (
    <View style={{ flex: 1 }}>
      <Screen dark={dark}>
        <Header
          dark={dark}
          title="Grind"
          right={
            <TouchableOpacity
              onPress={() => setSheet('filter')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                borderWidth: 1,
                borderColor: C.cardBorder,
                borderRadius: 9,
                paddingHorizontal: 11,
                height: 32,
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: '600', color: C.text }}>{filterLabel}</Text>
              <Text style={{ fontSize: 10, color: C.subtext2 }}>▾</Text>
            </TouchableOpacity>
          }
        />

        <Text
          style={{
            ...nums,
            fontSize: 40,
            fontWeight: '700',
            letterSpacing: -1.8,
            color: shown.length === 0 ? C.subtext2 : profit >= 0 ? C.green : C.red,
          }}
        >
          {money(profit)}
        </Text>
        <View style={{ flexDirection: 'row', gap: 14, marginTop: 16, marginBottom: 24 }}>
          {[
            ['Per hour', hours > 0 ? money(perHour) : '—'],
            ['Hours', hours > 0 ? hours.toFixed(0) : '—'],
            ['Won', shown.length ? `${Math.round((wins / shown.length) * 100)}%` : '—'],
            ['Sessions', String(shown.length)],
          ].map(([label, value]) => (
            <View key={label} style={{ flex: 1 }}>
              <Text style={{ ...nums, fontSize: 16, fontWeight: '650', color: C.text }}>
                {value}
              </Text>
              <Text style={{ ...TYPE.label, color: C.subtext2, marginTop: 4 }}>
                {label.toUpperCase()}
              </Text>
            </View>
          ))}
        </View>

        <BankrollChart sessions={shown} dark={dark} />

        {shown.length > 0 && (
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 24 }}>
            <Card dark={dark} style={{ flex: 1 }}>
              <Text style={{ ...TYPE.label, color: C.subtext2 }}>BEST</Text>
              <Text style={{ ...nums, fontSize: 18, fontWeight: '700', color: C.green, marginTop: 5 }}>
                {money(best)}
              </Text>
            </Card>
            <Card dark={dark} style={{ flex: 1 }}>
              <Text style={{ ...TYPE.label, color: C.subtext2 }}>WORST</Text>
              <Text style={{ ...nums, fontSize: 18, fontWeight: '700', color: C.red, marginTop: 5 }}>
                {money(worst)}
              </Text>
            </Card>
          </View>
        )}

        <SectionLabel dark={dark}>New session</SectionLabel>
        <Card dark={dark} style={{ marginBottom: 26 }}>
          <TouchableOpacity
            onPress={() => setSheet('label')}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: C.inputBorder,
              borderRadius: 10,
              paddingHorizontal: 13,
              height: 44,
              marginBottom: 8,
            }}
          >
            <Text style={{ fontSize: 15, color: C.text }}>{selectedLabel}</Text>
            <Text style={{ fontSize: 10, color: C.subtext2 }}>▾</Text>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TextInput
              style={field('buyin', { flex: 1 })}
              placeholder="Buy-in"
              keyboardType="numeric"
              value={form.buyin}
              onChangeText={set('buyin')}
              {...bind('buyin')}
            />
            <TextInput
              style={field('cashout', { flex: 1 })}
              placeholder="Cash-out"
              keyboardType="numeric"
              value={form.cashout}
              onChangeText={set('cashout')}
              {...bind('cashout')}
            />
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TextInput
              style={field('hours', { flex: 1 })}
              placeholder="Hours"
              keyboardType="numeric"
              value={form.hours}
              onChangeText={set('hours')}
              {...bind('hours')}
            />
            <TextInput
              style={field('stakes', { flex: 1 })}
              placeholder="Stakes"
              value={form.stakes}
              onChangeText={set('stakes')}
              {...bind('stakes')}
            />
          </View>
          <TextInput
            style={field('note', { marginBottom: 12 })}
            placeholder="Note"
            value={form.note}
            onChangeText={set('note')}
            {...bind('note')}
          />

          {/* Live arithmetic. Seeing the result before you commit catches a
              transposed buy-in far more often than reading it back does. */}
          {form.buyin !== '' && form.cashout !== '' && (
            <Text style={{ ...TYPE.small, ...nums, color: C.subtext, marginBottom: 12 }}>
              {money((parseFloat(form.cashout) || 0) - (parseFloat(form.buyin) || 0))} on this one
            </Text>
          )}

          {error ? (
            <Text style={{ ...TYPE.small, color: C.red, marginBottom: 12 }}>{error}</Text>
          ) : null}

          <Button dark={dark} label="Log it" onPress={addSession} />
        </Card>

        <SectionLabel dark={dark}>History</SectionLabel>
        {shown.length === 0 ? (
          <Card dark={dark}>
            <Text style={{ ...TYPE.body, color: C.subtext }}>
              {filterLabel === ALL ? 'Nothing logged yet.' : `Nothing under ${filterLabel} yet.`}
            </Text>
          </Card>
        ) : (
          <Card dark={dark} padded={false}>
            {shown.map((s, i) => (
              <View key={s.id}>
                {i > 0 && <Divider dark={dark} />}
                <View style={{ padding: 15 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                    <Text
                      style={{
                        ...nums,
                        fontSize: 19,
                        fontWeight: '700',
                        color: s.profit >= 0 ? C.green : C.red,
                        flex: 1,
                      }}
                    >
                      {money(s.profit)}
                    </Text>
                    <Text style={{ ...TYPE.small, ...nums, color: C.subtext2 }}>
                      {s.hours}h{s.stakes ? ` · ${s.stakes}` : ''}
                      {s.label && s.label !== ALL ? ` · ${s.label}` : ''}
                    </Text>
                  </View>

                  {s.note ? (
                    <Text style={{ ...TYPE.small, color: C.subtext, marginTop: 6 }}>{s.note}</Text>
                  ) : null}

                  <View style={{ flexDirection: 'row', gap: 16, marginTop: 10 }}>
                    <TouchableOpacity
                      onPress={() => {
                        setEditing({
                          id: s.id,
                          buyin: String(s.buyin),
                          cashout: String(s.cashout),
                          hours: String(s.hours),
                          note: s.note || '',
                        });
                        setSheet('edit');
                      }}
                    >
                      <Text style={{ fontSize: 13, fontWeight: '600', color: C.subtext }}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setPendingDelete(s.id);
                        setSheet('delete');
                      }}
                    >
                      <Text style={{ fontSize: 13, fontWeight: '600', color: C.red }}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </Card>
        )}

        {shown.length > 0 && (
          <Button
            dark={dark}
            tone="ghost"
            label={filterLabel === ALL ? 'Delete every session' : `Delete all ${filterLabel} sessions`}
            onPress={() => setSheet('clear')}
            style={{ marginTop: 16 }}
          />
        )}
      </Screen>

      <Sheet
        dark={dark}
        visible={sheet === 'edit'}
        onClose={() => setSheet(null)}
        title="Edit session"
      >
        {editing && (
          <>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TextInput
                style={field('e1', { flex: 1 })}
                placeholder="Buy-in"
                keyboardType="numeric"
                value={editing.buyin}
                onChangeText={(v) => setEditing((e) => ({ ...e, buyin: v }))}
                {...bind('e1')}
              />
              <TextInput
                style={field('e2', { flex: 1 })}
                placeholder="Cash-out"
                keyboardType="numeric"
                value={editing.cashout}
                onChangeText={(v) => setEditing((e) => ({ ...e, cashout: v }))}
                {...bind('e2')}
              />
            </View>
            <TextInput
              style={field('e3')}
              placeholder="Hours"
              keyboardType="numeric"
              value={editing.hours}
              onChangeText={(v) => setEditing((e) => ({ ...e, hours: v }))}
              {...bind('e3')}
            />
            <TextInput
              style={field('e4', { marginBottom: 16 })}
              placeholder="Note"
              value={editing.note}
              onChangeText={(v) => setEditing((e) => ({ ...e, note: v }))}
              {...bind('e4')}
            />
            <Button dark={dark} label="Save" onPress={saveEdit} />
            <Button
              dark={dark}
              tone="ghost"
              label="Cancel"
              onPress={() => setSheet(null)}
              style={{ marginTop: 6 }}
            />
          </>
        )}
      </Sheet>

      <Sheet
        dark={dark}
        visible={sheet === 'label' || sheet === 'filter'}
        onClose={() => setSheet(null)}
        title={sheet === 'filter' ? 'Show' : 'Label'}
      >
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
          {labels.map((l) => {
            const active = (sheet === 'filter' ? filterLabel : selectedLabel) === l;
            return (
              <TouchableOpacity
                key={l}
                onPress={() => {
                  if (sheet === 'filter') setFilterLabel(l);
                  else setSelectedLabel(l);
                  setSheet(null);
                }}
                style={{
                  paddingHorizontal: 13,
                  height: 36,
                  justifyContent: 'center',
                  borderRadius: 9,
                  borderWidth: 1,
                  borderColor: active ? C.accent : C.cardBorder,
                  backgroundColor: active ? C.accentSoft : 'transparent',
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '600', color: active ? C.accent : C.text }}>
                  {l}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {sheet === 'label' && (
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TextInput
              style={field('custom', { flex: 1, marginBottom: 0 })}
              placeholder="New label"
              value={customLabel}
              onChangeText={setCustomLabel}
              {...bind('custom')}
            />
            <Button
              dark={dark}
              label="Add"
              disabled={!customLabel.trim()}
              onPress={() => {
                const n = customLabel.trim();
                setLabels((prev) => [...new Set([...prev, n])]);
                setSelectedLabel(n);
                setCustomLabel('');
                setSheet(null);
              }}
              style={{ paddingHorizontal: 20, width: 84 }}
            />
          </View>
        )}
      </Sheet>

      <ConfirmSheet
        dark={dark}
        visible={sheet === 'delete'}
        onClose={() => setSheet(null)}
        title="Delete this session?"
        body="It cannot be brought back."
        confirmLabel="Delete"
        onConfirm={doDelete}
      />

      <ConfirmSheet
        dark={dark}
        visible={sheet === 'clear'}
        onClose={() => setSheet(null)}
        title={filterLabel === ALL ? 'Delete every session?' : `Delete all ${filterLabel} sessions?`}
        body={`${shown.length} ${shown.length === 1 ? 'session' : 'sessions'} will be removed for good.`}
        confirmLabel={`Delete ${shown.length}`}
        onConfirm={doClear}
      />
    </View>
  );
}
