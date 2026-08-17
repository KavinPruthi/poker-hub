# Poker Hub

A phone app for tracking a poker bankroll and studying between sessions. Log
what you win and lose, drill preflop decisions, work out equity at the table,
and ask a coach about a hand. React Native and Expo on the front, Supabase
behind it.

You do not need an account to use most of it. The trainer, the range charts and
the odds calculator all run on the device, so they work signed out. Only saved
sessions need somewhere to live, and that is the one place the app asks you to
sign in.

## What it does

**Grind** is the bankroll ledger. Log a session with the buy-in, the cash-out,
the hours and optionally the stakes, a note and a label. It works out profit,
hourly rate, best and worst session, and the percentage of sessions you finished
up. Labels let you keep separate records for different venues or game types and
filter to one of them. There is a cumulative chart of where the bankroll has
been, drawn against a real zero line so a losing stretch sits below the axis
instead of merely turning red.

**Train** has five tools:

- *Spots*: preflop decisions on a table diagram. Pick fold, call or raise, and
  it tells you the answer and why. A 3-bet counts as a raise, and spots the
  scenario marks as playable two ways accept either.
- *Ranges*: the 13x13 hand matrix for each seat's opening range.
- *Cards*: flashcards for the vocabulary, pot odds through blockers.
- *Odds*: heads-up equity between two hands, with an optional flop.
- *Seats*: what each position means and why the button is worth the most.

**Coach** is a chat coach that can see your results. Your session totals go into
its prompt, so it answers about your actual record rather than in the abstract.
It only talks poker.

## Stack

| Layer | What |
| --- | --- |
| Client | React Native, Expo SDK 54, React 19 |
| Backend and auth | Supabase: Postgres, Auth, row-level security |
| Coach | Supabase Edge Function proxying an LLM, so the provider key stays server-side |
| Language | JavaScript |

## Layout

Auth, the active tab and the session list live in the root component. Everything
below reads its colours from one theme module, so light and dark stay in step,
and its layout pieces from one components file, so a card on one screen is the
same card on another.

```
App.js                      root: auth, tab routing, shared session data
src/
  components/
    ui.js                   Screen, Card, Button, Sheet, the type scale
    BankrollChart.js
    BottomTabBar.js
    PokerTable.js
    RangeGrid.js
    SignInPrompt.js         shown where a feature needs an account
    Wordmark.js
  screens/                  one file per screen
  constants/                GTO ranges, scenarios, flashcards
  lib/
    supabase.js             client and config
    coach.js                coach request helper
  theme/colors.js           the palette, and the rules it follows
  utils/equity.js           hand evaluator and Monte Carlo
supabase/
  functions/poker-coach/    Edge Function that proxies the LLM
```

## Two things worth explaining

**The palette has one rule.** Green and red mean money and nothing else. In an
app whose main job is telling you whether you are up or down, a red number has
to read as a loss the moment you see it, so neither colour is available as a
brand colour. What is left that belongs at a poker table is the gold of the
chips, and that carries the buttons, the active tab and the focus rings. Every
pairing is checked against WCAG AA.

**The equity calculator is exact underneath the sampling.** `src/utils/equity.js`
finds the best five-card hand out of seven and compares it the way a dealer
would, kickers included. Only the board is sampled: 5,000 deals per matchup,
which is steady to about a percentage point between runs and takes around 30ms.
Verified against exhaustive enumeration of all 1,712,304 possible boards, which
puts AA against KK at 82.36 / 17.09 / 0.54 and AKs against QQ at 46.02 / 53.59 /
0.39. Both are the textbook figures.

The deal uses a partial Fisher-Yates shuffle rather than
`deck.sort(() => Math.random() - 0.5)`. That second one looks like a shuffle and
is not: `Array.sort` assumes a consistent comparator, and a random one leaves
cards biased toward where they started. Over 200,000 shuffles the top card came
out on top about three times more often than it should have, which moved the
board and therefore the equity.

## Running it

You need Node 18 or newer, and either Expo Go on your phone or a simulator.

```bash
git clone https://github.com/KavinPruthi/poker-hub.git
cd poker-hub
npm install
npm start
```

Scan the QR code with Expo Go, press `i` or `a` for a simulator, or `w` for the
browser.

## Configuration

The Supabase URL and anonymous key sit in `src/lib/supabase.js`. The anon key is
meant to ship in client code: access is controlled by row-level security on the
database, not by keeping the key secret. The coach's model provider key never
reaches the client and stays inside the Edge Function.

## License

MIT. See [LICENSE](LICENSE).
