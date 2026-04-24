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

import TradClientES from 'src/views/cliente/locales/es.json';
import TradClientEN from 'src/views/cliente/locales/en.json';

import TradProductES from 'src/components/products/locales/es.json';
import TradProductEN from 'src/components/products/locales/en.json';

import TradSamplePageES from 'src/views/sample-page/locales/es.json';
import TradSamplePageEN from 'src/views/sample-page/locales/en.json';

import TradSidebarES from 'src/layouts/full/sidebar/locales/es.json';
import TradSidebarEN from 'src/layouts/full/sidebar/locales/en.json';

import TradVendorsES from 'src/views/vendedor/locales/es.json';
import TradVendorsEN from 'src/views/vendedor/locales/en.json';

import TradProductTableES from 'src/components/tables/locales/es.json';
import TradProductTableEN from 'src/components/tables/locales/en.json';
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
        client: TradClientES,
        product: TradProductES,
        samplePage: TradSamplePageES,
        sidebar: TradSidebarES,
        vendedor: TradVendorsES,
        productTable: TradProductTableES,  
      },
      en: {
        translation: en,
        languageSelector: en,
        landingPage: TradHomeLandigPageEN,
        header: TrandHeaderEN,
        map: TradMapEN,
        client: TradClientEN,
        product: TradProductEN,
        samplePage: TradSamplePageEN,
        sidebar: TradSidebarEN,
        vendedor: TradVendorsEN,
        productTable: TradProductTableEN,
      },
    },
    lng: "es",
    fallbackLng: "en",
    interpolation: { escapeValue: false },
  });

export default i18n;