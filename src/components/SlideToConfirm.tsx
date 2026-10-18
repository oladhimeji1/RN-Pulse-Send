import { useState } from 'react';
import { StyleSheet, Text, View, useWindowDimensions, type LayoutChangeEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { medium } from '../lib/haptics';
import { colors } from '../lib/theme';
import { Icon } from './Icon';

const KNOB = 56;
const PAD = 4;
const H = KNOB + PAD * 2;

type Props = { label: string; onConfirm: () => void };

export function SlideToConfirm({ label, onConfirm }: Props) {
  const { width: winW } = useWindowDimensions();
  // Sheet has paddingHorizontal: 22, so track width is roughly winW - 44
  const [w, setW] = useState(winW ? Math.max(200, winW - 44) : 340);
  const x = useSharedValue(0);
  const locked = useSharedValue(false);
  const max = Math.max(1, w - KNOB - PAD * 2);

  const fire = () => {
    medium();
    onConfirm();
  };

  const pan = Gesture.Pan()
    .activeOffsetX([-6, 6])
    .onUpdate((e) => {
      'worklet';
      if (locked.value) return;
      x.value = Math.min(max, Math.max(0, e.translationX));
      // If dragged to the end, complete immediately
      if (x.value >= max - 2) {
        locked.value = true;
        x.value = withTiming(max, { duration: 80 });
        runOnJS(fire)();
      }
    })
    .onFinalize(() => {
      'worklet';
      if (locked.value) return;
      // If released past 65% of the slide track, complete
      if (x.value > max * 0.65) {
        locked.value = true;
        x.value = withTiming(max, { duration: 120 });
        runOnJS(fire)();
      } else {
        x.value = withSpring(0, { damping: 18, stiffness: 240 });
      }
    });

  const knob = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  const fill = useAnimatedStyle(() => ({ width: x.value + KNOB + PAD * 2 }));
  const labelStyle = useAnimatedStyle(() => ({
    opacity: interpolate(x.value, [0, max * 0.5], [1, 0], 'clamp'),
    transform: [{ translateX: interpolate(x.value, [0, max], [0, 24], 'clamp') }],
  }));

  return (
    <View
      style={styles.track}
      onLayout={(e: LayoutChangeEvent) => {
        const layoutW = e.nativeEvent.layout.width;
        if (layoutW > 0) setW(layoutW);
      }}
    >
      <Animated.View style={[styles.fill, fill]} />
      <Animated.View style={[StyleSheet.absoluteFill, styles.labelWrap, labelStyle]} pointerEvents="none">
        <Text style={styles.label}>{label}</Text>
      </Animated.View>
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.knob, knob]} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Icon name="arrow-right" size={24} color={colors.onAccent} strokeWidth={2.4} />
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    alignSelf: 'stretch',
    height: H,
    borderRadius: H / 2,
    backgroundColor: colors.surface2,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  fill: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: 'rgba(200,246,61,0.22)', borderRadius: H / 2 },
  labelWrap: { alignItems: 'center', justifyContent: 'center', paddingLeft: KNOB },
  label: { color: colors.muted, fontSize: 16, fontWeight: '600', letterSpacing: 0.3 },
  knob: {
    position: 'absolute',
    left: PAD,
    width: KNOB,
    height: KNOB,
    borderRadius: KNOB / 2,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

