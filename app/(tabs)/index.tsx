import { ScrollView, Text, View, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface StudyStats {
  overallProgress: number;
  studyStreak: number;
  iflashDue: number;
  ceHours: number;
  ceHoursTotal: number;
  lessonsCompleted: number;
  quizzesPassed: number;
  averageScore: number;
}

const defaultStats: StudyStats = {
  overallProgress: 0,
  studyStreak: 0,
  iflashDue: 0,
  ceHours: 0,
  ceHoursTotal: 24,
  lessonsCompleted: 0,
  quizzesPassed: 0,
  averageScore: 0,
};

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const [stats, setStats] = useState<StudyStats>(defaultStats);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const savedStats = await AsyncStorage.getItem("studyStats");
      if (savedStats) {
        setStats(JSON.parse(savedStats));
      }
    } catch (error) {
      console.log("Error loading stats:", error);
    }
  };

  const StatCard = ({ 
    title, 
    value, 
    icon, 
    color,
    delay = 0 
  }: { 
    title: string; 
    value: string; 
    icon: string; 
    color: string;
    delay?: number;
  }) => (
    <Animated.View 
      entering={FadeInUp.delay(delay).duration(400)}
      className="flex-1 min-w-[45%] bg-surface rounded-2xl p-4 border border-border"
    >
      <View className="flex-row items-center justify-between mb-2">
        <View 
          className="w-10 h-10 rounded-xl items-center justify-center"
          style={{ backgroundColor: color + '20' }}
        >
          <IconSymbol name={icon as any} size={20} color={color} />
        </View>
        <Text className="text-2xl font-bold text-foreground">{value}</Text>
      </View>
      <Text className="text-sm text-muted">{title}</Text>
    </Animated.View>
  );

  const QuickAction = ({ 
    title, 
    subtitle, 
    icon, 
    onPress,
    delay = 0 
  }: { 
    title: string; 
    subtitle: string; 
    icon: string; 
    onPress: () => void;
    delay?: number;
  }) => (
    <Animated.View entering={FadeInDown.delay(delay).duration(400)}>
      <Pressable 
        onPress={onPress}
        style={({ pressed }) => [
          { opacity: pressed ? 0.7 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }
        ]}
        className="bg-surface rounded-2xl p-4 border border-border flex-row items-center"
      >
        <View 
          className="w-12 h-12 rounded-xl items-center justify-center mr-4"
          style={{ backgroundColor: colors.primary + '20' }}
        >
          <IconSymbol name={icon as any} size={24} color={colors.primary} />
        </View>
        <View className="flex-1">
          <Text className="text-base font-semibold text-foreground">{title}</Text>
          <Text className="text-sm text-muted">{subtitle}</Text>
        </View>
        <IconSymbol name="chevron.right" size={20} color={colors.muted} />
      </Pressable>
    </Animated.View>
  );

  return (
    <ScreenContainer className="px-4">
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* Header */}
        <Animated.View 
          entering={FadeInDown.duration(400)}
          className="pt-4 pb-6"
        >
          <View className="flex-row items-center mb-2">
            <View 
              className="w-12 h-12 rounded-2xl items-center justify-center mr-3"
              style={{ backgroundColor: colors.primary }}
            >
              <IconSymbol name="chart.bar.fill" size={24} color={colors.background} />
            </View>
            <View>
              <Text className="text-2xl font-bold text-foreground">Elite Dashboard</Text>
              <Text className="text-sm text-muted">Track your DFS-215 progress</Text>
            </View>
          </View>
          
          {/* Feature badges */}
          <View className="flex-row flex-wrap gap-2 mt-4">
            <View className="flex-row items-center bg-surface px-3 py-1.5 rounded-full border border-border">
              <IconSymbol name="arrow.up.right" size={14} color={colors.primary} />
              <Text className="text-xs text-muted ml-1">Real-time Progress</Text>
            </View>
            <View className="flex-row items-center bg-surface px-3 py-1.5 rounded-full border border-border">
              <IconSymbol name="brain" size={14} color={colors.secondary} />
              <Text className="text-xs text-muted ml-1">AI-Powered</Text>
            </View>
            <View className="flex-row items-center bg-surface px-3 py-1.5 rounded-full border border-border">
              <IconSymbol name="graduationcap.fill" size={14} color={colors.accent} />
              <Text className="text-xs text-muted ml-1">Certification Ready</Text>
            </View>
          </View>
        </Animated.View>

        {/* Stats Grid */}
        <View className="flex-row flex-wrap gap-3 mb-6">
          <StatCard 
            title="Overall Progress" 
            value={`${stats.overallProgress}%`}
            icon="arrow.up.right"
            color={colors.primary}
            delay={100}
          />
          <StatCard 
            title="Study Streak" 
            value={`${stats.studyStreak} days`}
            icon="flame.fill"
            color={colors.accent}
            delay={200}
          />
          <StatCard 
            title="iFlash Due" 
            value={`${stats.iflashDue}`}
            icon="doc.text.fill"
            color={colors.secondary}
            delay={300}
          />
          <StatCard 
            title="CE Hours" 
            value={`${stats.ceHours}/${stats.ceHoursTotal}`}
            icon="trophy.fill"
            color="#fbbf24"
            delay={400}
          />
        </View>

        {/* Weekly Stats */}
        <Animated.View 
          entering={FadeInUp.delay(500).duration(400)}
          className="bg-surface rounded-2xl p-4 border border-border mb-6"
        >
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-semibold text-foreground">This Week</Text>
            <IconSymbol name="calendar" size={20} color={colors.muted} />
          </View>
          <View className="flex-row justify-between">
            <View className="items-center">
              <Text className="text-xl font-bold text-foreground">{stats.lessonsCompleted}</Text>
              <Text className="text-xs text-muted">Lessons</Text>
            </View>
            <View className="items-center">
              <Text className="text-xl font-bold text-foreground">{stats.quizzesPassed}</Text>
              <Text className="text-xs text-muted">Quizzes</Text>
            </View>
            <View className="items-center">
              <Text className="text-xl font-bold text-foreground">{stats.averageScore}%</Text>
              <Text className="text-xs text-muted">Avg Score</Text>
            </View>
          </View>
        </Animated.View>

        {/* Quick Actions */}
        <Text className="text-lg font-semibold text-foreground mb-3">Quick Actions</Text>
        <View className="gap-3">
          <QuickAction 
            title="Set Study Goals"
            subtitle="Plan your learning journey"
            icon="target"
            onPress={() => router.push("/goals")}
            delay={600}
          />
          <QuickAction 
            title="Today's Tasks"
            subtitle="View your daily checklist"
            icon="checklist"
            onPress={() => router.push("/tasks")}
            delay={700}
          />
          <QuickAction 
            title="Learning Guides"
            subtitle="How to use flashcards & AI tutors"
            icon="book.fill"
            onPress={() => router.push("/guides")}
            delay={800}
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
