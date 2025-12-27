/**
 * User Profile Screen
 */

import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { ScreenContainer } from "@/components/screen-container";
import { AchievementBadge } from "@/components/AchievementBadge";
import { useColors } from "@/hooks/use-colors";
import { useUserMetrics } from "@/hooks/useProgress";
import { achievementService, ACHIEVEMENTS } from "@/lib/achievements";
import { Ionicons } from "@expo/vector-icons";

export default function ProfileScreen() {
  const colors = useColors();
  const { signOut } = useAuth();
  const { user: clerkUser } = useUser();
  const { data: metrics, isLoading } = useUserMetrics();
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      const unlocked = await achievementService.getUnlockedAchievements();
      setAchievements(unlocked);
    } catch (error) {
      console.error("Error loading achievements:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const unlockedIds = achievements.map((a) => a.id);

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-6">
        {/* Header */}
        <View className="items-center gap-4 mb-8">
          <View
            className="w-20 h-20 rounded-full items-center justify-center"
            style={{ backgroundColor: colors.primary }}
          >
            <Ionicons name="person" size={40} color={colors.background} />
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold text-foreground">
              {clerkUser?.firstName || "User"}
            </Text>
            <Text className="text-sm text-muted mt-1">
              {clerkUser?.emailAddresses[0]?.emailAddress}
            </Text>
          </View>
        </View>

        {/* Stats */}
        {isLoading ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : (
          <View className="gap-3 mb-8">
            <View
              className="p-4 rounded-xl flex-row justify-between items-center"
              style={{ backgroundColor: colors.surface }}
            >
              <View>
                <Text className="text-sm text-muted">Overall Progress</Text>
                <Text className="text-2xl font-bold text-foreground mt-1">
                  {metrics?.overallProgress || 0}%
                </Text>
              </View>
              <View className="w-12 h-12 rounded-full items-center justify-center" style={{ backgroundColor: colors.primary }}>
                <Text className="text-white font-bold">
                  {metrics?.overallProgress || 0}%
                </Text>
              </View>
            </View>

            <View className="flex-row gap-3">
              <View
                className="flex-1 p-4 rounded-xl"
                style={{ backgroundColor: colors.surface }}
              >
                <Text className="text-xs text-muted">Study Streak</Text>
                <Text className="text-xl font-bold text-foreground mt-1">
                  {metrics?.studyStreak || 0} days
                </Text>
              </View>
              <View
                className="flex-1 p-4 rounded-xl"
                style={{ backgroundColor: colors.surface }}
              >
                <Text className="text-xs text-muted">CE Hours</Text>
                <Text className="text-xl font-bold text-foreground mt-1">
                  {metrics?.ceHours || 0}/{metrics?.ceHoursTotal || 24}
                </Text>
              </View>
            </View>

            <View className="flex-row gap-3">
              <View
                className="flex-1 p-4 rounded-xl"
                style={{ backgroundColor: colors.surface }}
              >
                <Text className="text-xs text-muted">Lessons</Text>
                <Text className="text-xl font-bold text-foreground mt-1">
                  {metrics?.lessonsCompleted || 0}
                </Text>
              </View>
              <View
                className="flex-1 p-4 rounded-xl"
                style={{ backgroundColor: colors.surface }}
              >
                <Text className="text-xs text-muted">Quizzes Passed</Text>
                <Text className="text-xl font-bold text-foreground mt-1">
                  {metrics?.quizzesPassed || 0}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Achievements */}
        <View className="mb-8">
          <Text className="text-lg font-bold text-foreground mb-4">
            Achievements ({achievements.length})
          </Text>

          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : achievements.length > 0 ? (
            <View className="flex-row flex-wrap gap-4">
              {Object.values(ACHIEVEMENTS).map((achievement) => (
                <View key={achievement.id} className="w-1/3">
                  <AchievementBadge
                    achievement={achievement}
                    unlocked={unlockedIds.includes(achievement.id)}
                  />
                </View>
              ))}
            </View>
          ) : (
            <Text className="text-sm text-muted text-center py-8">
              Keep studying to unlock achievements!
            </Text>
          )}
        </View>

        {/* Sign Out */}
        <Pressable
          onPress={handleSignOut}
          className="mt-auto p-4 rounded-xl items-center border-2"
          style={({ pressed }) => [
            {
              borderColor: colors.error,
              backgroundColor: pressed ? colors.error : "transparent",
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <Text
            className="font-semibold"
            style={{ color: colors.error }}
          >
            Sign Out
          </Text>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}
