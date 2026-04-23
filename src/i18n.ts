import i18n from "i18next";
import { initReactI18next } from "react-i18next";


import es from "src/components/LanguageSelector/locales/es.json";
import en from "src/components/LanguageSelector/locales/en.json";

import TradHomeLandigPageEN from "src/views/LandingPage/locales/en.json";
import TradHomeLandigPageES from "src/views/LandingPage/locales/es.json";

import TrandHeaderEN from 'src/layouts/full/header/locales/en.json';
import TrandHeaderES from 'src/layouts/full/header/locales/es.json';

import TradMapEN from 'src/views/shared/locales/en.json';
import TradMapES from 'src/views/shared/locales/es.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      es: {
        translation: es,
        languageSelector: es,  
        landingPage: TradHomeLandigPageES,
        header: TrandHeaderES,
        map: TradMapES,
      },
      en: {
        translation: en,
        languageSelector: en,   
        landingPage: TradHomeLandigPageEN,
        header: TrandHeaderEN,
        map: TradMapEN,
      },
    },
    lng: "es",
    fallbackLng: "en",
    interpolation: { escapeValue: false },
  });

export default i18n;