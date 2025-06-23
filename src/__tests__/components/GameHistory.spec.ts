import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import GameHistory from "../../components/GameHistory/GameHistory.vue";

// Mock the store module
vi.mock("../../stores/gameStore", () => ({
  useGameStore: vi.fn(),
}));

import { useGameStore } from "../../stores/gameStore";

describe("GameHistory.vue", () => {
  let gameStoreMock: any;

  beforeEach(() => {
    gameStoreMock = {
      history: [
        {
          id: 1,
          date: "2025-06-23T10:00:00Z",
          difficulty: "easy",
          moves: 20,
          time: 90,
          seed: "abc123",
        },
        {
          id: 2,
          date: "2025-06-22T09:00:00Z",
          difficulty: "hard",
          moves: 40,
          time: 200,
          seed: "def456",
        },
      ],
      resetGame: vi.fn(),
      initGame: vi.fn(),
      startGame: vi.fn(),
    };

    // Setup the mock for each test
    (useGameStore as any).mockReturnValue(gameStoreMock);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders game history table", () => {
    const wrapper = mount(GameHistory);
    expect(wrapper.text()).toContain("Game History");
    expect(wrapper.text()).toContain("Easy"); // Changed from "easy" to "Easy"
    expect(wrapper.text()).toContain("Hard"); // Changed from "hard" to "Hard"
    expect(wrapper.text()).toContain("Moves");
    expect(wrapper.text()).toContain("Seed");
  });

  it("shows empty message if no history", () => {
    gameStoreMock.history = [];
    const wrapper = mount(GameHistory);
    expect(wrapper.text()).toContain("No games completed yet");
  });

  it("calls replayGame and dispatches event when Replay is clicked", async () => {
    const wrapper = mount(GameHistory);
    const dispatchSpy = vi.spyOn(document, "dispatchEvent");
    await wrapper.find("button.replay-button").trigger("click");
    expect(gameStoreMock.resetGame).toHaveBeenCalled();
    expect(gameStoreMock.initGame).toHaveBeenCalled();
    expect(gameStoreMock.startGame).toHaveBeenCalled();
    expect(dispatchSpy).toHaveBeenCalledWith(expect.any(CustomEvent));
    dispatchSpy.mockRestore();
  });
});
