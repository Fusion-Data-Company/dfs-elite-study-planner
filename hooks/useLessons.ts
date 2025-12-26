/**
 * Hook for Lessons Browser
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@clerk/clerk-expo";

export interface Lesson {
  id: string;
  slug: string;
  title: string;
  description: string;
  content?: string;
  trackId: string;
  trackTitle: string;
  moduleId: string;
  moduleTitle: string;
  order: number;
  duration: number; // minutes
  ceHours: number;
  isPublished: boolean;
  progress?: number;
  completed?: boolean;
}

export interface EnhancedLesson extends Lesson {
  checkpoints: Array<{
    id: string;
    title: string;
    content: string;
    order: number;
    completed: boolean;
  }>;
}

export function useLessons() {
  const { getToken, isSignedIn } = useAuth();

  return useQuery<Lesson[]>({
    queryKey: ["lessons"],
    queryFn: async () => {
      const token = await getToken();
      if (token) {
        api.setAuthToken(token);
      }
      return api.getRecentLessons();
    },
    enabled: isSignedIn,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

export function useLesson(slug: string) {
  const { getToken, isSignedIn } = useAuth();

  return useQuery<Lesson>({
    queryKey: ["lesson", slug],
    queryFn: async () => {
      const token = await getToken();
      if (token) {
        api.setAuthToken(token);
      }
      return api.getLessonBySlug(slug);
    },
    enabled: isSignedIn && !!slug,
  });
}

export function useEnhancedLesson(slug: string) {
  const { getToken, isSignedIn } = useAuth();

  return useQuery<EnhancedLesson>({
    queryKey: ["enhancedLesson", slug],
    queryFn: async () => {
      const token = await getToken();
      if (token) {
        api.setAuthToken(token);
      }
      return api.getEnhancedLesson(slug);
    },
    enabled: isSignedIn && !!slug,
  });
}

export function useLessonProgress() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  const saveCheckpoint = useMutation({
    mutationFn: async ({ lessonId, checkpointId, completed }: { lessonId: string; checkpointId: string; completed: boolean }) => {
      const token = await getToken();
      if (token) {
        api.setAuthToken(token);
      }
      return api.saveCheckpointProgress(lessonId, { checkpointId, completed });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["enhancedLesson"] });
      queryClient.invalidateQueries({ queryKey: ["lessons"] });
      queryClient.invalidateQueries({ queryKey: ["courseProgress"] });
    },
  });

  const saveProgress = useMutation({
    mutationFn: async ({ lessonId, progress, completed }: { lessonId: string; progress: number; completed: boolean }) => {
      const token = await getToken();
      if (token) {
        api.setAuthToken(token);
      }
      return api.saveLessonProgress(lessonId, { progress, completed });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lessons"] });
      queryClient.invalidateQueries({ queryKey: ["courseProgress"] });
      queryClient.invalidateQueries({ queryKey: ["userMetrics"] });
    },
  });

  return {
    saveCheckpoint: saveCheckpoint.mutate,
    saveProgress: saveProgress.mutate,
    isSaving: saveCheckpoint.isPending || saveProgress.isPending,
  };
}

// Group lessons by track and module
export function groupLessonsByTrack(lessons: Lesson[]): Map<string, Map<string, Lesson[]>> {
  const grouped = new Map<string, Map<string, Lesson[]>>();

  lessons.forEach(lesson => {
    if (!grouped.has(lesson.trackTitle)) {
      grouped.set(lesson.trackTitle, new Map());
    }
    const track = grouped.get(lesson.trackTitle)!;
    
    if (!track.has(lesson.moduleTitle)) {
      track.set(lesson.moduleTitle, []);
    }
    track.get(lesson.moduleTitle)!.push(lesson);
  });

  // Sort lessons within each module
  grouped.forEach(track => {
    track.forEach(lessons => {
      lessons.sort((a, b) => a.order - b.order);
    });
  });

  return grouped;
}
