import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { addAppBreadcrumb } from "@/lib/sentry";

interface LearningState {
  xpToday: number;
  dailyGoal: number;
  streak: number;
  completedLessonIds: string[];
  addXp: (amount: number) => void;
  completeLesson: (lessonId: string) => void;
}

export const useLearningStore = create<LearningState>()(
  persist(
    (set) => ({
      xpToday: 15,
      dailyGoal: 20,
      streak: 12,
      completedLessonIds: [],
      addXp: (amount) =>
        set((state) => {
          const nextXpToday = Math.min(state.xpToday + amount, state.dailyGoal);

          addAppBreadcrumb("XP added", {
            amount,
            xpToday: nextXpToday,
            dailyGoal: state.dailyGoal,
          });

          return { xpToday: nextXpToday };
        }),
      completeLesson: (lessonId) =>
        set((state) => {
          const alreadyCompleted = state.completedLessonIds.includes(lessonId);

          addAppBreadcrumb("Lesson completion saved", {
            lessonId,
            alreadyCompleted,
          });

          return {
            completedLessonIds: alreadyCompleted
              ? state.completedLessonIds
              : [...state.completedLessonIds, lessonId],
          };
        }),
    }),
    { name: "learning-store", storage: createJSONStorage(() => AsyncStorage) },
  ),
);
