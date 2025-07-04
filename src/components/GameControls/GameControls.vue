<template>
  <div class="game-controls">
    <div class="control-section">
      <h2>{{ t("gameSettings") }}</h2>
      <div class="settings-group">
        <label for="difficulty">{{ t("difficulty.label") }}:</label>
        <select id="difficulty" v-model="selectedDifficulty">
          <option value="easy">{{ t("difficulty.easy") }} (4x4)</option>
          <option value="medium">{{ t("difficulty.medium") }} (4x6)</option>
          <option value="hard">{{ t("difficulty.hard") }} (6x6)</option>
        </select>
      </div>

      <div class="settings-group">
        <label for="seed">{{ t("seed.label") }}:</label>
        <input
          id="seed"
          type="text"
          v-model="seedInput"
          :placeholder="t('seed.placeholder')"
          :disabled="isPlaying"
        />
        <button
          @click="generateRandomSeed"
          :disabled="isPlaying"
          class="secondary-button"
        >
          {{ t("seed.generate") }}
        </button>
      </div>

      <div class="button-group">
        <button v-if="!isPlaying" @click="startNewGame" class="primary-button">
          {{ t("newGame") }}
        </button>
        <button v-else @click="resetGame" class="warning-button">
          {{ t("restart") }}
        </button>
        <button
          @click="toggleSound"
          class="secondary-button sound-button"
          :class="{ 'sound-muted': soundMuted }"
        >
          <span class="sound-icon">{{ soundMuted ? "🔇" : "🔊" }}</span>
          <span>{{ t("sound") }}: {{ soundMuted ? t("off") : t("on") }}</span>
        </button>
      </div>
    </div>

    <div v-if="isPlaying || isCompleted" class="control-section">
      <h2>{{ t("stats.title") }}</h2>
      <div class="stats-container">
        <div class="stat-item">
          <span class="stat-label">{{ t("stats.moves") }}:</span>
          <span class="stat-value">{{ moveCount }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">{{ t("stats.time") }}:</span>
          <span class="stat-value">{{ formattedTime }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">{{ t("stats.seed") }}:</span>
          <span class="stat-value">{{ currentSeed }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useGameStore } from "@/stores/gameStore";
import { useSoundEffects } from "@/services/soundService";
import { useI18n } from "vue-i18n";
import type { Difficulty } from "@/types";
import "./GameControls.css";

// Custom event types
interface SoundStateEvent extends Event {
  detail?: { muted: boolean };
}

interface GameReplayedEvent extends Event {
  detail?: { seed: string; difficulty: Difficulty };
}

const { t } = useI18n();
const gameStore = useGameStore();
const soundService = useSoundEffects();

// Game settings
const selectedDifficulty = ref<Difficulty>("easy");
const seedInput = ref("");

// Create a local reactive state for sound muted status
const soundMuted = ref(soundService.isMuted.value);

// Get state from store
const isPlaying = computed(() => gameStore.gameState === "playing");
const isCompleted = computed(() => gameStore.gameState === "completed");
const moveCount = computed(() => gameStore.moveCount);
const currentSeed = computed(() => gameStore.seed);

// Timer for game time display
let timerInterval: ReturnType<typeof setInterval> | null = null;
const elapsedTime = ref(0);

// Format time for display
const formattedTime = computed(() => {
  const minutes = Math.floor(elapsedTime.value / 60);
  const seconds = elapsedTime.value % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
});

// Generate a random seed
const generateRandomSeed = () => {
  seedInput.value = Math.random().toString(36).substring(2, 8);
};

// Start a new game with current settings
const startNewGame = () => {
  gameStore.initGame(selectedDifficulty.value, seedInput.value);
  gameStore.startGame();
  startTimer();
};

// Reset the current game
const resetGame = () => {
  gameStore.resetGame();
  stopTimer();
  elapsedTime.value = 0;
};

// Toggle sound on/off
const toggleSound = () => {
  soundService.toggleMute();
  soundMuted.value = soundService.isMuted.value;
};

// Start the game timer
const startTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval);
  }

  const startTime = gameStore.startTime || Date.now();

  timerInterval = setInterval(() => {
    if (gameStore.gameState === "playing") {
      elapsedTime.value = Math.floor((Date.now() - startTime) / 1000);
    } else if (gameStore.gameState === "completed") {
      stopTimer();
    }
  }, 1000);
};

// Stop the timer
const stopTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
};

// Listen for sound state changes
const updateSoundState = (event: SoundStateEvent) => {
  if (event.detail) {
    soundMuted.value = event.detail.muted;
  } else {
    soundMuted.value = soundService.isMuted.value;
  }
};

// Handle game replay events
const handleGameReplayed = (event: GameReplayedEvent) => {
  console.log("Game replayed event received, starting timer");

  // Update difficulty if provided in the event detail
  if (event.detail?.difficulty) {
    selectedDifficulty.value = event.detail.difficulty;
  }

  elapsedTime.value = 0; // Reset elapsed time
  startTimer();
};

// Lifecycle hooks
onMounted(() => {
  // Load sound preferences and preload sounds
  soundService.loadMutePreference();
  soundService.preloadSounds();

  // Initialize local sound state
  soundMuted.value = soundService.isMuted.value;

  // Listen to custom sound state change events
  document.addEventListener(
    "sound-state-changed",
    updateSoundState as EventListener,
  );

  // Listen for game replayed events from GameHistory component
  document.addEventListener(
    "game-replayed",
    handleGameReplayed as EventListener,
  );

  // Try to load saved game
  if (gameStore.loadGameState() && gameStore.gameState === "playing") {
    selectedDifficulty.value = gameStore.difficulty;
    startTimer();
  }
});

onUnmounted(() => {
  stopTimer();
  document.removeEventListener(
    "sound-state-changed",
    updateSoundState as EventListener,
  );
  document.removeEventListener(
    "game-replayed",
    handleGameReplayed as EventListener,
  );
});
</script>
