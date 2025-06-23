<script setup lang="ts">
import { useI18n } from "vue-i18n";
import GameBoard from "@/components/GameBoard/GameBoard.vue";
import GameControls from "@/components/GameControls/GameControls.vue";
import GameHistory from "@/components/GameHistory/GameHistory.vue";
import "./App.css";

const { t, locale } = useI18n();

const setLanguage = (lang: string) => {
  locale.value = lang;
};
</script>

<template>
  <div class="app-container">
    <header>
      <h1>{{ t("gameTitle") }}</h1>
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
    </header>

    <main>
      <GameControls />
      <GameBoard />
      <GameHistory />
    </main>

    <footer>
      <p>&copy; {{ new Date().getFullYear() }} {{ t("gameTitle") }}</p>
    </footer>
  </div>
</template>
