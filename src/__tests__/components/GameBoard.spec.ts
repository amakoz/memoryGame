import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import GameBoard from "../../components/GameBoard/GameBoard.vue";
import { useGameStore } from "../../stores/gameStore";

// Mock sound service
const playSoundMock = vi.fn();
vi.mock("@/services/soundService", () => ({
  useSoundEffects: vi.fn(() => ({
    playSound: playSoundMock,
    isLoaded: { value: true },
    isMuted: { value: false },
  })),
}));

// Mock CanvasCard component
vi.mock("@/components/CanvasCard/CanvasCard.vue", () => ({
  default: {
    name: "CanvasCard",
    props: ["card", "index", "isFlipped", "isMatched", "rarityGradient"],
    template:
      '<div class="mock-canvas-card" @click="$emit(\'flip\', index)" data-testid="canvas-card"></div>',
  },
}));

describe("GameBoard.vue", () => {
  let gameStore: ReturnType<typeof useGameStore>;

  beforeEach(() => {
    // Fresh test environment
    setActivePinia(createPinia());
    gameStore = useGameStore();
    gameStore.initGame("easy", "test-seed");
    gameStore.startGame();
    vi.clearAllMocks();
  });

  it("should render all cards from the game store", () => {
    // Mount component
    const wrapper = mount(GameBoard);

    // Verify all cards are rendered
    const cardElements = wrapper.findAllComponents(".mock-canvas-card");
    expect(cardElements.length).toBe(gameStore.cards.length);
  });

  it("should use correct grid template based on difficulty", () => {
    // Test easy difficulty (4x4)
    gameStore.difficulty = "easy";
    const wrapperEasy = mount(GameBoard);
    expect(wrapperEasy.find(".game-board").attributes("style")).toContain(
      "grid-template-columns: repeat(4, 1fr)",
    );

    // Test medium difficulty (6x4)
    gameStore.difficulty = "medium";
    const wrapperMedium = mount(GameBoard);
    expect(wrapperMedium.find(".game-board").attributes("style")).toContain(
      "grid-template-columns: repeat(6, 1fr)",
    );

    // Test hard difficulty (6x6)
    gameStore.difficulty = "hard";
    const wrapperHard = mount(GameBoard);
    expect(wrapperHard.find(".game-board").attributes("style")).toContain(
      "grid-template-rows: repeat(6, 1fr)",
    );
  });

  it("should handle card flips and play sound", () => {
    // Setup
    const wrapper = mount(GameBoard);
    const flipCardSpy = vi.spyOn(gameStore, "flipCard");
    const vm = wrapper.vm as any;

    // Execute flip
    vm.flipCard(0);

    // Verify behavior
    expect(flipCardSpy).toHaveBeenCalledWith(0);
    expect(playSoundMock).toHaveBeenCalledWith("flip");
  });

  it("should play match sound when cards match", async () => {
    // Setup fake timers for this test
    vi.useFakeTimers();

    // Setup game with defined card data
    setActivePinia(createPinia());
    gameStore = useGameStore();
    gameStore.initGame("easy");
    gameStore.startGame();

    // Create two matching pairs
    gameStore.cards = [
      {
        id: "1-1",
        name: "Test Card",
        rarity: "common",
        image: "/images/test.png",
      },
      {
        id: "1-2",
        name: "Test Card",
        rarity: "common",
        image: "/images/test.png",
      },
      {
        id: "2-1",
        name: "Test Card 2",
        rarity: "common",
        image: "/images/test.png",
      },
      {
        id: "2-2",
        name: "Test Card 2",
        rarity: "common",
        image: "/images/test.png",
      },
    ];

    // Mount component
    const wrapper = mount(GameBoard);
    const vm = wrapper.vm as any;

    // Flip first pair (should match)
    vm.flipCard(0);
    playSoundMock.mockClear();
    vm.flipCard(1);

    // Verify flip sound played
    expect(playSoundMock).toHaveBeenCalledWith("flip");

    // Clear mock before checking for match sound
    playSoundMock.mockClear();

    // Instead of waiting for real time to pass, advance the timer
    vi.advanceTimersByTime(350);

    // Verify match sound played
    expect(playSoundMock).toHaveBeenCalledWith("match");

    // Restore real timers
    vi.useRealTimers();
  });

  it("should check if a card is flipped", () => {
    // Setup
    const wrapper = mount(GameBoard);
    const vm = wrapper.vm as any;

    // Test flipped card in flippedCards array
    gameStore.flippedCards = [0];
    expect(vm.isCardFlipped(0)).toBe(true);
    expect(vm.isCardFlipped(1)).toBe(false);

    // Test flipped card in matchedCards array
    gameStore.matchedCards = [1];
    expect(vm.isCardFlipped(1)).toBe(true);
  });

  it("should check if a card is matched", () => {
    // Setup
    const wrapper = mount(GameBoard);
    const vm = wrapper.vm as any;

    // Test matched card
    gameStore.matchedCards = [0];
    expect(vm.isCardMatched(0)).toBe(true);
    expect(vm.isCardMatched(1)).toBe(false);
  });
});
