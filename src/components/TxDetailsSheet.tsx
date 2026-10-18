import { useState } from 'react';
import {
  Platform,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Tx } from '../lib/data';
import { money } from '../lib/format';
import { light, medium, success } from '../lib/haptics';
import { colors, tabular } from '../lib/theme';
import { Icon } from './Icon';
import { PressableScale } from './PressableScale';

type Props = {
  tx: Tx;
  onClose: () => void;
};

export function TxDetailsSheet({ tx, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const [copiedRef, setCopiedRef] = useState(false);
  const [sharedToast, setSharedToast] = useState(false);

  const positive = tx.amount > 0;
  const dateObj = new Date(tx.date);
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedTime = dateObj.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  const receiptRef = tx.id.toUpperCase();

  const receiptText = [
    '━━━━━━━━━━━━━━━━━━━━━━━━',
    '⚡ PULSEPAY TRANSACTION RECEIPT',
    '━━━━━━━━━━━━━━━━━━━━━━━━',
    `Status: ${tx.pending ? 'Pending Settlement' : 'Successful'}`,
    `Amount: ${money(tx.amount, true)}`,
    `Description: ${tx.title}`,
    `Account: ${tx.subtitle}`,
    `Type: ${positive ? 'Incoming Transfer' : 'Payment / Transfer'}`,
    `Date: ${formattedDate} at ${formattedTime}`,
    `Reference ID: #${receiptRef}`,
    'Network Fee: Free ($0.00)',
    '━━━━━━━━━━━━━━━━━━━━━━━━',
    'Settled instantly via PulsePay',
  ].join('\n');

  const handleShare = async () => {
    try {
      medium();
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && !navigator.share) {
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(receiptText);
          success();
          setSharedToast(true);
          setTimeout(() => setSharedToast(false), 2500);
          return;
        }
      }
      const result = await Share.share({
        title: `PulsePay Receipt - ${tx.title}`,
        message: receiptText,
      });
      if (result.action === Share.sharedAction) {
        success();
      }
    } catch {
      // User dismissed share sheet
    }
  };

  const copyRefId = async () => {
    try {
      light();
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(receiptRef);
      }
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    } catch {
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    }
  };

  return (
    <>
      <Animated.View
        entering={FadeIn.duration(240)}
        exiting={FadeOut.duration(200)}
        style={[StyleSheet.absoluteFill, styles.scrim]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      <Animated.View
        entering={SlideInDown.duration(320).easing(Easing.out(Easing.cubic))}
        exiting={SlideOutDown.duration(240).easing(Easing.in(Easing.cubic))}
        style={[styles.sheet, { paddingBottom: insets.bottom + 18 }]}
      >
        <View style={styles.handle} />

        <PressableScale
          onPress={onClose}
          scaleTo={0.88}
          style={styles.closeBtn}
          hitSlop={12}
        >
          <Icon name="x" size={18} color={colors.muted} />
        </PressableScale>

        {/* Hero Section */}
        <View style={styles.hero}>
          <View style={[styles.avatarTile, { backgroundColor: tx.tint + '24', borderColor: tx.tint + '55' }]}>
            <Icon name={tx.icon} size={32} color={tx.tint} />
          </View>
          <Text style={styles.title}>{tx.title}</Text>
          <Text style={[styles.amount, tabular, positive && { color: colors.success }]}>
            {money(tx.amount, true)}
          </Text>

          <View style={[styles.statusBadge, tx.pending ? styles.statusPending : styles.statusSuccess]}>
            <Icon
              name={tx.pending ? 'download' : 'check'}
              size={13}
              color={tx.pending ? colors.accent : colors.success}
              strokeWidth={2.6}
            />
            <Text style={[styles.statusText, { color: tx.pending ? colors.accent : colors.success }]}>
              {tx.pending ? 'Pending Settlement' : 'Completed • Instant'}
            </Text>
          </View>
        </View>

        {/* Receipt Details Card */}
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Date & Time</Text>
            <Text style={styles.rowValue}>{formattedDate}, {formattedTime}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Payment Method</Text>
            <Text style={styles.rowValue}>{tx.subtitle}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Type</Text>
            <Text style={styles.rowValue}>{positive ? 'Incoming Transfer' : 'Payment / Transfer'}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Network Fee</Text>
            <Text style={[styles.rowValue, { color: colors.accent }]}>Free ($0.00)</Text>
          </View>

          <PressableScale onPress={copyRefId} scaleTo={0.98} style={styles.rowClickable}>
            <Text style={styles.rowLabel}>Reference ID</Text>
            <View style={styles.copyRow}>
              <Text style={[styles.rowValue, tabular, styles.monoRef]}>#{receiptRef}</Text>
              <View style={[styles.copyPill, copiedRef && styles.copyPillActive]}>
                <Icon
                  name={copiedRef ? 'check' : 'copy'}
                  size={12}
                  color={copiedRef ? colors.onAccent : colors.muted}
                />
                <Text style={[styles.copyPillText, copiedRef && styles.copyPillTextActive]}>
                  {copiedRef ? 'Copied' : 'Copy'}
                </Text>
              </View>
            </View>
          </PressableScale>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <PressableScale
            onPress={handleShare}
            wrapStyle={{ alignSelf: 'stretch' }}
            scaleTo={0.97}
            style={styles.shareBtn}
          >
            <Icon name="share" size={20} color={colors.onAccent} strokeWidth={2.4} />
            <Text style={styles.shareBtnText}>
              {sharedToast ? 'Receipt Copied to Clipboard!' : 'Share Receipt'}
            </Text>
          </PressableScale>

          <PressableScale
            onPress={onClose}
            wrapStyle={{ alignSelf: 'stretch', marginTop: 10 }}
            scaleTo={0.98}
            style={styles.doneBtn}
          >
            <Text style={styles.doneBtnText}>Close</Text>
          </PressableScale>
        </View>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  scrim: {
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 22,
    paddingTop: 12,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: colors.border,
  },
  handle: {
    alignSelf: 'center',
    width: 42,
    height: 4.5,
    borderRadius: 3,
    backgroundColor: colors.border,
    marginBottom: 8,
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 4,
  },
  avatarTile: {
    width: 66,
    height: 66,
    borderRadius: 22,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    color: colors.muted,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  amount: {
    color: colors.text,
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -1,
    marginTop: 2,
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusSuccess: {
    backgroundColor: 'rgba(61, 220, 151, 0.14)',
  },
  statusPending: {
    backgroundColor: 'rgba(200, 246, 61, 0.16)',
  },
  statusText: {
    fontSize: 12.5,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  card: {
    backgroundColor: colors.surface2,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginTop: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  rowClickable: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 11,
  },
  rowLabel: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '500',
  },
  rowValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  monoRef: {
    letterSpacing: 0.5,
    fontSize: 13,
  },
  copyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  copyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  copyPillActive: {
    backgroundColor: colors.accent,
  },
  copyPillText: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '700',
  },
  copyPillTextActive: {
    color: colors.onAccent,
  },
  actions: {
    marginTop: 20,
  },
  shareBtn: {
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareBtnText: {
    color: colors.onAccent,
    fontSize: 16.5,
    fontWeight: '800',
  },
  doneBtn: {
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBtnText: {
    color: colors.muted,
    fontSize: 15,
    fontWeight: '700',
  },
});
