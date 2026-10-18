import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, FadeIn, FadeOut, SlideInDown, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { money } from '../lib/format';
import { tick } from '../lib/haptics';
import { colors } from '../lib/theme';
import { UNDO_DURATION, type Undo } from '../lib/store';
import { Icon } from './Icon';
import { PressableScale } from './PressableScale';

type Props = { undo: NonNullable<Undo>; onUndo: () => void };

export function UndoToast({ undo, onUndo }: Props) {
  const insets = useSafeAreaInsets();
  const p = useSharedValue(1);

  useEffect(() => {
    p.value = 1;
    p.value = withTiming(0, { duration: UNDO_DURATION, easing: Easing.linear });
  }, [undo.txId, p]);

  const bar = useAnimatedStyle(() => ({ width: `${p.value * 100}%` }));

  return (
    <Animated.View
      key={undo.txId}
      entering={SlideInDown.duration(360).easing(Easing.out(Easing.back(1.4)))}
      exiting={FadeOut.duration(200)}
      style={[styles.wrap, { bottom: insets.bottom + 16 }]}
    >
      <View style={styles.inner}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{money(undo.amount)} sent</Text>
          <Text style={styles.sub} numberOfLines={1}>to {undo.name}</Text>
        </View>
        <PressableScale
          onPress={() => {
            tick();
            onUndo();
          }}
          style={styles.btn}
        >
          <Icon name="undo" size={16} color={colors.onAccent} strokeWidth={2.4} />
          <Text style={styles.btnText}>Undo</Text>
        </PressableScale>
      </View>
      <Animated.View entering={FadeIn} style={styles.barTrack}>
        <Animated.View style={[styles.bar, bar]} />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    backgroundColor: colors.surface2,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  inner: { flexDirection: 'row', alignItems: 'center', padding: 14, paddingLeft: 18 },
  title: { color: colors.text, fontSize: 15, fontWeight: '800' },
  sub: { color: colors.muted, fontSize: 12.5, marginTop: 2 },
  btn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.accent, paddingHorizontal: 16, height: 40, borderRadius: 20 },
  btnText: { color: colors.onAccent, fontWeight: '800', fontSize: 14 },
  barTrack: { height: 3, backgroundColor: 'transparent' },
  bar: { height: 3, backgroundColor: colors.accent },
});
