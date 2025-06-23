<template>
  <div class="game-history">
    <h2>Game History</h2>
    <div v-if="history.length === 0" class="empty-history">
      No games completed yet. Play your first game!
    </div>
    <table v-else class="history-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Difficulty</th>
          <th>Moves</th>
          <th>Time</th>
          <th>Seed</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="game in sortedHistory" :key="game.id">
          <td>{{ formatDate(game.date) }}</td>
          <td>{{ capitalizeFirstLetter(game.difficulty) }}</td>
          <td>{{ game.moves }}</td>
          <td>{{ formatTime(game.time) }}</td>
          <td>{{ game.seed }}</td>
          <td>
            <button @click="replayGame(game)" class="replay-button">
              Replay
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useGameStore } from "@/stores/gameStore";
import type { HistoryEntry } from "@/types";
import "./GameHistory.css";

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
  return new Intl.DateTimeFormat("en-US", {
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

// Capitalize first letter of a string
const capitalizeFirstLetter = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Start a new game with the same settings as a previous one
const replayGame = (game: HistoryEntry) => {
  gameStore.resetGame();
  gameStore.initGame(game.difficulty, game.seed);
  gameStore.startGame();

  // Dispatch a custom event to notify other components that a game has been replayed
  document.dispatchEvent(new CustomEvent("game-replayed"));
};
</script>
