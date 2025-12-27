/**
 * Achievement Badge Component
 */

import React from "react";
import { View, Text, Pressable } from "react-native";
import { Achievement } from "@/lib/achievements";
import { useColors } from "@/hooks/use-colors";

interface AchievementBadgeProps {
  achievement: Achievement;
  unlocked: boolean;
  progress?: number;
  onPress?: () => void;
}

export function AchievementBadge({
  achievement,
  unlocked,
  progress = 0,
  onPress,
}: AchievementBadgeProps) {
  const colors = useColors();

  return (
    <Pressable
      onPress={onPress}
      className="items-center gap-2"
      style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
    >
      <View
        className="w-16 h-16 rounded-full items-center justify-center border-2"
        style={{
          backgroundColor: unlocked ? colors.primary : colors.surface,
          borderColor: unlocked ? colors.primary : colors.border,
          opacity: unlocked ? 1 : 0.5,
        }}
      >
        <Text className="text-3xl">{achievement.icon}</Text>
      </View>

      <Text
        className="text-xs font-semibold text-center"
        style={{ color: unlocked ? colors.foreground : colors.muted }}
      >
        {achievement.title}
      </Text>

      {!unlocked && progress !== undefined && (
        <View className="w-12 h-1 bg-border rounded-full overflow-hidden">
          <View
            className="h-full bg-primary"
            style={{ width: `${progress}%` }}
          />
        </View>
      )}
    </Pressable>
  );
}
