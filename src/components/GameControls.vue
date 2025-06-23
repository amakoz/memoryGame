<template>
  <div class="game-controls">
    <div class="control-section">
      <h2>Game Settings</h2>
      <div class="settings-group">
        <label for="difficulty">Difficulty:</label>
        <select id="difficulty" v-model="selectedDifficulty">
          <option value="easy">Easy (4x4)</option>
          <option value="medium">Medium (4x6)</option>
          <option value="hard">Hard (6x6)</option>
        </select>
      </div>


      <div class="settings-group">
        <label for="seed">Seed (optional):</label>
        <input
            id="seed"
            type="text"
            v-model="seedInput"
            placeholder="Leave empty for random"
            :disabled="isPlaying"
        >
        <button @click="generateRandomSeed" :disabled="isPlaying" class="secondary-button">
          Generate
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {useGameStore} from "@/stores/gameStore.ts";
import {computed, ref} from "vue";
import type {Difficulty} from "@/types";

const gameStore = useGameStore()

// Game settings
const selectedDifficulty = ref<Difficulty>('easy')
const seedInput = ref('')

// Get state from store
const isPlaying = computed(() => gameStore.gameState === 'playing')

// Generate a random seed
const generateRandomSeed = () => {
  seedInput.value = Math.random().toString(36).substring(2, 8)
}
</script>

<style scoped>
</style>
