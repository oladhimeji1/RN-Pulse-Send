import { useEffect, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { colors } from '../lib/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type Props = { size?: number; stroke?: number; children?: ReactNode };

/** Indeterminate arc: rotates continuously while the arc length "breathes". */
export function ProgressRing({ size = 104, stroke = 4, children }: Props) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const rot = useSharedValue(0);
  const sweep = useSharedValue(0.25);

  useEffect(() => {
    rot.value = withRepeat(withTiming(1, { duration: 1200, easing: Easing.linear }), -1, false);
    sweep.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 700, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.2, { duration: 700, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      false,
    );
  }, [rot, sweep]);

  const spin = useAnimatedStyle(() => ({ transform: [{ rotate: `${rot.value * 360}deg` }] }));
  const arc = useAnimatedProps(() => ({ strokeDashoffset: c * (1 - sweep.value) }));

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={[StyleSheet.absoluteFill, spin]}>
        <Svg width={size} height={size}>
          <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.border} strokeWidth={stroke} fill="none" />
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={colors.accent}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${c} ${c}`}
            animatedProps={arc}
          />
        </Svg>
      </Animated.View>
      {children}
    </View>
  );
}
