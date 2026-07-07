import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

i18n
  // load translation using http
  .use(Backend)
  // detect user language
  .use(LanguageDetector)
  // pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // init i18next
  .init({
    fallbackLng: 'en',
    debug: true,

    interpolation: {
      escapeValue: false,
    },
  })
  .catch((error) => {
    console.error('i18next init failed', error);
  });

export default i18n;
