import { describe, it, expect } from 'vitest';
import {
  createGameState,
  createCardInstance,
  useAbility,
  executeEndPhase,
} from './gameEngine';
import { ALL_CARDS } from '../data/cards';
import { generateDefaultDeck } from './deckUtils';

describe('ability once-per-turn', () => {
  it('blocks second use of same ability until end phase clears', () => {
    const d1 = generateDefaultDeck('Battlemage');
    const d2 = generateDefaultDeck('Warrior');
    let state = createGameState('ai', 'P1', 'Battlemage', d1, 'P2', 'Warrior', d2, 55);
    state.phase = 'main';
    const mageDef = ALL_CARDS.find(c => c.type === 'Mage' && c.abilities.length > 0)!;
    const mage = createCardInstance(mageDef);
    state.players[0].battlefield.mage.card = mage;
    const abilityId = mageDef.abilities[0];

    // place enemy for offensive targets if needed
    const fighter = ALL_CARDS.find(c => c.type === 'Fighter')!;
    state.players[1].battlefield.fighters[0].card = createCardInstance(fighter);
    const enemyId = state.players[1].battlefield.fighters[0].card!.instanceId;

    state = useAbility(state, mage.instanceId, abilityId, enemyId);
    expect(state.players[0].battlefield.mage.card?.abilitiesUsedThisTurn).toContain(abilityId);

    const mid = useAbility(state, mage.instanceId, abilityId, enemyId);
    expect(mid.log.some(e => e.message.includes('already used'))).toBe(true);

    // End turn clears tracking for the player who ended
    state = executeEndPhase(state);
    // After end, current player switched; original mage still has cleared flags
    // Re-find mage on p0
    const mageAfter = state.players[0].battlefield.mage.card;
    expect(mageAfter?.abilitiesUsedThisTurn ?? []).toEqual([]);
  });
});
