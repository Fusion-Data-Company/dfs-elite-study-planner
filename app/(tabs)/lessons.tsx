/**
 * Lessons Screen - Course Browser
 */

import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Platform,
  StyleSheet,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useLessons, type Lesson } from "@/hooks/useLessons";
import { useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useAuth } from "@clerk/clerk-expo";

// Lesson card component
function LessonCard({
  lesson,
  onPress,
  index,
}: {
  lesson: Lesson;
  onPress: () => void;
  index: number;
}) {
  const colors = useColors();
  const progress = lesson.progress || 0;
  const isCompleted = lesson.completed || progress >= 100;

  return (
    <Animated.View entering={FadeInRight.delay(index * 50).duration(300)}>
      <TouchableOpacity
        onPress={onPress}
        style={[styles.lessonCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
        activeOpacity={0.7}
      >
        {/* Progress indicator */}
        <View
          style={[
            styles.progressIndicator,
            {
              backgroundColor: isCompleted
                ? colors.success
                : progress > 0
                ? colors.primary
                : colors.muted + "30",
            },
          ]}
        >
          {isCompleted ? (
            <MaterialIcons name="check" size={16} color="#fff" />
          ) : (
            <Text style={styles.lessonNumber}>{index + 1}</Text>
          )}
        </View>

        {/* Lesson info */}
        <View style={styles.lessonInfo}>
          <Text style={[styles.lessonTitle, { color: colors.foreground }]} numberOfLines={2}>
            {lesson.title}
          </Text>
          <View style={styles.lessonMeta}>
            <View style={styles.metaItem}>
              <MaterialIcons name="schedule" size={14} color={colors.muted} />
              <Text style={[styles.metaText, { color: colors.muted }]}>
                {lesson.duration} min
              </Text>
            </View>
            {lesson.ceHours > 0 && (
              <View style={styles.metaItem}>
                <MaterialIcons name="verified" size={14} color={colors.primary} />
                <Text style={[styles.metaText, { color: colors.primary }]}>
                  {lesson.ceHours} CE
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Progress bar */}
        {progress > 0 && !isCompleted && (
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { backgroundColor: colors.muted + "30" }]}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progress}%`, backgroundColor: colors.primary },
                ]}
              />
            </View>
            <Text style={[styles.progressText, { color: colors.muted }]}>{progress}%</Text>
          </View>
        )}

        <MaterialIcons name="chevron-right" size={20} color={colors.muted} />
      </TouchableOpacity>
    </Animated.View>
  );
}

// Module header component
function ModuleHeader({ title, lessonCount }: { title: string; lessonCount: number }) {
  const colors = useColors();

  return (
    <View style={styles.moduleHeader}>
      <Text style={[styles.moduleTitle, { color: colors.foreground }]}>{title}</Text>
      <Text style={[styles.moduleCount, { color: colors.muted }]}>
        {lessonCount} lessons
      </Text>
    </View>
  );
}

export default function LessonsScreen() {
  const colors = useColors();
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { data: lessons, isLoading, error, refetch } = useLessons();

  const handleLessonPress = (lesson: Lesson) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push({ pathname: "/lesson/[slug]", params: { slug: lesson.slug } });
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
            Please sign in to access lessons
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
            Loading lessons...
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

  // Group lessons by module
  const groupedLessons = lessons?.reduce((acc, lesson) => {
    const module = lesson.moduleTitle || "General";
    if (!acc[module]) {
      acc[module] = [];
    }
    acc[module].push(lesson);
    return acc;
  }, {} as Record<string, Lesson[]>) || {};

  const modules = Object.entries(groupedLessons);

  return (
    <ScreenContainer>
      <FlatList
        data={modules}
        keyExtractor={([module]) => module}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.header}>
            <Text style={[styles.title, { color: colors.foreground }]}>
              Instructor Lessons
            </Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>
              {lessons?.length || 0} lessons • DFS-215 Exam Prep
            </Text>

            {/* Progress overview */}
            <View style={[styles.overviewCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.overviewItem}>
                <Text style={[styles.overviewValue, { color: colors.primary }]}>
                  {lessons?.filter(l => l.completed).length || 0}
                </Text>
                <Text style={[styles.overviewLabel, { color: colors.muted }]}>
                  Completed
                </Text>
              </View>
              <View style={[styles.overviewDivider, { backgroundColor: colors.border }]} />
              <View style={styles.overviewItem}>
                <Text style={[styles.overviewValue, { color: colors.secondary }]}>
                  {lessons?.filter(l => (l.progress || 0) > 0 && !l.completed).length || 0}
                </Text>
                <Text style={[styles.overviewLabel, { color: colors.muted }]}>
                  In Progress
                </Text>
              </View>
              <View style={[styles.overviewDivider, { backgroundColor: colors.border }]} />
              <View style={styles.overviewItem}>
                <Text style={[styles.overviewValue, { color: colors.accent }]}>
                  {lessons?.reduce((sum, l) => sum + (l.ceHours || 0), 0) || 0}
                </Text>
                <Text style={[styles.overviewLabel, { color: colors.muted }]}>
                  Total CE
                </Text>
              </View>
            </View>
          </Animated.View>
        }
        renderItem={({ item: [module, moduleLessons], index }) => (
          <View key={module} style={styles.moduleSection}>
            <ModuleHeader title={module} lessonCount={moduleLessons.length} />
            {moduleLessons.map((lesson, lessonIndex) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                onPress={() => handleLessonPress(lesson)}
                index={index * 10 + lessonIndex}
              />
            ))}
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="school" size={48} color={colors.muted} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              No Lessons Available
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.muted }]}>
              Check back later for new content
            </Text>
          </View>
        }
      />
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
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  subtitle: {
    fontSize: 15,
    marginTop: 4,
    marginBottom: 20,
  },
  overviewCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  overviewItem: {
    flex: 1,
    alignItems: "center",
  },
  overviewDivider: {
    width: 1,
    height: 32,
  },
  overviewValue: {
    fontSize: 24,
    fontWeight: "700",
  },
  overviewLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  moduleSection: {
    marginBottom: 24,
  },
  moduleHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  moduleTitle: {
    fontSize: 17,
    fontWeight: "600",
  },
  moduleCount: {
    fontSize: 13,
  },
  lessonCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    gap: 12,
  },
  progressIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  lessonNumber: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 15,
    fontWeight: "500",
    lineHeight: 20,
  },
  lessonMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 6,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
  },
  progressBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    width: 80,
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  progressText: {
    fontSize: 11,
    width: 28,
    textAlign: "right",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    paddingTop: 60,
    gap: 8,
  },
});
