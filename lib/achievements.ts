/**
 * Achievement System for DFS Elite Study Planner
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { notificationService } from "./notifications";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement: number;
  category: "streak" | "cards" | "lessons" | "exams" | "score";
  unlockedAt?: number;
}

export const ACHIEVEMENTS: Record<string, Achievement> = {
  FIRST_CARD: {
    id: "first_card",
    title: "First Step",
    description: "Review your first flashcard",
    icon: "🎯",
    requirement: 1,
    category: "cards",
  },
  CARD_MASTER: {
    id: "card_master",
    title: "Card Master",
    description: "Review 100 flashcards",
    icon: "🎓",
    requirement: 100,
    category: "cards",
  },
  STREAK_WARRIOR: {
    id: "streak_warrior",
    title: "Streak Warrior",
    description: "Maintain a 7-day study streak",
    icon: "🔥",
    requirement: 7,
    category: "streak",
  },
  LESSON_COMPLETE: {
    id: "lesson_complete",
    title: "Lesson Learner",
    description: "Complete your first lesson",
    icon: "📚",
    requirement: 1,
    category: "lessons",
  },
  EXAM_PASSER: {
    id: "exam_passer",
    title: "Exam Passer",
    description: "Pass your first exam",
    icon: "✅",
    requirement: 1,
    category: "exams",
  },
  PERFECT_SCORE: {
    id: "perfect_score",
    title: "Perfect Score",
    description: "Score 100% on an exam",
    icon: "🌟",
    requirement: 100,
    category: "score",
  },
  CE_CERTIFIED: {
    id: "ce_certified",
    title: "CE Certified",
    description: "Earn all 24 CE hours",
    icon: "🏆",
    requirement: 24,
    category: "lessons",
  },
};

class AchievementService {
  async getUnlockedAchievements(): Promise<Achievement[]> {
    try {
      const data = await AsyncStorage.getItem("unlocked_achievements");
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error getting achievements:", error);
      return [];
    }
  }

  async checkAndUnlock(
    category: Achievement["category"],
    currentValue: number
  ): Promise<Achievement | null> {
    try {
      const unlocked = await this.getUnlockedAchievements();
      const unlockedIds = unlocked.map((a) => a.id);

      // Find matching achievement
      const achievement = Object.values(ACHIEVEMENTS).find(
        (a) =>
          a.category === category &&
          a.requirement <= currentValue &&
          !unlockedIds.includes(a.id)
      );

      if (achievement) {
        // Unlock it
        const unlockedAchievement = {
          ...achievement,
          unlockedAt: Date.now(),
        };

        unlocked.push(unlockedAchievement);
        await AsyncStorage.setItem(
          "unlocked_achievements",
          JSON.stringify(unlocked)
        );

        // Send notification
        await notificationService.scheduleAchievementNotification(
          `🎉 ${achievement.title}!`,
          achievement.description
        );

        return unlockedAchievement;
      }

      return null;
    } catch (error) {
      console.error("Error checking achievement:", error);
      return null;
    }
  }

  async getProgress(
    category: Achievement["category"],
    currentValue: number
  ): Promise<Array<{ achievement: Achievement; progress: number }>> {
    try {
      const unlocked = await this.getUnlockedAchievements();
      const unlockedIds = unlocked.map((a) => a.id);

      return Object.values(ACHIEVEMENTS)
        .filter((a) => a.category === category)
        .map((achievement) => ({
          achievement,
          progress: Math.min(
            (currentValue / achievement.requirement) * 100,
            100
          ),
          unlocked: unlockedIds.includes(achievement.id),
        }))
        .sort((a, b) => b.progress - a.progress);
    } catch (error) {
      console.error("Error getting progress:", error);
      return [];
    }
  }

  async clearAchievements() {
    try {
      await AsyncStorage.removeItem("unlocked_achievements");
    } catch (error) {
      console.error("Error clearing achievements:", error);
    }
  }
}

export const achievementService = new AchievementService();
