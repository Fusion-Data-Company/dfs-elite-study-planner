/**
 * iFlash Flashcards Screen - Full SRS Review System
 */

import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  StyleSheet,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useFlashcards, useFlashcardSession, type Flashcard, type SRSGrade } from "@/hooks/useFlashcards";
import { MCQCard } from "@/components/MCQCard";
import { TermCard } from "@/components/TermCard";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Animated, { FadeIn, FadeInDown, FadeOut, SlideInRight, SlideOutLeft } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useAuth } from "@clerk/clerk-expo";

// Session stats component
function SessionStats({
  correct,
  incorrect,
  streak,
  progress,
}: {
  correct: number;
  incorrect: number;
  streak: number;
  progress: number;
}) {
  const colors = useColors();

  return (
    <View style={styles.statsContainer}>
      <View style={styles.progressBar}>
        <Animated.View
          style={[
            styles.progressFill,
            { width: `${progress}%`, backgroundColor: colors.primary },
          ]}
        />
      </View>
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <MaterialIcons name="check-circle" size={16} color={colors.success} />
          <Text style={[styles.statText, { color: colors.foreground }]}>{correct}</Text>
        </View>
        <View style={styles.stat}>
          <MaterialIcons name="cancel" size={16} color={colors.error} />
          <Text style={[styles.statText, { color: colors.foreground }]}>{incorrect}</Text>
        </View>
        <View style={styles.stat}>
          <MaterialIcons name="local-fire-department" size={16} color={colors.accent} />
          <Text style={[styles.statText, { color: colors.foreground }]}>{streak}</Text>
        </View>
      </View>
    </View>
  );
}

// Session complete screen
function SessionComplete({
  correct,
  incorrect,
  total,
  onRestart,
  onExit,
}: {
  correct: number;
  incorrect: number;
  total: number;
  onRestart: () => void;
  onExit: () => void;
}) {
  const colors = useColors();
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

  useEffect(() => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, []);

  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      style={[styles.completeContainer, { backgroundColor: colors.surface }]}
    >
      <View style={[styles.completeIcon, { backgroundColor: colors.success + "20" }]}>
        <Text style={styles.completeEmoji}>🎉</Text>
      </View>
      <Text style={[styles.completeTitle, { color: colors.foreground }]}>
        Session Complete!
      </Text>
      <Text style={[styles.completeSubtitle, { color: colors.muted }]}>
        You reviewed {total} cards
      </Text>

      <View style={styles.completeStats}>
        <View style={[styles.completeStat, { backgroundColor: colors.success + "15" }]}>
          <Text style={[styles.completeStatValue, { color: colors.success }]}>
            {correct}
          </Text>
          <Text style={[styles.completeStatLabel, { color: colors.success }]}>
            Correct
          </Text>
        </View>
        <View style={[styles.completeStat, { backgroundColor: colors.primary + "15" }]}>
          <Text style={[styles.completeStatValue, { color: colors.primary }]}>
            {percentage}%
          </Text>
          <Text style={[styles.completeStatLabel, { color: colors.primary }]}>
            Accuracy
          </Text>
        </View>
        <View style={[styles.completeStat, { backgroundColor: colors.error + "15" }]}>
          <Text style={[styles.completeStatValue, { color: colors.error }]}>
            {incorrect}
          </Text>
          <Text style={[styles.completeStatLabel, { color: colors.error }]}>
            To Review
          </Text>
        </View>
      </View>

      <View style={styles.completeActions}>
        <TouchableOpacity
          onPress={onRestart}
          style={[styles.completeButton, { backgroundColor: colors.primary }]}
        >
          <MaterialIcons name="replay" size={20} color="#fff" />
          <Text style={styles.completeButtonText}>Study Again</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onExit}
          style={[styles.completeButtonOutline, { borderColor: colors.border }]}
        >
          <Text style={[styles.completeButtonOutlineText, { color: colors.foreground }]}>
            Done
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

export default function FlashcardsScreen() {
  const colors = useColors();
  const { isSignedIn } = useAuth();
  const { cards, totalDue, isLoading, error, refetch } = useFlashcards();
  const {
    session,
    currentCard,
    isComplete,
    progress,
    startSession,
    gradeCard,
  } = useFlashcardSession();
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [cardKey, setCardKey] = useState(0);

  const handleStartSession = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    startSession(cards);
    setIsSessionActive(true);
  };

  const handleGrade = (grade: SRSGrade) => {
    gradeCard(grade);
    setCardKey(prev => prev + 1); // Force re-render for animation
  };

  const handleMCQAnswer = (selectedOption: string, isCorrect: boolean) => {
    // Convert to SRS grade: correct = Good (2), incorrect = Again (0)
    const grade: SRSGrade = isCorrect ? 2 : 0;
    setTimeout(() => handleGrade(grade), 1500); // Delay to show result
  };

  const handleRestart = () => {
    startSession(cards);
    setCardKey(0);
  };

  const handleExit = () => {
    setIsSessionActive(false);
    refetch();
  };

  // Not signed in
  if (!isSignedIn) {
    return (
      <ScreenContainer className="p-6">
        <View style={styles.centerContainer}>
          <MaterialIcons name="lock" size={48} color={colors.muted} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
            Sign in Required
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.muted }]}>
            Please sign in to access your flashcards
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <ScreenContainer className="p-6">
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.muted }]}>
            Loading flashcards...
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  // Error state
  if (error) {
    return (
      <ScreenContainer className="p-6">
        <View style={styles.centerContainer}>
          <MaterialIcons name="error-outline" size={48} color={colors.error} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
            Failed to Load
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.muted }]}>
            {error.message}
          </Text>
          <TouchableOpacity
            onPress={() => refetch()}
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  // Session complete
  if (isSessionActive && isComplete) {
    return (
      <ScreenContainer className="p-6">
        <SessionComplete
          correct={session.correct}
          incorrect={session.incorrect}
          total={session.cards.length}
          onRestart={handleRestart}
          onExit={handleExit}
        />
      </ScreenContainer>
    );
  }

  // Active session
  if (isSessionActive && currentCard) {
    return (
      <ScreenContainer className="p-4">
        {/* Header */}
        <View style={styles.sessionHeader}>
          <TouchableOpacity onPress={handleExit} style={styles.exitButton}>
            <MaterialIcons name="close" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.sessionTitle, { color: colors.foreground }]}>
            iFlash Review
          </Text>
          <Text style={[styles.cardCount, { color: colors.muted }]}>
            {session.currentIndex + 1} / {session.cards.length}
          </Text>
        </View>

        {/* Stats */}
        <SessionStats
          correct={session.correct}
          incorrect={session.incorrect}
          streak={session.streak}
          progress={progress}
        />

        {/* Card */}
        <View style={styles.cardWrapper}>
          <Animated.View
            key={cardKey}
            entering={SlideInRight.duration(300)}
            exiting={SlideOutLeft.duration(300)}
            style={styles.cardAnimationWrapper}
          >
            {currentCard.type === "mcq" ? (
              <MCQCard
                question={currentCard.question}
                options={currentCard.options || []}
                correctAnswer={currentCard.answer}
                rationale={currentCard.rationale}
                onAnswer={handleMCQAnswer}
              />
            ) : (
              <TermCard
                term={currentCard.question}
                definition={currentCard.answer}
                onGrade={handleGrade}
              />
            )}
          </Animated.View>
        </View>
      </ScreenContainer>
    );
  }

  // Start screen
  return (
    <ScreenContainer className="p-6">
      {/* Header */}
      <Animated.View entering={FadeInDown.delay(100).duration(500)}>
        <Text
          style={[styles.title, { color: colors.foreground }]}
        >
          iFlash Review
        </Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          Master your DFS-215 exam material
        </Text>
      </Animated.View>

      {/* Stats Card */}
      <Animated.View
        entering={FadeInDown.delay(200).duration(500)}
        style={[styles.statsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
      >
        <View style={styles.statsCardRow}>
          <View style={styles.statsCardItem}>
            <Text style={[styles.statsCardValue, { color: colors.primary }]}>
              {totalDue}
            </Text>
            <Text style={[styles.statsCardLabel, { color: colors.muted }]}>
              Cards Due
            </Text>
          </View>
          <View style={[styles.statsCardDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statsCardItem}>
            <Text style={[styles.statsCardValue, { color: colors.secondary }]}>
              {cards.length}
            </Text>
            <Text style={[styles.statsCardLabel, { color: colors.muted }]}>
              Total Cards
            </Text>
          </View>
        </View>
      </Animated.View>

      {/* Start Button */}
      <Animated.View entering={FadeInDown.delay(300).duration(500)}>
        <TouchableOpacity
          onPress={handleStartSession}
          disabled={cards.length === 0}
          style={[
            styles.startButton,
            {
              backgroundColor: cards.length > 0 ? colors.primary : colors.muted + "50",
            },
          ]}
        >
          <MaterialIcons name="play-arrow" size={28} color="#fff" />
          <Text style={styles.startButtonText}>
            {cards.length > 0 ? "Start Review Session" : "No Cards Available"}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Info Cards */}
      <Animated.View entering={FadeInDown.delay(400).duration(500)} style={styles.infoSection}>
        <Text style={[styles.infoTitle, { color: colors.foreground }]}>
          How iFlash Works
        </Text>
        
        <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.infoIcon, { backgroundColor: colors.primary + "20" }]}>
            <MaterialIcons name="psychology" size={20} color={colors.primary} />
          </View>
          <View style={styles.infoContent}>
            <Text style={[styles.infoCardTitle, { color: colors.foreground }]}>
              Spaced Repetition
            </Text>
            <Text style={[styles.infoCardText, { color: colors.muted }]}>
              Cards you struggle with appear more often. Easy cards space out over time.
            </Text>
          </View>
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.infoIcon, { backgroundColor: colors.secondary + "20" }]}>
            <MaterialIcons name="quiz" size={20} color={colors.secondary} />
          </View>
          <View style={styles.infoContent}>
            <Text style={[styles.infoCardTitle, { color: colors.foreground }]}>
              Two Card Types
            </Text>
            <Text style={[styles.infoCardText, { color: colors.muted }]}>
              MCQ cards test your knowledge. Term cards help memorize definitions.
            </Text>
          </View>
        </View>
      </Animated.View>
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
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  subtitle: {
    fontSize: 15,
    marginTop: 4,
    marginBottom: 24,
  },
  statsCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginBottom: 24,
  },
  statsCardRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statsCardItem: {
    flex: 1,
    alignItems: "center",
  },
  statsCardDivider: {
    width: 1,
    height: 40,
  },
  statsCardValue: {
    fontSize: 32,
    fontWeight: "700",
  },
  statsCardLabel: {
    fontSize: 13,
    marginTop: 4,
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 18,
    borderRadius: 16,
    marginBottom: 32,
  },
  startButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  infoSection: {
    gap: 12,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 14,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  infoContent: {
    flex: 1,
  },
  infoCardTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  infoCardText: {
    fontSize: 13,
    marginTop: 2,
    lineHeight: 18,
  },
  // Session styles
  sessionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  exitButton: {
    padding: 4,
  },
  sessionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  cardCount: {
    fontSize: 14,
  },
  statsContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: "rgba(128,128,128,0.2)",
    borderRadius: 2,
    marginBottom: 12,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 14,
    fontWeight: "600",
  },
  cardWrapper: {
    flex: 1,
    justifyContent: "center",
  },
  cardAnimationWrapper: {
    flex: 1,
  },
  // Complete screen
  completeContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    borderRadius: 24,
  },
  completeIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  completeEmoji: {
    fontSize: 40,
  },
  completeTitle: {
    fontSize: 28,
    fontWeight: "700",
  },
  completeSubtitle: {
    fontSize: 16,
    marginTop: 8,
    marginBottom: 32,
  },
  completeStats: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 32,
  },
  completeStat: {
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    minWidth: 90,
  },
  completeStatValue: {
    fontSize: 28,
    fontWeight: "700",
  },
  completeStatLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  completeActions: {
    width: "100%",
    gap: 12,
  },
  completeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
  },
  completeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  completeButtonOutline: {
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
  },
  completeButtonOutlineText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
