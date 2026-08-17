import { Modal, Platform, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { getTheme } from '../theme/colors';

// The handful of pieces every screen was rebuilding inline. Pulling them out is
// what stops the app drifting: one place decides how a card is bordered, how a
// button is padded, how far a heading sits from the content under it.

// Type scale. Six sizes, not fifteen. Tabular figures wherever a number appears
// so columns of money line up instead of wobbling.
export const TYPE = {
  display: { fontSize: 34, fontWeight: '700', letterSpacing: -1.1 },
  title: { fontSize: 21, fontWeight: '700', letterSpacing: -0.5 },
  heading: { fontSize: 16, fontWeight: '650', letterSpacing: -0.2 },
  body: { fontSize: 14.5, lineHeight: 21 },
  small: { fontSize: 12.5, lineHeight: 18 },
  // Section labels. Wide tracking is what makes small caps readable.
  label: { fontSize: 10.5, fontWeight: '700', letterSpacing: 1.1 },
};

const MONO = Platform.select({
  ios: 'Menlo',
  android: 'monospace',
  default: 'ui-monospace, SFMono-Regular, Menlo, monospace',
});

/** Figures: monospaced so digits occupy equal width and columns stay straight. */
export const nums = { fontFamily: MONO, fontVariant: ['tabular-nums'] };

export function Screen({ dark, children, scroll = true, pad = 20 }) {
  const C = getTheme(dark);
  // The non-scrolling variant has to claim the height, or a child asking to be
  // vertically centred has nothing to centre inside and sits at the top.
  const body = (
    <View
      style={{
        paddingHorizontal: pad,
        paddingTop: 60,
        paddingBottom: 28,
        ...(scroll ? null : { flex: 1 }),
      }}
    >
      {children}
    </View>
  );
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {scroll ? <ScrollView showsVerticalScrollIndicator={false}>{body}</ScrollView> : body}
    </View>
  );
}

/** Screen heading. The subtitle is optional and usually should be left off. */
export function Header({ dark, title, subtitle, right }) {
  const C = getTheme(dark);
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 22,
      }}
    >
      <View style={{ flex: 1 }}>
        {/* A View nested inside Text lays out badly on RN, so a node title
            (the wordmark, say) is rendered as-is rather than wrapped. */}
        {typeof title === 'string' ? (
          <Text style={{ ...TYPE.title, color: C.text }}>{title}</Text>
        ) : (
          title
        )}
        {subtitle ? (
          <Text style={{ ...TYPE.small, color: C.subtext, marginTop: 3 }}>{subtitle}</Text>
        ) : null}
      </View>
      {right}
    </View>
  );
}

export function SectionLabel({ dark, children, style }) {
  const C = getTheme(dark);
  return (
    <Text style={{ ...TYPE.label, color: C.subtext2, marginBottom: 10, ...style }}>
      {String(children).toUpperCase()}
    </Text>
  );
}

export function Card({ dark, children, style, padded = true }) {
  const C = getTheme(dark);
  return (
    <View
      style={{
        backgroundColor: C.card,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: C.cardBorder,
        padding: padded ? 16 : 0,
        ...style,
      }}
    >
      {children}
    </View>
  );
}

/**
 * `tone`: primary (filled gold), secondary (outlined), danger (outlined red),
 * ghost (bare). Height is fixed at 46 so buttons never jitter between screens.
 */
export function Button({ dark, label, onPress, tone = 'primary', disabled, style }) {
  const C = getTheme(dark);
  const tones = {
    primary: { bg: C.accent, fg: C.accentText, border: C.accent },
    secondary: { bg: 'transparent', fg: C.text, border: C.borderStrong },
    danger: { bg: 'transparent', fg: C.red, border: C.red },
    ghost: { bg: 'transparent', fg: C.subtext, border: 'transparent' },
  };
  const t = tones[tone] ?? tones.primary;
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.75}
      style={{
        height: 46,
        borderRadius: 11,
        borderWidth: 1,
        borderColor: t.border,
        backgroundColor: t.bg,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: disabled ? 0.45 : 1,
        ...style,
      }}
    >
      <Text style={{ color: t.fg, fontSize: 14.5, fontWeight: '650' }}>{label}</Text>
    </TouchableOpacity>
  );
}


/** Hairline between rows inside a card. */
export function Divider({ dark, style }) {
  const C = getTheme(dark);
  return <View style={{ height: 1, backgroundColor: C.cardBorder, ...style }} />;
}


/**
 * Bottom sheet. Every modal in the app is one of these, so they all dismiss the
 * same way and none of them reinvents the grabber and the padding.
 */
export function Sheet({ dark, visible, onClose, title, children }) {
  const C = getTheme(dark);
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)' }} onPress={onClose} />
      <View
        style={{
          backgroundColor: C.card,
          borderTopLeftRadius: 18,
          borderTopRightRadius: 18,
          borderTopWidth: 1,
          borderColor: C.cardBorder,
          paddingHorizontal: 20,
          paddingTop: 10,
          paddingBottom: Platform.OS === 'ios' ? 34 : 20,
        }}
      >
        <View
          style={{
            width: 34,
            height: 4,
            borderRadius: 2,
            backgroundColor: C.cardBorder,
            alignSelf: 'center',
            marginBottom: 16,
          }}
        />
        {title ? (
          <Text style={{ ...TYPE.heading, color: C.text, marginBottom: 14 }}>{title}</Text>
        ) : null}
        {children}
      </View>
    </Modal>
  );
}

/**
 * Confirmation for anything destructive.
 *
 * This exists instead of Alert.alert because Alert is not implemented on React
 * Native Web -- it warns to the console and returns, so on web the tap would
 * appear to do nothing and the delete would never happen. A rendered sheet
 * behaves the same on every platform.
 */
export function ConfirmSheet({ dark, visible, onClose, title, body, confirmLabel, onConfirm }) {
  const C = getTheme(dark);
  return (
    <Sheet dark={dark} visible={visible} onClose={onClose} title={title}>
      {body ? (
        <Text style={{ ...TYPE.body, color: C.subtext, marginBottom: 18 }}>{body}</Text>
      ) : null}
      <Button
        dark={dark}
        tone="danger"
        label={confirmLabel}
        onPress={() => {
          onConfirm();
          onClose();
        }}
      />
      <Button dark={dark} tone="ghost" label="Cancel" onPress={onClose} style={{ marginTop: 6 }} />
    </Sheet>
  );
}

/** Formats money the way the app shows it everywhere: sign, no cents. */
export function money(n) {
  const v = Math.round(Number(n) || 0);
  return `${v < 0 ? '-' : v > 0 ? '+' : ''}$${Math.abs(v).toLocaleString()}`;
}
