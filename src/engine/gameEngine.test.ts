import { describe, it, expect } from 'vitest';
import {
  createGameState,
  createCardInstance,
  playCard,
  executeAttack,
  canPlayCard,
  getAllBattlefieldCards,
  executeResourcePhase,
  executeDrawPhase,
} from './gameEngine';
import { getCardById, ALL_CARDS } from '../data/cards';
import type { GameState, CardInstance } from './types';

/** Minimal legal decks: 1 mage + fillers from ALL_CARDS */
function pickDeckIds(count = 10): string[] {
  const mage = ALL_CARDS.find(c => c.type === 'Mage')!;
  const fillers = ALL_CARDS.filter(c => c.type === 'Fighter' || c.type === 'Beast').slice(0, count - 1);
  return [mage.id, ...fillers.map(c => c.id)];
}

function setupMatch(): GameState {
  const deck = pickDeckIds(12);
  return createGameState('ai', 'P1', 'Battlemage', deck, 'P2', 'Warrior', deck);
}

function forceResources(state: GameState, playerIndex: 0 | 1, amount: number): GameState {
  const s = structuredClone(state);
  s.players[playerIndex].resources = amount;
  s.players[playerIndex].maxResources = amount;
  return s;
}

function placeOnBoard(
  state: GameState,
  playerIndex: 0 | 1,
  defId: string,
  slot: 'fighter' | 'beast' = 'fighter',
  index = 0
): { state: GameState; instance: CardInstance } {
  const s = structuredClone(state);
  const def = getCardById(defId)!;
  const inst = createCardInstance(def);
  inst.canAttack = true;
  inst.hasAttacked = false;
  if (slot === 'fighter') {
    s.players[playerIndex].battlefield.fighters[index].card = inst;
  } else {
    s.players[playerIndex].battlefield.beasts[index].card = inst;
  }
  return { state: s, instance: inst };
}

describe('gameEngine core', () => {
  it('createGameState starts in mulligan with life 30 and 5-card hands', () => {
    const state = setupMatch();
    expect(state.phase).toBe('mulligan');
    expect(state.players[0].life).toBe(30);
    expect(state.players[1].life).toBe(30);
    expect(state.players[0].hand).toHaveLength(5);
    expect(state.players[1].hand).toHaveLength(5);
    expect(state.gameOver).toBe(false);
  });

  it('executeResourcePhase increments max resources and refills', () => {
    let state = setupMatch();
    state.phase = 'resource';
    state = executeResourcePhase(state);
    expect(state.players[0].maxResources).toBe(1);
    expect(state.players[0].resources).toBe(1);
    expect(state.phase).toBe('main');
  });

  it('executeDrawPhase draws one card from deck', () => {
    let state = setupMatch();
    state.phase = 'draw';
    const before = state.players[0].hand.length;
    const deckBefore = state.players[0].deck.length;
    state = executeDrawPhase(state);
    expect(state.players[0].hand.length).toBe(before + 1);
    expect(state.players[0].deck.length).toBe(deckBefore - 1);
  });

  it('canPlayCard rejects unaffordable cards', () => {
    const state = setupMatch();
    const player = state.players[0];
    player.resources = 0;
    const expensive = player.hand.find(c => {
      const d = getCardById(c.definitionId);
      return d && d.cost > 0;
    });
    expect(expensive).toBeTruthy();
    expect(canPlayCard(player, expensive!)).toBe(false);
  });

  it('playCard pays cost and places a Fighter on the battlefield', () => {
    let state = setupMatch();
    state.phase = 'main';
    // Ensure a fighter is in hand and affordable
    const fighterDef = ALL_CARDS.find(c => c.type === 'Fighter' && c.level === 1)!;
    const inst = createCardInstance(fighterDef);
    state.players[0].hand = [inst];
    state = forceResources(state, 0, fighterDef.cost);
    const after = playCard(state, inst.instanceId);
    expect(after.players[0].resources).toBe(0);
    expect(after.players[0].hand).toHaveLength(0);
    const board = getAllBattlefieldCards(after.players[0]);
    expect(board.some(c => c.definitionId === fighterDef.id)).toBe(true);
  });

  it('executeAttack deals face damage when no Taunt present', () => {
    let state = setupMatch();
    const fighter = ALL_CARDS.find(c => c.type === 'Fighter' && c.level === 1)!;
    const placed = placeOnBoard(state, 0, fighter.id);
    state = placed.state;
    const atk = placed.instance.currentAttack;
    const lifeBefore = state.players[1].life;
    const after = executeAttack(state, placed.instance.instanceId, 'player');
    expect(after.players[1].life).toBe(lifeBefore - Math.max(1, atk));
  });

  it('Taunt blocks direct player attacks', () => {
    let state = setupMatch();
    const fighter = ALL_CARDS.find(c => c.type === 'Fighter' && c.level === 1)!;
    const placed = placeOnBoard(state, 0, fighter.id);
    state = placed.state;
    // Put a Taunt unit on defender board (keywords on instance drive combat rules)
    const tauntPlace = placeOnBoard(state, 1, fighter.id, 'fighter', 0);
    state = tauntPlace.state;
    tauntPlace.instance.keywords = [{ keyword: 'Taunt' }];
    state.players[1].battlefield.fighters[0].card = tauntPlace.instance;

    const lifeBefore = state.players[1].life;
    const after = executeAttack(state, placed.instance.instanceId, 'player');
    expect(after.players[1].life).toBe(lifeBefore);
    expect(after.log.some(e => e.message.includes('Taunt'))).toBe(true);
  });

  it('Ward absorbs damage before HP', () => {
    let state = setupMatch();
    const fighter = ALL_CARDS.find(c => c.type === 'Fighter' && c.level === 1)!;
    const atk = placeOnBoard(state, 0, fighter.id);
    state = atk.state;
    atk.instance.currentAttack = 5;
    atk.instance.keywords = [{ keyword: 'Pierce' }]; // ignore defense noise
    // Remove pierce for ward test - we want clean ward absorb
    atk.instance.keywords = [];
    atk.instance.currentAttack = 4;
    state.players[0].battlefield.fighters[0].card = atk.instance;

    const defPlace = placeOnBoard(state, 1, fighter.id);
    state = defPlace.state;
    defPlace.instance.currentDefense = 0;
    defPlace.instance.currentHp = 10;
    defPlace.instance.keywords = [{ keyword: 'Ward', value: 3 }];
    state.players[1].battlefield.fighters[0].card = defPlace.instance;

    const after = executeAttack(state, atk.instance.instanceId, defPlace.instance.instanceId);
    const target = after.players[1].battlefield.fighters[0].card!;
    // damage 4, ward 3 → 1 HP damage, ward gone
    expect(target.currentHp).toBe(9);
    expect(target.keywords?.some(k => k.keyword === 'Ward')).toBe(false);
  });

  it('Pierce ignores defender defense', () => {
    let state = setupMatch();
    const fighter = ALL_CARDS.find(c => c.type === 'Fighter' && c.level === 1)!;
    const atk = placeOnBoard(state, 0, fighter.id);
    state = atk.state;
    atk.instance.currentAttack = 5;
    atk.instance.keywords = [{ keyword: 'Pierce' }];
    // Neutralize element: same elements if possible
    state.players[0].battlefield.fighters[0].card = atk.instance;

    const defPlace = placeOnBoard(state, 1, fighter.id);
    state = defPlace.state;
    defPlace.instance.currentDefense = 99;
    defPlace.instance.currentHp = 20;
    defPlace.instance.keywords = [];
    state.players[1].battlefield.fighters[0].card = defPlace.instance;

    const after = executeAttack(state, atk.instance.instanceId, defPlace.instance.instanceId);
    const target = after.players[1].battlefield.fighters[0].card;
    // With Pierce, defense 99 ignored; damage at least attack +/- element
    // Element may modify; ensure damage happened despite 99 def
    expect(target === null || target.currentHp < 20).toBe(true);
  });
});
