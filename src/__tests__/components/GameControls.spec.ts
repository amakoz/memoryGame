import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import GameControls from "@/components/GameControls/GameControls.vue";

// Mock the store and service modules
vi.mock("@/stores/gameStore", () => ({
  useGameStore: vi.fn(),
}));
vi.mock("@/services/soundService", () => ({
  useSoundEffects: vi.fn(),
}));

import { useGameStore } from "@/stores/gameStore";
import { useSoundEffects } from "@/services/soundService";

describe("GameControls.vue", () => {
  let gameStoreMock: any;
  let soundServiceMock: any;

  beforeEach(() => {
    gameStoreMock = {
      gameState: "idle",
      moveCount: 0,
      seed: "abc123",
      difficulty: "easy",
      startTime: Date.now(),
      initGame: vi.fn(),
      startGame: vi.fn(),
      resetGame: vi.fn(),
      loadGameState: vi.fn().mockReturnValue(false),
    };
    soundServiceMock = {
      isMuted: { value: false },
      toggleMute: vi.fn(),
      loadMutePreference: vi.fn(),
      preloadSounds: vi.fn(),
    };

    // Setup the mocks for each test
    (useGameStore as any).mockReturnValue(gameStoreMock);
    (useSoundEffects as any).mockReturnValue(soundServiceMock);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders game settings and statistics", () => {
    const wrapper = mount(GameControls);
    expect(wrapper.text()).toContain("Game Settings");
    expect(wrapper.text()).toContain("Difficulty:");
    expect(wrapper.text()).toContain("Seed (optional):");
  });

  it("calls startNewGame when New Game button is clicked", async () => {
    const wrapper = mount(GameControls);
    await wrapper.find("button.primary-button").trigger("click");
    expect(gameStoreMock.initGame).toHaveBeenCalled();
    expect(gameStoreMock.startGame).toHaveBeenCalled();
  });

  it("calls resetGame when Restart button is clicked", async () => {
    gameStoreMock.gameState = "playing";
    const wrapper = mount(GameControls);
    await wrapper.find("button.warning-button").trigger("click");
    expect(gameStoreMock.resetGame).toHaveBeenCalled();
  });

  it("toggles sound when sound button is clicked", async () => {
    const wrapper = mount(GameControls);
    await wrapper.find(".sound-button").trigger("click");
    expect(soundServiceMock.toggleMute).toHaveBeenCalled();
  });

  it("generates a random seed when Generate is clicked", async () => {
    const wrapper = mount(GameControls);
    const input = wrapper.find("input#seed");
    await wrapper.find("button.secondary-button").trigger("click");
    expect(input.element.value).not.toBe("");
  });
});
