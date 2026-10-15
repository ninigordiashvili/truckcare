import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { C, F, TOP, BOTTOM } from './theme';

export function Screen({ title, subtitle, onBack, children, footer }) {
  return (
    <View style={s.screen}>
      <View style={s.header}>
        {onBack ? (
          <Pressable onPress={onBack} hitSlop={12} style={s.back} accessibilityLabel="უკან">
            <Text style={s.backArrow}>‹</Text>
          </Pressable>
        ) : null}
        <View style={{ flex: 1 }}>
          <Text style={F.h3}>{title}</Text>
          {subtitle ? <Text style={[F.tiny, { marginTop: 2 }]}>{subtitle}</Text> : null}
        </View>
      </View>
      <ScrollView contentContainerStyle={s.body} keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>
      {footer ? <View style={s.footer}>{footer}</View> : null}
    </View>
  );
}

export function Card({ children, selected, style, onPress }) {
  const inner = (
    <View style={[s.card, selected && s.cardSelected, style]}>{children}</View>
  );
  return onPress ? <Pressable onPress={onPress}>{inner}</Pressable> : inner;
}

export function Btn({ title, hint, onPress, dark, disabled, style }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        s.btn,
        dark ? s.btnDark : s.btnLight,
        disabled && { opacity: 0.35 },
        pressed && { opacity: 0.7 },
        style,
      ]}
    >
      <Text style={[s.btnText, dark && { color: C.onInk }]}>{title}</Text>
      {hint ? <Text style={[s.btnHint, dark && { color: '#D6D6D6' }]}>{hint}</Text> : null}
    </Pressable>
  );
}

export function BigBtn({ title, hint, onPress, dark }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [s.big, dark ? s.bigDark : s.bigLight, pressed && { opacity: 0.8 }]}
    >
      <Text style={[s.bigTitle, dark && { color: C.onInk }]}>{title}</Text>
      <Text style={[s.bigHint, dark && { color: '#D6D6D6' }]}>{hint}</Text>
    </Pressable>
  );
}

export function Chip({ text, dark, style }) {
  return (
    <View style={[s.chip, dark && { backgroundColor: C.ink }, style]}>
      <Text style={[s.chipText, dark && { color: C.onInk }]}>{text}</Text>
    </View>
  );
}

export function Row({ children, style }) {
  return <View style={[s.row, style]}>{children}</View>;
}

export function Dot({ state }) {
  return (
    <View
      style={[
        s.dot,
        state === 'done' && { backgroundColor: '#D4D4D4', borderColor: '#D4D4D4' },
        state === 'wait' && { backgroundColor: C.bg, borderColor: C.ink },
        state === 'now' && { backgroundColor: C.ink, borderColor: C.ink },
      ]}
    />
  );
}

export function Line() {
  return <View style={s.line} />;
}

export function Note({ children }) {
  return (
    <View style={s.note}>
      <Text style={[F.tiny, { lineHeight: 19 }]}>{children}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  header: {
    paddingTop: TOP,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: C.lineSoft,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  back: { width: 32, height: 44, justifyContent: 'center', marginLeft: -8 },
  backArrow: { fontSize: 30, lineHeight: 34, color: C.text },
  body: { padding: 20, gap: 14, paddingBottom: 28 },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: BOTTOM,
    borderTopWidth: 1,
    borderTopColor: C.lineSoft,
    gap: 10,
  },
  card: { borderWidth: 1, borderColor: C.line, borderRadius: 12, padding: 16, backgroundColor: C.bg },
  cardSelected: { borderWidth: 2, borderColor: C.ink },
  btn: { borderRadius: 12, paddingVertical: 16, paddingHorizontal: 18, alignItems: 'center', minHeight: 52, justifyContent: 'center' },
  btnLight: { borderWidth: 2, borderColor: C.ink, backgroundColor: C.bg },
  btnDark: { backgroundColor: C.ink },
  btnText: { fontSize: 17, fontWeight: '600', color: C.text, textAlign: 'center' },
  btnHint: { fontSize: 13, color: C.muted, marginTop: 3, textAlign: 'center' },
  big: { borderRadius: 14, padding: 24, minHeight: 150, justifyContent: 'center', gap: 8 },
  bigDark: { backgroundColor: C.ink },
  bigLight: { backgroundColor: C.bg, borderWidth: 2, borderColor: C.ink },
  bigTitle: { fontSize: 28, fontWeight: '700', color: C.text },
  bigHint: { fontSize: 15, lineHeight: 21, color: C.text2 },
  chip: { backgroundColor: C.surface, borderRadius: 6, paddingVertical: 6, paddingHorizontal: 10, alignSelf: 'flex-start' },
  chipText: { fontSize: 13, color: C.text },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  dot: { width: 14, height: 14, borderRadius: 7, borderWidth: 2, backgroundColor: C.ink, borderColor: C.ink },
  line: { width: 2, flex: 1, backgroundColor: C.line, marginVertical: 2 },
  note: { backgroundColor: C.surface, borderRadius: 10, padding: 14 },
});
