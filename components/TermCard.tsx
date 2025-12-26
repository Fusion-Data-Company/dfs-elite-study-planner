/**
 * TermCard Component - Term/Definition Flip Card
 */

import { View, Text, TouchableOpacity, Platform, StyleSheet } from "react-native";
import { useColors } from "@/hooks/use-colors";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
  Extrapolation,
  FadeIn,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import type { SRSGrade } from "@/hooks/useFlashcards";

interface TermCardProps {
  term: string;
  definition: string;
  onGrade?: (grade: SRSGrade) => void;
  onVoiceExplain?: () => void;
}

const GRADE_BUTTONS: { grade: SRSGrade; label: string; color: string; icon: string }[] = [
  { grade: 0, label: "Again", color: "#ef4444", icon: "replay" },
  { grade: 1, label: "Hard", color: "#f59e0b", icon: "trending-down" },
  { grade: 2, label: "Good", color: "#10b981", icon: "check" },
  { grade: 3, label: "Easy", color: "#06b6d4", icon: "bolt" },
];

export function TermCard({ term, definition, onGrade, onVoiceExplain }: TermCardProps) {
  const colors = useColors();
  const [isFlipped, setIsFlipped] = useState(false);
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  const handleFlip = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const newFlipped = !isFlipped;
    setIsFlipped(newFlipped);
    rotation.value = withSpring(newFlipped ? 180 : 0, {
      damping: 15,
      stiffness: 100,
    });
  };

  const handleGrade = (grade: SRSGrade) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    // Animate card out
    scale.value = withTiming(0.9, { duration: 150 }, () => {
      scale.value = withTiming(1, { duration: 150 });
    });

    onGrade?.(grade);
    
    // Reset for next card
    setIsFlipped(false);
    rotation.value = withTiming(0, { duration: 200 });
  };

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(
      rotation.value,
      [0, 180],
      [0, 180],
      Extrapolation.CLAMP
    );
    return {
      transform: [
        { perspective: 1000 },
        { rotateY: `${rotateY}deg` },
        { scale: scale.value },
      ],
      backfaceVisibility: "hidden",
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(
      rotation.value,
      [0, 180],
      [180, 360],
      Extrapolation.CLAMP
    );
    return {
      transform: [
        { perspective: 1000 },
        { rotateY: `${rotateY}deg` },
        { scale: scale.value },
      ],
      backfaceVisibility: "hidden",
    };
  });

  return (
    <View style={styles.wrapper}>
      {/* Card */}
      <TouchableOpacity
        onPress={handleFlip}
        activeOpacity={0.95}
        style={styles.cardContainer}
      >
        {/* Front - Term */}
        <Animated.View
          style={[
            styles.card,
            frontAnimatedStyle,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.label, { color: colors.primary }]}>TERM</Text>
          <Text style={[styles.cardText, { color: colors.foreground }]}>{term}</Text>
          <View style={styles.tapHint}>
            <MaterialIcons name="touch-app" size={20} color={colors.muted} />
            <Text style={[styles.tapHintText, { color: colors.muted }]}>
              Tap to reveal
            </Text>
          </View>
        </Animated.View>

        {/* Back - Definition */}
        <Animated.View
          style={[
            styles.card,
            styles.cardBack,
            backAnimatedStyle,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.label, { color: colors.secondary }]}>DEFINITION</Text>
          <Text style={[styles.cardText, { color: colors.foreground }]}>{definition}</Text>
          
          {/* Voice Explain Button */}
          {onVoiceExplain && (
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                onVoiceExplain();
              }}
              style={[styles.voiceButton, { backgroundColor: colors.primary + "20" }]}
            >
              <MaterialIcons name="record-voice-over" size={18} color={colors.primary} />
              <Text style={[styles.voiceButtonText, { color: colors.primary }]}>
                Ask AI to explain
              </Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      </TouchableOpacity>

      {/* Grade Buttons (shown when flipped) */}
      {isFlipped && (
        <Animated.View entering={FadeIn.delay(200).duration(300)} style={styles.gradeContainer}>
          <Text style={[styles.gradeLabel, { color: colors.muted }]}>
            How well did you know this?
          </Text>
          <View style={styles.gradeButtons}>
            {GRADE_BUTTONS.map((btn) => (
              <TouchableOpacity
                key={btn.grade}
                onPress={() => handleGrade(btn.grade)}
                style={[styles.gradeButton, { backgroundColor: btn.color + "20" }]}
              >
                <MaterialIcons name={btn.icon as any} size={20} color={btn.color} />
                <Text style={[styles.gradeButtonText, { color: btn.color }]}>
                  {btn.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  cardContainer: {
    width: "100%",
    aspectRatio: 3 / 4,
    maxHeight: 400,
  },
  card: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  cardBack: {
    position: "absolute",
  },
  label: {
    position: "absolute",
    top: 20,
    left: 20,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
  },
  cardText: {
    fontSize: 22,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 32,
  },
  tapHint: {
    position: "absolute",
    bottom: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  tapHintText: {
    fontSize: 13,
  },
  voiceButton: {
    position: "absolute",
    bottom: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  voiceButtonText: {
    fontSize: 13,
    fontWeight: "500",
  },
  gradeContainer: {
    marginTop: 24,
    alignItems: "center",
  },
  gradeLabel: {
    fontSize: 14,
    marginBottom: 12,
  },
  gradeButtons: {
    flexDirection: "row",
    gap: 8,
  },
  gradeButton: {
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    minWidth: 70,
  },
  gradeButtonText: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
});
