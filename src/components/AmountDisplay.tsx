import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { groupInt } from '../lib/format';
import { colors, tabular } from '../lib/theme';

type Props = { raw: string; shake: number; danger?: boolean };

export function AmountDisplay({ raw, shake, danger }: Props) {
  const [intPart, decPart] = raw.split('.');
  const text = groupInt(intPart) + (decPart !== undefined ? '.' + decPart : '');
  const len = text.length;
  const fontSize = len <= 5 ? 76 : len <= 7 ? 62 : 50;

  const pop = useSharedValue(1);
  const x = useSharedValue(0);
  const caret = useSharedValue(1);

  useEffect(() => {
    caret.value = withRepeat(
      withSequence(withTiming(0, { duration: 450, easing: Easing.linear }), withTiming(1, { duration: 450, easing: Easing.linear })),
      -1,
      false,
    );
  }, [caret]);

  useEffect(() => {
    pop.value = 0.92;
    pop.value = withSpring(1, { damping: 9, stiffness: 320 });
  }, [raw, pop]);

  useEffect(() => {
    if (shake === 0) return;
    x.value = withSequence(
      withTiming(-10, { duration: 55 }),
      withTiming(10, { duration: 90 }),
      withTiming(-8, { duration: 90 }),
      withTiming(6, { duration: 80 }),
      withTiming(0, { duration: 60 }),
    );
  }, [shake, x]);

  const num = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }, { translateX: x.value }] }));
  const caretStyle = useAnimatedStyle(() => ({ opacity: caret.value }));

  return (
    <Animated.View style={[{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }, num]}>
      <Text style={{ color: colors.muted, fontSize: fontSize * 0.45, fontWeight: '600', marginRight: 4, marginTop: -fontSize * 0.25 }}>$</Text>
      <Text style={[{ color: danger ? colors.danger : colors.text, fontSize, fontWeight: '800', letterSpacing: -2 }, tabular]}>{text}</Text>
      <View style={{ width: 3 }} />
      <Animated.View style={[{ width: 3, height: fontSize * 0.8, borderRadius: 2, backgroundColor: colors.accent }, caretStyle]} />
    </Animated.View>
  );
}
