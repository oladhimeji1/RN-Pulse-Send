import type { TextStyle } from 'react-native';

export const colors = {
  bg: '#0A0B10',
  surface: '#141620',
  surface2: '#1D2030',
  border: '#262A3B',
  text: '#F5F6FA',
  muted: '#8B90A5',
  accent: '#C8F63D',
  onAccent: '#0A0B10',
  danger: '#FF6B86',
  success: '#3DDC97',
  violet: '#7C5CFF',
} as const;

export const tabular: TextStyle = { fontVariant: ['tabular-nums'] };
