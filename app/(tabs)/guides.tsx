import { ScrollView, Text, View, Pressable } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useState } from "react";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

interface Guide {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  content: string[];
}

export default function GuidesScreen() {
  const colors = useColors();
  const [expandedGuide, setExpandedGuide] = useState<string | null>(null);

  const guides: Guide[] = [
    {
      id: "flashcards",
      title: "How to Use iFlash Cards",
      subtitle: "Master the flashcard system",
      icon: "doc.text.fill",
      color: colors.primary,
      content: [
        "1. Navigate to 'iFlash Review' in the main app",
        "2. Cards are presented one at a time with multiple choice answers",
        "3. Select your answer (A, B, C, or D) to reveal if you're correct",
        "4. Use the 'Previous' and 'Next' buttons to navigate between cards",
        "5. The system tracks your correct/incorrect answers automatically",
        "6. Use the 'Reset' button to start fresh with all 487 cards",
        "7. Focus on cards you get wrong - they'll help identify weak areas",
        "8. Review daily for best retention - aim for 25-50 cards per session",
      ],
    },
    {
      id: "ai-tutors",
      title: "AI Tutor Guide",
      subtitle: "Get personalized help from AI assistants",
      icon: "brain",
      color: colors.secondary,
      content: [
        "CoachBot - Exam Preparation:",
        "• Provides targeted feedback on your quiz performance",
        "• Identifies weak topics that need more study",
        "• Offers personalized study recommendations",
        "• Gives performance insights and progress analysis",
        "",
        "StudyBuddy - Study Planning:",
        "• Creates customized 7-day study plans",
        "• Generates iFlash cards from lesson content",
        "• Tracks your learning progress over time",
        "• Provides motivation and encouragement",
        "",
        "ProctorBot - Exam Proctoring:",
        "• Runs pre-exam readiness checklists",
        "• Monitors exam integrity during timed tests",
        "• Provides post-exam analysis and feedback",
        "• Explains exam policies and guidelines",
      ],
    },
    {
      id: "quizzes",
      title: "Practice Quiz Tips",
      subtitle: "Maximize your quiz performance",
      icon: "questionmark.circle.fill",
      color: colors.accent,
      content: [
        "Before the Quiz:",
        "• Review the topic area in the Instructor Portal first",
        "• Check the exam weight percentage for each topic",
        "• Note the time estimate and plan accordingly",
        "",
        "During the Quiz:",
        "• Read each question carefully before answering",
        "• Eliminate obviously wrong answers first",
        "• Don't spend too long on any single question",
        "• Trust your first instinct - it's often correct",
        "",
        "After the Quiz:",
        "• Review questions you got wrong",
        "• Create flashcards for missed concepts",
        "• Retake quizzes until you score 80%+",
        "• Track your progress in the CE Tracking section",
      ],
    },
    {
      id: "timed-exam",
      title: "Timed Exam Preparation",
      subtitle: "Get ready for certification exams",
      icon: "clock.fill",
      color: "#8b5cf6",
      content: [
        "Exam Format:",
        "• 150 questions total on the real DFS-215 exam",
        "• 150 minutes time limit (1 minute per question)",
        "• 70% passing score required",
        "• ProctorBot monitors exam integrity",
        "",
        "Preparation Strategy:",
        "• Complete all practice quizzes first",
        "• Review flashcards for each topic area",
        "• Take timed exams in a quiet environment",
        "• Simulate real exam conditions",
        "",
        "During the Exam:",
        "• Pace yourself - watch the timer",
        "• Answer easy questions first",
        "• Flag difficult questions for review",
        "• Never leave questions unanswered",
      ],
    },
    {
      id: "ce-tracking",
      title: "CE Hour Tracking",
      subtitle: "Monitor your continuing education progress",
      icon: "trophy.fill",
      color: "#fbbf24",
      content: [
        "Understanding CE Requirements:",
        "• Florida requires 24 CE hours for DFS-215 renewal",
        "• Hours are tracked automatically as you complete lessons",
        "• Check the CE Tracking page for your current status",
        "",
        "Earning CE Hours:",
        "• Complete lessons in the Instructor Portal",
        "• Pass quizzes to validate your learning",
        "• Hours are credited after successful completion",
        "",
        "Tracking Your Progress:",
        "• View Overview tab for total hours earned",
        "• Check Requirements tab for specific needs",
        "• Review History for completed activities",
        "• Download Certificates when available",
        "• Use Verification to confirm your records",
      ],
    },
  ];

  const handleToggleGuide = (guideId: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setExpandedGuide(expandedGuide === guideId ? null : guideId);
  };

  const GuideCard = ({ guide, index }: { guide: Guide; index: number }) => {
    const isExpanded = expandedGuide === guide.id;

    return (
      <Animated.View 
        entering={FadeInUp.delay(index * 100).duration(400)}
        className="mb-3"
      >
        <Pressable 
          onPress={() => handleToggleGuide(guide.id)}
          style={({ pressed }) => [
            { opacity: pressed ? 0.8 : 1 }
          ]}
          className="bg-surface rounded-2xl border border-border overflow-hidden"
        >
          {/* Header */}
          <View className="p-4 flex-row items-center">
            <View 
              className="w-12 h-12 rounded-xl items-center justify-center mr-3"
              style={{ backgroundColor: guide.color + '20' }}
            >
              <IconSymbol name={guide.icon as any} size={24} color={guide.color} />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-foreground">{guide.title}</Text>
              <Text className="text-sm text-muted">{guide.subtitle}</Text>
            </View>
            <IconSymbol 
              name={isExpanded ? "chevron.up" : "chevron.down"} 
              size={20} 
              color={colors.muted} 
            />
          </View>

          {/* Expanded Content */}
          {isExpanded && (
            <Animated.View 
              entering={FadeInDown.duration(200)}
              className="px-4 pb-4 border-t border-border pt-3"
            >
              {guide.content.map((line, lineIndex) => (
                <Text 
                  key={lineIndex} 
                  className={`text-sm leading-6 ${line.startsWith('•') || line.match(/^\d\./) ? 'text-muted ml-2' : line === '' ? '' : 'text-foreground font-medium mt-2'}`}
                >
                  {line}
                </Text>
              ))}
            </Animated.View>
          )}
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
              <IconSymbol name="book.fill" size={24} color={colors.background} />
            </View>
            <View>
              <Text className="text-2xl font-bold text-foreground">Learning Guides</Text>
              <Text className="text-sm text-muted">How to use the DFS Elite platform</Text>
            </View>
          </View>
        </Animated.View>

        {/* Introduction */}
        <Animated.View 
          entering={FadeInUp.delay(100).duration(400)}
          className="bg-primary/10 border border-primary/30 rounded-2xl p-4 mb-4"
        >
          <View className="flex-row items-center mb-2">
            <IconSymbol name="info.circle.fill" size={18} color={colors.primary} />
            <Text className="text-sm font-semibold text-foreground ml-2">Welcome to DFS Elite</Text>
          </View>
          <Text className="text-sm text-muted leading-5">
            These guides will help you get the most out of the DFS Elite Learning Platform. Tap any section below to expand and learn more.
          </Text>
        </Animated.View>

        {/* Guides List */}
        <View>
          {guides.map((guide, index) => (
            <GuideCard key={guide.id} guide={guide} index={index} />
          ))}
        </View>

        {/* Help Section */}
        <Animated.View 
          entering={FadeInUp.delay(700).duration(400)}
          className="bg-surface rounded-2xl p-4 border border-border mt-4"
        >
          <View className="flex-row items-center mb-2">
            <IconSymbol name="questionmark.circle.fill" size={18} color={colors.muted} />
            <Text className="text-sm font-semibold text-foreground ml-2">Need More Help?</Text>
          </View>
          <Text className="text-sm text-muted">
            Visit the main DFS Elite Learning Platform at dfselitelearningplatform.vercel.app for full access to all features, lessons, and AI tutors.
          </Text>
        </Animated.View>
      </ScrollView>
    </ScreenContainer>
  );
}
