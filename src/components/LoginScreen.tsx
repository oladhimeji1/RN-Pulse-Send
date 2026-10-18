import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { light, medium, success } from '../lib/haptics';
import { useStore } from '../lib/store';
import { colors } from '../lib/theme';
import { Icon } from './Icon';
import { PressableScale } from './PressableScale';
import { PulseLogo } from './PulseLogo';

type Props = {
  onSuccess?: () => void;
};

export function LoginScreen({ onSuccess }: Props) {
  const insets = useSafeAreaInsets();
  const { login } = useStore();

  const [email, setEmail] = useState('abdulrazaq2a@gmail.com');
  const [password, setPassword] = useState('••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScanningBio, setIsScanningBio] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);

  // Biometric scan ring animation
  const bioScan = useSharedValue(1);

  const handleSignIn = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    medium();

    // No validation required! Log in immediately with slight delay for realistic, smooth feel
    setTimeout(() => {
      success();
      login(email || 'oladimeji@pulsepay.io');
      setIsSubmitting(false);
      onSuccess?.();
    }, 400);
  };

  const handleBiometric = () => {
    if (isScanningBio) return;
    setIsScanningBio(true);
    light();

    bioScan.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 300 }),
        withTiming(1, { duration: 300 }),
      ),
      2,
      true,
    );

    setTimeout(() => {
      success();
      login('oladimeji@pulsepay.io');
      setIsScanningBio(false);
      onSuccess?.();
    }, 650);
  };

  const bioAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bioScan.value }],
  }));

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: colors.bg }}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          {
            paddingTop: insets.top + 24,
            paddingBottom: insets.bottom + 28,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Ambient Top Glow */}
        <View style={styles.topGlow} />

        {/* Brand Header */}
        <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
          <View style={styles.badgeRow}>
            <View style={styles.brandBadge}>
              <View style={styles.logoPill}>
                <PulseLogo size={22} color={colors.accent} />
              </View>
              <Text style={styles.brandName}>PulsePay</Text>
            </View>
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>Secured</Text>
            </View>
          </View>

          <Text style={styles.welcomeText}>Welcome back 👋</Text>
          <Text style={styles.subText}>Sign in to access your cards and instant payments</Text>
        </Animated.View>

        {/* Form Inputs Container */}
        <Animated.View entering={FadeInDown.delay(150).duration(500)} style={styles.form}>
          {/* Email / Username Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email or Phone Number</Text>
            <View style={[styles.inputBox, emailFocused && styles.inputBoxFocused]}>
              <View style={styles.inputIcon}>
                <Icon name="mail" size={20} color={emailFocused ? colors.accent : colors.muted} />
              </View>
              <TextInput
                value={email}
                onChangeText={setEmail}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                placeholder="name@pulsepay.io"
                placeholderTextColor={colors.muted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.textInput}
              />
              {email.length > 0 && (
                <Pressable onPress={() => setEmail('')} hitSlop={10} style={styles.clearBtn}>
                  <Icon name="x" size={15} color={colors.muted} />
                </Pressable>
              )}
            </View>
          </View>

          {/* Password / Passcode Input */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.inputLabel}>Passcode</Text>
              <Pressable onPress={() => {}} hitSlop={8}>
                <Text style={styles.forgotLink}>Forgot?</Text>
              </Pressable>
            </View>
            <View style={[styles.inputBox, passFocused && styles.inputBoxFocused]}>
              <View style={styles.inputIcon}>
                <Icon name="lock" size={20} color={passFocused ? colors.accent : colors.muted} />
              </View>
              <TextInput
                value={password}
                onChangeText={setPassword}
                onFocus={() => setPassFocused(true)}
                onBlur={() => setPassFocused(false)}
                placeholder="Enter 6-digit passcode"
                placeholderTextColor={colors.muted}
                secureTextEntry={!showPassword}
                style={styles.textInput}
              />
              <Pressable
                onPress={() => {
                  light();
                  setShowPassword((prev) => !prev);
                }}
                hitSlop={10}
                style={styles.eyeBtn}
              >
                <Icon
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={19}
                  color={colors.muted}
                />
              </Pressable>
            </View>
          </View>

          {/* Remember Me Option */}
          <View style={styles.rememberRow}>
            <View style={styles.rememberWrap}>
              <Switch
                value={rememberMe}
                onValueChange={(val) => {
                  light();
                  setRememberMe(val);
                }}
                trackColor={{ false: colors.surface2, true: colors.accent }}
                thumbColor={rememberMe ? colors.onAccent : '#fff'}
                ios_backgroundColor={colors.surface2}
                style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
              />
              <Text style={styles.rememberText}>Remember me</Text>
            </View>
            <Text style={styles.securityHint}>Bank-grade biometric</Text>
          </View>

          {/* Primary Sign In Button (NO VALIDATION) */}
          <PressableScale
            onPress={handleSignIn}
            scaleTo={0.97}
            style={[styles.primaryBtn, isSubmitting && styles.primaryBtnDisabled]}
          >
            <Text style={styles.primaryBtnText}>
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </Text>
            <Icon
              name="arrow-right"
              size={20}
              color={colors.onAccent}
              strokeWidth={2.4}
            />
          </PressableScale>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Biometric 1-Tap Sign In Button */}
          <PressableScale
            onPress={handleBiometric}
            scaleTo={0.96}
            style={styles.bioBtn}
          >
            <Animated.View style={bioAnimStyle}>
              <Icon name="face-id" size={24} color={colors.accent} strokeWidth={2.2} />
            </Animated.View>
            <Text style={styles.bioBtnText}>
              {isScanningBio ? 'Scanning Face ID...' : '1-Tap Sign In with Face ID'}
            </Text>
          </PressableScale>
        </Animated.View>

        {/* Security & Support Footer */}
        <Animated.View entering={FadeInUp.delay(300).duration(500)} style={styles.footer}>
          <View style={styles.shieldRow}>
            <Icon name="lock" size={13} color={colors.muted} />
            <Text style={styles.footerText}>256-bit End-to-End Encryption • Zero Liability</Text>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 22,
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  topGlow: {
    position: 'absolute',
    top: -100,
    alignSelf: 'center',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(200, 246, 61, 0.08)',
  },
  header: {
    marginBottom: 28,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoPill: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: 'rgba(200, 246, 61, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
  },
  liveText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  welcomeText: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  subText: {
    color: colors.muted,
    fontSize: 15,
    marginTop: 8,
    lineHeight: 22,
  },
  form: {
    gap: 18,
  },
  inputGroup: {
    gap: 8,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  forgotLink: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '700',
  },
  inputBox: {
    height: 56,
    borderRadius: 18,
    backgroundColor: colors.surface2,
    borderWidth: 1.5,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  inputBoxFocused: {
    borderColor: colors.accent,
    backgroundColor: colors.surface,
  },
  inputIcon: {
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    height: '100%',
  },
  clearBtn: {
    padding: 6,
  },
  eyeBtn: {
    padding: 6,
  },
  rememberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: -2,
    marginBottom: 6,
  },
  rememberWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rememberText: {
    color: colors.muted,
    fontSize: 13.5,
    fontWeight: '600',
  },
  securityHint: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '500',
  },
  primaryBtn: {
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 6,
  },
  primaryBtnDisabled: {
    opacity: 0.7,
  },
  primaryBtnText: {
    color: colors.onAccent,
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  dividerText: {
    color: colors.muted,
    fontSize: 12.5,
    fontWeight: '600',
  },
  bioBtn: {
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  bioBtnText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  footer: {
    alignItems: 'center',
    marginTop: 24,
  },
  shieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '500',
  },
});
