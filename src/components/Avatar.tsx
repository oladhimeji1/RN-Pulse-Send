import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import type { Recipient } from '../lib/data';

type Props = { who: Pick<Recipient, 'initials' | 'grad'>; size?: number };

export function Avatar({ who, size = 56 }: Props) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, overflow: 'hidden' }}>
      <LinearGradient colors={who.grad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      <View style={styles.center}>
        <Text style={{ color: '#0A0B10', fontWeight: '800', fontSize: size * 0.34, letterSpacing: 0.5 }}>{who.initials}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({ center: { flex: 1, alignItems: 'center', justifyContent: 'center' } });
