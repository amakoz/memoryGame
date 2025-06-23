<template>
  <div class="game-history">
    <h2>{{ t("history.title") }}</h2>
    <div v-if="history.length === 0" class="empty-history">
      {{ t("history.noGames") }}
    </div>
    <table v-else class="history-table">
      <thead>
        <tr>
          <th>{{ t("history.date") }}</th>
          <th>{{ t("history.difficulty") }}</th>
          <th>{{ t("stats.moves") }}</th>
          <th>{{ t("history.duration") }}</th>
          <th>{{ t("stats.seed") }}</th>
          <th>{{ t("history.replay") }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="game in sortedHistory" :key="game.id">
          <td>{{ formatDate(game.date) }}</td>
          <td>{{ t(`difficulty.${game.difficulty}`) }}</td>
          <td>{{ game.moves }}</td>
          <td>{{ formatTime(game.time) }}</td>
          <td>{{ game.seed }}</td>
          <td>
            <button @click="replayGame(game)" class="replay-button">
              {{ t("history.replay") }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    <button
      v-if="history.length > 0"
      @click="clearHistory"
      class="clear-history-button"
    >
      {{ t("history.clear") }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useGameStore } from "@/stores/gameStore";
import { useI18n } from "vue-i18n";
import type { HistoryEntry } from "@/types";
import "./GameHistory.css";

const { t, locale } = useI18n();
const gameStore = useGameStore();

const history = computed(() => gameStore.history);

// Sort history with most recent games first
const sortedHistory = computed(() => {
  return [...history.value].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
});

// Format date for display
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  // Use the current locale for date formatting
  return new Intl.DateTimeFormat(locale.value === "en" ? "en-US" : "pl-PL", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

// Format time for display
const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

// Start a new game with the same settings as a previous one
const replayGame = (game: HistoryEntry) => {
  gameStore.resetGame();
  gameStore.initGame(game.difficulty, game.seed);
  gameStore.startGame();

  // Dispatch a custom event to notify other components that a game has been replayed
  document.dispatchEvent(new CustomEvent("game-replayed"));
};

// Clear all game history
const clearHistory = () => {
  gameStore.clearHistory();
};
</script>
