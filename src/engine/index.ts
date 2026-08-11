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
export * from './turnMachine';
export * from './actions';
export * from './matchSession';
export * from './legalMoves';
export * from './effectIr';
export * from './effectInterpreter';
export * from './stack';
export * from './matchObservability';
export * from './replay';
export * from './idempotency';
export * from './triggers';
export * from './costPayment';
export * from './continuousEffects';
export * from './matchConfig';
export * from './priority';
export * from './echoQueue';
export * from './assertInvariants';
export * from './replacementEffects';
export * from './aiPolicy';
export * from './serialization';
export * from './mulliganStrategy';
export * from './combatPlanner';
export * from './healthCheck';
export * from './schemaVersion';
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
