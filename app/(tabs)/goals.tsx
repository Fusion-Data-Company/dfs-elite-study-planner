import { ScrollView, Text, View, Pressable, TextInput, Modal } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

interface Goal {
  id: string;
  type: "exam_date" | "study_time" | "lessons" | "ce_hours";
  title: string;
  target: number;
  current: number;
  unit: string;
  deadline?: string;
}

const defaultGoals: Goal[] = [
  {
    id: "1",
    type: "exam_date",
    title: "Pass DFS-215 Exam",
    target: 100,
    current: 0,
    unit: "%",
    deadline: "2025-03-31",
  },
  {
    id: "2",
    type: "study_time",
    title: "Daily Study Time",
    target: 3,
    current: 0,
    unit: "hours",
  },
  {
    id: "3",
    type: "lessons",
    title: "Complete Lessons",
    target: 100,
    current: 0,
    unit: "lessons",
  },
  {
    id: "4",
    type: "ce_hours",
    title: "CE Hours",
    target: 24,
    current: 0,
    unit: "hours",
  },
];

export default function GoalsScreen() {
  const colors = useColors();
  const [goals, setGoals] = useState<Goal[]>(defaultGoals);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalTarget, setNewGoalTarget] = useState("");

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const savedGoals = await AsyncStorage.getItem("studyGoals");
      if (savedGoals) {
        setGoals(JSON.parse(savedGoals));
      }
    } catch (error) {
      console.log("Error loading goals:", error);
    }
  };

  const saveGoals = async (updatedGoals: Goal[]) => {
    try {
      await AsyncStorage.setItem("studyGoals", JSON.stringify(updatedGoals));
      setGoals(updatedGoals);
    } catch (error) {
      console.log("Error saving goals:", error);
    }
  };

  const getGoalIcon = (type: Goal["type"]) => {
    switch (type) {
      case "exam_date": return "graduationcap.fill";
      case "study_time": return "clock.fill";
      case "lessons": return "book.fill";
      case "ce_hours": return "trophy.fill";
      default: return "target";
    }
  };

  const getGoalColor = (type: Goal["type"]) => {
    switch (type) {
      case "exam_date": return colors.primary;
      case "study_time": return colors.accent;
      case "lessons": return colors.secondary;
      case "ce_hours": return "#fbbf24";
      default: return colors.primary;
    }
  };

  const GoalCard = ({ goal, index }: { goal: Goal; index: number }) => {
    const progress = goal.target > 0 ? (goal.current / goal.target) * 100 : 0;
    const color = getGoalColor(goal.type);
    const icon = getGoalIcon(goal.type);

    return (
      <Animated.View 
        entering={FadeInUp.delay(index * 100).duration(400)}
        className="bg-surface rounded-2xl p-4 border border-border mb-3"
      >
        <View className="flex-row items-center mb-3">
          <View 
            className="w-10 h-10 rounded-xl items-center justify-center mr-3"
            style={{ backgroundColor: color + '20' }}
          >
            <IconSymbol name={icon as any} size={20} color={color} />
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold text-foreground">{goal.title}</Text>
            {goal.deadline && (
              <Text className="text-xs text-muted">Due: {goal.deadline}</Text>
            )}
          </View>
          <Text className="text-lg font-bold text-foreground">
            {goal.current}/{goal.target} {goal.unit}
          </Text>
        </View>
        
        {/* Progress bar */}
        <View className="h-2 bg-border rounded-full overflow-hidden">
          <Animated.View 
            className="h-full rounded-full"
            style={{ 
              width: `${Math.min(progress, 100)}%`,
              backgroundColor: color 
            }}
          />
        </View>
        <Text className="text-xs text-muted mt-1 text-right">{Math.round(progress)}% complete</Text>
      </Animated.View>
    );
  };

  const handleAddGoal = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setShowAddModal(true);
  };

  const handleSaveNewGoal = async () => {
    if (!newGoalTitle || !newGoalTarget) return;
    
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    const newGoal: Goal = {
      id: Date.now().toString(),
      type: "lessons",
      title: newGoalTitle,
      target: parseInt(newGoalTarget) || 0,
      current: 0,
      unit: "items",
    };

    const updatedGoals = [...goals, newGoal];
    await saveGoals(updatedGoals);
    setShowAddModal(false);
    setNewGoalTitle("");
    setNewGoalTarget("");
  };

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
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View 
                className="w-12 h-12 rounded-2xl items-center justify-center mr-3"
                style={{ backgroundColor: colors.primary }}
              >
                <IconSymbol name="target" size={24} color={colors.background} />
              </View>
              <View>
                <Text className="text-2xl font-bold text-foreground">Study Goals</Text>
                <Text className="text-sm text-muted">Set and track your targets</Text>
              </View>
            </View>
            <Pressable 
              onPress={handleAddGoal}
              style={({ pressed }) => [
                { opacity: pressed ? 0.7 : 1 }
              ]}
              className="w-10 h-10 rounded-full items-center justify-center"
              accessibilityLabel="Add new goal"
            >
              <View style={{ backgroundColor: colors.primary }} className="w-10 h-10 rounded-full items-center justify-center">
                <IconSymbol name="plus" size={24} color={colors.background} />
              </View>
            </Pressable>
          </View>
        </Animated.View>

        {/* Goals List */}
        <View>
          {goals.map((goal, index) => (
            <GoalCard key={goal.id} goal={goal} index={index} />
          ))}
        </View>

        {/* Tips Section */}
        <Animated.View 
          entering={FadeInUp.delay(500).duration(400)}
          className="bg-surface rounded-2xl p-4 border border-border mt-4"
        >
          <View className="flex-row items-center mb-3">
            <IconSymbol name="lightbulb.fill" size={20} color={colors.warning} />
            <Text className="text-base font-semibold text-foreground ml-2">Goal Setting Tips</Text>
          </View>
          <Text className="text-sm text-muted leading-5">
            • Set realistic daily study targets{"\n"}
            • Break large goals into smaller milestones{"\n"}
            • Track your progress consistently{"\n"}
            • Celebrate small wins to stay motivated
          </Text>
        </Animated.View>
      </ScrollView>

      {/* Add Goal Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View className="flex-1 bg-black/50 items-center justify-center px-4">
          <View className="bg-surface w-full max-w-sm rounded-2xl p-6 border border-border">
            <Text className="text-xl font-bold text-foreground mb-4">Add New Goal</Text>
            
            <Text className="text-sm text-muted mb-2">Goal Title</Text>
            <TextInput
              value={newGoalTitle}
              onChangeText={setNewGoalTitle}
              placeholder="e.g., Complete Chapter 5"
              placeholderTextColor={colors.muted}
              className="bg-background border border-border rounded-xl px-4 py-3 text-foreground mb-4"
            />
            
            <Text className="text-sm text-muted mb-2">Target Number</Text>
            <TextInput
              value={newGoalTarget}
              onChangeText={setNewGoalTarget}
              placeholder="e.g., 10"
              placeholderTextColor={colors.muted}
              keyboardType="numeric"
              className="bg-background border border-border rounded-xl px-4 py-3 text-foreground mb-6"
            />
            
            <View className="flex-row gap-3">
              <Pressable 
                onPress={() => setShowAddModal(false)}
                className="flex-1 bg-border py-3 rounded-xl items-center"
              >
                <Text className="text-foreground font-semibold">Cancel</Text>
              </Pressable>
              <Pressable 
                onPress={handleSaveNewGoal}
                className="flex-1 py-3 rounded-xl items-center"
                style={{ backgroundColor: colors.primary }}
              >
                <Text className="font-semibold" style={{ color: colors.background }}>Save Goal</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
