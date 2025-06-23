import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { setupI18nMock } from "../test-utils";

// Set up i18n mocks before importing components that use i18n
setupI18nMock();

import GameHistory from "@/components/GameHistory/GameHistory.vue";
import type { HistoryEntry } from "@/types";

// Mock the store module
vi.mock("@/stores/gameStore", () => ({
  useGameStore: vi.fn(),
}));

import { useGameStore } from "@/stores/gameStore";

describe("GameHistory.vue", () => {
  interface MockGameStore {
    history: HistoryEntry[];
    resetGame: () => void;
    initGame: (difficulty: string, seed: string) => void;
    startGame: () => void;
  }

  let gameStoreMock: MockGameStore;

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
    (useGameStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      gameStoreMock,
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders game history table with correct data", () => {
    const wrapper = mount(GameHistory);

    // Check component title
    expect(wrapper.find("h2").text()).toBe("Game History");

    // Check table headers
    const headers = wrapper.findAll("th");
    expect(headers.length).toBe(6);
    expect(headers.map((h) => h.text())).toEqual([
      "Date",
      "Difficulty",
      "Moves",
      "Time",
      "Seed",
      "Actions",
    ]);

    // Check table data
    const rows = wrapper.findAll("tbody tr");
    expect(rows.length).toBe(2);

    // Check that table data is sorted by date (most recent first)
    const firstRowCells = rows[0].findAll("td");
    expect(firstRowCells[1].text()).toBe("Easy"); // Most recent game is the easy one
    expect(firstRowCells[2].text()).toBe("20"); // Moves

    const secondRowCells = rows[1].findAll("td");
    expect(secondRowCells[1].text()).toBe("Hard");
    expect(secondRowCells[2].text()).toBe("40"); // Moves
  });

  it("formats time correctly", () => {
    const wrapper = mount(GameHistory);
    const rows = wrapper.findAll("tbody tr");

    // First row - 90 seconds should be formatted as "1:30"
    const firstRowTimeCell = rows[0].findAll("td")[3];
    expect(firstRowTimeCell.text()).toBe("1:30");

    // Second row - 200 seconds should be formatted as "3:20"
    const secondRowTimeCell = rows[1].findAll("td")[3];
    expect(secondRowTimeCell.text()).toBe("3:20");
  });

  it("shows empty message if no history", () => {
    gameStoreMock.history = [];
    const wrapper = mount(GameHistory);
    expect(wrapper.find(".empty-history").text()).toBe(
      "No games completed yet. Play your first game!",
    );
    expect(wrapper.find("table").exists()).toBe(false);
  });

  it("calls replayGame with correct parameters when Replay is clicked", async () => {
    const wrapper = mount(GameHistory);
    const dispatchSpy = vi.spyOn(document, "dispatchEvent");

    // Click the first game's replay button
    await wrapper.find("button.replay-button").trigger("click");

    expect(gameStoreMock.resetGame).toHaveBeenCalledTimes(1);
    expect(gameStoreMock.initGame).toHaveBeenCalledWith("easy", "abc123");
    expect(gameStoreMock.startGame).toHaveBeenCalledTimes(1);
    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "game-replayed",
      }),
    );
    dispatchSpy.mockRestore();
  });

  it("capitalizes difficulty levels correctly", () => {
    const wrapper = mount(GameHistory);
    const difficulties = wrapper
      .findAll("tbody tr")
      .map((row) => row.findAll("td")[1].text());

    expect(difficulties).toEqual(["Easy", "Hard"]);
  });

  it("formats dates correctly", () => {
    const wrapper = mount(GameHistory);
    const firstRowDateCell = wrapper.findAll("tbody tr")[0].findAll("td")[0];

    // Check that the date is formatted properly
    // The exact format might vary based on the user's locale, so we'll just check
    // that the date cell isn't showing the raw ISO string
    expect(firstRowDateCell.text()).not.toBe("2025-06-23T10:00:00Z");
    expect(firstRowDateCell.text()).toContain("2025");
    expect(firstRowDateCell.text()).toContain("Jun");
  });
});
