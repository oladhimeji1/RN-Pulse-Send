import { Text, View } from 'react-native';
import { tick } from '../lib/haptics';
import { colors } from '../lib/theme';
import { Icon } from './Icon';
import { PressableScale } from './PressableScale';

export type Key = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '.' | 'del';

const rows: Key[][] = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['.', '0', 'del'],
];

export function Keypad({ onKey }: { onKey: (k: Key) => void }) {
  return (
    <View style={{ gap: 4 }}>
      {rows.map((row, i) => (
        <View key={i} style={{ flexDirection: 'row' }}>
          {row.map((k) => (
            <PressableScale
              key={k}
              wrapStyle={{ flex: 1 }}
              scaleTo={0.86}
              style={{ height: 58, alignItems: 'center', justifyContent: 'center', borderRadius: 29 }}
              onPress={() => {
                tick();
                onKey(k);
              }}
            >
              {k === 'del' ? (
                <Icon name="backspace" size={26} color={colors.text} strokeWidth={1.8} />
              ) : (
                <Text style={{ color: colors.text, fontSize: 30, fontWeight: '600' }}>{k}</Text>
              )}
            </PressableScale>
          ))}
        </View>
      ))}
    </View>
  );
}
