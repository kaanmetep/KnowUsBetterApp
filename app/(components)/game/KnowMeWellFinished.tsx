import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useCoins } from "../../contexts/CoinContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { useTranslation } from "../../hooks/useTranslation";
import { getResolvedQuestionText, resolvePlayerName } from "../../utils/questionUtils";

interface KnowMeWellFinishedProps {
  completedRounds: any[];
  player1Name: string;
  player2Name: string;
  onComplete: () => void;
  onAiAnalysisPress: () => void;
  onBuyCoins?: () => void;
}

const CATEGORY_COLOR = "#fdba74";
const CATEGORY_COLOR_LIGHT = "#fff7ed";

interface ScoreCardProps {
  guesserName: string;
  subjectName: string;
  score: number;
  total: number;
  delay: number;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const ScoreCard: React.FC<ScoreCardProps> = ({
  guesserName,
  subjectName,
  score,
  total,
  delay,
  t,
}) => {
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
  const barAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const blurAnim = useRef(new Animated.Value(20)).current;
  const blurOverlayOpacity = useRef(new Animated.Value(1)).current;
  const [currentBlur, setCurrentBlur] = useState(20);

  const getScoreColor = () => {
    if (percentage >= 90) return "#dc2626";
    if (percentage >= 80) return "#ea580c";
    if (percentage >= 70) return "#9333ea";
    if (percentage >= 60) return "#0284c7";
    if (percentage >= 50) return "#2563eb";
    return "#475569";
  };

  const scoreColor = getScoreColor();

  useEffect(() => {
    const blurListener = blurAnim.addListener(({ value }) => setCurrentBlur(value));

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(barAnim, {
          toValue: percentage / 100,
          duration: 1200,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
      ]).start();

      setTimeout(() => {
        Animated.parallel([
          Animated.timing(blurOverlayOpacity, {
            toValue: 0,
            duration: 3500,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(blurAnim, {
            toValue: 0,
            duration: 3500,
            easing: Easing.out(Easing.quad),
            useNativeDriver: false,
          }),
        ]).start();
      }, 400);
    }, delay);

    return () => {
      clearTimeout(timer);
      blurAnim.removeListener(blurListener);
    };
  }, []);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        backgroundColor: "rgba(255,255,255,0.65)",
        borderRadius: 24,
        padding: 20,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "rgba(253,186,116,0.25)",
        shadowColor: CATEGORY_COLOR,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 4,
      }}
    >
      <Text
        style={{
          fontFamily: "MerriweatherSans_400Regular",
          fontSize: 11,
          color: "#94a3b8",
          textTransform: "uppercase",
          letterSpacing: 1.5,
          marginBottom: 6,
        }}
      >
        {t("knowMeWell.aboutLabel", { name: subjectName })}
      </Text>

      <Text
        style={{
          fontFamily: "MerriweatherSans_700Bold",
          fontSize: 15,
          color: "#1e293b",
          marginBottom: 16,
        }}
      >
        {t("knowMeWell.knowledgeQuestion", {
          guesser: guesserName,
          subject: subjectName,
        })}
      </Text>

      {/* Percentage + bar */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        {/* Percentage number with blur */}
        <View style={{ width: 80, alignItems: "center", justifyContent: "center" }}>
          <Text
            style={{
              fontFamily: "MerriweatherSans_700Bold",
              fontSize: 38,
              color: scoreColor,
              lineHeight: 44,
              includeFontPadding: false,
            }}
          >
            {percentage}
          </Text>
          <Text
            style={{
              fontFamily: "MerriweatherSans_700Bold",
              fontSize: 13,
              color: scoreColor,
              opacity: 0.5,
              marginTop: -4,
            }}
          >
            %
          </Text>
          <Animated.View
            style={{
              position: "absolute",
              top: -8,
              left: -16,
              right: -16,
              bottom: -8,
              opacity: blurOverlayOpacity,
            }}
            pointerEvents="none"
          >
            <BlurView
              intensity={currentBlur}
              tint="light"
              style={{ flex: 1, borderRadius: 8 }}
            />
          </Animated.View>
        </View>

        {/* Bar + score text */}
        <View style={{ flex: 1 }}>
          <View
            style={{
              height: 8,
              backgroundColor: "#f1f5f9",
              borderRadius: 4,
              overflow: "hidden",
              marginBottom: 6,
            }}
          >
            <Animated.View
              style={{
                height: 8,
                borderRadius: 4,
                backgroundColor: scoreColor,
                width: barAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0%", "100%"],
                }),
              }}
            />
          </View>
          <Text
            style={{
              fontFamily: "MerriweatherSans_400Regular",
              fontSize: 12,
              color: "#64748b",
            }}
          >
            {t("knowMeWell.correctAnswers", { score, total })}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
};

const KnowMeWellFinished: React.FC<KnowMeWellFinishedProps> = ({
  completedRounds,
  player1Name,
  player2Name,
  onComplete,
  onAiAnalysisPress,
  onBuyCoins,
}) => {
  const { selectedLanguage } = useLanguage();
  const { t } = useTranslation();
  const { coins } = useCoins();
  const [showAiModal, setShowAiModal] = useState(false);

  const headerOpacity = useRef(new Animated.Value(0)).current;
  const bottomOpacity = useRef(new Animated.Value(0)).current;
  const bottomTranslateY = useRef(new Animated.Value(20)).current;

  // Even-indexed rounds (0,2,4,6,8) are about Player 1 → tests Player 2's knowledge
  const p1Rounds = completedRounds.filter((_, i) => i % 2 === 0);
  // Odd-indexed rounds (1,3,5,7,9) are about Player 2 → tests Player 1's knowledge
  const p2Rounds = completedRounds.filter((_, i) => i % 2 === 1);

  const p2KnowsP1Score = p1Rounds.filter((r) => r.isMatched).length;
  const p1KnowsP2Score = p2Rounds.filter((r) => r.isMatched).length;

  useEffect(() => {
    Animated.timing(headerOpacity, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(bottomOpacity, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(bottomTranslateY, {
          toValue: 0,
          duration: 800,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={[CATEGORY_COLOR_LIGHT, "#fff7ed", "#f8fafc"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.4, y: 1 }}
        style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
      />

      {/* Top bar */}
      <Animated.View
        style={{
          paddingTop: 56,
          paddingHorizontal: 20,
          paddingBottom: 12,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          opacity: headerOpacity,
        }}
      >
        <TouchableOpacity
          onPress={onComplete}
          activeOpacity={0.7}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: 999,
            backgroundColor: "rgba(255,255,255,0.6)",
          }}
        >
          <FontAwesome6 name="arrow-left" size={12} color="#475569" />
          <Text
            style={{
              fontFamily: "MerriweatherSans_700Bold",
              fontSize: 12,
              color: "#475569",
            }}
          >
            {t("knowMeWell.backToRoom")}
          </Text>
        </TouchableOpacity>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: 999,
            backgroundColor: "rgba(255,255,255,0.5)",
          }}
        >
          <FontAwesome6
            name="puzzle-piece"
            size={11}
            color={CATEGORY_COLOR}
          />
          <Text
            style={{
              fontFamily: "MerriweatherSans_700Bold",
              fontSize: 10,
              color: "#78716c",
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            {t("knowMeWell.categoryTitle")}
          </Text>
        </View>
      </Animated.View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Animated.View
          style={{
            alignItems: "center",
            paddingHorizontal: 24,
            paddingTop: 8,
            paddingBottom: 24,
            opacity: headerOpacity,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 10 }}>
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: "rgba(253,186,116,0.2)",
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1.5,
                borderColor: "rgba(253,186,116,0.35)",
              }}
            >
              <FontAwesome6 name="puzzle-piece" size={22} color={CATEGORY_COLOR} />
            </View>
            <Text
              style={{
                fontFamily: "MerriweatherSans_700Bold",
                fontSize: 22,
                color: "#1e293b",
                flexShrink: 1,
              }}
            >
              {t("knowMeWell.categoryTitle")}
            </Text>
          </View>
          <Text
            style={{
              fontFamily: "MerriweatherSans_400Regular",
              fontSize: 13,
              color: "#94a3b8",
              textAlign: "center",
            }}
          >
            {player1Name} & {player2Name}
          </Text>
        </Animated.View>

        {/* Score cards */}
        <View style={{ paddingHorizontal: 20 }}>
          <ScoreCard
            guesserName={player2Name}
            subjectName={player1Name}
            score={p2KnowsP1Score}
            total={p1Rounds.length}
            delay={300}
            t={t}
          />
          <ScoreCard
            guesserName={player1Name}
            subjectName={player2Name}
            score={p1KnowsP2Score}
            total={p2Rounds.length}
            delay={700}
            t={t}
          />
        </View>

        {/* AI Analysis Button */}
        <Animated.View
          style={{ paddingHorizontal: 20, marginTop: 4, marginBottom: 4, opacity: headerOpacity }}
        >
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setShowAiModal(true)}
            style={{
              borderRadius: 18,
              shadowColor: "#f97316",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.14,
              shadowRadius: 10,
              elevation: 4,
            }}
          >
            <LinearGradient
              colors={["#FFF7ED", "#FFEDD5", "#FED7AA"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                borderRadius: 18,
                paddingVertical: 16,
                paddingHorizontal: 18,
                borderWidth: 1.5,
                borderColor: "#FDC78E",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(234,88,12,0.12)",
                    marginRight: 12,
                  }}
                >
                  <FontAwesome6 name="magnifying-glass" size={17} color="#ea580c" />
                </View>
                <View style={{ flex: 1, marginRight: 12 }}>
                  <Text
                    style={{
                      fontFamily: "MerriweatherSans_700Bold",
                      fontSize: 13,
                      color: "#1e293b",
                      lineHeight: 18,
                    }}
                  >
                    {t("knowMeWell.aiButton")}
                  </Text>
                  <Text
                    style={{
                      fontFamily: "MerriweatherSans_400Regular",
                      fontSize: 10,
                      color: "#94a3b8",
                      marginTop: 2,
                    }}
                  >
                    {t("knowMeWell.aiButtonSub")}
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor: "#FBBF24",
                    borderRadius: 10,
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <FontAwesome6 name="coins" size={10} color="#713f12" />
                  <Text style={{ fontFamily: "MerriweatherSans_700Bold", fontSize: 12, color: "#713f12" }}>3</Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Divider */}
        <Animated.View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginHorizontal: 32,
            marginVertical: 16,
            opacity: bottomOpacity,
          }}
        >
          <View style={{ flex: 1, height: 1, backgroundColor: "rgba(253,186,116,0.3)" }} />
          <View style={{ marginHorizontal: 12 }}>
            <FontAwesome6
              name="puzzle-piece"
              size={10}
              color={CATEGORY_COLOR}
              style={{ opacity: 0.4 }}
            />
          </View>
          <View style={{ flex: 1, height: 1, backgroundColor: "rgba(253,186,116,0.3)" }} />
        </Animated.View>

        {/* Round list */}
        {completedRounds.length > 0 && (
          <Animated.View
            style={{
              paddingHorizontal: 20,
              opacity: bottomOpacity,
              transform: [{ translateY: bottomTranslateY }],
            }}
          >
            <View
              style={{
                borderRadius: 20,
                overflow: "hidden",
                backgroundColor: "rgba(255,255,255,0.55)",
              }}
            >
              {completedRounds.map((round: any, index: number) => {
                const isAboutP1 = index % 2 === 0;
                const subjectName = isAboutP1 ? player1Name : player2Name;
                const dividerColor = "rgba(253,186,116,0.2)";

                return (
                  <View
                    key={index}
                    style={[
                      {
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 12,
                        paddingHorizontal: 16,
                        paddingVertical: 13,
                      },
                      index !== completedRounds.length - 1 && {
                        borderBottomWidth: 1,
                        borderBottomColor: dividerColor,
                      },
                    ]}
                  >
                    <View
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: round.isMatched
                          ? "rgba(22,163,74,0.1)"
                          : "rgba(220,38,38,0.08)",
                      }}
                    >
                      <FontAwesome6
                        name={round.isMatched ? "check" : "xmark"}
                        size={11}
                        color={round.isMatched ? "#16a34a" : "#dc2626"}
                      />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontFamily: "MerriweatherSans_400Regular",
                          fontSize: 11,
                          color: CATEGORY_COLOR,
                          marginBottom: 2,
                          textTransform: "uppercase",
                          letterSpacing: 0.8,
                        }}
                      >
                        {t("knowMeWell.aboutLabel", { name: subjectName })}
                      </Text>
                      <Text
                        style={{
                          fontFamily: "MerriweatherSans_400Regular",
                          fontSize: 12,
                          color: "#475569",
                        }}
                        numberOfLines={2}
                      >
                        {round.question
                          ? getResolvedQuestionText(
                              round.question,
                              selectedLanguage,
                              resolvePlayerName(index, player1Name, player2Name)
                            )
                          : t("gameFinished.questionNumber", { index: index + 1 })}
                      </Text>
                    </View>

                    <Text
                      style={{
                        fontFamily: "MerriweatherSans_700Bold",
                        fontSize: 10,
                        textTransform: "uppercase",
                        color: round.isMatched ? "#16a34a" : "#dc2626",
                        opacity: 0.75,
                      }}
                    >
                      {round.isMatched
                        ? t("knowMeWell.correctTag")
                        : t("knowMeWell.wrongTag")}
                    </Text>
                  </View>
                );
              })}
            </View>
          </Animated.View>
        )}
      </ScrollView>

      {/* AI Info Modal */}
      <Modal
        visible={showAiModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAiModal(false)}
        statusBarTranslucent
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(15,23,42,0.6)",
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 24,
          }}
          onPress={() => setShowAiModal(false)}
        >
          <Pressable
            style={{
              width: "100%",
              maxWidth: 420,
              backgroundColor: "white",
              borderRadius: 28,
              padding: 28,
              position: "relative",
              ...(Platform.OS === "ios"
                ? { shadowColor: "#1e293b", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 16 }
                : { elevation: 8 }),
            }}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <TouchableOpacity
              onPress={() => setShowAiModal(false)}
              activeOpacity={0.7}
              style={{
                position: "absolute",
                top: 20,
                right: 20,
                backgroundColor: "#f1f5f9",
                padding: 8,
                borderRadius: 999,
                zIndex: 10,
              }}
            >
              <FontAwesome6 name="xmark" size={16} color="#64748b" />
            </TouchableOpacity>

            {/* Icon */}
            <View style={{ alignItems: "center", marginBottom: 20 }}>
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  backgroundColor: "rgba(234,88,12,0.12)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FontAwesome6 name="magnifying-glass" size={26} color="#ea580c" />
              </View>
            </View>

            {/* Title */}
            <Text
              style={{
                fontFamily: "MerriweatherSans_700Bold",
                fontSize: 20,
                color: "#1e293b",
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              {t("knowMeWell.aiModalTitle")}
            </Text>

            {/* Description */}
            <Text
              style={{
                fontFamily: "MerriweatherSans_400Regular",
                fontSize: 13,
                color: "#64748b",
                textAlign: "center",
                lineHeight: 20,
                marginBottom: 24,
                paddingHorizontal: 8,
              }}
            >
              {t("knowMeWell.aiModalDesc")}
            </Text>

            {/* Features */}
            <View style={{ gap: 12, marginBottom: 24 }}>
              {[
                { icon: "eye-slash" as const, color: "#ea580c", bg: "rgba(234,88,12,0.1)", text: t("knowMeWell.aiModalFeature1") },
                { icon: "lightbulb" as const, color: "#f59e0b", bg: "rgba(245,158,11,0.1)", text: t("knowMeWell.aiModalFeature2") },
                { icon: "handshake" as const, color: "#3b82f6", bg: "rgba(59,130,246,0.1)", text: t("knowMeWell.aiModalFeature3") },
              ].map((f, i) => (
                <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: f.bg, alignItems: "center", justifyContent: "center" }}>
                    <FontAwesome6 name={f.icon} size={14} color={f.color} />
                  </View>
                  <Text style={{ fontFamily: "MerriweatherSans_400Regular", fontSize: 13, color: "#475569", flex: 1, lineHeight: 18 }}>
                    {f.text}
                  </Text>
                </View>
              ))}
            </View>

            {/* Coin balance */}
            <View style={{ alignItems: "center", marginBottom: 20, gap: 8 }}>
              <View style={{ backgroundColor: "#fffbeb", borderRadius: 999, paddingHorizontal: 16, paddingVertical: 6, borderWidth: 1, borderColor: "#fde68a" }}>
                <Text style={{ fontFamily: "MerriweatherSans_400Regular", fontSize: 12, color: "#92400e" }}>
                  <FontAwesome6 name="coins" size={12} color="#b45309" />
                  {"  "}{t("coins.youHave", { coins })}
                </Text>
              </View>
              {onBuyCoins && coins < 3 && (
                <TouchableOpacity
                  onPress={() => { setShowAiModal(false); onBuyCoins(); }}
                  activeOpacity={0.75}
                  style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 999, backgroundColor: "#FBBF24" }}
                >
                  <FontAwesome6 name="coins" size={11} color="#713f12" />
                  <Text style={{ fontFamily: "MerriweatherSans_700Bold", fontSize: 12, color: "#713f12" }}>
                    {t("coins.buyCoins")}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Confirm */}
            <TouchableOpacity
              onPress={() => {
                setShowAiModal(false);
                onAiAnalysisPress();
              }}
              activeOpacity={0.9}
              style={{ borderRadius: 20, marginBottom: 10 }}
            >
              <LinearGradient
                colors={["#FFF7ED", "#FFEDD5", "#FED7AA"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  borderRadius: 20,
                  paddingVertical: 15,
                  paddingHorizontal: 24,
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "row",
                  gap: 10,
                  borderWidth: 1.5,
                  borderColor: "#FDC78E",
                }}
              >
                <FontAwesome6 name="magnifying-glass" size={15} color="#ea580c" />
                <Text style={{ fontFamily: "MerriweatherSans_700Bold", fontSize: 15, color: "#1e293b", letterSpacing: 0.3 }}>
                  {t("knowMeWell.aiModalConfirm")}
                </Text>
                <View style={{ backgroundColor: "#FBBF24", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5, flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <FontAwesome6 name="coins" size={10} color="#713f12" />
                  <Text style={{ fontFamily: "MerriweatherSans_700Bold", fontSize: 12, color: "#713f12" }}>3</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* Cancel */}
            <TouchableOpacity
              onPress={() => setShowAiModal(false)}
              activeOpacity={0.8}
              style={{ paddingVertical: 12, borderRadius: 20, backgroundColor: "#f1f5f9", alignItems: "center" }}
            >
              <Text style={{ fontFamily: "MerriweatherSans_700Bold", fontSize: 14, color: "#64748b" }}>
                {t("knowMeWell.aiModalCancel")}
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

export default KnowMeWellFinished;
