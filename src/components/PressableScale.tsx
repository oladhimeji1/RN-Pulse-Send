import type { ReactNode } from 'react';
import { Pressable, type Insets, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

type Props = {
  onPress?: () => void;
  onLongPress?: () => void;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  wrapStyle?: StyleProp<ViewStyle>;
  scaleTo?: number;
  disabled?: boolean;
  hitSlop?: Insets | number;
};

export function PressableScale({ onPress, onLongPress, children, style, wrapStyle, scaleTo = 0.95, disabled, hitSlop }: Props) {
  const s = useSharedValue(1);
  const a = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return (
    <Pressable
      disabled={disabled}
      hitSlop={hitSlop}
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={() => { s.value = withTiming(scaleTo, { duration: 90 }); }}
      onPressOut={() => { s.value = withSpring(1, { damping: 14, stiffness: 260 }); }}
      style={wrapStyle}
    >
      <Animated.View style={[a, style]}>{children}</Animated.View>
    </Pressable>
  );
}
