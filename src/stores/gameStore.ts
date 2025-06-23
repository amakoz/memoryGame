import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type {
  Difficulty,
  Card,
  GameState,
  HistoryEntry,
  Rarity,
  RarityGradients,
} from "@/types";

export const useGameStore = defineStore("game", () => {
  // Game state
  const difficulty = ref<Difficulty>("easy");
  const cards = ref<Card[]>([]);
  const flippedCards = ref<number[]>([]);
  const matchedCards = ref<number[]>([]);
  const gameState = ref<GameState>("idle");
  const seed = ref<string>("");
  const startTime = ref<number | null>(null);
  const endTime = ref<number | null>(null);
  const moveCount = ref(0);
  const history = ref<HistoryEntry[]>([]);

  // Game settings based on difficulty
  const difficultySettings = {
    easy: { rows: 4, cols: 4 },
    medium: { rows: 6, cols: 4 },
    hard: { rows: 6, cols: 6 },
  };

  // CS2 items for the game with proper rarity typing
  const items: { id: number; name: string; rarity: Rarity; image: string }[] = [
    { id: 1, name: "AK-47", rarity: "common", image: "/images/ak47.png" },
    { id: 2, name: "M4A4", rarity: "common", image: "/images/m4a4.png" },
    { id: 3, name: "AWP", rarity: "rare", image: "/images/awp.png" },
    {
      id: 4,
      name: "Desert Eagle",
      rarity: "uncommon",
      image: "/images/deagle.png",
    },
    {
      id: 5,
      name: "Glock-18",
      rarity: "common",
      image: "/images/glock-18.png",
    },
    { id: 6, name: "USP-S", rarity: "common", image: "/images/usp-s.png" },
    { id: 7, name: "P250", rarity: "common", image: "/images/p250.png" },
    { id: 8, name: "P90", rarity: "uncommon", image: "/images/p90.png" },
    { id: 9, name: "MP7", rarity: "uncommon", image: "/images/mp7.png" },
    { id: 10, name: "M249", rarity: "rare", image: "/images/m249.png" },
    { id: 11, name: "Nova", rarity: "uncommon", image: "/images/nova.png" },
    { id: 12, name: "XM1014", rarity: "rare", image: "/images/xm1014.png" },
    { id: 13, name: "SSG 08", rarity: "uncommon", image: "/images/ssg-08.png" },
    { id: 14, name: "Famas", rarity: "uncommon", image: "/images/famas.png" },
    {
      id: 15,
      name: "Five Seven",
      rarity: "uncommon",
      image: "/images/five-seven.png",
    },
  ];

  const rarityGradients: RarityGradients = {
    common: { startColor: "#c0c0c0", endColor: "#e6e6e6" },
    uncommon: { startColor: "#4b69ff", endColor: "#5e98d9" },
    rare: { startColor: "#8847ff", endColor: "#b24bff" },
    legendary: { startColor: "#d32ce6", endColor: "#ffbe40" },
  };

  // Computed properties
  const isGameOver = computed(
    () =>
      matchedCards.value.length === cards.value.length &&
      cards.value.length > 0,
  );
  const currentStats = computed(() => {
    return {
      moves: moveCount.value,
      time:
        startTime.value && endTime.value
          ? Math.floor((endTime.value - startTime.value) / 1000)
          : 0,
      difficulty: difficulty.value,
    };
  });

  // Generate pseudorandom number based on seed
  function seededRandom(seed: string) {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = (hash << 5) - hash + seed.charCodeAt(i);
      hash = hash & hash; // Convert to 32bit integer
    }

    const x = Math.sin(hash++) * 10000;
    return x - Math.floor(x);
  }

  // Initialize game with seed
  function initGame(selectedDifficulty: Difficulty, gameSeed?: string) {
    difficulty.value = selectedDifficulty;
    const { rows, cols } = difficultySettings[selectedDifficulty];
    const pairsNeeded = Math.floor((rows * cols) / 2);

    // Use provided seed or generate a random one
    seed.value = gameSeed || Math.random().toString(36).substring(2, 8);

    // Reset game state
    flippedCards.value = [];
    matchedCards.value = [];
    moveCount.value = 0;
    startTime.value = null;
    endTime.value = null;
    gameState.value = "idle";

    // Select random items based on seed
    const shuffleItems = [...items];
    const selectedItems: Card[] = [];

    // Fisher-Yates shuffle based on seed
    for (let i = shuffleItems.length - 1; i > 0; i--) {
      const j = Math.floor(seededRandom(seed.value + i.toString()) * (i + 1));
      [shuffleItems[i], shuffleItems[j]] = [shuffleItems[j], shuffleItems[i]];
    }

    // Take needed pairs
    const itemsForGame = shuffleItems.slice(0, pairsNeeded);

    // Create card pairs with explicit typing to ensure compatibility
    itemsForGame.forEach((item) => {
      selectedItems.push({
        id: `${item.id}-1`,
        name: item.name,
        rarity: item.rarity as Rarity, // Ensure rarity is correctly typed
        image: item.image,
      });
      selectedItems.push({
        id: `${item.id}-2`,
        name: item.name,
        rarity: item.rarity as Rarity, // Ensure rarity is correctly typed
        image: item.image,
      });
    });

    // Shuffle the pairs
    const finalCards: Card[] = [];
    while (selectedItems.length > 0) {
      const randomIndex = Math.floor(
        seededRandom(seed.value + selectedItems.length.toString()) *
          selectedItems.length,
      );
      finalCards.push(selectedItems.splice(randomIndex, 1)[0]);
    }

    cards.value = finalCards;

    // Save game state to local storage
    saveGameState();
  }

  // Start the game
  function startGame() {
    if (gameState.value !== "playing") {
      startTime.value = Date.now();
      gameState.value = "playing";
      saveGameState();
    }
  }

  // Flip a card
  function flipCard(cardIndex: number) {
    // Don't allow flipping if already flipped or matched
    if (
      flippedCards.value.includes(cardIndex) ||
      matchedCards.value.includes(cardIndex) ||
      flippedCards.value.length >= 2 ||
      gameState.value !== "playing"
    ) {
      return false;
    }

    flippedCards.value.push(cardIndex);

    // Start the game on first flip
    if (startTime.value === null) {
      startTime.value = Date.now();
      gameState.value = "playing";
    }

    // Check for match if we have 2 flipped cards
    if (flippedCards.value.length === 2) {
      moveCount.value++;

      const card1 = cards.value[flippedCards.value[0]];
      const card2 = cards.value[flippedCards.value[1]];

      // Check if we have a match (cards have the same base item id)
      if (card1.id.split("-")[0] === card2.id.split("-")[0]) {
        matchedCards.value.push(...flippedCards.value);
        flippedCards.value = [];

        // Check if game is over
        if (matchedCards.value.length === cards.value.length) {
          endGame();
        }
        return true;
      } else {
        // No match, schedule reset of flipped cards
        setTimeout(() => {
          flippedCards.value = [];
          saveGameState();
        }, 1000);
        return false;
      }
    }

    saveGameState();
    return true;
  }

  // End the game and save to history
  function endGame() {
    if (gameState.value === "playing") {
      endTime.value = Date.now();
      gameState.value = "completed";

      const gameRecord: HistoryEntry = {
        id: Date.now(),
        seed: seed.value,
        difficulty: difficulty.value,
        moves: moveCount.value,
        time: Math.floor(
          ((endTime.value as number) - (startTime.value as number)) / 1000,
        ),
        date: new Date().toISOString(),
      };

      history.value.push(gameRecord);
      saveHistory();
      clearGameState();
    }
  }

  // Save game state to local storage
  function saveGameState() {
    if (gameState.value === "playing") {
      const state = {
        cards: cards.value,
        flippedCards: flippedCards.value,
        matchedCards: matchedCards.value,
        difficulty: difficulty.value,
        seed: seed.value,
        startTime: startTime.value,
        moveCount: moveCount.value,
        gameState: gameState.value,
      };
      localStorage.setItem("memoryGameState", JSON.stringify(state));
    }
  }

  // Load game state from local storage
  function loadGameState(): boolean {
    const savedState = localStorage.getItem("memoryGameState");
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        cards.value = state.cards;
        flippedCards.value = state.flippedCards;
        matchedCards.value = state.matchedCards;
        difficulty.value = state.difficulty;
        seed.value = state.seed;
        startTime.value = state.startTime;
        moveCount.value = state.moveCount;
        gameState.value = state.gameState;
        return true;
      } catch (error) {
        console.error("Error loading game state:", error);
        return false;
      }
    }
    return false;
  }

  // Clear game state from local storage
  function clearGameState() {
    localStorage.removeItem("memoryGameState");
  }

  // Load history from local storage
  function loadHistory() {
    const savedHistory = localStorage.getItem("memoryGameHistory");
    if (savedHistory) {
      try {
        history.value = JSON.parse(savedHistory);
      } catch (error) {
        console.error("Error loading game history:", error);
      }
    }
  }

  // Save history to local storage
  function saveHistory() {
    localStorage.setItem("memoryGameHistory", JSON.stringify(history.value));
  }

  // Reset game
  function resetGame() {
    clearGameState();
    cards.value = [];
    flippedCards.value = [];
    matchedCards.value = [];
    gameState.value = "idle";
    startTime.value = null;
    endTime.value = null;
    moveCount.value = 0;
  }

  // Helper to clear all history
  const clearHistory = () => {
    history.value = [];
    saveHistory();
  };

  // Initialize
  loadHistory();

  return {
    // State
    difficulty,
    cards,
    flippedCards,
    matchedCards,
    gameState,
    seed,
    startTime,
    endTime,
    moveCount,
    history,
    difficultySettings,

    // Computed
    isGameOver,
    currentStats,
    rarityGradients,

    // Actions
    initGame,
    startGame,
    flipCard,
    endGame,
    resetGame,
    loadGameState,
    clearGameState,
    clearHistory,
  };
});
