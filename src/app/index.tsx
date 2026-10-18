import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AnimatedBalance } from "../components/AnimatedBalance";
import { Avatar } from "../components/Avatar";
import { CardCarousel } from "../components/CardCarousel";
import { Icon } from "../components/Icon";
import { LoginScreen } from "../components/LoginScreen";
import { PressableScale } from "../components/PressableScale";
import { SplashScreen } from "../components/SplashScreen";
import { TxDetailsSheet } from "../components/TxDetailsSheet";
import { TxRow } from "../components/TxRow";
import { UndoToast } from "../components/UndoToast";
import type { Tx } from "../lib/data";
import { greeting } from "../lib/format";
import { light, success } from "../lib/haptics";
import { useStore } from "../lib/store";
import { colors } from "../lib/theme";

const me = { initials: "O", grad: ["#C8F63D", "#3DDC97"] as [string, string] };

export default function Home() {
  const insets = useSafeAreaInsets();
  const {
    isAuthenticated,
    user,
    logout,
    balance,
    txs,
    undo,
    undoSend,
    topUp,
    reset,
  } = useStore();
  const [splashFinished, setSplashFinished] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Tx | null>(null);
  const [showAll, setShowAll] = useState(false);

  // 1. Initial Splash Screen transition
  if (!isAuthenticated && !splashFinished) {
    return <SplashScreen onFinish={() => setSplashFinished(true)} />;
  }

  // 2. Login Page (no validation)
  if (!isAuthenticated) {
    return (
      <Animated.View entering={FadeIn.duration(360)} style={{ flex: 1 }}>
        <LoginScreen />
      </Animated.View>
    );
  }

  const displayedTxs = showAll ? txs : txs.slice(0, 8);

  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      style={{ flex: 1, backgroundColor: colors.bg }}
    >
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingBottom: insets.bottom + 120,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <PressableScale
            onLongPress={() => {
              success();
              reset();
            }}
            scaleTo={0.92}
            style={styles.who}
          >
            <Avatar who={me} size={44} />
            <View>
              <Text style={styles.hi}>{greeting()}</Text>
              <Text style={styles.name}>{user.name || "Oladimeji"}</Text>
            </View>
          </PressableScale>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <PressableScale
              onPress={() => {
                light();
                logout();
              }}
              scaleTo={0.9}
              style={styles.bell}
            >
              <Icon name="log-out" size={19} color={colors.muted} />
            </PressableScale>

            <PressableScale scaleTo={0.9} style={styles.bell}>
              <Icon name="bell" size={20} color={colors.text} />
              <View style={styles.dot} />
            </PressableScale>
          </View>
        </View>

        <View style={styles.balanceBlock}>
          <Text style={styles.label}>Available balance</Text>
          <AnimatedBalance value={balance} />
          <View style={styles.actions}>
            <PressableScale
              onPress={() => {
                light();
                topUp(250);
              }}
              style={[styles.btn, { backgroundColor: colors.accent }]}
              wrapStyle={{ flex: 1 }}
            >
              <Icon
                name="plus"
                size={20}
                color={colors.onAccent}
                strokeWidth={2.4}
              />
              <Text style={[styles.btnText, { color: colors.onAccent }]}>
                Add $250
              </Text>
            </PressableScale>
            <PressableScale
              onPress={() => {
                light();
                router.push("/send");
              }}
              style={[
                styles.btn,
                {
                  backgroundColor: colors.surface2,
                  borderWidth: 1,
                  borderColor: colors.border,
                },
              ]}
              wrapStyle={{ flex: 1 }}
            >
              <Icon name="send" size={19} color={colors.text} />
              <Text style={[styles.btnText, { color: colors.text }]}>
                Send / Request
              </Text>
            </PressableScale>
          </View>
        </View>

        <CardCarousel />

        <View style={styles.sectionHead}>
          <Text style={styles.section}>Activity</Text>
          {txs.length > 8 && (
            <PressableScale
              onPress={() => {
                light();
                setShowAll((prev) => !prev);
              }}
              scaleTo={0.92}
            >
              <Text style={styles.link}>
                {showAll ? "Show less" : "See all"}
              </Text>
            </PressableScale>
          )}
        </View>
        <View style={{ paddingHorizontal: 20 }}>
          {displayedTxs.map((t) => (
            <TxRow key={t.id} tx={t} onPress={setSelectedTx} />
          ))}
        </View>
      </ScrollView>

      {undo && <UndoToast undo={undo} onUndo={undoSend} />}

      {selectedTx && (
        <TxDetailsSheet tx={selectedTx} onClose={() => setSelectedTx(null)} />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  who: { flexDirection: "row", alignItems: "center", gap: 12 },
  hi: { color: colors.muted, fontSize: 13, fontWeight: "600" },
  name: { color: colors.text, fontSize: 18, fontWeight: "800", marginTop: 1 },
  bell: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface2,
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    position: "absolute",
    top: 11,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
    borderWidth: 2,
    borderColor: colors.surface2,
  },
  balanceBlock: { paddingHorizontal: 20, paddingTop: 28, paddingBottom: 26 },
  label: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  actions: { flexDirection: "row", gap: 12, marginTop: 20 },
  btn: {
    height: 52,
    borderRadius: 26,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  btnText: { fontSize: 15, fontWeight: "800" },
  sectionHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 30,
    marginBottom: 6,
  },
  section: { color: colors.text, fontSize: 20, fontWeight: "800" },
  link: { color: colors.accent, fontSize: 14, fontWeight: "700" },
});
