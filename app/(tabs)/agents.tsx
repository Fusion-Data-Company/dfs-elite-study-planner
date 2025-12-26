/**
 * AI Agents Screen - AI Tutoring Hub
 */

import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  StyleSheet,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { AGENTS, type AgentId } from "@/hooks/useAgentChat";
import { AgentChat } from "@/components/AgentChat";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useAuth } from "@clerk/clerk-expo";

// Agent card component
function AgentCard({
  agent,
  onSelect,
  index,
}: {
  agent: (typeof AGENTS)[0];
  onSelect: () => void;
  index: number;
}) {
  const colors = useColors();

  return (
    <Animated.View entering={FadeInRight.delay(index * 100).duration(400)}>
      <TouchableOpacity
        onPress={onSelect}
        style={[styles.agentCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
        activeOpacity={0.7}
      >
        <View style={[styles.agentAvatar, { backgroundColor: agent.color + "20" }]}>
          <Text style={styles.agentAvatarText}>{agent.avatar}</Text>
        </View>
        <View style={styles.agentInfo}>
          <Text style={[styles.agentName, { color: colors.foreground }]}>
            {agent.name}
          </Text>
          <Text style={[styles.agentDescription, { color: colors.muted }]} numberOfLines={2}>
            {agent.description}
          </Text>
        </View>
        <View style={[styles.agentArrow, { backgroundColor: agent.color + "20" }]}>
          <MaterialIcons name="chevron-right" size={20} color={agent.color} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// Feature highlight component
function FeatureHighlight({
  icon,
  title,
  description,
  color,
  index,
}: {
  icon: string;
  title: string;
  description: string;
  color: string;
  index: number;
}) {
  const colors = useColors();

  return (
    <Animated.View
      entering={FadeInDown.delay(300 + index * 100).duration(400)}
      style={[styles.featureCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <View style={[styles.featureIcon, { backgroundColor: color + "20" }]}>
        <MaterialIcons name={icon as any} size={20} color={color} />
      </View>
      <View style={styles.featureContent}>
        <Text style={[styles.featureTitle, { color: colors.foreground }]}>{title}</Text>
        <Text style={[styles.featureDescription, { color: colors.muted }]}>{description}</Text>
      </View>
    </Animated.View>
  );
}

export default function AgentsScreen() {
  const colors = useColors();
  const { isSignedIn } = useAuth();
  const [selectedAgent, setSelectedAgent] = useState<AgentId | null>(null);

  const handleSelectAgent = (agentId: AgentId) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedAgent(agentId);
  };

  const handleBack = () => {
    setSelectedAgent(null);
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
            Please sign in to access AI tutors
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  // Show chat if agent selected
  if (selectedAgent) {
    return (
      <ScreenContainer edges={["top", "left", "right"]}>
        <AgentChat agentId={selectedAgent} onBack={handleBack} />
      </ScreenContainer>
    );
  }

  // Agent selection screen
  return (
    <ScreenContainer className="p-6">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)}>
          <Text style={[styles.title, { color: colors.foreground }]}>
            AI Tutors
          </Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Get personalized help from our AI study assistants
          </Text>
        </Animated.View>

        {/* Agent Cards */}
        <View style={styles.agentsList}>
          {AGENTS.map((agent, index) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onSelect={() => handleSelectAgent(agent.id)}
              index={index}
            />
          ))}
        </View>

        {/* Features Section */}
        <Animated.View entering={FadeInDown.delay(400).duration(500)}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            What They Can Do
          </Text>
        </Animated.View>

        <View style={styles.featuresList}>
          <FeatureHighlight
            icon="school"
            title="Explain Concepts"
            description="Get clear explanations of complex insurance topics"
            color={colors.primary}
            index={0}
          />
          <FeatureHighlight
            icon="quiz"
            title="Quiz You"
            description="Test your knowledge with practice questions"
            color={colors.secondary}
            index={1}
          />
          <FeatureHighlight
            icon="event-note"
            title="Create Study Plans"
            description="Get personalized study schedules for your exam"
            color={colors.accent}
            index={2}
          />
          <FeatureHighlight
            icon="psychology"
            title="Answer Questions"
            description="Ask anything about Florida insurance regulations"
            color="#8b5cf6"
            index={3}
          />
        </View>

        {/* Tips Section */}
        <Animated.View
          entering={FadeInDown.delay(800).duration(500)}
          style={[styles.tipsCard, { backgroundColor: colors.primary + "10", borderColor: colors.primary + "30" }]}
        >
          <View style={styles.tipsHeader}>
            <MaterialIcons name="lightbulb" size={20} color={colors.primary} />
            <Text style={[styles.tipsTitle, { color: colors.primary }]}>
              Pro Tips
            </Text>
          </View>
          <Text style={[styles.tipsText, { color: colors.foreground }]}>
            • Be specific with your questions for better answers{"\n"}
            • Ask CoachBot to create a study schedule{"\n"}
            • Use StudyBuddy to explain difficult concepts{"\n"}
            • Practice with ProctorBot before your exam
          </Text>
        </Animated.View>
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
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  subtitle: {
    fontSize: 15,
    marginTop: 4,
    marginBottom: 24,
  },
  agentsList: {
    gap: 12,
    marginBottom: 32,
  },
  agentCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  agentAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  agentAvatarText: {
    fontSize: 28,
  },
  agentInfo: {
    flex: 1,
    marginLeft: 14,
  },
  agentName: {
    fontSize: 17,
    fontWeight: "600",
  },
  agentDescription: {
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  agentArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  featuresList: {
    gap: 10,
    marginBottom: 24,
  },
  featureCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  featureDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  tipsCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 24,
  },
  tipsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  tipsTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  tipsText: {
    fontSize: 13,
    lineHeight: 22,
  },
});
