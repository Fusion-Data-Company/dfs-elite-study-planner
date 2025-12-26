/**
 * AgentChat Component - AI Tutoring Chat Interface
 */

import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { useColors } from "@/hooks/use-colors";
import { useAgentChat, type AgentId, type ChatMessage, AGENTS } from "@/hooks/useAgentChat";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Animated, { FadeIn, FadeInDown, FadeInUp } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

interface AgentChatProps {
  agentId: AgentId;
  onBack?: () => void;
}

// Message bubble component
function MessageBubble({ message, isUser }: { message: ChatMessage; isUser: boolean }) {
  const colors = useColors();

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <Animated.View
      entering={FadeInUp.duration(300)}
      style={[
        styles.messageBubble,
        isUser ? styles.userBubble : styles.assistantBubble,
        {
          backgroundColor: isUser ? colors.primary : colors.surface,
          borderColor: isUser ? colors.primary : colors.border,
        },
      ]}
    >
      <Text
        style={[
          styles.messageText,
          { color: isUser ? "#fff" : colors.foreground },
        ]}
      >
        {message.content}
      </Text>

      {/* Citations */}
      {message.citations && message.citations.length > 0 && (
        <View style={styles.citationsContainer}>
          {message.citations.map((citation, index) => (
            <View
              key={index}
              style={[styles.citationBadge, { backgroundColor: colors.primary + "20" }]}
            >
              <MaterialIcons name="menu-book" size={12} color={colors.primary} />
              <Text style={[styles.citationText, { color: colors.primary }]}>
                {citation.title}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Steps (for CoachBot) */}
      {message.steps && message.steps.length > 0 && (
        <View style={styles.stepsContainer}>
          {message.steps.map((step, index) => (
            <View key={index} style={styles.stepItem}>
              <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <Text style={[styles.stepText, { color: colors.foreground }]}>
                {step}
              </Text>
            </View>
          ))}
        </View>
      )}

      <Text style={[styles.timestamp, { color: isUser ? "rgba(255,255,255,0.7)" : colors.muted }]}>
        {formatTime(message.timestamp)}
      </Text>
    </Animated.View>
  );
}

// Typing indicator
function TypingIndicator() {
  const colors = useColors();

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      style={[styles.typingContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <View style={styles.typingDots}>
        {[0, 1, 2].map((i) => (
          <Animated.View
            key={i}
            style={[styles.typingDot, { backgroundColor: colors.muted }]}
          />
        ))}
      </View>
    </Animated.View>
  );
}

// Suggested prompts
function SuggestedPrompts({
  prompts,
  onSelect,
}: {
  prompts: string[];
  onSelect: (prompt: string) => void;
}) {
  const colors = useColors();

  return (
    <View style={styles.suggestedContainer}>
      <Text style={[styles.suggestedLabel, { color: colors.muted }]}>
        Suggested questions:
      </Text>
      <View style={styles.suggestedList}>
        {prompts.map((prompt, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => onSelect(prompt)}
            style={[styles.suggestedChip, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Text style={[styles.suggestedText, { color: colors.foreground }]} numberOfLines={1}>
              {prompt}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export function AgentChat({ agentId, onBack }: AgentChatProps) {
  const colors = useColors();
  const { agent, messages, isTyping, sendMessage, clearConversation } = useAgentChat(agentId);
  const [inputText, setInputText] = useState("");
  const flatListRef = useRef<FlatList>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length, isTyping]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    sendMessage(inputText);
    setInputText("");
  };

  const handleSuggestedPrompt = (prompt: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    sendMessage(prompt);
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <MessageBubble message={item} isUser={item.role === "user"} />
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={100}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color={colors.foreground} />
          </TouchableOpacity>
        )}
        <View style={[styles.agentAvatar, { backgroundColor: agent.color + "20" }]}>
          <Text style={styles.agentAvatarText}>{agent.avatar}</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={[styles.agentName, { color: colors.foreground }]}>
            {agent.name}
          </Text>
          <Text style={[styles.agentStatus, { color: colors.success }]}>
            Online
          </Text>
        </View>
        <TouchableOpacity
          onPress={clearConversation}
          style={styles.clearButton}
        >
          <MaterialIcons name="delete-outline" size={22} color={colors.muted} />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.emptyContainer}>
            <View style={[styles.emptyAvatar, { backgroundColor: agent.color + "20" }]}>
              <Text style={styles.emptyAvatarText}>{agent.avatar}</Text>
            </View>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              Chat with {agent.name}
            </Text>
            <Text style={[styles.emptyDescription, { color: colors.muted }]}>
              {agent.description}
            </Text>
            <SuggestedPrompts
              prompts={agent.suggestedPrompts}
              onSelect={handleSuggestedPrompt}
            />
          </Animated.View>
        }
        ListFooterComponent={isTyping ? <TypingIndicator /> : null}
      />

      {/* Input */}
      <View style={[styles.inputContainer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <TextInput
          value={inputText}
          onChangeText={setInputText}
          placeholder={`Ask ${agent.name}...`}
          placeholderTextColor={colors.muted}
          multiline
          maxLength={1000}
          style={[
            styles.input,
            { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground },
          ]}
          onSubmitEditing={handleSend}
          returnKeyType="send"
        />
        <TouchableOpacity
          onPress={handleSend}
          disabled={!inputText.trim()}
          style={[
            styles.sendButton,
            { backgroundColor: inputText.trim() ? colors.primary : colors.muted + "50" },
          ]}
        >
          <MaterialIcons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: 12,
  },
  agentAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  agentAvatarText: {
    fontSize: 22,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  agentName: {
    fontSize: 17,
    fontWeight: "600",
  },
  agentStatus: {
    fontSize: 12,
    marginTop: 2,
  },
  clearButton: {
    padding: 8,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 8,
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 14,
    borderRadius: 18,
    marginBottom: 12,
    borderWidth: 1,
  },
  userBubble: {
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  timestamp: {
    fontSize: 11,
    marginTop: 6,
    alignSelf: "flex-end",
  },
  citationsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 10,
  },
  citationBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  citationText: {
    fontSize: 11,
    fontWeight: "500",
  },
  stepsContainer: {
    marginTop: 12,
    gap: 8,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  stepNumber: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumberText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  typingContainer: {
    alignSelf: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 12,
  },
  typingDots: {
    flexDirection: "row",
    gap: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  emptyAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyAvatarText: {
    fontSize: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  suggestedContainer: {
    width: "100%",
  },
  suggestedLabel: {
    fontSize: 13,
    marginBottom: 10,
  },
  suggestedList: {
    gap: 8,
  },
  suggestedChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  suggestedText: {
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 12,
    paddingBottom: Platform.OS === "ios" ? 24 : 12,
    borderTopWidth: 1,
    gap: 10,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 22,
    borderWidth: 1,
    fontSize: 15,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
});
