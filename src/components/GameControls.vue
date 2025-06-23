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
    </div>
  </div>
</template>

<script setup lang="ts">
import {useGameStore} from "@/stores/gameStore.ts";
import {ref} from "vue";
import type {Difficulty} from "@/types";

const gameStore = useGameStore()

// Game settings
const selectedDifficulty = ref<Difficulty>('easy')
</script>

<style scoped>
</style>
