import { createI18n } from "vue-i18n";
import en from "./locales/en.json";
import pl from "./locales/pl.json";

export default createI18n({
  legacy: false, // Set to false to use Composition API
  globalInjection: true, // Make $t, $d, etc. available in templates
  locale: "en", // Set default locale
  fallbackLocale: "en", // Set fallback locale
  messages: {
    en,
    pl,
  },
});
