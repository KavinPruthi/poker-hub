// Central color palette for the app. Every screen reads its colors from here
// so light/dark mode stays consistent across the whole UI.

export const COLORS = {
  light: {
    bg: '#F8F9FB', card: '#FFFFFF', cardBorder: '#EDEEF2',
    text: '#0D0F14', subtext: '#7A7F8E', accent: '#6C47FF',
    accentSoft: '#EEE9FF', green: '#00C48C', greenSoft: '#E0FBF3',
    red: '#FF4D6A', redSoft: '#FFE8EC', yellow: '#F5A623', yellowSoft: '#FFF4E0',
    input: '#F2F3F7', inputBorder: '#E0E2EA',
  },
  dark: {
    bg: '#0D0F14', card: '#181C25', cardBorder: '#252A36',
    text: '#F0F2F8', subtext: '#6B7280', accent: '#7C5CFF',
    accentSoft: '#1E1A35', green: '#00C48C', greenSoft: '#0D2620',
    red: '#FF4D6A', redSoft: '#2A1018', yellow: '#F5A623', yellowSoft: '#2A1F00',
    input: '#1E2230', inputBorder: '#2E3345',
  },
};

// Small helper so components can grab the active palette in one line:
//   const C = getTheme(dark);
export const getTheme = (dark) => (dark ? COLORS.dark : COLORS.light);
