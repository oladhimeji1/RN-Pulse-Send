import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, { interpolate, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { cards, type CardDef } from '../lib/data';
import { money } from '../lib/format';
import { colors, tabular } from '../lib/theme';

const GAP = 14;
const SIDE = 20;

function Card({ card, width }: { card: CardDef; width: number }) {
  const height = width * 0.6;
  return (
    <View style={{ width, height, borderRadius: 26, overflow: 'hidden' }}>
      <LinearGradient colors={card.grad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      <LinearGradient
        colors={['rgba(255,255,255,0.22)', 'rgba(255,255,255,0)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.7, y: 0.7 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.ring, { width: width * 0.9, height: width * 0.9, borderRadius: width * 0.45, right: -width * 0.3, top: -width * 0.35 }]} />
      <View style={[styles.ring, { width: width * 0.6, height: width * 0.6, borderRadius: width * 0.3, right: -width * 0.12, top: -width * 0.2 }]} />
      <View style={styles.cardInner}>
        <View style={styles.cardTop}>
          <Text style={styles.cardName}>{card.name}</Text>
          <View style={styles.mark}><Text style={styles.markText}>P</Text></View>
        </View>
        <View>
          <Text style={styles.avail}>Available</Text>
          <Text style={[styles.cardBal, tabular]}>{money(card.balance)}</Text>
          <Text style={styles.last4}>•••• •••• •••• {card.last4}</Text>
        </View>
      </View>
    </View>
  );
}

function Pip({ index, x, snap }: { index: number; x: { value: number }; snap: number }) {
  const s = useAnimatedStyle(() => {
    const r = [(index - 1) * snap, index * snap, (index + 1) * snap];
    return {
      width: interpolate(x.value, r, [6, 22, 6], 'clamp'),
      opacity: interpolate(x.value, r, [0.35, 1, 0.35], 'clamp'),
    };
  });
  return <Animated.View style={[{ height: 6, borderRadius: 3, backgroundColor: colors.accent }, s]} />;
}

export function CardCarousel() {
  const { width: screen } = useWindowDimensions();
  const cardW = screen - SIDE * 2 - 28;
  const snap = cardW + GAP;
  const x = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    x.value = e.contentOffset.x;
  });

  return (
    <View>
      <Animated.ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={snap}
        decelerationRate="fast"
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingHorizontal: SIDE, gap: GAP }}
      >
        {cards.map((c) => (
          <Card key={c.id} card={c} width={cardW} />
        ))}
      </Animated.ScrollView>
      <View style={styles.pips}>
        {cards.map((c, i) => (
          <Pip key={c.id} index={i} x={x} snap={snap} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ring: { position: 'absolute', borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)' },
  cardInner: { flex: 1, padding: 20, justifyContent: 'space-between' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardName: { color: 'rgba(255,255,255,0.9)', fontSize: 14, fontWeight: '700', letterSpacing: 0.4 },
  mark: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center' },
  markText: { color: '#0A0B10', fontWeight: '900', fontSize: 14 },
  avail: { color: 'rgba(255,255,255,0.65)', fontSize: 12, fontWeight: '600' },
  cardBal: { color: '#fff', fontSize: 30, fontWeight: '800', letterSpacing: -0.8, marginTop: 2 },
  last4: { color: 'rgba(255,255,255,0.7)', fontSize: 12.5, marginTop: 8, letterSpacing: 1.2 },
  pips: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 14 },
});
