/**
 * Exam Screen - Timed Quiz/Exam Mode
 */

import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  StyleSheet,
  Alert,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useExamSession, type ExamResult } from "@/hooks/useExams";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Animated, { FadeIn, FadeInDown, FadeInRight } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

// Question navigator component
function QuestionNavigator({
  questions,
  currentIndex,
  onSelect,
}: {
  questions: Array<{ id: string; selectedAnswer?: string; flagged?: boolean }>;
  currentIndex: number;
  onSelect: (index: number) => void;
}) {
  const colors = useColors();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.navigatorContent}
    >
      {questions.map((q, index) => (
        <TouchableOpacity
          key={q.id}
          onPress={() => onSelect(index)}
          style={[
            styles.navButton,
            {
              backgroundColor:
                index === currentIndex
                  ? colors.primary
                  : q.selectedAnswer
                  ? colors.success + "30"
                  : colors.surface,
              borderColor:
                index === currentIndex
                  ? colors.primary
                  : q.flagged
                  ? colors.warning
                  : colors.border,
            },
          ]}
        >
          <Text
            style={[
              styles.navButtonText,
              {
                color:
                  index === currentIndex
                    ? "#fff"
                    : q.selectedAnswer
                    ? colors.success
                    : colors.foreground,
              },
            ]}
          >
            {index + 1}
          </Text>
          {q.flagged && (
            <View style={[styles.flagDot, { backgroundColor: colors.warning }]} />
          )}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

// Results screen component
function ResultsScreen({
  result,
  onExit,
}: {
  result: ExamResult;
  onExit: () => void;
}) {
  const colors = useColors();

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.resultsContent}>
      <Animated.View entering={FadeIn.duration(500)} style={styles.resultsHeader}>
        <View
          style={[
            styles.resultIcon,
            { backgroundColor: result.passed ? colors.success + "20" : colors.error + "20" },
          ]}
        >
          <Text style={styles.resultEmoji}>{result.passed ? "🎉" : "📚"}</Text>
        </View>
        <Text style={[styles.resultTitle, { color: colors.foreground }]}>
          {result.passed ? "Congratulations!" : "Keep Practicing"}
        </Text>
        <Text style={[styles.resultSubtitle, { color: colors.muted }]}>
          {result.passed
            ? "You passed the exam!"
            : "You didn't pass this time, but don't give up!"}
        </Text>
      </Animated.View>

      {/* Score Card */}
      <Animated.View
        entering={FadeInDown.delay(200).duration(500)}
        style={[styles.scoreCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
      >
        <View style={styles.scoreMain}>
          <Text
            style={[
              styles.scoreValue,
              { color: result.passed ? colors.success : colors.error },
            ]}
          >
            {result.score}%
          </Text>
          <Text style={[styles.scoreLabel, { color: colors.muted }]}>Your Score</Text>
        </View>
        <View style={styles.scoreDetails}>
          <View style={styles.scoreDetailItem}>
            <MaterialIcons name="check-circle" size={18} color={colors.success} />
            <Text style={[styles.scoreDetailText, { color: colors.foreground }]}>
              {result.correctAnswers} Correct
            </Text>
          </View>
          <View style={styles.scoreDetailItem}>
            <MaterialIcons name="cancel" size={18} color={colors.error} />
            <Text style={[styles.scoreDetailText, { color: colors.foreground }]}>
              {result.totalQuestions - result.correctAnswers} Incorrect
            </Text>
          </View>
        </View>
      </Animated.View>

      {/* Topic Breakdown */}
      {result.topicBreakdown && result.topicBreakdown.length > 0 && (
        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Topic Breakdown
          </Text>
          <View style={styles.topicList}>
            {result.topicBreakdown.map((topic, index) => (
              <View
                key={index}
                style={[styles.topicItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <View style={styles.topicHeader}>
                  <Text style={[styles.topicName, { color: colors.foreground }]}>
                    {topic.topic}
                  </Text>
                  <Text
                    style={[
                      styles.topicPercent,
                      { color: topic.percentage >= 70 ? colors.success : colors.error },
                    ]}
                  >
                    {topic.percentage}%
                  </Text>
                </View>
                <View style={[styles.topicBar, { backgroundColor: colors.muted + "30" }]}>
                  <View
                    style={[
                      styles.topicBarFill,
                      {
                        width: `${topic.percentage}%`,
                        backgroundColor: topic.percentage >= 70 ? colors.success : colors.error,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.topicScore, { color: colors.muted }]}>
                  {topic.correct} / {topic.total} correct
                </Text>
              </View>
            ))}
          </View>
        </Animated.View>
      )}

      {/* Exit Button */}
      <TouchableOpacity
        onPress={onExit}
        style={[styles.exitButton, { backgroundColor: colors.primary }]}
      >
        <Text style={styles.exitButtonText}>Done</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

export default function ExamScreen() {
  const colors = useColors();
  const router = useRouter();
  const { bankId } = useLocalSearchParams<{ bankId: string }>();
  const {
    session,
    currentQuestion,
    timeRemaining,
    formattedTime,
    answeredCount,
    flaggedCount,
    isStarting,
    isFinishing,
    result,
    startExam,
    selectAnswer,
    toggleFlag,
    goToQuestion,
    nextQuestion,
    prevQuestion,
    finishExam,
  } = useExamSession();

  // Start exam on mount
  useEffect(() => {
    if (bankId && !session) {
      startExam(bankId);
    }
  }, [bankId]);

  const handleFinish = () => {
    if (Platform.OS === "web") {
      if (confirm("Are you sure you want to submit your exam?")) {
        finishExam();
      }
    } else {
      Alert.alert(
        "Submit Exam",
        "Are you sure you want to submit your exam? You cannot change your answers after submission.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Submit", style: "destructive", onPress: () => finishExam() },
        ]
      );
    }
  };

  const handleSelectAnswer = (option: string) => {
    if (!currentQuestion) return;

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    selectAnswer(currentQuestion.id, option);
  };

  const handleToggleFlag = () => {
    if (!currentQuestion) return;

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    toggleFlag(currentQuestion.id);
  };

  // Show results if exam is complete
  if (result) {
    return (
      <ScreenContainer className="p-6">
        <Stack.Screen options={{ title: "Results", headerBackVisible: false }} />
        <ResultsScreen result={result} onExit={() => router.back()} />
      </ScreenContainer>
    );
  }

  // Loading state
  if (isStarting || !session) {
    return (
      <ScreenContainer className="p-6">
        <Stack.Screen options={{ title: "Loading..." }} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.muted }]}>
            Preparing your exam...
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer edges={["left", "right"]}>
      <Stack.Screen
        options={{
          title: "Exam",
          headerBackVisible: false,
          headerRight: () => (
            <TouchableOpacity onPress={handleFinish}>
              <Text style={{ color: colors.primary, fontWeight: "600" }}>Submit</Text>
            </TouchableOpacity>
          ),
        }}
      />

      {/* Timer Bar */}
      <View style={[styles.timerBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.timerLeft}>
          <MaterialIcons
            name="timer"
            size={20}
            color={timeRemaining < 300 ? colors.error : colors.primary}
          />
          <Text
            style={[
              styles.timerText,
              { color: timeRemaining < 300 ? colors.error : colors.foreground },
            ]}
          >
            {formattedTime}
          </Text>
        </View>
        <View style={styles.timerRight}>
          <Text style={[styles.timerStat, { color: colors.muted }]}>
            {answeredCount}/{session.questions.length} answered
          </Text>
          {flaggedCount > 0 && (
            <View style={styles.flaggedBadge}>
              <MaterialIcons name="flag" size={14} color={colors.warning} />
              <Text style={[styles.flaggedText, { color: colors.warning }]}>
                {flaggedCount}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Question Navigator */}
      <QuestionNavigator
        questions={session.questions}
        currentIndex={session.currentIndex}
        onSelect={goToQuestion}
      />

      {/* Question Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.questionContent}
      >
        {currentQuestion && (
          <Animated.View entering={FadeInRight.duration(300)}>
            {/* Question Header */}
            <View style={styles.questionHeader}>
              <Text style={[styles.questionNumber, { color: colors.primary }]}>
                Question {session.currentIndex + 1}
              </Text>
              <TouchableOpacity onPress={handleToggleFlag}>
                <MaterialIcons
                  name={currentQuestion.flagged ? "flag" : "outlined-flag"}
                  size={24}
                  color={currentQuestion.flagged ? colors.warning : colors.muted}
                />
              </TouchableOpacity>
            </View>

            {/* Question Text */}
            <Text style={[styles.questionText, { color: colors.foreground }]}>
              {currentQuestion.question}
            </Text>

            {/* Options */}
            <View style={styles.optionsList}>
              {currentQuestion.options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleSelectAnswer(option)}
                  style={[
                    styles.optionButton,
                    {
                      backgroundColor:
                        currentQuestion.selectedAnswer === option
                          ? colors.primary + "20"
                          : colors.surface,
                      borderColor:
                        currentQuestion.selectedAnswer === option
                          ? colors.primary
                          : colors.border,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.optionLetter,
                      {
                        backgroundColor:
                          currentQuestion.selectedAnswer === option
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
                            currentQuestion.selectedAnswer === option
                              ? "#fff"
                              : colors.muted,
                        },
                      ]}
                    >
                      {String.fromCharCode(65 + index)}
                    </Text>
                  </View>
                  <Text style={[styles.optionText, { color: colors.foreground }]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        )}
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={[styles.navBar, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <TouchableOpacity
          onPress={prevQuestion}
          disabled={session.currentIndex === 0}
          style={[
            styles.navBarButton,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              opacity: session.currentIndex === 0 ? 0.5 : 1,
            },
          ]}
        >
          <MaterialIcons name="chevron-left" size={24} color={colors.foreground} />
          <Text style={[styles.navBarButtonText, { color: colors.foreground }]}>Previous</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={nextQuestion}
          disabled={session.currentIndex === session.questions.length - 1}
          style={[
            styles.navBarButton,
            {
              backgroundColor: colors.primary,
              borderColor: colors.primary,
              opacity: session.currentIndex === session.questions.length - 1 ? 0.5 : 1,
            },
          ]}
        >
          <Text style={[styles.navBarButtonText, { color: "#fff" }]}>Next</Text>
          <MaterialIcons name="chevron-right" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 8,
  },
  timerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  timerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  timerText: {
    fontSize: 18,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  timerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  timerStat: {
    fontSize: 13,
  },
  flaggedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  flaggedText: {
    fontSize: 13,
    fontWeight: "600",
  },
  navigatorContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  flagDot: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  questionContent: {
    padding: 20,
    paddingBottom: 100,
  },
  questionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  questionNumber: {
    fontSize: 14,
    fontWeight: "600",
  },
  questionText: {
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 26,
    marginBottom: 24,
  },
  optionsList: {
    gap: 12,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 14,
  },
  optionLetter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  optionLetterText: {
    fontSize: 14,
    fontWeight: "700",
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === "ios" ? 28 : 12,
    borderTopWidth: 1,
    gap: 12,
  },
  navBarButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  navBarButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  // Results styles
  resultsContent: {
    paddingBottom: 40,
  },
  resultsHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  resultIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  resultEmoji: {
    fontSize: 40,
  },
  resultTitle: {
    fontSize: 26,
    fontWeight: "700",
  },
  resultSubtitle: {
    fontSize: 15,
    marginTop: 8,
    textAlign: "center",
  },
  scoreCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 28,
  },
  scoreMain: {
    alignItems: "center",
    marginBottom: 16,
  },
  scoreValue: {
    fontSize: 56,
    fontWeight: "700",
  },
  scoreLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  scoreDetails: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
  },
  scoreDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  scoreDetailText: {
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  topicList: {
    gap: 12,
    marginBottom: 24,
  },
  topicItem: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  topicHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  topicName: {
    fontSize: 14,
    fontWeight: "500",
  },
  topicPercent: {
    fontSize: 14,
    fontWeight: "700",
  },
  topicBar: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 6,
  },
  topicBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  topicScore: {
    fontSize: 12,
  },
  exitButton: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  exitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
