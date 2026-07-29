import i18n, { changeLanguage } from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { I18nManager } from "react-native";
import translationEn from "./locales/en.json";
import translationVi from "./locales/vi.json";
import viCommon from "./locales/vi/common.json";
import viAuth from "./locales/vi/auth.json";
import enCommon from "./locales/en/common.json";
import enAuth from "./locales/en/auth.json";
import enView from "./locales/en/view.json";
import viView from "./locales/vi/view.json";
import enComp from "./locales/en/comp.json";
import viComp from "./locales/vi/comp.json";

const resources = {
  en: { translation: translationEn, common: enCommon, auth: enAuth, view: enView, comp: enComp },
  vi: { translation: translationVi, common: viCommon, auth: viAuth, view: viView, comp: viComp }, 
};

const RTL_LANGUAGES = ["ar", "ar-SA"];

const LANGUAGE_KEY = "@app_language";

const initI18n = async () => {
  try {
    // Try to get saved language preference
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);

    // Determine which language to use
    let selectedLanguage = savedLanguage;
    if (!selectedLanguage) {
      // If no saved language, use device locale or fallback
      const deviceLocales = Localization.getLocales();
      const deviceLocale = deviceLocales[0]?.languageTag || "en";
      const languageCode = deviceLocale.split("-")[0];

      // Try exact locale match first
      if (deviceLocale in resources) {
        selectedLanguage = deviceLocale;
      }

      // Then try language code match
      else if (languageCode in resources) {
        selectedLanguage = languageCode;
      } else {
        selectedLanguage = "en";
      }
    }

    // Handle RTL layout
    const isRTL = RTL_LANGUAGES.includes(selectedLanguage);

    if (I18nManager.isRTL !== isRTL) {
      I18nManager.allowRTL(isRTL);
      I18nManager.forceRTL(isRTL);
    }

    // eslint-disable-next-line import/no-named-as-default-member
    await i18n.use(initReactI18next).init({
      resources,
      lng: selectedLanguage,
      ns: ["translation", "common", "view", "comp"],
      defaultNS: "translation",
      fallbackLng: {
        "en-*": ["en"],
        "vi-*": ["vi"],
        default: ["en"],
      },
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false,
      },
    });

    // Save the selected language
    if (!savedLanguage) {
      await AsyncStorage.setItem(LANGUAGE_KEY, selectedLanguage);
    }
  } catch (error) {
    console.error("Error initializing i18n:", error);

    // Initialize with defaults if there's an error
    // eslint-disable-next-line import/no-named-as-default-member
    await i18n.use(initReactI18next).init({
      resources,
      lng: "en",
      fallbackLng: "en",
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false,
      },
    });
  }
};

initI18n();

export default i18n;
export async function saveLanguage(item: Language) {
  changeLanguage(item);
  await AsyncStorage.setItem(LANGUAGE_KEY, item);
}
export const SupportedLanguages = Object.keys(resources);
export type Language = keyof typeof resources;
