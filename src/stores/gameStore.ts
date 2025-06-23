import { defineStore } from 'pinia'
import {ref} from "vue";
import type {Difficulty, GameState} from "@/types";

export const useGameStore = defineStore('game', () => {
  // Game state
  const difficulty = ref<Difficulty>('easy')
  const gameState = ref<GameState>('idle')
  return {difficulty, gameState}
})
