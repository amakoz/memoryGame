<script setup lang="ts">
import { useI18n } from "vue-i18n";
import GameBoard from "@/components/GameBoard/GameBoard.vue";
import GameControls from "@/components/GameControls/GameControls.vue";
import GameHistory from "@/components/GameHistory/GameHistory.vue";
import LanguageSwitcher from "@/components/LanguageSwitcher/LanguageSwitcher.vue";
import "./App.css";

const { t } = useI18n();
</script>

<template>
  <div class="app-container">
    <header>
      <h1>{{ t("gameTitle") }}</h1>
      <LanguageSwitcher />
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
