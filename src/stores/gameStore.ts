import { defineStore } from 'pinia'
import {ref} from "vue";
import type {Difficulty} from "@/types";

export const useGameStore = defineStore('game', () => {
  // Game state
  const difficulty = ref<Difficulty>('easy')
  return {difficulty}
})
