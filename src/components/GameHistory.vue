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
};
</script>

<style scoped>
.game-history {
  margin-top: 40px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

h2 {
  font-size: 1.5rem;
  margin: 0 0 20px;
  color: #333;
  border-bottom: 1px solid #ddd;
  padding-bottom: 8px;
}

.empty-history {
  text-align: center;
  padding: 20px;
  color: #718096;
  font-style: italic;
}

.history-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
  font-size: 14px;
}

.history-table th,
.history-table td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

.history-table th {
  background-color: #edf2f7;
  font-weight: 600;
  color: #4a5568;
}

.history-table tr:hover {
  background-color: #f7fafc;
}

.replay-button {
  background-color: #4b69ff;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.replay-button:hover {
  background-color: #3a57e8;
}

/* Responsive styling */
@media (max-width: 768px) {
  .game-history {
    padding: 15px;
    overflow-x: auto;
  }

  .history-table {
    font-size: 12px;
  }

  .history-table th,
  .history-table td {
    padding: 8px 5px;
  }

  .replay-button {
    padding: 4px 8px;
    font-size: 12px;
  }
}
</style>
