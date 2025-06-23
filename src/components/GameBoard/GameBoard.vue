<template>
  <div class="game-board-wrapper">
    <div
      class="game-board"
      :class="`difficulty-${gameStore.difficulty}`"
      :style="{
        gridTemplateColumns: `repeat(${columnsCount}, 1fr)`,
        gridTemplateRows: `repeat(${rowsCount}, 1fr)`,
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
import { computed } from "vue";
import { useGameStore } from "@/stores/gameStore";
import { useSoundEffects } from "@/services/soundService";
import CanvasCard from "@/components/CanvasCard/CanvasCard.vue";
import "./GameBoard.css";

const gameStore = useGameStore();
const { playSound } = useSoundEffects();

const cards = computed(() => gameStore.cards);

// Get rows and columns directly from the store's difficultySettings
const rowsCount = computed(() => {
  const settings = gameStore.difficultySettings[gameStore.difficulty];
  return settings?.rows || 4;
});

const columnsCount = computed(() => {
  const settings = gameStore.difficultySettings[gameStore.difficulty];
  return settings?.cols || 4;
});

const rarityGradients = computed(() => gameStore.rarityGradients);

// Check if card is flipped
const isCardFlipped = (index: number) => {
  return (
    gameStore.flippedCards.includes(index) ||
    gameStore.matchedCards.includes(index)
  );
};

// Check if card is matched
const isCardMatched = (index: number) => {
  return gameStore.matchedCards.includes(index);
};

// Flip a card and play sound
const flipCard = (index: number) => {
  // Always play flip sound first for any attempted card flip
  // This ensures the sound plays immediately and isn't dependent on the game logic
  playSound("flip");

  // Store the current number of flipped cards before flipping
  const flippedCountBefore = gameStore.flippedCards.length;

  // Try to flip the card
  const cardWasFlipped = gameStore.flipCard(index);

  // If card was flipped and it was the second card
  if (cardWasFlipped && flippedCountBefore === 1) {
    // We now have two cards flipped, check for match after a short delay
    setTimeout(() => {
      // Check if the cards matched (flippedCards will be empty if they matched)
      if (
        gameStore.flippedCards.length === 0 &&
        gameStore.matchedCards.length >= 2
      ) {
        // Cards matched
        playSound("match");

        // Check for game over and play win sound
        if (gameStore.isGameOver) {
          setTimeout(() => {
            playSound("win");
          }, 500);
        }
      }
    }, 300);
  }
};
</script>
