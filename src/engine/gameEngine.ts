import {
  GameState, PlayerState, CardInstance, CardDefinition,
  BattlefieldSlot, GameAnimation, GameMode, CardClass,
} from './types';
import { KeywordData, hasKeyword, getKeywordValue, removeKeyword } from './keywords';
import { getElementModifier } from './elements';
import { ABILITIES, getAbility } from './abilities';
import { getCardById } from '../data/cards';
import { createRng, nextInt, pickRandom, shuffleWithRng } from './rng';
import { applyDamageToUnit, applyDamageToPlayer } from './damage';
import { applyStateBasedActions } from './stateBasedActions';
import { isLegalAttackTarget } from './targeting';
import { createGameEvent, type GameEventType } from './events';

let instanceCounter = 0;
function nextInstanceId(): string {
  return `inst_${++instanceCounter}_${Date.now()}`;
}

export function createCardInstance(def: CardDefinition): CardInstance {
  const keywords = def.keywords ? structuredClone(def.keywords) : undefined;
  const hasHaste = hasKeyword(keywords, 'Haste');
  return {
    instanceId: nextInstanceId(),
    definitionId: def.id,
    currentHp: def.hp,
    currentAttack: def.attack,
    currentDefense: def.defense,
    currentSpeed: def.speed,
    attachedRelics: [],
    keywords,
    statusEffects: [],
    canAttack: hasHaste, // Haste skips summoning sickness
    hasAttacked: false,
    turnsInPlay: 0,
  };
}

export function buildDeck(cardIds: string[], rng = createRng()): CardInstance[] {
  const deck: CardInstance[] = [];
  for (const id of cardIds) {
    const def = getCardById(id);
    if (def) {
      deck.push(createCardInstance(def));
    }
  }
  return shuffleWithRng(rng, deck);
}

/** Unseeded shuffle for non-match UI paths; prefer shuffleDeck(state, arr) in-match. */
export function shuffleArray<T>(arr: T[]): T[] {
  const rng = createRng();
  return shuffleWithRng(rng, arr);
}

export function shuffleDeck<T>(state: GameState, arr: T[]): T[] {
  return shuffleWithRng(state.rng, arr);
}

export function createInitialPlayerState(
  id: string,
  name: string,
  selectedClass: CardClass,
  deckCardIds: string[],
  rng = createRng()
): PlayerState {
  const deck = buildDeck(deckCardIds, rng);
  const hand = deck.splice(0, 5); // draw 5

  return {
    id,
    name,
    life: 30,
    resources: 0,
    maxResources: 0,
    hand,
    deck,
    battlefield: {
      mage: { type: 'mage', card: null, index: 0 },
      fighters: Array.from({ length: 4 }, (_, i) => ({ type: 'fighter' as const, card: null, index: i })),
      beasts: Array.from({ length: 3 }, (_, i) => ({ type: 'beast' as const, card: null, index: i })),
      totems: Array.from({ length: 2 }, (_, i) => ({ type: 'totem' as const, card: null, index: i })),
    },
    graveyard: [],
    selectedClass,
    fatigueCounter: 0,
  };
}

export function createGameState(
  mode: GameMode,
  p1Name: string, p1Class: CardClass, p1Deck: string[],
  p2Name: string, p2Class: CardClass, p2Deck: string[],
  seed?: number
): GameState {
  const rng = createRng(seed ?? Date.now() >>> 0);
  // Deterministic deck builds when seed provided
  const p1 = createInitialPlayerState('p1', p1Name, p1Class, p1Deck, rng);
  const p2 = createInitialPlayerState('p2', p2Name, p2Class, p2Deck, rng);
  return {
    mode,
    currentPlayer: 0,
    phase: 'mulligan',
    turn: 1,
    players: [p1, p2],
    gameOver: false,
    winner: null,
    mulliganComplete: [false, false],
    log: [],
    events: [],
    animationQueue: [],
    rng,
  };
}

export function addLog(state: GameState, message: string, eventType: GameEventType = 'message', payload?: Record<string, string | number | boolean | null>): void {
  const ts = Date.now();
  state.log.push({
    turn: state.turn,
    player: state.currentPlayer,
    phase: state.phase,
    message,
    timestamp: ts,
    eventType,
  });
  if (!state.events) state.events = [];
  state.events.push(
    createGameEvent({
      type: eventType,
      turn: state.turn,
      player: state.currentPlayer,
      phase: state.phase,
      message,
      timestamp: ts,
      payload,
    })
  );
}

export function addAnimation(state: GameState, anim: GameAnimation): void {
  state.animationQueue.push(anim);
}

// ===== PHASE HANDLERS =====

/** Maximum cards a player may hold; excess draws are milled to graveyard. */
export const MAX_HAND_SIZE = 10;

export function executeDrawPhase(state: GameState): GameState {
  const newState = structuredClone(state);
  const player = newState.players[newState.currentPlayer];
  
  if (player.deck.length > 0) {
    const drawn = player.deck.shift()!;
    const def = getCardById(drawn.definitionId);
    if (player.hand.length >= MAX_HAND_SIZE) {
      player.graveyard.push(drawn);
      addLog(newState, `${player.name} draws ${def?.name || 'a card'} but hand is full — card is discarded.`, 'draw');
    } else {
      player.hand.push(drawn);
      addLog(newState, `${player.name} draws ${def?.name || 'a card'}.`, 'draw');
      addAnimation(newState, { type: 'draw', cardName: def?.name });
    }
  } else {
    // Fatigue: scaling damage for each empty draw (1, 2, 3, ...)
    player.fatigueCounter = (player.fatigueCounter ?? 0) + 1;
    const fatigue = player.fatigueCounter;
    player.life -= fatigue;
    addLog(newState, `${player.name} has no cards to draw! Takes ${fatigue} fatigue damage.`, 'damage');
  }
  
  newState.phase = 'resource';
  return newState;
}

export function executeResourcePhase(state: GameState): GameState {
  const newState = structuredClone(state);
  const player = newState.players[newState.currentPlayer];
  
  if (player.maxResources < 10) {
    player.maxResources += 1;
  }
  player.resources = player.maxResources;
  
  addLog(newState, `${player.name} gains resources: ${player.resources}/${player.maxResources}`);
  newState.phase = 'main';
  return newState;
}

export function canPlayCard(player: PlayerState, card: CardInstance): boolean {
  const def = getCardById(card.definitionId);
  if (!def) return false;
  
  // Check cost
  if (def.cost > player.resources) return false;
  
  // Check slot availability (Fighters/Beasts can replace weakest if full)
  if (def.type === 'Mage' && player.battlefield.mage.card !== null) return false;
  // Fighters and Beasts can always be played if you can afford them (sacrifice mechanic)
  if (def.type === 'Totem' && !player.battlefield.totems.some(s => s.card === null)) return false;
  
  // Check evolution requirements
  if (def.level >= 2 && def.evolvesFrom) {
    const hasPrereq = getAllBattlefieldCards(player).some(c => c.definitionId === def.evolvesFrom);
    if (!hasPrereq) return false;
  }
  
  return true;
}

export function playCard(state: GameState, cardInstanceId: string, targetSlotIndex?: number, attachTargetId?: string): GameState {
  const newState = structuredClone(state);
  const player = newState.players[newState.currentPlayer];
  
  const cardIndex = player.hand.findIndex(c => c.instanceId === cardInstanceId);
  if (cardIndex === -1) return state;
  
  const card = player.hand[cardIndex];
  const def = getCardById(card.definitionId);
  if (!def) return state;
  
  if (!canPlayCard(player, card)) return state;
  
  // Pay cost
  player.resources -= def.cost;
  
  // Remove from hand
  player.hand.splice(cardIndex, 1);
  
  // Handle different card types
  if (def.type === 'Mage') {
    player.battlefield.mage.card = card;
  } else if (def.type === 'Fighter') {
    // Handle evolution
    if (def.level >= 2 && def.evolvesFrom) {
      const evolveResult = handleEvolution(player, card, def);
      if (!evolveResult) {
        placeOrReplace(newState, player, player.battlefield.fighters, card, def);
      }
    } else {
      placeOrReplace(newState, player, player.battlefield.fighters, card, def);
    }
    // Haste: allow immediate attack
    if (hasKeyword(card.keywords, 'Haste')) {
      card.canAttack = true;
    }
  } else if (def.type === 'Beast') {
    if (def.level >= 2 && def.evolvesFrom) {
      const evolveResult = handleEvolution(player, card, def);
      if (!evolveResult) {
        placeOrReplace(newState, player, player.battlefield.beasts, card, def);
      }
    } else {
      placeOrReplace(newState, player, player.battlefield.beasts, card, def);
    }
    // Haste: allow immediate attack
    if (hasKeyword(card.keywords, 'Haste')) {
      card.canAttack = true;
    }
  } else if (def.type === 'Totem') {
    placeInEmptySlot(player.battlefield.totems, card);
    // Apply totem effects immediately
    applyTotemEffects(newState, player, card);
  } else if (def.type === 'Relic') {
    // Attach to a unit
    if (attachTargetId) {
      const target = findCardOnBattlefield(player, attachTargetId);
      if (target) {
        target.attachedRelics.push(card.instanceId);
        target.currentAttack += def.attack;
        target.currentDefense += def.defense;
        target.currentSpeed += def.speed;
        // Copy relic keywords to target
        if (def.keywords) {
          if (!target.keywords) target.keywords = [];
          for (const kw of def.keywords) {
            target.keywords.push(structuredClone(kw));
          }
        }
        // Trigger relic abilities on attachment
        for (const abilityId of def.abilities) {
          const ability = getAbility(abilityId);
          if (!ability) continue;
          const opponent = newState.players[newState.currentPlayer === 0 ? 1 : 0];
          if (ability.type === 'offensive' && ability.damage) {
            const enemies = getAllBattlefieldCards(opponent);
            if (enemies.length > 0) {
              const enemy = pickRandom(newState.rng, enemies)!;
              enemy.currentHp -= ability.damage;
              addLog(newState, `${def.name} triggers ${ability.name} on ${getCardById(enemy.definitionId)?.name}!`);
              if (enemy.currentHp <= 0) {
                removeCardFromBattlefield(opponent, enemy.instanceId);
                opponent.graveyard.push(enemy);
              }
            }
          } else if (ability.type === 'defensive') {
            if (ability.defenseBoost) {
              if (ability.targetType === 'self') {
                target.currentDefense += ability.defenseBoost;
              } else if (ability.targetType === 'all_allies') {
                getAllBattlefieldCards(player).forEach(c => {
                  c.currentDefense += ability.defenseBoost!;
                });
              }
            }
            addLog(newState, `${def.name} triggers ${ability.name}!`);
          } else if (ability.type === 'healing' && ability.healing) {
            const targetDef = getCardById(target.definitionId);
            if (targetDef) {
              target.currentHp = Math.min(target.currentHp + ability.healing, targetDef.hp);
            }
            addLog(newState, `${def.name} triggers ${ability.name} on ${getCardById(target.definitionId)?.name}!`);
          } else if (ability.type === 'beast') {
            if (ability.special === 'beast_only' && ability.attackBoost) {
              getAllBattlefieldCards(player).forEach(c => {
                const cDef = getCardById(c.definitionId);
                if (cDef?.type === 'Beast') {
                  c.currentAttack += ability.attackBoost!;
                }
              });
            }
            addLog(newState, `${def.name} triggers ${ability.name}!`);
          }
        }
      }
    }
  } else if (def.type === 'Utility') {
    // Execute utility effect immediately
    executeUtilityCard(newState, card, def);
    player.graveyard.push(card);
    addLog(newState, `${player.name} plays ${def.name}.`);
    addAnimation(newState, { type: 'spell', element: def.elements[0], cardName: def.name });
    return newState;
  }
  
  addLog(newState, `${player.name} plays ${def.name}.`);
  addAnimation(newState, { type: 'play', element: def.elements[0], cardName: def.name });
  
  return newState;
}

function handleEvolution(player: PlayerState, card: CardInstance, def: CardDefinition): boolean {
  // Find the card to evolve from
  const allSlots = [
    ...player.battlefield.fighters,
    ...player.battlefield.beasts,
  ];
  
  for (const slot of allSlots) {
    if (slot.card && slot.card.definitionId === def.evolvesFrom) {
      // Transfer relics
      card.attachedRelics = [...slot.card.attachedRelics];
      player.graveyard.push(slot.card);
      slot.card = card;
      card.canAttack = true; // evolved units can attack
      return true;
    }
  }
  return false;
}

function placeInEmptySlot(slots: BattlefieldSlot[], card: CardInstance): void {
  const emptySlot = slots.find(s => s.card === null);
  if (emptySlot) {
    emptySlot.card = card;
  }
}

function placeOrReplace(state: GameState, player: PlayerState, slots: BattlefieldSlot[], card: CardInstance, def: CardDefinition): void {
  const emptySlot = slots.find(s => s.card === null);
  if (emptySlot) {
    emptySlot.card = card;
  } else {
    // Sacrifice weakest unit (lowest currentHp)
    const occupiedSlots = slots.filter(s => s.card !== null);
    if (occupiedSlots.length === 0) return;
    const weakest = occupiedSlots.reduce((min, s) =>
      s.card!.currentHp < min.card!.currentHp ? s : min
    );
    const oldCard = weakest.card!;
    const oldDef = getCardById(oldCard.definitionId);
    player.graveyard.push(oldCard);
    weakest.card = card;
    addLog(state, `${oldDef?.name || 'A unit'} is sacrificed for ${def.name}.`);
    addAnimation(state, { type: 'death', targetId: oldCard.instanceId, cardName: oldDef?.name });
  }
}

function applyTotemEffects(state: GameState, player: PlayerState, totemCard: CardInstance): void {
  const def = getCardById(totemCard.definitionId);
  if (!def) return;
  
  for (const abilityId of def.abilities) {
    const ability = getAbility(abilityId);
    if (!ability) continue;
    
    if (ability.special === 'element_buff_lightning') {
      getAllBattlefieldCards(player).forEach(c => {
        const cDef = getCardById(c.definitionId);
        if (cDef?.elements.includes('Lightning')) {
          c.currentAttack += ability.attackBoost || 0;
        }
      });
    } else if (ability.special === 'element_buff_nature') {
      getAllBattlefieldCards(player).forEach(c => {
        const cDef = getCardById(c.definitionId);
        if (cDef?.elements.includes('Nature')) {
          c.currentHp += ability.healing || 0;
        }
      });
    }
  }
}

function executeUtilityCard(state: GameState, card: CardInstance, def: CardDefinition): void {
  const player = state.players[state.currentPlayer];
  const opponent = state.players[state.currentPlayer === 0 ? 1 : 0];
  
  switch (def.id) {
    case 'u_draw_power':
      // Draw 2 cards
      for (let i = 0; i < 2; i++) {
        if (player.deck.length > 0) {
          player.hand.push(player.deck.shift()!);
        }
      }
      addLog(state, `${player.name} draws 2 cards from Arcane Insight.`);
      break;
    case 'u_resource_surge':
      // Gain 2 temporary resources
      player.resources += 2;
      addLog(state, `${player.name} gains 2 resources from Mana Surge.`);
      break;
    case 'u_mass_heal':
      // Heal all allies for 10
      getAllBattlefieldCards(player).forEach(c => {
        const cDef = getCardById(c.definitionId);
        if (cDef) {
          c.currentHp = Math.min(c.currentHp + 10, cDef.hp);
        }
      });
      break;
    case 'u_field_clear':
      // Deal 5 damage to all enemies
      getAllBattlefieldCards(opponent).forEach(c => {
        c.currentHp -= 5;
      });
      break;
    case 'u_steal':
      // Steal a random card from opponent hand
      if (opponent.hand.length > 0) {
        const idx = nextInt(state.rng, opponent.hand.length);
        player.hand.push(opponent.hand.splice(idx, 1)[0]);
      }
      break;
    case 'u_time_warp':
      // Draw a card and gain 1 resource
      if (player.deck.length > 0) {
        player.hand.push(player.deck.shift()!);
      }
      player.resources += 1;
      break;
    case 'u_blood_pact':
      // Lose 3 life, draw 2 cards
      player.life -= 3;
      for (let i = 0; i < 2; i++) {
        if (player.deck.length > 0) {
          player.hand.push(player.deck.shift()!);
        }
      }
      break;
    case 'u_fortify':
      // All allies +2 defense
      getAllBattlefieldCards(player).forEach(c => {
        c.currentDefense += 2;
      });
      break;
    case 'u_beast_call':
      // Summon a random L1 beast
      summonCub(state, player);
      break;
    case 'u_chaos_bolt':
      // Random damage 3-8 to random enemy
      const enemies = getAllBattlefieldCards(opponent);
      if (enemies.length > 0) {
        const target = pickRandom(state.rng, enemies)!;
        const dmg = 3 + nextInt(state.rng, 6);
        target.currentHp -= dmg;
      }
      break;
  }
}

export { getAllBattlefieldCards, findCardOnBattlefield } from './queries';
import { getAllBattlefieldCards, findCardOnBattlefield } from './queries';

// ===== COMBAT =====

export function executeAttack(
  state: GameState,
  attackerId: string,
  targetId: string | 'player'
): GameState {
  const newState = structuredClone(state);
  const attackerPlayer = newState.players[newState.currentPlayer];
  const defenderPlayer = newState.players[newState.currentPlayer === 0 ? 1 : 0];
  
  const attacker = findCardOnBattlefield(attackerPlayer, attackerId);
  if (!attacker || !attacker.canAttack || attacker.hasAttacked) return state;
  
  const attackerDef = getCardById(attacker.definitionId);
  if (!attackerDef) return state;
  
  if (!isLegalAttackTarget(newState, targetId)) {
    addLog(newState, `Illegal attack target (Taunt or invalid).`);
    return newState;
  }

  if (targetId === 'player') {
    // Direct attack on opponent
    
    const face = applyDamageToPlayer(defenderPlayer.life, attacker.currentAttack);
    defenderPlayer.life = face.life;
    const damage = face.damage;
    attacker.hasAttacked = true;
    
    // Lifesteal: heal controller
    if (hasKeyword(attacker.keywords, 'Lifesteal')) {
      attackerPlayer.life += damage;
      addLog(newState, `${attackerDef.name} steals ${damage} life!`);
    }
    
    addLog(newState, `${attackerDef.name} attacks ${defenderPlayer.name} for ${damage} damage!`);
    addAnimation(newState, { type: 'attack', sourceId: attackerId, value: damage });
    
    if (defenderPlayer.life <= 0) {
      newState.gameOver = true;
      newState.winner = newState.currentPlayer;
      addLog(newState, `${attackerPlayer.name} wins!`);
    }
  } else {
    const target = findCardOnBattlefield(defenderPlayer, targetId);
    if (!target) return state;
    
    const targetDef = getCardById(target.definitionId);
    if (!targetDef) return state;
    
    // Calculate damage with element modifiers
    const elementMod = getElementModifier(attackerDef.elements, targetDef.elements);
    
    // Pierce: ignore target defense entirely; also pierces wards
    const pierces = hasKeyword(attacker.keywords, 'Pierce');
    const targetDefense = pierces ? 0 : target.currentDefense;
    const rawDamage = attacker.currentAttack - targetDefense + elementMod;
    
    const dmgResult = applyDamageToUnit(target, {
      amount: rawDamage,
      pierceWards: pierces,
      minimumOne: true,
    });
    const damage = dmgResult.hpDamage;
    attacker.hasAttacked = true;

    for (const part of dmgResult.logParts) {
      addLog(newState, `${targetDef.name}: ${part}`);
    }
    
    // Lifesteal: heal controller for actual damage dealt to HP
    if (hasKeyword(attacker.keywords, 'Lifesteal') && damage > 0) {
      attackerPlayer.life += damage;
      addLog(newState, `${attackerDef.name} steals ${damage} life!`);
    }
    
    addLog(newState, `${attackerDef.name} attacks ${targetDef.name} for ${damage} damage${elementMod !== 0 ? ` (element: ${elementMod > 0 ? '+' : ''}${elementMod})` : ''}.`);
    addAnimation(newState, {
      type: 'attack',
      sourceId: attackerId,
      targetId,
      element: attackerDef.elements[0],
      value: damage,
    });
    
    // Check if target died
    if (dmgResult.killed) {
      removeCardFromBattlefield(defenderPlayer, targetId);
      defenderPlayer.graveyard.push(target);
      addLog(newState, `${targetDef.name} is destroyed!`);
      addAnimation(newState, { type: 'death', targetId, cardName: targetDef.name });
    }
    
    // Counter-attack: if target survived and can attack
    if (target.currentHp > 0 && target.currentAttack > 0) {
      const counterMod = getElementModifier(targetDef.elements, attackerDef.elements);
      const counterPierces = hasKeyword(target.keywords, 'Pierce');
      const attackerDefense = counterPierces ? 0 : attacker.currentDefense;
      const counterRaw = target.currentAttack - attackerDefense + counterMod;
      
      const counter = applyDamageToUnit(attacker, {
        amount: counterRaw,
        pierceWards: counterPierces,
        minimumOne: true,
      });
      
      addLog(newState, `${targetDef.name} counter-attacks for ${counter.hpDamage} damage.`);
      
      if (counter.killed) {
        removeCardFromBattlefield(attackerPlayer, attackerId);
        attackerPlayer.graveyard.push(attacker);
        addLog(newState, `${attackerDef.name} is destroyed!`);
        addAnimation(newState, { type: 'death', targetId: attackerId, cardName: attackerDef.name });
      }
    }
  }
  
  return newState;
}

function removeCardFromBattlefield(player: PlayerState, instanceId: string): void {
  if (player.battlefield.mage.card?.instanceId === instanceId) {
    player.battlefield.mage.card = null;
    return;
  }
  for (const slot of player.battlefield.fighters) {
    if (slot.card?.instanceId === instanceId) { slot.card = null; return; }
  }
  for (const slot of player.battlefield.beasts) {
    if (slot.card?.instanceId === instanceId) { slot.card = null; return; }
  }
  for (const slot of player.battlefield.totems) {
    if (slot.card?.instanceId === instanceId) { slot.card = null; return; }
  }
}

export function useAbility(
  state: GameState,
  casterId: string,
  abilityId: string,
  targetId?: string
): GameState {
  const newState = structuredClone(state);
  const player = newState.players[newState.currentPlayer];
  const opponent = newState.players[newState.currentPlayer === 0 ? 1 : 0];
  
  const caster = findCardOnBattlefield(player, casterId);
  if (!caster) return state;
  
  const ability = getAbility(abilityId);
  if (!ability) return state;
  
  const casterDef = getCardById(caster.definitionId);
  
  switch (ability.type) {
    case 'offensive':
      if (targetId) {
        const target = findCardOnBattlefield(opponent, targetId);
        if (target) {
          const targetDef = getCardById(target.definitionId);
          let amount = ability.damage || 0;
          if (ability.element && targetDef) {
            amount += getElementModifier([ability.element], targetDef.elements);
          }
          const result = applyDamageToUnit(target, { amount, minimumOne: true });
          const damage = result.hpDamage;
          
          if (ability.speedMod) {
            target.currentSpeed = Math.max(0, target.currentSpeed + ability.speedMod);
          }
          if (ability.special === 'curse') {
            target.statusEffects.push({
              id: `curse_${Date.now()}`,
              name: 'Curse',
              type: 'debuff',
              turnsRemaining: 3,
              value: -1,
              stat: 'attack',
            });
            target.currentAttack = Math.max(0, target.currentAttack - 1);
          }
          
          addLog(newState, `${casterDef?.name} uses ${ability.name} on ${targetDef?.name} for ${damage} damage.`);
          addAnimation(newState, { type: 'spell', sourceId: casterId, targetId, element: ability.element, value: damage });
          
          if (result.killed) {
            removeCardFromBattlefield(opponent, targetId);
            opponent.graveyard.push(target);
            addAnimation(newState, { type: 'death', targetId });
          }
        }
      } else if (ability.special === 'cleave_two') {
        // Attack two random enemies
        const enemies = getAllBattlefieldCards(opponent);
        const targets = enemies.slice(0, 2);
        for (const t of targets) {
          const dmg = Math.max(1, caster.currentAttack);
          t.currentHp -= dmg;
          addAnimation(newState, { type: 'attack', sourceId: casterId, targetId: t.instanceId, value: dmg });
          if (t.currentHp <= 0) {
            removeCardFromBattlefield(opponent, t.instanceId);
            opponent.graveyard.push(t);
          }
        }
      }
      break;

    case 'defensive':
      if (ability.defenseBoost) {
        if (ability.targetType === 'self') {
          caster.currentDefense += ability.defenseBoost;
          if (ability.duration === 1) {
            caster.statusEffects.push({
              id: `barrier_${Date.now()}`,
              name: ability.name,
              type: 'buff',
              turnsRemaining: 1,
              value: ability.defenseBoost,
              stat: 'defense',
            });
          }
        } else if (ability.targetType === 'all_allies') {
          getAllBattlefieldCards(player).forEach(c => {
            c.currentDefense += ability.defenseBoost!;
          });
        }
      }
      if (ability.special === 'reflect') {
        caster.statusEffects.push({
          id: `reflect_${Date.now()}`,
          name: 'Reflect',
          type: 'special',
          turnsRemaining: 1,
          value: 0,
        });
      }
      addLog(newState, `${casterDef?.name} uses ${ability.name}.`);
      addAnimation(newState, { type: 'buff', sourceId: casterId });
      break;

    case 'healing':
      if (ability.healing && targetId) {
        const target = findCardOnBattlefield(player, targetId) || 
                       (targetId === casterId ? caster : null);
        if (target) {
          const targetDef = getCardById(target.definitionId);
          if (ability.special === 'hot') {
            target.statusEffects.push({
              id: `hot_${Date.now()}`,
              name: 'Regrowth',
              type: 'hot',
              turnsRemaining: ability.duration || 3,
              value: ability.healing,
            });
          } else {
            const maxHp = targetDef?.hp || 999;
            target.currentHp = Math.min(target.currentHp + ability.healing, maxHp);
          }
          addLog(newState, `${casterDef?.name} heals ${targetDef?.name} for ${ability.healing} HP.`);
          addAnimation(newState, { type: 'heal', sourceId: casterId, targetId, value: ability.healing });
        }
      }
      if (ability.special === 'purify' && targetId) {
        const target = findCardOnBattlefield(player, targetId);
        if (target) {
          target.statusEffects = target.statusEffects.filter(e => e.type !== 'debuff' && e.type !== 'dot');
          addLog(newState, `${casterDef?.name} purifies ${getCardById(target.definitionId)?.name}.`);
        }
      }
      break;

    case 'chaos':
      if (ability.special === 'swap_atk_def' && targetId) {
        const target = findCardOnBattlefield(opponent, targetId) || findCardOnBattlefield(player, targetId);
        if (target) {
          const temp = target.currentAttack;
          target.currentAttack = target.currentDefense;
          target.currentDefense = temp;
          addLog(newState, `${casterDef?.name} swaps ${getCardById(target.definitionId)?.name}'s Attack and Defense!`);
        }
      }
      if (ability.special === 'random_spell') {
        const allAbilities = Object.values(ABILITIES).filter(a => a.type === 'offensive');
        const randomAbility = pickRandom(newState.rng, allAbilities);
        const enemies = getAllBattlefieldCards(opponent);
        if (randomAbility && enemies.length > 0 && randomAbility.damage) {
          const target = pickRandom(newState.rng, enemies)!;
          target.currentHp -= randomAbility.damage;
          addLog(newState, `Random Spell casts ${randomAbility.name} on ${getCardById(target.definitionId)?.name}!`);
          addAnimation(newState, { type: 'spell', element: randomAbility.element, targetId: target.instanceId, value: randomAbility.damage });
          if (target.currentHp <= 0) {
            removeCardFromBattlefield(opponent, target.instanceId);
            opponent.graveyard.push(target);
          }
        }
      }
      if (ability.special === 'mirror' && targetId) {
        const target = findCardOnBattlefield(opponent, targetId);
        if (target) {
          const targetDef2 = getCardById(target.definitionId);
          if (targetDef2 && targetDef2.abilities.length > 0) {
            const copiedAbilityId = targetDef2.abilities[0];
            addLog(newState, `${casterDef?.name} copies ${getAbility(copiedAbilityId)?.name}!`);
          }
        }
      }
      if (ability.special === 'stat_flip' && targetId) {
        const target = findCardOnBattlefield(opponent, targetId);
        if (target) {
          const origAtk = target.currentAttack;
          const origDef = target.currentDefense;
          target.currentAttack = target.currentSpeed;
          target.currentDefense = origAtk;
          target.currentSpeed = origDef;
          target.statusEffects.push({
            id: `flip_${Date.now()}`,
            name: 'Stat Flip',
            type: 'debuff',
            turnsRemaining: 2,
            value: 0,
          });
        }
      }
      break;

    case 'beast':
      if (ability.special === 'beast_only') {
        getAllBattlefieldCards(player).forEach(c => {
          const cDef = getCardById(c.definitionId);
          if (cDef?.type === 'Beast') {
            c.currentAttack += ability.attackBoost || 0;
          }
        });
      } else if (ability.attackBoost && ability.targetType === 'all_allies') {
        getAllBattlefieldCards(player).forEach(c => {
          c.currentAttack += ability.attackBoost!;
        });
      }
      if (ability.defenseBoost && ability.targetType === 'all_enemies') {
        getAllBattlefieldCards(opponent).forEach(c => {
          c.currentDefense = Math.max(0, c.currentDefense + (ability.defenseBoost || 0));
        });
      }
      if (ability.special === 'summon_cub') {
        summonCub(newState, player);
      }
      addLog(newState, `${casterDef?.name} uses ${ability.name}.`);
      break;
  }
  
  return newState;
}

function summonCub(state: GameState, player: PlayerState): void {
  const emptyBeastSlot = player.battlefield.beasts.find(s => s.card === null);
  if (emptyBeastSlot) {
    const cubDef: CardDefinition = {
      id: 'b_summoned_cub',
      name: 'Wild Cub',
      cardClass: 'Beastmaster',
      elements: ['Nature'],
      type: 'Beast',
      level: 1,
      cost: 0,
      hp: 4,
      attack: 3,
      defense: 1,
      speed: 5,
      abilities: [],
      flavorText: 'Summoned from the wild.',
    };
    const cub = createCardInstance(cubDef);
    cub.canAttack = false; // summoning sickness
    emptyBeastSlot.card = cub;
    addLog(state, `A Wild Cub is summoned!`);
    addAnimation(state, { type: 'play', element: 'Nature', cardName: 'Wild Cub' });
  }
}

function processTotemEffects(state: GameState, player: PlayerState, opponent: PlayerState): void {
  const totems = player.battlefield.totems.filter(s => s.card !== null);
  
  for (const slot of totems) {
    const totem = slot.card!;
    const totemDef = getCardById(totem.definitionId);
    if (!totemDef) continue;
    
    for (const abilityId of totemDef.abilities) {
      const ability = getAbility(abilityId);
      if (!ability) continue;
      
      if (abilityId === 'storm_totem') {
        // Lightning allies gain +1 ATK (temporary)
        getAllBattlefieldCards(player).forEach(c => {
          const cDef = getCardById(c.definitionId);
          if (cDef?.elements.includes('Lightning') && c !== totem) {
            c.currentAttack += 1;
            c.statusEffects.push({
              id: `storm_temp_${Date.now()}_${c.instanceId}`,
              name: 'Storm Surge',
              type: 'buff',
              turnsRemaining: 1,
              value: 1,
              stat: 'attack',
            });
          }
        });
        addLog(state, `${totemDef.name} surges: Lightning allies gain +1 ATK.`);
      } else if (abilityId === 'forest_totem') {
        // Heal all Nature allies for 2 HP
        getAllBattlefieldCards(player).forEach(c => {
          const cDef = getCardById(c.definitionId);
          if (cDef?.elements.includes('Nature') && c !== totem) {
            c.currentHp = Math.min(c.currentHp + 2, cDef.hp);
          }
        });
        addLog(state, `${totemDef.name} pulses: Nature allies heal 2 HP.`);
      } else if (abilityId === 'shield_wall') {
        // All allies gain +1 DEF (permanent, once via status)
        getAllBattlefieldCards(player).forEach(c => {
          if (c === totem) return;
          const hasShieldBuff = c.statusEffects.some(e => e.name === 'Totem Shield Wall');
          if (!hasShieldBuff) {
            c.currentDefense += 1;
            c.statusEffects.push({
              id: `totem_shield_${Date.now()}_${c.instanceId}`,
              name: 'Totem Shield Wall',
              type: 'buff',
              turnsRemaining: -1,
              value: 1,
              stat: 'defense',
            });
          }
        });
        addLog(state, `${totemDef.name} empowers: Allies gain +1 DEF.`);
      } else if (abilityId === 'heal') {
        // Heal the most injured ally for 3 HP
        const allies = getAllBattlefieldCards(player).filter(c => c !== totem);
        if (allies.length > 0) {
          const mostInjured = allies.reduce((best, c) => {
            const cDef = getCardById(c.definitionId);
            const bDef = getCardById(best.definitionId);
            const cMissing = cDef ? cDef.hp - c.currentHp : 0;
            const bMissing = bDef ? bDef.hp - best.currentHp : 0;
            return cMissing > bMissing ? c : best;
          });
          const mDef = getCardById(mostInjured.definitionId);
          if (mDef && mostInjured.currentHp < mDef.hp) {
            mostInjured.currentHp = Math.min(mostInjured.currentHp + 3, mDef.hp);
            addLog(state, `${totemDef.name} heals ${mDef.name} for 3 HP.`);
          }
        }
      } else if (abilityId === 'fireball') {
        // Deal 2 damage to a random enemy
        const enemies = getAllBattlefieldCards(opponent);
        if (enemies.length > 0) {
          const target = pickRandom(state.rng, enemies)!;
          target.currentHp -= 2;
          const tDef = getCardById(target.definitionId);
          addLog(state, `${totemDef.name} hurls fire at ${tDef?.name} for 2 damage!`);
          if (target.currentHp <= 0) {
            removeCardFromBattlefield(opponent, target.instanceId);
            opponent.graveyard.push(target);
            addLog(state, `${tDef?.name} is destroyed!`);
          }
        }
      } else if (abilityId === 'arcane_blast') {
        // Deal 3 damage to enemy with highest ATK
        const enemies = getAllBattlefieldCards(opponent);
        if (enemies.length > 0) {
          const target = enemies.reduce((best, c) => c.currentAttack > best.currentAttack ? c : best);
          target.currentHp -= 3;
          const tDef = getCardById(target.definitionId);
          addLog(state, `${totemDef.name} blasts ${tDef?.name} for 3 damage!`);
          if (target.currentHp <= 0) {
            removeCardFromBattlefield(opponent, target.instanceId);
            opponent.graveyard.push(target);
            addLog(state, `${tDef?.name} is destroyed!`);
          }
        }
      } else if (abilityId === 'chaos_swap') {
        // Randomly swap ATK/DEF on a random enemy
        const enemies = getAllBattlefieldCards(opponent);
        if (enemies.length > 0) {
          const target = pickRandom(state.rng, enemies)!;
          const temp = target.currentAttack;
          target.currentAttack = target.currentDefense;
          target.currentDefense = temp;
          const tDef = getCardById(target.definitionId);
          addLog(state, `${totemDef.name} swaps ${tDef?.name}'s ATK and DEF!`);
        }
      } else if (abilityId === 'reflect') {
        // Give all allies Reflect for 1 turn
        getAllBattlefieldCards(player).forEach(c => {
          if (c === totem) return;
          c.statusEffects.push({
            id: `reflect_totem_${Date.now()}_${c.instanceId}`,
            name: 'Reflect',
            type: 'special',
            turnsRemaining: 1,
            value: 0,
          });
        });
        addLog(state, `${totemDef.name} grants Reflect to all allies.`);
      } else if (abilityId === 'pack_tactics') {
        // All beasts get +1 ATK (permanent, once via status)
        getAllBattlefieldCards(player).forEach(c => {
          const cDef = getCardById(c.definitionId);
          if (cDef?.type === 'Beast') {
            const hasPackBuff = c.statusEffects.some(e => e.name === 'Totem Pack Tactics');
            if (!hasPackBuff) {
              c.currentAttack += 1;
              c.statusEffects.push({
                id: `totem_pack_${Date.now()}_${c.instanceId}`,
                name: 'Totem Pack Tactics',
                type: 'buff',
                turnsRemaining: -1,
                value: 1,
                stat: 'attack',
              });
            }
          }
        });
        addLog(state, `${totemDef.name} empowers beasts: +1 ATK.`);
      } else if (abilityId === 'cleave') {
        // Deal 1 damage to all enemies
        const enemies = getAllBattlefieldCards(opponent);
        enemies.forEach(c => {
          c.currentHp -= 1;
          if (c.currentHp <= 0) {
            removeCardFromBattlefield(opponent, c.instanceId);
            opponent.graveyard.push(c);
            const cDef = getCardById(c.definitionId);
            addLog(state, `${cDef?.name} is destroyed by ${totemDef.name}!`);
          }
        });
        if (enemies.length > 0) {
          addLog(state, `${totemDef.name} cleaves all enemies for 1 damage!`);
        }
      }
    }
  }
}

export function performMulligan(state: GameState, cardIndicesToReplace: number[]): GameState {
  const newState = structuredClone(state);
  const playerIdx = newState.currentPlayer;
  const player = newState.players[playerIdx];
  
  if (newState.mulliganComplete[playerIdx]) return state;
  
  // Put selected cards back in deck
  const replacedCards: CardInstance[] = [];
  // Sort indices descending to splice correctly
  const sortedIndices = [...cardIndicesToReplace].sort((a, b) => b - a);
  for (const idx of sortedIndices) {
    if (idx >= 0 && idx < player.hand.length) {
      replacedCards.push(player.hand.splice(idx, 1)[0]);
    }
  }
  
  // Put cards back and shuffle with match RNG
  player.deck.push(...replacedCards);
  player.deck = shuffleDeck(newState, player.deck);
  
  // Draw same number
  const drawCount = replacedCards.length;
  for (let i = 0; i < drawCount; i++) {
    if (player.deck.length > 0) {
      player.hand.push(player.deck.shift()!);
    }
  }
  
  newState.mulliganComplete[playerIdx] = true;
  addLog(newState, `${player.name} mulligans ${drawCount} card${drawCount !== 1 ? 's' : ''}.`);
  
  // If both done, advance to draw phase for player 0
  if (newState.mulliganComplete[0] && newState.mulliganComplete[1]) {
    newState.phase = 'draw';
    newState.currentPlayer = 0;
  } else {
    // Switch to other player for their mulligan
    newState.currentPlayer = newState.currentPlayer === 0 ? 1 : 0;
  }
  
  return newState;
}

export function executeEndPhase(state: GameState): GameState {
  const newState = structuredClone(state);
  const player = newState.players[newState.currentPlayer];
  const opponent = newState.players[newState.currentPlayer === 0 ? 1 : 0];
  
  // Process totem effects before switching turns
  processTotemEffects(newState, player, opponent);
  
  // Process status effects
  getAllBattlefieldCards(player).forEach(card => {
    // Enable attacking for next turn
    card.canAttack = true;
    card.hasAttacked = false;
    card.turnsInPlay += 1;
    
    // Process HOTs
    const hots = card.statusEffects.filter(e => e.type === 'hot');
    for (const hot of hots) {
      const def = getCardById(card.definitionId);
      if (def) {
        card.currentHp = Math.min(card.currentHp + hot.value, def.hp);
      }
    }
    
    // Tick down durations
    card.statusEffects = card.statusEffects.filter(e => {
      if (e.turnsRemaining === -1) return true; // permanent
      e.turnsRemaining -= 1;
      if (e.turnsRemaining <= 0) {
        // Remove temporary buffs
        if (e.stat === 'defense' && e.type === 'buff') {
          card.currentDefense -= e.value;
        }
        return false;
      }
      return true;
    });
  });
  
  // State-based actions: destroy dead units, check win
  const sba = applyStateBasedActions(newState);
  for (const d of sba.deaths) {
    addLog(newState, `${d.name} is destroyed!`);
  }
  if (sba.winnerSet && newState.winner !== null) {
    addLog(newState, `${newState.players[newState.winner].name} wins the game!`);
  }
  
  // Switch player
  newState.currentPlayer = newState.currentPlayer === 0 ? 1 : 0;
  
  if (newState.currentPlayer === 0) {
    newState.turn += 1;
  }
  
  newState.phase = 'draw';
  addLog(newState, `End of ${player.name}'s turn.`);
  
  return newState;
}

export function checkGameOver(state: GameState): GameState {
  const newState = structuredClone(state);
  const sba = applyStateBasedActions(newState);
  if (sba.winnerSet && newState.winner !== null) {
    addLog(newState, `${newState.players[newState.winner].name} wins the game!`);
  }
  return newState;
}

/** Public SBA entry for post-resolution cleanup (tests + future stack). */
export function runStateBasedActions(state: GameState): GameState {
  const newState = structuredClone(state);
  applyStateBasedActions(newState);
  return newState;
}
