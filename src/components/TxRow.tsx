import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';
import type { Tx } from '../lib/data';
import { money, whenLabel } from '../lib/format';
import { light } from '../lib/haptics';
import { colors, tabular } from '../lib/theme';
import { Icon } from './Icon';
import { PressableScale } from './PressableScale';

type Props = {
  tx: Tx;
  onPress?: (tx: Tx) => void;
};

export function TxRow({ tx, onPress }: Props) {
  const positive = tx.amount > 0;
  return (
    <PressableScale
      onPress={() => {
        if (onPress) {
          light();
          onPress(tx);
        }
      }}
      scaleTo={0.97}
    >
      <Animated.View
        entering={FadeInDown.duration(420).springify().damping(16)}
        layout={LinearTransition.springify().damping(18)}
        style={styles.row}
      >
        <View style={[styles.tile, { backgroundColor: tx.tint + '26' }]}>
          <Icon name={tx.icon} size={21} color={tx.tint} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title} numberOfLines={1}>{tx.title}</Text>
          <Text style={styles.sub} numberOfLines={1}>{whenLabel(tx.date)} · {tx.subtitle}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={[styles.amount, tabular, positive && { color: colors.success }]}>{money(tx.amount, true)}</Text>
          {tx.pending && (
            <View style={styles.pill}>
              <Text style={styles.pillText}>Pending</Text>
            </View>
          )}
        </View>
      </Animated.View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 10 },
  tile: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  title: { color: colors.text, fontSize: 16, fontWeight: '700' },
  sub: { color: colors.muted, fontSize: 12.5, marginTop: 3 },
  amount: { color: colors.text, fontSize: 16, fontWeight: '700' },
  pill: { marginTop: 4, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, backgroundColor: 'rgba(200,246,61,0.16)' },
  pillText: { color: colors.accent, fontSize: 10.5, fontWeight: '800', letterSpacing: 0.4 },
});
