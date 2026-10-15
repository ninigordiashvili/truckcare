import { Platform } from 'react-native';

export const C = {
  bg: '#FFFFFF',
  surface: '#F6F6F6',
  line: '#E4E4E4',
  lineSoft: '#EFEFEF',
  text: '#111111',
  text2: '#4A4A4A',
  muted: '#6B6B6B',
  faint: '#8A8A8A',
  ink: '#111111',
  onInk: '#FFFFFF',
};

export const TOP = Platform.OS === 'ios' ? 56 : 28;
export const BOTTOM = Platform.OS === 'ios' ? 28 : 14;

export const F = {
  h1: { fontSize: 28, fontWeight: '700', color: C.text },
  h2: { fontSize: 22, fontWeight: '700', color: C.text },
  h3: { fontSize: 17, fontWeight: '600', color: C.text },
  body: { fontSize: 16, color: C.text },
  small: { fontSize: 14, color: C.text2 },
  tiny: { fontSize: 13, color: C.muted },
};
