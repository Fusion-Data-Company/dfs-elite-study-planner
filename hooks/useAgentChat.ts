/**
 * Hook for AI Tutoring Agent Chat
 */

import { useMutation } from "@tanstack/react-query";
import { api, storage } from "@/lib/api";
import { useAuth } from "@clerk/clerk-expo";
import { useState, useCallback, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

export type AgentId = "coachbot" | "studybuddy" | "proctorbot";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  citations?: Array<{ lessonId: string; title: string }>;
  steps?: string[];
}

export interface Agent {
  id: AgentId;
  name: string;
  description: string;
  avatar: string;
  color: string;
  suggestedPrompts: string[];
}

export const AGENTS: Agent[] = [
  {
    id: "coachbot",
    name: "CoachBot",
    description: "Your personal study coach. Helps you plan study sessions, set goals, and stay motivated.",
    avatar: "🎯",
    color: "#00d4ff",
    suggestedPrompts: [
      "Create a study plan for my DFS-215 exam",
      "What topics should I focus on this week?",
      "How can I improve my quiz scores?",
      "Help me stay motivated to study",
    ],
  },
  {
    id: "studybuddy",
    name: "StudyBuddy",
    description: "Your friendly study companion. Explains concepts, answers questions, and helps you understand material.",
    avatar: "📚",
    color: "#10b981",
    suggestedPrompts: [
      "Explain insurance regulations in Florida",
      "What's the difference between term and whole life insurance?",
      "Help me understand CE requirements",
      "Quiz me on Chapter 5 material",
    ],
  },
  {
    id: "proctorbot",
    name: "ProctorBot",
    description: "Your exam preparation expert. Simulates exam conditions and provides detailed feedback.",
    avatar: "🎓",
    color: "#f59e0b",
    suggestedPrompts: [
      "Start a practice exam session",
      "What are common exam mistakes?",
      "Review my last exam performance",
      "Give me tips for test-taking",
    ],
  },
];

// Generate a simple UUID without external dependency
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function useAgentChat(agentId: AgentId) {
  const { getToken, isSignedIn } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [viewId] = useState(() => generateId());

  // Load conversation from storage on mount
  useEffect(() => {
    const loadConversation = async () => {
      const saved = await storage.getConversation(agentId);
      if (saved) {
        setMessages(saved);
      }
    };
    loadConversation();
  }, [agentId]);

  // Save conversation to storage when messages change
  useEffect(() => {
    if (messages.length > 0) {
      storage.saveConversation(agentId, messages);
    }
  }, [messages, agentId]);

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const token = await getToken();
      if (token) {
        api.setAuthToken(token);
      }
      return api.chatWithAgent(agentId, message, viewId);
    },
  });

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: generateId(),
      role: "user",
      content: content.trim(),
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const response = await chatMutation.mutateAsync(content);
      
      // Add assistant message
      const assistantMessage: ChatMessage = {
        id: generateId(),
        role: "assistant",
        content: response.message,
        timestamp: Date.now(),
        citations: response.citations,
        steps: response.steps,
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      // Add error message
      const errorMessage: ChatMessage = {
        id: generateId(),
        role: "assistant",
        content: "I'm sorry, I couldn't process your request. Please try again.",
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }, [chatMutation]);

  const clearConversation = useCallback(async () => {
    setMessages([]);
    await storage.saveConversation(agentId, []);
  }, [agentId]);

  const agent = AGENTS.find(a => a.id === agentId)!;

  return {
    agent,
    messages,
    isTyping,
    sendMessage,
    clearConversation,
    isLoading: chatMutation.isPending,
  };
}
