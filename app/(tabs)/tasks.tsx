import { ScrollView, Text, View, Pressable } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
import Animated, { 
  FadeInDown, 
  FadeInUp, 
  FadeOutRight,
  Layout,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS
} from "react-native-reanimated";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

interface Task {
  id: string;
  title: string;
  subtitle: string;
  type: "lesson" | "flashcard" | "quiz" | "review";
  completed: boolean;
  priority: "high" | "medium" | "low";
}

const defaultTasks: Task[] = [
  {
    id: "1",
    title: "Complete Lesson 15",
    subtitle: "Insurance Regulations Overview",
    type: "lesson",
    completed: false,
    priority: "high",
  },
  {
    id: "2",
    title: "Review 25 Flashcards",
    subtitle: "Life Insurance Basics",
    type: "flashcard",
    completed: false,
    priority: "medium",
  },
  {
    id: "3",
    title: "Practice Quiz",
    subtitle: "Health Insurance Policies",
    type: "quiz",
    completed: false,
    priority: "high",
  },
  {
    id: "4",
    title: "Review Notes",
    subtitle: "Florida DFS Requirements",
    type: "review",
    completed: false,
    priority: "low",
  },
  {
    id: "5",
    title: "Complete Lesson 16",
    subtitle: "Annuities and Taxation",
    type: "lesson",
    completed: false,
    priority: "medium",
  },
];

export default function TasksScreen() {
  const colors = useColors();
  const [tasks, setTasks] = useState<Task[]>(defaultTasks);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const savedTasks = await AsyncStorage.getItem("dailyTasks");
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks));
      }
    } catch (error) {
      console.log("Error loading tasks:", error);
    }
  };

  const saveTasks = async (updatedTasks: Task[]) => {
    try {
      await AsyncStorage.setItem("dailyTasks", JSON.stringify(updatedTasks));
      setTasks(updatedTasks);
    } catch (error) {
      console.log("Error saving tasks:", error);
    }
  };

  const getTaskIcon = (type: Task["type"]) => {
    switch (type) {
      case "lesson": return "book.fill";
      case "flashcard": return "doc.text.fill";
      case "quiz": return "questionmark.circle.fill";
      case "review": return "arrow.clockwise";
      default: return "checklist";
    }
  };

  const getTaskColor = (type: Task["type"]) => {
    switch (type) {
      case "lesson": return colors.primary;
      case "flashcard": return colors.secondary;
      case "quiz": return colors.accent;
      case "review": return "#8b5cf6";
      default: return colors.primary;
    }
  };

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "high": return colors.error;
      case "medium": return colors.warning;
      case "low": return colors.success;
      default: return colors.muted;
    }
  };

  const handleToggleTask = async (taskId: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        const newCompleted = !task.completed;
        if (newCompleted && Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        return { ...task, completed: newCompleted };
      }
      return task;
    });

    await saveTasks(updatedTasks);

    // Check if all tasks completed
    const allCompleted = updatedTasks.every(t => t.completed);
    if (allCompleted) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 2000);
    }
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const TaskItem = ({ task, index }: { task: Task; index: number }) => {
    const scale = useSharedValue(1);
    const color = getTaskColor(task.type);
    const icon = getTaskIcon(task.type);
    const priorityColor = getPriorityColor(task.priority);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const handlePress = () => {
      scale.value = withSpring(0.95, {}, () => {
        scale.value = withSpring(1);
      });
      handleToggleTask(task.id);
    };

    return (
      <Animated.View 
        entering={FadeInUp.delay(index * 80).duration(300)}
        exiting={FadeOutRight.duration(200)}
        layout={Layout.springify()}
        style={animatedStyle}
      >
        <Pressable 
          onPress={handlePress}
          style={({ pressed }) => [
            { opacity: pressed ? 0.8 : 1 }
          ]}
          className={`bg-surface rounded-2xl p-4 border border-border mb-3 flex-row items-center ${task.completed ? 'opacity-60' : ''}`}
        >
          {/* Checkbox */}
          <View 
            className={`w-6 h-6 rounded-full border-2 items-center justify-center mr-3 ${task.completed ? 'bg-primary border-primary' : ''}`}
            style={{ borderColor: task.completed ? colors.primary : colors.border }}
          >
            {task.completed && (
              <IconSymbol name="checkmark" size={14} color={colors.background} />
            )}
          </View>

          {/* Icon */}
          <View 
            className="w-10 h-10 rounded-xl items-center justify-center mr-3"
            style={{ backgroundColor: color + '20' }}
          >
            <IconSymbol name={icon as any} size={20} color={color} />
          </View>

          {/* Content */}
          <View className="flex-1">
            <Text 
              className={`text-base font-semibold text-foreground ${task.completed ? 'line-through' : ''}`}
            >
              {task.title}
            </Text>
            <Text className="text-sm text-muted">{task.subtitle}</Text>
          </View>

          {/* Priority indicator */}
          <View 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: priorityColor }}
          />
        </Pressable>
      </Animated.View>
    );
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
          <View className="flex-row items-center">
            <View 
              className="w-12 h-12 rounded-2xl items-center justify-center mr-3"
              style={{ backgroundColor: colors.primary }}
            >
              <IconSymbol name="checklist" size={24} color={colors.background} />
            </View>
            <View className="flex-1">
              <Text className="text-2xl font-bold text-foreground">Today's Tasks</Text>
              <Text className="text-sm text-muted">{completedCount} of {totalCount} completed</Text>
            </View>
          </View>

          {/* Progress bar */}
          <View className="mt-4">
            <View className="h-3 bg-border rounded-full overflow-hidden">
              <Animated.View 
                className="h-full rounded-full"
                style={{ 
                  width: `${progress}%`,
                  backgroundColor: colors.primary 
                }}
              />
            </View>
          </View>
        </Animated.View>

        {/* Celebration Banner */}
        {showCelebration && (
          <Animated.View 
            entering={FadeInDown.duration(300)}
            className="bg-success/20 border border-success rounded-2xl p-4 mb-4 items-center"
          >
            <View className="flex-row items-center">
              <IconSymbol name="trophy.fill" size={24} color={colors.success} />
              <Text className="text-lg font-bold text-success ml-2">All Tasks Complete!</Text>
            </View>
            <Text className="text-sm text-success mt-1">Great job! You've finished all your tasks for today.</Text>
          </Animated.View>
        )}

        {/* Priority Legend */}
        <Animated.View 
          entering={FadeInUp.delay(100).duration(400)}
          className="flex-row justify-center gap-4 mb-4"
        >
          <View className="flex-row items-center">
            <View className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: colors.error }} />
            <Text className="text-xs text-muted">High</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: colors.warning }} />
            <Text className="text-xs text-muted">Medium</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: colors.success }} />
            <Text className="text-xs text-muted">Low</Text>
          </View>
        </Animated.View>

        {/* Tasks List */}
        <View>
          {tasks.map((task, index) => (
            <TaskItem key={task.id} task={task} index={index} />
          ))}
        </View>

        {/* Tips */}
        <Animated.View 
          entering={FadeInUp.delay(600).duration(400)}
          className="bg-surface rounded-2xl p-4 border border-border mt-4"
        >
          <View className="flex-row items-center mb-2">
            <IconSymbol name="lightbulb.fill" size={18} color={colors.warning} />
            <Text className="text-sm font-semibold text-foreground ml-2">Pro Tip</Text>
          </View>
          <Text className="text-sm text-muted">
            Tap a task to mark it complete. Focus on high-priority items first for maximum exam preparation efficiency.
          </Text>
        </Animated.View>
      </ScrollView>
    </ScreenContainer>
  );
}
