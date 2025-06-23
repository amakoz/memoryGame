import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useGameStore } from "@/stores/gameStore.ts";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

// Set up global mocks
Object.defineProperty(window, "localStorage", { value: localStorageMock });

describe("Game Store", () => {
  beforeEach(() => {
    // Create a fresh pinia instance for each test
    setActivePinia(createPinia());
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it("should initialize with default state", () => {
    const store = useGameStore();

    // Verify initial state values
    expect(store.difficulty).toBe("easy");
    expect(store.cards).toEqual([]);
    expect(store.flippedCards).toEqual([]);
    expect(store.matchedCards).toEqual([]);
    expect(store.gameState).toBe("idle");
    expect(store.seed).toBe("");
    expect(store.moveCount).toBe(0);
  });

  it("should initialize a new game correctly", () => {
    const store = useGameStore();
    store.initGame("medium", "test-seed");

    // Verify game is properly initialized
    expect(store.difficulty).toBe("medium");
    expect(store.seed).toBe("test-seed");
    expect(store.cards.length).toBeGreaterThan(0);
    expect(store.gameState).toBe("idle");
    expect(store.flippedCards).toEqual([]);
    expect(store.matchedCards).toEqual([]);
  });

  it("should start the game correctly", () => {
    const store = useGameStore();
    store.startGame();

    // Verify game is in playing state
    expect(store.gameState).toBe("playing");
    expect(store.startTime).not.toBeNull();
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  it("should flip a card correctly", () => {
    // Setup
    const store = useGameStore();
    store.initGame("easy");
    store.startGame();

    // Flip a card
    const result = store.flipCard(0);

    // Verify card was flipped
    expect(result).toBe(true);
    expect(store.flippedCards).toContain(0);
    expect(store.flippedCards.length).toBe(1);
  });

  it("should handle matching cards correctly", () => {
    // Setup
    const store = useGameStore();
    store.initGame("easy");
    store.startGame();

    // Create a matching pair
    const cardId = "1";
    store.cards[0] = { ...store.cards[0], id: `${cardId}-1` };
    store.cards[1] = { ...store.cards[1], id: `${cardId}-2` };

    // Flip both cards
    store.flipCard(0);
    store.flipCard(1);

    // Verify cards are matched
    expect(store.matchedCards).toContain(0);
    expect(store.matchedCards).toContain(1);
    expect(store.flippedCards.length).toBe(0);
    expect(store.matchedCards.length).toBe(2);
  });

  it("should handle non-matching cards correctly", () => {
    // Setup
    const store = useGameStore();
    store.initGame("easy");
    store.startGame();

    // Create non-matching cards
    store.cards[0] = { ...store.cards[0], id: "1-1" };
    store.cards[1] = { ...store.cards[1], id: "2-1" };

    // Flip both cards
    store.flipCard(0);
    store.flipCard(1);

    // Verify cards are not matched
    expect(store.matchedCards.length).toBe(0);
  });

  it("should end the game when all cards are matched", () => {
    // Setup
    const store = useGameStore();
    store.initGame("easy", "test-seed");

    // Create a controlled set of cards
    store.cards = [
      { id: "1-1", name: "test1", image: "/test1.png", rarity: "common" },
      { id: "1-2", name: "test1", image: "/test1.png", rarity: "common" },
      { id: "2-1", name: "test2", image: "/test2.png", rarity: "common" },
      { id: "2-2", name: "test2", image: "/test2.png", rarity: "common" },
    ];

    // Start the game
    store.startGame();
    expect(store.gameState).toBe("playing");

    // Match the first pair
    store.flipCard(0);
    store.flipCard(1);

    // Verify first pair is matched
    expect(store.matchedCards.length).toBe(2);
    expect(store.gameState).toBe("playing");

    // Match the second pair to complete the game
    store.flipCard(2);
    store.flipCard(3);

    // Verify game is completed
    expect(store.matchedCards.length).toBe(4);
    expect(store.gameState).toBe("completed");
  });

  it("should save and load game state correctly", () => {
    // Setup a game with some moves
    const store = useGameStore();
    store.initGame("medium", "test-seed");
    store.startGame();
    store.flipCard(0);

    // Load state into a new store instance
    const newStore = useGameStore();
    const loaded = newStore.loadGameState();

    // Verify state was loaded correctly
    expect(loaded).toBe(true);
    expect(newStore.difficulty).toBe("medium");
    expect(newStore.seed).toBe("test-seed");
    expect(newStore.flippedCards).toEqual([0]);
  });
});
