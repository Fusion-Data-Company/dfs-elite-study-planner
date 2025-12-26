/**
 * Home Screen - Dashboard with Real API Data
 */

import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator, Platform, StyleSheet } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useUserMetrics, useCourseProgress } from "@/hooks/useProgress";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useRouter, Link } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

// Stat card component
function StatCard({
  icon,
  label,
  value,
  color,
  index,
}: {
  icon: string;
  label: string;
  value: string | number;
  color: string;
  index: number;
}) {
  const colors = useColors();

  return (
    <Animated.View
      entering={FadeInRight.delay(index * 100).duration(400)}
      style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <View style={[styles.statIcon, { backgroundColor: color + "20" }]}>
        <MaterialIcons name={icon as any} size={20} color={color} />
      </View>
      <Text style={[styles.statValue, { color: colors.foreground }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.muted }]}>{label}</Text>
    </Animated.View>
  );
}

// Quick action button component
function QuickAction({
  icon,
  label,
  color,
  onPress,
  index,
}: {
  icon: string;
  label: string;
  color: string;
  onPress: () => void;
  index: number;
}) {
  const colors = useColors();

  return (
    <Animated.View entering={FadeInDown.delay(300 + index * 100).duration(400)}>
      <TouchableOpacity
        onPress={onPress}
        style={[styles.quickAction, { backgroundColor: colors.surface, borderColor: colors.border }]}
        activeOpacity={0.7}
      >
        <View style={[styles.quickActionIcon, { backgroundColor: color + "20" }]}>
          <MaterialIcons name={icon as any} size={24} color={color} />
        </View>
        <Text style={[styles.quickActionLabel, { color: colors.foreground }]}>{label}</Text>
        <MaterialIcons name="chevron-right" size={20} color={colors.muted} />
      </TouchableOpacity>
    </Animated.View>
  );
}

// Progress ring component
function ProgressRing({ progress, size = 120 }: { progress: number; size?: number }) {
  const colors = useColors();
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <View style={[styles.progressRingBg, { width: size, height: size, borderRadius: size / 2, borderWidth: strokeWidth, borderColor: colors.muted + "30" }]} />
      <View
        style={[
          styles.progressRingFill,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: colors.primary,
            borderTopColor: "transparent",
            borderRightColor: progress > 25 ? colors.primary : "transparent",
            borderBottomColor: progress > 50 ? colors.primary : "transparent",
            borderLeftColor: progress > 75 ? colors.primary : "transparent",
            transform: [{ rotate: "-90deg" }],
          },
        ]}
      />
      <View style={styles.progressRingCenter}>
        <Text style={[styles.progressRingValue, { color: colors.foreground }]}>{progress}%</Text>
        <Text style={[styles.progressRingLabel, { color: colors.muted }]}>Complete</Text>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const { isSignedIn, signOut } = useAuth();
  const { user } = useUser();
  const { data: metrics, isLoading: metricsLoading } = useUserMetrics();
  const { data: courseProgress, isLoading: progressLoading } = useCourseProgress();

  const handleQuickAction = (route: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(route as any);
  };

  // Not signed in - show welcome screen
  if (!isSignedIn) {
    return (
      <ScreenContainer className="p-6">
        <View style={styles.welcomeContainer}>
          <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.welcomeHeader}>
            <View style={[styles.welcomeLogo, { backgroundColor: colors.primary + "20" }]}>
              <Text style={styles.welcomeLogoText}>🎓</Text>
            </View>
            <Text style={[styles.welcomeTitle, { color: colors.foreground }]}>
              DFS Elite
            </Text>
            <Text style={[styles.welcomeSubtitle, { color: colors.muted }]}>
              Learning Platform
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.welcomeContent}>
            <Text style={[styles.welcomeDescription, { color: colors.muted }]}>
              Master your Florida insurance exam with our comprehensive study tools, AI tutors, and practice exams.
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.welcomeActions}>
            <Link href="/(auth)/sign-in" asChild>
              <TouchableOpacity style={[styles.welcomeButton, { backgroundColor: colors.primary }]}>
                <Text style={styles.welcomeButtonText}>Sign In</Text>
              </TouchableOpacity>
            </Link>
            <Link href="/(auth)/sign-up" asChild>
              <TouchableOpacity style={[styles.welcomeButtonOutline, { borderColor: colors.border }]}>
                <Text style={[styles.welcomeButtonOutlineText, { color: colors.foreground }]}>
                  Create Account
                </Text>
              </TouchableOpacity>
            </Link>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400).duration(500)} style={styles.welcomeFeatures}>
            <View style={styles.featureItem}>
              <MaterialIcons name="layers" size={20} color={colors.primary} />
              <Text style={[styles.featureText, { color: colors.muted }]}>487+ Flashcards</Text>
            </View>
            <View style={styles.featureItem}>
              <MaterialIcons name="psychology" size={20} color={colors.secondary} />
              <Text style={[styles.featureText, { color: colors.muted }]}>3 AI Tutors</Text>
            </View>
            <View style={styles.featureItem}>
              <MaterialIcons name="menu-book" size={20} color={colors.accent} />
              <Text style={[styles.featureText, { color: colors.muted }]}>100 Lessons</Text>
            </View>
          </Animated.View>
        </View>
      </ScreenContainer>
    );
  }

  const isLoading = metricsLoading || progressLoading;

  return (
    <ScreenContainer className="p-6">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.muted }]}>
              Welcome back,
            </Text>
            <Text style={[styles.userName, { color: colors.foreground }]}>
              {user?.firstName || "Student"}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/settings")}
            style={[styles.profileButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <MaterialIcons name="person" size={24} color={colors.foreground} />
          </TouchableOpacity>
        </Animated.View>

        {/* Progress Overview */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(500)}
          style={[styles.progressCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <View style={styles.progressHeader}>
            <Text style={[styles.progressTitle, { color: colors.foreground }]}>
              DFS-215 Progress
            </Text>
            <View style={[styles.streakBadge, { backgroundColor: colors.accent + "20" }]}>
              <MaterialIcons name="local-fire-department" size={16} color={colors.accent} />
              <Text style={[styles.streakText, { color: colors.accent }]}>
                {metrics?.studyStreak || 0} day streak
              </Text>
            </View>
          </View>
          
          <View style={styles.progressContent}>
            {isLoading ? (
              <ActivityIndicator size="large" color={colors.primary} />
            ) : (
              <>
                <ProgressRing progress={courseProgress?.overallProgress || 0} />
                <View style={styles.progressStats}>
                  <View style={styles.progressStatItem}>
                    <Text style={[styles.progressStatValue, { color: colors.primary }]}>
                      {metrics?.lessonsCompleted || 0}
                    </Text>
                    <Text style={[styles.progressStatLabel, { color: colors.muted }]}>
                      Lessons Done
                    </Text>
                  </View>
                  <View style={styles.progressStatItem}>
                    <Text style={[styles.progressStatValue, { color: colors.secondary }]}>
                      {metrics?.iflashDue || 0}
                    </Text>
                    <Text style={[styles.progressStatLabel, { color: colors.muted }]}>
                      Cards Due
                    </Text>
                  </View>
                  <View style={styles.progressStatItem}>
                    <Text style={[styles.progressStatValue, { color: colors.accent }]}>
                      {metrics?.ceHours || 0}
                    </Text>
                    <Text style={[styles.progressStatLabel, { color: colors.muted }]}>
                      CE Hours
                    </Text>
                  </View>
                </View>
              </>
            )}
          </View>
        </Animated.View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            icon="layers"
            label="Cards Due"
            value={metrics?.iflashDue || 0}
            color={colors.primary}
            index={0}
          />
          <StatCard
            icon="check-circle"
            label="Quiz Score"
            value={`${metrics?.averageScore || 0}%`}
            color={colors.secondary}
            index={1}
          />
          <StatCard
            icon="schedule"
            label="CE Hours"
            value={`${metrics?.ceHours || 0}h`}
            color={colors.accent}
            index={2}
          />
          <StatCard
            icon="emoji-events"
            label="Quizzes Passed"
            value={metrics?.quizzesPassed || 0}
            color="#8b5cf6"
            index={3}
          />
        </View>

        {/* Quick Actions */}
        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Quick Actions
          </Text>
        </Animated.View>

        <View style={styles.quickActions}>
          <QuickAction
            icon="layers"
            label="Review Flashcards"
            color={colors.primary}
            onPress={() => handleQuickAction("/(tabs)/flashcards")}
            index={0}
          />
          <QuickAction
            icon="quiz"
            label="Take Practice Quiz"
            color={colors.secondary}
            onPress={() => handleQuickAction("/(tabs)/quiz")}
            index={1}
          />
          <QuickAction
            icon="psychology"
            label="Chat with AI Tutor"
            color={colors.accent}
            onPress={() => handleQuickAction("/(tabs)/agents")}
            index={2}
          />
          <QuickAction
            icon="menu-book"
            label="Continue Lessons"
            color="#8b5cf6"
            onPress={() => handleQuickAction("/(tabs)/lessons")}
            index={3}
          />
        </View>

        {/* Daily Tip */}
        <Animated.View
          entering={FadeInDown.delay(700).duration(500)}
          style={[styles.tipCard, { backgroundColor: colors.primary + "10", borderColor: colors.primary + "30" }]}
        >
          <View style={styles.tipHeader}>
            <MaterialIcons name="lightbulb" size={20} color={colors.primary} />
            <Text style={[styles.tipTitle, { color: colors.primary }]}>Daily Tip</Text>
          </View>
          <Text style={[styles.tipText, { color: colors.foreground }]}>
            Review your flashcards daily to maximize retention. The spaced repetition system shows you cards right when you're about to forget them!
          </Text>
        </Animated.View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  // Welcome screen styles
  welcomeContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  welcomeHeader: {
    alignItems: "center",
    marginBottom: 32,
  },
  welcomeLogo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  welcomeLogoText: {
    fontSize: 40,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  welcomeSubtitle: {
    fontSize: 16,
    marginTop: 4,
  },
  welcomeContent: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  welcomeDescription: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  welcomeActions: {
    width: "100%",
    gap: 12,
    marginBottom: 40,
  },
  welcomeButton: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  welcomeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  welcomeButtonOutline: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
  },
  welcomeButtonOutlineText: {
    fontSize: 16,
    fontWeight: "600",
  },
  welcomeFeatures: {
    flexDirection: "row",
    gap: 24,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  featureText: {
    fontSize: 13,
  },

  // Dashboard styles
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  greeting: {
    fontSize: 14,
  },
  userName: {
    fontSize: 24,
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  progressCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  streakText: {
    fontSize: 13,
    fontWeight: "600",
  },
  progressContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  progressStats: {
    gap: 16,
  },
  progressStatItem: {
    alignItems: "center",
  },
  progressStatValue: {
    fontSize: 24,
    fontWeight: "700",
  },
  progressStatLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  progressRingBg: {
    position: "absolute",
  },
  progressRingFill: {
    position: "absolute",
  },
  progressRingCenter: {
    alignItems: "center",
  },
  progressRingValue: {
    fontSize: 28,
    fontWeight: "700",
  },
  progressRingLabel: {
    fontSize: 12,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 28,
  },
  statCard: {
    width: "47%",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  quickActions: {
    gap: 10,
    marginBottom: 24,
  },
  quickAction: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  quickActionLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
  },
  tipCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 24,
  },
  tipHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  tipText: {
    fontSize: 13,
    lineHeight: 20,
  },
});
