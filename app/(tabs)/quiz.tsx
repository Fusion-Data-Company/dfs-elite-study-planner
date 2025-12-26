/**
 * Quiz Screen - Question Banks and Exam Selection
 */

import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
  StyleSheet,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useQuestionBanks, type QuestionBank } from "@/hooks/useExams";
import { useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useAuth } from "@clerk/clerk-expo";

// Question bank card component
function QuestionBankCard({
  bank,
  onPress,
  index,
}: {
  bank: QuestionBank;
  onPress: () => void;
  index: number;
}) {
  const colors = useColors();

  return (
    <Animated.View entering={FadeInRight.delay(index * 100).duration(400)}>
      <TouchableOpacity
        onPress={onPress}
        style={[styles.bankCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
        activeOpacity={0.7}
      >
        <View style={[styles.bankIcon, { backgroundColor: colors.primary + "20" }]}>
          <MaterialIcons name="quiz" size={24} color={colors.primary} />
        </View>
        <View style={styles.bankInfo}>
          <Text style={[styles.bankTitle, { color: colors.foreground }]}>
            {bank.title}
          </Text>
          <Text style={[styles.bankDescription, { color: colors.muted }]} numberOfLines={2}>
            {bank.description}
          </Text>
          <View style={styles.bankMeta}>
            <View style={styles.metaItem}>
              <MaterialIcons name="help-outline" size={14} color={colors.muted} />
              <Text style={[styles.metaText, { color: colors.muted }]}>
                {bank.questionCount} questions
              </Text>
            </View>
            <View style={styles.metaItem}>
              <MaterialIcons name="timer" size={14} color={colors.muted} />
              <Text style={[styles.metaText, { color: colors.muted }]}>
                {bank.timeLimit} min
              </Text>
            </View>
            <View style={styles.metaItem}>
              <MaterialIcons name="verified" size={14} color={colors.success} />
              <Text style={[styles.metaText, { color: colors.success }]}>
                {bank.passingScore}% to pass
              </Text>
            </View>
          </View>
        </View>
        <View style={[styles.bankArrow, { backgroundColor: colors.primary + "20" }]}>
          <MaterialIcons name="play-arrow" size={20} color={colors.primary} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// Exam type card component
function ExamTypeCard({
  title,
  description,
  icon,
  color,
  onPress,
  index,
}: {
  title: string;
  description: string;
  icon: string;
  color: string;
  onPress: () => void;
  index: number;
}) {
  const colors = useColors();

  return (
    <Animated.View entering={FadeInDown.delay(200 + index * 100).duration(400)}>
      <TouchableOpacity
        onPress={onPress}
        style={[styles.examTypeCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
        activeOpacity={0.7}
      >
        <View style={[styles.examTypeIcon, { backgroundColor: color + "20" }]}>
          <MaterialIcons name={icon as any} size={28} color={color} />
        </View>
        <Text style={[styles.examTypeTitle, { color: colors.foreground }]}>
          {title}
        </Text>
        <Text style={[styles.examTypeDescription, { color: colors.muted }]}>
          {description}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function QuizScreen() {
  const colors = useColors();
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { data: banks, isLoading, error, refetch } = useQuestionBanks();

  const handleBankPress = (bank: QuestionBank) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.push({ pathname: "/exam/[bankId]", params: { bankId: bank.id } });
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
            Please sign in to access quizzes and exams
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
            Loading question banks...
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-6">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)}>
          <Text style={[styles.title, { color: colors.foreground }]}>
            Practice & Exams
          </Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Test your knowledge with practice quizzes and timed exams
          </Text>
        </Animated.View>

        {/* Exam Types */}
        <View style={styles.examTypesRow}>
          <ExamTypeCard
            title="Practice Quiz"
            description="Untimed, with explanations"
            icon="school"
            color={colors.primary}
            onPress={() => {}}
            index={0}
          />
          <ExamTypeCard
            title="Timed Exam"
            description="Simulates real exam"
            icon="timer"
            color={colors.accent}
            onPress={() => {}}
            index={1}
          />
        </View>

        {/* Question Banks */}
        <Animated.View entering={FadeInDown.delay(400).duration(500)}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Question Banks
          </Text>
        </Animated.View>

        {error ? (
          <View style={styles.errorContainer}>
            <MaterialIcons name="error-outline" size={32} color={colors.error} />
            <Text style={[styles.errorText, { color: colors.muted }]}>
              Failed to load question banks
            </Text>
            <TouchableOpacity
              onPress={() => refetch()}
              style={[styles.retryButton, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.banksList}>
            {banks && banks.length > 0 ? (
              banks.map((bank, index) => (
                <QuestionBankCard
                  key={bank.id}
                  bank={bank}
                  onPress={() => handleBankPress(bank)}
                  index={index}
                />
              ))
            ) : (
              <View style={styles.emptyBanks}>
                <MaterialIcons name="quiz" size={40} color={colors.muted} />
                <Text style={[styles.emptyBanksText, { color: colors.muted }]}>
                  No question banks available yet
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Tips Section */}
        <Animated.View
          entering={FadeInDown.delay(600).duration(500)}
          style={[styles.tipsCard, { backgroundColor: colors.primary + "10", borderColor: colors.primary + "30" }]}
        >
          <View style={styles.tipsHeader}>
            <MaterialIcons name="lightbulb" size={20} color={colors.primary} />
            <Text style={[styles.tipsTitle, { color: colors.primary }]}>
              Exam Tips
            </Text>
          </View>
          <Text style={[styles.tipsText, { color: colors.foreground }]}>
            • Read each question carefully before answering{"\n"}
            • Flag difficult questions and return to them later{"\n"}
            • Manage your time - don't spend too long on one question{"\n"}
            • Review your answers before submitting
          </Text>
        </Animated.View>
      </ScrollView>
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
  examTypesRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 28,
  },
  examTypeCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
  },
  examTypeIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  examTypeTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  examTypeDescription: {
    fontSize: 12,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  banksList: {
    gap: 12,
    marginBottom: 24,
  },
  bankCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 14,
  },
  bankIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  bankInfo: {
    flex: 1,
  },
  bankTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  bankDescription: {
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  bankMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 8,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
  },
  bankArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  errorContainer: {
    alignItems: "center",
    padding: 24,
    gap: 8,
  },
  errorText: {
    fontSize: 14,
  },
  retryButton: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  emptyBanks: {
    alignItems: "center",
    padding: 32,
    gap: 8,
  },
  emptyBanksText: {
    fontSize: 14,
  },
  tipsCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 24,
  },
  tipsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  tipsTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  tipsText: {
    fontSize: 13,
    lineHeight: 22,
  },
});
