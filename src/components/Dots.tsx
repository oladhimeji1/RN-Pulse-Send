import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '../lib/theme';

function Dot({ index }: { index: number }) {
  const v = useSharedValue(0.25);
  useEffect(() => {
    v.value = withDelay(
      index * 160,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 320, easing: Easing.out(Easing.quad) }),
          withTiming(0.25, { duration: 320, easing: Easing.in(Easing.quad) }),
          withTiming(0.25, { duration: 480 }),
        ),
        -1,
        false,
      ),
    );
  }, [v, index]);
  const s = useAnimatedStyle(() => ({ opacity: v.value, transform: [{ scale: 0.8 + v.value * 0.4 }] }));
  return <Animated.View style={[{ width: 7, height: 7, borderRadius: 4, backgroundColor: colors.text }, s]} />;
}

export function Dots() {
  return (
    <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center', height: 12 }}>
      {[0, 1, 2].map((i) => (
        <Dot key={i} index={i} />
      ))}
    </View>
  );
}
