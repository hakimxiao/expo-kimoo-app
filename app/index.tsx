import { useAuth } from "@clerk/expo";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

import { useLanguageStore } from "@/store/languageStore";

export default function Index() {
  const { isSignedIn, isLoaded } = useAuth();
  const { selectedLanguage } = useLanguageStore();

  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(useLanguageStore.persist.hasHydrated());
    const unsub = useLanguageStore.persist.onFinishHydration(() => setHasHydrated(true));
    return () => {
      unsub?.();
    };
  }, []);

  if (!isLoaded || !hasHydrated) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#6c4ef5" />
      </View>
    );
  }

  if (!isSignedIn) {
    return <Redirect href="/onboarding" />;
  }

  if (!selectedLanguage) {
    return <Redirect href="/language-select" />;
  }

  return <Redirect href="/(tabs)" />;
}
