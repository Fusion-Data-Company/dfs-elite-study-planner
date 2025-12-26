/**
 * MCQCard Component - Multiple Choice Question Card
 */

import { View, Text, TouchableOpacity, Platform, StyleSheet, ScrollView } from "react-native";
import { useColors } from "@/hooks/use-colors";
import Animated, { FadeIn, FadeInDown, useAnimatedStyle, withTiming } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

interface MCQCardProps {
  question: string;
  options: string[];
  correctAnswer?: string;
  rationale?: string;
  onAnswer?: (selectedOption: string, isCorrect: boolean) => void;
  showResult?: boolean;
}

export function MCQCard({
  question,
  options,
  correctAnswer,
  rationale,
  onAnswer,
  showResult = false,
}: MCQCardProps) {
  const colors = useColors();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(showResult);

  const handleSelectOption = (option: string) => {
    if (revealed) return;

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    setSelectedOption(option);
  };

  const handleReveal = () => {
    if (!selectedOption) return;

    if (Platform.OS !== "web") {
      const isCorrect = selectedOption === correctAnswer;
      Haptics.notificationAsync(
        isCorrect
          ? Haptics.NotificationFeedbackType.Success
          : Haptics.NotificationFeedbackType.Error
      );
    }

    setRevealed(true);
    onAnswer?.(selectedOption, selectedOption === correctAnswer);
  };

  const getOptionStyle = (option: string) => {
    if (!revealed) {
      return selectedOption === option
        ? { backgroundColor: colors.primary + "30", borderColor: colors.primary }
        : { backgroundColor: colors.background, borderColor: colors.border };
    }

    if (option === correctAnswer) {
      return { backgroundColor: colors.success + "30", borderColor: colors.success };
    }

    if (option === selectedOption && option !== correctAnswer) {
      return { backgroundColor: colors.error + "30", borderColor: colors.error };
    }

    return { backgroundColor: colors.background, borderColor: colors.border };
  };

  const getOptionIcon = (option: string) => {
    if (!revealed) return null;

    if (option === correctAnswer) {
      return <MaterialIcons name="check-circle" size={24} color={colors.success} />;
    }

    if (option === selectedOption && option !== correctAnswer) {
      return <MaterialIcons name="cancel" size={24} color={colors.error} />;
    }

    return null;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Question */}
        <View style={styles.questionContainer}>
          <Text style={[styles.label, { color: colors.primary }]}>QUESTION</Text>
          <Text style={[styles.question, { color: colors.foreground }]}>{question}</Text>
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {options.map((option, index) => (
            <Animated.View key={index} entering={FadeInDown.delay(index * 100).duration(400)}>
              <TouchableOpacity
                onPress={() => handleSelectOption(option)}
                disabled={revealed}
                style={[styles.option, getOptionStyle(option)]}
                activeOpacity={0.7}
              >
                <View style={styles.optionContent}>
                  <View
                    style={[
                      styles.optionLetter,
                      {
                        backgroundColor:
                          selectedOption === option && !revealed
                            ? colors.primary
                            : colors.muted + "30",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionLetterText,
                        {
                          color:
                            selectedOption === option && !revealed
                              ? "#fff"
                              : colors.muted,
                        },
                      ]}
                    >
                      {String.fromCharCode(65 + index)}
                    </Text>
                  </View>
                  <Text
                    style={[styles.optionText, { color: colors.foreground }]}
                    numberOfLines={3}
                  >
                    {option}
                  </Text>
                </View>
                {getOptionIcon(option)}
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        {/* Rationale (shown after reveal) */}
        {revealed && rationale && (
          <Animated.View
            entering={FadeIn.duration(400)}
            style={[styles.rationaleContainer, { backgroundColor: colors.primary + "10", borderColor: colors.primary + "30" }]}
          >
            <Text style={[styles.rationaleLabel, { color: colors.primary }]}>EXPLANATION</Text>
            <Text style={[styles.rationaleText, { color: colors.foreground }]}>{rationale}</Text>
          </Animated.View>
        )}

        {/* Submit Button */}
        {!revealed && (
          <TouchableOpacity
            onPress={handleReveal}
            disabled={!selectedOption}
            style={[
              styles.submitButton,
              {
                backgroundColor: selectedOption ? colors.primary : colors.muted + "50",
              },
            ]}
          >
            <Text style={styles.submitButtonText}>Check Answer</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
  },
  scrollContent: {
    padding: 20,
  },
  questionContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 8,
  },
  question: {
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 26,
  },
  optionsContainer: {
    gap: 12,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  optionLetter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  optionLetterText: {
    fontSize: 14,
    fontWeight: "700",
  },
  optionText: {
    fontSize: 15,
    lineHeight: 22,
    flex: 1,
  },
  rationaleContainer: {
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  rationaleLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 8,
  },
  rationaleText: {
    fontSize: 14,
    lineHeight: 22,
  },
  submitButton: {
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
