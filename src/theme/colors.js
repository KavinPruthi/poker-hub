// Central palette. Every screen reads from here, so the whole app moves at once.
//
// The constraint that drove this: green and red have to mean money and nothing
// else. This is a profit-and-loss tracker, so a red number must read as "you
// lost" the instant you see it, which rules both colours out as a brand hue.
//
// What is left that still belongs at a poker table is the gold of the chips.
// It carries the interface -- buttons, active tabs, focus -- against a near
// black ground, and it never appears on a figure.
//
// Steel blue does one job: "call" in the trainer. Fold and raise keep their
// obvious red and green there, and a neutral middle keeps the three legible
// without borrowing a colour that means money elsewhere.
//
// Dark is the default. It is a phone app used at a table, often in low light.
// Every pairing below is checked against WCAG AA: 4.5:1 for text, 3:1 for
// controls, 1.3:1 for dividers.

export const COLORS = {
  light: {
    bg: '#F7F6F3',
    card: '#FFFFFF',
    card2: '#F0EEE9',
    cardBorder: '#DFDCD4',
    borderStrong: '#8B8880',

    text: '#16181C',
    subtext: '#54585E',
    subtext2: '#6C7075',

    // Bronze rather than bright gold: on paper a light gold turns to haze.
    accent: '#8A5A0B',
    accentText: '#FFFFFF',
    accentSoft: '#F6EFE1',
    accentBorder: '#DCC9A2',

    // Money.
    green: '#156B47',
    greenSoft: '#E4EFE9',
    red: '#A8352C',
    redSoft: '#F5E5E3',

    // "Call" in the trainer, and anything genuinely neutral.
    steel: '#2F5B80',
    steelSoft: '#E7EDF3',

    input: '#FFFFFF',
    inputBorder: '#DFDCD4',
  },
  dark: {
    bg: '#0A0B0D',
    card: '#131519',
    card2: '#1A1D22',
    cardBorder: '#26292F',
    borderStrong: '#5C6169',

    text: '#ECEEF0',
    subtext: '#9CA1A9',
    subtext2: '#787D85',

    accent: '#E3AC4E',
    accentText: '#17120A',
    accentSoft: '#221A0B',
    accentBorder: '#4C3C1A',

    // Lifted for a dark ground: a colour that reads on paper goes muddy on ink.
    green: '#4FAE7C',
    greenSoft: '#122420',
    red: '#DE6A60',
    redSoft: '#251514',

    steel: '#7FA6C9',
    steelSoft: '#111A22',

    input: '#131519',
    inputBorder: '#2C3036',
  },
};

// const C = getTheme(dark);
export const getTheme = (dark) => (dark ? COLORS.dark : COLORS.light);
