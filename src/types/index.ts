export type Difficulty = "easy" | "medium" | "hard";

export type GameState = "idle" | "playing" | "completed";

export type Rarity = "common" | "uncommon" | "rare" | "legendary";

export interface Card {
  id: string;
  name: string;
  rarity: Rarity;
  image: string;
}

export interface GameStats {
  moves: number;
  time: number;
  difficulty: Difficulty;
}

export interface HistoryEntry extends GameStats {
  id: number;
  seed: string;
  date: string;
}

export interface AudioFiles {
  flip: HTMLAudioElement;
  match: HTMLAudioElement;
  win: HTMLAudioElement;
}
