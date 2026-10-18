import { useEffect } from 'react';
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors } from '../lib/theme';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const LEN = 40;

/** Badge pops in with a spring, then the tick draws itself. */
export function CheckBadge({ size = 76, color = colors.success }: { size?: number; color?: string }) {
  const pop = useSharedValue(0.4);
  const draw = useSharedValue(LEN);

  useEffect(() => {
    pop.value = withSpring(1, { damping: 11, stiffness: 180 });
    draw.value = withDelay(140, withTiming(0, { duration: 380, easing: Easing.out(Easing.cubic) }));
  }, [pop, draw]);

  const wrap = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }], opacity: Math.min(1, pop.value * 1.4) }));
  const tick = useAnimatedProps(() => ({ strokeDashoffset: draw.value }));

  return (
    <Animated.View style={wrap}>
      <Svg width={size} height={size} viewBox="0 0 48 48">
        <Circle cx={24} cy={24} r={24} fill={color} />
        <AnimatedPath
          d="M14 24.5l7 7 13-14"
          stroke={colors.onAccent}
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          strokeDasharray={`${LEN} ${LEN}`}
          animatedProps={tick}
        />
      </Svg>
    </Animated.View>
  );
}
