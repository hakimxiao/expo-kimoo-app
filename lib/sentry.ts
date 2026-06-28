import * as Sentry from "@sentry/react-native";

import { LanguageCode } from "@/types/learning";

type BreadcrumbLevel = "debug" | "info" | "warning" | "error";

export function addAppBreadcrumb(
  message: string,
  data?: Record<string, string | number | boolean | null | undefined>,
  level: BreadcrumbLevel = "info",
) {
  Sentry.addBreadcrumb({
    category: "app",
    message,
    level,
    data,
  });
}

export function setLearningContext({
  selectedLanguage,
  xpToday,
  dailyGoal,
  streak,
  completedLessonsCount,
}: {
  selectedLanguage: LanguageCode | null;
  xpToday: number;
  dailyGoal: number;
  streak: number;
  completedLessonsCount: number;
}) {
  Sentry.setTag("selected_language", selectedLanguage ?? "none");
  Sentry.setContext("learning", {
    selectedLanguage,
    xpToday,
    dailyGoal,
    streak,
    completedLessonsCount,
  });
}

export function captureHandledError(
  error: unknown,
  context: string,
  data?: Record<string, string | number | boolean | null | undefined>,
) {
  Sentry.captureException(error, {
    tags: { handled_in: context },
    extra: data,
  });
}
