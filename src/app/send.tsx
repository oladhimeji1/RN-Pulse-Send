import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AmountDisplay } from '../components/AmountDisplay';
import { Avatar } from '../components/Avatar';
import { ConfirmSheet, type Phase } from '../components/ConfirmSheet';
import { Icon } from '../components/Icon';
import { Keypad, type Key } from '../components/Keypad';
import { PressableScale } from '../components/PressableScale';
import { recipients } from '../lib/data';
import { money } from '../lib/format';
import { light, success, tick, warn } from '../lib/haptics';
import { useStore } from '../lib/store';
import { colors } from '../lib/theme';

type Mode = 'send' | 'request';
const QUICK = [25, 50, 100, 250, 500];

function Segmented({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  const [w, setW] = useState(0);
  const x = useSharedValue(0);
  const seg = Math.max(0, (w - 8) / 2);
  useEffect(() => {
    x.value = withSpring(mode === 'send' ? 0 : seg, { damping: 18, stiffness: 240 });
  }, [mode, seg, x]);
  const pill = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  return (
    <View style={styles.seg} onLayout={(e) => setW(e.nativeEvent.layout.width)}>
      <Animated.View style={[styles.pill, { width: seg }, pill]} />
      {(['send', 'request'] as const).map((m) => (
        <PressableScale
          key={m}
          wrapStyle={{ flex: 1 }}
          scaleTo={0.97}
          style={styles.segBtn}
          onPress={() => {
            tick();
            onChange(m);
          }}
        >
          <Text style={[styles.segText, mode === m && { color: colors.onAccent }]}>{m === 'send' ? 'Send' : 'Request'}</Text>
        </PressableScale>
      ))}
    </View>
  );
}

function RecipientItem({ r, selected, onPress }: { r: (typeof recipients)[number]; selected: boolean; onPress: () => void }) {
  const v = useSharedValue(selected ? 1 : 0);
  useEffect(() => {
    v.value = withTiming(selected ? 1 : 0, { duration: 220 });
  }, [selected, v]);
  const ring = useAnimatedStyle(() => ({ opacity: v.value, transform: [{ scale: 0.86 + v.value * 0.14 }] }));
  const wrap = useAnimatedStyle(() => ({ transform: [{ scale: 0.94 + v.value * 0.06 }] }));
  return (
    <PressableScale onPress={onPress} scaleTo={0.92}>
      <Animated.View style={[{ alignItems: 'center', width: 72 }, wrap]}>
        <View style={{ width: 70, height: 70, alignItems: 'center', justifyContent: 'center' }}>
          <Animated.View style={[styles.ring, ring]} />
          <Avatar who={r} size={56} />
        </View>
        <Text style={[styles.rName, selected && { color: colors.text, fontWeight: '800' }]}>{r.first}</Text>
      </Animated.View>
    </PressableScale>
  );
}

export default function SendScreen() {
  const insets = useSafeAreaInsets();
  const { balance, send, request, offerUndo } = useStore();
  const [mode, setMode] = useState<Mode>('send');
  const [rid, setRid] = useState(recipients[3].id);
  const [raw, setRaw] = useState('0');
  const [phase, setPhase] = useState<Phase>('idle');
  const [shake, setShake] = useState(0);
  const [result, setResult] = useState<{ txId: string; newBalance: number } | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const later = (fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  };

  const recipient = recipients.find((r) => r.id === rid) ?? recipients[0];
  const amount = parseFloat(raw) || 0;
  const over = mode === 'send' && amount > balance;
  const canGo = amount > 0 && !over;

  const onKey = (k: Key) => {
    setRaw((r) => {
      if (k === 'del') return r.length <= 1 ? '0' : r.slice(0, -1);
      if (k === '.') return r.includes('.') ? r : r + '.';
      if (r === '0') return k;
      const [i, d] = r.split('.');
      if (d !== undefined) return d.length >= 2 ? r : r + k;
      return i.length >= 6 ? r : r + k;
    });
  };

  const onCta = () => {
    if (!canGo) {
      warn();
      if (over) setShake((s) => s + 1);
      return;
    }
    light();
    if (mode === 'send') {
      setPhase('confirm');
    } else {
      setPhase('sending');
      later(() => {
        request(recipient, amount);
        success();
        setPhase('requested');
      }, 1500);
    }
  };

  const onConfirm = () => {
    setPhase('sending');
    later(() => {
      const r = send(recipient, amount);
      setResult(r);
      success();
      setPhase('success');
    }, 2000);
  };

  const onDone = () => {
    const wasSend = phase === 'success' && result;
    setPhase('idle');
    later(() => {
      if (wasSend && result) offerUndo(result.txId);
      router.back();
    }, 200);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top + 8 }}>
      <View style={styles.header}>
        <PressableScale onPress={() => router.back()} scaleTo={0.9} style={styles.back}>
          <Icon name="chevron-left" size={22} color={colors.text} />
        </PressableScale>
        <View style={{ flex: 1 }}>
          <Segmented mode={mode} onChange={setMode} />
        </View>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, marginTop: 20 }} contentContainerStyle={{ paddingHorizontal: 16, gap: 4 }}>
        {recipients.map((r) => (
          <RecipientItem
            key={r.id}
            r={r}
            selected={r.id === rid}
            onPress={() => {
              tick();
              setRid(r.id);
            }}
          />
        ))}
      </ScrollView>

      <View style={styles.amountArea}>
        <AmountDisplay raw={raw} shake={shake} danger={over} />
        <Text style={[styles.hint, over && { color: colors.danger }]}>
          {over ? 'More than your balance' : mode === 'send' ? `Balance ${money(balance)}` : `Request from ${recipient.first}`}
        </Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}>
        {QUICK.map((q) => (
          <PressableScale
            key={q}
            scaleTo={0.92}
            style={styles.chip}
            onPress={() => {
              tick();
              setRaw(String(q));
            }}
          >
            <Text style={styles.chipText}>${q}</Text>
          </PressableScale>
        ))}
      </ScrollView>

      <View style={{ paddingHorizontal: 20, paddingTop: 10 }}>
        <Keypad onKey={onKey} />
      </View>

      <View style={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: insets.bottom + 12 }}>
        <PressableScale onPress={onCta} scaleTo={0.97} style={[styles.cta, !canGo && styles.ctaOff]}>
          <Text style={[styles.ctaText, !canGo && { color: colors.muted }]}>{mode === 'send' ? 'Review transfer' : 'Send request'}</Text>
          <Icon name="arrow-right" size={20} color={canGo ? colors.onAccent : colors.muted} strokeWidth={2.4} />
        </PressableScale>
      </View>

      {phase !== 'idle' && (
        <ConfirmSheet
          phase={phase}
          recipient={recipient}
          amount={amount}
          newBalance={result?.newBalance ?? null}
          onConfirm={onConfirm}
          onCancel={() => setPhase('idle')}
          onDone={onDone}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 12 },
  back: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center' },
  seg: { height: 44, borderRadius: 22, backgroundColor: colors.surface2, padding: 4, flexDirection: 'row' },
  pill: { position: 'absolute', left: 4, top: 4, bottom: 4, borderRadius: 18, backgroundColor: colors.accent },
  segBtn: { height: 36, alignItems: 'center', justifyContent: 'center' },
  segText: { color: colors.muted, fontWeight: '800', fontSize: 14 },
  ring: { position: 'absolute', width: 70, height: 70, borderRadius: 35, borderWidth: 2.5, borderColor: colors.accent },
  rName: { color: colors.muted, fontSize: 12.5, fontWeight: '600', marginTop: 4 },
  amountArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  hint: { color: colors.muted, fontSize: 14, fontWeight: '600', marginTop: 14 },
  chip: { paddingHorizontal: 16, height: 36, borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  chipText: { color: colors.text, fontSize: 14, fontWeight: '700' },
  cta: { height: 58, borderRadius: 29, backgroundColor: colors.accent, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center' },
  ctaOff: { backgroundColor: colors.surface2 },
  ctaText: { color: colors.onAccent, fontSize: 17, fontWeight: '800' },
});
