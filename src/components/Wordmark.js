import { Text, View } from 'react-native';
import { getTheme } from '../theme/colors';

// The app's mark, built out of type rather than an image so it stays sharp at
// any size and follows the theme without a second asset.
//
// A gold tile with a spade on it, then the name. The suit characters here are
// Unicode glyphs, not emoji, so they render in the text colour and sit on the
// baseline instead of arriving as somebody else's cartoon.
export default function Wordmark({ dark, size = 26, showName = true }) {
  const C = getTheme(dark);
  const tile = Math.round(size * 1.12);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <View
        style={{
          width: tile,
          height: tile,
          borderRadius: Math.round(tile * 0.28),
          backgroundColor: C.accent,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text
          style={{
            color: C.accentText,
            fontSize: Math.round(tile * 0.6),
            // The glyph carries optical weight low; nudge it up to sit centred.
            lineHeight: Math.round(tile * 0.72),
          }}
        >
          ♠
        </Text>
      </View>

      {showName && (
        <Text
          style={{
            color: C.text,
            fontSize: size,
            fontWeight: '700',
            letterSpacing: -0.9,
            marginLeft: Math.round(size * 0.42),
          }}
        >
          Poker Hub
        </Text>
      )}
    </View>
  );
}
