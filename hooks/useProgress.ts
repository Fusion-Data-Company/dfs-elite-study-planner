/**
 * Hook for fetching user progress and dashboard metrics
 */

import { useQuery } from "@tanstack/react-query";
import { api, storage } from "@/lib/api";
import { useAuth } from "@clerk/clerk-expo";

export interface UserMetrics {
  overallProgress: number;
  studyStreak: number;
  iflashDue: number;
  ceHours: number;
  ceHoursTotal: number;
  lessonsCompleted: number;
  quizzesPassed: number;
  averageScore: number;
  weeklyActivity?: {
    lessons: number;
    quizzes: number;
    avgScore: number;
  };
}

export interface CourseProgress {
  tracks: Array<{
    id: string;
    title: string;
    progress: number;
    ceHours: number;
    completedLessons: number;
    totalLessons: number;
  }>;
  overallProgress: number;
}

export function useUserMetrics() {
  const { getToken, isSignedIn } = useAuth();

  return useQuery<UserMetrics>({
    queryKey: ["userMetrics"],
    queryFn: async () => {
      const token = await getToken();
      if (token) {
        api.setAuthToken(token);
      }
      return api.getUserMetrics();
    },
    enabled: isSignedIn,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
}

export function useCourseProgress() {
  const { getToken, isSignedIn } = useAuth();

  return useQuery<CourseProgress>({
    queryKey: ["courseProgress"],
    queryFn: async () => {
      const token = await getToken();
      if (token) {
        api.setAuthToken(token);
      }
      return api.getCourseProgress();
    },
    enabled: isSignedIn,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
}
