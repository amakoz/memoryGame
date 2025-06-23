import { vi } from "vitest";

/**
 * Mock translations for testing components that use i18n
 */
export const mockTranslations: Record<string, string> = {
  // Game Settings
  gameSettings: "Game Settings",

  // Difficulty
  "difficulty.label": "Difficulty",
  "difficulty.easy": "Easy",
  "difficulty.medium": "Medium",
  "difficulty.hard": "Hard",

  // Seed
  "seed.label": "Seed (optional)",
  "seed.placeholder": "Enter seed",
  "seed.generate": "Generate",

  // Game controls
  newGame: "New Game",
  restart: "Restart",
  sound: "Sound",
  on: "On",
  off: "Off",

  // Statistics
  "stats.title": "Game Statistics",
  "stats.moves": "Moves",
  "stats.time": "Time",
  "stats.seed": "Seed",

  // History
  "history.title": "Game History",
  "history.date": "Date",
  "history.difficulty": "Difficulty",
  "history.duration": "Time",
  "history.replay": "Actions",
  "history.noGames": "No games completed yet. Play your first game!",
  "history.clear": "Clear History",
};

/**
 * Setup mock for i18n in tests
 */
export function setupI18nMock() {
  vi.mock("vue-i18n", () => ({
    useI18n: () => ({
      t: (key: string) => mockTranslations[key] || key,
      locale: { value: "en" },
    }),
  }));
}
