import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, FadeIn, FadeOut, LinearTransition, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Recipient } from '../lib/data';
import { money } from '../lib/format';
import { colors, tabular } from '../lib/theme';
import { Avatar } from './Avatar';
import { CheckBadge } from './CheckBadge';
import { Dots } from './Dots';
import { PressableScale } from './PressableScale';
import { ProgressRing } from './ProgressRing';
import { SlideToConfirm } from './SlideToConfirm';

export type Phase = 'idle' | 'confirm' | 'sending' | 'success' | 'requested';

type Props = {
  phase: Exclude<Phase, 'idle'>;
  recipient: Recipient;
  amount: number;
  newBalance: number | null;
  onConfirm: () => void;
  onCancel: () => void;
  onDone: () => void;
};

const content = { entering: FadeIn.duration(240).delay(70), exiting: FadeOut.duration(110) };

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, tabular]}>{value}</Text>
    </View>
  );
}

export function ConfirmSheet({ phase, recipient, amount, newBalance, onConfirm, onCancel, onDone }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <>
      <Animated.View entering={FadeIn.duration(260)} exiting={FadeOut.duration(220)} style={[StyleSheet.absoluteFill, styles.scrim]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={phase === 'confirm' ? onCancel : undefined} />
      </Animated.View>

      <Animated.View
        entering={SlideInDown.duration(340).easing(Easing.out(Easing.cubic))}
        exiting={SlideOutDown.duration(240).easing(Easing.in(Easing.cubic))}
        layout={LinearTransition.duration(300).easing(Easing.out(Easing.cubic))}
        style={[styles.sheet, { paddingBottom: insets.bottom + 18 }]}
      >
        <View style={styles.handle} />

        {phase === 'confirm' && (
          <Animated.View key="confirm" {...content} style={styles.body}>
            <Avatar who={recipient} size={72} />
            <Text style={styles.kicker}>You're sending</Text>
            <Text style={[styles.big, tabular]}>{money(amount)}</Text>
            <Text style={styles.sub}>
              to <Text style={styles.bold}>{recipient.name}</Text>
            </Text>
            <View style={styles.card}>
              <Row label="From" value="Pulse Wallet" />
              <Row label="Fee" value="Free" />
              <Row label="Arrives" value="Instantly" />
            </View>
            <SlideToConfirm label="Slide to send" onConfirm={onConfirm} />
            <Pressable onPress={onCancel} hitSlop={10} style={{ paddingTop: 14 }}>
              <Text style={styles.cancel}>Cancel</Text>
            </Pressable>
          </Animated.View>
        )}

        {phase === 'sending' && (
          <Animated.View key="sending" {...content} style={styles.body}>
            <ProgressRing size={108}>
              <Avatar who={recipient} size={84} />
            </ProgressRing>
            <Text style={[styles.title, { marginTop: 18 }]}>Sending money</Text>
            <View style={{ height: 10 }} />
            <Dots />
            <Text style={[styles.sub, { marginTop: 12 }]}>
              <Text style={styles.bold}>{money(amount)}</Text> to {recipient.first}
            </Text>
          </Animated.View>
        )}

        {phase === 'success' && (
          <Animated.View key="success" {...content} style={styles.body}>
            <CheckBadge />
            <Text style={[styles.title, { marginTop: 16 }]}>Money sent!</Text>
            <Text style={styles.sub}>
              You sent <Text style={styles.bold}>{money(amount)}</Text> to <Text style={styles.bold}>{recipient.name}</Text>
            </Text>
            <View style={[styles.card, { marginTop: 18 }]}>
              <Row label="New balance" value={newBalance === null ? '' : money(newBalance)} />
            </View>
            <PressableScale onPress={onDone} wrapStyle={{ alignSelf: 'stretch' }} style={styles.cta}>
              <Text style={styles.ctaText}>Done</Text>
            </PressableScale>
          </Animated.View>
        )}

        {phase === 'requested' && (
          <Animated.View key="requested" {...content} style={styles.body}>
            <CheckBadge color={colors.accent} />
            <Text style={[styles.title, { marginTop: 16 }]}>Request sent!</Text>
            <Text style={styles.sub}>
              You asked <Text style={styles.bold}>{recipient.name}</Text> for <Text style={styles.bold}>{money(amount)}</Text>
            </Text>
            <View style={[styles.card, { marginTop: 18 }]}>
              <Row label="Status" value="Pending" />
            </View>
            <PressableScale onPress={onDone} wrapStyle={{ alignSelf: 'stretch' }} style={styles.cta}>
              <Text style={styles.ctaText}>Done</Text>
            </PressableScale>
          </Animated.View>
        )}
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  scrim: { backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 22,
    paddingTop: 10,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: colors.border,
  },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, marginBottom: 18 },
  body: { alignItems: 'center' },
  kicker: { color: colors.muted, fontSize: 14, fontWeight: '600', marginTop: 14 },
  big: { color: colors.text, fontSize: 44, fontWeight: '800', letterSpacing: -1, marginTop: 2 },
  title: { color: colors.text, fontSize: 22, fontWeight: '800' },
  sub: { color: colors.muted, fontSize: 15, marginTop: 4, textAlign: 'center' },
  bold: { color: colors.text, fontWeight: '700' },
  card: { alignSelf: 'stretch', backgroundColor: colors.surface2, borderRadius: 18, paddingHorizontal: 16, paddingVertical: 6, marginTop: 18, marginBottom: 18 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  rowLabel: { color: colors.muted, fontSize: 14 },
  rowValue: { color: colors.text, fontSize: 14, fontWeight: '700' },
  cancel: { color: colors.muted, fontSize: 15, fontWeight: '600' },
  cta: { height: 56, borderRadius: 28, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  ctaText: { color: colors.onAccent, fontSize: 17, fontWeight: '800' },
});
