/**
 * Public engine barrel — prefer importing from here in new UI code.
 */

export * from './types';
export * from './keywords';
export * from './rng';
export * from './damage';
export * from './combatMath';
export * from './stateBasedActions';
export * from './targeting';
export * from './queries';
export * from './events';
export * from './zones';
export * from './evolution';
export * from './statusEffects';
export * from './hex';
export * from './lifesteal';
export * from './simHarness';
export * from './deckUtils';
export * from './deckExport';
export * from './deckPersistence';
export * from './elements';
export * from './abilities';
export {
  createGameState,
  createCardInstance,
  createInitialPlayerState,
  playCard,
  executeAttack,
  executeDrawPhase,
  executeResourcePhase,
  executeEndPhase,
  useAbility,
  canPlayCard,
  performMulligan,
  checkGameOver,
  runStateBasedActions,
  addLog,
  MAX_HAND_SIZE,
  nextInstanceId,
  resetInstanceCounter,
  shuffleArray,
  buildDeck,
} from './gameEngine';
export { getAIActions, aiMulligan, getRandomPersonality, executeAITurn } from './ai';
