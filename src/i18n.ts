import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import es from "src/components/LanguageSelector/locales/en.json";
import en from "src/components/LanguageSelector/locales/es.json";

import TradHomeLandigPageEN from "src/views/LandingPage/locales/en.json";
import TradHomeLandigPageES from "src/views/LandingPage/locales/es.json";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      es: { translation: es, 
            landingPage: TradHomeLandigPageES },
      en: { translation: en, 
            landingPage: TradHomeLandigPageEN }
    },
    lng: "es",
    fallbackLng: "en",
    interpolation: { escapeValue: false }
  });

export default i18n;