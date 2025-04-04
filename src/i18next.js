import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import Backend from "i18next-xhr-backend";
import LanguageDetector from "i18next-browser-languagedetector";
// not like to use this?
// have a look at the Quick start guide
// for passing in lng and translations on init

const languages = ["en"];

i18n
  // load translation using xhr -> see /public/locales (i.e. https://github.com/i18next/react-i18next/tree/master/example/react/public/locales)
  // learn more: https://github.com/i18next/i18next-xhr-backend
  .use(Backend)
  // detect user language
  // learn more: https://github.com/i18next/i18next-browser-languageDetector
  .use(LanguageDetector)
  // pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // init i18next
  // for all options read: https://www.i18next.com/overview/configuration-options

  .init({
    fallbackLng: "en",
    debug: false,
    whitelist: languages,

    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    react: {
      wait: true,
      useSuspense: false,
    },
    backend: {
      loadPath: process.env.NODE_ENV !== "production"? 
        `./locales/{{lng}}/translation.json`
        : 
        `/comquest/locales/{{lng}}/translation.json`
    }
  });

export default i18n;
