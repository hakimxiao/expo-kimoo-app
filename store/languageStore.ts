import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { addAppBreadcrumb } from "@/lib/sentry";
import { LanguageCode } from "@/types/learning";

interface LanguageState {
  selectedLanguage: LanguageCode | null;
  setSelectedLanguage: (code: LanguageCode) => void;
  clearSelectedLanguage: () => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      selectedLanguage: null,
      setSelectedLanguage: (code) => {
        addAppBreadcrumb("Language selected", { languageCode: code });
        set({ selectedLanguage: code });
      },
      clearSelectedLanguage: () => {
        addAppBreadcrumb("Language cleared");
        set({ selectedLanguage: null });
      },
    }),
    {
      name: "language-store",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
