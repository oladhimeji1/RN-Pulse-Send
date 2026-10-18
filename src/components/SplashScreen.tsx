import { useEffect, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { light } from "../lib/haptics";
import { colors } from "../lib/theme";
import { PulseLogo } from "./PulseLogo";

type Props = {
  onFinish: () => void;
  duration?: number;
};

export function SplashScreen({ onFinish, duration = 20000 }: Props) {
  const { width: winW, height: winH } = useWindowDimensions();
  const [exiting, setExiting] = useState(false);

  // Flight progress: 0 to 1
  const flight = useSharedValue(0);

  // Logo & Content values
  const logoScale = useSharedValue(0.7);
  const logoOpacity = useSharedValue(0);
  const pulseAura = useSharedValue(0.9);
  const textTranslate = useSharedValue(24);
  const textOpacity = useSharedValue(0);
  const progressLine = useSharedValue(0);
  const exitScale = useSharedValue(1);
  const exitOpacity = useSharedValue(1);

  useEffect(() => {
    // 1. Center logo entrance
    logoScale.value = withSpring(1, { damping: 13, stiffness: 130 });
    logoOpacity.value = withTiming(1, { duration: 450 });

    // 2. Center logo pulsing aura
    pulseAura.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 950, easing: Easing.out(Easing.cubic) }),
        withTiming(1.0, { duration: 950, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      true,
    );

    // 3. The Flying Kite trajectory (swoop from bottom-left, around the screen, out at the top)
    flight.value = withTiming(1, {
      duration: duration - 300,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1.0),
    });

    // 4. Catchy write-up staggered reveal
    textTranslate.value = withDelay(
      350,
      withTiming(0, { duration: 700, easing: Easing.out(Easing.cubic) }),
    );
    textOpacity.value = withDelay(350, withTiming(1, { duration: 700 }));

    // 5. Bottom line progress
    progressLine.value = withTiming(1, { duration, easing: Easing.linear });

    // 6. Automatic transition when flight completes
    const t = setTimeout(() => {
      triggerExit();
    }, duration);

    return () => clearTimeout(t);
  }, [duration]);

  const triggerExit = () => {
    if (exiting) return;
    setExiting(true);
    light();
    exitScale.value = withTiming(1.06, {
      duration: 380,
      easing: Easing.inOut(Easing.cubic),
    });
    exitOpacity.value = withTiming(0, {
      duration: 340,
      easing: Easing.in(Easing.cubic),
    });
    setTimeout(() => {
      onFinish();
    }, 360);
  };

  // Trajectory keyframes for flight (starts bottom-left, loops round the screen, exits out top)
  const keyTimes = [0, 0.16, 0.36, 0.56, 0.73, 0.86, 1.0];
  const posX = [
    -80,
    winW * 0.12,
    winW * 0.52,
    winW * 0.84,
    winW * 0.5,
    winW * 0.26,
    winW * 0.5,
  ];
  const posY = [
    winH * 0.9,
    winH * 0.48,
    winH * 0.15,
    winH * 0.45,
    winH * 0.72,
    winH * 0.36,
    -140,
  ];
  const rotDeg = [-70, -50, 15, 85, 165, 245, 270]; // Monotonic rotation to keep arrow nose forward
  const scales = [0.65, 0.85, 1.05, 1.15, 0.95, 1.25, 1.5];

  // Animated style for the lead kite
  const kiteStyle = useAnimatedStyle(() => {
    const x = interpolate(flight.value, keyTimes, posX);
    const y = interpolate(flight.value, keyTimes, posY);
    const r = interpolate(flight.value, keyTimes, rotDeg);
    const s = interpolate(flight.value, keyTimes, scales);
    const op = interpolate(flight.value, [0, 0.05, 0.92, 1], [0, 1, 1, 0]);

    return {
      transform: [
        { translateX: x },
        { translateY: y },
        { rotate: `${r}deg` },
        { scale: s },
      ],
      opacity: op,
    };
  });

  // Animated styles for trailing sparks / wake
  const makeTrailStyle = (offset: number, size: number, opacityMax: number) => {
    return useAnimatedStyle(() => {
      const p = Math.max(0, flight.value - offset);
      const x = interpolate(p, keyTimes, posX);
      const y = interpolate(p, keyTimes, posY);
      const op = interpolate(
        flight.value,
        [0, 0.06, 0.92, 1],
        [0, opacityMax, opacityMax, 0],
      );

      return {
        width: size,
        height: size,
        borderRadius: size / 2,
        transform: [{ translateX: x + 16 }, { translateY: y + 16 }],
        opacity: op,
      };
    });
  };

  const trail1 = makeTrailStyle(0.025, 12, 0.7);
  const trail2 = makeTrailStyle(0.05, 9, 0.5);
  const trail3 = makeTrailStyle(0.075, 6, 0.35);

  const centerLogoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAura.value }],
    opacity: interpolate(pulseAura.value, [1, 1.3], [0.55, 0]),
  }));

  const textStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: textTranslate.value }],
    opacity: textOpacity.value,
  }));

  const exitStyle = useAnimatedStyle(() => ({
    transform: [{ scale: exitScale.value }],
    opacity: exitOpacity.value,
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressLine.value * 100}%`,
  }));

  return (
    <Pressable style={StyleSheet.absoluteFill} onPress={triggerExit}>
      <Animated.View
        style={[StyleSheet.absoluteFill, styles.container, exitStyle]}
      >
        {/* Ambient atmospheric glows */}
        <View style={styles.topGlow} />
        <View style={styles.bottomGlow} />

        {/* Trailing Wake Particle Sparks */}
        <Animated.View
          style={[styles.trailDot, { backgroundColor: colors.accent }, trail1]}
        />
        <Animated.View
          style={[styles.trailDot, { backgroundColor: "#3DDC97" }, trail2]}
        />
        <Animated.View
          style={[styles.trailDot, { backgroundColor: "#4FD1FF" }, trail3]}
        />

        {/* Flying Kite (Supersonic Arrow Logo) */}
        <Animated.View style={[styles.kiteWrap, kiteStyle]}>
          <View style={styles.kiteGlow}>
            <PulseLogo
              size={54}
              color={colors.accent}
              gradientColors={["#C8F63D", "#3DDC97"]}
            />
          </View>
        </Animated.View>

        {/* Center Brand & Catchy Write-Up */}
        <View style={styles.center}>
          {/* Pulsing Aura */}
          <Animated.View style={[styles.ringAura, ringStyle]} />

          {/* Central Hero Logo Card */}
          <Animated.View style={[styles.logoCard, centerLogoStyle]}>
            <PulseLogo
              size={58}
              color={colors.accent}
              gradientColors={["#C8F63D", "#3DDC97"]}
            />
          </Animated.View>

          {/* Catchy Write-Up Hero */}
          <Animated.View style={[styles.copyWrap, textStyle]}>
            {/* <View style={styles.kickerPill}>
              <View style={styles.kickerDot} />
              <Text style={styles.kickerText}>VELOCITY PROTOCOL</Text>
            </View> */}

            <View style={styles.brandRow}>
              <Text style={styles.brandText}>PULSE</Text>
              <Text style={[styles.brandText, { color: colors.accent }]}>
                PAY
              </Text>
            </View>

            {/* Catchy Main Headline */}
            <Text style={styles.headline}>Money at the Speed of Flight.</Text>

            {/* Catchy Subtitle */}
            <Text style={styles.subtitle}>
              Instant settlement · Borderless transfers · Total freedom
            </Text>
          </Animated.View>
        </View>

        {/* Footer Progress Indicator */}
        <Animated.View
          entering={FadeIn.delay(500).duration(500)}
          exiting={FadeOut}
          style={styles.footer}
        >
          <View style={styles.progressBarBg}>
            <Animated.View style={[styles.progressBarFill, progressStyle]} />
          </View>
          <Text style={styles.footerHint}>Tap anywhere to skip</Text>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
    overflow: "hidden",
  },
  topGlow: {
    position: "absolute",
    top: -140,
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: "rgba(200, 246, 61, 0.12)",
  },
  bottomGlow: {
    position: "absolute",
    bottom: -120,
    width: 380,
    height: 380,
    borderRadius: 190,
    backgroundColor: "rgba(124, 92, 255, 0.14)",
  },
  kiteWrap: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 60,
    height: 60,
    zIndex: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  kiteGlow: {
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.85,
    shadowRadius: 18,
    elevation: 12,
  },
  trailDot: {
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 15,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 10,
    elevation: 8,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  ringAura: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: colors.accent,
    top: -24,
  },
  logoCard: {
    width: 96,
    height: 96,
    borderRadius: 30,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: "rgba(200, 246, 61, 0.4)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 28,
    elevation: 10,
    marginBottom: 26,
  },
  copyWrap: {
    alignItems: "center",
  },
  kickerPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 13,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: "rgba(200, 246, 61, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(200, 246, 61, 0.25)",
    marginBottom: 14,
  },
  kickerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
  kickerText: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  brandText: {
    color: colors.text,
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: 3.5,
  },
  headline: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: -0.4,
    lineHeight: 28,
    marginBottom: 8,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 13.5,
    fontWeight: "600",
    textAlign: "center",
    letterSpacing: 0.3,
    lineHeight: 20,
    maxWidth: 290,
  },
  footer: {
    position: "absolute",
    bottom: 48,
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 48,
  },
  progressBarBg: {
    width: 140,
    height: 3.5,
    borderRadius: 2,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: colors.accent,
    borderRadius: 2,
  },
  footerHint: {
    color: "rgba(138, 143, 158, 0.6)",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.4,
    marginTop: 14,
  },
});
