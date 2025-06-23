<template>
  <div class="game-board-wrapper">
    <div
      class="game-board"
      :style="{
        gridTemplateColumns: `repeat(${columnsCount}, 1fr)`,
        gridTemplateRows: `repeat(${rowsCount}, 1fr)`
      }"
    >
      <canvas-card
        v-for="(card, index) in cards"
        :key="card.id"
        :card="card"
        :index="index"
        :is-flipped="isCardFlipped(index)"
        :is-matched="isCardMatched(index)"
        :rarity-gradient="rarityGradients[card.rarity]"
        @flip="flipCard"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import CanvasCard from '@/components/CanvasCard.vue'

const gameStore = useGameStore()

const cards = computed(() => gameStore.cards)
const rowsCount = computed(() => {
  switch (gameStore.difficulty) {
    case 'easy': return 4
    case 'medium': return 4
    case 'hard': return 6
    default: return 4
  }
})

const columnsCount = computed(() => {
  switch (gameStore.difficulty) {
    case 'easy': return 4
    case 'medium': return 6
    case 'hard': return 6
    default: return 4
  }
})

const rarityGradients = computed(() => gameStore.rarityGradients)

// Check if card is flipped
const isCardFlipped = (index: number) => {
  return gameStore.flippedCards.includes(index) || gameStore.matchedCards.includes(index)
}

// Check if card is matched
const isCardMatched = (index: number) => {
  return gameStore.matchedCards.includes(index)
}

// Flip a card and play sound
const flipCard = (index: number) => {

  // Store the current number of flipped cards before flipping
  const flippedCountBefore = gameStore.flippedCards.length

  // Try to flip the card
  const cardWasFlipped = gameStore.flipCard(index)
}
</script>

<style scoped>
.game-board-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 20px;
  box-sizing: border-box;
  overflow-x: hidden; /* Prevent horizontal scrolling */
}

.game-board {
  display: grid;
  gap: 16px;
  max-width: 1100px; /* Increased from 900px to accommodate wider cards */
  width: 100%;
}

/* Responsive layout adjustments */
@media (max-width: 1200px) {
  .game-board {
    max-width: 95%; /* Use percentage width on smaller screens */
    gap: 12px; /* Slightly reduce gap on medium screens */
  }
}

@media (max-width: 768px) {
  .game-board-wrapper {
    padding: 10px;
  }

  .game-board {
    gap: 8px; /* Even smaller gap on mobile */
  }
}
</style>
