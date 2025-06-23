<script setup lang="ts">
import { useI18n } from "vue-i18n";
import "./LanguageSwitcher.css";

const { locale } = useI18n();

const setLanguage = (lang: string) => {
  locale.value = lang;
};
</script>

<template>
  <div class="language-switcher">
    <button
      @click="setLanguage('en')"
      class="language-button"
      :class="{ active: locale === 'en' }"
    >
      EN
    </button>
    <button
      @click="setLanguage('pl')"
      class="language-button"
      :class="{ active: locale === 'pl' }"
    >
      PL
    </button>
  </div>
</template>
