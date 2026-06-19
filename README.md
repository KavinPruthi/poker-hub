# Poker Hub 🃏

A cross-platform mobile app for serious poker players to **track their bankroll, train their game, and get AI coaching** — all in one place. Built with React Native (Expo), Supabase, and an LLM-backed coaching assistant.

> Track. Train. Dominate.

---

## Features

### 📊 Grind — Bankroll Tracking
- Log cash-game sessions (buy-in, cash-out, hours, stakes, notes)
- Automatic profit, hourly win-rate, best/worst session, and total-hours stats
- Group sessions with custom labels (e.g. by casino or game type) and filter on the fly
- Cumulative bankroll chart so you can see your trend over time
- Full edit/delete with confirmation, synced to the cloud per user

### 🧠 Train — Study Tools
- **Scenarios** — preflop decision drills on a visual table with instant GTO feedback and a running score
- **GTO Charts** — interactive 13×13 open-raise range grids for every position
- **Flashcards** — core poker-theory concepts (pot odds, SPR, blockers, range advantage…)
- **Odds Calculator** — heads-up equity via on-device Monte Carlo simulation, with optional flop
- **Positions Guide** — tap any seat to learn its strategy, plus a position power ranking

### 🤖 AI Coach
- Chat with an LLM poker coach for GTO advice and hand analysis
- The coach is **stats-aware** — your real session numbers are injected into the prompt, so feedback is grounded in your actual results
- Quick-prompt suggestions to get started fast

### Plus
- Email/password auth (Supabase)
- Light & dark themes, with the preference persisted to your account across devices

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Mobile / Web client | React Native, [Expo](https://expo.dev) (SDK 54), React 19 |
| Backend & Auth | [Supabase](https://supabase.com) (Postgres + Auth + Row-Level Security) |
| AI coaching | Supabase Edge Function (Deno) proxying an LLM, keeping the provider API key server-side |
| Language | JavaScript (ES2022) |

---

## Architecture

The app is a small, dependency-light client. State for auth, the active tab, and
the session list lives in the root component; everything below reads colors from
a single theme module so light/dark mode stays consistent.

```
.
├── App.js                     # Root: auth state, tab routing, shared session data
├── index.js                   # Expo entry point
├── src/
│   ├── components/            # Reusable UI (chart, poker table, range grid, tab bar)
│   │   ├── BankrollChart.js
│   │   ├── BottomTabBar.js
│   │   ├── PokerTable.js
│   │   └── RangeGrid.js
│   ├── screens/               # One file per screen
│   │   ├── LoginScreen.js
│   │   ├── HomeScreen.js
│   │   ├── GrindScreen.js
│   │   ├── TrainScreen.js
│   │   ├── OddsCalculator.js
│   │   ├── PositionsGuide.js
│   │   ├── AIChatScreen.js
│   │   └── SettingsScreen.js
│   ├── constants/             # Static poker data (GTO ranges, scenarios, flashcards)
│   │   ├── ranges.js
│   │   └── training.js
│   ├── lib/                   # External services
│   │   ├── supabase.js        # Supabase client + config
│   │   └── coach.js           # AI coach request helper
│   ├── theme/
│   │   └── colors.js          # Light/dark palette
│   └── utils/
│       └── equity.js          # Monte Carlo hand-equity estimator
└── supabase/
    └── functions/poker-coach/ # Edge Function that proxies the LLM request
```

### A note on the equity calculator

`src/utils/equity.js` is a small from-scratch Monte Carlo estimator: given two
hole-card hands and an optional partial board, it deals out the remaining cards
hundreds of times and tallies how often each player wins. It's an approximation
rather than a full solver — fast enough to run instantly on-device while still
giving a reliable "am I ahead?" read.

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) 18+
- The [Expo Go](https://expo.dev/go) app on your phone (or an iOS/Android simulator)

### Run it

```bash
git clone https://github.com/KavinPruthi/poker-hub.git
cd poker-hub
npm install
npm start
```

Then scan the QR code with Expo Go, or press `i` / `a` for a simulator, or `w` to open it in the browser.

### Configuration

The Supabase URL and **anonymous** key live in `src/lib/supabase.js`. The anon
key is safe to ship in client code by design — access is controlled by row-level
security policies on the database, not by hiding the key. The AI coach's model
provider key is never exposed to the client; it stays server-side inside the
Supabase Edge Function.

---

## License

Released under the MIT License — see [LICENSE](LICENSE).
