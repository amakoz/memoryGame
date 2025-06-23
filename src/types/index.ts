export type Difficulty = 'easy' | 'medium' | 'hard'

export type GameState = 'idle' | 'playing' | 'completed'

export type Rarity = 'common' | 'uncommon' | 'rare' | 'legendary'

export interface Card {
  id: string
  name: string
  rarity: Rarity
  image: string
}
