// Core types for The Warded Ones TCG

import { KeywordData } from './keywords';

export type Element = 
  | 'Fire' | 'Water' | 'Earth' | 'Air' | 'Lightning' 
  | 'Ice' | 'Nature' | 'Arcane' | 'Light' | 'Shadow';

export type CardClass = 
  | 'Battlemage' | 'Elementalist' | 'Chronomancer' | 'Warlock' | 'Priest'
  | 'Beastmaster' | 'Trickster' | 'Jester' | 'Guardian' | 'Warrior';

export type CardType = 'Mage' | 'Fighter' | 'Beast' | 'Relic' | 'Totem' | 'Utility';

export type CardLevel = 1 | 2 | 3;

export type AbilityType = 'offensive' | 'defensive' | 'healing' | 'chaos' | 'beast' | 'totem';

export interface Ability {
  id: string;
  name: string;
  type: AbilityType;
  description: string;
  element?: Element;
  damage?: number;
  healing?: number;
  defenseBoost?: number;
  attackBoost?: number;
  speedMod?: number;
  duration?: number; // turns
  targetType: 'single' | 'all_enemies' | 'all_allies' | 'self' | 'random';
  special?: string; // special effect key
}

export interface CardDefinition {
  id: string;
  name: string;
  cardClass: CardClass;
  elements: Element[];
  type: CardType;
  level: CardLevel;
  cost: number;
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  abilities: string[]; // ability ids
  keywords?: KeywordData[];
  flavorText: string;
  evolvesFrom?: string; // card id
  evolvesTo?: string; // card id
}

export interface CardInstance {
  instanceId: string;
  definitionId: string;
  currentHp: number;
  currentAttack: number;
  currentDefense: number;
  currentSpeed: number;
  attachedRelics: string[]; // instance ids
  keywords?: KeywordData[];
  statusEffects: StatusEffect[];
  canAttack: boolean;
  hasAttacked: boolean;
  turnsInPlay: number;
  /** Ability ids activated this turn (once-per-turn tracking). */
  abilitiesUsedThisTurn: string[];
}

export interface StatusEffect {
  id: string;
  name: string;
  type: 'buff' | 'debuff' | 'dot' | 'hot' | 'special';
  turnsRemaining: number;
  value: number;
  stat?: 'attack' | 'defense' | 'speed' | 'hp';
}

export type BattlefieldSlotType = 'mage' | 'fighter' | 'beast' | 'totem';

export interface BattlefieldSlot {
  type: BattlefieldSlotType;
  card: CardInstance | null;
  index: number;
}

export interface PlayerState {
  id: string;
  name: string;
  life: number;
  resources: number;
  maxResources: number;
  hand: CardInstance[];
  deck: CardInstance[];
  battlefield: {
    mage: BattlefieldSlot;
    fighters: BattlefieldSlot[];
    beasts: BattlefieldSlot[];
    totems: BattlefieldSlot[];
  };
  graveyard: CardInstance[];
  selectedClass: CardClass;
  /** Consecutive empty draws; fatigue damage = counter after increment. */
  fatigueCounter: number;
}

export type GamePhase = 'mulligan' | 'draw' | 'resource' | 'main' | 'combat' | 'end';

export type GameMode = 'ai' | 'pvp';

export interface GameState {
  mode: GameMode;
  currentPlayer: 0 | 1;
  phase: GamePhase;
  turn: number;
  players: [PlayerState, PlayerState];
  gameOver: boolean;
  winner: 0 | 1 | null;
  mulliganComplete: [boolean, boolean];
  log: GameLogEntry[];
  /** Structured events (parallel to human log for replay/UI). */
  events: import('./events').GameEvent[];
  animationQueue: GameAnimation[];
  /** Seeded PRNG state for deterministic combat/AI/sim */
  rng: { seed: number; state: number };
}

export interface GameLogEntry {
  turn: number;
  player: number;
  phase: GamePhase;
  message: string;
  timestamp: number;
  eventType?: string;
}

export interface GameAnimation {
  type: 'draw' | 'play' | 'attack' | 'spell' | 'heal' | 'death' | 'damage' | 'buff';
  sourceId?: string;
  targetId?: string;
  element?: Element;
  value?: number;
  cardName?: string;
}

export interface DeckList {
  id: string;
  name: string;
  playerClass: CardClass;
  cards: string[]; // card definition ids
}
