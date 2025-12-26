/**
 * Hook for iFlash flashcard system with SRS algorithm
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, storage } from "@/lib/api";
import { useAuth } from "@clerk/clerk-expo";
import { useState, useCallback } from "react";

export interface Flashcard {
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
}

export interface FlashcardSession {
  cards: Flashcard[];
  currentIndex: number;
  correct: number;
  incorrect: number;
  streak: number;
}

// SRS Grade levels
export type SRSGrade = 0 | 1 | 2 | 3; // 0=Again, 1=Hard, 2=Good, 3=Easy

export function useFlashcards() {
  const { getToken, isSignedIn } = useAuth();
  const queryClient = useQueryClient();

  const cardsQuery = useQuery({
    queryKey: ["flashcards"],
    queryFn: async () => {
      const token = await getToken();
      if (token) {
        api.setAuthToken(token);
      }
      
      try {
        const data = await api.getFlashcards();
        // Cache for offline use
        await storage.saveFlashcards(data.cards);
        return data;
      } catch (error) {
        // Try to load from cache if offline
        const cached = await storage.getFlashcards();
        if (cached) {
          return { cards: cached, totalDue: cached.length };
        }
        throw error;
      }
    },
    enabled: isSignedIn,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  const reviewMutation = useMutation({
    mutationFn: async ({ cardId, grade }: { cardId: string; grade: SRSGrade }) => {
      const token = await getToken();
      if (token) {
        api.setAuthToken(token);
      }
      return api.submitFlashcardReview(cardId, grade);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flashcards"] });
      queryClient.invalidateQueries({ queryKey: ["userMetrics"] });
    },
  });

  return {
    cards: cardsQuery.data?.cards || [],
    totalDue: cardsQuery.data?.totalDue || 0,
    isLoading: cardsQuery.isLoading,
    error: cardsQuery.error,
    refetch: cardsQuery.refetch,
    submitReview: reviewMutation.mutate,
    isSubmitting: reviewMutation.isPending,
  };
}

export function useFlashcardSession() {
  const { cards, submitReview } = useFlashcards();
  const [session, setSession] = useState<FlashcardSession>({
    cards: [],
    currentIndex: 0,
    correct: 0,
    incorrect: 0,
    streak: 0,
  });

  const startSession = useCallback((cardList?: Flashcard[]) => {
    const sessionCards = cardList || cards;
    setSession({
      cards: sessionCards,
      currentIndex: 0,
      correct: 0,
      incorrect: 0,
      streak: 0,
    });
  }, [cards]);

  const gradeCard = useCallback((grade: SRSGrade) => {
    const currentCard = session.cards[session.currentIndex];
    if (!currentCard) return;

    // Submit review to API
    submitReview({ cardId: currentCard.id, grade });

    // Update session stats
    const isCorrect = grade >= 2; // Good or Easy
    setSession(prev => ({
      ...prev,
      currentIndex: prev.currentIndex + 1,
      correct: prev.correct + (isCorrect ? 1 : 0),
      incorrect: prev.incorrect + (isCorrect ? 0 : 1),
      streak: isCorrect ? prev.streak + 1 : 0,
    }));
  }, [session, submitReview]);

  const nextCard = useCallback(() => {
    setSession(prev => ({
      ...prev,
      currentIndex: Math.min(prev.currentIndex + 1, prev.cards.length - 1),
    }));
  }, []);

  const prevCard = useCallback(() => {
    setSession(prev => ({
      ...prev,
      currentIndex: Math.max(prev.currentIndex - 1, 0),
    }));
  }, []);

  const currentCard = session.cards[session.currentIndex] || null;
  const isComplete = session.currentIndex >= session.cards.length;
  const progress = session.cards.length > 0 
    ? (session.currentIndex / session.cards.length) * 100 
    : 0;

  return {
    session,
    currentCard,
    isComplete,
    progress,
    startSession,
    gradeCard,
    nextCard,
    prevCard,
  };
}
