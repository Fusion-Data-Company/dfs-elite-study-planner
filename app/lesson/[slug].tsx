/**
 * Lesson Detail Screen
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
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useEnhancedLesson, useLessonProgress } from "@/hooks/useLessons";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

// Checkpoint item component
function CheckpointItem({
  checkpoint,
  onToggle,
  index,
}: {
  checkpoint: {
    id: string;
    title: string;
    content: string;
    completed: boolean;
  };
  onToggle: () => void;
  index: number;
}) {
  const colors = useColors();

  return (
    <Animated.View entering={FadeInDown.delay(index * 100).duration(400)}>
      <TouchableOpacity
        onPress={onToggle}
        style={[styles.checkpointCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.checkpointIndicator,
            {
              backgroundColor: checkpoint.completed ? colors.success : colors.muted + "30",
              borderColor: checkpoint.completed ? colors.success : colors.muted,
            },
          ]}
        >
          {checkpoint.completed && (
            <MaterialIcons name="check" size={14} color="#fff" />
          )}
        </View>
        <View style={styles.checkpointContent}>
          <Text
            style={[
              styles.checkpointTitle,
              {
                color: colors.foreground,
                textDecorationLine: checkpoint.completed ? "line-through" : "none",
                opacity: checkpoint.completed ? 0.7 : 1,
              },
            ]}
          >
            {checkpoint.title}
          </Text>
          <Text style={[styles.checkpointText, { color: colors.muted }]} numberOfLines={2}>
            {checkpoint.content}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function LessonDetailScreen() {
  const colors = useColors();
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { data: lesson, isLoading, error } = useEnhancedLesson(slug || "");
  const { saveCheckpoint, saveProgress, isSaving } = useLessonProgress();
  const [localCheckpoints, setLocalCheckpoints] = useState<Record<string, boolean>>({});

  // Initialize local checkpoints from lesson data
  useEffect(() => {
    if (lesson?.checkpoints) {
      const initial: Record<string, boolean> = {};
      lesson.checkpoints.forEach((cp) => {
        initial[cp.id] = cp.completed;
      });
      setLocalCheckpoints(initial);
    }
  }, [lesson]);

  const handleToggleCheckpoint = (checkpointId: string) => {
    if (!lesson) return;

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const newCompleted = !localCheckpoints[checkpointId];
    setLocalCheckpoints((prev) => ({
      ...prev,
      [checkpointId]: newCompleted,
    }));

    saveCheckpoint({
      lessonId: lesson.id,
      checkpointId,
      completed: newCompleted,
    });
  };

  const handleMarkComplete = () => {
    if (!lesson) return;

    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    saveProgress({
      lessonId: lesson.id,
      progress: 100,
      completed: true,
    });

    router.back();
  };

  // Calculate progress
  const completedCount = Object.values(localCheckpoints).filter(Boolean).length;
  const totalCount = lesson?.checkpoints?.length || 0;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Loading state
  if (isLoading) {
    return (
      <ScreenContainer className="p-6">
        <Stack.Screen options={{ title: "Loading..." }} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </ScreenContainer>
    );
  }

  // Error state
  if (error || !lesson) {
    return (
      <ScreenContainer className="p-6">
        <Stack.Screen options={{ title: "Error" }} />
        <View style={styles.centerContainer}>
          <MaterialIcons name="error-outline" size={48} color={colors.error} />
          <Text style={[styles.errorTitle, { color: colors.foreground }]}>
            Failed to Load Lesson
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.backButton, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer edges={["left", "right"]}>
      <Stack.Screen options={{ title: lesson.title }} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <Animated.View entering={FadeIn.duration(500)} style={styles.header}>
          <View style={[styles.trackBadge, { backgroundColor: colors.primary + "20" }]}>
            <Text style={[styles.trackText, { color: colors.primary }]}>
              {lesson.trackTitle}
            </Text>
          </View>
          <Text style={[styles.title, { color: colors.foreground }]}>
            {lesson.title}
          </Text>
          <Text style={[styles.description, { color: colors.muted }]}>
            {lesson.description}
          </Text>

          {/* Meta info */}
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <MaterialIcons name="schedule" size={16} color={colors.muted} />
              <Text style={[styles.metaText, { color: colors.muted }]}>
                {lesson.duration} min
              </Text>
            </View>
            {lesson.ceHours > 0 && (
              <View style={styles.metaItem}>
                <MaterialIcons name="verified" size={16} color={colors.primary} />
                <Text style={[styles.metaText, { color: colors.primary }]}>
                  {lesson.ceHours} CE Hours
                </Text>
              </View>
            )}
          </View>
        </Animated.View>

        {/* Progress Card */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(500)}
          style={[styles.progressCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <View style={styles.progressHeader}>
            <Text style={[styles.progressTitle, { color: colors.foreground }]}>
              Your Progress
            </Text>
            <Text style={[styles.progressPercent, { color: colors.primary }]}>
              {progress}%
            </Text>
          </View>
          <View style={[styles.progressBar, { backgroundColor: colors.muted + "30" }]}>
            <View
              style={[
                styles.progressFill,
                { width: `${progress}%`, backgroundColor: colors.primary },
              ]}
            />
          </View>
          <Text style={[styles.progressSubtext, { color: colors.muted }]}>
            {completedCount} of {totalCount} checkpoints completed
          </Text>
        </Animated.View>

        {/* Checkpoints */}
        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Learning Checkpoints
          </Text>
        </Animated.View>

        <View style={styles.checkpointsList}>
          {lesson.checkpoints?.map((checkpoint, index) => (
            <CheckpointItem
              key={checkpoint.id}
              checkpoint={{
                ...checkpoint,
                completed: localCheckpoints[checkpoint.id] || false,
              }}
              onToggle={() => handleToggleCheckpoint(checkpoint.id)}
              index={index}
            />
          ))}
        </View>

        {/* Complete Button */}
        {progress === 100 && (
          <Animated.View entering={FadeIn.duration(400)}>
            <TouchableOpacity
              onPress={handleMarkComplete}
              disabled={isSaving}
              style={[styles.completeButton, { backgroundColor: colors.success }]}
            >
              <MaterialIcons name="check-circle" size={22} color="#fff" />
              <Text style={styles.completeButtonText}>
                {isSaving ? "Saving..." : "Mark Lesson Complete"}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}
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
  errorTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 8,
  },
  backButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  trackBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 12,
  },
  trackText: {
    fontSize: 12,
    fontWeight: "600",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    lineHeight: 34,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: 12,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    marginTop: 16,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontSize: 14,
  },
  progressCard: {
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 28,
  },
  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  progressPercent: {
    fontSize: 18,
    fontWeight: "700",
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressSubtext: {
    fontSize: 13,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  checkpointsList: {
    gap: 12,
    marginBottom: 24,
  },
  checkpointCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 14,
  },
  checkpointIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  checkpointContent: {
    flex: 1,
  },
  checkpointTitle: {
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 20,
  },
  checkpointText: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
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
});
