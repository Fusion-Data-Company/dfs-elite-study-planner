/**
 * API Client for DFS Elite Learning Platform
 * Base URL: https://dfselitelearningplatform.vercel.app
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = "https://dfselitelearningplatform.vercel.app";

interface ApiOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: any;
  headers?: Record<string, string>;
}

class ApiClient {
  private baseUrl: string;
  private authToken: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  async request<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const { method = "GET", body, headers = {} } = options;

    const requestHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      ...headers,
    };

    if (this.authToken) {
      requestHeaders["Authorization"] = `Bearer ${this.authToken}`;
    }

    const config: RequestInit = {
      method,
      headers: requestHeaders,
      credentials: "include",
    };

    if (body && method !== "GET") {
      config.body = JSON.stringify(body);
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, config);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Request failed" }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Authentication
  async getUser() {
    return this.request<any>("/api/auth/user");
  }

  // Dashboard & Progress
  async getUserMetrics() {
    return this.request<{
      overallProgress: number;
      studyStreak: number;
      iflashDue: number;
      ceHours: number;
      ceHoursTotal: number;
      lessonsCompleted: number;
      quizzesPassed: number;
      averageScore: number;
      weeklyActivity: any;
    }>("/api/dashboard/user-metrics");
  }

  async getCourseProgress() {
    return this.request<{
      tracks: Array<{
        id: string;
        title: string;
        progress: number;
        ceHours: number;
        completedLessons: number;
        totalLessons: number;
      }>;
      overallProgress: number;
    }>("/api/courses/progress");
  }

  // Lessons
  async getRecentLessons() {
    return this.request<any[]>("/api/lessons/recent");
  }

  async getLessonBySlug(slug: string) {
    return this.request<any>(`/api/lessons/slug/${slug}`);
  }

  async getEnhancedLesson(slug: string) {
    return this.request<any>(`/api/lessons/enhanced/${slug}`);
  }

  async saveCheckpointProgress(lessonId: string, data: any) {
    return this.request<any>(`/api/lessons/${lessonId}/checkpoint-progress`, {
      method: "POST",
      body: data,
    });
  }

  async saveLessonProgress(lessonId: string, data: any) {
    return this.request<any>(`/api/lessons/${lessonId}/enhanced-progress`, {
      method: "POST",
      body: data,
    });
  }

  // Flashcards (iFlash)
  async getFlashcards() {
    return this.request<{
      cards: Array<{
        id: string;
        type: "mcq" | "term";
        question: string;
        answer: string;
        options?: string[];
        rationale?: string;
        difficulty: number;
        interval: number;
        reviewCount: number;
        nextReview: string;
      }>;
      totalDue: number;
    }>("/api/iflash/cards");
  }

  async getCardsForReview() {
    return this.request<any[]>("/api/flashcards/review");
  }

  async submitFlashcardReview(cardId: string, grade: number) {
    return this.request<any>(`/api/flashcards/${cardId}/review`, {
      method: "POST",
      body: { grade },
    });
  }

  async generateFlashcards(content: string) {
    return this.request<any>("/api/iflash/generate", {
      method: "POST",
      body: { content },
    });
  }

  // Question Banks & Exams
  async getQuestionBanks() {
    return this.request<Array<{
      id: string;
      title: string;
      description: string;
      questionCount: number;
      timeLimit: number;
      passingScore: number;
    }>>("/api/question-banks");
  }

  async startExam(bankId: string) {
    return this.request<{
      sessionId: string;
      questions: any[];
      timeLimit: number;
    }>(`/api/exams/${bankId}/start`, { method: "POST" });
  }

  async submitAnswer(sessionId: string, questionId: string, answer: string) {
    return this.request<any>(`/api/exams/${sessionId}/answer`, {
      method: "POST",
      body: { questionId, answer },
    });
  }

  async finishExam(sessionId: string) {
    return this.request<{
      score: number;
      passed: boolean;
      totalQuestions: number;
      correctAnswers: number;
      topicBreakdown: any[];
    }>(`/api/exams/${sessionId}/finish`, { method: "POST" });
  }

  async getExamStatus(sessionId: string) {
    return this.request<any>(`/api/exams/${sessionId}/status`);
  }

  // AI Tutoring Agents
  async chatWithAgent(agentId: "coachbot" | "studybuddy" | "proctorbot", message: string, viewId: string) {
    return this.request<{
      role: string;
      message: string;
      citations?: Array<{ lessonId: string; title: string }>;
      steps?: string[];
    }>(`/api/agents/${agentId}/chat`, {
      method: "POST",
      body: { message, viewId },
    });
  }

  // Voice Q&A
  async getVoiceExplanation(question: string, context: string) {
    return this.request<{
      explanation: string;
      audioUrl?: string;
    }>("/api/voice-qa", {
      method: "POST",
      body: { question, context },
    });
  }
}

export const api = new ApiClient(API_BASE_URL);

// Storage helpers for offline support
export const storage = {
  async saveFlashcards(cards: any[]) {
    await AsyncStorage.setItem("cached_flashcards", JSON.stringify(cards));
  },

  async getFlashcards(): Promise<any[] | null> {
    const data = await AsyncStorage.getItem("cached_flashcards");
    return data ? JSON.parse(data) : null;
  },

  async saveConversation(agentId: string, messages: any[]) {
    await AsyncStorage.setItem(`conversation_${agentId}`, JSON.stringify(messages));
  },

  async getConversation(agentId: string): Promise<any[] | null> {
    const data = await AsyncStorage.getItem(`conversation_${agentId}`);
    return data ? JSON.parse(data) : null;
  },

  async queueOfflineAction(action: { type: string; endpoint: string; body?: any }) {
    const queue = await this.getOfflineQueue();
    queue.push({ ...action, timestamp: Date.now() });
    await AsyncStorage.setItem("offline_queue", JSON.stringify(queue));
  },

  async getOfflineQueue(): Promise<any[]> {
    const data = await AsyncStorage.getItem("offline_queue");
    return data ? JSON.parse(data) : [];
  },

  async clearOfflineQueue() {
    await AsyncStorage.removeItem("offline_queue");
  },
};
