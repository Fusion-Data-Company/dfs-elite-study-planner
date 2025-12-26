/**
 * Hook for Quiz/Exam Mode
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@clerk/clerk-expo";
import { useState, useCallback, useEffect, useRef } from "react";

export interface QuestionBank {
  id: string;
  title: string;
  description: string;
  questionCount: number;
  timeLimit: number; // minutes
  passingScore: number; // percentage
}

export interface ExamQuestion {
  id: string;
  question: string;
  options: string[];
  selectedAnswer?: string;
  flagged?: boolean;
}

export interface ExamSession {
  sessionId: string;
  questions: ExamQuestion[];
  timeLimit: number;
  startTime: number;
  currentIndex: number;
}

export interface ExamResult {
  score: number;
  passed: boolean;
  totalQuestions: number;
  correctAnswers: number;
  topicBreakdown: Array<{
    topic: string;
    correct: number;
    total: number;
    percentage: number;
  }>;
  incorrectQuestions: Array<{
    question: string;
    yourAnswer: string;
    correctAnswer: string;
    explanation: string;
  }>;
}

export function useQuestionBanks() {
  const { getToken, isSignedIn } = useAuth();

  return useQuery<QuestionBank[]>({
    queryKey: ["questionBanks"],
    queryFn: async () => {
      const token = await getToken();
      if (token) {
        api.setAuthToken(token);
      }
      return api.getQuestionBanks();
    },
    enabled: isSignedIn,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

export function useExamSession() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const [session, setSession] = useState<ExamSession | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Timer countdown
  useEffect(() => {
    if (session && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Time's up - auto-submit
            finishExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [session]);

  const startExamMutation = useMutation({
    mutationFn: async (bankId: string) => {
      const token = await getToken();
      if (token) {
        api.setAuthToken(token);
      }
      return api.startExam(bankId);
    },
    onSuccess: (data) => {
      setSession({
        sessionId: data.sessionId,
        questions: data.questions.map(q => ({ ...q, flagged: false })),
        timeLimit: data.timeLimit,
        startTime: Date.now(),
        currentIndex: 0,
      });
      setTimeRemaining(data.timeLimit * 60); // Convert minutes to seconds
    },
  });

  const submitAnswerMutation = useMutation({
    mutationFn: async ({ questionId, answer }: { questionId: string; answer: string }) => {
      if (!session) return;
      const token = await getToken();
      if (token) {
        api.setAuthToken(token);
      }
      return api.submitAnswer(session.sessionId, questionId, answer);
    },
  });

  const finishExamMutation = useMutation({
    mutationFn: async () => {
      if (!session) return;
      const token = await getToken();
      if (token) {
        api.setAuthToken(token);
      }
      return api.finishExam(session.sessionId);
    },
    onSuccess: () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      queryClient.invalidateQueries({ queryKey: ["userMetrics"] });
    },
  });

  const startExam = useCallback((bankId: string) => {
    startExamMutation.mutate(bankId);
  }, []);

  const selectAnswer = useCallback((questionId: string, answer: string) => {
    if (!session) return;

    setSession(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        questions: prev.questions.map(q =>
          q.id === questionId ? { ...q, selectedAnswer: answer } : q
        ),
      };
    });

    // Submit to API
    submitAnswerMutation.mutate({ questionId, answer });
  }, [session]);

  const toggleFlag = useCallback((questionId: string) => {
    if (!session) return;

    setSession(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        questions: prev.questions.map(q =>
          q.id === questionId ? { ...q, flagged: !q.flagged } : q
        ),
      };
    });
  }, [session]);

  const goToQuestion = useCallback((index: number) => {
    if (!session) return;
    setSession(prev => prev ? { ...prev, currentIndex: index } : prev);
  }, [session]);

  const nextQuestion = useCallback(() => {
    if (!session) return;
    setSession(prev => prev ? {
      ...prev,
      currentIndex: Math.min(prev.currentIndex + 1, prev.questions.length - 1),
    } : prev);
  }, [session]);

  const prevQuestion = useCallback(() => {
    if (!session) return;
    setSession(prev => prev ? {
      ...prev,
      currentIndex: Math.max(prev.currentIndex - 1, 0),
    } : prev);
  }, [session]);

  const finishExam = useCallback(async () => {
    return finishExamMutation.mutateAsync();
  }, []);

  const currentQuestion = session?.questions[session.currentIndex] || null;
  const answeredCount = session?.questions.filter(q => q.selectedAnswer).length || 0;
  const flaggedCount = session?.questions.filter(q => q.flagged).length || 0;

  // Format time remaining
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return {
    session,
    currentQuestion,
    timeRemaining,
    formattedTime: formatTime(timeRemaining),
    answeredCount,
    flaggedCount,
    isStarting: startExamMutation.isPending,
    isFinishing: finishExamMutation.isPending,
    result: finishExamMutation.data as ExamResult | undefined,
    startExam,
    selectAnswer,
    toggleFlag,
    goToQuestion,
    nextQuestion,
    prevQuestion,
    finishExam,
  };
}
