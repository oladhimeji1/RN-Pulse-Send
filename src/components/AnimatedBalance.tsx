import { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { groupInt, splitMoney } from '../lib/format';
import { colors, tabular } from '../lib/theme';

type Props = { value: number; size?: number };

/** Counts smoothly to the new value whenever it changes. */
export function AnimatedBalance({ value, size = 44 }: Props) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);

  useEffect(() => {
    const a = from.current;
    const b = value;
    if (a === b) return;
    const start = Date.now();
    const dur = 750;
    let raf = 0;
    const tick = () => {
      const t = Math.min(1, (Date.now() - start) / dur);
      const e = 1 - Math.pow(1 - t, 3);
      const v = t >= 1 ? b : a + (b - a) * e;
      from.current = v;
      setShown(v);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  const { int, dec } = splitMoney(shown);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
      <Text style={[{ color: colors.muted, fontSize: size * 0.5, fontWeight: '600', marginTop: size * 0.12, marginRight: 2 }, tabular]}>$</Text>
      <Text style={[{ color: colors.text, fontSize: size, fontWeight: '800', letterSpacing: -1.5 }, tabular]}>{groupInt(int)}</Text>
      <Text style={[{ color: colors.muted, fontSize: size * 0.45, fontWeight: '700', marginTop: size * 0.14 }, tabular]}>.{dec}</Text>
    </View>
  );
}
