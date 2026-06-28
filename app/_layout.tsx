import "../global.css";

import { ClerkProvider, useUser } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import * as Sentry from "@sentry/react-native";
import Constants from "expo-constants";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { setLearningContext } from "@/lib/sentry";
import { useLanguageStore } from "@/store/languageStore";
import { useLearningStore } from "@/store/learningStore";

Sentry.init({
  dsn: "https://b4663f9fc231c6b971ef1d77f9da7d33@o4511320999133184.ingest.de.sentry.io/4511643856142416",
  environment: __DEV__ ? "development" : "production",
  release: `${Constants.expoConfig?.slug ?? "kimoo-app"}@${Constants.expoConfig?.version ?? "1.0.0"}`,

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Performance monitoring for Expo Router screens and app startup.
  tracesSampleRate: __DEV__ ? 1.0 : 0.2,

  // Enable Logs
  enableLogs: true,

  // Configure Session Replay
  replaysSessionSampleRate: __DEV__ ? 1.0 : 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [
    Sentry.expoRouterIntegration(),
    Sentry.mobileReplayIntegration({
      maskAllText: true,
      maskAllImages: true,
      captureSurfaceViews: true,
    }),
    Sentry.feedbackIntegration(),
  ],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error("Add EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY to your .env file");
}

SplashScreen.preventAutoHideAsync();

function SentryAppContext() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { selectedLanguage } = useLanguageStore();
  const { xpToday, dailyGoal, streak, completedLessonIds } = useLearningStore();

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn || !user) {
      Sentry.setUser(null);
      return;
    }

    Sentry.setUser({
      id: user.id,
      email: user.primaryEmailAddress?.emailAddress,
      username: user.username ?? user.fullName ?? undefined,
    });
  }, [isLoaded, isSignedIn, user]);

  useEffect(() => {
    setLearningContext({
      selectedLanguage,
      xpToday,
      dailyGoal,
      streak,
      completedLessonsCount: completedLessonIds.length,
    });
  }, [completedLessonIds.length, dailyGoal, selectedLanguage, streak, xpToday]);

  return null;
}

export default Sentry.wrap(function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <SentryAppContext />
      <Sentry.ErrorBoundary
        fallback={({ resetError }) => (
          <View className="flex-1 items-center justify-center bg-white px-6">
            <Text className="font-poppins-bold text-2xl text-text-primary">
              Aduh, ada yang bermasalah
            </Text>
            <Text className="body-md mt-2 text-center text-text-secondary">
              Tim Kimoo sudah mendapat laporannya. Coba muat ulang layar ini.
            </Text>
            <TouchableOpacity
              className="mt-6 rounded-2xl bg-lingua-purple px-6 py-4"
              activeOpacity={0.85}
              onPress={resetError}
            >
              <Text className="font-poppins-semibold text-base text-white">
                Coba lagi
              </Text>
            </TouchableOpacity>
          </View>
        )}
      >
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="language-select" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </Sentry.ErrorBoundary>
    </ClerkProvider>
  );
});
